import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X } from "lucide-react";
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
    { name: "Home", href: "/home" },
    { name: "Dashboard", href: "/dashboard", protected: true },
    { name: "Agents", href: "/agents", protected: true },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans selection:bg-primary/20">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -left-[10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? "bg-background/80 backdrop-blur-md border-b border-border py-3"
            : "bg-transparent py-5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/home" className="flex items-center gap-2 group">
              <div className="w-10 md:w-12">
                <img src="/img/amazetwoLight.png" alt="AmazeTwo" sizes="0.5" className="block dark:hidden" />
                <img src="/img/amazetwoDark.png" alt="AmazeTwo" sizes="0.5" className="hidden dark:block" />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative group ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
                    )}
                    {!isActive && (
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-full"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              <div className="hidden sm:flex items-center gap-2">
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                  <Button asChild size="sm" variant="ghost" className="font-medium hidden md:flex">
                    <a href="/login">Sign In</a>
                  </Button>
                  <Button asChild size="sm" className="font-medium px-4">
                    <a href="/login">Get Started</a>
                  </Button>
                </SignedOut>
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden w-9 h-9"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border transition-all duration-300 ease-in-out ${isMenuOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-4 invisible"
            }`}
        >
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`block text-lg font-medium ${location.pathname === link.href ? "text-primary" : "text-foreground"
                  }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-border flex flex-col gap-3">
              <SignedIn>
                <div className="flex items-center gap-3">
                  <UserButton afterSignOutUrl="/" />
                  <span className="text-sm font-medium">Account Settings</span>
                </div>
              </SignedIn>
              <SignedOut>
                <Button asChild variant="outline" className="w-full justify-center">
                  <a href="/login">Sign In</a>
                </Button>
                <Button asChild className="w-full justify-center">
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
      <footer className="bg-muted/30 border-t border-border relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <Link to="/home" className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 flex items-center justify-center rounded-sm">
                  <img src="/img/amazetwoLight.png" alt="AmazeTwo" sizes="0.5" className="block dark:hidden" />
                  <img src="/img/amazetwoDark.png" alt="AmazeTwo" sizes="0.5" className="hidden dark:block" />
                </div>
                <span className="text-lg font-mono font-bold tracking-tighter">WATCHTOWER</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Next-generation server monitoring and performance analysis platform.
                Built for modern infrastructure teams.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                <li><Link to="/monitoring" className="hover:text-primary transition-colors">Monitoring</Link></li>
                <li><Link to="/agents" className="hover:text-primary transition-colors">Agents</Link></li>
                <li><Link to="/terminal" className="hover:text-primary transition-colors">Terminal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Watchtower. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="font-mono">STATUS: SYSTEM_OPTIMAL</span>
              <span className="font-mono">V4.0.2</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
