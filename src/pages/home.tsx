import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLandingPageMetrics } from "@/lib/hooks/useLandingPageMetrics";
import { 
    Server, 
    Activity, 
    Monitor, 
    Cpu, 
    HardDrive, 
    Network, 
    Shield, 
    Zap, 
    BarChart3, 
    Sparkles, 
    Mail,
    ChevronRight,
    ArrowRight,
    Phone,
    Clock,
    MessageCircle,
    Send,
    Lock
} from "lucide-react";

export default function Home() {
    const landingMetrics = useLandingPageMetrics();

    return (
        <PublicLayout>
            <div className="w-full">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">System Status: Optimal</span>
                                <Sparkles className="w-3 h-3 text-amber-500 ml-1" />
                            </div>
                            
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-sans font-bold tracking-tight text-foreground mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                                Monitor, Scale, and <span className="text-primary italic">Optimize</span>
                            </h1>
                            
                            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                                Watchtower is a high-performance monitoring engine built for modern infrastructure. 
                                Real-time telemetry, advanced analytics, and seamless scaling.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                                <Button asChild size="lg" className="h-14 px-8 text-base font-semibold rounded-full w-full sm:w-auto">
                                    <a href="/dashboard">
                                        Get Started Free
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </a>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base font-semibold rounded-full w-full sm:w-auto">
                                    <a href="/monitoring">
                                        Watch Live Demo
                                    </a>
                                </Button>
                            </div>
                        </div>

                        {/* Subtle code/metric display */}
                        <div className="mt-20 relative max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-500">
                            <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden shadow-2xl shadow-primary/5">
                                <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                                        <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/30" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
                                    </div>
                                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">telemetry_node_01.sh</div>
                                    <div className="w-12" />
                                </div>
                                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4 font-mono">
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-primary opacity-50">$</span>
                                            <span className="text-foreground">watchtower --stream-live</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground">CPU_USAGE</span>
                                                <div className="flex gap-1">
                                                    {[1,2,3,4,5,6,7,8].map(i => (
                                                        <div key={i} className={`w-3 h-4 rounded-sm ${i < 4 ? 'bg-primary' : 'bg-primary/20'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-primary font-bold">34.2%</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground">MEM_POOL</span>
                                                <div className="flex gap-1">
                                                    {[1,2,3,4,5,6,7,8].map(i => (
                                                        <div key={i} className={`w-3 h-4 rounded-sm ${i < 6 ? 'bg-primary' : 'bg-primary/20'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-primary font-bold">5.8GB</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground">NET_THROUGHPUT</span>
                                                <span className="text-foreground">1.2 GB/s <span className="text-emerald-500">↑</span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center border-l border-border pl-8 hidden md:flex">
                                        <div className="text-3xl font-mono font-bold tracking-tighter mb-2">99.9%</div>
                                        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">Uptime SLA guaranteed</div>
                                        <div className="h-px w-full bg-gradient-to-r from-border to-transparent mb-4" />
                                        <div className="flex items-center gap-2 text-emerald-500">
                                            <Shield className="w-4 h-4" />
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Encrypted Stream Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Metrics Bar */}
                <section className="border-y border-border bg-muted/20 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
                            {[
                                { icon: Activity, label: "Sensors Active", value: landingMetrics.sensorsActive.toString().padStart(2, '0'), color: "text-emerald-500" },
                                { icon: Server, label: "Nodes Connected", value: landingMetrics.nodesConnected.toString().padStart(2, '0'), color: "text-primary" },
                                { icon: BarChart3, label: "Daily Cycles", value: landingMetrics.dailyCycles, color: "text-amber-500" },
                                { icon: Clock, label: "Avg Latency", value: landingMetrics.avgLatency, color: "text-cyan-500" }
                            ].map((stat, i) => (
                                <div key={i} className="p-8 group hover:bg-background/50 transition-colors">
                                    <div className="flex items-center gap-3 mb-2">
                                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground font-bold">{stat.label}</span>
                                    </div>
                                    <div className="text-3xl font-mono font-bold tracking-tighter tabular-nums">
                                        {landingMetrics.isLoading ? "..." : stat.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">System Capabilities</h2>
                            <p className="text-muted-foreground">High-performance monitoring modules engineered for mission-critical infrastructure.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { icon: Cpu, title: "CPU Monitoring", desc: "Real-time usage tracking, thread analysis and thermal monitoring per core." },
                                { icon: HardDrive, title: "Storage Analytics", desc: "Advanced disk I/O metrics, capacity forecasting and health diagnostics." },
                                { icon: Monitor, title: "Memory Tracking", desc: "Detailed RAM allocation patterns, leak detection and swap usage analysis." },
                                { icon: Network, title: "Network Analysis", desc: "Granular bandwidth tracking, packet loss detection and connection mapping." },
                                { icon: Zap, title: "Intelligent Alerts", desc: "Low-latency notification system triggered by customizable performance thresholds." },
                                { icon: Lock, title: "Secure Telemetry", desc: "End-to-end encrypted data transmission from nodes to your control panel." }
                            ].map((feature, i) => (
                                <Card key={i} className="border border-border bg-background hover:border-primary/50 transition-all duration-300 rounded-xl overflow-hidden group">
                                    <CardContent className="p-8">
                                        <div className="w-12 h-12 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                            <feature.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {feature.desc}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-24 bg-muted/30 border-y border-border overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-center gap-16">
                            <div className="flex-1 space-y-8">
                                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                                    <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">Deployment Pipeline</span>
                                </div>
                                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">From node to insight in under 60 seconds.</h2>
                                <div className="space-y-6">
                                    {[
                                        { step: "01", title: "Install Agent", text: "Run our one-line installer on any Linux or Windows server." },
                                        { step: "02", title: "Secure Handshake", text: "The agent establishes an encrypted TLS tunnel to our telemetry hub." },
                                        { step: "03", title: "Real-time Stream", text: "Metrics begin streaming immediately to your unified dashboard." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="flex-none w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center font-mono text-xs font-bold text-primary">
                                                {item.step}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-base mb-1">{item.title}</h4>
                                                <p className="text-sm text-muted-foreground">{item.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 relative">
                                <div className="relative z-10 rounded-2xl border border-border bg-background p-2 shadow-2xl">
                                    <div className="rounded-xl border border-border overflow-hidden">
                                        <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc51?q=80&w=2000&auto=format&fit=crop" alt="Server Datacenter" className="w-full h-auto object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700" />
                                    </div>
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl -z-0" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Live Data Visualizer Preview */}
                <section className="py-24 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row items-end justify-between mb-12 gap-6">
                            <div className="max-w-2xl">
                                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Unified Control</h2>
                                <p className="text-muted-foreground">Manage all your infrastructure from a single pane of glass. No more jumping between tools.</p>
                            </div>
                            <Button asChild variant="link" className="text-primary font-bold uppercase tracking-widest text-[10px]">
                                <a href="/monitoring" className="flex items-center">
                                    Explore Monitoring Hub <ChevronRight className="ml-1 w-3 h-3" />
                                </a>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Global CPU", value: landingMetrics.globalCPU, trend: landingMetrics.globalCPUTrend, icon: Cpu },
                                { label: "Total RAM", value: landingMetrics.totalRAM, trend: landingMetrics.totalRAMTrend, icon: Monitor },
                                { label: "Active Nodes", value: landingMetrics.activeNodes.toString(), trend: landingMetrics.activeNodesTrend, icon: Server },
                                { label: "Alerts (24h)", value: landingMetrics.alerts24h.toString().padStart(2, '0'), trend: landingMetrics.alertsTrend, icon: Zap }
                            ].map((card, i) => (
                                <div key={i} className="p-6 rounded-xl border border-border bg-muted/10 hover:bg-muted/20 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-lg border border-border bg-background flex items-center justify-center">
                                            <card.icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <span className={`text-[10px] font-mono font-bold ${card.trend.startsWith('-') ? 'text-emerald-500' : card.trend === '0' ? 'text-muted-foreground' : 'text-amber-500'}`}>
                                            {card.trend !== '0' && (card.trend.startsWith('-') ? '↓' : '↑')} {card.trend}
                                        </span>
                                    </div>
                                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{card.label}</h4>
                                    <div className="text-2xl font-bold tracking-tighter font-mono">{landingMetrics.isLoading ? "..." : card.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Partners Section */}
                <section className="py-16 border-t border-border bg-muted/10">
                    <div className="container mx-auto px-4">
                        <p className="text-center text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground mb-10">Trusted by Infrastructure Teams</p>
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all">
                            <a href="https://www.terarush.studio/" target="blank" className="flex items-center gap-3 hover:opacity-100 transition-opacity">
                                <img className="w-8 h-8 rounded-sm" src="/img/terarush.webp" alt="Terarush" />
                                <span className="font-mono font-bold text-sm tracking-tighter">TERARUSH.STUDIO</span>
                            </a>
                            <a href="https://pkl.senvada.id" target="blank" className="flex items-center gap-3 hover:opacity-100 transition-opacity">
                                <img className="w-8 h-8 rounded-sm" src="/img/senvada.webp" alt="Senvada" />
                                <span className="font-mono font-bold text-sm tracking-tighter">SENVADA.SYS</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 -z-10" />
                    <div className="container mx-auto px-4 text-center">
                        <div className="max-w-3xl mx-auto space-y-8">
                            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Ready to gain full visibility into your infrastructure?</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Join hundreds of developers and sysadmins who use Watchtower to monitor their mission-critical servers.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button asChild size="lg" className="h-14 px-10 text-base font-semibold rounded-full w-full sm:w-auto">
                                    <a href="/login">Create Free Account</a>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="h-14 px-10 text-base font-semibold rounded-full w-full sm:w-auto">
                                    <a href="/contact">Contact Sales</a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Links (Refined) */}
                <section id="contact" className="py-24 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="p-8 rounded-2xl border border-border bg-card/50 hover:border-primary/50 transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Technical Support</h3>
                                <p className="text-sm text-muted-foreground mb-6">Need help with integration or custom monitoring scripts?</p>
                                <a href="mailto:projects.watchtower@gmail.com" className="text-sm font-mono font-bold text-primary hover:underline">
                                    projects.watchtower@gmail.com
                                </a>
                            </div>

                            <div className="p-8 rounded-2xl border border-border bg-card/50 hover:border-primary/50 transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Sales Inquiries</h3>
                                <p className="text-sm text-muted-foreground mb-6">Looking for enterprise SLAs or high-volume node pricing?</p>
                                <div className="text-sm font-mono font-bold text-primary">
                                    +62 857-9126-8077
                                </div>
                            </div>

                            <div className="p-8 rounded-2xl border border-border bg-card/50 hover:border-primary/50 transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                    <MessageCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Direct Handshake</h3>
                                <p className="text-sm text-muted-foreground mb-6">Chat with our engineering team directly via WhatsApp.</p>
                                <a href="https://wa.me/6285791268077" target="_blank" className="inline-flex items-center gap-2 text-sm font-mono font-bold text-primary hover:underline">
                                    Start Chat <Send className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
