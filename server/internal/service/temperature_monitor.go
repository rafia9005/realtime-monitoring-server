package service

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/rafia9005/realtime-monitoring-server/internal/domain"
)

// TemperatureMonitor monitors temperature in real-time
type TemperatureMonitor struct {
	notificationManager *NotificationManager
	agents              map[string]*AgentTempStatus
	agentsMu            sync.RWMutex
	cpuThreshold        float64
	mcuThreshold        float64
	checkInterval       time.Duration
	stopChan            chan struct{}
}

// AgentTempStatus tracks temperature status for an agent
type AgentTempStatus struct {
	AgentID          string
	AgentName        string
	CPUTemp          float64
	MCUTemp          float64
	MaxCPUTemp       float64
	MaxMCUTemp       float64
	CPUAlertSent     bool
	MCUAlertSent     bool
	LastCPUAlertTime time.Time
	LastMCUAlertTime time.Time
	HighCPUTempFound bool
	HighMCUTempFound bool
}

// TemperatureData represents real-time temperature data
type TemperatureData struct {
	AgentID    string    `json:"agent_id"`
	AgentName  string    `json:"agent_name"`
	CPUTemp    float64   `json:"cpu_temp"`
	MCUTemp    float64   `json:"mcu_temp"`
	MaxCPUTemp float64   `json:"max_cpu_temp"`
	MaxMCUTemp float64   `json:"max_mcu_temp"`
	Timestamp  time.Time `json:"timestamp"`
	IsCPUAlert bool      `json:"is_cpu_alert"`
	IsMCUAlert bool      `json:"is_mcu_alert"`
}

// NewTemperatureMonitor creates a new temperature monitor
func NewTemperatureMonitor(notificationManager *NotificationManager, cpuThreshold, mcuThreshold float64) *TemperatureMonitor {
	return &TemperatureMonitor{
		notificationManager: notificationManager,
		agents:              make(map[string]*AgentTempStatus),
		cpuThreshold:        cpuThreshold,
		mcuThreshold:        mcuThreshold,
		checkInterval:       10 * time.Second,
		stopChan:            make(chan struct{}),
	}
}

// GetMCUThreshold returns the MCU temperature threshold
func (tm *TemperatureMonitor) GetMCUThreshold() float64 {
	return tm.mcuThreshold
}

// GetCPUThreshold returns the CPU temperature threshold
func (tm *TemperatureMonitor) GetCPUThreshold() float64 {
	return tm.cpuThreshold
}

// RegisterAgent registers an agent for temperature monitoring
func (tm *TemperatureMonitor) RegisterAgent(agentID, agentName string) {
	tm.agentsMu.Lock()
	defer tm.agentsMu.Unlock()

	tm.agents[agentID] = &AgentTempStatus{
		AgentID:      agentID,
		AgentName:    agentName,
		CPUAlertSent: false,
		MCUAlertSent: false,
		CPUTemp:      0,
		MCUTemp:      0,
		MaxCPUTemp:   0,
		MaxMCUTemp:   0,
	}
}

// UnregisterAgent removes an agent from monitoring
func (tm *TemperatureMonitor) UnregisterAgent(agentID string) {
	tm.agentsMu.Lock()
	defer tm.agentsMu.Unlock()

	delete(tm.agents, agentID)
}

// UpdateTemperature updates temperature reading for an agent (CPU temperature)
func (tm *TemperatureMonitor) UpdateTemperature(agentID string, temperature float64) {
	tm.updateCPUTemperature(agentID, temperature)
}

// updateCPUTemperature updates CPU temperature
func (tm *TemperatureMonitor) updateCPUTemperature(agentID string, temperature float64) {
	tm.agentsMu.Lock()
	defer tm.agentsMu.Unlock()

	if status, exists := tm.agents[agentID]; exists {
		status.CPUTemp = temperature

		// Update max temp
		if temperature > status.MaxCPUTemp {
			status.MaxCPUTemp = temperature
		}

		// Check if alert should be sent
		if temperature > tm.cpuThreshold && !status.CPUAlertSent {
			status.CPUAlertSent = true
			status.HighCPUTempFound = true
			status.LastCPUAlertTime = time.Now()

			// Send notification asynchronously
			log.Printf("🌡️  CPU Temperature ALERT: %s - Current: %.1f°C > Threshold: %.1f°C", status.AgentName, temperature, tm.cpuThreshold)
			go tm.notificationManager.NotifyTemperature(status.AgentName, temperature, tm.cpuThreshold)
		} else if temperature <= tm.cpuThreshold && status.CPUAlertSent {
			// Temperature back to normal, reset alert
			log.Printf("✅ CPU Temperature back to normal: %s - Current: %.1f°C <= Threshold: %.1f°C", status.AgentName, temperature, tm.cpuThreshold)
			status.CPUAlertSent = false
		}
	}
}

// UpdateMCUTemperature updates MCU temperature
func (tm *TemperatureMonitor) UpdateMCUTemperature(agentID string, temperature float64) {
	tm.agentsMu.Lock()
	defer tm.agentsMu.Unlock()

	if status, exists := tm.agents[agentID]; exists {
		status.MCUTemp = temperature

		// Update max temp
		if temperature > status.MaxMCUTemp {
			status.MaxMCUTemp = temperature
		}

		// Check if alert should be sent
		if temperature > tm.mcuThreshold && !status.MCUAlertSent {
			status.MCUAlertSent = true
			status.HighMCUTempFound = true
			status.LastMCUAlertTime = time.Now()

			// Send notification asynchronously
			mcuName := status.AgentName + " (MCU)"
			log.Printf("🌡️  MCU Temperature ALERT: %s - Current: %.1f°C > Threshold: %.1f°C", mcuName, temperature, tm.mcuThreshold)
			go tm.notificationManager.NotifyTemperature(mcuName, temperature, tm.mcuThreshold)
		} else if temperature <= tm.mcuThreshold && status.MCUAlertSent {
			// Temperature back to normal, reset alert
			log.Printf("✅ MCU Temperature back to normal: %s - Current: %.1f°C <= Threshold: %.1f°C", status.AgentName, temperature, tm.mcuThreshold)
			status.MCUAlertSent = false
		}
	}
}

// GetTemperatureStatus returns the current temperature status for an agent
func (tm *TemperatureMonitor) GetTemperatureStatus(agentID string) *AgentTempStatus {
	tm.agentsMu.RLock()
	defer tm.agentsMu.RUnlock()

	if status, exists := tm.agents[agentID]; exists {
		return status
	}
	return nil
}

// GetAllTemperatureStatus returns temperature status for all agents
func (tm *TemperatureMonitor) GetAllTemperatureStatus() map[string]*AgentTempStatus {
	tm.agentsMu.RLock()
	defer tm.agentsMu.RUnlock()

	result := make(map[string]*AgentTempStatus)
	for k, v := range tm.agents {
		result[k] = v
	}
	return result
}

// TemperatureListener handles real-time temperature updates
type TemperatureListener struct {
	agentMetricsChan chan *AgentMetricsUpdate
	subscribers      map[string][]chan *TemperatureData
	subscribersMu    sync.RWMutex
	monitor          *TemperatureMonitor
	stopChan         chan struct{}
}

// AgentMetricsUpdate represents metrics update from an agent
type AgentMetricsUpdate struct {
	AgentID    string                `json:"agent_id"`
	AgentName  string                `json:"agent_name"`
	Metrics    *domain.SystemMetrics `json:"metrics"`
	ReceivedAt time.Time             `json:"received_at"`
}

// NewTemperatureListener creates a new temperature listener
func NewTemperatureListener(monitor *TemperatureMonitor) *TemperatureListener {
	return &TemperatureListener{
		agentMetricsChan: make(chan *AgentMetricsUpdate, 100),
		subscribers:      make(map[string][]chan *TemperatureData),
		monitor:          monitor,
		stopChan:         make(chan struct{}),
	}
}

// Start starts listening to metric updates
func (tl *TemperatureListener) Start() {
	go func() {
		for {
			select {
			case <-tl.stopChan:
				return
			case update := <-tl.agentMetricsChan:
				if update != nil && update.Metrics != nil {
					// Update CPU temperature in monitor
					tl.monitor.UpdateTemperature(update.AgentID, update.Metrics.Temperature.CPUTemp)

					// Find MCU temperature from environment metrics or thermal metrics
					mcuTemp := 0.0

					// First try to get from Environment field (EnvMetrics)
					if update.Metrics.Environment != nil && len(update.Metrics.Environment) > 0 {
						for _, env := range update.Metrics.Environment {
							if env.Temperature != nil && *env.Temperature > 0 {
								mcuTemp = *env.Temperature
								break
							}
						}
					}

					// If not found, try to get from Temperature.MCUTemp field (ThermalMetrics)
					if mcuTemp == 0 && update.Metrics.Temperature.MCUTemp > 0 {
						mcuTemp = update.Metrics.Temperature.MCUTemp
					}

					// Update MCU temperature if found
					if mcuTemp > 0 {
						tl.monitor.UpdateMCUTemperature(update.AgentID, mcuTemp)
					}

					// Create temperature data
					tempStatus := tl.monitor.GetTemperatureStatus(update.AgentID)
					tempData := &TemperatureData{
						AgentID:    update.AgentID,
						AgentName:  update.AgentName,
						CPUTemp:    update.Metrics.Temperature.CPUTemp,
						MCUTemp:    mcuTemp,
						MaxCPUTemp: update.Metrics.Temperature.CPUTemp,
						MaxMCUTemp: mcuTemp,
						Timestamp:  time.Now(),
						IsCPUAlert: update.Metrics.Temperature.CPUTemp > tl.monitor.cpuThreshold,
						IsMCUAlert: mcuTemp > tl.monitor.mcuThreshold,
					}

					if tempStatus != nil {
						tempData.MaxCPUTemp = tempStatus.MaxCPUTemp
						tempData.MaxMCUTemp = tempStatus.MaxMCUTemp
					}

					// Publish to subscribers
					tl.publishTemperatureUpdate(update.AgentID, tempData)
				}
			}
		}
	}()
}

// Stop stops the listener
func (tl *TemperatureListener) Stop() {
	close(tl.stopChan)
}

// Subscribe subscribes to temperature updates for an agent
func (tl *TemperatureListener) Subscribe(agentID string) chan *TemperatureData {
	tl.subscribersMu.Lock()
	defer tl.subscribersMu.Unlock()

	ch := make(chan *TemperatureData, 10)
	tl.subscribers[agentID] = append(tl.subscribers[agentID], ch)
	return ch
}

// Unsubscribe unsubscribes from temperature updates
func (tl *TemperatureListener) Unsubscribe(agentID string, ch chan *TemperatureData) {
	tl.subscribersMu.Lock()
	defer tl.subscribersMu.Unlock()

	if subs, ok := tl.subscribers[agentID]; ok {
		for i, subscriber := range subs {
			if subscriber == ch {
				tl.subscribers[agentID] = append(subs[:i], subs[i+1:]...)
				close(ch)
				break
			}
		}
	}
}

// publishTemperatureUpdate publishes temperature data to subscribers
func (tl *TemperatureListener) publishTemperatureUpdate(agentID string, tempData *TemperatureData) {
	tl.subscribersMu.RLock()
	subscribers := tl.subscribers[agentID]
	broadcastSubs := tl.subscribers["*"] // Broadcast to all subscribers
	tl.subscribersMu.RUnlock()

	allSubscribers := append(subscribers, broadcastSubs...)

	for _, ch := range allSubscribers {
		select {
		case ch <- tempData:
		case <-time.After(100 * time.Millisecond):
			log.Printf("Subscriber not responding for temperature update")
		}
	}
}

// ReceiveMetricsUpdate receives metrics update
func (tl *TemperatureListener) ReceiveMetricsUpdate(agentID string, agentName string, metrics *domain.SystemMetrics) {
	update := &AgentMetricsUpdate{
		AgentID:    agentID,
		AgentName:  agentName,
		Metrics:    metrics,
		ReceivedAt: time.Now(),
	}

	select {
	case tl.agentMetricsChan <- update:
	case <-time.After(100 * time.Millisecond):
		log.Printf("Failed to queue metrics update for agent %s", agentID)
	}
}

// GetTemperatureJSON returns temperature status as JSON
func (tl *TemperatureListener) GetTemperatureJSON() ([]byte, error) {
	status := tl.monitor.GetAllTemperatureStatus()
	tempDataList := make([]*TemperatureData, 0)

	for _, status := range status {
		tempDataList = append(tempDataList, &TemperatureData{
			AgentID:    status.AgentID,
			AgentName:  status.AgentName,
			CPUTemp:    status.CPUTemp,
			MCUTemp:    status.MCUTemp,
			MaxCPUTemp: status.MaxCPUTemp,
			MaxMCUTemp: status.MaxMCUTemp,
			Timestamp:  time.Now(),
			IsCPUAlert: status.HighCPUTempFound,
			IsMCUAlert: status.HighMCUTempFound,
		})
	}

	return json.Marshal(tempDataList)
}
