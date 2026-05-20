import PublicLayout from "@/components/PublicLayout";
import { Info, Target, Shield, Zap, LayoutDashboard, Cpu, Network } from "lucide-react";

export default function About() {
    return (
        <PublicLayout>
            <div className="w-full relative overflow-hidden pt-32 pb-40">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-32">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-muted/40 backdrop-blur-md border border-border/50 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                             <Info className="w-4 h-4 text-primary" />
                             <span className="text-xs font-black tracking-[0.2em] uppercase text-foreground/80">Protocol Genesis</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-foreground mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
                           Simplicity in <br/>
                           <span className="text-muted-foreground/30">Infrastructure.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                            Watchtower was forged from the need for clarity in an increasingly complex digital landscape. We build tools that make system health intuitive.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-40">
                         <div className="group p-12 border border-border/40 rounded-[3rem] bg-card/10 hover:bg-card transition-all duration-700">
                             <Target className="w-12 h-12 text-primary mb-8" />
                             <h3 className="text-3xl font-bold mb-6 tracking-tight">Our Mission</h3>
                             <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                                To democratize server monitoring. We believe that critical infrastructure data should be accessible, beautiful, and actionable for teams of all sizes.
                             </p>
                         </div>
                         <div className="group p-12 border border-border/40 rounded-[3rem] bg-card/10 hover:bg-card transition-all duration-700">
                             <Shield className="w-12 h-12 text-primary mb-8" />
                             <h3 className="text-3xl font-bold mb-6 tracking-tight">Our Values</h3>
                             <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                                Privacy by design, reliability as standard, and aesthetics as a core functional requirement. We don't just process metrics; we craft visibility.
                             </p>
                         </div>
                    </div>

                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-24">
                           <h2 className="text-4xl font-bold tracking-tight">The Architecture of Watchtower</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { icon: Cpu, label: "Low Overhead", value: "< 1%", unit: "CPU Usage" },
                                { icon: Network, label: "Global Reach", value: "Real-time", unit: "Telemetry" },
                                { icon: Zap, label: "Fast Alerts", value: "< 5s", unit: "Notification" },
                                { icon: LayoutDashboard, label: "Modern UI", value: "Zen", unit: "UX Design" }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center p-10 border border-border/30 rounded-[2.5rem] bg-muted/10">
                                    <item.icon className="w-8 h-8 text-muted-foreground/40 mb-6" />
                                    <div className="text-4xl font-bold tracking-tighter mb-1">{item.value}</div>
                                    <div className="text-[10px] font-black tracking-[0.2em] uppercase text-primary">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
