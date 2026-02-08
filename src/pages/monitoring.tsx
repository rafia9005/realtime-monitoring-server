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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "text-emerald-500";
      case "offline": return "text-gray-500";
      case "error": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  if (loading && !metrics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading metrics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={() => refetch()} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
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
      title: "CPU",
      icon: Cpu,
      value: `${metrics.cpu.usage_percent.toFixed(1)}%`,
      subtitle: `${metrics.cpu.cores} cores • ${metrics.cpu.threads} threads`,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      component: <CPUDetail cpu={metrics.cpu} />,
      fullscreenComponent: <CPUDetail cpu={metrics.cpu} fullscreen />
    },
    {
      id: "memory" as MetricSection,
      title: "Memory",
      icon: MemoryStick,
      value: `${metrics.memory.used_percent.toFixed(1)}%`,
      subtitle: `${formatBytes(metrics.memory.used)} / ${formatBytes(metrics.memory.total)}`,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      component: <MemoryDetail memory={metrics.memory} />,
      fullscreenComponent: <MemoryDetail memory={metrics.memory} fullscreen />
    },
    {
      id: "disk" as MetricSection,
      title: "Disk",
      icon: HardDrive,
      value: `${metrics.disk.length} partitions`,
      subtitle: `${formatBytes(metrics.disk.reduce((acc, d) => acc + d.used, 0))} used`,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      component: <DiskDetail disks={metrics.disk} />,
      fullscreenComponent: <DiskDetail disks={metrics.disk} fullscreen />
    },
    {
      id: "network" as MetricSection,
      title: "Network",
      icon: Network,
      value: `${metrics.network.connections.established} connections`,
      subtitle: `↑ ${formatBytes(metrics.network.bytes_sent)} ↓ ${formatBytes(metrics.network.bytes_recv)}`,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      component: <NetworkDetail network={metrics.network} />,
      fullscreenComponent: <NetworkDetail network={metrics.network} fullscreen />
    }
  ];

  const fullscreenSectionData = sections.find(s => s.id === fullscreenSection);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Monitoring</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {viewMode === "local" ? "Local server" : selectedAgent ? selectedAgent.name : "Select an agent"} - Detailed system metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Server/Agent Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Server className="w-4 h-4 mr-2" />
                  {viewMode === "local" ? "Local Server" : selectedAgent?.name || "Select Agent"}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Monitor Source</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setViewMode("local")}
                  className="cursor-pointer"
                >
                  <Server className="w-4 h-4 mr-2" />
                  Local Server
                  {viewMode === "local" && <Check className="w-4 h-4 ml-auto" />}
                </DropdownMenuItem>
                {agents.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Remote Agents</DropdownMenuLabel>
                    {agents.map((agent) => (
                      <DropdownMenuItem
                        key={agent.id}
                        onClick={() => {
                          setViewMode("agents");
                          selectAgent(agent.id);
                        }}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className={`w-2 h-2 rounded-full ${agent.status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          <span className="truncate">{agent.name}</span>
                        </div>
                        {viewMode === "agents" && selectedAgent?.id === agent.id && (
                          <Check className="w-4 h-4 ml-2" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                {agents.length === 0 && viewMode === "agents" && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No agents available
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Live
            </Badge>
            <Button onClick={() => refetch()} size="sm" variant="ghost">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Agent Info Banner (only for agent mode) */}
        {viewMode === "agents" && selectedAgent && (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${selectedAgent.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="font-medium">{selectedAgent.name}</span>
                  <Badge variant="secondary" className={getStatusColor(selectedAgent.status)}>
                    {selectedAgent.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedAgent.hostname} • {selectedAgent.ip_address}
                </div>
              </div>
              {agentMetrics && (
                <div className="text-xs text-muted-foreground">
                  Last update: {new Date(agentMetrics.received_at).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Collapsible Sections */}
        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.id} className="rounded-lg border border-border bg-card overflow-hidden">
              {/* Section Header */}
              <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center gap-3 flex-1"
                >
                  <div className={`p-2 rounded-lg ${section.bgColor}`}>
                    <section.icon className={`w-5 h-5 ${section.color}`} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.subtitle}</p>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-semibold tabular-nums ${section.color}`}>
                    {section.value}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullscreenSection(section.id);
                    }}
                  >
                    <Maximize2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <button onClick={() => toggleSection(section.id)}>
                    {expandedSections.includes(section.id) ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Section Content */}
              {expandedSections.includes(section.id) && (
                <div className="border-t border-border">
                  {section.component}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreenSection && fullscreenSectionData && (
        <div className="fixed inset-0 z-50 bg-background">
          {/* Fullscreen Header */}
          <div className="sticky top-0 z-10 border-b border-border bg-background">
            <div className="flex items-center justify-between p-3 md:p-4 gap-2 md:gap-4">
              <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                <div className={`p-1.5 md:p-2 rounded-lg ${fullscreenSectionData.bgColor} flex-shrink-0`}>
                  <fullscreenSectionData.icon className={`w-4 h-4 md:w-5 md:h-5 ${fullscreenSectionData.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base md:text-xl font-semibold truncate">{fullscreenSectionData.title}</h2>
                  <p className="text-xs md:text-sm text-muted-foreground truncate hidden sm:block">{fullscreenSectionData.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 hidden sm:inline-flex">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                  Live
                </Badge>
                <span className={`text-base md:text-2xl font-bold tabular-nums ${fullscreenSectionData.color}`}>
                  {fullscreenSectionData.value}
                </span>
                <Button onClick={() => refetch()} size="sm" variant="ghost" className="hidden sm:inline-flex">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 md:h-10 md:w-10"
                  onClick={() => setFullscreenSection(null)}
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Fullscreen Content */}
          <div className="overflow-auto h-[calc(100vh-57px)] md:h-[calc(100vh-73px)]">
            <div className="max-w-6xl mx-auto px-2 md:px-0">
              {fullscreenSectionData.fullscreenComponent}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
