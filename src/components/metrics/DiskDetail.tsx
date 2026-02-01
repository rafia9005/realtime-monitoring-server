import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useTheme } from "@/components/theme-provider";
import type { DiskMetrics } from "@/types/metrics";

interface DiskDetailProps {
  disks: DiskMetrics[];
  fullscreen?: boolean;
}

export function DiskDetail({ disks, fullscreen = false }: DiskDetailProps) {
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
    if (usage > 90) return "#ef4444";
    if (usage > 75) return "#f59e0b";
    return "#10b981";
  };

  const getStatusBadge = (usage: number) => {
    if (usage > 90) return { label: "Critical", class: "text-red-500 border-red-500/30 bg-red-500/10" };
    if (usage > 75) return { label: "Warning", class: "text-amber-500 border-amber-500/30 bg-amber-500/10" };
    return { label: "Healthy", class: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10" };
  };

  const totalDiskSpace = disks.reduce((acc, disk) => acc + disk.total, 0);
  const totalDiskUsed = disks.reduce((acc, disk) => acc + disk.used, 0);
  const totalDiskFree = disks.reduce((acc, disk) => acc + disk.free, 0);
  const overallUsagePercent = (totalDiskUsed / totalDiskSpace) * 100;

  const chartData = disks.map(disk => ({
    name: disk.mount_point.length > 10 ? disk.mount_point.substring(0, 10) + "..." : disk.mount_point,
    fullName: disk.mount_point,
    usage: parseFloat(disk.used_percent.toFixed(1)),
    used: disk.used,
    free: disk.free,
    total: disk.total
  }));

  if (fullscreen) {
    return (
      <div className="p-6 space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Overall Usage</p>
            <p className={`text-3xl font-bold tabular-nums ${
              overallUsagePercent > 90 ? "text-red-500" : overallUsagePercent > 75 ? "text-amber-500" : "text-emerald-500"
            }`}>{overallUsagePercent.toFixed(1)}%</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Space</p>
            <p className="text-3xl font-bold">{formatBytes(totalDiskSpace)}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Used</p>
            <p className="text-3xl font-bold text-blue-500">{formatBytes(totalDiskUsed)}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Free</p>
            <p className="text-3xl font-bold text-emerald-500">{formatBytes(totalDiskFree)}</p>
          </div>
        </div>

        {/* Usage Chart */}
        {chartData.length > 1 && (
          <div className="p-4 rounded-lg bg-card border border-border">
            <h3 className="font-semibold mb-4">Usage by Partition</h3>
            <ResponsiveContainer width="100%" height={Math.max(200, disks.length * 45)}>
              <BarChart data={chartData} layout="vertical">
                <XAxis 
                  type="number" 
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : "#6b7280" }}
                  stroke={isDark ? "#4b5563" : "#d1d5db"}
                />
                <YAxis 
                  type="category" 
                  dataKey="name"
                  width={80}
                  tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : "#6b7280" }}
                  stroke={isDark ? "#4b5563" : "#d1d5db"}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? "#1f2937" : "white",
                    border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: isDark ? "#f3f4f6" : "#1f2937"
                  }}
                  formatter={(value, name) => {
                    if (name === "usage") {
                      return [`${value}%`, "Usage"];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label) => {
                    const disk = chartData.find(d => d.name === label);
                    return disk?.fullName || label;
                  }}
                />
                <Bar dataKey="usage" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getUsageColor(entry.usage)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* All Partitions */}
        <div className="space-y-4">
          <h3 className="font-semibold">All Partitions</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {disks.map((disk, index) => {
              const status = getStatusBadge(disk.used_percent);
              return (
                <div key={index} className="p-4 rounded-lg bg-card border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{disk.mount_point}</span>
                      {disk.used_percent > 90 && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <Badge variant="outline" className={status.class}>
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{disk.device} • {disk.fs_type}</p>
                  
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ width: `${disk.used_percent}%`, backgroundColor: getUsageColor(disk.used_percent) }}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-semibold">{formatBytes(disk.total)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Used</p>
                      <p className="font-semibold text-blue-500">{formatBytes(disk.used)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Free</p>
                      <p className="font-semibold text-emerald-500">{formatBytes(disk.free)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Usage</p>
                      <p className="font-semibold tabular-nums">{disk.used_percent.toFixed(1)}%</p>
                    </div>
                  </div>

                  {/* Inode info */}
                  {disk.inodes_total && disk.inodes_total > 0 && (
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Inodes</span>
                        <span>
                          {disk.inodes_used?.toLocaleString()} / {disk.inodes_total.toLocaleString()} 
                          ({disk.inodes_used && disk.inodes_total ? ((disk.inodes_used / disk.inodes_total) * 100).toFixed(1) : "0"}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Compact view (default)
  return (
    <div className="p-4 space-y-4">
      {/* Overall Summary */}
      <div className="p-3 rounded-lg bg-secondary/50 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Storage</span>
          <span className="font-semibold tabular-nums">{overallUsagePercent.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-background rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${overallUsagePercent}%`, backgroundColor: getUsageColor(overallUsagePercent) }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatBytes(totalDiskUsed)} used</span>
          <span>{formatBytes(totalDiskSpace)} total</span>
        </div>
      </div>

      {/* Partition List */}
      <div className="space-y-3">
        {disks.map((disk, index) => {
          const status = getStatusBadge(disk.used_percent);
          return (
            <div key={index} className="p-3 rounded-lg bg-secondary/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{disk.mount_point}</span>
                  {disk.used_percent > 90 && (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  )}
                </div>
                <Badge variant="outline" className={`text-xs ${status.class}`}>
                  {status.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{disk.device} • {disk.fs_type}</p>
              <div className="h-1.5 bg-background rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ width: `${disk.used_percent}%`, backgroundColor: getUsageColor(disk.used_percent) }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatBytes(disk.used)} / {formatBytes(disk.total)}</span>
                <span className="font-medium tabular-nums">{disk.used_percent.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
