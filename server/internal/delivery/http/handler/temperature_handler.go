package handler

import (
	"encoding/json"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/rafia9005/realtime-monitoring-server/internal/pkg/response"
	"github.com/rafia9005/realtime-monitoring-server/internal/service"
)

// TemperatureHandler handles temperature-related HTTP requests
type TemperatureHandler struct {
	temperatureListener *service.TemperatureListener
}

// NewTemperatureHandler creates a new temperature handler
func NewTemperatureHandler(temperatureListener *service.TemperatureListener) *TemperatureHandler {
	return &TemperatureHandler{
		temperatureListener: temperatureListener,
	}
}

// GetTemperatureStatus returns current temperature status for all agents
func (h *TemperatureHandler) GetTemperatureStatus(c *echo.Context) error {
	data, err := h.temperatureListener.GetTemperatureJSON()
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to get temperature status", err)
	}

	var result interface{}
	if err := json.Unmarshal(data, &result); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to parse temperature data", err)
	}

	return response.Success(c, http.StatusOK, "Temperature status retrieved", result)
}

// TemperatureStream handles Server-Sent Events streaming of temperature updates
func (h *TemperatureHandler) TemperatureStream(c *echo.Context) error {
	agentID := c.QueryParam("agent_id")
	if agentID == "" {
		agentID = "*" // Subscribe to all agents
	}

	// Subscribe to temperature updates
	tempChan := h.temperatureListener.Subscribe(agentID)
	defer h.temperatureListener.Unsubscribe(agentID, tempChan)

	w := c.Response()
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")
	w.WriteHeader(http.StatusOK)

	// Flush to ensure headers are sent
	if flusher, ok := w.(http.Flusher); ok {
		flusher.Flush()
	}

	for {
		select {
		case <-c.Request().Context().Done():
			return nil
		case tempData := <-tempChan:
			if tempData != nil {
				// Send as Server-Sent Events
				data, _ := json.Marshal(tempData)
				w.Write([]byte("data: "))
				w.Write(data)
				w.Write([]byte("\n\n"))

				if flusher, ok := w.(http.Flusher); ok {
					flusher.Flush()
				}
			}
		}
	}
}
