import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Search } from "lucide-react";
import { UserButton, SignedIn, SignedOut } from "@clerk/clerk-react";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
      {/* Blue Silhouette Blur */}
      <div
        className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] bg-blue-500 rounded-full blur-[180px] opacity-50 z-0 pointer-events-none"
        style={{ pointerEvents: 'none' }}
      />
      {/* Header */}
      <header className="fixed left-0 right-0 lg:top-5 flex justify-center z-20">
        <div className="max-w-5xl w-full bg-background/50 backdrop-blur-sm border-b border-border rounded-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-center h-16">
            {/* Logo & Nav */}
            <div className="flex items-center w-full justify-center">
              <span className="text-xl font-bold text-foreground mr-8">Watchtower</span>
              <nav className="hidden lg:flex w-full justify-center items-center space-x-8">
                <Link to="/home" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Home
                </Link>
                <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
                <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </nav>
            </div>
            {/* Right side actions */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Search */}
              <div className="hidden md:flex items-center relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-48"
                  />
                </div>
              </div>
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              {/* User Actions */}
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-lg">
                  <a href="/login">Get Started</a>
                </Button>
              </SignedOut>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-2 py-8 pt-20">
        {children}
      </main>
      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-muted-foreground/70 border-t border-border bg-background/80">
        &copy; {new Date().getFullYear()} Watchtower. All rights reserved.
      </footer>
    </div>
  );
}