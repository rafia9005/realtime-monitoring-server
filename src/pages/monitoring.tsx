import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Maximize2,
  X,
  Server,
  Check,
  Activity
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSystemMetrics } from "@/lib/hooks/useSystemMetrics";
import { useAgentMetrics } from "@/lib/hooks/useAgentMetrics";
import { CPUDetail } from "@/components/metrics/CPUDetail";
import { MemoryDetail } from "@/components/metrics/MemoryDetail";
import { DiskDetail } from "@/components/metrics/DiskDetail";
import { NetworkDetail } from "@/components/metrics/NetworkDetail";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/LanguageContext";

type MetricSection = "cpu" | "memory" | "disk" | "network";

export default function Monitoring() {
  const { id: agentIdFromUrl } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<"local" | "agents">(agentIdFromUrl ? "agents" : "local");
  const { data: localMetrics, loading: localLoading, error: localError, refetch: refetchLocal } = useSystemMetrics(viewMode === "local", 5000);
  const { agents, selectedAgent, metrics: agentMetrics, loading: agentLoading, error: agentError, selectAgent, refetch: refetchAgent } = useAgentMetrics(viewMode === "agents", 5000);
  
  const [expandedSections, setExpandedSections] = useState<MetricSection[]>(["cpu", "memory", "disk", "network"]);
  const [fullscreenSection, setFullscreenSection] = useState<MetricSection | null>(null);

  // Auto-select agent from URL if present
  useEffect(() => {
    if (agentIdFromUrl && agents.length > 0) {
      const agent = agents.find(a => a.id === agentIdFromUrl);
      if (agent) {
        setViewMode("agents");
        selectAgent(agentIdFromUrl);
      } else {
        // Agent not found, redirect to agents page
        navigate("/agents");
      }
    }
  }, [agentIdFromUrl, agents, selectAgent, navigate]);

  // Determine which metrics to display
  const metrics = viewMode === "local" ? localMetrics : (agentMetrics?.metrics || null);
  const loading = viewMode === "local" ? localLoading : agentLoading;
  const error = viewMode === "local" ? localError : agentError;
  const refetch = viewMode === "local" ? refetchLocal : refetchAgent;

  // Handle escape key to close fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFullscreenSection(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Prevent body scroll when fullscreen is open
  useEffect(() => {
    if (fullscreenSection) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullscreenSection]);

  const toggleSection = (section: MetricSection) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (loading && !metrics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t('monitoring.loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4 border border-slate-200 dark:border-slate-800 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl max-w-md">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('monitoring.error.title')}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
            <Button onClick={() => refetch()} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg mt-4">
              {t('monitoring.error.retry')}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!metrics) return null;

  const sections = [
    {
      id: "cpu" as MetricSection,
      title: t('monitoring.cpu.title'),
      icon: Cpu,
      value: `${metrics.cpu.usage_percent.toFixed(1)}%`,
      subtitle: `${metrics.cpu.cores} ${t('monitoring.cpu.cores')} / ${metrics.cpu.threads} ${t('monitoring.cpu.threads')}`,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10 border border-indigo-500/20",
      component: <CPUDetail cpu={metrics.cpu} />,
      fullscreenComponent: <CPUDetail cpu={metrics.cpu} fullscreen />
    },
    {
      id: "memory" as MetricSection,
      title: t('monitoring.memory.title'),
      icon: MemoryStick,
      value: `${metrics.memory.used_percent.toFixed(1)}%`,
      subtitle: `${formatBytes(metrics.memory.used)} / ${formatBytes(metrics.memory.total)}`,
      color: "text-fuchsia-500",
      bgColor: "bg-fuchsia-500/10 border border-fuchsia-500/20",
      component: <MemoryDetail memory={metrics.memory} />,
      fullscreenComponent: <MemoryDetail memory={metrics.memory} fullscreen />
    },
    {
      id: "disk" as MetricSection,
      title: t('monitoring.disk.title'),
      icon: HardDrive,
      value: `${metrics.disk.length} Disk`,
      subtitle: `${formatBytes(metrics.disk.reduce((acc, d) => acc + d.used, 0))} ${t('monitoring.disk.used')}`,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10 border border-amber-500/20",
      component: <DiskDetail disks={metrics.disk} />,
      fullscreenComponent: <DiskDetail disks={metrics.disk} fullscreen />
    },
    {
      id: "network" as MetricSection,
      title: t('monitoring.network.title'),
      icon: Network,
      value: `${metrics.network.connections.established} ${t('monitoring.network.conn')}`,
      subtitle: `↑ ${formatBytes(metrics.network.bytes_sent)} ↓ ${formatBytes(metrics.network.bytes_recv)}`,
      color: "text-teal-500",
      bgColor: "bg-teal-500/10 border border-teal-500/20",
      component: <NetworkDetail network={metrics.network} />,
      fullscreenComponent: <NetworkDetail network={metrics.network} fullscreen />
    }
  ];

  const fullscreenSectionData = sections.find(s => s.id === fullscreenSection);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-foreground/5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-foreground/5 rounded-xl backdrop-blur-3xl border border-foreground/10">
                <Activity className="w-5 h-5 opacity-60 text-primary" />
              </div>
              <span className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40 italic">Telemetry Array v4.2</span>
            </div>
            <h1 className="text-6xl font-black tracking-tight uppercase leading-none">
              {t('monitoring.title')}
            </h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono italic">
              {viewMode === "local" ? t('monitoring.serverSelector.localSrc') : selectedAgent ? `Server: ${selectedAgent.name}` : t('monitoring.serverSelector.selectServer')} • {t('monitoring.serverSelector.realtimeUpdates')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-14 px-6 rounded-2xl border-foreground/10 bg-background/50 backdrop-blur-3xl hover:bg-foreground/5 text-xs font-black uppercase tracking-widest transition-all">
                  <Server className="w-4 h-4 mr-2" />
                  {viewMode === "local" ? t('monitoring.serverSelector.localSrc') : selectedAgent?.name || t('monitoring.serverSelector.selectServerShort')}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="font-mono text-xs rounded-2xl border-foreground/10 bg-background/80 backdrop-blur-3xl p-2 min-w-[200px]">
                <DropdownMenuLabel className="uppercase font-black text-[9px] tracking-widest opacity-40 py-2 px-3">{t('monitoring.serverSelector.available')}</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-foreground/5" />
                <DropdownMenuItem 
                  onClick={() => setViewMode("local")}
                  className="rounded-xl focus:bg-foreground/5 focus:text-foreground cursor-pointer uppercase font-black text-[10px] tracking-wider py-2 px-3 flex justify-between"
                >
                  <span>{t('monitoring.serverSelector.localSrc')}</span>
                  {viewMode === "local" && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
                {agents.length > 0 && (
                  <>
                    <DropdownMenuSeparator className="bg-foreground/5" />
                    <DropdownMenuLabel className="uppercase font-black text-[9px] tracking-widest opacity-40 py-2 px-3">Servers</DropdownMenuLabel>
                    {agents.map((agent) => (
                      <DropdownMenuItem
                        key={agent.id}
                        onClick={() => {
                          setViewMode("agents");
                          selectAgent(agent.id);
                        }}
                        className="rounded-xl focus:bg-foreground/5 focus:text-foreground cursor-pointer uppercase font-black text-[10px] tracking-wider py-2 px-3 flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                          <span>{agent.name}</span>
                        </div>
                        {viewMode === "agents" && selectedAgent?.id === agent.id && (
                          <Check className="w-4 h-4" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-2.5 rounded-full backdrop-blur-3xl flex items-center gap-2 h-14">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              {t('monitoring.live')}
            </span>
            <Button onClick={() => refetch()} variant="outline" className="h-14 w-14 rounded-2xl border-foreground/10 bg-background/50 backdrop-blur-3xl hover:bg-foreground/5 transition-all active:scale-95 flex items-center justify-center">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id} className={`accent-card accent-card-${section.id === 'cpu' ? 'indigo' : section.id === 'memory' ? 'fuchsia' : section.id === 'disk' ? 'amber' : 'teal'} bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[2.5rem] overflow-hidden hover:border-foreground/10 transition-all duration-300`}>
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-8 hover:bg-foreground/[0.02] transition-colors"
              >
                <div className="flex items-center gap-6 flex-1">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${section.bgColor}`}>
                    <section.icon className={`w-6 h-6 ${section.color}`} />
                  </div>
                  <div className="text-left space-y-1">
                     <h3 className="text-lg font-black uppercase tracking-tight italic">{section.title}</h3>
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-40 font-mono italic">{section.subtitle}</p>
                  </div>
                </div>
                 <div className="flex items-center gap-6">
                   <span className="text-3xl font-black tracking-tight">
                     {section.value}
                   </span>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-10 w-10 rounded-xl border border-foreground/10 bg-background/50 hover:bg-foreground/5 backdrop-blur-3xl transition-all active:scale-95 flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullscreenSection(section.id);
                      }}
                    >
                      <Maximize2 className="w-4 h-4 text-foreground/60" />
                    </Button>
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-foreground/5 transition-colors">
                      {expandedSections.includes(section.id) ? (
                        <ChevronUp className="w-5 h-5 text-foreground/60" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-foreground/60" />
                      )}
                    </div>
                  </div>
                </div>
              </button>

              {/* Section Content */}
              {expandedSections.includes(section.id) && (
                <div className="border-t border-foreground/5 bg-foreground/[0.01] p-8">
                  {section.component}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreenSection && fullscreenSectionData && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-3xl font-mono">
          {/* Fullscreen Header */}
          <div className="sticky top-0 z-10 border-b border-foreground/5 bg-background/80 backdrop-blur-3xl">
            <div className="flex items-center justify-between h-20 px-8 py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${fullscreenSectionData.bgColor}`}>
                      <fullscreenSectionData.icon className={`w-5 h-5 ${fullscreenSectionData.color}`} />
                    </div>
                    <div>
                      <h2 className="text-base font-black uppercase tracking-tight italic">{fullscreenSectionData.title}</h2>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">{fullscreenSectionData.subtitle}</p>
                    </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">{t('monitoring.currentValue')}</span>
                  <span className="text-2xl font-black tracking-tight">
                    {fullscreenSectionData.value}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={() => refetch()} variant="outline" className="h-12 w-12 rounded-xl border-foreground/10 bg-background/50 hover:bg-foreground/5 backdrop-blur-3xl transition-all active:scale-95 flex items-center justify-center">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button 
                    variant="outline"
                    className="h-12 w-12 rounded-xl border-foreground/10 bg-background/50 hover:bg-foreground/5 backdrop-blur-3xl transition-all active:scale-95 flex items-center justify-center"
                    onClick={() => setFullscreenSection(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Fullscreen Content */}
          <div className="overflow-auto h-[calc(100vh-80px)] p-8">
            <div className="max-w-7xl mx-auto bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[2.5rem] p-8">
              {fullscreenSectionData.fullscreenComponent}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
