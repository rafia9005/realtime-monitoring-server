package supabase

import (
	"context"
	"fmt"

	"github.com/rafia9005/realtime-monitoring-server/internal/domain"
	"github.com/supabase-community/postgrest-go"
	supabase "github.com/supabase-community/supabase-go"
)

type EnvMetricsRepository struct {
	client *supabase.Client
	table  string
}

func NewEnvMetricsRepository(client *supabase.Client) *EnvMetricsRepository {
	return &EnvMetricsRepository{
		client: client,
		table:  "env_metrics",
	}
}

func (r *EnvMetricsRepository) GetLatest(ctx context.Context) (*domain.EnvMetrics, error) {
	var result []domain.EnvMetrics

	_, err := r.client.From(r.table).Select("*", "", false).
		Order("created_at", &postgrest.OrderOpts{Ascending: false}).
		Limit(1, "").
		ExecuteTo(&result)

	if err != nil {
		return nil, fmt.Errorf("failed to get latest env metrics: %w", err)
	}

	if len(result) == 0 {
		return nil, nil // Return nil if no data
	}

	return &result[0], nil
}

func (r *EnvMetricsRepository) Create(ctx context.Context, metrics *domain.EnvMetrics) error {
	var result []domain.EnvMetrics
	_, err := r.client.From(r.table).Insert(metrics, false, "", "*", "").ExecuteTo(&result)
	if err != nil {
		return fmt.Errorf("failed to create env metrics: %w", err)
	}

	if len(result) > 0 {
		*metrics = result[0]
	}

	return nil
}
