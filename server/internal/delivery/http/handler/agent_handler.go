package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
	"github.com/rafia9005/realtime-monitoring-server/internal/domain"
	"github.com/rafia9005/realtime-monitoring-server/internal/pkg/response"
)

type AgentHandler struct {
	agentRepo domain.AgentRepository
}

func NewAgentHandler(agentRepo domain.AgentRepository) *AgentHandler {
	return &AgentHandler{
		agentRepo: agentRepo,
	}
}

// RegisterAgent handles agent registration
func (h *AgentHandler) RegisterAgent(c *echo.Context) error {
	ctx := (*c).Request().Context()

	var req domain.AgentRegistration
	if err := (*c).Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request body", err)
	}

	// Test connection to agent
	url := "http://" + req.Host + "/info"
	httpClient := &http.Client{
		Timeout: 10 * time.Second,
	}
	resp, err := httpClient.Get(url)
	if err != nil {
		return response.Error(c, http.StatusBadRequest, "Cannot connect to agent at "+req.Host, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return response.Error(c, http.StatusBadRequest, "Agent returned non-OK status", nil)
	}

	// Parse agent info from response
	var agentInfoResp struct {
		Success bool `json:"success"`
		Data    struct {
			Name      string `json:"name"`
			Hostname  string `json:"hostname"`
			IPAddress string `json:"ip_address"`
			Version   string `json:"version"`
		} `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&agentInfoResp); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid agent info response", err)
	}

	// Create agent
	agent := &domain.Agent{
		ID:          uuid.New().String(),
		Name:        req.Name,
		Host:        req.Host,
		Hostname:    agentInfoResp.Data.Hostname,
		IPAddress:   agentInfoResp.Data.IPAddress,
		Status:      "online",
		LastSeen:    time.Now(),
		Version:     agentInfoResp.Data.Version,
		Tags:        req.Tags,
		Description: req.Description,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := h.agentRepo.Register(ctx, agent); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to register agent", err)
	}

	return response.Success(c, http.StatusCreated, "Agent registered successfully", agent)
}

// GetAllAgents retrieves all agents
func (h *AgentHandler) GetAllAgents(c *echo.Context) error {
	ctx := (*c).Request().Context()

	agents, err := h.agentRepo.GetAll(ctx)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to get agents", err)
	}

	return response.Success(c, http.StatusOK, "Agents retrieved successfully", agents)
}

// GetAgent retrieves a single agent
func (h *AgentHandler) GetAgent(c *echo.Context) error {
	ctx := (*c).Request().Context()
	id := (*c).Param("id")

	agent, err := h.agentRepo.GetByID(ctx, id)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to get agent", err)
	}

	if agent == nil {
		return response.Error(c, http.StatusNotFound, "Agent not found", nil)
	}

	return response.Success(c, http.StatusOK, "Agent retrieved successfully", agent)
}

// DeleteAgent deletes an agent
func (h *AgentHandler) DeleteAgent(c *echo.Context) error {
	ctx := (*c).Request().Context()
	id := (*c).Param("id")

	if err := h.agentRepo.Delete(ctx, id); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to delete agent", err)
	}

	return response.Success(c, http.StatusOK, "Agent deleted successfully", nil)
}

// Heartbeat handles agent heartbeat
func (h *AgentHandler) Heartbeat(c *echo.Context) error {
	ctx := (*c).Request().Context()

	var req domain.AgentHeartbeat
	if err := (*c).Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request body", err)
	}

	if err := h.agentRepo.UpdateStatus(ctx, req.AgentID, req.Status, time.Now()); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to update heartbeat", err)
	}

	return response.Success(c, http.StatusOK, "Heartbeat received", nil)
}

// ReceiveMetrics handles metrics from agent
func (h *AgentHandler) ReceiveMetrics(c *echo.Context) error {
	ctx := (*c).Request().Context()

	var req domain.AgentMetrics
	if err := (*c).Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request body", err)
	}

	// Get agent info
	agent, err := h.agentRepo.GetByID(ctx, req.AgentID)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to get agent", err)
	}

	if agent == nil {
		return response.Error(c, http.StatusNotFound, "Agent not found", nil)
	}

	// Update agent name in metrics
	req.AgentName = agent.Name
	req.ReceivedAt = time.Now()

	// Save metrics
	if err := h.agentRepo.SaveMetrics(ctx, &req); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to save metrics", err)
	}

	// Update last seen
	if err := h.agentRepo.UpdateStatus(ctx, req.AgentID, "online", time.Now()); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to update status", err)
	}

	return response.Success(c, http.StatusOK, "Metrics received successfully", nil)
}

// GetAgentMetrics retrieves latest metrics for an agent
func (h *AgentHandler) GetAgentMetrics(c *echo.Context) error {
	ctx := (*c).Request().Context()
	id := (*c).Param("id")

	metrics, err := h.agentRepo.GetLatestMetrics(ctx, id)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to get metrics", err)
	}

	if metrics == nil {
		return response.Error(c, http.StatusNotFound, "No metrics found", nil)
	}

	return response.Success(c, http.StatusOK, "Metrics retrieved successfully", metrics)
}
