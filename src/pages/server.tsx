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
import { useLanguage } from "@/lib/LanguageContext";

export default function ServerPage() {
  const { id: agentIdFromUrl } = useParams<{ id: string }>();
  const { t } = useLanguage();
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
  const currentServerName = selectedAgent ? selectedAgent.name : t('server.localSrc');

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
    if (days > 0) parts.push(`${days} ${t('server.uptimeParts.days')}`);
    if (hours > 0) parts.push(`${hours} ${t('server.uptimeParts.hours')}`);
    if (minutes > 0) parts.push(`${minutes} ${t('server.uptimeParts.minutes')}`);
    return parts.join(", ") || t('server.uptimeParts.justStarted');
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
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t('server.loading')}</p>
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
            <p className="text-[10px] uppercase font-bold text-destructive tracking-[0.2em]">{t('server.error.title')}</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button onClick={() => refetch()} size="sm" variant="outline" className="rounded-none border-destructive/30 text-destructive uppercase text-[10px] tracking-widest">
              {t('server.error.retry')}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 font-mono">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-foreground/5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase tracking-widest mb-1 font-black italic">
              <span className="text-primary">●</span> {t('server.manifest')}
            </div>
            <h1 className="text-6xl font-black tracking-tight uppercase leading-none">
              {currentServerName}
            </h1>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-bold italic">
              {t('server.inventoryId')}: {metrics.system.hostname.toUpperCase()} // {t('server.status')}: {selectedAgent ? (selectedAgent.status === 'online' ? t('server.online') : t('server.offline')) : t('server.online')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Server Selector Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="h-14 px-6 rounded-2xl border-foreground/10 bg-background/50 backdrop-blur-3xl hover:bg-foreground/5 text-xs font-black uppercase tracking-widest transition-all"
                >
                  <Server className="w-4 h-4 mr-2" />
                  {selectedAgentId ? selectedAgent?.name || "SEL_NODE" : t('server.localSrc')}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="font-mono text-xs rounded-2xl border-foreground/10 bg-background/80 backdrop-blur-3xl p-2 min-w-[200px]">
                <DropdownMenuLabel className="uppercase font-black text-[9px] tracking-widest opacity-40 py-2 px-3">{t('server.srvIndex')}</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-foreground/5" />
                <DropdownMenuItem 
                  onClick={handleSelectLocal}
                  className="rounded-xl focus:bg-foreground/5 focus:text-foreground cursor-pointer uppercase font-black text-[10px] tracking-wider py-2 px-3"
                >
                  {t('server.localSrc')}
                </DropdownMenuItem>
                {agents.length > 0 && <DropdownMenuSeparator className="bg-foreground/5" />}
                {agents.map((agent) => (
                  <DropdownMenuItem 
                    key={agent.id}
                    onClick={() => handleSelectAgent(agent.id)}
                    className="rounded-xl focus:bg-foreground/5 focus:text-foreground cursor-pointer uppercase font-black text-[10px] tracking-wider py-2 px-3 flex items-center"
                  >
                    <span className={`w-2 h-2 rounded-full mr-2 ${agent.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-destructive'}`} />
                    {agent.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => refetch()} variant="outline" className="h-14 w-14 rounded-2xl border-foreground/10 bg-background/50 backdrop-blur-3xl hover:bg-foreground/5 transition-all active:scale-95 flex items-center justify-center">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Information */}
          <div className="accent-card accent-card-gray bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[2.5rem] overflow-hidden hover:border-foreground/10 transition-all duration-300">
            <div className="p-6 border-b border-foreground/5 bg-foreground/5">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.25em] opacity-80">{t('server.sysManifest')}</h2>
              </div>
            </div>
            <div className="p-8 space-y-4">
              {systemInfo.map((item, index) => (
                <div key={index} className="flex items-center justify-between group py-2 border-b border-foreground/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-muted-foreground opacity-60" />
                    <span className="text-[10px] text-muted-foreground font-black tracking-widest uppercase italic">{item.label}</span>
                  </div>
                  <span className="text-xs font-black tracking-tight uppercase group-hover:text-primary transition-colors">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {/* CPU Information */}
            <div className="accent-card accent-card-indigo bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[2.5rem] overflow-hidden hover:border-foreground/10 transition-all duration-300">
              <div className="p-6 border-b border-foreground/5 bg-foreground/5">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-500" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.25em] opacity-80">{t('server.cpuConfig')}</h2>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex flex-col gap-1 mb-4 pb-4 border-b border-foreground/5">
                  <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">PROCESSOR_MODEL</span>
                  <span className="text-sm font-black uppercase tracking-tight">{metrics.cpu.model_name || "GENERIC_X86_64"}</span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">PHYS_CORES</span>
                    <p className="text-base font-black">{metrics.cpu.cores}</p>
                  </div>
                  <div>
                    <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">LOGIC_THREADS</span>
                    <p className="text-base font-black">{metrics.cpu.threads}</p>
                  </div>
                  <div>
                    <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">BASE_FREQ</span>
                    <p className="text-base font-black">{metrics.cpu.frequency_mhz ? `${(metrics.cpu.frequency_mhz / 1000).toFixed(2)} GHz` : "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">CURR_UTIL</span>
                    <p className="text-base font-black text-primary">{metrics.cpu.usage_percent.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Load Average */}
            <div className="accent-card accent-card-blue bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[2.5rem] overflow-hidden hover:border-foreground/10 transition-all duration-300">
              <div className="p-6 border-b border-foreground/5 bg-foreground/5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.25em] opacity-80">{t('server.loadAvg')}</h2>
                </div>
              </div>
              <div className="p-8 space-y-6">
                {[
                  { label: "1_MIN", value: metrics.load.load1 },
                  { label: "5_MIN", value: metrics.load.load5 },
                  { label: "15_MIN", value: metrics.load.load15 },
                ].map((item, index) => {
                  const loadPercent = Math.min((item.value / metrics.cpu.cores) * 100, 100);
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span>{item.value.toFixed(2)}</span>
                      </div>
                      <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${loadPercent > 90 ? "bg-red-500" : loadPercent > 70 ? "bg-amber-500" : "bg-primary"}`}
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
        <div className="accent-card accent-card-fuchsia bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[2.5rem] overflow-hidden hover:border-foreground/10 transition-all duration-300">
          <div className="p-6 border-b border-foreground/5 bg-foreground/5">
            <div className="flex items-center gap-2">
              <MemoryStick className="w-4 h-4 text-fuchsia-500" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.25em] opacity-80">{t('server.memSnapshot')}</h2>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-black">TOTAL_CAP</span>
                <p className="text-base font-black tabular-nums">{formatBytes(metrics.memory.total)}</p>
              </div>
              <div>
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-black">USED_VAL</span>
                <p className="text-base font-black tabular-nums text-primary">{formatBytes(metrics.memory.used)}</p>
              </div>
              <div>
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-black">AVAIL_VAL</span>
                <p className="text-base font-black tabular-nums">{formatBytes(metrics.memory.available)}</p>
              </div>
              <div>
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-black">PERCENT</span>
                <p className="text-base font-black tabular-nums">{metrics.memory.used_percent.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Storage Information */}
        <div className="accent-card accent-card-amber bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[2.5rem] overflow-hidden hover:border-foreground/10 transition-all duration-300">
          <div className="p-6 border-b border-foreground/5 bg-foreground/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-500" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.25em] opacity-80">{t('server.fsTable')}</h2>
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{filteredDisks.length} {t('server.activePartitions')}</span>
          </div>
          <div className="divide-y divide-foreground/5 font-mono">
            {filteredDisks.map((disk, index) => (
              <div key={index} className="p-8 hover:bg-foreground/[0.02] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-[10px] font-black uppercase px-3 py-1.5 border border-foreground/10 bg-foreground/5 rounded-lg">{disk.mount_point}</div>
                    <div className="text-[8px] text-muted-foreground uppercase tracking-widest font-black italic">{disk.device} // {disk.fs_type}</div>
                  </div>
                  <div className="text-[10px] font-black tracking-tighter">[{disk.used_percent.toFixed(1)}%]</div>
                </div>
                <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden mb-4">
                  <div 
                    className={`h-full rounded-full transition-all ${disk.used_percent > 90 ? "bg-red-500" : disk.used_percent > 75 ? "bg-amber-500" : "bg-primary"}`}
                    style={{ width: `${disk.used_percent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[8px] text-muted-foreground uppercase tracking-widest font-black italic">
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
