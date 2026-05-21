import PublicLayout from "@/components/PublicLayout";
import { Sparkles, Mail, Phone, MessageCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";

export default function Contact() {
    const { t } = useLanguage();

    return (
        <PublicLayout>
            <div className="w-full relative overflow-hidden pt-32 pb-40">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-32">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-muted/40 backdrop-blur-md border border-border/50 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                             <MessageCircle className="w-4 h-4 text-primary" />
                             <span className="text-xs font-black tracking-[0.2em] uppercase text-foreground/80">{t('contact.protocol')}</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-foreground mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
                           {t('contact.title')} <br/>
                           <span className="text-muted-foreground/30">{t('contact.subtitle')}</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                            {t('contact.desc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {[
                            { 
                                icon: Mail, 
                                label: t("contact.methods.email.label"), 
                                value: "projects.watchtower@gmail.com",
                                action: "mailto:projects.watchtower@gmail.com",
                                desc: t("contact.methods.email.desc"),
                                accent: "indigo",
                                color: "text-indigo-500",
                                bgColor: "bg-indigo-500/10"
                            },
                            { 
                                icon: Phone, 
                                label: t("contact.methods.phone.label"), 
                                value: "+62 857-9126-8077",
                                action: "tel:+6285791268077",
                                desc: t("contact.methods.phone.desc"),
                                accent: "teal",
                                color: "text-teal-500",
                                bgColor: "bg-teal-500/10"
                            },
                            { 
                                icon: Globe, 
                                label: t("contact.methods.presence.label"), 
                                value: t("contact.methods.presence.value"),
                                action: "/about",
                                desc: t("contact.methods.presence.desc"),
                                accent: "blue",
                                color: "text-blue-500",
                                bgColor: "bg-blue-500/10"
                            }
                        ].map((method, i) => (
                            <div key={i} className={`accent-card accent-card-${method.accent} group p-10 border border-border/40 rounded-[2.5rem] bg-card/10 hover:bg-card transition-all duration-500`}>
                                <div className={`w-14 h-14 rounded-2xl ${method.bgColor} ${method.color} flex items-center justify-center mb-8 transition-colors duration-500`}>
                                    <method.icon className="w-6 h-6" />
                                </div>
                                <div className={`text-[10px] font-black tracking-[0.2em] uppercase ${method.color} mb-2`}>{method.label}</div>
                                <h3 className="text-xl font-bold mb-4 tracking-tight break-all">{method.value}</h3>
                                <p className="text-muted-foreground font-medium text-sm leading-relaxed mb-8">
                                    {method.desc}
                                </p>
                                <Button asChild variant="outline" className="w-full rounded-xl border-border/50 hover:bg-muted font-bold">
                                    <a href={method.action}>{t('contact.methods.btnInit')}</a>
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="accent-card accent-card-orange mt-40 max-w-4xl mx-auto p-12 rounded-[3.5rem] border border-border/40 bg-muted/10 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                           <Sparkles className="w-8 h-8 text-orange-500/20" />
                        </div>
                        <div className="flex flex-col md:flex-row gap-12 items-center">
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold tracking-tight mb-4">{t('contact.enterprise.title')}</h2>
                                <p className="text-muted-foreground font-medium leading-relaxed">
                                    {t('contact.enterprise.desc')}
                                </p>
                            </div>
                            <Button 
                                size="lg" 
                                className="rounded-2xl h-16 px-10 bg-foreground text-background font-bold text-lg hover:scale-105 transition-all cursor-pointer"
                                onClick={() => window.location.href = "mailto:projects.watchtower@gmail.com?subject=Enterprise Proposal Request"}
                            >
                                {t('contact.enterprise.btnRequest')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
