package service

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/rafia9005/realtime-monitoring-server/internal/domain"
)

type AgentPoller struct {
	repo     domain.AgentRepository
	interval time.Duration
	stopChan chan bool
	wg       sync.WaitGroup
}

func NewAgentPoller(repo domain.AgentRepository, interval time.Duration) *AgentPoller {
	return &AgentPoller{
		repo:     repo,
		interval: interval,
		stopChan: make(chan bool),
	}
}

// Start begins the polling loop
func (p *AgentPoller) Start() {
	log.Printf("🔄 Agent poller started (interval: %s)", p.interval)
	p.wg.Add(1)
	go p.pollLoop()
}

// Stop gracefully stops the polling loop
func (p *AgentPoller) Stop() {
	log.Println("⏸️  Stopping agent poller...")
	close(p.stopChan)
	p.wg.Wait()
	log.Println("✓ Agent poller stopped")
}

// pollLoop is the main polling loop
func (p *AgentPoller) pollLoop() {
	defer p.wg.Done()

	ticker := time.NewTicker(p.interval)
	defer ticker.Stop()

	// Do initial poll immediately
	p.pollAllAgents()

	for {
		select {
		case <-ticker.C:
			p.pollAllAgents()
		case <-p.stopChan:
			return
		}
	}
}

// pollAllAgents polls all registered agents
func (p *AgentPoller) pollAllAgents() {
	ctx := context.Background()

	// Get all agents
	agents, err := p.repo.GetAll(ctx)
	if err != nil {
		log.Printf("❌ Failed to get agents: %v", err)
		return
	}

	if len(agents) == 0 {
		log.Println("ℹ️  No agents registered yet")
		return
	}

	log.Printf("📊 Polling %d agent(s)...", len(agents))

	// Poll each agent concurrently
	var wg sync.WaitGroup
	for _, agent := range agents {
		wg.Add(1)
		go func(agentID, agentName string) {
			defer wg.Done()
			p.pollAgent(ctx, agentID, agentName)
		}(agent.ID, agent.Name)
	}

	wg.Wait()
}

// pollAgent polls a single agent
func (p *AgentPoller) pollAgent(ctx context.Context, agentID, agentName string) {
	metrics, err := p.repo.PullMetrics(ctx, agentID)
	if err != nil {
		log.Printf("⚠️  Agent %s (%s): Failed to pull metrics - %v", agentName, agentID, err)
		return
	}

	log.Printf("✓ Agent %s (%s): Metrics collected successfully", agentName, agentID)
	if metrics != nil {
		fmt.Printf("  CPU: %.1f%% | RAM: %.1f%% | Disk: %.1f%%\n",
			metrics.Metrics.CPU.UsagePercent,
			metrics.Metrics.Memory.UsedPercent,
			getDiskUsagePercent(metrics.Metrics),
		)
	}
}

// getDiskUsagePercent returns the first disk usage percentage
func getDiskUsagePercent(metrics domain.SystemMetrics) float64 {
	if len(metrics.Disk) > 0 {
		return metrics.Disk[0].UsedPercent
	}
	return 0
}
