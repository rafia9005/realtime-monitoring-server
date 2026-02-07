package domain

import (
	"context"
	"time"
)

// EnvMetricsRepository interface for environmental metrics operations
type EnvMetricsRepository interface {
	GetLatest(ctx context.Context) (*EnvMetrics, error)
	Create(ctx context.Context, metrics *EnvMetrics) error
}

// AgentRepository interface for agent operations
type AgentRepository interface {
	Register(ctx context.Context, agent *Agent) error
	GetByID(ctx context.Context, id string) (*Agent, error)
	GetAll(ctx context.Context) ([]Agent, error)
	UpdateStatus(ctx context.Context, id string, status string, lastSeen time.Time) error
	Delete(ctx context.Context, id string) error
	SaveMetrics(ctx context.Context, metrics *AgentMetrics) error
	GetLatestMetrics(ctx context.Context, agentID string) (*AgentMetrics, error)
	PullMetrics(ctx context.Context, agentID string) (*AgentMetrics, error)
}
