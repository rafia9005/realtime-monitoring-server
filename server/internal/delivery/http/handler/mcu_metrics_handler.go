package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/rafia9005/realtime-monitoring-server/internal/domain"
	"github.com/rafia9005/realtime-monitoring-server/internal/pkg/response"
)

type McuMetricsHandler struct {
	envMetricsRepo domain.EnvMetricsRepository
}

func NewMcuMetricsHandler(envMetricsRepo domain.EnvMetricsRepository) *McuMetricsHandler {
	return &McuMetricsHandler{
		envMetricsRepo: envMetricsRepo,
	}
}

// GetMcuMetrics retrieves MCU sensor metrics with optional filtering
func (h *McuMetricsHandler) GetMcuMetrics(c *echo.Context) error {
	ctx := (*c).Request().Context()

	// Get query parameters for filtering
	mcuID := (*c).QueryParam("mcu_id")
	startDateStr := (*c).QueryParam("start_date")
	endDateStr := (*c).QueryParam("end_date")
	limitStr := (*c).QueryParam("limit")

	// Parse limit (default 1000, max 10000)
	limit := 1000
	if limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 && parsedLimit <= 10000 {
			limit = parsedLimit
		}
	}

	// Parse date filters
	var startDate, endDate *time.Time
	if startDateStr != "" {
		if t, err := time.Parse(time.RFC3339, startDateStr); err == nil {
			startDate = &t
		}
	}
	if endDateStr != "" {
		if t, err := time.Parse(time.RFC3339, endDateStr); err == nil {
			endDate = &t
		}
	}

	// For now, get all metrics and filter in application
	// This is a workaround since Supabase repository doesn't have filtering yet
	metrics, err := h.envMetricsRepo.GetLatest(ctx)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to get MCU metrics", err)
	}

	if metrics == nil {
		metrics = []domain.EnvMetrics{}
	}

	// Filter by MCU ID if provided
	if mcuID != "" {
		filtered := []domain.EnvMetrics{}
		for _, m := range metrics {
			if m.McuID == mcuID {
				filtered = append(filtered, m)
			}
		}
		metrics = filtered
	}

	// Filter by date range if provided
	if startDate != nil || endDate != nil {
		filtered := []domain.EnvMetrics{}
		for _, m := range metrics {
			if startDate != nil && m.CreatedAt.Before(*startDate) {
				continue
			}
			if endDate != nil && m.CreatedAt.After(*endDate) {
				continue
			}

			filtered = append(filtered, m)
		}
		metrics = filtered
	}

	// Apply limit
	if len(metrics) > limit {
		metrics = metrics[:limit]
	}

	return response.Success(c, http.StatusOK, "MCU metrics retrieved successfully", metrics)
}
