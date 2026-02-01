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
  X
} from "lucide-react";
import { useSystemMetrics } from "@/lib/hooks/useSystemMetrics";
import { CPUDetail } from "@/components/metrics/CPUDetail";
import { MemoryDetail } from "@/components/metrics/MemoryDetail";
import { DiskDetail } from "@/components/metrics/DiskDetail";
import { NetworkDetail } from "@/components/metrics/NetworkDetail";
import { useState, useEffect } from "react";

type MetricSection = "cpu" | "memory" | "disk" | "network";

export default function Monitoring() {
  const { data: metrics, loading, error, refetch } = useSystemMetrics(true, 5000);
  const [expandedSections, setExpandedSections] = useState<MetricSection[]>(["cpu", "memory", "disk", "network"]);
  const [fullscreenSection, setFullscreenSection] = useState<MetricSection | null>(null);

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
            <p className="text-sm text-muted-foreground mt-1">Detailed system metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Live
            </Badge>
            <Button onClick={() => refetch()} size="sm" variant="ghost">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

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
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-background">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${fullscreenSectionData.bgColor}`}>
                <fullscreenSectionData.icon className={`w-5 h-5 ${fullscreenSectionData.color}`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{fullscreenSectionData.title}</h2>
                <p className="text-sm text-muted-foreground">{fullscreenSectionData.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                Live
              </Badge>
              <span className={`text-2xl font-bold tabular-nums ${fullscreenSectionData.color}`}>
                {fullscreenSectionData.value}
              </span>
              <Button onClick={() => refetch()} size="sm" variant="ghost">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setFullscreenSection(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Fullscreen Content */}
          <div className="overflow-auto h-[calc(100vh-73px)]">
            <div className="max-w-6xl mx-auto">
              {fullscreenSectionData.fullscreenComponent}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
