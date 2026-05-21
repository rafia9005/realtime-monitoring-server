import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";

export default function TerminalPage() {
  const { t } = useLanguage();
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
        alert(t('terminal.connectionInactive'));
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
    const welcomeMsg = t('terminal.welcome');
    const borderStr = "═".repeat(welcomeMsg.length + 6);
    term.writeln(`\x1b[1;32m╔${borderStr}╗\x1b[0m`);
    term.writeln(`\x1b[1;32m║   ${welcomeMsg}   ║\x1b[0m`);
    term.writeln(`\x1b[1;32m╚${borderStr}╝\x1b[0m`);
    term.writeln("");
    term.writeln(`\x1b[33m${t('terminal.connecting')}\x1b[0m`);
    term.writeln("");
  };

  const connectWebSocket = () => {
    try {
      setError("");
      const ws = new WebSocket(`${WS_URL}/api/v1/terminal`);
      
      ws.onopen = () => {
        setConnected(true);
        if (xtermRef.current) {
          xtermRef.current.writeln(`\x1b[32m${t('terminal.connected')}\x1b[0m`);
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
        setError(t('terminal.connectionError'));
        if (xtermRef.current) {
          xtermRef.current.writeln(`\x1b[31m${t('terminal.connectionError')}\x1b[0m`);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (xtermRef.current) {
          xtermRef.current.writeln("");
          xtermRef.current.writeln(`\x1b[33m${t('terminal.disconnected')}\x1b[0m`);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to connect:", error);
      setError(t('terminal.failedToConnect'));
      if (xtermRef.current) {
        xtermRef.current.writeln(`\x1b[31m${t('terminal.failedToConnect')}\x1b[0m`);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col h-[calc(100vh-6rem)] font-mono space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-foreground/5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase tracking-widest mb-1 font-black italic">
              <span className="text-primary">●</span> TTY_SESSION_01
            </div>
            <h1 className="text-6xl font-black tracking-tight uppercase leading-none">
              {t('terminal.title')}
            </h1>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-bold italic">
              {connected ? t('terminal.secureSsh') : t('terminal.awaitingHandshake')} // TTY: /DEV/PTS/0
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-full backdrop-blur-3xl flex items-center gap-2 h-14 border ${connected 
              ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10" 
              : "text-red-500 border-red-500/20 bg-red-500/10"}`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              {connected ? t('terminal.online') : t('terminal.offline')}
            </span>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleClear} 
                variant="outline" 
                className="h-14 px-6 rounded-2xl border-foreground/10 bg-background/50 hover:bg-foreground/5 text-xs font-black uppercase tracking-widest transition-all"
                disabled={!connected}
              >
                {t('terminal.clearBuf')}
              </Button>
              <Button 
                onClick={handleReconnect} 
                variant="outline" 
                className="h-14 w-14 rounded-2xl border-foreground/10 bg-background/50 backdrop-blur-3xl hover:bg-foreground/5 transition-all active:scale-95 flex items-center justify-center"
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-6 border border-red-500/20 bg-red-500/10 rounded-2xl text-[10px] uppercase font-black text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span>{t('terminal.errorPrefix')} {error}</span>
          </div>
        )}

        {/* Terminal Container */}
        <div className="accent-card accent-card-emerald flex-1 bg-black border border-foreground/10 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
          {/* Decorative terminal elements */}
          <div className="absolute top-6 right-8 opacity-20 pointer-events-none z-10">
            <div className="text-[8px] text-right font-mono tracking-wider leading-relaxed">
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
