import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { useLandingPageMetrics } from "@/lib/hooks/useLandingPageMetrics";
import { useLanguage } from "@/lib/LanguageContext";
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
    const { language } = useLanguage();

    return (
        <PublicLayout>
            <div className="w-full">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="w-full mx-auto text-center">
                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-muted/40 backdrop-blur-md border border-border/50 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></span>
                                </span>
                                <span className="text-[10px] font-black tracking-[0.3em] text-foreground/80 uppercase">
                                    {language === 'id' ? 'Mesin Inti Online' : 'Core Engine Online'}
                                </span>
                            </div>

                            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-foreground mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                                {language === 'id' ? 'Amati. Analisis.' : 'Observe. Analyze.'} <br />
                                <span className="text-foreground/20">{language === 'id' ? 'Optimalkan.' : 'Optimize.'}</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 font-medium italic">
                                {language === 'id'
                                    ? 'Watchtower memberikan intelijen infrastruktur elit. Telemetri real-time, diagnostik prediktif, dan kontrol terpadu.'
                                    : 'Watchtower delivers elite infrastructure intelligence. Real-time telemetry, predictive diagnostics, and unified control.'}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
                                <Button asChild size="lg" className="h-16 px-12 text-lg font-black rounded-2xl w-full sm:w-auto bg-foreground text-background hover:scale-105 transition-all shadow-2xl shadow-foreground/10 active:scale-95 uppercase tracking-widest">
                                    <a href="/dashboard">
                                        {language === 'id' ? 'Inisialisasi' : 'Initialize'}
                                        <ArrowRight className="ml-3 w-5 h-5" />
                                    </a>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="h-16 px-12 text-lg font-black rounded-2xl w-full sm:w-auto backdrop-blur-md border-foreground/10 hover:bg-foreground/5 transition-all active:scale-95 uppercase tracking-widest">
                                    <a href="#features">
                                        {language === 'id' ? 'Jelajahi' : 'Explore'}
                                    </a>
                                </Button>
                            </div>
                        </div>

                        {/* Visual Assets - Terminal-like UI */}
                        <div className="mt-32 relative max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-700">
                            <div className="rounded-[3rem] border border-foreground/5 bg-card/40 backdrop-blur-3xl overflow-hidden shadow-3xl group">
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
                                                    Status: <span className="text-emerald-500">Synchronized</span> | Up: <span className="text-foreground">14.2d</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-10">
                                            {[
                                                { label: language === 'id' ? "Mesin Saraf" : "Neural Engine", value: 34, color: "bg-foreground", hint: language === 'id' ? "OPTIMAL" : "OPTIMAL" },
                                                { label: language === 'id' ? "Segmen Memori" : "Memory Segment", value: 45, color: "bg-foreground/60", hint: language === 'id' ? "STABIL" : "STABLE" },
                                                { label: language === 'id' ? "Denyut Jaringan" : "Network Pulse", value: 68, color: "bg-foreground/40", hint: language === 'id' ? "AKTIF" : "ACTIVE" }
                                            ].map((metric, i) => (
                                                <div key={i} className="flex flex-col gap-4">
                                                    <div className="flex justify-between items-center text-[10px] font-black tracking-[0.2em] uppercase italic">
                                                        <span className="opacity-30">{metric.label}</span>
                                                        <span className="text-foreground">{metric.value}% <span className="ml-2 text-emerald-500 font-black">{metric.hint}</span></span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                                                        <div className={`h-full ${metric.color} rounded-full transition-all duration-1000 delay-1000`} style={{ width: `${metric.value}%` }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="md:col-span-5 flex flex-col justify-center bg-foreground/[0.02] rounded-[3rem] p-12 border border-foreground/5 relative overflow-hidden group/card shadow-inner">
                                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-foreground/5 rounded-full blur-[100px]" />
                                        <div className="text-7xl font-black text-foreground mb-4 tabular-nums tracking-tighter leading-none">99.99<span className="text-foreground/10">%</span></div>
                                        <div className="text-[10px] font-black text-muted-foreground/40 mb-12 uppercase tracking-[0.4em] italic">{language === 'id' ? 'Waktu Operasi Presisi' : 'Precision Uptime'}</div>
                                        <div className="h-px w-full bg-linear-to-r from-foreground/10 to-transparent mb-10" />
                                        <div className="flex items-center gap-4 text-emerald-500 bg-emerald-500/5 px-6 py-4 rounded-[2rem] border border-emerald-500/10 w-fit">
                                            <Shield className="w-5 h-5" />
                                            <span className="text-[10px] font-black tracking-[0.3em] uppercase italic">{language === 'id' ? 'Protokol Keamanan' : 'Security Protocol'}</span>
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
                                { label: language === 'id' ? "Simpul Aktif" : "Active Nodes", value: landingMetrics.nodesConnected.toString().padStart(2, '0'), unit: language === 'id' ? "STASIUN" : "STATIONS" },
                                { label: language === 'id' ? "CPU Global" : "Global CPU", value: landingMetrics.globalCPU.replace('%', ''), unit: language === 'id' ? "PERSENTASE" : "PERCENTAGE" },
                                { label: language === 'id' ? "IO Jaringan" : "Network IO", value: landingMetrics.avgLatency, unit: language === 'id' ? "LATENSI" : "LATENCY" },
                                { label: language === 'id' ? "Siklus Harian" : "Daily Cycles", value: landingMetrics.dailyCycles, unit: language === 'id' ? "TELEMETRI" : "TELEMETRY" }
                            ].map((stat, i) => (
                                <div key={i} className="p-10 border border-foreground/5 rounded-[2.5rem] bg-card/20 backdrop-blur-3xl hover:bg-card transition-all duration-500 group">
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
                                    {language === 'id' ? 'Kemampuan Sistem' : 'System Capabilities'}
                                </div>
                                <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-foreground leading-tight uppercase">
                                    {language === 'id' ? 'Alat Presisi.' : 'Precision Tools.'}
                                </h2>
                            </div>

                            <div className="w-full flex justify-end items-end">
                                <video src="/vid/demonstrasi.mp4" autoPlay loop playsInline controls className="w-xl"></video>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Cpu,
                                    title: language === 'id' ? "Asupan Telemetri" : "Telemetry Ingestion",
                                    desc: language === 'id' ? "Pengumpulan data berbasis agen asli tanpa overhead tambahan pada simpul target Anda." : "Native agent-based data collection with zero-footprint overhead on your target nodes."
                                },
                                {
                                    icon: HardDrive,
                                    title: language === 'id' ? "Penyimpanan Terpadu" : "Unified Storage",
                                    desc: language === 'id' ? "Agregasi metrik terpusat dengan persistensi historis untuk analisis tren yang mendalam." : "Centralized metric aggregation with historical persistence for deep trend analysis."
                                },
                                {
                                    icon: Monitor,
                                    title: language === 'id' ? "Sintesis Visual" : "Visual Synthesis",
                                    desc: language === 'id' ? "Mengubah aliran mentah menjadi kecerdasan yang dapat dibaca manusia melalui desain minimalis." : "Transforming raw streams into human-readable intelligence through minimalist design."
                                },
                                {
                                    icon: Network,
                                    title: language === 'id' ? "Konektivitas Tepi" : "Edge Connectivity",
                                    desc: language === 'id' ? "Cakupan pemantauan global dengan agen lokal yang melapor ke pusat kendali tunggal." : "Global monitoring coverage with localized agents reporting to a unified control center."
                                },
                                {
                                    icon: Zap,
                                    title: language === 'id' ? "Peringatan Ambang" : "Threshold Alerts",
                                    desc: language === 'id' ? "Perutean pemberitahuan cerdas via Telegram, memastikan acara kritis langsung mencapai Anda." : "Intelligent notification routing via Telegram, ensuring critical events reach you instantly."
                                },
                                {
                                    icon: Lock,
                                    title: language === 'id' ? "Penjaga Ujung-ke-Ujung" : "End-to-End Guard",
                                    desc: language === 'id' ? "Diamankan melalui autentikasi Clerk dan enkripsi HTTPS, menjaga infrastruktur Anda tetap pribadi." : "Secured through Clerk auth and HTTPS encryption, keeping your infrastructure private."
                                }
                            ].map((feature, i) => (
                                <div key={i} className="group p-12 border border-foreground/5 rounded-[3.5rem] bg-card/10 hover:bg-card hover:border-foreground/10 hover:shadow-2xl transition-all duration-700">
                                    <div className="w-20 h-20 rounded-[2rem] bg-foreground/5 flex items-center justify-center mb-12 group-hover:scale-110 group-hover:bg-foreground group-hover:text-background transition-all duration-500 border border-foreground/10">
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
