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
import { useLanguage } from "@/lib/LanguageContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { data: metrics, loading, error, refetch } = useSystemMetrics(true, 5000);
  const { agents } = useAgentMetrics(true, 10000);
  const { t } = useLanguage();

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


  if (loading && !metrics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t('dashboard.loading')}</p>
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
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('dashboard.error.title')}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
            <Button onClick={() => refetch()} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg mt-4">
              {t('dashboard.error.retry')}
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
  const totalDiskSize = metrics.disk.reduce((acc, d) => acc + d.total, 0);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-foreground/5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-foreground/5 rounded-xl backdrop-blur-3xl border border-foreground/10">
                <Cpu className="w-5 h-5 opacity-60 text-primary" />
              </div>
              <span className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40 italic">{t('dashboard.overview')}</span>
            </div>
            <h1 className="text-6xl font-black tracking-tight uppercase leading-none">
              {metrics.system.hostname} <span className="text-foreground/20">{metrics.system.platform.split(" ")[0]}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 italic font-bold">{t('dashboard.status')}</span>
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-2 rounded-full backdrop-blur-3xl flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                {t('dashboard.live')}
              </span>
            </div>
            <Button onClick={() => refetch()} variant="outline" className="h-14 w-14 rounded-2xl border-foreground/10 bg-background/50 backdrop-blur-3xl hover:bg-foreground/5 transition-all active:scale-95 flex items-center justify-center">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {/* CPU */}
           <div className="group p-8 bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[2.5rem] space-y-4 hover:border-foreground/10 transition-all duration-500">
             <div className="flex items-start justify-between">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-foreground/5 rounded-2xl flex items-center justify-center border border-foreground/10">
                   <Cpu className="w-5 h-5 text-foreground/60" />
                 </div>
                 <div>
                   <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{t('dashboard.cards.cpu.title')}</div>
                   <div className="text-xs font-bold tracking-tight opacity-60 font-mono italic">{metrics.cpu.cores}C / {metrics.cpu.threads}T</div>
                 </div>
               </div>
               <span className={`text-[8px] font-black tracking-widest px-3 py-1 rounded-full uppercase border ${
                 cpuUsage > 80 
                   ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                   : cpuUsage > 60 
                     ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                     : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
               }`}>
                 {cpuUsage > 80 ? t('dashboard.cards.cpu.high') : cpuUsage > 60 ? t('dashboard.cards.cpu.medium') : t('dashboard.cards.cpu.normal')}
               </span>
             </div>
             <div className="flex items-baseline gap-1">
               <p className="text-4xl font-black group-hover:scale-105 transition-all duration-500">{cpuUsage.toFixed(1)}</p>
               <span className="text-sm font-black opacity-30 italic">%</span>
             </div>
             <div className="space-y-2">
                <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      cpuUsage > 80 ? "bg-red-500" : cpuUsage > 60 ? "bg-amber-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${cpuUsage}%` }}
                  />
                </div>
             </div>
           </div>

           {/* Memory */}
           <div className="group p-8 bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[2.5rem] space-y-4 hover:border-foreground/10 transition-all duration-500">
             <div className="flex items-start justify-between">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-foreground/5 rounded-2xl flex items-center justify-center border border-foreground/10">
                   <MemoryStick className="w-5 h-5 text-foreground/60" />
                 </div>
                 <div>
                   <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{t('dashboard.cards.memory.title')}</div>
                   <div className="text-xs font-bold tracking-tight opacity-60 font-mono italic">{formatBytes(metrics.memory.used)}</div>
                 </div>
               </div>
               <span className={`text-[8px] font-black tracking-widest px-3 py-1 rounded-full uppercase border ${
                 memUsage > 85 
                   ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                   : memUsage > 70 
                     ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                     : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
               }`}>
                 {memUsage > 85 ? t('dashboard.cards.memory.high') : memUsage > 70 ? t('dashboard.cards.memory.medium') : t('dashboard.cards.memory.normal')}
               </span>
             </div>
             <div className="flex items-baseline gap-1">
               <p className="text-4xl font-black group-hover:scale-105 transition-all duration-500">{memUsage.toFixed(1)}</p>
               <span className="text-sm font-black opacity-30 italic">%</span>
             </div>
             <div className="space-y-2">
                <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      memUsage > 85 ? "bg-red-500" : memUsage > 70 ? "bg-amber-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${memUsage}%` }}
                  />
                </div>
             </div>
           </div>

           {/* Disk */}
           <div className="group p-8 bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[2.5rem] space-y-4 hover:border-foreground/10 transition-all duration-500">
             <div className="flex items-start justify-between">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-foreground/5 rounded-2xl flex items-center justify-center border border-foreground/10">
                   <HardDrive className="w-5 h-5 text-foreground/60" />
                 </div>
                 <div>
                   <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{t('dashboard.cards.disk.title')}</div>
                   <div className="text-xs font-bold tracking-tight opacity-60 font-mono italic">{formatBytes(totalDiskSize)}</div>
                 </div>
               </div>
               <span className={`text-[8px] font-black tracking-widest px-3 py-1 rounded-full uppercase border ${
                 diskUsage > 90 
                   ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                   : diskUsage > 75 
                     ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                     : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
               }`}>
                 {diskUsage > 90 ? t('dashboard.cards.disk.critical') : diskUsage > 75 ? t('dashboard.cards.disk.warning') : t('dashboard.cards.disk.good')}
               </span>
             </div>
             <div className="flex items-baseline gap-1">
               <p className="text-4xl font-black group-hover:scale-105 transition-all duration-500">{diskUsage.toFixed(1)}</p>
               <span className="text-sm font-black opacity-30 italic">%</span>
             </div>
             <div className="space-y-2">
                <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      diskUsage > 90 ? "bg-red-500" : diskUsage > 75 ? "bg-amber-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${diskUsage}%` }}
                  />
                </div>
             </div>
           </div>

           {/* Network */}
           <div className="group p-8 bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[2.5rem] space-y-4 hover:border-foreground/10 transition-all duration-500">
             <div className="flex items-start justify-between">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-foreground/5 rounded-2xl flex items-center justify-center border border-foreground/10">
                   <Network className="w-5 h-5 text-foreground/60" />
                 </div>
                 <div>
                   <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{t('dashboard.cards.network.title')}</div>
                   <div className="text-xs font-bold tracking-tight opacity-60 font-mono italic">{t('dashboard.cards.network.connections')}</div>
                 </div>
               </div>
               <span className="text-[8px] font-black tracking-widest px-3 py-1 rounded-full uppercase border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                 {t('dashboard.cards.network.active')}
               </span>
             </div>
             <div className="flex items-baseline gap-1">
               <p className="text-4xl font-black group-hover:scale-105 transition-all duration-500">{metrics.network.connections.established}</p>
               <span className="text-xs font-black opacity-30 italic font-mono uppercase tracking-widest">{t('dashboard.cards.network.connLabel')}</span>
             </div>
             <div className="text-[10px] font-black uppercase tracking-wider opacity-60 space-y-1 font-mono italic">
               <div>↑ {t('dashboard.cards.network.sent')} {formatBytes(metrics.network.bytes_sent)}</div>
               <div>↓ {t('dashboard.cards.network.received')} {formatBytes(metrics.network.bytes_recv)}</div>
             </div>
           </div>
        </div>

        {/* Secondary Info Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[1.5rem] space-y-1">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{t('dashboard.info.uptime')}</div>
            <div className="text-2xl font-black tracking-tight">{formatUptime(metrics.system.uptime)}</div>
          </div>
          <div className="p-6 bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[1.5rem] space-y-1">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{t('dashboard.info.loadAverage')}</div>
            <div className="text-lg font-black tracking-tight font-mono">{metrics.load.load1.toFixed(2)} / {metrics.load.load5.toFixed(2)}</div>
          </div>
          <div className="p-6 bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[1.5rem] space-y-1">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{t('dashboard.info.processes')}</div>
            <div className="text-lg font-black tracking-tight font-mono">{metrics.process.running}/{metrics.process.total}</div>
          </div>
          <div className="p-6 bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[1.5rem] space-y-1">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{t('dashboard.info.temperature')}</div>
            <div className="text-lg font-black tracking-tight font-mono">{metrics.temperature?.cpu_temp ? `${metrics.temperature.cpu_temp.toFixed(1)}°C` : "N/A"}</div>
          </div>
        </div>

        {/* Environment Metrics Section */}
        {metrics.environment && metrics.environment.length > 0 && (
          <div className="space-y-6">
             <div className="flex items-center justify-between border-b border-foreground/5 pb-4">
               <h2 className="text-2xl font-black uppercase tracking-tight italic">{t('dashboard.sensors.title')}</h2>
               <Badge variant="outline" className="rounded-full text-[10px] font-black uppercase tracking-widest bg-foreground/5 border-foreground/10 px-3 py-1">
                 {metrics.environment.length} {t('dashboard.sensors.connected')}
               </Badge>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {metrics.environment.map((env) => (
                 <div key={env.id} className="p-6 bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[2rem] space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-black tracking-tight uppercase">{env.mcu_name}</div>
                        <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest font-mono italic">{env.mcu_id}</div>
                      </div>
                      <span className="text-[9px] font-black opacity-30 font-mono">{new Date(env.created_at).toLocaleTimeString([], { hour12: false })}</span>
                    </div>
                   
                    <div className="space-y-3 border-t border-foreground/5 pt-3">
                      {/* Temperature */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{t('mcuSensors.chart.temp')}</span>
                           <span className="text-xs font-black">
                            {env.temperature ? `${env.temperature.toFixed(1)}°C` : "N/A"}
                          </span>
                        </div>
                        {env.temperature && (
                          <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${env.temperature >= 30 ? "bg-orange-500" : "bg-blue-500"}`}
                              style={{ width: `${Math.min((env.temperature / 40) * 100, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Humidity */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{t('mcuSensors.stats.humidity')}</span>
                           <span className="text-xs font-black">
                            {env.humidity ? `${env.humidity.toFixed(1)}%` : "N/A"}
                          </span>
                        </div>
                        {env.humidity && (
                          <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${env.humidity >= 80 ? "bg-orange-500" : "bg-blue-500"}`}
                              style={{ width: `${Math.min((env.humidity / 100) * 100, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* Connected Agents Section */}
        {agents.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-foreground/5 pb-4">
              <h2 className="text-2xl font-black uppercase tracking-tight italic">{t('dashboard.servers.title')}</h2>
              <Link to="/agents" className="text-sm font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-1">
                {t('dashboard.servers.manageAll')} <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Link
                  key={agent.id}
                  to={`/server/${agent.id}`}
                  className="group block p-6 bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[2rem] hover:border-foreground/10 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                        agent.status === 'online' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                          : 'bg-foreground/5 border-foreground/10 text-muted-foreground'
                      }`}>
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black tracking-tight uppercase">{agent.name}</h3>
                        <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest font-mono italic">{agent.hostname}</p>
                      </div>
                    </div>
                    <span className={`text-[8px] font-black tracking-widest px-3 py-1 rounded-full uppercase border ${
                      agent.status === 'online' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-foreground/5 text-muted-foreground border-foreground/10'
                    }`}>
                      {agent.status === 'online' ? t('dashboard.servers.online') : t('dashboard.servers.offline')}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-[10px] font-black uppercase tracking-wider opacity-60 border-t border-foreground/5 pt-4 font-mono italic">
                    <div className="flex items-center justify-between">
                      <span>{t('dashboard.servers.ipAddress')}</span>
                      <span className="font-bold opacity-100">{agent.ip_address}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('dashboard.servers.lastSeen')}</span>
                      <span className="font-bold opacity-100">{new Date(agent.last_seen).toLocaleTimeString([], { hour12: false })}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Navigation Footer */}
        <div className="flex flex-col sm:flex-row gap-6 pt-4">
          <Link to="/monitoring" className="flex-1 p-6 bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[2rem] hover:border-foreground/10 transition-all duration-300 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center border border-foreground/10">
                <Activity className="w-5 h-5 text-foreground/60" />
              </div>
              <div>
                <div className="text-sm font-black tracking-tight uppercase">{t('dashboard.quickNav.metrics.title')}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 italic">{t('dashboard.quickNav.metrics.desc')}</div>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all" />
          </Link>
          <Link to="/terminal" className="flex-1 p-6 bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[2rem] hover:border-foreground/10 transition-all duration-300 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center border border-foreground/10">
                <Terminal className="w-5 h-5 text-foreground/60" />
              </div>
              <div>
                <div className="text-sm font-black tracking-tight uppercase">{t('dashboard.quickNav.terminal.title')}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 italic">{t('dashboard.quickNav.terminal.desc')}</div>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all" />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
