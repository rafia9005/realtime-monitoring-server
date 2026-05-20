import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X, Rocket, LayoutDashboard, Boxes, Contact, Info } from "lucide-react";
import { UserButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: "Home", href: "/home", icon: Rocket },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, protected: true },
    { name: "Agents", href: "/agents", icon: Boxes, protected: true },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Contact },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans selection:bg-primary/20 text-foreground">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary),0.03)_0%,transparent_50%)]" />
        <div className="absolute top-[10%] right-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] left-[5%] w-[30%] h-[30%] bg-secondary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary),0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary),0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
            ? "bg-background/60 backdrop-blur-xl border-b border-border py-2"
            : "bg-transparent py-6"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/home" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                <div className="w-6 md:w-8">
                  <img src="/img/amazetwoLight.png" alt="AmazeTwo" className="block dark:hidden" />
                  <img src="/img/amazetwoDark.png" alt="AmazeTwo" className="hidden dark:block" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
                WATCHTOWER
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center bg-muted/50 backdrop-blur-md rounded-full px-2 py-1.5 border border-border/50">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`px-5 py-2 text-sm font-medium transition-all rounded-full relative ${isActive ? "text-primary bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                       <link.icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground/50'}`} />
                       {link.name}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-xl hover:bg-muted"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              <div className="flex items-center gap-3">
                <SignedIn>
                  <div className="flex items-center gap-3 pl-2 border-l border-border">
                    <UserButton 
                      afterSignOutUrl="/" 
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10 rounded-xl"
                        }
                      }}
                    />
                  </div>
                </SignedIn>
                <SignedOut>
                  <Button asChild variant="ghost" className="rounded-xl font-medium hidden md:flex">
                    <a href="/login">Log In</a>
                  </Button>
                  <Button asChild className="rounded-xl font-bold px-6 bg-foreground text-background hover:bg-foreground/90 shadow-xl shadow-foreground/10">
                    <a href="/login">Get Started</a>
                  </Button>
                </SignedOut>
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden w-10 h-10 rounded-xl"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-2xl border-b border-border transition-all duration-500 ease-in-out ${isMenuOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-8 invisible"
            }`}
        >
          <div className="px-6 py-8 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-lg font-medium transition-colors ${location.pathname === link.href ? "bg-muted text-primary" : "text-foreground/70 hover:bg-muted/50"
                  }`}
              >
                <link.icon className="w-5 h-5" />
                {link.name}
              </Link>
            ))}
            <div className="pt-6 mt-4 border-t border-border flex flex-col gap-4">
              <SignedIn>
                <div className="flex items-center gap-4 px-4">
                  <UserButton afterSignOutUrl="/" />
                  <span className="text-lg font-medium">Account Settings</span>
                </div>
              </SignedIn>
              <SignedOut>
                <Button asChild variant="outline" className="w-full h-12 rounded-2xl">
                  <a href="/login">Log In</a>
                </Button>
                <Button asChild className="w-full h-12 rounded-2xl bg-foreground text-background">
                  <a href="/login">Get Started</a>
                </Button>
              </SignedOut>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 pt-24 pb-12 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
            <div className="md:col-span-5">
              <Link to="/home" className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <img src="/img/amazetwoLight.png" alt="AmazeTwo" className="block dark:hidden" />
                    <img src="/img/amazetwoDark.png" alt="AmazeTwo" className="hidden dark:block" />
                </div>
                <span className="text-xl font-bold tracking-tighter">WATCHTOWER</span>
              </Link>
              <p className="text-muted-foreground leading-relaxed max-w-sm mb-8">
                Designed for speed, built for reliability. Monitoring infrastructure has never felt this effortless. Experience the zen of system health.
              </p>
              <div className="flex gap-4">
                 {/* Social links placeholder */}
              </div>
            </div>
            
            <div className="md:col-span-2 md:col-start-7">
              <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/40 mb-6">Platform</h4>
              <ul className="space-y-4 text-muted-foreground font-medium">
                <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                <li><Link to="/monitoring" className="hover:text-primary transition-colors">Live View</Link></li>
                <li><Link to="/agents" className="hover:text-primary transition-colors">Agents List</Link></li>
                <li><Link to="/terminal" className="hover:text-primary transition-colors">Remote Shell</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/40 mb-6">Company</h4>
              <ul className="space-y-4 text-muted-foreground font-medium">
                <li><Link to="/about" className="hover:text-primary transition-colors">Our Vision</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Support</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/40 mb-6">Legal</h4>
              <ul className="space-y-4 text-muted-foreground font-medium">
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">License</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} WATCHTOWER INDUSTRIES. PROUDLY DEPLOYED GLOBALLY.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-xs font-mono font-bold">ALL SYSTEMS OPERATIONAL</span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">BUILD v4.2.0-STABLE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
