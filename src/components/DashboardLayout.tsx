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
  Boxes,
  Thermometer
} from "lucide-react";
import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useLanguage } from "@/lib/LanguageContext";
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
  const { language } = useLanguage();

  const menuItems = [
    { icon: Home, label: language === 'id' ? "Dasbor" : "Dashboard", href: "/dashboard" },
    { icon: Activity, label: language === 'id' ? "Pemantauan" : "Monitoring", href: "/monitoring" },
    { icon: Server, label: language === 'id' ? "Server" : "Server", href: "/server" },
    { icon: Thermometer, label: language === 'id' ? "Sensor MCU" : "MCU Sensors", href: "/mcu-sensors" },
    { icon: Terminal, label: language === 'id' ? "Terminal" : "Terminal", href: "/terminal" },
    { icon: Boxes, label: language === 'id' ? "Agen" : "Agents", href: "/agents" },
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
        fixed top-0 left-0 z-50 h-full w-64 bg-background/80 backdrop-blur-3xl border-r border-foreground/5 font-mono
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-foreground/5">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <img src="/img/amazetwoLight.png" alt="AmazeTwo" sizes="0.5" className="block dark:hidden" />
                <img src="/img/amazetwoDark.png" alt="AmazeTwo" sizes="0.5" className="hidden dark:block" />
              </div>
              <span className="font-black tracking-[-0.05em] uppercase text-sm">WATCHTOWER_v1</span>
            </Link>
            <button 
              className="lg:hidden p-1.5 hover:bg-foreground/5 rounded-xl transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 text-xs transition-all rounded-xl group uppercase tracking-widest font-black italic
                    ${isActive 
                      ? 'bg-foreground text-background shadow-xl shadow-foreground/5' 
                      : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-foreground/5">
            <div className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 bg-card/60 rounded-xl flex items-center justify-center border border-foreground/5 text-xs font-black shadow-inner">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase truncate italic">
                  {user?.fullName || "SYSTEM_ROOT"}
                </p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[8px] text-muted-foreground uppercase font-black">{language === 'id' ? 'Aktif' : 'Online'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64 font-mono">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-3xl border-b border-foreground/5">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-1.5 hover:bg-foreground/5 rounded-xl transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full" />
                <h1 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 italic">
                  {menuItems.find(item => item.href === location.pathname)?.label || (language === 'id' ? "Dasbor" : "Dashboard")}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mr-4 hidden md:flex italic">
                <span className="opacity-40">{language === 'id' ? 'WAKTU_SISTEM:' : 'SYS_TIME:'}</span>
                <span>{new Date().toLocaleTimeString([], { hour12: false })}</span>
              </div>
              
              {/* Theme Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl border border-foreground/10 bg-background/50 hover:bg-foreground/5 backdrop-blur-3xl transition-all active:scale-95 flex items-center justify-center">
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="font-mono text-xs rounded-2xl border-foreground/10 bg-background/80 backdrop-blur-3xl p-2 min-w-[150px]">
                  <DropdownMenuItem onClick={() => setTheme("light")} className="rounded-xl focus:bg-foreground/5 focus:text-foreground cursor-pointer uppercase font-black text-[10px] tracking-wider py-2">
                    {language === 'id' ? 'MODE_TERANG' : 'LIGHT_MODE'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")} className="rounded-xl focus:bg-foreground/5 focus:text-foreground cursor-pointer uppercase font-black text-[10px] tracking-wider py-2">
                    {language === 'id' ? 'MODE_GELAP' : 'DARK_MODE'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")} className="rounded-xl focus:bg-foreground/5 focus:text-foreground cursor-pointer uppercase font-black text-[10px] tracking-wider py-2">
                    {language === 'id' ? 'STANDAR_SISTEM' : 'SYSTEM_DEFAULT'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-xl border border-foreground/10 bg-background/50 backdrop-blur-3xl shadow-inner"
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