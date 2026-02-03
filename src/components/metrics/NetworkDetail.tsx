import { Badge } from "@/components/ui/badge";
import { Wifi, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/components/theme-provider";
import type { NetworkMetrics } from "@/types/metrics";

interface NetworkDetailProps {
  network: NetworkMetrics;
  fullscreen?: boolean;
}

export function NetworkDetail({ network, fullscreen = false }: NetworkDetailProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const hasErrors = (network.errors_in + network.errors_out + network.drop_in + network.drop_out) > 0;

  const connectionData = [
    { name: "Established", value: network.connections.established, color: isDark ? "#34d399" : "#10b981" },
    { name: "Listen", value: network.connections.listen, color: isDark ? "#60a5fa" : "#3b82f6" },
    { name: "Time Wait", value: network.connections.time_wait, color: isDark ? "#fbbf24" : "#f59e0b" },
    { name: "Close Wait", value: network.connections.close_wait, color: "#ef4444" },
  ].filter(item => item.value > 0);

  if (fullscreen) {
    return (
      <div className="p-6 space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Connections</p>
            <p className="text-3xl font-bold">{network.connections.total}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Established</p>
            <p className="text-3xl font-bold text-emerald-500">{network.connections.established}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Sent</p>
            <p className="text-3xl font-bold text-blue-500">{formatBytes(network.bytes_sent)}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Received</p>
            <p className="text-3xl font-bold text-emerald-500">{formatBytes(network.bytes_recv)}</p>
          </div>
        </div>

        {/* Traffic Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <h3 className="font-semibold text-blue-500 mb-4">Outbound Traffic</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Bytes Sent</p>
                <p className="text-2xl font-bold">{formatBytes(network.bytes_sent)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Packets Sent</p>
                <p className="text-2xl font-bold">{network.packets_sent.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Errors Out</p>
                <p className={`text-2xl font-bold ${network.errors_out > 0 ? "text-red-500" : ""}`}>
                  {network.errors_out.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Drops Out</p>
                <p className={`text-2xl font-bold ${network.drop_out > 0 ? "text-amber-500" : ""}`}>
                  {network.drop_out.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <h3 className="font-semibold text-emerald-500 mb-4">Inbound Traffic</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Bytes Received</p>
                <p className="text-2xl font-bold">{formatBytes(network.bytes_recv)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Packets Received</p>
                <p className="text-2xl font-bold">{network.packets_recv.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Errors In</p>
                <p className={`text-2xl font-bold ${network.errors_in > 0 ? "text-red-500" : ""}`}>
                  {network.errors_in.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Drops In</p>
                <p className={`text-2xl font-bold ${network.drop_in > 0 ? "text-amber-500" : ""}`}>
                  {network.drop_in.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Connection States */}
        <div className="p-4 rounded-lg bg-card border border-border">
          <h3 className="font-semibold mb-4">Connection States</h3>
          <div className="flex flex-col gap-6">
            {connectionData.length > 0 && (
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={250} maxHeight={250}>
                  <PieChart>
                    <Pie
                      data={connectionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {connectionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
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
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-muted-foreground mb-1">Established</p>
                <p className="text-2xl md:text-3xl font-bold text-emerald-500">{network.connections.established}</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-muted-foreground mb-1">Listening</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-500">{network.connections.listen}</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-muted-foreground mb-1">Time Wait</p>
                <p className="text-2xl md:text-3xl font-bold text-amber-500">{network.connections.time_wait}</p>
              </div>
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-muted-foreground mb-1">Close Wait</p>
                <p className="text-2xl md:text-3xl font-bold text-red-500">{network.connections.close_wait}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Network Interfaces */}
        {network.interfaces && network.interfaces.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Network Interfaces</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {network.interfaces.map((iface, index) => (
                <div key={index} className="p-4 rounded-lg bg-card border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold">{iface.name}</span>
                    </div>
                    {iface.mtu && (
                      <Badge variant="outline" className="text-xs">MTU: {iface.mtu}</Badge>
                    )}
                  </div>

                  {iface.addrs && iface.addrs.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">IP Addresses</p>
                      <div className="flex flex-wrap gap-1">
                        {iface.addrs.map((addr, addrIdx) => (
                          <span key={addrIdx} className="text-xs px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded">
                            {addr}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Sent</p>
                      <p className="font-semibold text-blue-500">{formatBytes(iface.bytes_sent)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Received</p>
                      <p className="font-semibold text-emerald-500">{formatBytes(iface.bytes_recv)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pkts Out</p>
                      <p className="font-semibold">{iface.packets_sent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pkts In</p>
                      <p className="font-semibold">{iface.packets_recv.toLocaleString()}</p>
                    </div>
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
      {/* Traffic Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs text-muted-foreground">Sent</p>
          <p className="text-lg font-semibold text-blue-500">{formatBytes(network.bytes_sent)}</p>
          <p className="text-xs text-muted-foreground">{network.packets_sent.toLocaleString()} packets</p>
        </div>
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-xs text-muted-foreground">Received</p>
          <p className="text-lg font-semibold text-emerald-500">{formatBytes(network.bytes_recv)}</p>
          <p className="text-xs text-muted-foreground">{network.packets_recv.toLocaleString()} packets</p>
        </div>
      </div>

      {/* Errors Warning */}
      {hasErrors && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-medium mb-2">
            <AlertCircle className="w-4 h-4" />
            Errors Detected
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Err In</p>
              <p className="font-semibold text-red-500">{network.errors_in}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Err Out</p>
              <p className="font-semibold text-red-500">{network.errors_out}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Drop In</p>
              <p className="font-semibold text-amber-500">{network.drop_in}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Drop Out</p>
              <p className="font-semibold text-amber-500">{network.drop_out}</p>
            </div>
          </div>
        </div>
      )}

      {/* Connection States */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Connection States</p>
        <div className="flex items-center gap-4">
          {connectionData.length > 0 && (
            <ResponsiveContainer width="40%" height={100}>
              <PieChart>
                <Pie
                  data={connectionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {connectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
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
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Established</span>
              <span className="font-medium">{network.connections.established}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">Listen</span>
              <span className="font-medium">{network.connections.listen}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">Time Wait</span>
              <span className="font-medium">{network.connections.time_wait}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Close Wait</span>
              <span className="font-medium">{network.connections.close_wait}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Network Interfaces */}
      {network.interfaces && network.interfaces.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Interfaces</p>
          <div className="space-y-2">
            {network.interfaces.slice(0, 4).map((iface, index) => (
              <div key={index} className="p-3 rounded-lg bg-secondary/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-medium text-sm">{iface.name}</span>
                  </div>
                  {iface.mtu && (
                    <Badge variant="outline" className="text-[10px]">MTU: {iface.mtu}</Badge>
                  )}
                </div>
                {iface.addrs && iface.addrs.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {iface.addrs.slice(0, 2).map((addr, addrIdx) => (
                      <span key={addrIdx} className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded">
                        {addr}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>↑ {formatBytes(iface.bytes_sent)}</span>
                  <span>↓ {formatBytes(iface.bytes_recv)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
