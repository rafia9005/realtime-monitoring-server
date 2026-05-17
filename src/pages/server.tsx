import DashboardLayout from "@/components/DashboardLayout";
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
  Layers,
  Box,
  Hash,
  Globe,
  ChevronDown
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
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function ServerPage() {
  const { id: agentIdFromUrl } = useParams<{ id: string }>();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(agentIdFromUrl || null);
  
  const { data: localMetrics, loading: localLoading, error: localError, refetch: refetchLocal } = useSystemMetrics(!selectedAgentId, 10000);
  const { agents, selectedAgent: hookSelectedAgent, metrics: agentMetrics, loading: agentLoading, selectAgent } = useAgentMetrics(true, 10000);
  
  useEffect(() => {
    if (agentIdFromUrl && agents.length > 0) {
      const agent = agents.find(a => a.id === agentIdFromUrl);
      if (agent) {
        selectAgent(agentIdFromUrl);
        setSelectedAgentId(agentIdFromUrl);
      }
    }
  }, [agentIdFromUrl, agents, selectAgent]);
  
  const handleSelectAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    selectAgent(agentId);
  };
  
  const handleSelectLocal = () => {
    setSelectedAgentId(null);
    selectAgent(null);
  };
  
  const metrics = selectedAgentId ? agentMetrics?.metrics : localMetrics;
  const loading = selectedAgentId ? agentLoading : localLoading;
  const error = selectedAgentId ? (agentMetrics ? null : agentLoading ? null : "Failed to load agent metrics") : localError;
  const refetch = selectedAgentId ? () => {} : refetchLocal;
  
  // Use local selectedAgentId instead of hook's selectedAgent for consistency
  const selectedAgent = selectedAgentId && hookSelectedAgent?.id === selectedAgentId ? hookSelectedAgent : null;
  const currentServerName = selectedAgent ? selectedAgent.name : "LOCAL_SRC";

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
        <div className="flex items-center justify-center h-[60vh] font-mono">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-primary animate-pulse">[</span>
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-primary animate-pulse">]</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">SCANNING_SYSTEM_ARCH...</p>
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
            <p className="text-[10px] uppercase font-bold text-destructive tracking-[0.2em]">HW_SCAN_FAILURE</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button onClick={() => refetch()} size="sm" variant="outline" className="rounded-none border-destructive/30 text-destructive uppercase text-[10px] tracking-widest">
              RETRY_SCAN
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!metrics) return null;

  // Filter snap disks (/dev/loop* devices and /snap mount points)
  const filteredDisks = metrics.disk.filter(disk => 
    !disk.device.includes("loop") && 
    !disk.mount_point.includes("/snap") &&
    !disk.mount_point.includes("snap")
  );

  const systemInfo = [
    { icon: Server, label: "HOSTNAME", value: metrics.system.hostname },
    { icon: Monitor, label: "OS_KERNEL", value: `${metrics.system.platform} ${metrics.system.platform_version}` },
    { icon: Layers, label: "PLATFORM", value: metrics.system.platform_family },
    { icon: Box, label: "KERNEL_VER", value: metrics.system.kernel_version },
    { icon: Hash, label: "ARCHITECTURE", value: metrics.system.kernel_arch },
    { icon: Clock, label: "UPTIME", value: formatUptime(metrics.system.uptime) },
    { icon: Activity, label: "PROC_COUNT", value: metrics.system.processes.toString() },
    ...(metrics.system.virtualization ? [{ icon: Globe, label: "VIRT_TYPE", value: metrics.system.virtualization }] : []),
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 font-mono">
        {/* Header */}
        <div className="flex items-end justify-between border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase tracking-widest mb-1">
              <span className="text-primary">●</span> HW_MANIFEST
            </div>
            <h1 className="text-2xl font-bold tracking-tighter uppercase">{currentServerName}</h1>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
              INVENTORY_ID: {metrics.system.hostname.toUpperCase()} // STATUS: {selectedAgent ? (selectedAgent.status === 'online' ? 'ONLINE' : 'OFFLINE') : 'ONLINE'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Server Selector Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-none border-border font-bold uppercase text-[10px] tracking-widest px-4"
                >
                  <Server className="w-3 h-3 mr-2" />
                  {selectedAgentId ? selectedAgent?.name || "SEL_NODE" : "LOCAL_SRC"}
                  <ChevronDown className="w-3 h-3 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-none border-border font-mono text-[10px]">
                <DropdownMenuLabel className="uppercase tracking-[0.2em] opacity-50">SRV_INDEX</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem 
                  onClick={handleSelectLocal}
                  className={`cursor-pointer ${!selectedAgentId ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  LOCAL_SRC
                </DropdownMenuItem>
                {agents.length > 0 && <DropdownMenuSeparator className="bg-border" />}
                {agents.map((agent) => (
                  <DropdownMenuItem 
                    key={agent.id}
                    onClick={() => handleSelectAgent(agent.id)}
                    className={`cursor-pointer ${selectedAgentId === agent.id ? 'bg-primary text-primary-foreground' : ''}`}
                  >
                    <span className={`w-2 h-2 rounded-full mr-2 ${agent.status === 'online' ? 'bg-emerald-500' : 'bg-destructive'}`} />
                    {agent.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => refetch()} size="icon" variant="ghost" className="h-10 w-10 border border-border rounded-none">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Information */}
          <div className="border border-border bg-card/30">
            <div className="p-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <Server className="w-3 h-3 text-primary" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest">SYS_MANIFEST</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {systemInfo.map((item, index) => (
                <div key={index} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <item.icon className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground font-bold">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-bold tracking-tight uppercase group-hover:text-primary transition-colors">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {/* CPU Information */}
            <div className="border border-border bg-card/30">
              <div className="p-4 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3 h-3 text-primary" />
                  <h2 className="text-[10px] font-bold uppercase tracking-widest">CPU_CONFIG</h2>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex flex-col gap-1 mb-4 pb-4 border-b border-border/50">
                  <span className="text-[8px] text-muted-foreground uppercase">PROCESSOR_MODEL</span>
                  <span className="text-xs font-bold uppercase">{metrics.cpu.model_name || "GENERIC_X86_64"}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[8px] text-muted-foreground uppercase">PHYS_CORES</span>
                    <p className="text-sm font-bold">{metrics.cpu.cores}</p>
                  </div>
                  <div>
                    <span className="text-[8px] text-muted-foreground uppercase">LOGIC_THREADS</span>
                    <p className="text-sm font-bold">{metrics.cpu.threads}</p>
                  </div>
                  <div>
                    <span className="text-[8px] text-muted-foreground uppercase">BASE_FREQ</span>
                    <p className="text-sm font-bold">{metrics.cpu.frequency_mhz ? `${(metrics.cpu.frequency_mhz / 1000).toFixed(2)} GHz` : "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[8px] text-muted-foreground uppercase">CURR_UTIL</span>
                    <p className="text-sm font-bold text-primary">{metrics.cpu.usage_percent.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Load Average */}
            <div className="border border-border bg-card/30">
              <div className="p-4 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-primary" />
                  <h2 className="text-[10px] font-bold uppercase tracking-widest">LOAD_AVG</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {[
                  { label: "1_MIN", value: metrics.load.load1 },
                  { label: "5_MIN", value: metrics.load.load5 },
                  { label: "15_MIN", value: metrics.load.load15 },
                ].map((item, index) => {
                  const loadPercent = Math.min((item.value / metrics.cpu.cores) * 100, 100);
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span>{item.value.toFixed(2)}</span>
                      </div>
                      <div className="h-1 bg-muted overflow-hidden">
                        <div 
                          className={`h-full transition-all ${loadPercent > 90 ? "bg-red-500" : loadPercent > 70 ? "bg-amber-500" : "bg-primary"}`}
                          style={{ width: `${loadPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Memory Information */}
        <div className="border border-border bg-card/30">
          <div className="p-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <MemoryStick className="w-3 h-3 text-primary" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest">MEM_SNAPSHOT</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest">TOTAL_CAP</span>
                <p className="text-sm font-bold tabular-nums">{formatBytes(metrics.memory.total)}</p>
              </div>
              <div>
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest">USED_VAL</span>
                <p className="text-sm font-bold tabular-nums text-primary">{formatBytes(metrics.memory.used)}</p>
              </div>
              <div>
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest">AVAIL_VAL</span>
                <p className="text-sm font-bold tabular-nums">{formatBytes(metrics.memory.available)}</p>
              </div>
              <div>
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest">PERCENT</span>
                <p className="text-sm font-bold tabular-nums">{metrics.memory.used_percent.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Storage Information */}
        <div className="border border-border bg-card/30">
          <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-3 h-3 text-primary" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest">FS_TABLE</h2>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-[0.2em]">{filteredDisks.length} ACTIVE_PARTITIONS</span>
          </div>
          <div className="divide-y divide-border/50 font-mono">
            {filteredDisks.map((disk, index) => (
              <div key={index} className="p-6 hover:bg-muted/5 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-[10px] font-bold uppercase p-1 border border-border bg-background">{disk.mount_point}</div>
                    <div className="text-[8px] text-muted-foreground uppercase tracking-widest">{disk.device} // {disk.fs_type}</div>
                  </div>
                  <div className="text-[10px] font-bold tracking-tighter">[{disk.used_percent.toFixed(1)}%]</div>
                </div>
                <div className="h-1 bg-muted overflow-hidden mb-3">
                  <div 
                    className={`h-full transition-all ${disk.used_percent > 90 ? "bg-red-500" : disk.used_percent > 75 ? "bg-amber-500" : "bg-primary"}`}
                    style={{ width: `${disk.used_percent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[8px] text-muted-foreground uppercase tracking-widest">
                  <span>USED: {formatBytes(disk.used)}</span>
                  <span>FREE: {formatBytes(disk.free)}</span>
                  <span>TOTAL: {formatBytes(disk.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
