import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Thermometer,
  Clock,
  RefreshCw,
  Loader2,
  AlertCircle,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Server
} from "lucide-react";
import { useSystemMetrics } from "@/lib/hooks/useSystemMetrics";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { data: metrics, loading, error, refetch } = useSystemMetrics(true, 5000);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (value: number, warning: number, critical: number) => {
    if (value >= critical) return "text-red-500";
    if (value >= warning) return "text-amber-500";
    return "text-emerald-500";
  };

  const getStatusBg = (value: number, warning: number, critical: number) => {
    if (value >= critical) return "bg-red-500";
    if (value >= warning) return "bg-amber-500";
    return "bg-emerald-500";
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

  const cpuUsage = metrics.cpu.usage_percent;
  const memUsage = metrics.memory.used_percent;
  const diskUsage = metrics.disk[0]?.used_percent || 0;
  const totalDiskUsed = metrics.disk.reduce((acc, d) => acc + d.used, 0);
  const totalDiskSize = metrics.disk.reduce((acc, d) => acc + d.total, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {metrics.system.hostname} • {metrics.system.platform}
            </p>
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

        {/* Main Stats - Grafana Style */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CPU */}
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Cpu className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">CPU</span>
              </div>
              <span className={`text-xs font-medium ${getStatusColor(cpuUsage, 60, 80)}`}>
                {cpuUsage > 80 ? "HIGH" : cpuUsage > 60 ? "WARN" : "OK"}
              </span>
            </div>
            <div className={`text-3xl font-bold tabular-nums ${getStatusColor(cpuUsage, 60, 80)}`}>
              {cpuUsage.toFixed(1)}%
            </div>
            <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${getStatusBg(cpuUsage, 60, 80)}`}
                style={{ width: `${cpuUsage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{metrics.cpu.cores} cores • {metrics.cpu.threads} threads</p>
          </div>

          {/* Memory */}
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MemoryStick className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Memory</span>
              </div>
              <span className={`text-xs font-medium ${getStatusColor(memUsage, 70, 85)}`}>
                {memUsage > 85 ? "HIGH" : memUsage > 70 ? "WARN" : "OK"}
              </span>
            </div>
            <div className={`text-3xl font-bold tabular-nums ${getStatusColor(memUsage, 70, 85)}`}>
              {memUsage.toFixed(1)}%
            </div>
            <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${getStatusBg(memUsage, 70, 85)}`}
                style={{ width: `${memUsage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}</p>
          </div>

          {/* Disk */}
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <HardDrive className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Disk</span>
              </div>
              <span className={`text-xs font-medium ${getStatusColor(diskUsage, 75, 90)}`}>
                {diskUsage > 90 ? "HIGH" : diskUsage > 75 ? "WARN" : "OK"}
              </span>
            </div>
            <div className={`text-3xl font-bold tabular-nums ${getStatusColor(diskUsage, 75, 90)}`}>
              {diskUsage.toFixed(1)}%
            </div>
            <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${getStatusBg(diskUsage, 75, 90)}`}
                style={{ width: `${diskUsage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{formatBytes(totalDiskUsed)} / {formatBytes(totalDiskSize)}</p>
          </div>

          {/* Network */}
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Network className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Network</span>
              </div>
              <span className="text-xs font-medium text-emerald-500">ACTIVE</span>
            </div>
            <div className="text-3xl font-bold tabular-nums text-foreground">
              {metrics.network.connections.established}
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span>↑ {formatBytes(metrics.network.bytes_sent)}</span>
              <span>↓ {formatBytes(metrics.network.bytes_recv)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{metrics.network.connections.total} total connections</p>
          </div>
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Uptime */}
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Uptime</span>
            </div>
            <div className="text-xl font-semibold">{formatUptime(metrics.system.uptime)}</div>
          </div>

          {/* Load Average */}
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Load Avg</span>
            </div>
            <div className="text-xl font-semibold tabular-nums">
              {metrics.load.load1.toFixed(2)} / {metrics.load.load5.toFixed(2)} / {metrics.load.load15.toFixed(2)}
            </div>
          </div>

          {/* Processes */}
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Processes</span>
            </div>
            <div className="text-xl font-semibold">
              {metrics.process.running} <span className="text-sm text-muted-foreground font-normal">/ {metrics.process.total}</span>
            </div>
          </div>

          {/* Temperature */}
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Thermometer className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Temperature</span>
            </div>
            <div className="text-xl font-semibold">
              {metrics.temperature?.cpu_temp 
                ? `${metrics.temperature.cpu_temp.toFixed(1)}°C`
                : metrics.environment?.first_temperature 
                  ? `${metrics.environment.first_temperature.toFixed(1)}°C`
                  : "N/A"
              }
            </div>
          </div>
        </div>

        {/* Environment Sensors (if available) */}
        {metrics.environment && (
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Thermometer className="w-4 h-4" />
                <span className="text-sm font-medium">Environment Sensors</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(metrics.environment.created_at).toLocaleTimeString()}
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Sensor 1 Temp</p>
                <p className="text-lg font-semibold">{metrics.environment.first_temperature?.toFixed(1) || "N/A"}°C</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Sensor 1 Humidity</p>
                <p className="text-lg font-semibold">{metrics.environment.first_humidity?.toFixed(1) || "N/A"}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Sensor 2 Temp</p>
                <p className="text-lg font-semibold">{metrics.environment.second_temperature?.toFixed(1) || "N/A"}°C</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Sensor 2 Humidity</p>
                <p className="text-lg font-semibold">{metrics.environment.second_humidity?.toFixed(1) || "N/A"}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/monitoring" className="group p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium">Detailed Monitoring</h3>
                  <p className="text-sm text-muted-foreground">CPU, Memory, Disk, Network details</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>

          <Link to="/server" className="group p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <Server className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <h3 className="font-medium">Server Information</h3>
                  <p className="text-sm text-muted-foreground">System specs and configuration</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
