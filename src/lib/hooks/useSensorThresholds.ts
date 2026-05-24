import { useState, useEffect, useCallback } from "react";
import { api, ApiError, type SensorThresholds } from "@/lib/api";

interface UseSensorThresholdsResult {
  thresholds: SensorThresholds | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSensorThresholds(): UseSensorThresholdsResult {
  const [thresholds, setThresholds] = useState<SensorThresholds | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThresholds = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getSensorThresholds();
      setThresholds(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Error ${err.status}: ${err.message}`);
      } else {
        setError("Failed to fetch sensor thresholds");
      }
      console.error("Error fetching sensor thresholds:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThresholds();
  }, [fetchThresholds]);

  return {
    thresholds,
    loading,
    error,
    refetch: fetchThresholds,
  };
}
