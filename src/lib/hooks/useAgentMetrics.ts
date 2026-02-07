import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import type { Agent, AgentMetrics } from "@/types/metrics";

interface UseAgentMetricsResult {
  agents: Agent[];
  selectedAgent: Agent | null;
  metrics: AgentMetrics | null;
  loading: boolean;
  error: string | null;
  selectAgent: (agentId: string | null) => void;
  refetch: () => Promise<void>;
}

export function useAgentMetrics(autoRefresh = false, interval = 5000): UseAgentMetricsResult {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all agents
  const fetchAgents = useCallback(async () => {
    try {
      const agentsList = await api.getAgents();
      setAgents(agentsList || []);
      
      // Auto-select first online agent if none selected
      if (!selectedAgentId && agentsList && agentsList.length > 0) {
        const onlineAgent = agentsList.find(a => a.status === "online");
        if (onlineAgent) {
          setSelectedAgentId(onlineAgent.id);
        }
      }
    } catch (err) {
      console.error("Error fetching agents:", err);
      setAgents([]);
    }
  }, [selectedAgentId]);

  // Fetch metrics for selected agent
  const fetchMetrics = useCallback(async () => {
    if (!selectedAgentId) {
      setMetrics(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const agentMetrics = await api.getAgentMetrics(selectedAgentId);
      setMetrics(agentMetrics);
    } catch (err) {
      if (err instanceof ApiError) {
        // If agent not found, clear selection
        if (err.status === 404) {
          setError(`Agent not found. Please select another agent.`);
          setSelectedAgentId(null);
        } else {
          setError(`Error ${err.status}: ${err.message}`);
        }
      } else {
        setError("Failed to fetch agent metrics");
      }
      console.error("Error fetching metrics:", err);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [selectedAgentId]);

  // Initial fetch
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Fetch metrics when agent changes
  useEffect(() => {
    if (selectedAgentId) {
      setLoading(true);
      fetchMetrics();
    }
  }, [selectedAgentId, fetchMetrics]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && selectedAgentId) {
      const intervalId = setInterval(() => {
        fetchAgents(); // Update agent statuses
        fetchMetrics(); // Update metrics
      }, interval);
      return () => clearInterval(intervalId);
    }
  }, [autoRefresh, interval, selectedAgentId, fetchAgents, fetchMetrics]);

  const selectAgent = useCallback((agentId: string | null) => {
    setSelectedAgentId(agentId);
    setLoading(true);
  }, []);

  const selectedAgent = agents && agents.length > 0 
    ? agents.find(a => a.id === selectedAgentId) || null
    : null;

  return {
    agents,
    selectedAgent,
    metrics,
    loading,
    error,
    selectAgent,
    refetch: fetchMetrics,
  };
}
