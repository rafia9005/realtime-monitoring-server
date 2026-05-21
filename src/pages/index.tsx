import { SignIn } from "@clerk/clerk-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun, Shield } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function Index() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="max-h-screen top-12 flex items-center justify-center bg-background relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_0%,transparent_50%)]" />
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-foreground/5 rounded-full blur-[120px] animate-gpu-pulse" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-foreground/5 rounded-full blur-[120px] animate-gpu-pulse" style={{ animationDelay: '2s' }} />

        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-8 right-8 h-12 w-12 rounded-2xl z-20 hover:bg-foreground/5 border border-foreground/5 backdrop-blur-xl transition-all active:scale-95"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
      </Button>

      <div className="w-full flex flex-col items-center justify-center px-4 z-10">
        <div className="mb-2 text-center animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="w-24 h-24 bg-foreground/5 rounded-full flex items-center justify-center border border-foreground/10 mx-auto mb-2 shadow-3xl">
            <img src="/img/amazetwoLight.png" alt="AmazeTwo" className="block dark:hidden" />
            <img src="/img/amazetwoDark.png" alt="AmazeTwo" className="hidden dark:block" />
          </div>
          <h1 className="text-5xl font-black tracking-[-0.05em] mb-2 uppercase leading-none">WATCHTOWER</h1>
          <p className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40 italic">{t('index.subtitle')}</p>
        </div>

        <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-1000 delay-200">
          <div className="absolute inset-0 bg-foreground/5 blur-[100px] rounded-full -z-10 opacity-30" />
          <Card className="accent-card accent-card-indigo border border-foreground/5 bg-card/40 backdrop-blur-3xl overflow-hidden rounded-[3rem] shadow-3xl">
            <CardContent className="p-10 pt-12">
              <SignIn
                appearance={{
                  elements: {
                    rootBox: "w-full items-center justify-center flex",
                    card: "shadow-none bg-transparent p-0 w-full",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton:
                      "bg-foreground/[0.03] hover:bg-foreground/[0.06] border border-foreground/5 rounded-2xl h-14 transition-all duration-300",
                    socialButtonsBlockButtonText: "font-black text-sm tracking-tight uppercase",
                    formButtonPrimary:
                      "bg-foreground hover:opacity-90 text-background rounded-2xl h-14 font-black shadow-2xl transition-all duration-300 uppercase tracking-widest text-xs",
                    footerActionLink: "text-foreground font-black hover:opacity-70 transition-opacity uppercase text-[10px] tracking-widest",
                    formFieldInput:
                      "bg-foreground/[0.03] border-foreground/5 rounded-2xl h-14 focus:ring-foreground/10 font-bold",
                    identityPreviewText: "font-black text-foreground uppercase tracking-tight",
                    identityPreviewEditButton: "text-foreground opacity-50 font-black uppercase text-[10px] tracking-widest",
                    dividerLine: "bg-foreground/5",
                    dividerText: "text-foreground/20 font-black text-[10px] uppercase tracking-[0.3em]",
                    formFieldLabel: "text-foreground font-black text-[10px] uppercase tracking-[0.2em] mb-2 opacity-40 ml-1",
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-2 space-y-6 animate-in fade-in duration-1000 delay-500">
          <div className="flex items-center gap-4 justify-center text-emerald-500 bg-emerald-500/5 px-6 py-3 rounded-full border border-emerald-500/10 backdrop-blur-3xl">
            <Shield className="w-5 h-5" />
            <span className="text-[10px] font-black tracking-[0.4em] uppercase italic">{t('index.shieldActive')}</span>
          </div>
        </div>
        <p className="text-[10px] font-black text-muted-foreground/30 tracking-[0.5em] uppercase italic mt-2">
          v4.2.0-STABLE | WATCHTOWER &copy; 2024 | All rights reserved
        </p>
      </div>
    </div>
  );
}
