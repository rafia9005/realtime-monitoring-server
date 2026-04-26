package service

import (
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/rafia9005/realtime-monitoring-server/internal/domain"
)

// NotificationType defines the type of notification
type NotificationType string

const (
	NotificationTypeTemperature  NotificationType = "temperature"
	NotificationTypeAgentAdded   NotificationType = "agent_added"
	NotificationTypeAgentOffline NotificationType = "agent_offline"
	NotificationTypeAgentOnline  NotificationType = "agent_online"
	NotificationTypeHighCPU      NotificationType = "high_cpu"
	NotificationTypeHighMemory   NotificationType = "high_memory"
	NotificationTypeHighDisk     NotificationType = "high_disk"
)

// Notification represents a system notification
type Notification struct {
	Type      NotificationType `json:"type"`
	Title     string           `json:"title"`
	Message   string           `json:"message"`
	Severity  string           `json:"severity"` // info, warning, error, critical
	Timestamp time.Time        `json:"timestamp"`
	Data      interface{}      `json:"data,omitempty"`
}

// NotificationManager manages all notifications and sends them to Telegram
type NotificationManager struct {
	telegramNotifier *TelegramNotifier
	subscribers      map[string][]chan *Notification
	subscribersMu    sync.RWMutex
	mu               sync.Mutex
}

// NewNotificationManager creates a new notification manager
func NewNotificationManager(telegramNotifier *TelegramNotifier) *NotificationManager {
	return &NotificationManager{
		telegramNotifier: telegramNotifier,
		subscribers:      make(map[string][]chan *Notification),
	}
}

// Subscribe subscribes to specific notification types
func (nm *NotificationManager) Subscribe(notificationType string) chan *Notification {
	nm.subscribersMu.Lock()
	defer nm.subscribersMu.Unlock()

	ch := make(chan *Notification, 10)
	nm.subscribers[notificationType] = append(nm.subscribers[notificationType], ch)
	return ch
}

// Unsubscribe unsubscribes from notifications
func (nm *NotificationManager) Unsubscribe(notificationType string, ch chan *Notification) {
	nm.subscribersMu.Lock()
	defer nm.subscribersMu.Unlock()

	if subs, ok := nm.subscribers[notificationType]; ok {
		for i, subscriber := range subs {
			if subscriber == ch {
				nm.subscribers[notificationType] = append(subs[:i], subs[i+1:]...)
				close(ch)
				break
			}
		}
	}
}

// publish sends a notification to all subscribers
func (nm *NotificationManager) publish(notification *Notification) {
	nm.subscribersMu.RLock()
	subscribers := nm.subscribers[string(notification.Type)]
	nm.subscribersMu.RUnlock()

	for _, ch := range subscribers {
		select {
		case ch <- notification:
		case <-time.After(100 * time.Millisecond):
			// Subscriber not responding, skip
		}
	}
}

// NotifyTemperature sends temperature notification
func (nm *NotificationManager) NotifyTemperature(agentName string, currentTemp float64, threshold float64) {
	notification := &Notification{
		Type:      NotificationTypeTemperature,
		Title:     fmt.Sprintf("🌡️ High Temperature - %s", agentName),
		Message:   fmt.Sprintf("Temperature: %.2f°C (Threshold: %.2f°C)", currentTemp, threshold),
		Severity:  "warning",
		Timestamp: time.Now(),
		Data: map[string]interface{}{
			"agent_name":  agentName,
			"temperature": currentTemp,
			"threshold":   threshold,
		},
	}

	nm.publish(notification)

	// Send to Telegram
	if nm.telegramNotifier != nil {
		message := fmt.Sprintf(
			"<b>🌡️ High Temperature Alert - %s</b>\n"+
				"<code>%s</code>\n\n"+
				"<b>Current:</b> <code>%.2f°C</code>\n"+
				"<b>Threshold:</b> <code>%.2f°C</code>",
			agentName,
			time.Now().Format("2006-01-02 15:04:05"),
			currentTemp,
			threshold,
		)
		if err := nm.telegramNotifier.SendMessage(message); err != nil {
			log.Printf("Failed to send temperature notification to Telegram: %v", err)
		}
	}
}

// NotifyAgentAdded sends notification when agent is added
func (nm *NotificationManager) NotifyAgentAdded(agent *domain.Agent) {
	notification := &Notification{
		Type:      NotificationTypeAgentAdded,
		Title:     fmt.Sprintf("✅ New Agent Added - %s", agent.Name),
		Message:   fmt.Sprintf("Host: %s, IP: %s, Version: %s", agent.Host, agent.IPAddress, agent.Version),
		Severity:  "info",
		Timestamp: time.Now(),
		Data:      agent,
	}

	nm.publish(notification)

	// Send to Telegram
	if nm.telegramNotifier != nil {
		message := fmt.Sprintf(
			"<b>✅ New Agent Registered</b>\n"+
				"<code>%s</code>\n\n"+
				"<b>Name:</b> %s\n"+
				"<b>Host:</b> <code>%s</code>\n"+
				"<b>Hostname:</b> %s\n"+
				"<b>IP Address:</b> <code>%s</code>\n"+
				"<b>Version:</b> <code>%s</code>\n"+
				"<b>Status:</b> <code>%s</code>",
			time.Now().Format("2006-01-02 15:04:05"),
			agent.Name,
			agent.Host,
			agent.Hostname,
			agent.IPAddress,
			agent.Version,
			agent.Status,
		)
		if err := nm.telegramNotifier.SendMessage(message); err != nil {
			log.Printf("Failed to send agent registration notification to Telegram: %v", err)
		}
	}
}

// NotifyAgentOffline sends notification when agent goes offline
func (nm *NotificationManager) NotifyAgentOffline(agent *domain.Agent) {
	notification := &Notification{
		Type:      NotificationTypeAgentOffline,
		Title:     fmt.Sprintf("🔴 Agent Offline - %s", agent.Name),
		Message:   fmt.Sprintf("Host: %s (Last seen: %s)", agent.Host, agent.LastSeen.Format("2006-01-02 15:04:05")),
		Severity:  "error",
		Timestamp: time.Now(),
		Data:      agent,
	}

	nm.publish(notification)

	// Send to Telegram
	if nm.telegramNotifier != nil {
		message := fmt.Sprintf(
			"<b>🔴 Agent Offline</b>\n"+
				"<code>%s</code>\n\n"+
				"<b>Agent Name:</b> %s\n"+
				"<b>Host:</b> <code>%s</code>\n"+
				"<b>Hostname:</b> %s\n"+
				"<b>IP Address:</b> <code>%s</code>\n"+
				"<b>Last Seen:</b> <code>%s</code>",
			time.Now().Format("2006-01-02 15:04:05"),
			agent.Name,
			agent.Host,
			agent.Hostname,
			agent.IPAddress,
			agent.LastSeen.Format("2006-01-02 15:04:05"),
		)
		if err := nm.telegramNotifier.SendMessage(message); err != nil {
			log.Printf("Failed to send agent offline notification to Telegram: %v", err)
		}
	}
}

// NotifyAgentOnline sends notification when agent comes back online
func (nm *NotificationManager) NotifyAgentOnline(agent *domain.Agent) {
	notification := &Notification{
		Type:      NotificationTypeAgentOnline,
		Title:     fmt.Sprintf("🟢 Agent Online - %s", agent.Name),
		Message:   fmt.Sprintf("Host: %s is now online", agent.Host),
		Severity:  "info",
		Timestamp: time.Now(),
		Data:      agent,
	}

	nm.publish(notification)

	// Send to Telegram
	if nm.telegramNotifier != nil {
		message := fmt.Sprintf(
			"<b>🟢 Agent Back Online</b>\n"+
				"<code>%s</code>\n\n"+
				"<b>Agent Name:</b> %s\n"+
				"<b>Host:</b> <code>%s</code>\n"+
				"<b>Hostname:</b> %s\n"+
				"<b>IP Address:</b> <code>%s</code>",
			time.Now().Format("2006-01-02 15:04:05"),
			agent.Name,
			agent.Host,
			agent.Hostname,
			agent.IPAddress,
		)
		if err := nm.telegramNotifier.SendMessage(message); err != nil {
			log.Printf("Failed to send agent online notification to Telegram: %v", err)
		}
	}
}

// NotifyAgentError sends notification when agent error occurs
func (nm *NotificationManager) NotifyAgentError(agentName string, errorMessage string) {
	notification := &Notification{
		Type:      NotificationTypeAgentOffline,
		Title:     fmt.Sprintf("⚠️ Agent Error - %s", agentName),
		Message:   errorMessage,
		Severity:  "error",
		Timestamp: time.Now(),
		Data: map[string]interface{}{
			"agent_name": agentName,
			"error":      errorMessage,
		},
	}

	nm.publish(notification)

	// Send to Telegram
	if nm.telegramNotifier != nil {
		message := fmt.Sprintf(
			"<b>⚠️ Agent Error</b>\n"+
				"<code>%s</code>\n\n"+
				"<b>Agent:</b> %s\n"+
				"<b>Error:</b> <code>%s</code>",
			time.Now().Format("2006-01-02 15:04:05"),
			agentName,
			errorMessage,
		)
		if err := nm.telegramNotifier.SendMessage(message); err != nil {
			log.Printf("Failed to send agent error notification to Telegram: %v", err)
		}
	}
}
