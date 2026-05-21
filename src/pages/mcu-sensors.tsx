import DashboardLayout from "@/components/DashboardLayout";
import { useMcuMetrics } from "@/lib/hooks/useMcuMetrics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Download,
  RefreshCw,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Thermometer,
  Waves,
  Calendar,
  Filter,
  Activity,
  Server
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function McuSensorsPage() {
  const { t } = useLanguage();
  const { data: metrics, loading, refetch } = useMcuMetrics(true, 10000);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedMcu, setSelectedMcu] = useState<string>("");
  const [timePeriod, setTimePeriod] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  const mcuIds = useMemo(() => {
    const ids = new Set(metrics.map((m) => m.mcu_id || "unknown"));
    return Array.from(ids);
  }, [metrics]);

  const filteredData = useMemo(() => {
    let filtered = [...metrics];
    if (selectedMcu) filtered = filtered.filter((m) => (m.mcu_id || "unknown") === selectedMcu);
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((m) => new Date(m.created_at) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((m) => new Date(m.created_at) <= end);
    }
    if (timePeriod !== "all") {
      const now = new Date();
      let cutoffDate = new Date();
      switch (timePeriod) {
        case "24h": cutoffDate.setHours(now.getHours() - 24); break;
        case "7d": cutoffDate.setDate(now.getDate() - 7); break;
        case "30d": cutoffDate.setDate(now.getDate() - 30); break;
      }
      filtered = filtered.filter((m) => new Date(m.created_at) >= cutoffDate);
    }
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [metrics, startDate, endDate, selectedMcu, timePeriod]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredData.slice(startIdx, startIdx + pageSize);
  }, [filteredData, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [selectedMcu, startDate, endDate, timePeriod]);

  const chartData = useMemo(() => {
    return filteredData.slice().reverse().map((m) => ({
      timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(m.created_at).toLocaleDateString(),
      temperature: m.temperature || 0,
      humidity: m.humidity || 0,
    }));
  }, [filteredData]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) return { avgTemp: 0, maxTemp: 0, minTemp: 0, avgHumidity: 0, maxHumidity: 0 };
    const temps = filteredData.filter((m) => m.temperature !== null).map((m) => m.temperature!);
    const humidities = filteredData.filter((m) => m.humidity !== null).map((m) => m.humidity!);
    return {
      avgTemp: temps.length > 0 ? temps.reduce((a, b) => a + b) / temps.length : 0,
      maxTemp: temps.length > 0 ? Math.max(...temps) : 0,
      minTemp: temps.length > 0 ? Math.min(...temps) : 0,
      avgHumidity: humidities.length > 0 ? humidities.reduce((a, b) => a + b) / humidities.length : 0,
      maxHumidity: humidities.length > 0 ? Math.max(...humidities) : 0,
    };
  }, [filteredData]);

  const exportToCsv = () => {
    if (filteredData.length === 0) return;
    const headers = ["MCU Name", "MCU ID", "Temperature (C)", "Humidity (%)", "Timestamp"];
    const rows = filteredData.map((m) => [m.mcu_name || "Unknown", m.mcu_id || "Unknown", m.temperature?.toFixed(2) || "N/A", m.humidity?.toFixed(2) || "N/A", new Date(m.created_at).toLocaleString()]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `env-telemetry-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (loading && metrics.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
           <div className="w-12 h-12 border-4 border-foreground/5 border-t-foreground rounded-full animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">{t('mcuSensors.loading')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-foreground/5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-foreground/5 rounded-xl backdrop-blur-3xl border border-foreground/10">
                <Thermometer className="w-5 h-5 opacity-60 text-orange-500" />
              </div>
              <span className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40 italic">{t('mcuSensors.header.subtitle')}</span>
            </div>
            <h1 className="text-6xl font-black tracking-tight uppercase leading-none">
              {t('mcuSensors.header.title')} <span className="text-foreground/20">{t('mcuSensors.header.titleHighlight')}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <Button onClick={() => refetch()} variant="outline" className="h-14 w-14 rounded-2xl border-foreground/10 bg-background/50 backdrop-blur-3xl hover:bg-foreground/5 transition-all active:scale-95">
                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
             </Button>
             <Button onClick={exportToCsv} className="h-14 px-8 bg-foreground text-background rounded-2xl font-black tracking-widest uppercase hover:bg-foreground/90 transition-all active:scale-95 shadow-2xl flex gap-3 italic">
                <Download className="w-5 h-5 font-black" />
                {t('mcuSensors.header.dumpLogs')}
             </Button>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
           <div className="group p-8 bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[2.5rem] space-y-4 hover:border-orange-500/20 transition-all duration-500">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{t('mcuSensors.stats.avgTemp')}</span>
                 <Thermometer className="w-4 h-4 opacity-20 group-hover:text-orange-500 transition-colors" />
              </div>
              <div className="flex items-baseline gap-1">
                 <p className="text-4xl font-black group-hover:scale-105 transition-transform duration-500">{stats.avgTemp.toFixed(1)}</p>
                 <span className="text-sm font-black opacity-30 italic">°C</span>
              </div>
           </div>
           <div className="group p-8 bg-orange-500/[0.03] backdrop-blur-3xl border border-orange-500/10 rounded-[2.5rem] space-y-4">
              <div className="flex items-center justify-between font-black uppercase tracking-[0.2em] text-[10px] text-orange-500/60 font-bold">
                 <span>{t('mcuSensors.stats.peakHeat')}</span>
                 <TrendingUp className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-1">
                 <p className="text-4xl font-black text-orange-500">{stats.maxTemp.toFixed(1)}</p>
                 <span className="text-sm font-black opacity-30 italic text-orange-500">°C</span>
              </div>
           </div>
           <div className="group p-8 bg-blue-500/[0.03] backdrop-blur-3xl border border-blue-500/10 rounded-[2.5rem] space-y-4">
              <div className="flex items-center justify-between font-black uppercase tracking-[0.2em] text-[10px] text-blue-500/60 font-bold">
                 <span>{t('mcuSensors.stats.trough')}</span>
                 <TrendingUp className="w-4 h-4 rotate-180" />
              </div>
              <div className="flex items-baseline gap-1">
                 <p className="text-4xl font-black text-blue-500">{stats.minTemp.toFixed(1)}</p>
                 <span className="text-sm font-black opacity-30 italic text-blue-500">°C</span>
              </div>
           </div>
           <div className="group p-8 bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[2.5rem] space-y-4 hover:border-cyan-500/20 transition-all duration-500">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{t('mcuSensors.stats.humidity')}</span>
                 <Waves className="w-4 h-4 opacity-20 group-hover:text-cyan-500 transition-colors" />
              </div>
              <div className="flex items-baseline gap-1">
                 <p className="text-4xl font-black">{stats.avgHumidity.toFixed(1)}</p>
                 <span className="text-sm font-black opacity-30 italic">%</span>
              </div>
           </div>
           <div className="hidden lg:block group p-8 bg-primary/5 backdrop-blur-3xl border border-primary/10 rounded-[2.5rem] space-y-4 overflow-hidden relative">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] -mr-32 -mt-32 opacity-20" />
              <div className="relative z-10 flex items-center justify-between text-primary/60 font-black uppercase tracking-[0.2em] text-[10px]">
                 <span>{t('mcuSensors.stats.totalDatapoints')}</span>
                 <Activity className="w-4 h-4" />
              </div>
              <p className="relative z-10 text-4xl font-black text-primary">{filteredData.length}</p>
           </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[2.5rem] p-8 space-y-8">
           <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 opacity-40" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">{t('mcuSensors.filters.title')}</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1 italic font-bold">{t('mcuSensors.filters.range')}</label>
                 <select
                   value={timePeriod}
                   onChange={(e) => setTimePeriod(e.target.value)}
                   className="w-full h-14 bg-foreground/[0.03] border-none rounded-2xl px-5 text-sm font-bold focus:ring-2 ring-foreground/10 outline-none appearance-none cursor-pointer hover:bg-foreground/[0.06] transition-colors font-mono"
                 >
                   <option value="all">{t('mcuSensors.filters.options.allHistory')}</option>
                   <option value="24h">{t('mcuSensors.filters.options.last24h')}</option>
                   <option value="7d">{t('mcuSensors.filters.options.last7d')}</option>
                   <option value="30d">{t('mcuSensors.filters.options.last30d')}</option>
                 </select>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1 italic font-bold">{t('mcuSensors.filters.identity')}</label>
                 <select
                   value={selectedMcu}
                   onChange={(e) => setSelectedMcu(e.target.value)}
                   className="w-full h-14 bg-foreground/[0.03] border-none rounded-2xl px-5 text-sm font-bold focus:ring-2 ring-foreground/10 outline-none appearance-none cursor-pointer hover:bg-foreground/[0.06] transition-colors font-mono"
                 >
                   <option value="">{t('mcuSensors.filters.options.globalArray')}</option>
                   {mcuIds.map((id) => (
                     <option key={id} value={id}>{id.toUpperCase()}</option>
                   ))}
                 </select>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1 italic font-bold">{t('mcuSensors.filters.start')}</label>
                 <div className="relative">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-14 bg-foreground/[0.03] border-none rounded-2xl px-5 font-bold focus:ring-foreground/10"
                    />
                    <Calendar className="absolute right-4 top-4 w-5 h-5 opacity-20 pointer-events-none" />
                 </div>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1 italic font-bold">{t('mcuSensors.filters.end')}</label>
                 <div className="relative">
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-14 bg-foreground/[0.03] border-none rounded-2xl px-5 font-bold focus:ring-foreground/10"
                    />
                    <Calendar className="absolute right-4 top-4 w-5 h-5 opacity-20 pointer-events-none" />
                 </div>
              </div>
           </div>
        </div>

        {/* Visual Analytics */}
        <div className="bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[3rem] p-12 space-y-12 overflow-hidden relative group">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/[0.03] blur-[120px] rounded-full pointer-events-none -mr-64 -mt-64" />
           <div className="flex items-center justify-between relative z-10">
              <div className="space-y-2">
                 <h3 className="text-2xl font-black tracking-tighter uppercase leading-none">{t('mcuSensors.chart.title')}</h3>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">{t('mcuSensors.chart.subtitle')}</p>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{t('mcuSensors.chart.temp')}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{t('mcuSensors.chart.humidity')}</span>
                 </div>
              </div>
           </div>
           
           <div className="h-[450px] w-full relative z-10 px-4">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="timestamp" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900}} 
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900}} 
                    />
                    <Tooltip 
                      contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', padding: '20px'}}
                      labelStyle={{fontWeight: 900, marginBottom: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontSize: '10px', letterSpacing: '0.1em'}}
                      itemStyle={{color: '#fff', fontSize: '14px', fontWeight: 900}}
                    />
                    <Area type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorTemp)" />
                    <Area type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorHum)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                    <Activity className="w-12 h-12" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">{t('mcuSensors.chart.unavailable')}</p>
                </div>
              )}
           </div>
        </div>

        {/* Binary Table Section */}
        <div className="bg-card/40 backdrop-blur-3xl border border-foreground/5 rounded-[3rem] overflow-hidden">
          <div className="px-12 py-10 flex items-center justify-between border-b border-foreground/5">
             <div className="space-y-1">
                <h3 className="text-2xl font-black tracking-tighter uppercase leading-none italic">{t('mcuSensors.journal.title')}</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">{t('mcuSensors.journal.subtitle')}</p>
             </div>
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">{t('mcuSensors.journal.live')}</span>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 bg-foreground/5 px-4 py-2 rounded-full border border-foreground/10">
                   {t('mcuSensors.journal.totalEntries', { count: filteredData.length })}
                </div>
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-foreground/[0.02] border-b border-foreground/5">
                  <th className="px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] opacity-30 italic">{t('mcuSensors.journal.table.target')}</th>
                  <th className="px-8 py-8 text-[11px] font-black uppercase tracking-[0.3em] opacity-30 italic text-center">{t('mcuSensors.journal.table.thermal')}</th>
                  <th className="px-8 py-8 text-[11px] font-black uppercase tracking-[0.3em] opacity-30 italic text-center">{t('mcuSensors.journal.table.moisture')}</th>
                  <th className="px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] opacity-30 italic text-right">{t('mcuSensors.journal.table.timestamp')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/[0.03]">
                {paginatedData.map((metric, idx) => (
                  <tr key={idx} className="hover:bg-foreground/[0.02] transition-colors group">
                    <td className="px-12 py-8">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-card/60 rounded-2xl flex items-center justify-center border border-foreground/5 shadow-inner group-hover:bg-primary/10 transition-colors">
                             <Server className="w-5 h-5 opacity-40 group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                             <p className="text-sm font-black tracking-tighter uppercase italic">{metric.mcu_name || "UNKNOWN_NODE"}</p>
                             <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest font-mono italic">{metric.mcu_id}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-8">
                       <div className="flex flex-col items-center gap-1 group/val">
                          <div className="flex items-baseline gap-1">
                             <span className="text-lg font-black">{metric.temperature?.toFixed(1) || "---"}</span>
                             <span className="text-[10px] font-bold opacity-30 italic italic">°C</span>
                          </div>
                          <div className="w-12 h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-orange-500 transition-all duration-1000" 
                                style={{width: `${Math.min(100, Math.max(0, ((metric.temperature || 0) - 20) * 5))}%`}} 
                             />
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-8 text-center">
                       <div className="flex flex-col items-center gap-1">
                          <div className="flex items-baseline gap-1">
                             <span className="text-lg font-black">{metric.humidity?.toFixed(1) || "---"}</span>
                             <span className="text-[10px] font-bold opacity-30 italic italic">%</span>
                          </div>
                          <div className="w-12 h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-blue-500 transition-all duration-1000" 
                                style={{width: `${metric.humidity || 0}%`}} 
                             />
                          </div>
                       </div>
                    </td>
                    <td className="px-12 py-8 text-right">
                       <div className="flex flex-col items-end gap-1">
                          <p className="text-xs font-black tracking-tight uppercase opacity-60 italic">{new Date(metric.created_at).toLocaleTimeString()}</p>
                          <p className="text-[9px] font-bold opacity-20 uppercase tracking-widest">{new Date(metric.created_at).toLocaleDateString()}</p>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {paginatedData.length === 0 && (
              <div className="py-24 flex flex-col items-center gap-4 opacity-20 italic">
                 <AlertCircle className="w-12 h-12" />
                 <p className="text-[10px] font-black uppercase tracking-[0.5em]">{t('mcuSensors.journal.empty')}</p>
              </div>
            )}
          </div>

          {/* Pagination Glass Footer */}
          {totalPages > 1 && (
            <div className="px-12 py-8 bg-foreground/[0.01] border-t border-foreground/5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 italic">
                {t('mcuSensors.journal.pagination', { current: currentPage, total: totalPages, count: filteredData.length })}
              </span>
              <div className="flex gap-4">
                 <Button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="h-14 w-14 rounded-2xl border-foreground/10 bg-background hover:bg-foreground/5 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 opacity-40" />
                 </Button>
                 <Button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="h-14 w-14 rounded-2xl border-foreground/10 bg-background hover:bg-foreground/5 transition-all"
                  >
                    <ChevronRight className="w-5 h-5 opacity-40" />
                 </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
