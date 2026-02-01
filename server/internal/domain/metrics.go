package domain

import "time"

// EnvMetrics represents environmental metrics from sensors
type EnvMetrics struct {
	ID                int64     `json:"id" db:"id"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	FirstTemperature  *float64  `json:"first_temperature" db:"first_temperature"`
	FirstHumidity     *float64  `json:"first_humidity" db:"first_humidity"`
	SecondTemperature *float64  `json:"second_temperature" db:"second_temperature"`
	SecondHumidity    *float64  `json:"second_humidity" db:"second_humidity"`
}

// SystemMetrics represents comprehensive system and environmental metrics
type SystemMetrics struct {
	Timestamp   time.Time      `json:"timestamp"`
	Environment *EnvMetrics    `json:"environment"`
	CPU         CPUMetrics     `json:"cpu"`
	Memory      MemoryMetrics  `json:"memory"`
	Disk        []DiskMetrics  `json:"disk"`
	Network     NetworkMetrics `json:"network"`
	Process     ProcessMetrics `json:"process"`
	Load        LoadMetrics    `json:"load"`
	Temperature ThermalMetrics `json:"temperature,omitempty"`
	System      SystemInfo     `json:"system"`
}

type CPUMetrics struct {
	UsagePercent float64   `json:"usage_percent"`
	PerCore      []float64 `json:"per_core,omitempty"`
	Cores        int       `json:"cores"`
	Threads      int       `json:"threads"`
	ModelName    string    `json:"model_name,omitempty"`
	Frequency    float64   `json:"frequency_mhz,omitempty"`
	User         float64   `json:"user_percent,omitempty"`
	System       float64   `json:"system_percent,omitempty"`
	Idle         float64   `json:"idle_percent,omitempty"`
}

type MemoryMetrics struct {
	Total       uint64      `json:"total"`
	Available   uint64      `json:"available"`
	Used        uint64      `json:"used"`
	Free        uint64      `json:"free"`
	UsedPercent float64     `json:"used_percent"`
	Cached      uint64      `json:"cached,omitempty"`
	Buffers     uint64      `json:"buffers,omitempty"`
	Swap        SwapMetrics `json:"swap"`
}

type SwapMetrics struct {
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	Free        uint64  `json:"free"`
	UsedPercent float64 `json:"used_percent"`
}

type DiskMetrics struct {
	Device      string  `json:"device"`
	MountPoint  string  `json:"mount_point"`
	FsType      string  `json:"fs_type"`
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	Free        uint64  `json:"free"`
	UsedPercent float64 `json:"used_percent"`
	InodesTotal uint64  `json:"inodes_total,omitempty"`
	InodesUsed  uint64  `json:"inodes_used,omitempty"`
	InodesFree  uint64  `json:"inodes_free,omitempty"`
}

type NetworkMetrics struct {
	BytesSent   uint64             `json:"bytes_sent"`
	BytesRecv   uint64             `json:"bytes_recv"`
	PacketsSent uint64             `json:"packets_sent"`
	PacketsRecv uint64             `json:"packets_recv"`
	ErrorsIn    uint64             `json:"errors_in"`
	ErrorsOut   uint64             `json:"errors_out"`
	DropIn      uint64             `json:"drop_in"`
	DropOut     uint64             `json:"drop_out"`
	Interfaces  []NetworkInterface `json:"interfaces,omitempty"`
	Connections ConnectionStats    `json:"connections"`
}

type NetworkInterface struct {
	Name        string   `json:"name"`
	BytesSent   uint64   `json:"bytes_sent"`
	BytesRecv   uint64   `json:"bytes_recv"`
	PacketsSent uint64   `json:"packets_sent"`
	PacketsRecv uint64   `json:"packets_recv"`
	Addrs       []string `json:"addrs,omitempty"`
	MTU         int      `json:"mtu,omitempty"`
}

type ConnectionStats struct {
	Established int `json:"established"`
	Listen      int `json:"listen"`
	TimeWait    int `json:"time_wait"`
	CloseWait   int `json:"close_wait"`
	Total       int `json:"total"`
}

type ProcessMetrics struct {
	Total    int `json:"total"`
	Running  int `json:"running"`
	Sleeping int `json:"sleeping"`
	Stopped  int `json:"stopped"`
	Zombie   int `json:"zombie"`
	Threads  int `json:"threads"`
}

type LoadMetrics struct {
	Load1  float64 `json:"load1"`
	Load5  float64 `json:"load5"`
	Load15 float64 `json:"load15"`
}

type ThermalMetrics struct {
	CPUTemp float64         `json:"cpu_temp,omitempty"`
	Sensors []ThermalSensor `json:"sensors,omitempty"`
}

type ThermalSensor struct {
	Name        string  `json:"name"`
	Temperature float64 `json:"temperature"`
	High        float64 `json:"high,omitempty"`
	Critical    float64 `json:"critical,omitempty"`
}

type SystemInfo struct {
	Hostname        string `json:"hostname"`
	OS              string `json:"os"`
	Platform        string `json:"platform"`
	PlatformFamily  string `json:"platform_family"`
	PlatformVersion string `json:"platform_version"`
	KernelVersion   string `json:"kernel_version"`
	KernelArch      string `json:"kernel_arch"`
	Virtualization  string `json:"virtualization,omitempty"`
	Uptime          uint64 `json:"uptime"`
	BootTime        uint64 `json:"boot_time"`
	Processes       uint64 `json:"processes"`
}
