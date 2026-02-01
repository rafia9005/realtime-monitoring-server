import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Clock,
  RefreshCw,
  Loader2,
  AlertCircle,
  Activity,
  Thermometer,
  Layers,
  Box,
  Hash,
  Globe
} from "lucide-react";
import { useSystemMetrics } from "@/lib/hooks/useSystemMetrics";

export default function ServerPage() {
  const { data: metrics, loading, error, refetch } = useSystemMetrics(true, 10000);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const parts = [];
    if (days > 0) parts.push(`${days} days`);
    if (hours > 0) parts.push(`${hours} hours`);
    if (minutes > 0) parts.push(`${minutes} minutes`);
    return parts.join(", ") || "Just started";
  };

  if (loading && !metrics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading server info...</p>
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

  const systemInfo = [
    { icon: Server, label: "Hostname", value: metrics.system.hostname },
    { icon: Monitor, label: "Operating System", value: `${metrics.system.platform} ${metrics.system.platform_version}` },
    { icon: Layers, label: "Platform Family", value: metrics.system.platform_family },
    { icon: Box, label: "Kernel", value: metrics.system.kernel_version },
    { icon: Hash, label: "Architecture", value: metrics.system.kernel_arch },
    { icon: Clock, label: "Uptime", value: formatUptime(metrics.system.uptime) },
    { icon: Activity, label: "Processes", value: metrics.system.processes.toString() },
    ...(metrics.system.virtualization ? [{ icon: Globe, label: "Virtualization", value: metrics.system.virtualization }] : []),
  ];

  const cpuInfo = [
    { label: "Model", value: metrics.cpu.model_name || "Unknown" },
    { label: "Physical Cores", value: metrics.cpu.cores.toString() },
    { label: "Logical Cores (Threads)", value: metrics.cpu.threads.toString() },
    { label: "Base Frequency", value: metrics.cpu.frequency_mhz ? `${(metrics.cpu.frequency_mhz / 1000).toFixed(2)} GHz` : "N/A" },
    { label: "Current Usage", value: `${metrics.cpu.usage_percent.toFixed(1)}%` },
  ];

  const memoryInfo = [
    { label: "Total RAM", value: formatBytes(metrics.memory.total) },
    { label: "Used RAM", value: formatBytes(metrics.memory.used) },
    { label: "Available RAM", value: formatBytes(metrics.memory.available) },
    { label: "Usage", value: `${metrics.memory.used_percent.toFixed(1)}%` },
    ...(metrics.memory.cached ? [{ label: "Cached", value: formatBytes(metrics.memory.cached) }] : []),
    ...(metrics.memory.buffers ? [{ label: "Buffers", value: formatBytes(metrics.memory.buffers) }] : []),
    { label: "Swap Total", value: formatBytes(metrics.memory.swap.total) },
    { label: "Swap Used", value: formatBytes(metrics.memory.swap.used) },
  ];

  const processInfo = [
    { label: "Total Processes", value: metrics.process.total.toString() },
    { label: "Running", value: metrics.process.running.toString(), color: "text-emerald-500" },
    { label: "Sleeping", value: metrics.process.sleeping.toString(), color: "text-blue-500" },
    { label: "Stopped", value: metrics.process.stopped.toString(), color: "text-amber-500" },
    { label: "Zombie", value: metrics.process.zombie.toString(), color: "text-red-500" },
    { label: "Total Threads", value: metrics.process.threads.toLocaleString() },
  ];

  const loadInfo = [
    { label: "1 Minute Average", value: metrics.load.load1.toFixed(2) },
    { label: "5 Minute Average", value: metrics.load.load5.toFixed(2) },
    { label: "15 Minute Average", value: metrics.load.load15.toFixed(2) },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Server</h1>
            <p className="text-sm text-muted-foreground mt-1">System information and specifications</p>
          </div>
          <Button onClick={() => refetch()} size="sm" variant="ghost">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* System Information */}
        <div className="rounded-lg border border-border bg-card">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">System Information</h2>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systemInfo.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <item.icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-medium truncate" title={item.value}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CPU Information */}
        <div className="rounded-lg border border-border bg-card">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-500" />
              <h2 className="font-semibold">CPU Information</h2>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cpuInfo.map((item, index) => (
                <div key={index} className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-medium truncate" title={item.value}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Memory Information */}
        <div className="rounded-lg border border-border bg-card">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <MemoryStick className="w-5 h-5 text-green-500" />
              <h2 className="font-semibold">Memory Information</h2>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {memoryInfo.map((item, index) => (
                <div key={index} className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Storage Information */}
        <div className="rounded-lg border border-border bg-card">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-purple-500" />
              <h2 className="font-semibold">Storage Information</h2>
              <Badge variant="outline" className="ml-auto">{metrics.disk.length} partitions</Badge>
            </div>
          </div>
          <div className="divide-y divide-border">
            {metrics.disk.map((disk, index) => (
              <div key={index} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{disk.mount_point}</p>
                    <p className="text-xs text-muted-foreground">{disk.device} • {disk.fs_type}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      disk.used_percent > 90 
                        ? "text-red-500 border-red-500/30 bg-red-500/10" 
                        : disk.used_percent > 75 
                          ? "text-amber-500 border-amber-500/30 bg-amber-500/10"
                          : "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                    }
                  >
                    {disk.used_percent.toFixed(1)}%
                  </Badge>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      disk.used_percent > 90 ? "bg-red-500" : disk.used_percent > 75 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${disk.used_percent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatBytes(disk.used)} used</span>
                  <span>{formatBytes(disk.free)} free</span>
                  <span>{formatBytes(disk.total)} total</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Process Information */}
          <div className="rounded-lg border border-border bg-card">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-500" />
                <h2 className="font-semibold">Process Information</h2>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {processInfo.map((item, index) => (
                  <div key={index} className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className={`font-semibold text-lg ${item.color || ""}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Load Average */}
          <div className="rounded-lg border border-border bg-card">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-500" />
                <h2 className="font-semibold">Load Average</h2>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {loadInfo.map((item, index) => {
                const loadPercent = Math.min((parseFloat(item.value) / metrics.cpu.cores) * 100, 100);
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-semibold tabular-nums">{item.value}</p>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          loadPercent > 100 ? "bg-red-500" : loadPercent > 70 ? "bg-amber-500" : "bg-cyan-500"
                        }`}
                        style={{ width: `${Math.min(loadPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground pt-2">
                Load is relative to {metrics.cpu.cores} CPU cores
              </p>
            </div>
          </div>
        </div>

        {/* Temperature (if available) */}
        {(metrics.temperature?.sensors?.length || metrics.temperature?.cpu_temp) && (
          <div className="rounded-lg border border-border bg-card">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-orange-500" />
                <h2 className="font-semibold">Temperature Sensors</h2>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {metrics.temperature?.cpu_temp && (
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground">CPU</p>
                    <p className="font-semibold text-lg">{metrics.temperature.cpu_temp.toFixed(1)}°C</p>
                  </div>
                )}
                {metrics.temperature?.sensors?.map((sensor, index) => (
                  <div key={index} className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground truncate" title={sensor.name}>{sensor.name}</p>
                    <p className="font-semibold text-lg">{sensor.temperature.toFixed(1)}°C</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
