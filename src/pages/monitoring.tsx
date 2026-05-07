import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
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
  Check
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

type MetricSection = "cpu" | "memory" | "disk" | "network";

export default function Monitoring() {
  const { id: agentIdFromUrl } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
        <div className="flex items-center justify-center h-[60vh] font-mono">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-primary animate-pulse">[</span>
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-primary animate-pulse">]</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">POLLING_TELEMETRY_DATA...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh] font-mono">
          <div className="text-center space-y-4 border border-destructive/30 p-8 bg-destructive/5 max-w-md">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-[10px] uppercase font-bold text-destructive tracking-[0.2em]">IO_CONNECTION_FAILURE</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button onClick={() => refetch()} size="sm" variant="outline" className="rounded-none border-destructive/30 text-destructive uppercase text-[10px] tracking-widest">
              RETRY_BUFFER_PULL
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
      title: "CPU_UNIT",
      icon: Cpu,
      value: `${metrics.cpu.usage_percent.toFixed(1)}%`,
      subtitle: `${metrics.cpu.cores}C / ${metrics.cpu.threads}T`,
      color: "text-primary",
      bgColor: "bg-primary/5",
      component: <CPUDetail cpu={metrics.cpu} />,
      fullscreenComponent: <CPUDetail cpu={metrics.cpu} fullscreen />
    },
    {
      id: "memory" as MetricSection,
      title: "MEM_UNIT",
      icon: MemoryStick,
      value: `${metrics.memory.used_percent.toFixed(1)}%`,
      subtitle: `${formatBytes(metrics.memory.used)} / ${formatBytes(metrics.memory.total)}`,
      color: "text-primary",
      bgColor: "bg-primary/5",
      component: <MemoryDetail memory={metrics.memory} />,
      fullscreenComponent: <MemoryDetail memory={metrics.memory} fullscreen />
    },
    {
      id: "disk" as MetricSection,
      title: "DISK_UNIT",
      icon: HardDrive,
      value: `NODE_0${metrics.disk.length}`,
      subtitle: `${formatBytes(metrics.disk.reduce((acc, d) => acc + d.used, 0))} USED`,
      color: "text-primary",
      bgColor: "bg-primary/5",
      component: <DiskDetail disks={metrics.disk} />,
      fullscreenComponent: <DiskDetail disks={metrics.disk} fullscreen />
    },
    {
      id: "network" as MetricSection,
      title: "NET_UNIT",
      icon: Network,
      value: `CONN_0${metrics.network.connections.established}`,
      subtitle: `TX: ${formatBytes(metrics.network.bytes_sent)} RX: ${formatBytes(metrics.network.bytes_recv)}`,
      color: "text-primary",
      bgColor: "bg-primary/5",
      component: <NetworkDetail network={metrics.network} />,
      fullscreenComponent: <NetworkDetail network={metrics.network} fullscreen />
    }
  ];

  const fullscreenSectionData = sections.find(s => s.id === fullscreenSection);

  return (
    <DashboardLayout>
      <div className="space-y-6 font-mono">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase tracking-widest mb-1">
              <span className="text-primary">●</span> TELEMETRY_STREAM
            </div>
            <h1 className="text-2xl font-bold tracking-tighter uppercase">Monitoring</h1>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
              {viewMode === "local" ? "LOCALHOST" : selectedAgent ? `NODE::${selectedAgent.name}` : "UNSET_NODE"} // REAL-TIME_METRICS
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-none border-border font-bold uppercase text-[10px] tracking-widest px-4">
                  <Server className="w-3 h-3 mr-2" />
                  {viewMode === "local" ? "LOCAL_SRC" : selectedAgent?.name || "SEL_NODE"}
                  <ChevronDown className="w-3 h-3 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-none border-border font-mono text-[10px]">
                <DropdownMenuLabel className="uppercase tracking-[0.2em] opacity-50">SRC_INDEX</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem 
                  onClick={() => setViewMode("local")}
                  className="cursor-pointer rounded-none"
                >
                  LOCAL_SERVER
                  {viewMode === "local" && <Check className="w-3 h-3 ml-auto" />}
                </DropdownMenuItem>
                {agents.length > 0 && (
                  <>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuLabel className="uppercase tracking-[0.2em] opacity-50">NODE_AGENTS</DropdownMenuLabel>
                    {agents.map((agent) => (
                      <DropdownMenuItem
                        key={agent.id}
                        onClick={() => {
                          setViewMode("agents");
                          selectAgent(agent.id);
                        }}
                        className="cursor-pointer rounded-none"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'online' ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                          <span className="truncate">{agent.name.toUpperCase()}</span>
                        </div>
                        {viewMode === "agents" && selectedAgent?.id === agent.id && (
                          <Check className="w-3 h-3 ml-2" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden sm:flex flex-col items-end">
              <Badge variant="outline" className="rounded-none text-emerald-500 border-emerald-500/30 bg-emerald-500/5 text-[10px] px-2 py-0">
                L_STREAM_01
              </Badge>
            </div>
            <Button onClick={() => refetch()} size="icon" variant="ghost" className="h-10 w-10 border border-border rounded-none">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="border border-border bg-card/30">
              {/* Section Header */}
              <div className="flex items-center justify-between p-4 group transition-colors border-b border-transparent hover:border-border/50">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center gap-4 flex-1"
                >
                  <div className={`w-10 h-10 border border-border flex items-center justify-center ${section.bgColor}`}>
                    <section.icon className={`w-4 h-4 ${section.color}`} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xs font-bold uppercase tracking-widest">{section.title}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tight">{section.subtitle}</p>
                  </div>
                </button>
                <div className="flex items-center gap-6">
                  <span className="text-xl font-bold tabular-nums tracking-tighter">
                    {section.value}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-none border border-transparent hover:border-border"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullscreenSection(section.id);
                      }}
                    >
                      <Maximize2 className="w-3 h-3 text-muted-foreground" />
                    </Button>
                    <button 
                      onClick={() => toggleSection(section.id)}
                      className="h-8 w-8 border border-transparent hover:border-border flex items-center justify-center"
                    >
                      {expandedSections.includes(section.id) ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section Content */}
              {expandedSections.includes(section.id) && (
                <div className="border-t border-border bg-background/50">
                  {section.component}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreenSection && fullscreenSectionData && (
        <div className="fixed inset-0 z-50 bg-background font-mono">
          {/* Fullscreen Header */}
          <div className="sticky top-0 z-10 border-b border-border bg-background">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 border border-border flex items-center justify-center bg-primary/5">
                  <fullscreenSectionData.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em]">{fullscreenSectionData.title}</h2>
                  <p className="text-[10px] text-muted-foreground uppercase">{fullscreenSectionData.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-end">
                  <span className="text-[8px] text-muted-foreground uppercase tracking-widest">REALTIME_VAL</span>
                  <span className="text-2xl font-bold tabular-nums tracking-tighter">
                    {fullscreenSectionData.value}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => refetch()} size="icon" variant="ghost" className="h-10 w-10 border border-border rounded-none">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-10 w-10 border border-border rounded-none"
                    onClick={() => setFullscreenSection(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Fullscreen Content */}
          <div className="overflow-auto h-[calc(100vh-64px)] p-6">
            <div className="max-w-7xl mx-auto border border-border bg-card/30">
              {fullscreenSectionData.fullscreenComponent}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
