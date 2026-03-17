import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, TerminalSquare, Copy } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || "");
  const lang = match && match[1] ? match[1] : "";
  const codeString = String(children).replace(/\n$/, "");

  const emitToTerminal = () => {
    // Memastikan user di navigasi ke halaman terminal dan mengirim command
    if (window.location.pathname !== "/terminal") {
      alert("Harap buka halaman Terminal di sidebar untuk mengeksekusi perintah langsung.");
      return;
    }
    const event = new CustomEvent("run-terminal-command", { detail: codeString + "\r" });
    window.dispatchEvent(event);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeString);
  };

  if (!inline && match) {
    return (
      <div className="relative group rounded-md overflow-hidden my-2 border border-border">
        <div className="flex justify-between items-center bg-muted/80 px-3 py-1.5 text-xs text-muted-foreground">
          <span>{lang}</span>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="hover:text-foreground transition-colors flex items-center gap-1"
              title="Copy code"
            >
              <Copy className="w-3 h-3" />
            </button>
            {(lang === "bash" || lang === "sh" || lang === "shell") && (
              <button
                onClick={emitToTerminal}
                className="hover:text-primary transition-colors flex items-center gap-1"
                title="Run in Terminal"
              >
                <TerminalSquare className="w-3 h-3" /> Run
              </button>
            )}
          </div>
        </div>
        <pre className="p-3 bg-secondary/50 overflow-x-auto text-[13px] leading-relaxed m-0" {...props}>
          <code className={className}>{children}</code>
        </pre>
      </div>
    );
  }
  return <code className={`${className} bg-muted px-1.5 py-0.5 rounded-md text-[13px]`} {...props}>{children}</code>;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      text: "Halo! Saya asisten AI bertenaga Gemini 2.5 Flash. Ada yang bisa saya bantu hari ini?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const currentPath = window.location.pathname;
      const termContext = window as any;

      const systemInstruction = `Anda adalah asisten AI terintegrasi dengan nama "Watchtower AI" di aplikasi web realtime monitoring server. 
Saat ini pengguna sedang membuka halaman route: ${currentPath}. 
- Berikan bantuan relevan sesuai halaman tempat pengguna berada. Contoh: di /dashboard bahas ringkasan statistik, di /server bahas metrik server, di /agents bahas daftar agen, dll.
- Jika di /terminal atau diminta command, WAJIB gunakan format \`bash\` Markdown block. ADA fitur yang bisa mengeksekusi langsung blok bash pengguna! (Tombol "Run" akan muncul).
- Output terminal saat ini: ${termContext.__TERMINAL_OUTPUT__ ? `\n"""\n${termContext.__TERMINAL_OUTPUT__}\n"""\nGunakan log ini untuk membantu men-debug.` : "Tidak ada output."}
Bahasakan dengan natural, profesional dan santai.`;

      // Setup model gemini-2.5-flash with systemInstruction
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction
      });

      // Transform history for the chat
      const history = messages
        .filter((m) => m.id !== "welcome") // Exclude initial welcome
        .map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(userMsg.text);
      const response = await result.response;
      
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "-ai", role: "model", text: response.text() },
      ]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-err",
          role: "model",
          text: "Maaf, terjadi kesalahan saat menghubungi AI. Coba lagi nanti.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div className="flex flex-col">
                <span className="font-semibold text-sm leading-tight">Asisten AI</span>
                <span className="text-[10px] opacity-80">Gemini 2.5 Flash</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-primary-foreground/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-muted/20 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-blue-500 text-white" : "bg-card border shadow-sm text-foreground"
                  }`}
                >
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed break-words shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white rounded-tr-sm"
                      : "bg-card border-border border text-card-foreground rounded-tl-sm"
                  }`}
                >
                  {msg.role === "model" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:p-0 prose-pre:bg-transparent">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{ code: CodeBlock as any }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%] mr-auto">
                <div className="w-8 h-8 rounded-full bg-card border shadow-sm text-foreground flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-card border-border border text-card-foreground rounded-tl-sm flex items-center shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-background border-t border-border flex gap-2 items-end"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Tanya sesuatu..."
              className="flex-1 max-h-32 min-h-[44px] bg-muted/50 resize-none rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 p-2.5 text-sm"
              rows={1}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-[44px] w-[44px] shrink-0 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
      >
        {isOpen ? (
          <X className="w-6 h-6 animate-in spin-in-90 duration-200" />
        ) : (
          <MessageCircle className="w-6 h-6 animate-in zoom-in duration-200" />
        )}
      </button>
    </div>
  );
}
