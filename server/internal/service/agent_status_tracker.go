package service

import (
	"context"
	"log"
	"sync"
	"time"

	"github.com/rafia9005/realtime-monitoring-server/internal/domain"
)

// AgentStatusTracker tracks agent online/offline status with notifications
type AgentStatusTracker struct {
	repo                domain.AgentRepository
	notificationManager *NotificationManager
	temperatureListener *TemperatureListener
	agentStatus         map[string]*AgentStatus
	agentStatusMu       sync.RWMutex
	heartbeatTimeout    time.Duration
	checkInterval       time.Duration
	stopChan            chan struct{}
	wg                  sync.WaitGroup
	ctx                 context.Context
}

// AgentStatus tracks the status of an agent
type AgentStatus struct {
	AgentID          string
	AgentName        string
	PreviousStatus   string
	CurrentStatus    string
	LastHeartbeat    time.Time
	FailureCount     int
	NotificationSent bool
}

// NewAgentStatusTracker creates a new agent status tracker
func NewAgentStatusTracker(
	repo domain.AgentRepository,
	notificationManager *NotificationManager,
	temperatureListener *TemperatureListener,
) *AgentStatusTracker {
	return &AgentStatusTracker{
		repo:                repo,
		notificationManager: notificationManager,
		temperatureListener: temperatureListener,
		agentStatus:         make(map[string]*AgentStatus),
		heartbeatTimeout:    2 * time.Minute,
		checkInterval:       30 * time.Second,
		stopChan:            make(chan struct{}),
		ctx:                 context.Background(),
	}
}

// Start begins monitoring agent status
func (ast *AgentStatusTracker) Start() {
	log.Println("🔍 Agent status tracker started")
	ast.wg.Add(1)
	go ast.trackingLoop()
}

// Stop stops monitoring
func (ast *AgentStatusTracker) Stop() {
	log.Println("⏸️  Stopping agent status tracker...")
	close(ast.stopChan)
	ast.wg.Wait()
	log.Println("✓ Agent status tracker stopped")
}

// trackingLoop monitors agent status periodically
func (ast *AgentStatusTracker) trackingLoop() {
	defer ast.wg.Done()

	ticker := time.NewTicker(ast.checkInterval)
	defer ticker.Stop()

	// Do initial check
	ast.checkAllAgents()

	for {
		select {
		case <-ticker.C:
			ast.checkAllAgents()
		case <-ast.stopChan:
			return
		}
	}
}

// checkAllAgents checks status of all agents
func (ast *AgentStatusTracker) checkAllAgents() {
	ctx := context.Background()

	agents, err := ast.repo.GetAll(ctx)
	if err != nil {
		log.Printf("❌ Failed to get agents: %v", err)
		return
	}

	ast.agentStatusMu.Lock()
	defer ast.agentStatusMu.Unlock()

	// Update or create status for each agent
	for _, agent := range agents {
		if status, exists := ast.agentStatus[agent.ID]; exists {
			status.LastHeartbeat = agent.LastSeen
		} else {
			ast.agentStatus[agent.ID] = &AgentStatus{
				AgentID:        agent.ID,
				AgentName:      agent.Name,
				PreviousStatus: agent.Status,
				CurrentStatus:  agent.Status,
				LastHeartbeat:  agent.LastSeen,
			}
		}

		// Check if agent should be marked offline
		timeSinceLastHeartbeat := time.Since(ast.agentStatus[agent.ID].LastHeartbeat)
		if timeSinceLastHeartbeat > ast.heartbeatTimeout && agent.Status == "online" {
			ast.markAgentOffline(&agent)
		} else if agent.Status == "offline" && timeSinceLastHeartbeat <= ast.heartbeatTimeout {
			ast.markAgentOnline(&agent)
		}
	}
}

// markAgentOffline marks an agent as offline and sends notification
func (ast *AgentStatusTracker) markAgentOffline(agent *domain.Agent) {
	if status, exists := ast.agentStatus[agent.ID]; exists && !status.NotificationSent {
		log.Printf("🔴 Agent %s marked as OFFLINE", agent.Name)

		// Update status in memory
		status.PreviousStatus = status.CurrentStatus
		status.CurrentStatus = "offline"
		status.NotificationSent = true

		// Update status in database
		if err := ast.repo.UpdateStatus(ast.ctx, agent.ID, "offline", time.Now()); err != nil {
			log.Printf("❌ Failed to update agent status in database: %v", err)
		}

		// Send notification
		if ast.notificationManager != nil {
			go ast.notificationManager.NotifyAgentOffline(agent)
		}
	}
}

// markAgentOnline marks an agent as online and sends notification
func (ast *AgentStatusTracker) markAgentOnline(agent *domain.Agent) {
	if status, exists := ast.agentStatus[agent.ID]; exists && status.NotificationSent {
		log.Printf("🟢 Agent %s marked as ONLINE", agent.Name)

		// Update status in memory
		status.PreviousStatus = status.CurrentStatus
		status.CurrentStatus = "online"
		status.NotificationSent = false

		// Update status in database
		if err := ast.repo.UpdateStatus(ast.ctx, agent.ID, "online", time.Now()); err != nil {
			log.Printf("❌ Failed to update agent status in database: %v", err)
		}

		// Send notification
		if ast.notificationManager != nil {
			go ast.notificationManager.NotifyAgentOnline(agent)
		}
	}
}

// UpdateAgentHeartbeat updates the last heartbeat time for an agent
func (ast *AgentStatusTracker) UpdateAgentHeartbeat(agentID string) {
	ast.agentStatusMu.Lock()
	defer ast.agentStatusMu.Unlock()

	if status, exists := ast.agentStatus[agentID]; exists {
		status.LastHeartbeat = time.Now()

		// Reset failure count
		status.FailureCount = 0

		// If was marked offline, mark back online
		if status.CurrentStatus == "offline" {
			status.CurrentStatus = "online"
			status.NotificationSent = false
			log.Printf("🟢 Agent %s heartbeat received, marked ONLINE", status.AgentName)
		}
	}
}

// GetAgentStatus returns the current status of an agent
func (ast *AgentStatusTracker) GetAgentStatus(agentID string) *AgentStatus {
	ast.agentStatusMu.RLock()
	defer ast.agentStatusMu.RUnlock()

	return ast.agentStatus[agentID]
}

// GetAllAgentStatus returns status of all agents
func (ast *AgentStatusTracker) GetAllAgentStatus() map[string]*AgentStatus {
	ast.agentStatusMu.RLock()
	defer ast.agentStatusMu.RUnlock()

	result := make(map[string]*AgentStatus)
	for k, v := range ast.agentStatus {
		result[k] = v
	}
	return result
}

// UpdateMetricsWithNotifications updates metrics and sends temperature notifications
func (ast *AgentStatusTracker) UpdateMetricsWithNotifications(
	agentID string,
	agentName string,
	metrics *domain.SystemMetrics,
) {
	// Update heartbeat
	ast.UpdateAgentHeartbeat(agentID)

	// Forward metrics to temperature listener
	if ast.temperatureListener != nil {
		ast.temperatureListener.ReceiveMetricsUpdate(agentID, agentName, metrics)
	}

	// Log metrics
	log.Printf("✓ Metrics received from agent %s: CPU=%.1f%% MEM=%.1f%% TEMP=%.1f°C",
		agentName,
		metrics.CPU.UsagePercent,
		metrics.Memory.UsedPercent,
		metrics.Temperature.CPUTemp,
	)
}
