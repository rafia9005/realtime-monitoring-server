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
  Activity,
  ArrowUpRight,
  Server,
  Terminal
} from "lucide-react";
import { useSystemMetrics } from "@/lib/hooks/useSystemMetrics";
import { useAgentMetrics } from "@/lib/hooks/useAgentMetrics";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { data: metrics, loading, error, refetch } = useSystemMetrics(true, 5000);
  const { agents } = useAgentMetrics(true, 10000);

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
    return "text-foreground";
  };

  const getStatusBg = (value: number, warning: number, critical: number) => {
    if (value >= critical) return "bg-red-500";
    if (value >= warning) return "bg-amber-500";
    return "bg-primary";
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
            <p className="text-xs uppercase tracking-widest text-muted-foreground">INITIALIZING_METRICS_STREAM...</p>
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
            <p className="text-xs uppercase font-bold text-destructive">CRITICAL_SYSTEM_ERROR</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button onClick={() => refetch()} size="sm" variant="outline" className="rounded-none border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground">
              RETRY_CONNECTION
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
      <div className="space-y-8 font-mono">
        {/* Header */}
        <div className="flex items-end justify-between border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase tracking-widest mb-1">
              <span className="text-primary">●</span> SYSTEM_OVERVIEW
            </div>
            <h1 className="text-2xl font-bold tracking-tighter uppercase">{metrics.system.hostname}</h1>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
              KERNEL: {metrics.system.platform} / ARCH: x86_64
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[8px] text-muted-foreground uppercase tracking-widest mb-1">Stream_Status</span>
              <Badge variant="outline" className="rounded-none text-emerald-500 border-emerald-500/30 bg-emerald-500/5 text-[10px] px-2 py-0">
                LIVE_FEED
              </Badge>
            </div>
            <Button onClick={() => refetch()} size="icon" variant="ghost" className="h-10 w-10 border border-border rounded-none">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
          {/* CPU */}
          <div className="p-6 bg-background group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Cpu className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">CPU_LOAD</span>
              </div>
              <span className={`text-[10px] font-bold ${getStatusColor(cpuUsage, 60, 80)}`}>
                [{cpuUsage > 80 ? "CRIT" : cpuUsage > 60 ? "WARN" : "STBL"}]
              </span>
            </div>
            <div className={`text-4xl font-bold tracking-tighter tabular-nums ${getStatusColor(cpuUsage, 60, 80)}`}>
              {cpuUsage.toFixed(1)}%
            </div>
            <div className="mt-6 space-y-2">
              <div className="h-1 bg-muted overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${getStatusBg(cpuUsage, 60, 80)}`}
                  style={{ width: `${cpuUsage}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] text-muted-foreground uppercase">
                <span>0%</span>
                <span>{metrics.cpu.cores}C/{metrics.cpu.threads}T</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Memory */}
          <div className="p-6 bg-background">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MemoryStick className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">MEM_USAGE</span>
              </div>
              <span className={`text-[10px] font-bold ${getStatusColor(memUsage, 70, 85)}`}>
                [{memUsage > 85 ? "CRIT" : memUsage > 70 ? "WARN" : "STBL"}]
              </span>
            </div>
            <div className={`text-4xl font-bold tracking-tighter tabular-nums ${getStatusColor(memUsage, 70, 85)}`}>
              {memUsage.toFixed(1)}%
            </div>
            <div className="mt-6 space-y-2">
              <div className="h-1 bg-muted overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${getStatusBg(memUsage, 70, 85)}`}
                  style={{ width: `${memUsage}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] text-muted-foreground uppercase">
                <span>USED: {formatBytes(metrics.memory.used)}</span>
                <span>TOTAL: {formatBytes(metrics.memory.total)}</span>
              </div>
            </div>
          </div>

          {/* Disk */}
          <div className="p-6 bg-background">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <HardDrive className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">DISK_CAP</span>
              </div>
              <span className={`text-[10px] font-bold ${getStatusColor(diskUsage, 75, 90)}`}>
                [{diskUsage > 90 ? "CRIT" : diskUsage > 75 ? "WARN" : "STBL"}]
              </span>
            </div>
            <div className={`text-4xl font-bold tracking-tighter tabular-nums ${getStatusColor(diskUsage, 75, 90)}`}>
              {diskUsage.toFixed(1)}%
            </div>
            <div className="mt-6 space-y-2">
              <div className="h-1 bg-muted overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${getStatusBg(diskUsage, 75, 90)}`}
                  style={{ width: `${diskUsage}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] text-muted-foreground uppercase">
                <span>FREE: {formatBytes(totalDiskSize - totalDiskUsed)}</span>
                <span>TOTAL: {formatBytes(totalDiskSize)}</span>
              </div>
            </div>
          </div>

          {/* Network */}
          <div className="p-6 bg-background">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Network className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">NET_CONNS</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-500">
                [ACTIVE]
              </span>
            </div>
            <div className="text-4xl font-bold tracking-tighter tabular-nums">
              {metrics.network.connections.established}
            </div>
            <div className="mt-6 space-y-1">
              <div className="flex items-center justify-between text-[8px] text-muted-foreground uppercase">
                <span>TX_BYTES</span>
                <span className="text-foreground">{formatBytes(metrics.network.bytes_sent)}</span>
              </div>
              <div className="flex items-center justify-between text-[8px] text-muted-foreground uppercase">
                <span>RX_BYTES</span>
                <span className="text-foreground">{formatBytes(metrics.network.bytes_recv)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Info Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-border p-4 bg-card/50">
            <div className="text-[8px] text-muted-foreground uppercase tracking-widest mb-1">SYSTEM_UPTIME</div>
            <div className="text-sm font-bold tabular-nums">{formatUptime(metrics.system.uptime)}</div>
          </div>
          <div className="border border-border p-4 bg-card/50">
            <div className="text-[8px] text-muted-foreground uppercase tracking-widest mb-1">LOAD_AVERAGE</div>
            <div className="text-sm font-bold tabular-nums">
              {metrics.load.load1.toFixed(2)} | {metrics.load.load5.toFixed(2)} | {metrics.load.load15.toFixed(2)}
            </div>
          </div>
          <div className="border border-border p-4 bg-card/50">
            <div className="text-[8px] text-muted-foreground uppercase tracking-widest mb-1">PROCESS_STATS</div>
            <div className="text-sm font-bold tabular-nums">
              {metrics.process.running} RUNNING / {metrics.process.total} TOTAL
            </div>
          </div>
          <div className="border border-border p-4 bg-card/50">
            <div className="text-[8px] text-muted-foreground uppercase tracking-widest mb-1">SYS_TEMPERATURE</div>
            <div className="text-sm font-bold tabular-nums">
              {metrics.temperature?.cpu_temp ? `${metrics.temperature.cpu_temp.toFixed(1)}°C` : "N/A"}
            </div>
          </div>
        </div>

        {/* Connected Agents Section */}
        {agents.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em]">REMOTE_NODES [{agents.length}]</h2>
              <Link to="/agents" className="text-[10px] text-primary hover:underline uppercase font-bold tracking-widest flex items-center gap-1">
                MANAGE_ALL <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <Link
                  key={agent.id}
                  to={`/server/${agent.id}`}
                  className="group block border border-border bg-card/30 hover:bg-card transition-colors relative"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 border ${agent.status === 'online' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border bg-muted'} flex items-center justify-center`}>
                          <Server className={`w-4 h-4 ${agent.status === 'online' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-tight">{agent.name}</h3>
                          <p className="text-[8px] text-muted-foreground font-mono">{agent.hostname}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={`rounded-none text-[8px] px-1 py-0 ${agent.status === 'online' ? 'text-emerald-500 border-emerald-500/30' : 'text-muted-foreground'}`}
                      >
                        {agent.status === 'online' ? '● ONLINE' : '○ OFFLINE'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1.5 border-t border-border/50 pt-3">
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-tighter">
                        <span className="text-muted-foreground">Network_Address</span>
                        <span className="font-bold">{agent.ip_address}</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-tighter">
                        <span className="text-muted-foreground">Last_Heartbeat</span>
                        <span className="font-bold">{new Date(agent.last_seen).toLocaleTimeString([], { hour12: false })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 px-4 py-2 flex items-center justify-between border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] font-bold uppercase">View_Telemetry</span>
                    <ArrowUpRight className="w-3 h-3 text-primary" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Navigation Footer */}
        <div className="flex flex-wrap gap-4 pt-8">
          <Link to="/monitoring" className="flex-1 min-w-[200px] border border-border p-4 hover:border-primary transition-colors flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest">DETAILED_METRICS</div>
                <div className="text-[8px] text-muted-foreground uppercase">Real-time charts & logs</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          </Link>
          <Link to="/terminal" className="flex-1 min-w-[200px] border border-border p-4 hover:border-primary transition-colors flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <Terminal className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest">REMOTE_SHELL</div>
                <div className="text-[8px] text-muted-foreground uppercase">Direct terminal access</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
