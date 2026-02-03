package handler

import (
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"sync"
	"time"

	"github.com/creack/pty"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v5"
)

type TerminalHandler struct {
	sessions map[string]*TerminalSession
	mu       sync.RWMutex
}

type TerminalSession struct {
	ID      string
	cmd     *exec.Cmd
	ptmx    *os.File
	mu      sync.Mutex
	lastUse time.Time
}

type TerminalMessage struct {
	Type    string `json:"type"`    // "input", "resize", "ping"
	Data    string `json:"data"`    // command input
	Rows    uint16 `json:"rows"`    // terminal rows
	Cols    uint16 `json:"cols"`    // terminal cols
	Session string `json:"session"` // session ID
}

type TerminalResponse struct {
	Type    string `json:"type"`    // "output", "error", "connected", "pong"
	Data    string `json:"data"`    // output data
	Session string `json:"session"` // session ID
}

func NewTerminalHandler() *TerminalHandler {
	handler := &TerminalHandler{
		sessions: make(map[string]*TerminalSession),
	}

	// Cleanup old sessions every 5 minutes
	go handler.cleanupSessions()

	return handler
}

func (h *TerminalHandler) cleanupSessions() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		h.mu.Lock()
		now := time.Now()
		for id, session := range h.sessions {
			if now.Sub(session.lastUse) > 30*time.Minute {
				session.cleanup()
				delete(h.sessions, id)
				log.Printf("Cleaned up inactive session: %s", id)
			}
		}
		h.mu.Unlock()
	}
}

func (h *TerminalHandler) HandleTerminal(c *echo.Context) error {
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true // Allow all origins for now
		},
	}

	ws, err := upgrader.Upgrade((*c).Response(), (*c).Request(), nil)
	if err != nil {
		return err
	}
	defer ws.Close()

	sessionID := generateSessionID()

	// Create session
	session, err := h.createSession(sessionID, ws)
	if err != nil {
		log.Printf("Error creating session: %v", err)
		ws.WriteJSON(TerminalResponse{
			Type:    "error",
			Data:    "Failed to create terminal session",
			Session: sessionID,
		})
		return err
	}

	// Send connected message
	connectMsg := TerminalResponse{
		Type:    "connected",
		Data:    "Terminal connected",
		Session: sessionID,
	}
	if err := ws.WriteJSON(connectMsg); err != nil {
		return err
	}

	// Handle incoming messages
	go func() {
		for {
			var msg TerminalMessage
			err := ws.ReadJSON(&msg)
			if err != nil {
				log.Printf("WebSocket read error: %v", err)
				h.closeSession(sessionID)
				return
			}

			switch msg.Type {
			case "input":
				if err := h.handleInput(sessionID, msg.Data); err != nil {
					log.Printf("Error handling input: %v", err)
				}
			case "resize":
				if msg.Rows > 0 && msg.Cols > 0 {
					h.handleResize(sessionID, msg.Rows, msg.Cols)
				}
			case "ping":
				ws.WriteJSON(TerminalResponse{
					Type:    "pong",
					Session: sessionID,
				})
			case "close":
				h.closeSession(sessionID)
				return
			}
		}
	}()

	// Wait for session to end
	if session.cmd != nil && session.cmd.Process != nil {
		session.cmd.Wait()
	}

	return nil
}

func (h *TerminalHandler) handleInput(sessionID, input string) error {
	h.mu.RLock()
	session, exists := h.sessions[sessionID]
	h.mu.RUnlock()

	if !exists || session.ptmx == nil {
		return nil
	}

	session.mu.Lock()
	session.lastUse = time.Now()
	session.mu.Unlock()

	// Write input to PTY
	_, err := session.ptmx.Write([]byte(input))
	return err
}

func (h *TerminalHandler) handleResize(sessionID string, rows, cols uint16) error {
	h.mu.RLock()
	session, exists := h.sessions[sessionID]
	h.mu.RUnlock()

	if !exists || session.ptmx == nil {
		return nil
	}

	// Set PTY size
	return pty.Setsize(session.ptmx, &pty.Winsize{
		Rows: rows,
		Cols: cols,
	})
}

func (h *TerminalHandler) createSession(sessionID string, ws *websocket.Conn) (*TerminalSession, error) {
	// Determine shell
	shell := os.Getenv("SHELL")
	if shell == "" {
		shell = "/bin/bash"
	}

	// Create command
	cmd := exec.Command(shell)
	cmd.Env = append(os.Environ(), "TERM=xterm-256color")

	// Start the command with a PTY
	ptmx, err := pty.Start(cmd)
	if err != nil {
		return nil, err
	}

	session := &TerminalSession{
		ID:      sessionID,
		cmd:     cmd,
		ptmx:    ptmx,
		lastUse: time.Now(),
	}

	h.mu.Lock()
	h.sessions[sessionID] = session
	h.mu.Unlock()

	// Stream output from PTY to WebSocket
	go func() {
		buf := make([]byte, 1024)
		for {
			n, err := ptmx.Read(buf)
			if err != nil {
				if err != io.EOF {
					log.Printf("Error reading from PTY: %v", err)
				}
				h.closeSession(sessionID)
				break
			}
			if n > 0 {
				response := TerminalResponse{
					Type:    "output",
					Data:    string(buf[:n]),
					Session: sessionID,
				}
				if err := ws.WriteJSON(response); err != nil {
					log.Printf("Error writing output: %v", err)
					break
				}
			}
		}
	}()

	return session, nil
}

func (h *TerminalHandler) closeSession(sessionID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if session, exists := h.sessions[sessionID]; exists {
		session.cleanup()
		delete(h.sessions, sessionID)
		log.Printf("Closed session: %s", sessionID)
	}
}

func (s *TerminalSession) cleanup() {
	if s.ptmx != nil {
		s.ptmx.Close()
	}
	if s.cmd != nil && s.cmd.Process != nil {
		s.cmd.Process.Kill()
		s.cmd.Wait()
	}
}

func generateSessionID() string {
	return time.Now().Format("20060102150405") + "-" + randomString(8)
}

func randomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
		time.Sleep(time.Nanosecond)
	}
	return string(b)
}
