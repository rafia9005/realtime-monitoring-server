// Type definitions matching the Go backend domain models

export interface EnvMetrics {
  id: number;
  created_at: string;
  first_temperature: number | null;
  first_humidity: number | null;
  second_temperature: number | null;
  second_humidity: number | null;
}

export interface CPUMetrics {
  usage_percent: number;
  per_core?: number[];
  cores: number;
  threads: number;
  model_name?: string;
  frequency_mhz?: number;
  user_percent?: number;
  system_percent?: number;
  idle_percent?: number;
}

export interface SwapMetrics {
  total: number;
  used: number;
  free: number;
  used_percent: number;
}

export interface MemoryMetrics {
  total: number;
  available: number;
  used: number;
  free: number;
  used_percent: number;
  cached?: number;
  buffers?: number;
  swap: SwapMetrics;
}

export interface DiskMetrics {
  device: string;
  mount_point: string;
  fs_type: string;
  total: number;
  used: number;
  free: number;
  used_percent: number;
  inodes_total?: number;
  inodes_used?: number;
  inodes_free?: number;
}

export interface NetworkInterface {
  name: string;
  bytes_sent: number;
  bytes_recv: number;
  packets_sent: number;
  packets_recv: number;
  addrs?: string[];
  mtu?: number;
}

export interface ConnectionStats {
  established: number;
  listen: number;
  time_wait: number;
  close_wait: number;
  total: number;
}

export interface NetworkMetrics {
  bytes_sent: number;
  bytes_recv: number;
  packets_sent: number;
  packets_recv: number;
  errors_in: number;
  errors_out: number;
  drop_in: number;
  drop_out: number;
  interfaces?: NetworkInterface[];
  connections: ConnectionStats;
}

export interface ProcessMetrics {
  total: number;
  running: number;
  sleeping: number;
  stopped: number;
  zombie: number;
  threads: number;
}

export interface LoadMetrics {
  load1: number;
  load5: number;
  load15: number;
}

export interface ThermalSensor {
  name: string;
  temperature: number;
  high?: number;
  critical?: number;
}

export interface ThermalMetrics {
  cpu_temp?: number;
  sensors?: ThermalSensor[];
}

export interface SystemInfo {
  hostname: string;
  os: string;
  platform: string;
  platform_family: string;
  platform_version: string;
  kernel_version: string;
  kernel_arch: string;
  virtualization?: string;
  uptime: number;
  boot_time: number;
  processes: number;
}

export interface SystemMetrics {
  timestamp: string;
  environment: EnvMetrics | null;
  cpu: CPUMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics[];
  network: NetworkMetrics;
  process: ProcessMetrics;
  load: LoadMetrics;
  temperature?: ThermalMetrics;
  system: SystemInfo;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}
