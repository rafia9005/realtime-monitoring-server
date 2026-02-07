import { useEffect, useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Server, Activity, Monitor, Cpu, HardDrive, Network, Shield, Zap, BarChart3, Sparkles, Mail } from "lucide-react";
import { Check, Phone, Clock, MessageCircle, Send } from "lucide-react";

export default function Home() {
    const [sensorCount, setSensorCount] = useState<number | null>(null);
    const [serverCount, setServerCount] = useState<number | null>(null);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/system-metrics`)
            .then(res => res.json())
            .then(data => {
                setSensorCount(data.temperature?.sensors?.length ?? 0);
                setServerCount(data.servers?.length ?? 0);
            })
            .catch(() => {
                setSensorCount(null);
                setServerCount(null);
            });
    }, []);

    return (
        <PublicLayout>
            <div className="w-full min-h-[calc(100vh-8rem)] flex flex-col items-center relative overflow-hidden">

                <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

                <div className="relative z-10 mt-8 mb-6 animate-slideUp animate-delay-100">
                    <Badge variant="outline" className="px-4 py-2 text-sm bg-card/50 border-primary/20">
                        <Sparkles className="mr-2"/> Discover Watchtower Updates
                    </Badge>
                </div>

                {/* Hero section */}
                <div className="relative z-10 max-w-6xl mx-auto text-center px-4 animate-slideUp animate-delay-200">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                        Monitor, Scale, and{" "}
                        <span className="gradient-text-primary">
                            Optimize Faster
                        </span>
                    </h1>
                    {/* Headline subtitle big */}
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-8 space-y-2 animate-slideUp animate-delay-300">
                        <span className="gradient-text-primary">
                            The Platform
                        </span>{" "}
                        for Effortless <span className="gradient-text-server">Server</span>
                        <br /><span className="gradient-text-primary">Monitoring</span>
                    </h2>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed animate-slideUp animate-delay-400">
                        Watchtower is your all-in-one solution for real-time server monitoring, 
                        performance analysis, and system optimization. We help businesses, startups, and 
                        enterprises build scalable, secure, and future-ready digital infrastructure.
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slideUp animate-delay-500">
                        <Button 
                            asChild 
                            size="lg" 
                            className="bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-500 animate-pulse-glow text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                        >
                            <a href="/dashboard">Start Monitoring Now</a>
                        </Button>
                        <Button 
                            asChild 
                            variant="outline" 
                            size="lg"
                            className="px-8 py-6 text-lg font-semibold border-2 hover:bg-card transition-all duration-300"
                        >
                            <a href="/monitoring">Watch Live Demo</a>
                        </Button>
                    </div>
                </div>

                <div className="relative z-10 w-full flex flex-col justify-center items-center max-w-4xl mx-auto px-4 mb-16 animate-slideUp animate-delay-600">
                    <h2 className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">Trusted by Leading Companies & Startups</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-card/50 border-border/50 backdrop-blur-sm w-fit h-fit">
                            <CardContent className="py-4 text-center">
                                <a href="https://www.terarush.studio/" target="blank" className="w-full justify-center items-center flex gap-6">
                                    <img className="w-10 rounded-full" src="/img/terarush.webp" alt="Terarush" />
                                    <p className="font-bold">Terarush</p>
                                </a>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 border-border/50 backdrop-blur-sm w-fit h-fit">
                            <CardContent className="py-4 text-center">
                                <a href="https://pkl.senvada.id" target="blank" className="w-full justify-center items-center flex gap-6">
                                    <img className="w-10 rounded-full" src="/img/senvada.webp" alt="Senvada" />
                                    <p className="font-bold">Senvada</p>
                                </a>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Stats section */}
                <div className="relative z-10 w-full max-w-4xl mx-auto px-4 mb-16 animate-slideUp animate-delay-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="bg-card/50 border-border/50 backdrop-blur-sm animate-slideUp animate-delay-700">
                            <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Activity className="w-6 h-6 text-green-500" />
                                </div>
                                <div className="text-2xl font-bold text-green-500">
                                    {sensorCount === null ? "-" : sensorCount}
                                </div>
                                <div className="text-sm text-muted-foreground">Temperature Sensors</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 border-border/50 backdrop-blur-sm animate-slideUp animate-delay-[800ms]">
                            <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Server className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="text-2xl font-bold text-blue-500">
                                    {serverCount === null ? "-" : serverCount}
                                </div>
                                <div className="text-sm text-muted-foreground">Servers Connected</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 border-border/50 backdrop-blur-sm animate-slideUp animate-delay-[900ms]">
                            <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <BarChart3 className="w-6 h-6 text-violet-500" />
                                </div>
                                <div className="text-2xl font-bold text-violet-500">24/7</div>
                                <div className="text-sm text-muted-foreground">Real-time Monitoring</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 border-border/50 backdrop-blur-sm animate-slideUp animate-delay-[1000ms]">
                            <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Shield className="w-6 h-6 text-amber-500" />
                                </div>
                                <div className="text-2xl font-bold text-amber-500">99.9%</div>
                                <div className="text-sm text-muted-foreground">Uptime Guaranteed</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Features section */}
                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 mb-16 animate-slideUp animate-delay-700">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Powerful Monitoring Features
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Everything you need to keep your servers running at peak performance
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Cpu, title: "CPU Monitoring", description: "Real-time CPU usage tracking and performance analysis" },
                            { icon: HardDrive, title: "Storage Analytics", description: "Disk usage monitoring and storage optimization insights" },
                            { icon: Monitor, title: "Memory Tracking", description: "RAM usage monitoring and memory leak detection" },
                            { icon: Network, title: "Network Analysis", description: "Bandwidth monitoring and network performance metrics" },
                            { icon: Zap, title: "Performance Alerts", description: "Instant notifications for critical system events" },
                            { icon: BarChart3, title: "Advanced Reports", description: "Detailed analytics and historical performance data" }
                        ].map((feature, index) => (
                            <Card key={index} className={`bg-card/30 border-border/50 backdrop-blur-sm hover:bg-card/50 transition-all duration-300 animate-slideUp ${index === 0 ? 'animate-delay-700' : index === 1 ? 'animate-delay-[800ms]' : index === 2 ? 'animate-delay-[900ms]' : index === 3 ? 'animate-delay-[1000ms]' : index === 4 ? 'animate-delay-[1100ms]' : 'animate-delay-[1200ms]'}`}>
                                <CardContent className="p-6">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                        <feature.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Let's Talk Section */}
                <div id="about" className="relative z-10 w-full max-w-6xl mx-auto px-4 mb-16 animate-slideUp animate-delay-700">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Let's <span className="gradient-text-primary">talk</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Multiple ways to reach us. Pick what works best for you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Email */}
                        <Card className="bg-card/50 border-border/50 backdrop-blur-sm animate-slideUp animate-delay-700 overflow-hidden">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                                    <Mail color="#2b80ff" />
                                </div>
                                <h3 className="text-xl font-semibold mb-1">Email Us</h3>
                                <p className="text-sm text-blue-500 font-medium mb-4">Primary</p>
                                <p className="text-xl font-semibold mb-4">projects.watchtower@gmail.com</p>
                                <p className="text-sm text-muted-foreground mb-6">Our main inbox. We typically respond within 2 hours during business days.</p>
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Check className="w-4 h-4 text-green-500" />
                                        Average response: 2 hours
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Shield className="w-4 h-4 text-green-500" />
                                        Secure & confidential
                                    </div>
                                </div>
                                <a 
                                    href="mailto:projects.watchtower@gmail.com"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Mail />
                                    Send Email
                                </a>
                            </CardContent>
                        </Card>

                        {/* Call */}
                        <Card className="bg-card/50 border-border/50 backdrop-blur-sm animate-slideUp animate-delay-[800ms] overflow-hidden">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-6">
                                        <Phone className="w-6 h-6 text-cyan-500" />
                                </div>
                                <h3 className="text-xl font-semibold mb-4">Call Us</h3>
                                <p className="text-2xl font-bold mb-2">+62 857-9126-8077</p>
                                <p className="text-sm text-muted-foreground mb-6">Mon-Fri, 9AM-10PM PST</p>
                                <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 rounded-lg transition-colors mb-6">
                                    Call Now
                                </button>
                                <div className="bg-card/50 border border-border/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Clock className="w-5 h-5 text-cyan-500" />
                                        <h4 className="text-sm font-semibold">Business Hours</h4>
                                    </div>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex justify-between">
                                            <span>Weekdays</span>
                                            <span>9:00 AM - 10:00 PM PST</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Weekends</span>
                                            <span>9:00 AM - 8:00 PM PST</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* WhatsApp */}
                        <Card className="bg-card/50 border-border/50 backdrop-blur-sm animate-slideUp animate-delay-[900ms] overflow-hidden">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-6">
                                        <MessageCircle className="w-6 h-6 text-green-500" />
                                </div>
                                <h3 className="text-xl font-semibold mb-1">WhatsApp</h3>
                                <p className="text-sm text-green-500 font-medium mb-4">Instant messaging</p>
                                <p className="text-sm text-muted-foreground mb-6">Chat with our support team in real-time for instant assistance.</p>
                                <a 
                                    href="https://wa.me/6285791268077"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Message
                                </a>
                                <div className="bg-card/50 border border-border/50 rounded-lg p-4 mt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Clock className="w-5 h-5 text-green-600" />
                                        <h4 className="text-sm font-semibold">Business Hours</h4>
                                    </div>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex justify-between">
                                            <span>Weekdays</span>
                                            <span>9:00 AM - 10:00 PM PST</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Weekends</span>
                                            <span>9:00 AM - 8:00 PM PST</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}