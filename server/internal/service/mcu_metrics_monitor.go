package service

import (
	"context"
	"log"
	"sync"
	"time"

	"github.com/rafia9005/realtime-monitoring-server/internal/domain"
)

// MCUMetricsMonitor monitors MCU temperature alerts from Supabase
type MCUMetricsMonitor struct {
	envMetricsRepo      domain.EnvMetricsRepository
	notificationManager *NotificationManager
	temperatureMonitor  *TemperatureMonitor
	mcuAlertStatus      map[string]*MCUAlertStatus
	alertStatusMu       sync.RWMutex
	checkInterval       time.Duration
	stopChan            chan struct{}
	wg                  sync.WaitGroup
}

// MCUAlertStatus tracks alert state for each MCU
type MCUAlertStatus struct {
	MCUID         string
	MCUName       string
	LastTemp      float64
	AlertSent     bool
	LastAlertTime time.Time
}

// NewMCUMetricsMonitor creates a new MCU metrics monitor
func NewMCUMetricsMonitor(
	envMetricsRepo domain.EnvMetricsRepository,
	notificationManager *NotificationManager,
	temperatureMonitor *TemperatureMonitor,
) *MCUMetricsMonitor {
	return &MCUMetricsMonitor{
		envMetricsRepo:      envMetricsRepo,
		notificationManager: notificationManager,
		temperatureMonitor:  temperatureMonitor,
		mcuAlertStatus:      make(map[string]*MCUAlertStatus),
		checkInterval:       30 * time.Second,
		stopChan:            make(chan struct{}),
	}
}

// Start begins monitoring MCU metrics
func (m *MCUMetricsMonitor) Start() {
	log.Println("📡 MCU metrics monitor started")
	m.wg.Add(1)
	go m.monitoringLoop()
}

// Stop stops monitoring
func (m *MCUMetricsMonitor) Stop() {
	log.Println("⏸️  Stopping MCU metrics monitor...")
	close(m.stopChan)
	m.wg.Wait()
	log.Println("✓ MCU metrics monitor stopped")
}

// monitoringLoop checks MCU metrics periodically
func (m *MCUMetricsMonitor) monitoringLoop() {
	defer m.wg.Done()

	ticker := time.NewTicker(m.checkInterval)
	defer ticker.Stop()

	// Do initial check
	m.checkLatestMCUMetrics()

	for {
		select {
		case <-ticker.C:
			m.checkLatestMCUMetrics()
		case <-m.stopChan:
			return
		}
	}
}

// checkLatestMCUMetrics checks the latest MCU metrics from all MCUs
func (m *MCUMetricsMonitor) checkLatestMCUMetrics() {
	if m.envMetricsRepo == nil {
		log.Println("📡 MCU monitor: envMetricsRepo is nil")
		return
	}

	// Get latest metrics from Supabase
	allMetrics, err := m.envMetricsRepo.GetLatest(context.Background())
	if err != nil {
		log.Printf("❌ Failed to get MCU metrics: %v", err)
		return
	}

	log.Printf("📡 MCU monitor check: got %d metrics", len(allMetrics))

	if len(allMetrics) == 0 {
		log.Println("📡 MCU monitor: no metrics found")
		return
	}

	// Group metrics by MCU ID and get the latest one for each MCU
	latestByMCU := make(map[string]domain.EnvMetrics)
	for _, metric := range allMetrics {
		if existing, ok := latestByMCU[metric.McuID]; !ok || metric.CreatedAt.After(existing.CreatedAt) {
			latestByMCU[metric.McuID] = metric
		}
	}

	// Check each MCU's latest metric
	m.alertStatusMu.Lock()
	defer m.alertStatusMu.Unlock()

	for mcuID, metric := range latestByMCU {
		if metric.Temperature == nil || *metric.Temperature <= 0 {
			log.Printf("📡 MCU %s: temperature nil or <= 0", mcuID)
			continue
		}

		temperature := *metric.Temperature
		log.Printf("📡 MCU %s (%s): temp=%.1f°C", mcuID, metric.McuName, temperature)

		// Get or create alert status for this MCU
		if status, exists := m.mcuAlertStatus[mcuID]; exists {
			status.LastTemp = temperature
		} else {
			m.mcuAlertStatus[mcuID] = &MCUAlertStatus{
				MCUID:     mcuID,
				MCUName:   metric.McuName,
				LastTemp:  temperature,
				AlertSent: false,
			}
		}

		status := m.mcuAlertStatus[mcuID]

		// Get threshold from temperature monitor
		threshold := m.temperatureMonitor.GetMCUThreshold()
		log.Printf("📡 MCU %s: checking temp %.1f°C > threshold %.1f°C, alertSent=%v", mcuID, temperature, threshold, status.AlertSent)

		// Check if alert should be sent
		if temperature > threshold && !status.AlertSent {
			status.AlertSent = true
			status.LastAlertTime = time.Now()

			agentName := metric.McuName + " (MCU)"
			log.Printf("🌡️  MCU Temperature ALERT: %s - Current: %.1f°C > Threshold: %.1f°C", agentName, temperature, threshold)

			// Send notification
			if m.notificationManager != nil {
				go m.notificationManager.NotifyTemperature(agentName, temperature, threshold)
			}
		} else if temperature <= threshold && status.AlertSent {
			// Temperature back to normal, reset alert
			log.Printf("✅ MCU Temperature back to normal: %s - Current: %.1f°C <= Threshold: %.1f°C", status.MCUName, temperature, threshold)
			status.AlertSent = false
		}
	}
}

// GetMCUAlertStatus returns the current alert status for an MCU
func (m *MCUMetricsMonitor) GetMCUAlertStatus(mcuID string) *MCUAlertStatus {
	m.alertStatusMu.RLock()
	defer m.alertStatusMu.RUnlock()

	return m.mcuAlertStatus[mcuID]
}

// GetAllMCUAlertStatus returns alert status for all MCUs
func (m *MCUMetricsMonitor) GetAllMCUAlertStatus() map[string]*MCUAlertStatus {
	m.alertStatusMu.RLock()
	defer m.alertStatusMu.RUnlock()

	result := make(map[string]*MCUAlertStatus)
	for k, v := range m.mcuAlertStatus {
		result[k] = v
	}
	return result
}
