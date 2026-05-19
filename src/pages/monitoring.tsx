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
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading metrics...</p>
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
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Connection Error</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
            <Button onClick={() => refetch()} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg mt-4">
              Try Again
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
      title: "Processing Power",
      icon: Cpu,
      value: `${metrics.cpu.usage_percent.toFixed(1)}%`,
      subtitle: `${metrics.cpu.cores} cores / ${metrics.cpu.threads} threads`,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      component: <CPUDetail cpu={metrics.cpu} />,
      fullscreenComponent: <CPUDetail cpu={metrics.cpu} fullscreen />
    },
    {
      id: "memory" as MetricSection,
      title: "Active Memory",
      icon: MemoryStick,
      value: `${metrics.memory.used_percent.toFixed(1)}%`,
      subtitle: `${formatBytes(metrics.memory.used)} / ${formatBytes(metrics.memory.total)}`,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      component: <MemoryDetail memory={metrics.memory} />,
      fullscreenComponent: <MemoryDetail memory={metrics.memory} fullscreen />
    },
    {
      id: "disk" as MetricSection,
      title: "Storage",
      icon: HardDrive,
      value: `${metrics.disk.length} Disk${metrics.disk.length > 1 ? 's' : ''}`,
      subtitle: `${formatBytes(metrics.disk.reduce((acc, d) => acc + d.used, 0))} used`,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      component: <DiskDetail disks={metrics.disk} />,
      fullscreenComponent: <DiskDetail disks={metrics.disk} fullscreen />
    },
    {
      id: "network" as MetricSection,
      title: "Network",
      icon: Network,
      value: `${metrics.network.connections.established} Conn.`,
      subtitle: `↑ ${formatBytes(metrics.network.bytes_sent)} ↓ ${formatBytes(metrics.network.bytes_recv)}`,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      component: <NetworkDetail network={metrics.network} />,
      fullscreenComponent: <NetworkDetail network={metrics.network} fullscreen />
    }
  ];

  const fullscreenSectionData = sections.find(s => s.id === fullscreenSection);

  return (
    <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Detailed Metrics</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              {viewMode === "local" ? "This Computer" : selectedAgent ? `Server: ${selectedAgent.name}` : "Select a Server"} • Real-time updates
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-lg border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium">
                  <Server className="w-4 h-4 mr-2" />
                  {viewMode === "local" ? "This Computer" : selectedAgent?.name || "Select Server"}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-lg border-slate-200 dark:border-slate-800">
                <DropdownMenuLabel>Available</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setViewMode("local")}
                  className="cursor-pointer rounded-md"
                >
                  This Computer
                  {viewMode === "local" && <Check className="w-4 h-4 ml-auto" />}
                </DropdownMenuItem>
                {agents.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Servers</DropdownMenuLabel>
                    {agents.map((agent) => (
                      <DropdownMenuItem
                        key={agent.id}
                        onClick={() => {
                          setViewMode("agents");
                          selectAgent(agent.id);
                        }}
                        className="cursor-pointer rounded-md"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span>{agent.name}</span>
                        </div>
                        {viewMode === "agents" && selectedAgent?.id === agent.id && (
                          <Check className="w-4 h-4 ml-2" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Badge variant="outline" className="rounded-full text-green-700 dark:text-green-300 border-green-300/50 bg-green-50 dark:bg-green-950/30">
              ● Live
            </Badge>
            <Button onClick={() => refetch()} size="icon" variant="ghost" className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${section.bgColor}`}>
                    <section.icon className={`w-5 h-5 ${section.color}`} />
                  </div>
                  <div className="text-left">
                     <h3 className="text-base font-semibold text-slate-900 dark:text-white">{section.title}</h3>
                     <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{section.subtitle}</p>
                  </div>
                </div>
                 <div className="flex items-center gap-4">
                   <span className="text-2xl font-semibold text-slate-900 dark:text-white">
                     {section.value}
                   </span>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullscreenSection(section.id);
                      }}
                    >
                      <Maximize2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </Button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection(section.id);
                      }}
                      className="h-8 w-8 flex items-center justify-center"
                    >
                      {expandedSections.includes(section.id) ? (
                        <ChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </button>

              {/* Section Content */}
              {expandedSections.includes(section.id) && (
                <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 p-6">
                  {section.component}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreenSection && fullscreenSectionData && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950">
          {/* Fullscreen Header */}
          <div className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="flex items-center justify-between h-16 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${fullscreenSectionData.bgColor}`}>
                      <fullscreenSectionData.icon className={`w-5 h-5 ${fullscreenSectionData.color}`} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{fullscreenSectionData.title}</h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{fullscreenSectionData.subtitle}</p>
                    </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Current Value</span>
                  <span className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {fullscreenSectionData.value}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => refetch()} size="icon" variant="ghost" className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
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
            <div className="max-w-7xl mx-auto bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              {fullscreenSectionData.fullscreenComponent}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
