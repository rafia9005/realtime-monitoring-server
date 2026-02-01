import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useTheme } from "@/components/theme-provider";
import type { CPUMetrics } from "@/types/metrics";

interface CPUDetailProps {
  cpu: CPUMetrics;
  fullscreen?: boolean;
}

export function CPUDetail({ cpu, fullscreen = false }: CPUDetailProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const coreData = cpu.per_core?.map((usage, index) => ({
    name: `C${index}`,
    fullName: `Core ${index}`,
    usage: parseFloat(usage.toFixed(1))
  })) || [];

  const getUsageColor = (usage: number) => {
    if (usage > 80) return "#ef4444";
    if (usage > 60) return "#f59e0b";
    return "#3b82f6";
  };

  const getStatusText = (usage: number) => {
    if (usage > 80) return { text: "High Load", color: "text-red-500" };
    if (usage > 60) return { text: "Moderate", color: "text-amber-500" };
    return { text: "Normal", color: "text-emerald-500" };
  };

  const status = getStatusText(cpu.usage_percent);

  if (fullscreen) {
    return (
      <div className="p-6 space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Usage</p>
            <p className={`text-3xl font-bold tabular-nums ${status.color}`}>{cpu.usage_percent.toFixed(1)}%</p>
            <p className={`text-xs ${status.color}`}>{status.text}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Physical Cores</p>
            <p className="text-3xl font-bold">{cpu.cores}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Logical Cores</p>
            <p className="text-3xl font-bold">{cpu.threads}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Frequency</p>
            <p className="text-3xl font-bold">{cpu.frequency_mhz ? `${(cpu.frequency_mhz / 1000).toFixed(2)}` : "N/A"}</p>
            <p className="text-xs text-muted-foreground">GHz</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Idle</p>
            <p className="text-3xl font-bold text-emerald-500">{cpu.idle_percent?.toFixed(1) || "N/A"}%</p>
          </div>
        </div>

        {/* CPU Model */}
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-1">Processor</p>
          <p className="font-medium">{cpu.model_name || "Unknown CPU"}</p>
        </div>

        {/* CPU Time Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg bg-card border border-border space-y-4">
            <h3 className="font-semibold">Time Distribution</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">User Space</span>
                  <span className="font-semibold text-blue-500 tabular-nums">{cpu.user_percent?.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${cpu.user_percent || 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">System (Kernel)</span>
                  <span className="font-semibold text-purple-500 tabular-nums">{cpu.system_percent?.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-purple-500 transition-all"
                    style={{ width: `${cpu.system_percent || 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Idle</span>
                  <span className="font-semibold text-emerald-500 tabular-nums">{cpu.idle_percent?.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${cpu.idle_percent || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Per Core Usage Chart */}
          {coreData.length > 0 && (
            <div className="p-4 rounded-lg bg-card border border-border">
              <h3 className="font-semibold mb-4">Per Core Usage</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={coreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : "#6b7280" }}
                    stroke={isDark ? "#4b5563" : "#d1d5db"}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : "#6b7280" }}
                    stroke={isDark ? "#4b5563" : "#d1d5db"}
                    domain={[0, 100]}
                    axisLine={false}
                    width={35}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? "#1f2937" : "white",
                      border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: isDark ? "#f3f4f6" : "#1f2937"
                    }}
                    formatter={(value) => [`${value}%`, "Usage"]}
                    labelFormatter={(label) => {
                      const core = coreData.find(c => c.name === label);
                      return core?.fullName || label;
                    }}
                  />
                  <Bar dataKey="usage" radius={[4, 4, 0, 0]}>
                    {coreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getUsageColor(entry.usage)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* All Cores Grid */}
        {coreData.length > 0 && (
          <div className="p-4 rounded-lg bg-card border border-border">
            <h3 className="font-semibold mb-4">All Cores</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {coreData.map((core, index) => (
                <div key={index} className="p-3 rounded-lg bg-secondary/50 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{core.fullName}</p>
                  <p className={`text-lg font-bold tabular-nums ${
                    core.usage > 80 ? "text-red-500" : core.usage > 60 ? "text-amber-500" : "text-blue-500"
                  }`}>
                    {core.usage}%
                  </p>
                  <div className="mt-2 h-1.5 bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ width: `${core.usage}%`, backgroundColor: getUsageColor(core.usage) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Compact view (default)
  return (
    <div className="p-4 space-y-4">
      {/* CPU Info */}
      <div className="text-sm text-muted-foreground">
        {cpu.model_name || "Unknown CPU"}
      </div>

      {/* Overall Usage */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Overall Usage</span>
          <span className="font-semibold tabular-nums">{cpu.usage_percent.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${cpu.usage_percent}%`,
              backgroundColor: getUsageColor(cpu.usage_percent)
            }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="text-xs text-muted-foreground">Cores</p>
          <p className="text-lg font-semibold">{cpu.cores}</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="text-xs text-muted-foreground">Threads</p>
          <p className="text-lg font-semibold">{cpu.threads}</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="text-xs text-muted-foreground">Frequency</p>
          <p className="text-lg font-semibold">{cpu.frequency_mhz ? `${(cpu.frequency_mhz / 1000).toFixed(2)} GHz` : "N/A"}</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="text-xs text-muted-foreground">Idle</p>
          <p className="text-lg font-semibold">{cpu.idle_percent?.toFixed(1) || "N/A"}%</p>
        </div>
      </div>

      {/* CPU Time Distribution */}
      {(cpu.user_percent !== undefined || cpu.system_percent !== undefined) && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Time Distribution</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-16 text-xs text-muted-foreground">User</div>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${cpu.user_percent || 0}%` }}
                />
              </div>
              <div className="w-12 text-xs text-right tabular-nums">{cpu.user_percent?.toFixed(1)}%</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 text-xs text-muted-foreground">System</div>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-purple-500 transition-all"
                  style={{ width: `${cpu.system_percent || 0}%` }}
                />
              </div>
              <div className="w-12 text-xs text-right tabular-nums">{cpu.system_percent?.toFixed(1)}%</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 text-xs text-muted-foreground">Idle</div>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${cpu.idle_percent || 0}%` }}
                />
              </div>
              <div className="w-12 text-xs text-right tabular-nums">{cpu.idle_percent?.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Per Core Chart */}
      {coreData.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Per Core Usage</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={coreData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: isDark ? "#9ca3af" : "#6b7280" }}
                stroke={isDark ? "#4b5563" : "#d1d5db"}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: isDark ? "#9ca3af" : "#6b7280" }}
                stroke={isDark ? "#4b5563" : "#d1d5db"}
                domain={[0, 100]}
                axisLine={false}
                width={30}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? "#1f2937" : "white",
                  border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: isDark ? "#f3f4f6" : "#1f2937"
                }}
                formatter={(value) => [`${value}%`, "Usage"]}
              />
              <Bar dataKey="usage" radius={[4, 4, 0, 0]}>
                {coreData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getUsageColor(entry.usage)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
