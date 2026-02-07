import PublicLayout from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Server, Shield, Zap, Target, Eye, Heart,
    Globe, Award, Sparkles, ArrowRight, Code, Cpu, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function About() {
    return (
        <PublicLayout>
            <div className="w-full min-h-[calc(100vh-8rem)] flex flex-col items-center relative overflow-hidden">
                {/* Grid background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

                {/* Hero Section */}
                <div className="relative z-10 mt-8 mb-6 animate-slideUp animate-delay-100">
                    <Badge variant="outline" className="px-4 py-2 text-sm bg-card/50 border-primary/20">
                        <Sparkles className="mr-2 w-4 h-4" /> About Watchtower
                    </Badge>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center px-4 mb-16 animate-slideUp animate-delay-200">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        Building the Future of{" "}
                        <span className="gradient-text-primary">Server Monitoring</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Watchtower was born from the need for a simple, powerful, and real-time
                        server monitoring solution. We empower teams to keep their infrastructure
                        running smoothly — without the complexity.
                    </p>
                </div>

                {/* Mission & Vision */}
                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="bg-card/50 border-border/50 backdrop-blur-sm animate-slideUp animate-delay-300">
                            <CardContent className="p-8">
                                <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                                    <Target className="w-7 h-7 text-blue-500" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    To provide accessible, real-time server monitoring tools that help
                                    businesses of all sizes maintain peak performance and uptime. We believe
                                    every team deserves enterprise-grade monitoring without the enterprise
                                    price tag.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 border-border/50 backdrop-blur-sm animate-slideUp animate-delay-400">
                            <CardContent className="p-8">
                                <div className="w-14 h-14 bg-violet-500/10 rounded-xl flex items-center justify-center mb-6">
                                    <Eye className="w-7 h-7 text-violet-500" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    A world where system downtime is a thing of the past. We envision a
                                    future where every server is monitored intelligently, every anomaly is
                                    detected early, and every team can respond before issues become outages.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Values Section */}
                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 mb-16 animate-slideUp animate-delay-500">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Our Core <span className="gradient-text-primary">Values</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            The principles that guide everything we build
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Shield, title: "Reliability", description: "99.9% uptime guarantee with redundant monitoring systems", color: "text-green-500", bg: "bg-green-500/10" },
                            { icon: Zap, title: "Speed", description: "Sub-second metrics collection and real-time alerting", color: "text-amber-500", bg: "bg-amber-500/10" },
                            { icon: Heart, title: "Simplicity", description: "Intuitive dashboards that anyone on the team can use", color: "text-rose-500", bg: "bg-rose-500/10" },
                            { icon: Globe, title: "Openness", description: "Transparent practices, open APIs, and community-driven development", color: "text-blue-500", bg: "bg-blue-500/10" },
                        ].map((value, index) => (
                            <Card key={index} className="bg-card/30 border-border/50 backdrop-blur-sm hover:bg-card/50 transition-all duration-300">
                                <CardContent className="p-6 text-center">
                                    <div className={`w-12 h-12 ${value.bg} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                                        <value.icon className={`w-6 h-6 ${value.color}`} />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* What We Do */}
                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 mb-16 animate-slideUp animate-delay-600">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            What We <span className="gradient-text-primary">Do</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Comprehensive monitoring solutions for modern infrastructure
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Cpu, title: "Real-time Metrics", description: "Monitor CPU, memory, disk, and network in real-time with sub-second granularity. Get instant visibility into your server health.", color: "text-blue-500", bg: "bg-blue-500/10" },
                            { icon: Activity, title: "Intelligent Alerts", description: "Receive notifications before issues escalate. Our smart alerting system learns your patterns and alerts you to anomalies.", color: "text-green-500", bg: "bg-green-500/10" },
                            { icon: Code, title: "Developer-First", description: "Built with developers in mind. RESTful APIs, WebSocket support, and integrations with your existing tools and workflows.", color: "text-violet-500", bg: "bg-violet-500/10" },
                        ].map((item, index) => (
                            <Card key={index} className="bg-card/30 border-border/50 backdrop-blur-sm hover:bg-card/50 transition-all duration-300">
                                <CardContent className="p-8">
                                    <div className={`w-14 h-14 ${item.bg} rounded-xl flex items-center justify-center mb-6`}>
                                        <item.icon className={`w-7 h-7 ${item.color}`} />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="relative z-10 w-full max-w-4xl mx-auto px-4 mb-16 animate-slideUp animate-delay-700">
                    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                        <CardContent className="p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                                {[
                                    { value: "99.9%", label: "Uptime", icon: Shield, color: "text-green-500" },
                                    { value: "24/7", label: "Monitoring", icon: Activity, color: "text-blue-500" },
                                    { value: "<1s", label: "Latency", icon: Zap, color: "text-amber-500" },
                                    { value: "∞", label: "Scalability", icon: Server, color: "text-violet-500" },
                                ].map((stat, index) => (
                                    <div key={index}>
                                        <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                                        <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Team Section */}
                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 mb-16 animate-slideUp animate-delay-700">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Meet the <span className="gradient-text-primary">Team</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Passionate engineers dedicated to building the best monitoring platform
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: "Dafa", role: "Lead Developer", avatar: "D", color: "from-blue-500 to-cyan-500" },
                            { name: "Watchtower Team", role: "Engineering", avatar: "W", color: "from-violet-500 to-purple-500" },
                            { name: "Community", role: "Contributors", avatar: "C", color: "from-green-500 to-emerald-500" },
                        ].map((member, index) => (
                            <Card key={index} className="bg-card/30 border-border/50 backdrop-blur-sm hover:bg-card/50 transition-all duration-300">
                                <CardContent className="p-8 text-center">
                                    <div className={`w-20 h-20 bg-gradient-to-br ${member.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold`}>
                                        {member.avatar}
                                    </div>
                                    <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                                    <p className="text-sm text-muted-foreground">{member.role}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="relative z-10 w-full max-w-4xl mx-auto px-4 mb-16 animate-slideUp animate-delay-700">
                    <Card className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 border-primary/20 backdrop-blur-sm">
                        <CardContent className="p-12 text-center">
                            <Award className="w-12 h-12 text-primary mx-auto mb-6" />
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Ready to get started?
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                                Join teams who trust Watchtower to keep their servers running at peak performance.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-500 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                                >
                                    <Link to="/dashboard">
                                        Start Monitoring <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="lg"
                                    className="px-8 py-6 text-lg font-semibold border-2 hover:bg-card transition-all duration-300"
                                >
                                    <Link to="/contact">Contact Us</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PublicLayout>
    );
}
