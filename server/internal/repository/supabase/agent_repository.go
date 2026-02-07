package supabase

import (
	"context"
	"time"

	"github.com/rafia9005/realtime-monitoring-server/internal/domain"
	"github.com/supabase-community/postgrest-go"
	"github.com/supabase-community/supabase-go"
)

type AgentRepository struct {
	client *supabase.Client
}

func NewAgentRepository(client *supabase.Client) *AgentRepository {
	return &AgentRepository{
		client: client,
	}
}

func (r *AgentRepository) Register(ctx context.Context, agent *domain.Agent) error {
	var results []domain.Agent
	_, err := r.client.From("agents").Insert(agent, false, "", "*", "").ExecuteTo(&results)
	if err != nil {
		return err
	}
	if len(results) > 0 {
		*agent = results[0]
	}
	return nil
}

func (r *AgentRepository) GetByID(ctx context.Context, id string) (*domain.Agent, error) {
	var agents []domain.Agent
	_, err := r.client.From("agents").
		Select("*", "", false).
		Eq("id", id).
		Single().
		ExecuteTo(&agents)

	if err != nil {
		return nil, err
	}

	if len(agents) == 0 {
		return nil, nil
	}

	return &agents[0], nil
}

func (r *AgentRepository) GetAll(ctx context.Context) ([]domain.Agent, error) {
	var agents []domain.Agent
	_, err := r.client.From("agents").
		Select("*", "", false).
		Order("created_at", &postgrest.OrderOpts{Ascending: false}).
		ExecuteTo(&agents)

	if err != nil {
		return nil, err
	}

	return agents, nil
}

func (r *AgentRepository) UpdateStatus(ctx context.Context, id string, status string, lastSeen time.Time) error {
	updates := map[string]interface{}{
		"status":     status,
		"last_seen":  lastSeen,
		"updated_at": time.Now(),
	}

	var results []domain.Agent
	_, err := r.client.From("agents").
		Update(updates, "", "").
		Eq("id", id).
		ExecuteTo(&results)

	return err
}

func (r *AgentRepository) Delete(ctx context.Context, id string) error {
	var results []domain.Agent
	_, err := r.client.From("agents").
		Delete("", "").
		Eq("id", id).
		ExecuteTo(&results)

	return err
}

func (r *AgentRepository) SaveMetrics(ctx context.Context, metrics *domain.AgentMetrics) error {
	var results []domain.AgentMetrics
	_, err := r.client.From("agent_metrics").Insert(metrics, false, "", "*", "").ExecuteTo(&results)
	return err
}

func (r *AgentRepository) GetLatestMetrics(ctx context.Context, agentID string) (*domain.AgentMetrics, error) {
	var metrics []domain.AgentMetrics
	_, err := r.client.From("agent_metrics").
		Select("*", "", false).
		Eq("agent_id", agentID).
		Order("received_at", &postgrest.OrderOpts{Ascending: false}).
		Limit(1, "").
		ExecuteTo(&metrics)

	if err != nil {
		return nil, err
	}

	if len(metrics) == 0 {
		return nil, nil
	}

	return &metrics[0], nil
}
