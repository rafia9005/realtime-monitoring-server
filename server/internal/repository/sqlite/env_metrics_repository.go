package sqlite

import (
	"context"
	"database/sql"

	"github.com/rafia9005/realtime-monitoring-server/internal/domain"
)

type EnvMetricsRepository struct {
	db *sql.DB
}

func NewEnvMetricsRepository(db *sql.DB) *EnvMetricsRepository {
	return &EnvMetricsRepository{
		db: db,
	}
}

func (r *EnvMetricsRepository) GetLatest(ctx context.Context) (*domain.EnvMetrics, error) {
	query := `
		SELECT id, first_temperature, first_humidity, second_temperature, second_humidity, created_at
		FROM env_metrics
		ORDER BY created_at DESC
		LIMIT 1
	`

	var metrics domain.EnvMetrics
	err := r.db.QueryRowContext(ctx, query).Scan(
		&metrics.ID,
		&metrics.FirstTemperature,
		&metrics.FirstHumidity,
		&metrics.SecondTemperature,
		&metrics.SecondHumidity,
		&metrics.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &metrics, nil
}

func (r *EnvMetricsRepository) Create(ctx context.Context, metrics *domain.EnvMetrics) error {
	query := `
		INSERT INTO env_metrics (first_temperature, first_humidity, second_temperature, second_humidity, created_at)
		VALUES (?, ?, ?, ?, ?)
		RETURNING id, first_temperature, first_humidity, second_temperature, second_humidity, created_at
	`

	err := r.db.QueryRowContext(ctx, query,
		metrics.FirstTemperature,
		metrics.FirstHumidity,
		metrics.SecondTemperature,
		metrics.SecondHumidity,
		metrics.CreatedAt,
	).Scan(
		&metrics.ID,
		&metrics.FirstTemperature,
		&metrics.FirstHumidity,
		&metrics.SecondTemperature,
		&metrics.SecondHumidity,
		&metrics.CreatedAt,
	)

	return err
}
