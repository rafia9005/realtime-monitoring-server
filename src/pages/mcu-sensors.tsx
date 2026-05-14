import DashboardLayout from "@/components/DashboardLayout";
import { useMcuMetrics } from "@/lib/hooks/useMcuMetrics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertCircle,
  Download,
  RefreshCw,
  TrendingUp,
  Droplets,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function McuSensorsPage() {
  const { data: metrics, loading, error, refetch } = useMcuMetrics(true, 10000);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedMcu, setSelectedMcu] = useState<string>("");
  const [timePeriod, setTimePeriod] = useState<string>("all");

  // Get unique MCU IDs for filter
  const mcuIds = useMemo(() => {
    const ids = new Set(metrics.map((m) => m.mcu_id || "unknown"));
    return Array.from(ids);
  }, [metrics]);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    let filtered = [...metrics];

    // Filter by MCU ID
    if (selectedMcu) {
      filtered = filtered.filter((m) => (m.mcu_id || "unknown") === selectedMcu);
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(
        (m) => new Date(m.created_at) >= start
      );
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (m) => new Date(m.created_at) <= end
      );
    }

    // Filter by time period
    if (timePeriod !== "all") {
      const now = new Date();
      let cutoffDate = new Date();

      switch (timePeriod) {
        case "24h":
          cutoffDate.setHours(now.getHours() - 24);
          break;
        case "7d":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          cutoffDate.setDate(now.getDate() - 30);
          break;
      }

      filtered = filtered.filter(
        (m) => new Date(m.created_at) >= cutoffDate
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [metrics, startDate, endDate, selectedMcu, timePeriod]);

  // Prepare chart data
  const chartData = useMemo(() => {
    // Sort by date ascending for chart
    return filteredData
      .slice()
      .reverse()
      .map((m) => ({
        timestamp: new Date(m.created_at).toLocaleTimeString(),
        date: new Date(m.created_at).toLocaleDateString(),
        temperature: m.temperature || 0,
        humidity: m.humidity || 0,
        mcu: m.mcu_name || m.mcu_id || "Unknown",
      }));
  }, [filteredData]);

  // Statistics
  const stats = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        avgTemp: 0,
        maxTemp: 0,
        minTemp: 0,
        avgHumidity: 0,
        maxHumidity: 0,
      };
    }

    const temps = filteredData
      .filter((m) => m.temperature !== null)
      .map((m) => m.temperature!);
    const humidities = filteredData
      .filter((m) => m.humidity !== null)
      .map((m) => m.humidity!);

    return {
      avgTemp: temps.length > 0 ? temps.reduce((a, b) => a + b) / temps.length : 0,
      maxTemp: temps.length > 0 ? Math.max(...temps) : 0,
      minTemp: temps.length > 0 ? Math.min(...temps) : 0,
      avgHumidity:
        humidities.length > 0
          ? humidities.reduce((a, b) => a + b) / humidities.length
          : 0,
      maxHumidity: humidities.length > 0 ? Math.max(...humidities) : 0,
    };
  }, [filteredData]);

  // Export to CSV
  const exportToCsv = () => {
    if (filteredData.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["MCU Name", "MCU ID", "Temperature (°C)", "Humidity (%)", "Timestamp"];
    const rows = filteredData.map((m) => [
      m.mcu_name || "Unknown",
      m.mcu_id || "Unknown",
      m.temperature?.toFixed(2) || "N/A",
      m.humidity?.toFixed(2) || "N/A",
      new Date(m.created_at).toLocaleString(),
    ]);

    const csv =
      [headers, ...rows].map((row) =>
        row.map((cell) => `"${cell}"`).join(",")
      ).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `mcu-sensors-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && metrics.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh] font-mono">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-primary animate-pulse">[</span>
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-primary animate-pulse">]</span>
            </div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              LOADING_MCU_SENSORS...
            </p>
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
            <p className="text-xs uppercase font-bold text-destructive">
              ERROR_LOADING_SENSORS
            </p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button
              onClick={() => refetch()}
              size="sm"
              variant="outline"
              className="rounded-none border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              RETRY
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 font-mono">
        {/* Header */}
        <div className="flex items-end justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight">
              MCU SENSORS
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">
              ENVIRONMENTAL MONITORING DASHBOARD
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="rounded-none"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              REFRESH
            </Button>
            <Button
              onClick={exportToCsv}
              className="rounded-none"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              EXPORT CSV
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="border border-border p-4 rounded-none space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              AVG TEMP
            </p>
            <p className="text-2xl font-bold">{stats.avgTemp.toFixed(1)}°C</p>
          </div>
          <div className="border border-border p-4 rounded-none space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              MAX TEMP
            </p>
            <p className="text-2xl font-bold text-orange-500">
              {stats.maxTemp.toFixed(1)}°C
            </p>
          </div>
          <div className="border border-border p-4 rounded-none space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              MIN TEMP
            </p>
            <p className="text-2xl font-bold text-blue-500">
              {stats.minTemp.toFixed(1)}°C
            </p>
          </div>
          <div className="border border-border p-4 rounded-none space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              AVG HUMIDITY
            </p>
            <p className="text-2xl font-bold">{stats.avgHumidity.toFixed(1)}%</p>
          </div>
          <div className="border border-border p-4 rounded-none space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              MAX HUMIDITY
            </p>
            <p className="text-2xl font-bold text-cyan-500">
              {stats.maxHumidity.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="border border-border p-4 rounded-none space-y-4">
          <p className="text-xs uppercase tracking-widest font-bold">FILTERS</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Time Period Filter */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                TIME PERIOD
              </label>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="w-full border border-border bg-background px-3 py-2 text-xs font-mono rounded-none"
              >
                <option value="all">ALL TIME</option>
                <option value="24h">LAST 24H</option>
                <option value="7d">LAST 7D</option>
                <option value="30d">LAST 30D</option>
              </select>
            </div>

            {/* MCU Filter */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                MCU ID
              </label>
              <select
                value={selectedMcu}
                onChange={(e) => setSelectedMcu(e.target.value)}
                className="w-full border border-border bg-background px-3 py-2 text-xs font-mono rounded-none"
              >
                <option value="">ALL MCUs</option>
                {mcuIds.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                START DATE
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-none"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                END DATE
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-none"
              />
            </div>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 ? (
          <div className="border border-border p-4 rounded-none space-y-4">
            <p className="text-xs uppercase tracking-widest font-bold">
              TEMPERATURE & HUMIDITY TRENDS
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval={Math.floor(chartData.length / 10) || 0}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                  }}
                  formatter={(value: any) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ff7300"
                  dot={false}
                  name="Temperature (°C)"
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="humidity"
                  stroke="#0088ff"
                  dot={false}
                  name="Humidity (%)"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="border border-border p-8 rounded-none text-center text-muted-foreground">
            <p className="text-xs uppercase tracking-widest">NO DATA AVAILABLE</p>
          </div>
        )}

        {/* Data Table */}
        <div className="border border-border rounded-none overflow-hidden">
          <div className="p-4 border-b border-border">
            <p className="text-xs uppercase tracking-widest font-bold">
              SENSOR DATA ({filteredData.length} RECORDS)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left uppercase tracking-widest font-bold">
                    MCU NAME
                  </th>
                  <th className="px-4 py-3 text-left uppercase tracking-widest font-bold">
                    MCU ID
                  </th>
                  <th className="px-4 py-3 text-right uppercase tracking-widest font-bold">
                    TEMPERATURE
                  </th>
                  <th className="px-4 py-3 text-right uppercase tracking-widest font-bold">
                    HUMIDITY
                  </th>
                  <th className="px-4 py-3 text-left uppercase tracking-widest font-bold">
                    TIMESTAMP
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.slice(0, 100).map((metric, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        {metric.mcu_name || "UNKNOWN"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="rounded-none font-mono text-xs">
                          {metric.mcu_id || "N/A"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <TrendingUp className="w-3 h-3 text-orange-500" />
                          <span>
                            {metric.temperature !== null
                              ? `${metric.temperature.toFixed(2)}°C`
                              : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Droplets className="w-3 h-3 text-blue-500" />
                          <span>
                            {metric.humidity !== null
                              ? `${metric.humidity.toFixed(2)}%`
                              : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(metric.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <p className="uppercase tracking-widest">NO DATA MATCHING FILTERS</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredData.length > 100 && (
            <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
              Showing 100 of {filteredData.length} records
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
