import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTheme } from "@/components/theme-provider";
import type { MemoryMetrics } from "@/types/metrics";

interface MemoryDetailProps {
  memory: MemoryMetrics;
  fullscreen?: boolean;
}

export function MemoryDetail({ memory, fullscreen = false }: MemoryDetailProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getUsageColor = (usage: number) => {
    if (usage > 85) return "#ef4444";
    if (usage > 70) return "#f59e0b";
    return "#10b981";
  };

  const getStatusText = (usage: number) => {
    if (usage > 85) return { text: "Critical", color: "text-red-500" };
    if (usage > 70) return { text: "High", color: "text-amber-500" };
    return { text: "Normal", color: "text-emerald-500" };
  };

  const status = getStatusText(memory.used_percent);

  const memoryPieData = [
    { name: "Used", value: memory.used, color: isDark ? "#60a5fa" : "#3b82f6" },
    { name: "Cached", value: memory.cached || 0, color: isDark ? "#a78bfa" : "#8b5cf6" },
    { name: "Buffers", value: memory.buffers || 0, color: isDark ? "#22d3ee" : "#06b6d4" },
    { name: "Free", value: memory.free, color: isDark ? "#34d399" : "#10b981" },
  ].filter(item => item.value > 0);



  if (fullscreen) {
    return (
      <div className="p-6 space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Usage</p>
            <p className={`text-3xl font-bold tabular-nums ${status.color}`}>{memory.used_percent.toFixed(1)}%</p>
            <p className={`text-xs ${status.color}`}>{status.text}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Total RAM</p>
            <p className="text-3xl font-bold">{formatBytes(memory.total)}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Used</p>
            <p className="text-3xl font-bold text-blue-500">{formatBytes(memory.used)}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Available</p>
            <p className="text-3xl font-bold text-emerald-500">{formatBytes(memory.available)}</p>
          </div>
        </div>

        {/* Main Progress Bar */}
        <div className="p-4 rounded-lg bg-card border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">RAM Usage</span>
            <span className="font-semibold tabular-nums">{formatBytes(memory.used)} / {formatBytes(memory.total)}</span>
          </div>
          <div className="h-4 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${memory.used_percent}%`,
                backgroundColor: getUsageColor(memory.used_percent)
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Memory Breakdown */}
          <div className="p-4 rounded-lg bg-card border border-border">
            <h3 className="font-semibold mb-4">Memory Breakdown</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-muted-foreground mb-1">Used</p>
                <p className="text-xl font-bold text-blue-500">{formatBytes(memory.used)}</p>
                <p className="text-xs text-muted-foreground">{memory.used_percent.toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-muted-foreground mb-1">Free</p>
                <p className="text-xl font-bold text-emerald-500">{formatBytes(memory.free)}</p>
                <p className="text-xs text-muted-foreground">{((memory.free / memory.total) * 100).toFixed(1)}%</p>
              </div>
              {memory.cached && memory.cached > 0 && (
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <p className="text-xs text-muted-foreground mb-1">Cached</p>
                  <p className="text-xl font-bold text-purple-500">{formatBytes(memory.cached)}</p>
                  <p className="text-xs text-muted-foreground">{((memory.cached / memory.total) * 100).toFixed(1)}%</p>
                </div>
              )}
              {memory.buffers && memory.buffers > 0 && (
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <p className="text-xs text-muted-foreground mb-1">Buffers</p>
                  <p className="text-xl font-bold text-cyan-500">{formatBytes(memory.buffers)}</p>
                  <p className="text-xs text-muted-foreground">{((memory.buffers / memory.total) * 100).toFixed(1)}%</p>
                </div>
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="p-4 rounded-lg bg-card border border-border">
            <h3 className="font-semibold mb-4">Distribution</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="60%" height={180}>
                <PieChart>
                  <Pie
                    data={memoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {memoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatBytes(value as number)}
                    contentStyle={{ 
                      backgroundColor: isDark ? "#1f2937" : "white",
                      border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: isDark ? "#f3f4f6" : "#1f2937"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {memoryPieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium">{formatBytes(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Swap Memory */}
        {memory.swap.total > 0 && (
          <div className="p-4 rounded-lg bg-card border border-border space-y-4">
            <h3 className="font-semibold">Swap Memory</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">Usage</p>
                <p className={`text-2xl font-bold ${memory.swap.used_percent > 50 ? "text-red-500" : "text-amber-500"}`}>
                  {memory.swap.used_percent.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="text-2xl font-bold">{formatBytes(memory.swap.total)}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">Used</p>
                <p className="text-2xl font-bold text-red-500">{formatBytes(memory.swap.used)}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">Free</p>
                <p className="text-2xl font-bold text-emerald-500">{formatBytes(memory.swap.free)}</p>
              </div>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${memory.swap.used_percent}%`,
                  backgroundColor: memory.swap.used_percent > 50 ? "#ef4444" : "#f59e0b"
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Compact view (default)
  return (
    <div className="p-4 space-y-4">
      {/* RAM Usage */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">RAM Usage</span>
          <span className="font-semibold tabular-nums">{memory.used_percent.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${memory.used_percent}%`,
              backgroundColor: getUsageColor(memory.used_percent)
            }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatBytes(memory.used)} used</span>
          <span>{formatBytes(memory.total)} total</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="text-xs text-muted-foreground">Used</p>
          <p className="text-lg font-semibold text-blue-500">{formatBytes(memory.used)}</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="text-xs text-muted-foreground">Available</p>
          <p className="text-lg font-semibold text-emerald-500">{formatBytes(memory.available)}</p>
        </div>
        {memory.cached && memory.cached > 0 && (
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground">Cached</p>
            <p className="text-lg font-semibold text-purple-500">{formatBytes(memory.cached)}</p>
          </div>
        )}
        {memory.buffers && memory.buffers > 0 && (
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground">Buffers</p>
            <p className="text-lg font-semibold text-cyan-500">{formatBytes(memory.buffers)}</p>
          </div>
        )}
      </div>

      {/* Pie Chart */}
      {memoryPieData.length > 0 && (
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="50%" height={140}>
            <PieChart>
              <Pie
                data={memoryPieData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
              >
                {memoryPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatBytes(value as number)}
                contentStyle={{ 
                  backgroundColor: isDark ? "#1f2937" : "white",
                  border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: isDark ? "#f3f4f6" : "#1f2937"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5">
            {memoryPieData.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-medium">{formatBytes(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Swap */}
      {memory.swap.total > 0 && (
        <div className="pt-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Swap Usage</span>
            <span className="font-semibold tabular-nums">{memory.swap.used_percent.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${memory.swap.used_percent}%`,
                backgroundColor: memory.swap.used_percent > 50 ? "#ef4444" : "#f59e0b"
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatBytes(memory.swap.used)} used</span>
            <span>{formatBytes(memory.swap.total)} total</span>
          </div>
        </div>
      )}
    </div>
  );
}
