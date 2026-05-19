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
    ChevronRight,
    ArrowRight,
    Phone,
    Clock,
    MessageCircle,
    Send,
    Lock,
    HelpCircle
} from "lucide-react";

export default function Home() {
    const landingMetrics = useLandingPageMetrics();

    return (
        <PublicLayout>
            <div className="w-full bg-slate-50 dark:bg-slate-950">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 pointer-events-none" />
                    <div className="absolute top-1/4 -left-64 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
                    <div className="absolute top-1/3 -right-64 w-96 h-96 bg-fuchsia-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
                    <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-amber-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
                    
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 shadow-md border border-indigo-100 dark:border-indigo-900 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">Systems Normal & Active</span>
                                <Sparkles className="w-4 h-4 text-amber-500 ml-1" />
                            </div>
                            
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-sans font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 drop-shadow-sm">
                                Keep Your Systems <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-500">Healthy</span>
                            </h1>
                            
                            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                                Watchtower is your easy-to-use companion for keeping servers, websites, and apps running smoothly. We translate complex data into clear, actionable insights.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                                <Button asChild size="lg" className="h-14 px-8 text-lg font-semibold rounded-full w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105">
                                    <a href="/dashboard">
                                        Get Started for Free
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </a>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold rounded-full w-full sm:w-auto bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                    <a href="#features">
                                        See How It Works
                                    </a>
                                </Button>
                            </div>
                        </div>

                        {/* Friendly metric display */}
                        <div className="mt-20 relative max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-500">
                            <div className="rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10">
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                    </div>
                                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Live Dashboard Preview</div>
                                    <div className="w-12" />
                                </div>
                                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <Activity className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-slate-900 dark:text-white">Main Server Overview</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">Updating every second</div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between items-center text-sm font-semibold">
                                                    <span className="text-slate-600 dark:text-slate-300">Processing Power (CPU)</span>
                                                    <span className="text-blue-600 dark:text-blue-400">34% Normal</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{width: '34%'}}></div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between items-center text-sm font-semibold">
                                                    <span className="text-slate-600 dark:text-slate-300">Active Memory (RAM)</span>
                                                    <span className="text-fuchsia-600 dark:text-fuchsia-400">45% Good</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-fuchsia-500 rounded-full" style={{width: '45%'}}></div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 mt-2">
                                                <div className="flex items-center gap-2">
                                                    <Network className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Internet Speed</span>
                                                </div>
                                                <span className="text-slate-900 dark:text-white font-bold">1.2 GB/s <span className="text-emerald-500 text-xs ml-1">Excellent</span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center bg-gradient-to-br from-indigo-50 to-fuchsia-50 dark:from-indigo-950/30 dark:to-fuchsia-950/30 rounded-xl p-6 border border-indigo-100 dark:border-indigo-900/50 hidden md:flex">
                                        <div className="text-5xl font-extrabold text-indigo-700 dark:text-indigo-400 mb-2 drop-shadow-sm">99.9%</div>
                                        <div className="text-sm font-semibold text-indigo-900/60 dark:text-indigo-300/60 mb-6 uppercase tracking-wider">Reliability Score</div>
                                        <div className="h-px w-full bg-gradient-to-r from-indigo-200 dark:from-indigo-800 to-transparent mb-6" />
                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-lg border border-emerald-100 dark:border-emerald-900/50 w-fit">
                                            <Shield className="w-4 h-4" />
                                            <span className="text-sm font-bold tracking-wide">Data Encrypted & Secure</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Metrics Bar */}
                <section className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-y border-slate-200 dark:border-slate-800 relative z-10 shadow-sm">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 dark:divide-slate-800">
                            {[
                                { icon: Activity, label: "Active Monitors", value: landingMetrics.sensorsActive.toString().padStart(2, '0'), color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-950/50" },
                                { icon: Server, label: "Servers Connected", value: landingMetrics.nodesConnected.toString().padStart(2, '0'), color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-950/50" },
                                { icon: BarChart3, label: "Daily Checks", value: landingMetrics.dailyCycles, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-950/50" },
                                { icon: Clock, label: "Response Time", value: landingMetrics.avgLatency, color: "text-cyan-500", bg: "bg-cyan-100 dark:bg-cyan-950/50" }
                            ].map((stat, i) => (
                                <div key={i} className="p-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`p-2 rounded-lg ${stat.bg}`}>
                                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{stat.label}</span>
                                    </div>
                                    <div className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
                                        {landingMetrics.isLoading ? "..." : stat.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 relative">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold mb-4">
                                <Sparkles className="w-4 h-4" /> Why Choose Watchtower
                            </div>
                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white">Everything You Need to Know</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300">We keep an eye on your tech so you don't have to. Simple alerts and beautiful charts make it easy for everyone to understand.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { icon: Cpu, title: "Brain Power (CPU)", desc: "See how hard your servers are thinking. We'll tell you if they're overworked and need a break.", color: "blue" },
                                { icon: HardDrive, title: "Storage Space", desc: "Never run out of room unexpectedly. Get a heads-up before your hard drives get full.", color: "amber" },
                                { icon: Monitor, title: "Active Memory (RAM)", desc: "Keep track of short-term memory usage to ensure your apps don't slow down or freeze.", color: "fuchsia" },
                                { icon: Network, title: "Internet Health", desc: "Watch traffic flowing in and out. Spot connection issues before they affect your users.", color: "emerald" },
                                { icon: Zap, title: "Smart Alerts", desc: "Get notified on your phone or email only when things actually need your attention. No spam.", color: "rose" },
                                { icon: Lock, title: "Bank-Grade Security", desc: "Your data is locked down tight. We use the same encryption standards as major banks.", color: "indigo" }
                            ].map((feature, i) => {
                                const colorStyles = {
                                    blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-200 dark:border-blue-900 group-hover:bg-blue-500",
                                    amber: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200 dark:border-amber-900 group-hover:bg-amber-500",
                                    fuchsia: "bg-fuchsia-50 dark:bg-fuchsia-950/30 text-fuchsia-600 border-fuchsia-200 dark:border-fuchsia-900 group-hover:bg-fuchsia-500",
                                    emerald: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-200 dark:border-emerald-900 group-hover:bg-emerald-500",
                                    rose: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 border-rose-200 dark:border-rose-900 group-hover:bg-rose-500",
                                    indigo: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 border-indigo-200 dark:border-indigo-900 group-hover:bg-indigo-500",
                                }[feature.color] || "bg-slate-50 text-slate-600 border-slate-200 group-hover:bg-slate-500";

                                return (
                                    <Card key={i} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden group">
                                        <CardContent className="p-8">
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:text-white ${colorStyles.split('group-hover')[0]} group-hover:${colorStyles.split('group-hover:')[1]}`}>
                                                <feature.icon className="w-7 h-7" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                                {feature.desc}
                                            </p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-24 bg-indigo-50 dark:bg-indigo-950/20 border-y border-indigo-100 dark:border-indigo-900/30 overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col md:flex-row items-center gap-16">
                            <div className="flex-1 space-y-8">
                                <div className="inline-block px-4 py-2 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-indigo-200 dark:border-indigo-800">
                                    <span className="text-xs font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">Setup in Minutes</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">From zero to full visibility in under 60 seconds.</h2>
                                <p className="text-lg text-slate-600 dark:text-slate-300">You don't need to be an expert to use Watchtower. Our simple setup process does the heavy lifting for you.</p>
                                <div className="space-y-6 pt-4">
                                    {[
                                        { step: "1", title: "Install the Helper App", text: "Run one simple command on your computer or server." },
                                        { step: "2", title: "Automatic Connection", text: "It securely links up with your dashboard all by itself." },
                                        { step: "3", title: "View Your Data", text: "Beautiful charts and metrics appear instantly." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-5 bg-white/60 dark:bg-slate-900/60 p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-900/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-900 transition-colors">
                                            <div className="flex-none w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                {item.step}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg mb-1 text-slate-900 dark:text-white">{item.title}</h4>
                                                <p className="text-slate-600 dark:text-slate-400">{item.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 relative w-full">
                                <div className="relative z-10 rounded-2xl border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                    <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 aspect-video flex items-center justify-center p-8">
                                        <div className="text-center space-y-6">
                                            <div className="flex justify-center">
                                                <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center animate-bounce">
                                                    <Server className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />
                                                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />
                                            </div>
                                            <div className="flex gap-2 justify-center">
                                                <div className="h-8 w-8 bg-blue-400 rounded-full animate-pulse" />
                                                <div className="h-8 w-8 bg-fuchsia-400 rounded-full animate-pulse delay-100" />
                                                <div className="h-8 w-8 bg-emerald-400 rounded-full animate-pulse delay-200" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -z-0" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Live Data Visualizer Preview */}
                <section className="py-24 relative" id="control">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row items-end justify-between mb-12 gap-6">
                            <div className="max-w-2xl">
                                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">Your Command Center</h2>
                                <p className="text-lg text-slate-600 dark:text-slate-400">See the health of your entire setup at a glance. No more jumping between confusing technical screens.</p>
                            </div>
                            <Button asChild variant="outline" className="border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-full px-6">
                                <a href="/monitoring" className="flex items-center font-bold">
                                    Explore Monitoring Hub <ChevronRight className="ml-2 w-4 h-4" />
                                </a>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: "Overall Brain Power", value: landingMetrics.globalCPU, trend: landingMetrics.globalCPUTrend, icon: Cpu, color: "blue", suffix: "%" },
                                { label: "Memory Used", value: landingMetrics.totalRAM, trend: landingMetrics.totalRAMTrend, icon: Monitor, color: "fuchsia", suffix: "" },
                                { label: "Healthy Computers", value: landingMetrics.activeNodes.toString(), trend: landingMetrics.activeNodesTrend, icon: Server, color: "emerald", suffix: "" },
                                { label: "Warnings Today", value: landingMetrics.alerts24h.toString(), trend: landingMetrics.alertsTrend, icon: Zap, color: "amber", suffix: "" }
                            ].map((card, i) => {
                                const isPositive = card.trend.startsWith('-');
                                const isNeutral = card.trend === '0';
                                
                                const colorStyles = {
                                    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/50",
                                    fuchsia: "text-fuchsia-600 bg-fuchsia-100 dark:bg-fuchsia-900/50",
                                    emerald: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50",
                                    amber: "text-amber-600 bg-amber-100 dark:bg-amber-900/50",
                                }[card.color];

                                return (
                                    <div key={i} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorStyles}`}>
                                                <card.icon className="w-6 h-6" />
                                            </div>
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                                                isNeutral ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' : 
                                                isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 
                                                'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400'
                                            }`}>
                                                {isNeutral ? null : (isPositive ? '↓' : '↑')}
                                                {card.trend}
                                            </div>
                                        </div>
                                        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">{card.label}</h4>
                                        <div className="text-4xl font-extrabold text-slate-900 dark:text-white">
                                            {landingMetrics.isLoading ? "..." : <>{card.value}<span className="text-2xl text-slate-400 ml-1">{card.suffix}</span></>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 -z-10" />
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay z-0"></div>
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <div className="max-w-3xl mx-auto space-y-8 bg-white/10 backdrop-blur-md p-10 md:p-16 rounded-3xl border border-white/20 shadow-2xl">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-white">Ready for peace of mind?</h2>
                            <p className="text-xl text-indigo-100 leading-relaxed">
                                Join hundreds of businesses that trust Watchtower to keep their digital doors open and running smoothly.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <Button asChild size="lg" className="h-14 px-10 text-lg font-bold rounded-full w-full sm:w-auto bg-white text-indigo-700 hover:bg-slate-100 shadow-xl hover:scale-105 transition-all">
                                    <a href="/login">Create Free Account</a>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="h-14 px-10 text-lg font-bold rounded-full w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white/10 transition-all">
                                    <a href="#contact">Talk to Us</a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Friendly Contact Section */}
                <section id="contact" className="py-24 bg-white dark:bg-slate-950">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">We're here to help</h2>
                            <p className="text-slate-600 dark:text-slate-400 text-lg">Real humans, ready to answer your questions.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center hover:shadow-lg transition-all group">
                                <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <HelpCircle className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">General Questions</h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6 h-12">Not sure where to start? Send us an email anytime.</p>
                                <a href="mailto:projects.watchtower@gmail.com" className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors w-full">
                                    Email Us
                                </a>
                            </div>

                            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center hover:shadow-lg transition-all group">
                                <div className="w-14 h-14 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Phone className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Sales & Pricing</h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6 h-12">Need a plan for a larger business? Let's talk.</p>
                                <div className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-bold w-full">
                                    +62 857-9126-8077
                                </div>
                            </div>

                            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center hover:shadow-lg transition-all group">
                                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <MessageCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Quick Chat</h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6 h-12">Message us on WhatsApp for the fastest reply.</p>
                                <a href="https://wa.me/6285791268077" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors w-full shadow-md shadow-emerald-500/20">
                                    Open WhatsApp <Send className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}

