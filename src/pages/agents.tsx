import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Server,
  RefreshCw,
  Trash2,
  Activity,
  Plus,
  CheckCircle,
  Cpu,
  ShieldCheck,
  Signal,
} from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";

interface Agent {
  id: string;
  name: string;
  host: string;
  hostname: string;
  ip_address: string;
  status: string;
  last_seen: string;
  version: string;
  tags?: string[];
  description?: string;
  created_at: string;
  updated_at: string;
}

export default function AgentsPage() {
  const { t } = useLanguage();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addingAgent, setAddingAgent] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: "",
    host: "",
    tags: "",
    description: "",
  });
  const [createdAgent, setCreatedAgent] = useState<Agent | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/v1/agents`);
      if (!response.ok) {
        throw new Error("Failed to fetch agents");
      }
      const result = await response.json();
      setAgents(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const deleteAgent = async (id: string) => {
    if (!confirm(t('agents.alert.confirmDelete'))) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/agents/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(t('agents.alert.deleteFailed'));
      }
      await fetchAgents();
    } catch (err) {
      alert(err instanceof Error ? err.message : t('agents.alert.deleteFailed'));
    }
  };

  const addAgent = async () => {
    if (!newAgent.name || !newAgent.host) {
      alert(t('agents.alert.requiredFields'));
      return;
    }

    try {
      setAddingAgent(true);
      const tagsArray = newAgent.tags
        ? newAgent.tags.split(",").map((t) => t.trim()).filter((t) => t)
        : [];

      const response = await fetch(`${API_BASE_URL}/api/v1/agents/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newAgent.name,
          host: newAgent.host,
          tags: tagsArray,
          description: newAgent.description,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || t('agents.alert.addFailed'));
      }

      const result = await response.json();
      setCreatedAgent(result.data);
      setShowInstructions(true);
      
      setNewAgent({
        name: "",
        host: "",
        tags: "",
        description: "",
      });

      await fetchAgents();
    } catch (err) {
      alert(err instanceof Error ? err.message : t('agents.alert.addFailed'));
    } finally {
      setAddingAgent(false);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setShowInstructions(false);
    setCreatedAgent(null);
  };

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('agents.card.justNow');
    if (diffMins < 60) return t('agents.card.minsAgo', { count: diffMins });
    if (diffHours < 24) return t('agents.card.hoursAgo', { count: diffHours });
    return t('agents.card.daysAgo', { count: diffDays });
  };

  const getStatusColor = (status: string, lastSeen: string) => {
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins > 5) {
      return { 
        color: "text-zinc-500", 
        bg: "bg-zinc-500/10", 
        border: "border-zinc-500/20", 
        glow: "shadow-[0_0_10px_rgba(113,113,122,0.3)]",
        label: t('agents.card.terminated')
      };
    }

    if (status === "online") {
      return { 
        color: "text-emerald-500", 
        bg: "bg-emerald-500/10", 
        border: "border-emerald-500/20", 
        glow: "shadow-[0_0_10px_rgba(16,185,129,0.3)]",
        label: t('agents.card.active')
      };
    }
    if (status === "error") {
      return { 
        color: "text-red-500", 
        bg: "bg-red-500/10", 
        border: "border-red-500/20", 
        glow: "shadow-[0_0_10px_rgba(239,68,68,0.3)]",
        label: t('agents.card.fault')
      };
    }
    return { 
      color: "text-zinc-500", 
      bg: "bg-zinc-500/10", 
      border: "border-zinc-500/20", 
      glow: "shadow-[0_0_10px_rgba(113,113,122,0.3)]",
      label: t('agents.card.inactive')
    };
  };

  if (loading && agents.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-8">
          <div className="relative">
             <div className="w-16 h-16 border-4 border-foreground/5 border-t-foreground rounded-full animate-spin" />
             <Activity className="absolute inset-0 m-auto w-6 h-6 text-foreground/20 animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-sm font-black tracking-[0.3em] uppercase opacity-50">{t('agents.loading')}</h2>
            <div className="flex items-center gap-1 justify-center">
              {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-foreground rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}} />)}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-foreground/5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-foreground/5 rounded-xl backdrop-blur-3xl border border-foreground/10">
                <ShieldCheck className="w-5 h-5 opacity-60" />
              </div>
              <span className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40">{t('agents.header.securityTier')}</span>
            </div>
            <h1 className="text-6xl font-black tracking-tight uppercase leading-none">
              {t('agents.header.title')} <span className="text-foreground/20">{t('agents.header.titleHighlight')}</span>
            </h1>
            <p className="text-sm text-muted-foreground font-medium max-w-md uppercase tracking-wider opacity-60">
               {t('agents.header.desc', { count: agents.length })}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <Button 
                onClick={() => fetchAgents()} 
                variant="outline" 
                size="icon" 
                className="h-14 w-14 rounded-2xl border-foreground/10 bg-background/50 backdrop-blur-xl hover:bg-foreground/5 transition-all active:scale-95"
                disabled={loading}
              >
                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
             </Button>
             
             <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-14 px-8 bg-foreground text-background rounded-2xl font-black tracking-[0.1em] uppercase hover:bg-foreground/90 transition-all active:scale-95 shadow-2xl flex gap-3">
                  <Plus className="w-5 h-5" />
                  {t('agents.dialog.trigger')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] bg-background/80 backdrop-blur-3xl border-foreground/10 rounded-[2.5rem] shadow-3xl p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                {!showInstructions ? (
                  <>
                    <DialogHeader className="space-y-4">
                      <DialogTitle className="text-3xl font-black tracking-tighter uppercase">{t('agents.dialog.title')}</DialogTitle>
                      <DialogDescription className="text-xs uppercase tracking-widest font-bold opacity-50">
                        {t('agents.dialog.subtitle')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-8">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">{t('agents.dialog.nodeId')}</Label>
                        <Input
                          id="name"
                          placeholder="e.g. ALPHA-SERVER-01"
                          className="h-14 rounded-2xl border-foreground/5 bg-foreground/[0.03] px-5 font-bold focus-visible:ring-foreground/20"
                          value={newAgent.name}
                          onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="host" className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">{t('agents.dialog.entryPoint')}</Label>
                        <Input
                          id="host"
                          placeholder="10.0.0.1:9090"
                          className="h-14 rounded-2xl border-foreground/5 bg-foreground/[0.03] px-5 font-bold focus-visible:ring-foreground/20"
                          value={newAgent.host}
                          onChange={(e) => setNewAgent({ ...newAgent, host: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="tags" className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">{t('agents.dialog.tags')}</Label>
                          <Input
                            id="tags"
                            placeholder="PROD, EDGE, API"
                            className="h-14 rounded-2xl border-foreground/5 bg-foreground/[0.03] px-5 font-bold focus-visible:ring-foreground/20"
                            value={newAgent.tags}
                            onChange={(e) => setNewAgent({ ...newAgent, tags: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-4">
                      <Button variant="ghost" onClick={closeDialog} className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] flex-1">{t('agents.dialog.abort')}</Button>
                      <Button onClick={addAgent} disabled={addingAgent} className="h-14 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-[10px] px-12 flex-1 shadow-xl">
                        {addingAgent ? t('agents.dialog.processing') : t('agents.dialog.deploy')}
                      </Button>
                    </DialogFooter>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-center text-center space-y-8 py-10">
                      <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                        <CheckCircle className="w-12 h-12 text-emerald-500 animate-in zoom-in duration-500" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-3xl font-black tracking-tighter uppercase">{t('agents.dialog.success')}</h2>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-40">{t('agents.dialog.successSub')}</p>
                      </div>
                      <div className="w-full p-6 bg-foreground/[0.03] rounded-3xl border border-foreground/5 text-left space-y-4">
                         <div className="flex justify-between items-center group">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">ID</span>
                            <span className="font-mono text-sm font-bold tracking-tight">{createdAgent?.name}</span>
                         </div>
                         <div className="flex justify-between items-center group">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">IP</span>
                            <span className="font-mono text-sm font-bold tracking-tight">{createdAgent?.host}</span>
                         </div>
                      </div>
                      <Button onClick={closeDialog} className="w-full h-14 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-[10px] shadow-2xl">{t('agents.dialog.confirmReceipt')}</Button>
                    </div>
                  </>
                )}
              </DialogContent>
             </Dialog>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
            <div className="accent-card accent-card-blue p-6 bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-3xl space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{t('agents.stats.total')}</span>
                <p className="text-3xl font-black">{agents.length}</p>
            </div>
            <div className="accent-card accent-card-emerald p-6 bg-emerald-500/5 backdrop-blur-3xl border border-emerald-500/10 rounded-3xl space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 opacity-60">{t('agents.stats.live')}</span>
                <p className="text-3xl font-black text-emerald-500">{agents.filter(a => a.status === 'online').length}</p>
            </div>
            <div className="accent-card accent-card-gray p-6 bg-zinc-500/5 backdrop-blur-3xl border border-zinc-500/10 rounded-3xl space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{t('agents.stats.stale')}</span>
                <p className="text-3xl font-black opacity-40">{agents.length - agents.filter(a => a.status === 'online').length}</p>
            </div>
            <div className="accent-card accent-card-emerald p-6 bg-primary/5 backdrop-blur-3xl border border-primary/10 rounded-3xl space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-primary">{t('agents.stats.health')}</span>
                <p className="text-3xl font-black text-primary">98.4%</p>
            </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {agents.map((agent) => {
              const statusInfo = getStatusColor(agent.status, agent.last_seen);
              const isStale = (new Date().getTime() - new Date(agent.last_seen).getTime()) / 60000 > 5;
              const accentClass = isStale ? 'accent-card-gray' : agent.status === 'online' ? 'accent-card-emerald' : agent.status === 'error' ? 'accent-card-rose' : 'accent-card-gray';
              return (
                <div key={agent.id} className="group relative">
                   <div className="absolute inset-0 bg-foreground/5 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                   <div className={`accent-card ${accentClass} relative h-full bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-foreground/10 transition-all duration-300`}>
                      
                      <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${statusInfo.border} ${statusInfo.bg} ${statusInfo.glow} transition-all duration-500`}>
                                    <Cpu className={`w-6 h-6 ${statusInfo.color}`} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight uppercase group-hover:text-primary transition-colors">{agent.name}</h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">{agent.hostname}</p>
                                </div>
                            </div>
                            <div className={`text-[9px] font-black tracking-[0.2em] px-3 py-1.5 rounded-full border ${statusInfo.border} ${statusInfo.bg} ${statusInfo.color}`}>
                                {statusInfo.label}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="flex items-end justify-between border-b border-foreground/5 pb-4 group/row">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30">{t('agents.card.entryPointer')}</p>
                                    <p className="text-sm font-bold tracking-tight opacity-70 font-mono italic">{agent.host}</p>
                                </div>
                                <Signal className="w-4 h-4 opacity-10" />
                            </div>
                            <div className="flex items-end justify-between border-b border-foreground/5 pb-4 group/row">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30">{t('agents.card.lastPulsar')}</p>
                                    <p className="text-sm font-bold tracking-tight opacity-70 uppercase italic">{formatDate(agent.last_seen)}</p>
                                </div>
                                <Activity className="w-4 h-4 opacity-10" />
                            </div>
                        </div>

                        {agent.tags && agent.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {agent.tags.map((tag, idx) => (
                              <span key={idx} className="text-[8px] font-black uppercase border border-foreground/10 px-3 py-1 rounded-lg bg-foreground/[0.03] opacity-50 hover:opacity-100 transition-opacity">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-8 mt-auto">
                         <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black tracking-[0.2em] opacity-30">{t('agents.card.ver')}</span>
                            <span className="px-2 py-0.5 bg-foreground/5 rounded-md text-[9px] font-bold opacity-60 italic">{agent.version}</span>
                         </div>
                         <Button
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-red-500 transition-all hover:bg-red-500/5 group-hover:scale-110 active:scale-95 border border-transparent hover:border-red-500/20"
                            onClick={() => deleteAgent(agent.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                      </div>
                   </div>
                </div>
              );
           })}
        </div>

        {/* Empty State */}
        {!error && agents.length === 0 && (
          <div className="relative py-20 bg-card/20 backdrop-blur-3xl rounded-[3rem] border border-dashed border-foreground/10 overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_0%,transparent_70%)]" />
             <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                <div className="w-24 h-24 bg-foreground/5 rounded-[2.5rem] flex items-center justify-center border border-foreground/5 shadow-inner">
                    <Server className="w-10 h-10 opacity-20" />
                </div>
                <div className="space-y-3">
                    <h3 className="text-2xl font-black tracking-tighter uppercase">{t('agents.empty.title')}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-40 max-w-xs mx-auto">{t('agents.empty.desc')}</p>
                </div>
                <Button onClick={() => setDialogOpen(true)} className="h-14 px-10 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl">
                    <Plus className="w-5 h-5 mr-3" />
                    {t('agents.empty.btn')}
                </Button>
             </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
