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

func (r *EnvMetricsRepository) GetLatest(ctx context.Context) ([]domain.EnvMetrics, error) {
	var result []domain.EnvMetrics

	// Ambil 50 data terakhir untuk mendapatkan data MCU secara menyeluruh
	_, err := r.client.From(r.table).Select("*", "", false).
		Order("created_at", &postgrest.OrderOpts{Ascending: false}).
		Limit(50, "").
		ExecuteTo(&result)

	if err != nil {
		return nil, fmt.Errorf("failed to get latest env metrics: %w", err)
	}

	if len(result) == 0 {
		return nil, nil // Return nil if no data
	}

	// Filter agar hanya mendapatkan 1 data terbaru untuk setiap MCU
	latestPerMcu := make(map[string]domain.EnvMetrics)
	for _, metric := range result {
		mcuID := metric.McuID
		if mcuID == "" {
			mcuID = "unknown"
		}
		if _, exists := latestPerMcu[mcuID]; !exists {
			latestPerMcu[mcuID] = metric
		}
	}

	var filteredResult []domain.EnvMetrics
	for _, metric := range latestPerMcu {
		filteredResult = append(filteredResult, metric)
	}

	return filteredResult, nil
}

// GetAll retrieves all env metrics records
func (r *EnvMetricsRepository) GetAll(ctx context.Context) ([]domain.EnvMetrics, error) {
	var result []domain.EnvMetrics

	// Fetch all records ordered by created_at descending
	_, err := r.client.From(r.table).Select("*", "", false).
		Order("created_at", &postgrest.OrderOpts{Ascending: false}).
		ExecuteTo(&result)

	if err != nil {
		return nil, fmt.Errorf("failed to get all env metrics: %w", err)
	}

	if len(result) == 0 {
		return []domain.EnvMetrics{}, nil // Return empty slice if no data
	}

	return result, nil
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
