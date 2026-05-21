import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { useLandingPageMetrics } from "@/lib/hooks/useLandingPageMetrics";
import { useLanguage } from "@/lib/LanguageContext";
import { useUser } from "@clerk/clerk-react";
import {
    Activity,
    Cpu,
    Shield,
    Zap,
    ArrowRight,
    Lock,
    HardDrive,
    Monitor,
    Network
} from "lucide-react";

export default function Home() {
    const landingMetrics = useLandingPageMetrics();
    const { t } = useLanguage();
    const { isSignedIn } = useUser();

    return (
        <PublicLayout>
            <div className="w-full">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden">
                     <div className="container mx-auto px-4 relative z-10">
                        <div className="w-full mx-auto text-center">
                            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-foreground mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                                {t('home.hero.observe')} <br />
                                <span className="text-foreground/20">{t('home.hero.optimize')}</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 font-medium italic">
                                {t('home.hero.desc')}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
                                <Button asChild size="lg" className="h-16 px-12 text-lg font-black rounded-2xl w-full sm:w-auto bg-foreground text-background hover:scale-105 transition-all shadow-2xl shadow-foreground/10 active:scale-95 uppercase tracking-widest">
                                    <a href={isSignedIn ? "/dashboard" : "/login"}>
                                        {t('home.hero.btnInit')}
                                        <ArrowRight className="ml-3 w-5 h-5" />
                                    </a>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="h-16 px-12 text-lg font-black rounded-2xl w-full sm:w-auto backdrop-blur-md border-foreground/10 hover:bg-foreground/5 transition-all active:scale-95 uppercase tracking-widest">
                                    <a href="#features">
                                        {t('home.hero.btnExplore')}
                                    </a>
                                </Button>
                            </div>
                        </div>

                        {/* Visual Assets - Terminal-like UI */}
                        <div className="mt-32 relative max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-700">
                            <div className="accent-card accent-card-emerald rounded-[3rem] border border-foreground/5 bg-card/40 backdrop-blur-3xl overflow-hidden shadow-3xl group">
                                <div className="flex items-center justify-between px-8 py-6 border-b border-foreground/5 bg-foreground/[0.02]">
                                    <div className="flex gap-3">
                                        <div className="w-3.5 h-3.5 rounded-full bg-red-500/80" />
                                        <div className="w-3.5 h-3.5 rounded-full bg-orange-500/80" />
                                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80" />
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-muted-foreground/60 uppercase italic">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        Secure Channel // Segment_Alpha_V
                                    </div>
                                    <div className="w-20" />
                                </div>
                                <div className="p-12 md:p-20 grid grid-cols-1 md:grid-cols-12 gap-16">
                                    <div className="md:col-span-7 space-y-12">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 rounded-[2rem] bg-foreground/5 flex items-center justify-center text-foreground border border-foreground/10 shadow-inner">
                                                <Activity className="w-10 h-10" />
                                            </div>
                                            <div>
                                                <div className="text-3xl font-black tracking-tighter text-foreground uppercase">Cluster Node_01</div>
                                                <div className="text-[10px] font-black text-muted-foreground flex items-center gap-3 uppercase tracking-widest opacity-40">
                                                    Status: <span className={landingMetrics.nodeStatus === "online" ? "text-emerald-500" : "text-red-500"}>
                                                        {landingMetrics.nodeStatus === "online" 
                                                            ? t("home.node.synchronized")
                                                            : t("home.node.offline")
                                                        }
                                                    </span> | Up: <span className="text-foreground">{landingMetrics.nodeUptime}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-10">
                                            {[
                                                { 
                                                    label: t("home.node.neuralEngine"), 
                                                    value: Math.round(landingMetrics.nodeCpu), 
                                                    color: "bg-foreground", 
                                                    status: Math.round(landingMetrics.nodeCpu) < 70 
                                                        ? "optimal" 
                                                        : Math.round(landingMetrics.nodeCpu) < 90 
                                                            ? "warning" 
                                                            : "critical",
                                                    hint: Math.round(landingMetrics.nodeCpu) < 70 
                                                        ? t("home.node.statusOptimal") 
                                                        : Math.round(landingMetrics.nodeCpu) < 90 
                                                            ? t("home.node.statusHigh") 
                                                            : t("home.node.statusCritical") 
                                                },
                                                { 
                                                    label: t("home.node.memorySegment"), 
                                                    value: Math.round(landingMetrics.nodeMemory), 
                                                    color: "bg-foreground/60", 
                                                    status: Math.round(landingMetrics.nodeMemory) < 80 
                                                        ? "optimal" 
                                                        : Math.round(landingMetrics.nodeMemory) < 95 
                                                            ? "warning" 
                                                            : "critical",
                                                    hint: Math.round(landingMetrics.nodeMemory) < 80 
                                                        ? t("home.node.statusStable") 
                                                        : Math.round(landingMetrics.nodeMemory) < 95 
                                                            ? t("home.node.statusWarning") 
                                                            : t("home.node.statusCritical") 
                                                },
                                                { 
                                                    label: t("home.node.networkPulse"), 
                                                    value: Math.round(landingMetrics.nodeNetwork), 
                                                    color: "bg-foreground/40", 
                                                    status: Math.round(landingMetrics.nodeNetwork) > 0 
                                                        ? "optimal" 
                                                        : "idle",
                                                    hint: Math.round(landingMetrics.nodeNetwork) > 0 
                                                        ? t("home.node.statusActive") 
                                                        : t("home.node.statusIdle") 
                                                }
                                            ].map((metric, i) => {
                                                const isCritical = metric.status === "critical";
                                                const isWarning = metric.status === "warning";
                                                const hintColor = isCritical ? "text-red-500" : isWarning ? "text-orange-500" : "text-emerald-500";
                                                
                                                return (
                                                    <div key={i} className="flex flex-col gap-4">
                                                        <div className="flex justify-between items-center text-[10px] font-black tracking-[0.2em] uppercase italic">
                                                            <span className="opacity-30">{metric.label}</span>
                                                            <span className="text-foreground">{metric.value}% <span className={`ml-2 font-black ${hintColor}`}>{metric.hint}</span></span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                                                            <div className={`h-full ${metric.color} rounded-full transition-all duration-1000 delay-100`} style={{ width: `${metric.value}%` }}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="accent-card accent-card-emerald md:col-span-5 flex flex-col justify-center bg-foreground/[0.02] rounded-[3rem] p-12 border border-foreground/5 relative overflow-hidden group/card shadow-inner">
                                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-foreground/5 rounded-full blur-[100px]" />
                                        <div className="text-7xl font-black text-foreground mb-4 tabular-nums tracking-tighter leading-none">{landingMetrics.isLoading ? "99.99" : landingMetrics.nodeUptimePercent}<span className="text-foreground/10">%</span></div>
                                        <div className="text-[10px] font-black text-muted-foreground/40 mb-12 uppercase tracking-[0.4em] italic">{t('home.node.precisionUptime')}</div>
                                        <div className="h-px w-full bg-linear-to-r from-foreground/10 to-transparent mb-10" />
                                        <div className="flex items-center gap-4 text-emerald-500 bg-emerald-500/5 px-6 py-4 rounded-[2rem] border border-emerald-500/10 w-fit">
                                            <Shield className="w-5 h-5" />
                                            <span className="text-[10px] font-black tracking-[0.3em] uppercase italic">{t('home.node.securityProtocol')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Metrics Bar */}
                <section className="relative z-10 py-0">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { label: t("home.stats.activeNodes"), value: landingMetrics.nodesConnected.toString().padStart(2, '0'), unit: t("home.stats.stations"), accentClass: "accent-card-emerald" },
                                { label: t("home.stats.globalCpu"), value: landingMetrics.globalCPU.replace('%', ''), unit: t("home.stats.percentage"), accentClass: "accent-card-indigo" },
                                { label: t("home.stats.networkIo"), value: landingMetrics.avgLatency, unit: t("home.stats.latency"), accentClass: "accent-card-teal" },
                                { label: t("home.stats.dailyCycles"), value: landingMetrics.dailyCycles, unit: t("home.stats.telemetry"), accentClass: "accent-card-amber" }
                            ].map((stat, i) => (
                                <div key={i} className={`accent-card ${stat.accentClass} p-10 border border-foreground/5 rounded-[2.5rem] bg-card/20 backdrop-blur-3xl hover:bg-card transition-all duration-500 group`}>
                                    <div className="text-[10px] font-black text-muted-primary/80 tracking-[0.3em] uppercase mb-2 italic">{stat.label}</div>
                                    <div className="flex items-baseline gap-2">
                                        <div className="text-5xl font-black tracking-tighter text-foreground leading-none">
                                            {landingMetrics.isLoading ? "--" : stat.value}
                                        </div>
                                        <div className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest italic">{stat.unit}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-60 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-foreground/10 to-transparent" />
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-12">
                            <div className="max-w-3xl space-y-6">
                                <div className="text-[10px] font-black tracking-[0.4em] text-primary uppercase flex items-center gap-4">
                                    <div className="w-12 h-px bg-primary" />
                                    {t('home.capabilities.title')}
                                </div>
                                <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-foreground leading-tight uppercase">
                                    {t('home.capabilities.subtitle')}
                                </h2>
                            </div>

                            <div className="w-full flex justify-end items-end">
                                <video src="/vid/demonstrasi.mp4" autoPlay muted loop playsInline controls className="w-xl"></video>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Cpu,
                                    title: t("home.capabilities.telemetryIngestion.title"),
                                    desc: t("home.capabilities.telemetryIngestion.desc"),
                                    accentClass: "accent-card-indigo",
                                    iconClass: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-background"
                                },
                                {
                                    icon: HardDrive,
                                    title: t("home.capabilities.unifiedStorage.title"),
                                    desc: t("home.capabilities.unifiedStorage.desc"),
                                    accentClass: "accent-card-amber",
                                    iconClass: "text-amber-500 bg-amber-500/10 border-amber-500/20 group-hover:bg-amber-500 group-hover:text-background"
                                },
                                {
                                    icon: Monitor,
                                    title: t("home.capabilities.visualSynthesis.title"),
                                    desc: t("home.capabilities.visualSynthesis.desc"),
                                    accentClass: "accent-card-blue",
                                    iconClass: "text-blue-500 bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500 group-hover:text-background"
                                },
                                {
                                    icon: Network,
                                    title: t("home.capabilities.edgeConnectivity.title"),
                                    desc: t("home.capabilities.edgeConnectivity.desc"),
                                    accentClass: "accent-card-teal",
                                    iconClass: "text-teal-500 bg-teal-500/10 border-teal-500/20 group-hover:bg-teal-500 group-hover:text-background"
                                },
                                {
                                    icon: Zap,
                                    title: t("home.capabilities.thresholdAlerts.title"),
                                    desc: t("home.capabilities.thresholdAlerts.desc"),
                                    accentClass: "accent-card-orange",
                                    iconClass: "text-orange-500 bg-orange-500/10 border-orange-500/20 group-hover:bg-orange-500 group-hover:text-background"
                                },
                                {
                                    icon: Lock,
                                    title: t("home.capabilities.endToEndGuard.title"),
                                    desc: t("home.capabilities.endToEndGuard.desc"),
                                    accentClass: "accent-card-emerald",
                                    iconClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-background"
                                }
                            ].map((feature, i) => (
                                <div key={i} className={`accent-card ${feature.accentClass} group p-12 border border-foreground/5 rounded-[3.5rem] bg-card/10 hover:bg-card hover:border-foreground/10 hover:shadow-2xl transition-all duration-700`}>
                                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-12 group-hover:scale-110 transition-all duration-500 border ${feature.iconClass}`}>
                                        <feature.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-3xl font-black mb-4 text-foreground tracking-tighter uppercase">{feature.title}</h3>
                                    <p className="text-muted-foreground font-bold leading-relaxed italic opacity-40 group-hover:opacity-80 transition-opacity">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

            </div>
        </PublicLayout>
    );
}
