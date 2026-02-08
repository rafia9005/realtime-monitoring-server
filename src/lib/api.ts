import type { SystemMetrics, ApiResponse, Agent, AgentMetrics } from "@/types/metrics";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

class ApiError extends Error {
  status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `API request failed: ${response.statusText}`
    );
  }

  const data: ApiResponse<T> = await response.json();
  return data.data;
}

export const api = {
  getSystemMetrics: () => fetchApi<SystemMetrics>("/api/v1/system-metrics"),
  
  // Agent APIs
  getAgents: () => fetchApi<Agent[]>("/api/v1/agents"),
  getAgent: (id: string) => fetchApi<Agent>(`/api/v1/agents/${id}`),
  getAgentMetrics: (id: string) => fetchApi<AgentMetrics>(`/api/v1/agents/${id}/metrics`),
  
  checkHealth: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },
};

export { ApiError };
