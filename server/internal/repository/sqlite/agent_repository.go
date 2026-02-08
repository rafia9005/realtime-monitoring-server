package sqlite

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/rafia9005/realtime-monitoring-server/internal/domain"
)

type AgentRepository struct {
	db *sql.DB
}

func NewAgentRepository(db *sql.DB) *AgentRepository {
	return &AgentRepository{
		db: db,
	}
}

func (r *AgentRepository) Register(ctx context.Context, agent *domain.Agent) error {
	tagsJSON, err := json.Marshal(agent.Tags)
	if err != nil {
		return err
	}

	query := `
		INSERT INTO agents (id, name, host, hostname, ip_address, status, last_seen, version, tags, description, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err = r.db.ExecContext(ctx, query,
		agent.ID,
		agent.Name,
		agent.Host,
		agent.Hostname,
		agent.IPAddress,
		agent.Status,
		agent.LastSeen,
		agent.Version,
		string(tagsJSON),
		agent.Description,
		agent.CreatedAt,
		agent.UpdatedAt,
	)

	return err
}

func (r *AgentRepository) GetByID(ctx context.Context, id string) (*domain.Agent, error) {
	query := `
		SELECT id, name, host, hostname, ip_address, status, last_seen, version, tags, description, created_at, updated_at
		FROM agents
		WHERE id = ?
	`

	var agent domain.Agent
	var tagsJSON string

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&agent.ID,
		&agent.Name,
		&agent.Host,
		&agent.Hostname,
		&agent.IPAddress,
		&agent.Status,
		&agent.LastSeen,
		&agent.Version,
		&tagsJSON,
		&agent.Description,
		&agent.CreatedAt,
		&agent.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if tagsJSON != "" && tagsJSON != "null" {
		if err := json.Unmarshal([]byte(tagsJSON), &agent.Tags); err != nil {
			return nil, err
		}
	}

	return &agent, nil
}

func (r *AgentRepository) GetAll(ctx context.Context) ([]domain.Agent, error) {
	query := `
		SELECT id, name, host, hostname, ip_address, status, last_seen, version, tags, description, created_at, updated_at
		FROM agents
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var agents []domain.Agent
	for rows.Next() {
		var agent domain.Agent
		var tagsJSON string

		err := rows.Scan(
			&agent.ID,
			&agent.Name,
			&agent.Host,
			&agent.Hostname,
			&agent.IPAddress,
			&agent.Status,
			&agent.LastSeen,
			&agent.Version,
			&tagsJSON,
			&agent.Description,
			&agent.CreatedAt,
			&agent.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		if tagsJSON != "" && tagsJSON != "null" {
			if err := json.Unmarshal([]byte(tagsJSON), &agent.Tags); err != nil {
				return nil, err
			}
		}

		agents = append(agents, agent)
	}

	return agents, rows.Err()
}

func (r *AgentRepository) UpdateStatus(ctx context.Context, id string, status string, lastSeen time.Time) error {
	query := `
		UPDATE agents
		SET status = ?, last_seen = ?, updated_at = ?
		WHERE id = ?
	`

	_, err := r.db.ExecContext(ctx, query, status, lastSeen, time.Now(), id)
	return err
}

func (r *AgentRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM agents WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *AgentRepository) SaveMetrics(ctx context.Context, metrics *domain.AgentMetrics) error {
	metricsJSON, err := json.Marshal(metrics.Metrics)
	if err != nil {
		return err
	}

	query := `
		INSERT INTO agent_metrics (agent_id, agent_name, metrics, received_at)
		VALUES (?, ?, ?, ?)
	`

	_, err = r.db.ExecContext(ctx, query,
		metrics.AgentID,
		metrics.AgentName,
		string(metricsJSON),
		metrics.ReceivedAt,
	)

	return err
}

func (r *AgentRepository) GetLatestMetrics(ctx context.Context, agentID string) (*domain.AgentMetrics, error) {
	query := `
		SELECT id, agent_id, agent_name, metrics, received_at
		FROM agent_metrics
		WHERE agent_id = ?
		ORDER BY received_at DESC
		LIMIT 1
	`

	var metrics domain.AgentMetrics
	var metricsJSON string
	var id int64

	err := r.db.QueryRowContext(ctx, query, agentID).Scan(
		&id,
		&metrics.AgentID,
		&metrics.AgentName,
		&metricsJSON,
		&metrics.ReceivedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal([]byte(metricsJSON), &metrics.Metrics); err != nil {
		return nil, err
	}

	return &metrics, nil
}

// PullMetrics pulls metrics from the agent's HTTP endpoint
func (r *AgentRepository) PullMetrics(ctx context.Context, agentID string) (*domain.AgentMetrics, error) {
	// 1. Get agent from database
	agent, err := r.GetByID(ctx, agentID)
	if err != nil {
		return nil, err
	}
	if agent == nil {
		return nil, sql.ErrNoRows
	}

	// 2. Make HTTP GET request to agent's /metrics endpoint
	url := "http://" + agent.Host + "/metrics"
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	client := &http.Client{
		Timeout: 10 * time.Second,
	}
	resp, err := client.Do(req)
	if err != nil {
		// Agent is offline, update status
		r.UpdateStatus(ctx, agentID, "offline", time.Now())
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		r.UpdateStatus(ctx, agentID, "error", time.Now())
		return nil, fmt.Errorf("agent returned status %d", resp.StatusCode)
	}

	// 3. Parse JSON response
	var metricsResponse struct {
		Success bool                 `json:"success"`
		Data    domain.SystemMetrics `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&metricsResponse); err != nil {
		return nil, err
	}

	// 4. Create AgentMetrics object
	agentMetrics := &domain.AgentMetrics{
		AgentID:    agent.ID,
		AgentName:  agent.Name,
		Metrics:    metricsResponse.Data,
		ReceivedAt: time.Now(),
	}

	// 5. Save metrics to database
	if err := r.SaveMetrics(ctx, agentMetrics); err != nil {
		return nil, err
	}

	// 6. Update agent status to online
	if err := r.UpdateStatus(ctx, agentID, "online", time.Now()); err != nil {
		return nil, err
	}

	return agentMetrics, nil
}
