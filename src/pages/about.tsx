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
            <div className="w-full min-h-[calc(100vh-8rem)] flex flex-col items-center relative overflow-hidden pt-18 md:pt-32">
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

                {/* Team Section (Detective Board) */}
                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 mb-24 animate-slideUp animate-delay-700">
                    <div className="text-center mb-16 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-red-500/5 blur-3xl rounded-full" />
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 font-serif tracking-tight relative">
                            <span className="inline-block border-b-4 border-red-600 pb-2">Meet the Team</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-mono text-sm uppercase tracking-widest mt-6">
                            [CLASSIFIED FILE: The masterminds behind the scenes]
                        </p>
                    </div>

                    <div className="relative w-full h-[850px]">
                        {/* Desktop Cards Container with absolute positioning */}
                        <div className="relative w-full h-full hidden md:block bg-zinc-900/5 border border-zinc-800/20 rounded-xl overflow-hidden shadow-inner">
                            {/* Corkboard Texture/Grid */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                            
                            {/* Random Evidence Marks */}
                            <div className="absolute top-[10%] left-[25%] w-48 h-48 border-4 border-red-500 rounded-full opacity-30 rotate-12 pointer-events-none" />
                            <div className="absolute top-[40%] left-[60%] w-64 h-64 border-4 border-red-500/20 rounded-full pointer-events-none" />
                            <div className="absolute top-[75%] left-[22%] text-8xl text-red-500/10 font-bold -rotate-12 pointer-events-none">?</div>
                            
                            {/* Torn Paper / Evidence Notes */}
                            <div className="absolute top-[25%] left-[5%] w-40 h-40 bg-[#fef08a] shadow-md -rotate-6 p-4 flex flex-col items-center justify-center pointer-events-none z-0 border border-yellow-300">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-white/40 rotate-[10deg] shadow-sm border border-white/20" />
                                <span className="text-red-600 font-bold text-2xl font-serif uppercase border-2 border-red-600 p-1 rotate-3">WANTED</span>
                                <span className="text-zinc-800 text-xs text-center mt-3 font-mono">For building awesome UIs</span>
                            </div>

                            <div className="absolute top-[55%] right-[8%] w-56 h-72 bg-[#e5e5f7] rounded-sm shadow-md rotate-3 z-0 pointer-events-none overflow-hidden border border-zinc-300 opacity-90">
                                <div className="w-full h-8 bg-zinc-300 mb-4 flex items-center px-3">
                                    <span className="text-xs font-mono text-black/60 font-bold">CASE #9942</span>
                                </div>
                                <div className="px-5 space-y-3">
                                    <div className="w-full h-2 bg-black/10 rounded" />
                                    <div className="w-3/4 h-2 bg-black/10 rounded" />
                                    <div className="w-5/6 h-2 bg-black/10 rounded" />
                                    <div className="mt-12 w-32 h-32 border-[6px] border-red-600/60 rounded-full mx-auto flex items-center justify-center rotate-[-15deg]">
                                        <span className="text-red-600/70 font-black text-2xl tracking-widest border-y-4 border-red-600/70 py-1">SOLVED</span>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-[10%] right-[35%] w-32 h-16 bg-white shadow-sm rotate-[-8deg] flex items-center justify-center z-0 border border-zinc-200">
                                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-4 bg-white/50 rotate-[45deg] shadow-sm" />
                                <span className="font-mono text-sm font-bold text-red-600">URGENT</span>
                            </div>

                            {[
                                { name: "Ahmad Rafii", role: "Website Engineer", image: "https://media.licdn.com/dms/image/v2/D5603AQH-748QtWnfLQ/profile-displayphoto-scale_400_400/B56Zhb.woSHkAo-/0/1753889838875?e=1779926400&v=beta&t=Aw52KLnisd9j_yFW_Lfws9hQzI4ClCGYN0cqpIZHZFI", rotation: "-rotate-6", posX: "12%", posY: "16%", label: "SUSPECT #1", labelColor: "bg-red-600 text-white border-red-800" },
                                { name: "Andina Stevy", role: "Wordpress Dev", image: "public/img/team/stevy.jpeg", rotation: "rotate-3", posX: "85%", posY: "18%", label: "WITNESS", labelColor: "bg-yellow-400 text-black border-yellow-600" },
                                { name: "Afriza Nugraha", role: "Model Maker", image: "public/img/team/afriza.jpeg", rotation: "-rotate-3", posX: "82%", posY: "48%", label: "ACCOMPLICE", labelColor: "bg-black text-white border-zinc-700" },
                                { name: "Dafa", role: "Lead", image: "https://media.licdn.com/dms/image/v2/D5603AQF6GzKG8N6v3A/profile-displayphoto-scale_400_400/B56ZtcCr_VJIAg-/0/1766775769217?e=1779926400&v=beta&t=BnIVnuDzTjIiAOEiPdBRsDfSxkHsZyIBAt37BowJfAM", rotation: "rotate-1", posX: "50%", posY: "20%", label: "MASTERMIND", labelColor: "bg-red-700 text-white border-red-900" },
                                { name: "Chelsea Meilany", role: "Wordpress Dev", image: "public/img/team/chelsea.jpeg", rotation: "-rotate-6", posX: "15%", posY: "55%", label: "INFORMANT", labelColor: "bg-blue-600 text-white border-blue-800" },
                                { name: "Dhinna Olivia", role: "Wordpress Dev", image: "public/img/team/dhinna.jpeg", rotation: "rotate-2", posX: "50%", posY: "72%", label: "MISSING", labelColor: "bg-red-600 text-white border-red-800" },
                                { name: "Amelia Salsa", role: "Model Maker", image: "public/img/team/amel.jpeg", rotation: "-rotate-3", posX: "32%", posY: "75%", label: "TOP SECRET", labelColor: "bg-black text-white border-zinc-700" },
                                { name: "Eric Aditya", role: "Model Maker", image: "public/img/team/eric.jpeg", rotation: "rotate-6", posX: "68%", posY: "70%", label: "UNDER COVER", labelColor: "bg-yellow-500 text-black border-yellow-700" },
                            ].map((member, index) => {
                                const isCenterCard = member.name === "Dafa";
                                return (
                                    <div
                                        key={index}
                                        className="absolute w-44 group"
                                        style={{
                                            left: member.posX,
                                            top: member.posY,
                                            transform: `translate(-50%, -50%) ${isCenterCard ? 'scale(1.2)' : ''}`,
                                            zIndex: isCenterCard ? 99 : 10 + index,
                                        }}
                                    >
                                        {/* Masking Tape */}
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/50 backdrop-blur-sm border border-white/20 shadow-sm rotate-2 z-40 opacity-90" />

                                        {/* Push Pin */}
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-red-600 shadow-[2px_4px_4px_rgba(0,0,0,0.4)] border-2 border-red-800 z-50 group-hover:scale-110 transition-transform" />

                                        <div
                                            className={`relative w-full bg-[#fdfdfd] p-3 pb-12 shadow-[2px_4px_12px_rgba(0,0,0,0.2)] group-hover:shadow-[8px_12px_24px_rgba(0,0,0,0.3)] transition-all duration-500 ease-out z-10 ${member.rotation} hover:z-[100] cursor-pointer border border-zinc-200`}
                                        >
                                            {/* Stamp / Label overlay */}
                                            <div className={`absolute -right-6 -top-4 ${member.labelColor} px-2 py-1 text-[10px] font-black tracking-widest uppercase rotate-12 shadow-sm border-2 border-dashed z-20`}>
                                                {member.label}
                                            </div>

                                            {/* Image container */}
                                            <div className="w-full aspect-square bg-zinc-200 overflow-hidden relative border border-zinc-300">
                                                {member.image ? (
                                                    <img 
                                                        src={member.image} 
                                                        alt={member.name} 
                                                        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out grayscale group-hover:grayscale-0 sepia-[.2] contrast-125" 
                                                    />
                                                ) : (
                                                    <span className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-zinc-400 font-serif">
                                                        {member.name.charAt(0)}
                                                    </span>
                                                )}
                                                
                                                {/* Red marker circle overlay on hover */}
                                                <div className="absolute inset-0 border-[4px] border-red-600 rounded-full opacity-0 group-hover:opacity-60 scale-150 group-hover:scale-90 transition-all duration-500 pointer-events-none" />
                                            </div>

                                            {/* Text section in polaroid padding */}
                                            <div className="absolute bottom-4 left-0 right-0 px-3 z-10 flex flex-col items-center">
                                                <h3 className="text-zinc-800 font-bold text-sm leading-tight text-center font-serif">
                                                    {member.name}
                                                </h3>
                                                <p className="text-red-600 text-[9px] uppercase tracking-widest text-center mt-1 font-bold">
                                                    {member.role}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Red Threads (SVG) - On top layer, drawn after cards */}
                            <div className="absolute inset-0 z-40 hidden md:block pointer-events-none">
                                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.5))" }}>
                                    {/* Threads connecting pins to central Dafa card */}
                                    <path d="M 12 4 Q 30 25 50 20" fill="none" stroke="#dc2626" strokeWidth="1.5" vectorEffect="non-scaling-stroke" opacity="0.8" />
                                    <path d="M 85 5 Q 68 25 50 20" fill="none" stroke="#dc2626" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                                    <path d="M 82 34.5 Q 66 35 50 20" fill="none" stroke="#dc2626" strokeWidth="1.5" vectorEffect="non-scaling-stroke" opacity="0.9" />
                                    <path d="M 15 42 Q 32 40 50 20" fill="none" stroke="#dc2626" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                                    <path d="M 50 60 L 50 20" fill="none" stroke="#dc2626" strokeWidth="1.5" vectorEffect="non-scaling-stroke" opacity="0.8" strokeDasharray="2,1" />
                                    <path d="M 32 62 Q 40 45 50 20" fill="none" stroke="#dc2626" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                                    <path d="M 68 58 Q 60 45 50 20" fill="none" stroke="#dc2626" strokeWidth="1.5" vectorEffect="non-scaling-stroke" opacity="0.7" />
                                </svg>
                            </div>
                        </div>

                        {/* Mobile/Tablet Layout - Adapted for Detective Board */}
                        <div className="md:hidden grid grid-cols-2 gap-4 mt-8 relative">
                            {/* Mobile Background Elements */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:10px_10px] opacity-10 pointer-events-none" />
                            
                            {[
                                { name: "Dafa", role: "Lead Investigator", image: "https://media.licdn.com/dms/image/v2/D5603AQF6GzKG8N6v3A/profile-displayphoto-scale_400_400/B56ZtcCr_VJIAg-/0/1766775769217?e=1779926400&v=beta&t=BnIVnuDzTjIiAOEiPdBRsDfSxkHsZyIBAt37BowJfAM", rotation: "-rotate-2", label: "MASTERMIND" },
                                { name: "Ahmad Rafi", role: "Web Developer", image: "https://media.licdn.com/dms/image/v2/D5603AQH-748QtWnfLQ/profile-displayphoto-scale_400_400/B56Zhb.woSHkAo-/0/1753889838875?e=1779926400&v=beta&t=Aw52KLnisd9j_yFW_Lfws9hQzI4ClCGYN0cqpIZHZFI", rotation: "rotate-2", label: "SUSPECT" },
                                { name: "Dhinna Olivia", role: "Wordpress Dev", image: "public/img/team/dhinna.jpeg", rotation: "-rotate-1", label: "MISSING" },
                                { name: "Andina Stevy", role: "Wordpress Dev", image: "public/img/team/stevy.jpeg", rotation: "rotate-3", label: "WITNESS" },
                                { name: "Chelsea Meilany", role: "Wordpress Dev", image: "public/img/team/chelsea.jpeg", rotation: "-rotate-3", label: "INFORMANT" },
                                { name: "Afriza Nugraha", role: "Model Maker", image: "public/img/team/afriza.jpeg", rotation: "rotate-1", label: "ACCOMPLICE" },
                                { name: "Eric Aditya", role: "Model Maker", image: "public/img/team/eric.jpeg", rotation: "-rotate-2", label: "UNDER COVER" },
                                { name: "Amelia Salsa", role: "Model Maker", image: "public/img/team/amel.jpeg", rotation: "rotate-2", label: "TOP SECRET" },
                            ].map((member, index) => (
                                <div
                                    key={index}
                                    className={`relative w-full bg-[#fdfdfd] p-2 pb-10 shadow-md ${member.rotation} border border-zinc-200 mt-4`}
                                >
                                    {/* Tape */}
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/60 backdrop-blur-sm border border-white/20 shadow-sm rotate-2 z-40" />
                                    
                                    {/* Label */}
                                    <div className="absolute -right-2 -top-2 bg-red-600 text-white px-1 py-0.5 text-[8px] font-black tracking-widest uppercase rotate-12 shadow-sm border border-dashed border-red-800 z-20">
                                        {member.label}
                                    </div>

                                    <div className="w-full aspect-square bg-zinc-200 overflow-hidden relative border border-zinc-300">
                                        {member.image ? (
                                            <img src={member.image} alt={member.name} className="absolute inset-0 w-full h-full object-cover" />
                                        ) : (
                                            <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-zinc-400 font-serif">
                                                {member.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute bottom-3 left-0 right-0 px-2 flex flex-col items-center">
                                        <h3 className="text-zinc-800 font-bold text-xs leading-tight text-center font-serif">
                                            {member.name}
                                        </h3>
                                        <p className="text-red-600 text-[8px] uppercase tracking-widest text-center mt-0.5 font-bold">
                                            {member.role}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
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
