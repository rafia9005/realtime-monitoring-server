import PublicLayout from "@/components/PublicLayout";
import { useLanguage } from "@/lib/LanguageContext";
import { Info, Target, Shield, Zap, LayoutDashboard, Cpu, Network } from "lucide-react";

export default function About() {
    const { t } = useLanguage();

    const tRole = (role: string) => {
        const keyMap: Record<string, string> = {
            "Website Engineer": "about.team.roles.webEngineer",
            "Wordpress Dev": "about.team.roles.wordpressDev",
            "Model Maker": "about.team.roles.modelMaker",
            "Lead": "about.team.roles.lead",
            "Lead Investigator": "about.team.roles.leadInvestigator",
            "Web Developer": "about.team.roles.webDev"
        };
        const key = keyMap[role];
        return key ? t(key) : role;
    };

    const tLabel = (label: string) => {
        const keyMap: Record<string, string> = {
            "SUSPECT #1": "about.team.labels.suspect1",
            "SUSPECT": "about.team.labels.suspect",
            "WITNESS": "about.team.labels.witness",
            "ACCOMPLICE": "about.team.labels.accomplice",
            "MASTERMIND": "about.team.labels.mastermind",
            "INFORMANT": "about.team.labels.informant",
            "MISSING": "about.team.labels.missing",
            "TOP SECRET": "about.team.labels.topSecret",
            "UNDER COVER": "about.team.labels.underCover",
            "WANTED": "about.team.labels.wanted",
            "SOLVED": "about.team.labels.solved",
            "URGENT": "about.team.labels.urgent"
        };
        const key = keyMap[label];
        return key ? t(key) : label;
    };

    return (
        <PublicLayout>
            <div className="w-full relative overflow-hidden pt-32 pb-40">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-32">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-muted/40 backdrop-blur-md border border-border/50 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <Info className="w-4 h-4 text-primary" />
                            <span className="text-xs font-black tracking-[0.2em] uppercase text-foreground/80">
                                {t('about.genesis')}
                            </span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-foreground mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
                            {t('about.title')} <br />
                            <span className="text-muted-foreground/30">{t('about.subtitle')}</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                            {t('about.desc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-40">
                        <div className="accent-card accent-card-indigo group p-12 border border-border/40 rounded-[3rem] bg-card/10 hover:bg-card transition-all duration-700">
                            <Target className="w-12 h-12 text-indigo-500 mb-8" />
                            <h3 className="text-3xl font-bold mb-6 tracking-tight">
                                {t('about.mission.title')}
                            </h3>
                            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                                {t('about.mission.desc')}
                            </p>
                        </div>
                        <div className="accent-card accent-card-fuchsia group p-12 border border-border/40 rounded-[3rem] bg-card/10 hover:bg-card transition-all duration-700">
                            <Shield className="w-12 h-12 text-fuchsia-500 mb-8" />
                            <h3 className="text-3xl font-bold mb-6 tracking-tight">
                                {t('about.values.title')}
                            </h3>
                            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                                {t('about.values.desc')}
                            </p>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto mb-24">
                        <div className="text-center mb-24">
                            <h2 className="text-4xl font-bold tracking-tight">
                                {t('about.architecture.title')}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { icon: Cpu, label: t("about.architecture.items.lowOverhead"), value: "< 1%", unit: t("about.architecture.items.cpuUsage"), color: "text-indigo-500", accent: "indigo" },
                                { icon: Network, label: t("about.architecture.items.globalReach"), value: "Real-time", unit: t("about.architecture.items.telemetry"), color: "text-teal-500", accent: "teal" },
                                { icon: Zap, label: t("about.architecture.items.fastAlerts"), value: "< 5s", unit: t("about.architecture.items.notification"), color: "text-rose-500", accent: "rose" },
                                { icon: LayoutDashboard, label: t("about.architecture.items.modernUi"), value: "Zen", unit: t("about.architecture.items.uxDesign"), color: "text-blue-500", accent: "blue" }
                            ].map((item, i) => (
                                <div key={i} className={`accent-card accent-card-${item.accent} flex flex-col items-center p-10 border border-border/30 rounded-[2.5rem] bg-muted/10`}>
                                    <item.icon className={`w-8 h-8 ${item.color} mb-6`} />
                                    <div className="text-4xl font-bold tracking-tighter mb-1">{item.value}</div>
                                    <div className={`text-[10px] font-black tracking-[0.2em] uppercase ${item.color}`}>{item.label}</div>
                                    <div className="text-[10px] font-medium text-muted-foreground/60 mt-1 uppercase tracking-wide">{item.unit}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Team Section (Detective Board) */}
                    <div className="relative z-10 w-full max-w-6xl mx-auto px-4 mb-24 animate-slideUp animate-delay-700">
                        <div className="text-center mb-16 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-red-500/5 blur-3xl rounded-full" />
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 font-serif tracking-tight relative">
                                <span className="inline-block border-b-4 border-red-600 pb-2">
                                    {t('about.team.title')}
                                </span>
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-mono text-sm uppercase tracking-widest mt-6">
                                {t('about.team.classified')}
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
                                    <span className="text-red-600 font-bold text-2xl font-serif uppercase border-2 border-red-600 p-1 rotate-3">
                                        {tLabel("WANTED")}
                                    </span>
                                    <span className="text-zinc-800 text-xs text-center mt-3 font-mono">
                                        {t('about.team.wantedDesc')}
                                    </span>
                                </div>

                                <div className="absolute top-[55%] right-[8%] w-56 h-72 bg-[#e5e5f7] rounded-sm shadow-md rotate-3 z-0 pointer-events-none overflow-hidden border border-zinc-300 opacity-90">
                                    <div className="w-full h-8 bg-zinc-300 mb-4 flex items-center px-3">
                                        <span className="text-xs font-mono text-black/60 font-bold">
                                            {t('about.team.case')}
                                        </span>
                                    </div>
                                    <div className="px-5 space-y-3">
                                        <div className="w-full h-2 bg-black/10 rounded" />
                                        <div className="w-3/4 h-2 bg-black/10 rounded" />
                                        <div className="w-5/6 h-2 bg-black/10 rounded" />
                                        <div className="mt-12 w-32 h-32 border-[6px] border-red-600/60 rounded-full mx-auto flex items-center justify-center rotate-[-15deg]">
                                            <span className="text-red-600/70 font-black text-2xl tracking-widest border-y-4 border-red-600/70 py-1">
                                                {tLabel("SOLVED")}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute bottom-[10%] right-[35%] w-32 h-16 bg-white shadow-sm rotate-[-8deg] flex items-center justify-center z-0 border border-zinc-200">
                                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-4 bg-white/50 rotate-[45deg] shadow-sm" />
                                    <span className="font-mono text-sm font-bold text-red-600">
                                        {tLabel("URGENT")}
                                    </span>
                                </div>

                                {[
                                    { name: "Ahmad Rafii", role: "Website Engineer", image: "https://media.licdn.com/dms/image/v2/D5603AQH-748QtWnfLQ/profile-displayphoto-scale_400_400/B56Zhb.woSHkAo-/0/1753889838875?e=1779926400&v=beta&t=Aw52KLnisd9j_yFW_Lfws9hQzI4ClCGYN0cqpIZHZFI", rotation: "-rotate-6", posX: "12%", posY: "16%", label: "SUSPECT #1", labelColor: "bg-red-600 text-white border-red-800" },
                                    { name: "Andina Stevy", role: "Wordpress Dev", image: "https://monitor.scholair.my.id/img/team/stevy.jpeg", rotation: "rotate-3", posX: "85%", posY: "18%", label: "WITNESS", labelColor: "bg-yellow-400 text-black border-yellow-600" },
                                    { name: "Afriza Nugraha", role: "Model Maker", image: "https://monitor.scholair.my.id/img/team/afriza.jpeg", rotation: "-rotate-3", posX: "82%", posY: "48%", label: "ACCOMPLICE", labelColor: "bg-black text-white border-zinc-700" },
                                    { name: "Dafa", role: "Lead", image: "https://media.licdn.com/dms/image/v2/D5603AQF6GzKG8N6v3A/profile-displayphoto-scale_400_400/B56ZtcCr_VJIAg-/0/1766775769217?e=1779926400&v=beta&t=BnIVnuDzTjIiAOEiPdBRsDfSxkHsZyIBAt37BowJfAM", rotation: "rotate-1", posX: "50%", posY: "20%", label: "MASTERMIND", labelColor: "bg-red-700 text-white border-red-900" },
                                    { name: "Chelsea Meilany", role: "Wordpress Dev", image: "https://monitor.scholair.my.id/img/team/chelsea.jpeg", rotation: "-rotate-6", posX: "15%", posY: "55%", label: "INFORMANT", labelColor: "bg-blue-600 text-white border-blue-800" },
                                    { name: "Dhinna Olivia", role: "Wordpress Dev", image: "https://monitor.scholair.my.id/img/team/dhinna.jpeg", rotation: "rotate-2", posX: "50%", posY: "72%", label: "MISSING", labelColor: "bg-red-600 text-white border-red-800" },
                                    { name: "Amelia Salsa", role: "Model Maker", image: "https://monitor.scholair.my.id/img/team/amel.jpeg", rotation: "-rotate-3", posX: "32%", posY: "75%", label: "TOP SECRET", labelColor: "bg-black text-white border-zinc-700" },
                                    { name: "Eric Aditya", role: "Model Maker", image: "https://monitor.scholair.my.id/img/team/eric.jpeg", rotation: "rotate-6", posX: "68%", posY: "70%", label: "UNDER COVER", labelColor: "bg-yellow-500 text-black border-yellow-700" },
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
                                                    {tLabel(member.label)}
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
                                                        {tRole(member.role)}
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
                                    { name: "Dhinna Olivia", role: "Wordpress Dev", image: "https://monitor.scholair.my.id/img/team/dhinna.jpeg", rotation: "-rotate-1", label: "MISSING" },
                                    { name: "Andina Stevy", role: "Wordpress Dev", image: "https://monitor.scholair.my.id/img/team/stevy.jpeg", rotation: "rotate-3", label: "WITNESS" },
                                    { name: "Chelsea Meilany", role: "Wordpress Dev", image: "https://monitor.scholair.my.id/img/team/chelsea.jpeg", rotation: "-rotate-3", label: "INFORMANT" },
                                    { name: "Afriza Nugraha", role: "Model Maker", image: "https://monitor.scholair.my.id/img/team/afriza.jpeg", rotation: "rotate-1", label: "ACCOMPLICE" },
                                    { name: "Eric Aditya", role: "Model Maker", image: "https://monitor.scholair.my.id/img/team/eric.jpeg", rotation: "-rotate-2", label: "UNDER COVER" },
                                    { name: "Amelia Salsa", role: "Model Maker", image: "https://monitor.scholair.my.id/img/team/amel.jpeg", rotation: "rotate-2", label: "TOP SECRET" },
                                ].map((member, index) => (
                                    <div
                                        key={index}
                                        className={`relative w-full bg-[#fdfdfd] p-2 pb-10 shadow-md ${member.rotation} border border-zinc-200 mt-4`}
                                    >
                                        {/* Tape */}
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/60 backdrop-blur-sm border border-white/20 shadow-sm rotate-2 z-40" />

                                        {/* Label */}
                                        <div className="absolute -right-2 -top-2 bg-red-600 text-white px-1 py-0.5 text-[8px] font-black tracking-widest uppercase rotate-12 shadow-sm border border-dashed border-red-800 z-20">
                                            {tLabel(member.label)}
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
                                                {tRole(member.role)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
