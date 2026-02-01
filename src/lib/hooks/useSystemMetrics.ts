import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import type { SystemMetrics } from "@/types/metrics";

interface UseSystemMetricsResult {
  data: SystemMetrics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSystemMetrics(autoRefresh = false, interval = 5000): UseSystemMetricsResult {
  const [data, setData] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setError(null);
      const metrics = await api.getSystemMetrics();
      setData(metrics);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Error ${err.status}: ${err.message}`);
      } else {
        setError("Failed to fetch system metrics");
      }
      console.error("Error fetching metrics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();

    if (autoRefresh) {
      const intervalId = setInterval(fetchMetrics, interval);
      return () => clearInterval(intervalId);
    }
  }, [fetchMetrics, autoRefresh, interval]);

  return {
    data,
    loading,
    error,
    refetch: fetchMetrics,
  };
}
