package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/rafia9005/realtime-monitoring-server/internal/domain"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/load"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
	"github.com/shirou/gopsutil/v3/process"
)

const version = "1.0.0"

type AgentServer struct {
	name     string
	hostname string
	port     string
}

func NewAgentServer(name, port string) *AgentServer {
	hostname, _ := os.Hostname()
	return &AgentServer{
		name:     name,
		hostname: hostname,
		port:     port,
	}
}

// CollectMetrics collects system metrics
func (a *AgentServer) CollectMetrics() (*domain.SystemMetrics, error) {
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

	// Get Disk metrics
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

		var addrs []string
		for _, addr := range iface.Addrs {
			addrs = append(addrs, addr.Addr)
		}
		ifaceMetric.Addrs = addrs

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

	// Get temperature
	var thermalMetrics domain.ThermalMetrics
	temps, err := host.SensorsTemperatures()
	if err == nil && len(temps) > 0 {
		var sensors []domain.ThermalSensor
		for _, temp := range temps {
			sensors = append(sensors, domain.ThermalSensor{
				Name:        temp.SensorKey,
				Temperature: temp.Temperature,
				High:        temp.High,
				Critical:    temp.Critical,
			})
			if thermalMetrics.CPUTemp == 0 && (temp.SensorKey == "coretemp" || temp.SensorKey == "cpu_thermal" || temp.SensorKey == "k10temp") {
				thermalMetrics.CPUTemp = temp.Temperature
			}
		}
		thermalMetrics.Sensors = sensors
	}

	// Get Host info
	hostInfo, _ := host.Info()

	metrics := &domain.SystemMetrics{
		Timestamp: time.Now(),
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
			Hostname:        a.hostname,
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

	return metrics, nil
}

// CORS middleware
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// HealthHandler handles GET /health
func (a *AgentServer) HealthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "ok",
		"time":   time.Now(),
	})
}

// InfoHandler handles GET /info
func (a *AgentServer) InfoHandler(w http.ResponseWriter, r *http.Request) {
	// Get IP address
	ipAddress := "unknown"
	interfaces, err := net.Interfaces()
	if err == nil {
		for _, iface := range interfaces {
			if len(iface.Addrs) > 0 && iface.Name != "lo" {
				ipAddress = iface.Addrs[0].Addr
				break
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"name":       a.name,
			"hostname":   a.hostname,
			"ip_address": ipAddress,
			"version":    version,
		},
	})
}

// MetricsHandler handles GET /metrics
func (a *AgentServer) MetricsHandler(w http.ResponseWriter, r *http.Request) {
	metrics, err := a.CollectMetrics()
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    metrics,
	})
}

func (a *AgentServer) Start() error {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", a.HealthHandler)
	mux.HandleFunc("/info", a.InfoHandler)
	mux.HandleFunc("/metrics", a.MetricsHandler)

	// Wrap with CORS
	handler := corsMiddleware(mux)

	server := &http.Server{
		Addr:    fmt.Sprintf(":%s", a.port),
		Handler: handler,
	}

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan
		log.Println("Shutting down agent server...")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := server.Shutdown(ctx); err != nil {
			log.Printf("Error during shutdown: %v", err)
		}
	}()

	log.Printf("Agent Server starting on port %s", a.port)
	log.Printf("Agent Name: %s", a.name)
	log.Printf("Hostname: %s", a.hostname)
	log.Printf("Endpoints:")
	log.Printf("  - GET http://localhost:%s/health", a.port)
	log.Printf("  - GET http://localhost:%s/info", a.port)
	log.Printf("  - GET http://localhost:%s/metrics", a.port)

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		return fmt.Errorf("failed to start server: %w", err)
	}

	return nil
}

func main() {
	port := flag.String("port", "9090", "Agent server port")
	name := flag.String("name", "", "Agent name (required)")

	flag.Parse()

	if *name == "" {
		log.Fatal("Agent name is required (use -name flag)")
	}

	agent := NewAgentServer(*name, *port)
	if err := agent.Start(); err != nil {
		log.Fatalf("Agent error: %v", err)
	}
}
