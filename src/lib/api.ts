import type { SystemMetrics, ApiResponse, Agent, AgentMetrics, EnvMetrics } from "@/types/metrics";

export interface SensorThresholds {
  temperature: {
    mcu: number;
    cpu: number;
  };
  humidity: {
    min: number;
    max: number;
  };
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

class ApiError extends Error {
  status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
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
  
  // MCU Sensors APIs
  getMcuMetrics: async (params?: { startDate?: Date; endDate?: Date; mcuId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) {
      searchParams.append("start_date", params.startDate.toISOString());
    }
    if (params?.endDate) {
      searchParams.append("end_date", params.endDate.toISOString());
    }
    if (params?.mcuId) {
      searchParams.append("mcu_id", params.mcuId);
    }
    
    const query = searchParams.toString();
    const endpoint = query ? `/api/v1/mcu-metrics?${query}` : "/api/v1/mcu-metrics";
    return fetchApi<EnvMetrics[]>(endpoint);
  },
  
  // Sensor Thresholds API
  getSensorThresholds: () => fetchApi<SensorThresholds>("/api/v1/temperature/thresholds"),
  
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
