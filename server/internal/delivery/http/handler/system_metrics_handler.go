package handler

import (
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/rafia9005/realtime-monitoring-server/internal/domain"
	"github.com/rafia9005/realtime-monitoring-server/internal/pkg/response"
	"github.com/rafia9005/realtime-monitoring-server/internal/service"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/load"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
	"github.com/shirou/gopsutil/v3/process"
)

// Helper function to check if string contains substring
func contains(s, substr string) bool {
	return strings.Contains(strings.ToLower(s), strings.ToLower(substr))
}

type SystemMetricsHandler struct {
	envRepo          domain.EnvMetricsRepository
	telegramNotifier *service.TelegramNotifier
}

func NewSystemMetricsHandler(envRepo domain.EnvMetricsRepository, telegramNotifier *service.TelegramNotifier) *SystemMetricsHandler {
	return &SystemMetricsHandler{
		envRepo:          envRepo,
		telegramNotifier: telegramNotifier,
	}
}

// GetMetrics handles GET /api/v1/system-metrics
func (h *SystemMetricsHandler) GetMetrics(c *echo.Context) error {
	ctx := (*c).Request().Context()

	// Get environmental metrics from database
	envMetrics, err := h.envRepo.GetLatest(ctx)
	if err != nil {
		// Log error but don't fail the request
		println("Error getting env metrics:", err.Error())
	}
	if envMetrics != nil && len(envMetrics) > 0 {
		println("Found env metrics with count:", len(envMetrics))
	} else {
		println("No env metrics found in database")
	}

	// Get CPU metrics
	cpuPercent, _ := cpu.Percent(time.Second, false)
	cpuPerCore, _ := cpu.Percent(time.Second, true)

	cpuInfo, _ := cpu.Info()
	var cpuModel string
	var cpuFreq float64
	if len(cpuInfo) > 0 {
		cpuModel = cpuInfo[0].ModelName
		cpuFreq = cpuInfo[0].Mhz
	}

	cpuCores, _ := cpu.Counts(false)
	cpuThreads, _ := cpu.Counts(true)

	cpuTimes, _ := cpu.Times(false)
	var cpuUser, cpuSystem, cpuIdle float64
	if len(cpuTimes) > 0 {
		total := cpuTimes[0].User + cpuTimes[0].System + cpuTimes[0].Idle + cpuTimes[0].Iowait
		if total > 0 {
			cpuUser = (cpuTimes[0].User / total) * 100
			cpuSystem = (cpuTimes[0].System / total) * 100
			cpuIdle = (cpuTimes[0].Idle / total) * 100
		}
	}

	// Get Memory metrics
	vmem, _ := mem.VirtualMemory()
	swap, _ := mem.SwapMemory()

	// Get Disk metrics for all partitions
	partitions, _ := disk.Partitions(false)
	var diskMetrics []domain.DiskMetrics
	for _, partition := range partitions {
		usage, err := disk.Usage(partition.Mountpoint)
		if err != nil {
			continue
		}
		diskMetrics = append(diskMetrics, domain.DiskMetrics{
			Device:      partition.Device,
			MountPoint:  partition.Mountpoint,
			FsType:      partition.Fstype,
			Total:       usage.Total,
			Used:        usage.Used,
			Free:        usage.Free,
			UsedPercent: usage.UsedPercent,
			InodesTotal: usage.InodesTotal,
			InodesUsed:  usage.InodesUsed,
			InodesFree:  usage.InodesFree,
		})
	}

	// Get Network metrics
	netStats, _ := net.IOCounters(false)
	var networkMetrics domain.NetworkMetrics
	if len(netStats) > 0 {
		networkMetrics.BytesSent = netStats[0].BytesSent
		networkMetrics.BytesRecv = netStats[0].BytesRecv
		networkMetrics.PacketsSent = netStats[0].PacketsSent
		networkMetrics.PacketsRecv = netStats[0].PacketsRecv
		networkMetrics.ErrorsIn = netStats[0].Errin
		networkMetrics.ErrorsOut = netStats[0].Errout
		networkMetrics.DropIn = netStats[0].Dropin
		networkMetrics.DropOut = netStats[0].Dropout
	}

	// Get Network interfaces
	interfaces, _ := net.Interfaces()
	var netInterfaces []domain.NetworkInterface
	for _, iface := range interfaces {
		ifaceStats, _ := net.IOCounters(true)
		var ifaceMetric domain.NetworkInterface
		ifaceMetric.Name = iface.Name
		ifaceMetric.MTU = iface.MTU

		// Get addresses
		var addrs []string
		for _, addr := range iface.Addrs {
			addrs = append(addrs, addr.Addr)
		}
		ifaceMetric.Addrs = addrs

		// Get stats for this interface
		for _, stat := range ifaceStats {
			if stat.Name == iface.Name {
				ifaceMetric.BytesSent = stat.BytesSent
				ifaceMetric.BytesRecv = stat.BytesRecv
				ifaceMetric.PacketsSent = stat.PacketsSent
				ifaceMetric.PacketsRecv = stat.PacketsRecv
				break
			}
		}
		netInterfaces = append(netInterfaces, ifaceMetric)
	}
	networkMetrics.Interfaces = netInterfaces

	// Get connection stats
	connections, _ := net.Connections("all")
	connStats := domain.ConnectionStats{Total: len(connections)}
	for _, conn := range connections {
		switch conn.Status {
		case "ESTABLISHED":
			connStats.Established++
		case "LISTEN":
			connStats.Listen++
		case "TIME_WAIT":
			connStats.TimeWait++
		case "CLOSE_WAIT":
			connStats.CloseWait++
		}
	}
	networkMetrics.Connections = connStats

	// Get Process metrics
	processes, _ := process.Processes()
	processMetrics := domain.ProcessMetrics{
		Total: len(processes),
	}
	for _, p := range processes {
		status, _ := p.Status()
		if len(status) > 0 {
			switch status[0] {
			case "R":
				processMetrics.Running++
			case "S", "D":
				processMetrics.Sleeping++
			case "T":
				processMetrics.Stopped++
			case "Z":
				processMetrics.Zombie++
			}
		}
		numThreads, _ := p.NumThreads()
		processMetrics.Threads += int(numThreads)
	}

	// Get Load average
	loadAvg, _ := load.Avg()
	loadMetrics := domain.LoadMetrics{
		Load1:  loadAvg.Load1,
		Load5:  loadAvg.Load5,
		Load15: loadAvg.Load15,
	}

	// Get temperature (CPU thermal + MCU from environment metrics)
	var thermalMetrics domain.ThermalMetrics
	temps, err := host.SensorsTemperatures()
	if err == nil && len(temps) > 0 {
		var sensors []domain.ThermalSensor
		var cpuTempFound bool

		for _, temp := range temps {
			sensors = append(sensors, domain.ThermalSensor{
				Name:        temp.SensorKey,
				Temperature: temp.Temperature,
				High:        temp.High,
				Critical:    temp.Critical,
			})

			// Try to match known CPU sensor names
			if !cpuTempFound && temp.Temperature > 0 {
				sensorName := temp.SensorKey
				// Check for common CPU sensor names
				if sensorName == "coretemp" || sensorName == "cpu_thermal" || sensorName == "k10temp" ||
					sensorName == "acpitz" || sensorName == "INT3400 Thermal" ||
					sensorName == "Package id 0" ||
					(sensorName != "" && (contains(sensorName, "CPU") || contains(sensorName, "Package") || contains(sensorName, "Core"))) {
					thermalMetrics.CPUTemp = temp.Temperature
					cpuTempFound = true
				}
			}
		}
		thermalMetrics.Sensors = sensors

		// If no specific CPU sensor found, use first sensor with temperature > 0 as CPU temp
		if !cpuTempFound && len(temps) > 0 && temps[0].Temperature > 0 {
			thermalMetrics.CPUTemp = temps[0].Temperature
			println("DEBUG: No specific CPU sensor found, using first sensor:", temps[0].SensorKey, "Temp:", temps[0].Temperature)
		}
	} else if err != nil {
		println("DEBUG: Failed to get sensors:", err.Error())
	} else {
		println("DEBUG: No temperature sensors found")
	}

	// Extract MCU temperature from environment metrics
	if envMetrics != nil && len(envMetrics) > 0 {
		for _, env := range envMetrics {
			if env.Temperature != nil && *env.Temperature > 0 {
				thermalMetrics.MCUTemp = *env.Temperature
				break
			}
		}
	}

	// Get Host/System info
	hostInfo, _ := host.Info()
	hostname, _ := os.Hostname()

	// Build comprehensive system metrics
	metrics := domain.SystemMetrics{
		Timestamp:   time.Now(),
		Environment: envMetrics,
		CPU: domain.CPUMetrics{
			UsagePercent: cpuPercent[0],
			PerCore:      cpuPerCore,
			Cores:        cpuCores,
			Threads:      cpuThreads,
			ModelName:    cpuModel,
			Frequency:    cpuFreq,
			User:         cpuUser,
			System:       cpuSystem,
			Idle:         cpuIdle,
		},
		Memory: domain.MemoryMetrics{
			Total:       vmem.Total,
			Available:   vmem.Available,
			Used:        vmem.Used,
			Free:        vmem.Free,
			UsedPercent: vmem.UsedPercent,
			Cached:      vmem.Cached,
			Buffers:     vmem.Buffers,
			Swap: domain.SwapMetrics{
				Total:       swap.Total,
				Used:        swap.Used,
				Free:        swap.Free,
				UsedPercent: swap.UsedPercent,
			},
		},
		Disk:        diskMetrics,
		Network:     networkMetrics,
		Process:     processMetrics,
		Load:        loadMetrics,
		Temperature: thermalMetrics,
		System: domain.SystemInfo{
			Hostname:        hostname,
			OS:              hostInfo.OS,
			Platform:        hostInfo.Platform,
			PlatformFamily:  hostInfo.PlatformFamily,
			PlatformVersion: hostInfo.PlatformVersion,
			KernelVersion:   hostInfo.KernelVersion,
			KernelArch:      hostInfo.KernelArch,
			Virtualization:  hostInfo.VirtualizationSystem,
			Uptime:          hostInfo.Uptime,
			BootTime:        hostInfo.BootTime,
			Processes:       hostInfo.Procs,
		},
	}

	// Check and send alerts if Telegram notifier is configured
	if h.telegramNotifier != nil {
		// Use default thresholds, can be made configurable later
		if err := h.telegramNotifier.CheckMetricsAndNotify(&metrics, service.DefaultThresholds); err != nil {
			// Log error but don't fail the request
			println("Error sending Telegram notification:", err.Error())
		}
	}

	return response.Success(c, http.StatusOK, "System metrics retrieved successfully", metrics)
}
