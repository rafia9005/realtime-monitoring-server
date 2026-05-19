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

  const getStatusBg = (value: number, warning: number, critical: number) => {
    if (value >= critical) return "bg-red-600";
    if (value >= warning) return "bg-yellow-500";
    return "bg-blue-500";
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

  const cpuUsage = metrics.cpu.usage_percent;
  const memUsage = metrics.memory.used_percent;
  const diskUsage = metrics.disk[0]?.used_percent || 0;
  const totalDiskSize = metrics.disk.reduce((acc, d) => acc + d.total, 0);

  return (
    <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-end justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{metrics.system.hostname}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                {metrics.system.platform} • Architecture: x86_64
              </p>
          </div>
             <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">Status</span>
              <Badge className="rounded-full text-emerald-700 dark:text-emerald-300 border border-emerald-300/50 bg-emerald-50 dark:bg-emerald-950/30 text-sm px-3 py-1 font-medium">
                ● Live
              </Badge>
            </div>
            <Button onClick={() => refetch()} size="icon" variant="ghost" className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Main Stats - Apple Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {/* CPU */}
           <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
             <div className="flex items-start justify-between mb-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                   <Cpu className="w-5 h-5 text-slate-900 dark:text-white" />
                 </div>
                 <div>
                   <div className="text-sm font-semibold text-slate-900 dark:text-white">Processing Power</div>
                   <div className="text-xs text-slate-600 dark:text-slate-400">{metrics.cpu.cores}C / {metrics.cpu.threads}T</div>
                 </div>
               </div>
               <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cpuUsage > 80 ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' : cpuUsage > 60 ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300' : 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'}`}>
                 {cpuUsage > 80 ? "High" : cpuUsage > 60 ? "Medium" : "Normal"}
               </span>
             </div>
            <div className={`text-3xl font-semibold text-slate-900 dark:text-white mb-3`}>
              {cpuUsage.toFixed(1)}%
            </div>
            <div className="space-y-2">
               <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                 <div 
                   className={`h-full rounded-full transition-all duration-500 ${getStatusBg(cpuUsage, 60, 80)}`}
                   style={{ width: `${cpuUsage}%` }}
                 />
               </div>
            </div>
          </div>

           {/* Memory */}
           <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
             <div className="flex items-start justify-between mb-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                   <MemoryStick className="w-5 h-5 text-slate-900 dark:text-white" />
                 </div>
                 <div>
                   <div className="text-sm font-semibold text-slate-900 dark:text-white">Active Memory</div>
                   <div className="text-xs text-slate-600 dark:text-slate-400">{formatBytes(metrics.memory.used)}</div>
                 </div>
               </div>
               <span className={`text-xs font-semibold px-2 py-1 rounded-full ${memUsage > 85 ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' : memUsage > 70 ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300' : 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'}`}>
                 {memUsage > 85 ? "High" : memUsage > 70 ? "Medium" : "Normal"}
               </span>
             </div>
            <div className={`text-3xl font-semibold text-slate-900 dark:text-white mb-3`}>
              {memUsage.toFixed(1)}%
            </div>
            <div className="space-y-2">
               <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                 <div 
                   className={`h-full rounded-full transition-all duration-500 ${getStatusBg(memUsage, 70, 85)}`}
                   style={{ width: `${memUsage}%` }}
                 />
               </div>
            </div>
          </div>

           {/* Disk */}
           <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
             <div className="flex items-start justify-between mb-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                   <HardDrive className="w-5 h-5 text-slate-900 dark:text-white" />
                 </div>
                 <div>
                   <div className="text-sm font-semibold text-slate-900 dark:text-white">Storage</div>
                   <div className="text-xs text-slate-600 dark:text-slate-400">{formatBytes(totalDiskSize)}</div>
                 </div>
               </div>
               <span className={`text-xs font-semibold px-2 py-1 rounded-full ${diskUsage > 90 ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' : diskUsage > 75 ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300' : 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'}`}>
                 {diskUsage > 90 ? "Critical" : diskUsage > 75 ? "Warning" : "Good"}
               </span>
             </div>
            <div className={`text-3xl font-semibold text-slate-900 dark:text-white mb-3`}>
              {diskUsage.toFixed(1)}%
            </div>
            <div className="space-y-2">
               <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                 <div 
                   className={`h-full rounded-full transition-all duration-500 ${getStatusBg(diskUsage, 75, 90)}`}
                   style={{ width: `${diskUsage}%` }}
                 />
               </div>
            </div>
          </div>

           {/* Network */}
           <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
             <div className="flex items-start justify-between mb-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                   <Network className="w-5 h-5 text-slate-900 dark:text-white" />
                 </div>
                 <div>
                   <div className="text-sm font-semibold text-slate-900 dark:text-white">Network</div>
                   <div className="text-xs text-slate-600 dark:text-slate-400">Connections</div>
                 </div>
               </div>
               <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300`}>
                 Active
               </span>
             </div>
             <div className="text-3xl font-semibold text-slate-900 dark:text-white mb-3">
               {metrics.network.connections.established}
             </div>
             <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
               <div>↑ Sent: {formatBytes(metrics.network.bytes_sent)}</div>
               <div>↓ Received: {formatBytes(metrics.network.bytes_recv)}</div>
             </div>
          </div>
        </div>

         {/* Secondary Info Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Uptime</div>
              <div className="text-2xl font-semibold text-slate-900 dark:text-white">{formatUptime(metrics.system.uptime)}</div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Load Average</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{metrics.load.load1.toFixed(2)} / {metrics.load.load5.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Processes</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{metrics.process.running}/{metrics.process.total}</div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Temperature</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{metrics.temperature?.cpu_temp ? `${metrics.temperature.cpu_temp.toFixed(1)}°C` : "N/A"}</div>
            </div>
          </div>

         {/* Environment Metrics Section */}
          {metrics.environment && metrics.environment.length > 0 && (
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Sensors</h2>
                 <Badge variant="outline" className="rounded-full text-sm px-3 py-1">
                   {metrics.environment.length} connected
                 </Badge>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {metrics.environment.map((env) => (
                   <div key={env.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{env.mcu_name}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">{env.mcu_id}</div>
                      </div>
                     
                      <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-3">
                        {/* Temperature */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Temperature</span>
                             <span className={`text-xs font-semibold ${
                              env.temperature && env.temperature >= 30 ? "text-yellow-600 dark:text-yellow-400" : "text-slate-600 dark:text-slate-400"
                            }`}>
                              {env.temperature ? `${env.temperature.toFixed(1)}°C` : "N/A"}
                            </span>
                          </div>
                          {env.temperature && (
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${env.temperature >= 30 ? "bg-yellow-500" : "bg-blue-500"}`}
                                style={{ width: `${Math.min((env.temperature / 40) * 100, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                        
                        {/* Humidity */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Humidity</span>
                             <span className={`text-xs font-semibold ${
                              env.humidity && env.humidity >= 80 ? "text-yellow-600 dark:text-yellow-400" : "text-slate-600 dark:text-slate-400"
                            }`}>
                              {env.humidity ? `${env.humidity.toFixed(1)}%` : "N/A"}
                            </span>
                          </div>
                          {env.humidity && (
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${env.humidity >= 80 ? "bg-yellow-500" : "bg-blue-500"}`}
                                style={{ width: `${Math.min((env.humidity / 100) * 100, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                        {new Date(env.created_at).toLocaleTimeString([], { hour12: false })}
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

         {/* Connected Agents Section */}
         {agents.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Connected Servers</h2>
                <Link to="/agents" className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
                Manage All <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <Link
                  key={agent.id}
                  to={`/server/${agent.id}`}
                  className="group block p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${agent.status === 'online' ? 'bg-green-100 dark:bg-green-950' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        <Server className={`w-5 h-5 ${agent.status === 'online' ? 'text-green-700 dark:text-green-300' : 'text-slate-500 dark:text-slate-400'}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{agent.name}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{agent.hostname}</p>
                      </div>
                    </div>
                    <Badge 
                      className={`rounded-full text-xs px-2 py-0.5 ${agent.status === 'online' ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'} border-0`}
                    >
                      {agent.status === 'online' ? '● Online' : '○ Offline'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3">
                    <div className="flex items-center justify-between">
                      <span>IP Address</span>
                      <span className="text-slate-900 dark:text-white font-medium">{agent.ip_address}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Seen</span>
                      <span className="text-slate-900 dark:text-white font-medium">{new Date(agent.last_seen).toLocaleTimeString([], { hour12: false })}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Navigation Footer */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link to="/monitoring" className="flex-1 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-slate-900 dark:text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Detailed Metrics</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">View real-time charts</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
          </Link>
          <Link to="/terminal" className="flex-1 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <Terminal className="w-5 h-5 text-slate-900 dark:text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Terminal</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Direct access</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
