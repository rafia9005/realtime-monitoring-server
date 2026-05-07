import { useEffect, useState } from "react";

interface LandingPageMetrics {
  // Metrics Bar
  sensorsActive: number;
  nodesConnected: number;
  dailyCycles: string;
  avgLatency: string;
  
  // Unified Control
  globalCPU: string;
  globalCPUTrend: string;
  totalRAM: string;
  totalRAMTrend: string;
  activeNodes: number;
  activeNodesTrend: string;
  alerts24h: number;
  alertsTrend: string;
  
  // Loading states
  isLoading: boolean;
}

export function useLandingPageMetrics() {
  const [metrics, setMetrics] = useState<LandingPageMetrics>({
    sensorsActive: 0,
    nodesConnected: 0,
    dailyCycles: "2.4M",
    avgLatency: "14ms",
    globalCPU: "12.4%",
    globalCPUTrend: "-2.1%",
    totalRAM: "128.5 GB",
    totalRAMTrend: "+0.4%",
    activeNodes: 0,
    activeNodesTrend: "0",
    alerts24h: 0,
    alertsTrend: "-12",
    isLoading: true,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL;
        
        // Fetch system metrics (for CPU, RAM, sensors)
        const systemResponse = await fetch(`${baseURL}/api/v1/system-metrics`);
        const systemData = await systemResponse.json();
        
        // Fetch agents (for node count)
        const agentsResponse = await fetch(`${baseURL}/api/v1/agents`);
        const agentsData = await agentsResponse.json();

        // Extract data
        let sensorCount = 0;
        let nodeCount = 0;

        if (systemData.data) {
          // Count sensors from environment metrics
          if (systemData.data.environment && Array.isArray(systemData.data.environment)) {
            sensorCount = systemData.data.environment.length;
          }

          // Get CPU usage
          const cpuUsage = systemData.data.cpu?.usage_percent || 12.4;
          const totalMem = (systemData.data.memory?.total || 137438953472) / (1024 * 1024 * 1024);

          setMetrics(prev => ({
            ...prev,
            sensorsActive: sensorCount,
            globalCPU: `${cpuUsage.toFixed(1)}%`,
            totalRAM: `${totalMem.toFixed(1)} GB`,
          }));
        }

        // Count connected agents
        if (agentsData.data && Array.isArray(agentsData.data)) {
          nodeCount = agentsData.data.filter((agent: any) => agent.status === "ONLINE").length;
          
          setMetrics(prev => ({
            ...prev,
            nodesConnected: nodeCount,
            activeNodes: nodeCount,
          }));
        }

        setMetrics(prev => ({
          ...prev,
          isLoading: false,
        }));
      } catch (error) {
        console.error("Error fetching landing page metrics:", error);
        setMetrics(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    fetchMetrics();

    // Refetch every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
}
