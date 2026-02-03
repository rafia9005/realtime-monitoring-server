import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
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

    return () => {
      cleanup();
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
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold tracking-tight">Terminal</h1>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={connected 
                ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10" 
                : "text-red-500 border-red-500/30 bg-red-500/10"}
            >
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              {connected ? "Connected" : "Disconnected"}
            </Badge>
            <Button onClick={handleClear} size="sm" variant="ghost" disabled={!connected}>
              Clear
            </Button>
            <Button onClick={handleReconnect} size="sm" variant="ghost">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-sm text-red-600 dark:text-red-400 mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Terminal Card - Full Height */}
        <Card className="flex-1 overflow-hidden border-border/50 flex flex-col">
          {/* XTerm Container */}
          <div 
            ref={terminalRef}
            className="flex-1 w-full"
            style={{ background: '#000000' }}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
