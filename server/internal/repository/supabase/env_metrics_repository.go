package supabase

import (
	"context"
	"fmt"
	"log"

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
	var rows []domain.EnvMetrics

	// Ambil 500 data terbaru dari tabel env_metrics, cukup untuk menampung semua MCU
	_, err := r.client.From(r.table).Select("*", "", false).
		Order("created_at", &postgrest.OrderOpts{Ascending: false}).
		Limit(500, "").
		ExecuteTo(&rows)

	if err != nil {
		log.Printf("[EnvMetrics] GetLatest error: %v", err)
		return nil, fmt.Errorf("failed to get latest env metrics: %w", err)
	}

	if len(rows) == 0 {
		log.Println("[EnvMetrics] GetLatest: tidak ada data di tabel env_metrics")
		return []domain.EnvMetrics{}, nil
	}

	// Deduplikasi: ambil hanya 1 data terbaru per mcu_id
	seen := make(map[string]bool)
	var latest []domain.EnvMetrics
	for _, m := range rows {
		mcuID := m.McuID
		if mcuID == "" {
			mcuID = "unknown"
		}
		if !seen[mcuID] {
			seen[mcuID] = true
			latest = append(latest, m)
		}
	}

	log.Printf("[EnvMetrics] GetLatest: ditemukan %d MCU unik dari %d total baris", len(latest), len(rows))
	return latest, nil
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
