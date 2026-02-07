import type { ReactNode } from "react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { UserButton, SignedIn, SignedOut } from "@clerk/clerk-react";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="w-full h-14 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-primary">ServerMon</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          {/* User Account/Avatar or Login Button */}
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Button asChild variant="outline" className="rounded-xl font-medium px-4 py-2">
              <a href="/login">Login</a>
            </Button>
          </SignedOut>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-2 py-8">
        {children}
      </main>
      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-muted-foreground/70 border-t border-border bg-background/80">
        &copy; {new Date().getFullYear()} ServerMon. All rights reserved.
      </footer>
    </div>
  );
}