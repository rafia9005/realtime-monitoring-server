import { UserButton, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { 
  Home, 
  Activity, 
  Menu,
  X,
  Moon,
  Sun,
  Server,
  Terminal,
  Boxes
} from "lucide-react";
import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useUser();
  const { setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Activity, label: "Monitoring", href: "/monitoring" },
    { icon: Server, label: "Server", href: "/server" },
    { icon: Terminal, label: "Terminal", href: "/terminal" },
    { icon: Boxes, label: "Agents", href: "/agents" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border font-mono
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-border">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <img src="/img/amazetwoLight.png" alt="AmazeTwo" sizes="0.5" className="block dark:hidden" />
                <img src="/img/amazetwoDark.png" alt="AmazeTwo" sizes="0.5" className="hidden dark:block" />
              </div>
              <span className="font-bold tracking-tighter">WATCHTOWER_v1</span>
            </Link>
            <button 
              className="lg:hidden p-1.5 hover:bg-accent rounded-none transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 text-xs transition-colors group
                    ${isActive 
                      ? 'bg-primary text-primary-foreground font-bold' 
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }
                  `}
                >
                  <span className={isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}>[</span>
                  <item.icon className="w-4 h-4" />
                  <span className="uppercase tracking-widest">{item.label}</span>
                  <span className="ml-auto"></span>
                  <span className={isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}>]</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 border border-border flex items-center justify-center text-[10px]">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase truncate">
                  {user?.fullName || "SYSTEM_ROOT"}
                </p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[8px] text-muted-foreground uppercase">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64 font-mono">
        {/* Header */}
        <header className="sticky top-0 z-30 h-14 bg-background border-b border-border">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-1.5 hover:bg-accent transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-muted-foreground text-xs">/</span>
                <h1 className="text-xs font-bold uppercase tracking-widest">
                  {menuItems.find(item => item.href === location.pathname)?.label || "Dashboard"}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mr-4 hidden md:flex">
                <span className="opacity-50">SYS_TIME:</span>
                <span>{new Date().toLocaleTimeString([], { hour12: false })}</span>
              </div>
              
              {/* Theme Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border border-transparent hover:border-border">
                    <Sun className="h-3 w-3 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-3 w-3 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="font-mono text-xs rounded-none border-border">
                  <DropdownMenuItem onClick={() => setTheme("light")} className="rounded-none">
                    LIGHT_MODE
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")} className="rounded-none">
                    DARK_MODE
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")} className="rounded-none">
                    SYSTEM_DEFAULT
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-none border border-border"
                  }
                }}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}