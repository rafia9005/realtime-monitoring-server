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

func (r *EnvMetricsRepository) GetLatest(ctx context.Context) ([]domain.EnvMetrics, error) {
	query := `
		SELECT id, created_at, mcu_id, mcu_name, temperature, humidity
		FROM env_metrics 
		WHERE id IN (
			SELECT MAX(id) FROM env_metrics GROUP BY mcu_id
		)
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	defer rows.Close()

	var metricsList []domain.EnvMetrics
	for rows.Next() {
		var metrics domain.EnvMetrics
		err := rows.Scan(
			&metrics.ID,
			&metrics.CreatedAt,
			&metrics.McuID,
			&metrics.McuName,
			&metrics.Temperature,
			&metrics.Humidity,
		)
		if err != nil {
			continue
		}
		metricsList = append(metricsList, metrics)
	}

	return metricsList, nil
}

func (r *EnvMetricsRepository) Create(ctx context.Context, metrics *domain.EnvMetrics) error {
	query := `
		INSERT INTO env_metrics (created_at, mcu_id, mcu_name, temperature, humidity)
		VALUES (?, ?, ?, ?, ?)
		RETURNING id, created_at, mcu_id, mcu_name, temperature, humidity
	`

	err := r.db.QueryRowContext(ctx, query,
		metrics.CreatedAt,
		metrics.McuID,
		metrics.McuName,
		metrics.Temperature,
		metrics.Humidity,
	).Scan(
		&metrics.ID,
		&metrics.CreatedAt,
		&metrics.McuID,
		&metrics.McuName,
		&metrics.Temperature,
		&metrics.Humidity,
	)

	return err
}
