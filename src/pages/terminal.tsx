import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";

export default function TerminalPage() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string>("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const WS_URL = API_BASE_URL.replace(/^http/, "ws");

  useEffect(() => {
    initTerminal();
    connectWebSocket();

    const handleRunCommand = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "input",
          data: customEvent.detail
        }));
      } else {
        alert("Koneksi terminal belum aktif!");
      }
    };

    window.addEventListener("run-terminal-command", handleRunCommand);

    return () => {
      cleanup();
      window.removeEventListener("run-terminal-command", handleRunCommand);
      delete (window as any).__TERMINAL_OUTPUT__;
    };
  }, []);

  const initTerminal = () => {
    if (!terminalRef.current || xtermRef.current) return;

    // Create terminal instance
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: "#000000",
        foreground: "#ffffff",
        cursor: "#ffffff",
        black: "#000000",
        red: "#e06c75",
        green: "#98c379",
        yellow: "#d19a66",
        blue: "#61afef",
        magenta: "#c678dd",
        cyan: "#56b6c2",
        white: "#abb2bf",
        brightBlack: "#5c6370",
        brightRed: "#e06c75",
        brightGreen: "#98c379",
        brightYellow: "#d19a66",
        brightBlue: "#61afef",
        brightMagenta: "#c678dd",
        brightCyan: "#56b6c2",
        brightWhite: "#ffffff",
      },
    });

    // Add addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    // Open terminal
    term.open(terminalRef.current);
    
    // Fit terminal to container
    setTimeout(() => {
      fitAddon.fit();
      
      // Send resize to backend
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "resize",
          rows: term.rows,
          cols: term.cols
        }));
      }
    }, 100);

    // Handle terminal input
    term.onData((data) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "input",
          data: data
        }));
      }
    });

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      
      // Send new size to backend
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "resize",
          rows: term.rows,
          cols: term.cols
        }));
      }
    });
    resizeObserver.observe(terminalRef.current);

    // Handle window resize
    const handleWindowResize = () => {
      fitAddon.fit();
      
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "resize",
          rows: term.rows,
          cols: term.cols
        }));
      }
    };
    window.addEventListener('resize', handleWindowResize);

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome message
    term.writeln("\x1b[1;32m╔════════════════════════════════════════════╗\x1b[0m");
    term.writeln("\x1b[1;32m║   Welcome to Kelompok 2 Server Terminal    ║\x1b[0m");
    term.writeln("\x1b[1;32m╚════════════════════════════════════════════╝\x1b[0m");
    term.writeln("");
    term.writeln("\x1b[33mConnecting to server...\x1b[0m");
    term.writeln("");
  };

  const connectWebSocket = () => {
    try {
      setError("");
      const ws = new WebSocket(`${WS_URL}/api/v1/terminal`);
      
      ws.onopen = () => {
        setConnected(true);
        if (xtermRef.current) {
          xtermRef.current.writeln("\x1b[32m✓ Connected to terminal server\x1b[0m");
          xtermRef.current.writeln("");
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          
          if (msg.type === "connected") {
            if (xtermRef.current) {
              xtermRef.current.writeln(`\x1b[36mSession: ${msg.session}\x1b[0m`);
              xtermRef.current.writeln("");
            }
          } else if (msg.type === "output") {
            if (xtermRef.current) {
              xtermRef.current.write(msg.data);
              // Save output globally for AI context
              const w = window as any;
              w.__TERMINAL_OUTPUT__ = (w.__TERMINAL_OUTPUT__ || "") + msg.data;
              // Limit global context size to last 2000 chars to avoid oversized tokens
              if (w.__TERMINAL_OUTPUT__.length > 2000) {
                w.__TERMINAL_OUTPUT__ = w.__TERMINAL_OUTPUT__.substring(w.__TERMINAL_OUTPUT__.length - 2000);
              }
            }
          } else if (msg.type === "error") {
            if (xtermRef.current) {
              xtermRef.current.write(`\x1b[31m${msg.data}\x1b[0m`);
            }
          }
        } catch (err) {
          console.error("Failed to parse message:", err);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("Connection error occurred");
        if (xtermRef.current) {
          xtermRef.current.writeln("\x1b[31m✗ Connection error\x1b[0m");
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (xtermRef.current) {
          xtermRef.current.writeln("");
          xtermRef.current.writeln("\x1b[33m✗ Disconnected from server\x1b[0m");
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to connect:", error);
      setError("Failed to connect to terminal server");
      if (xtermRef.current) {
        xtermRef.current.writeln("\x1b[31m✗ Failed to connect\x1b[0m");
      }
    }
  };

  const cleanup = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (xtermRef.current) {
      xtermRef.current.dispose();
      xtermRef.current = null;
    }
  };

  const handleReconnect = () => {
    cleanup();
    setError("");
    setTimeout(() => {
      initTerminal();
      connectWebSocket();
    }, 500);
  };

  const handleClear = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] font-mono">
        {/* Header */}
        <div className="flex items-end justify-between border-b border-border pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase tracking-widest mb-1">
              <span className="text-primary">●</span> TTY_SESSION_01
            </div>
            <h1 className="text-2xl font-bold tracking-tighter uppercase">Terminal</h1>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
              {connected ? "SECURE_SSH_ESTABLISHED" : "AWAITING_HANDSHAKE"} // TTY: /DEV/PTS/0
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge 
              variant="outline" 
              className={`rounded-none text-[10px] uppercase tracking-widest px-2 py-0 ${connected 
                ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/5" 
                : "text-red-500 border-red-500/30 bg-red-500/5"}`}
            >
              {connected ? "ONLINE" : "OFFLINE"}
            </Badge>
            <div className="flex items-center gap-2">
              <Button onClick={handleClear} size="sm" variant="outline" className="rounded-none uppercase text-[10px] tracking-widest h-8" disabled={!connected}>
                CLEAR_BUF
              </Button>
              <Button onClick={handleReconnect} size="icon" variant="ghost" className="h-8 w-8 border border-border rounded-none">
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 border border-red-500/30 bg-red-500/5 text-[10px] uppercase font-bold text-red-500 mb-6">
            <AlertCircle className="w-3 h-3" />
            <span>ERROR: {error}</span>
          </div>
        )}

        {/* Terminal Container */}
        <div className="flex-1 border border-border bg-[#000000] p-4 relative">
          {/* Decorative terminal elements */}
          <div className="absolute top-0 right-0 p-2 opacity-20 pointer-events-none">
            <div className="text-[8px] text-right font-mono">
              SECURE_SHELL_v2.4<br/>
              RSA_ENCRYPT_ACTIVE<br/>
              BUFFER_SIZE: 1024KB
            </div>
          </div>
          <div 
            ref={terminalRef}
            className="h-full w-full"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
