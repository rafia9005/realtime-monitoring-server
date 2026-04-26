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
	threshold           float64
	checkInterval       time.Duration
	stopChan            chan struct{}
}

// AgentTempStatus tracks temperature status for an agent
type AgentTempStatus struct {
	AgentID          string
	AgentName        string
	CurrentTemp      float64
	MaxTemp          float64
	AlertSent        bool
	LastAlertTime    time.Time
	HighTempDetected bool
}

// TemperatureData represents real-time temperature data
type TemperatureData struct {
	AgentID     string    `json:"agent_id"`
	AgentName   string    `json:"agent_name"`
	Temperature float64   `json:"temperature"`
	MaxTemp     float64   `json:"max_temp"`
	Timestamp   time.Time `json:"timestamp"`
	IsAlert     bool      `json:"is_alert"`
}

// NewTemperatureMonitor creates a new temperature monitor
func NewTemperatureMonitor(notificationManager *NotificationManager, threshold float64) *TemperatureMonitor {
	return &TemperatureMonitor{
		notificationManager: notificationManager,
		agents:              make(map[string]*AgentTempStatus),
		threshold:           threshold,
		checkInterval:       10 * time.Second,
		stopChan:            make(chan struct{}),
	}
}

// RegisterAgent registers an agent for temperature monitoring
func (tm *TemperatureMonitor) RegisterAgent(agentID, agentName string) {
	tm.agentsMu.Lock()
	defer tm.agentsMu.Unlock()

	tm.agents[agentID] = &AgentTempStatus{
		AgentID:     agentID,
		AgentName:   agentName,
		AlertSent:   false,
		CurrentTemp: 0,
		MaxTemp:     0,
	}
}

// UnregisterAgent removes an agent from monitoring
func (tm *TemperatureMonitor) UnregisterAgent(agentID string) {
	tm.agentsMu.Lock()
	defer tm.agentsMu.Unlock()

	delete(tm.agents, agentID)
}

// UpdateTemperature updates temperature reading for an agent
func (tm *TemperatureMonitor) UpdateTemperature(agentID string, temperature float64) {
	tm.agentsMu.Lock()
	defer tm.agentsMu.Unlock()

	if status, exists := tm.agents[agentID]; exists {
		status.CurrentTemp = temperature

		// Update max temp
		if temperature > status.MaxTemp {
			status.MaxTemp = temperature
		}

		// Check if alert should be sent
		if temperature > tm.threshold && !status.AlertSent {
			status.AlertSent = true
			status.HighTempDetected = true
			status.LastAlertTime = time.Now()

			// Send notification asynchronously
			go tm.notificationManager.NotifyTemperature(status.AgentName, temperature, tm.threshold)
		} else if temperature <= tm.threshold && status.AlertSent {
			// Temperature back to normal, reset alert
			status.AlertSent = false
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
					// Update temperature in monitor
					tl.monitor.UpdateTemperature(update.AgentID, update.Metrics.Temperature.CPUTemp)

					// Create temperature data
					tempData := &TemperatureData{
						AgentID:     update.AgentID,
						AgentName:   update.AgentName,
						Temperature: update.Metrics.Temperature.CPUTemp,
						MaxTemp:     update.Metrics.Temperature.CPUTemp,
						Timestamp:   time.Now(),
						IsAlert:     update.Metrics.Temperature.CPUTemp > tl.monitor.threshold,
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
			AgentID:     status.AgentID,
			AgentName:   status.AgentName,
			Temperature: status.CurrentTemp,
			MaxTemp:     status.MaxTemp,
			Timestamp:   time.Now(),
			IsAlert:     status.HighTempDetected,
		})
	}

	return json.Marshal(tempDataList)
}
