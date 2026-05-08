import { SignIn } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun, Server, Monitor, Cpu, Activity } from "lucide-react";

export default function Index() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary),0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary),0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Theme Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-6 right-6 rounded-xl z-20"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>

      <div className="w-full flex flex-col items-center justify-center px-2 sm:px-0 z-10">
        {/* Floating icons decoration - hidden on mobile */}
        <div className="hidden sm:flex absolute -top-10 -left-10 w-20 h-20 bg-card rounded-2xl border border-border shadow-lg items-center justify-center animate-float opacity-60">
          <Cpu className="w-8 h-8 text-primary" />
        </div>
        <div className="hidden sm:flex absolute -top-5 -right-8 w-16 h-16 bg-card rounded-2xl border border-border shadow-lg items-center justify-center animate-float opacity-60" style={{ animationDelay: "0.5s" }}>
          <Activity className="w-6 h-6 text-primary/70" />
        </div>
        <div className="hidden sm:flex absolute -bottom-8 -left-5 w-14 h-14 bg-card rounded-xl border border-border shadow-lg items-center justify-center animate-float opacity-60" style={{ animationDelay: "1s" }}>
          <Monitor className="w-5 h-5 text-secondary-foreground" />
        </div>

        <Card className="border-none shadow-2xl bg-white/90 dark:bg-card/80 backdrop-blur-xl overflow-hidden max-w-md w-full mx-auto animate-slideUp animate-delay-200">
          <CardHeader className="space-y-1 text-center pb-6 mt-6">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-xl">
                <Server className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold gradient-text-primary">
              Watchtower
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Sign in to access the monitoring dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 overflow-hidden justify-center flex items-center ">
            <div className="w-full flex flex-col gap-4">
              <SignIn 
                appearance={{
                  elements: {
                    rootBox: "w-full max-w-full items-center justify-center flex overflow-hidden",
                    card: "shadow-none bg-transparent p-0 w-full max-w-full",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: 
                      "bg-accent hover:bg-accent/80 border border-border shadow-sm transition-all duration-200 hover:shadow-md",
                    socialButtonsBlockButtonText: "font-medium text-foreground",
                    formButtonPrimary: 
                      "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-200 hover:shadow-xl",
                    footerActionLink: "text-primary hover:text-primary/80 font-medium",
                    formFieldInput: 
                      "bg-background border-border focus:border-primary focus:ring-primary/20",
                    identityPreviewText: "text-foreground",
                    identityPreviewEditButton: "text-primary hover:text-primary/80",
                    dividerLine: "bg-border",
                    dividerText: "text-muted-foreground",
                    formFieldLabel: "text-foreground",
                    formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2 w-full">
          <p className="text-sm text-muted-foreground">
            Real-time Server Monitoring System
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground/60">
            <span>CPU</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span>Memory</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span>Network</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span>Disk</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @media (max-width: 640px) {
          .max-w-md { max-width: 100% !important; }
          .w-20, .h-20, .w-16, .h-16, .w-14, .h-14 { width: 3.5rem !important; height: 3.5rem !important; }
        }
      `}</style>
    </div>
  );
}
