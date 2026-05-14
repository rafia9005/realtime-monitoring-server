import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import type { EnvMetrics } from "@/types/metrics";

interface UseMcuMetricsResult {
  data: EnvMetrics[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface FetchMcuMetricsParams {
  startDate?: Date;
  endDate?: Date;
  mcuId?: string;
}

export function useMcuMetrics(
  autoRefresh = false,
  interval = 5000
): UseMcuMetricsResult {
  const [data, setData] = useState<EnvMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (params?: FetchMcuMetricsParams) => {
    try {
      setError(null);
      const metrics = await api.getMcuMetrics(params);
      setData(metrics);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Error ${err.status}: ${err.message}`);
      } else {
        setError("Failed to fetch MCU metrics");
      }
      console.error("Error fetching metrics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();

    if (autoRefresh) {
      const intervalId = setInterval(() => fetchMetrics(), interval);
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
