package http

import (
	"github.com/labstack/echo/v5"
	"github.com/rafia9005/realtime-monitoring-server/internal/delivery/http/handler"
	"github.com/rafia9005/realtime-monitoring-server/internal/delivery/http/middleware"
)

func SetupRouter(e *echo.Echo, systemMetricsHandler *handler.SystemMetricsHandler, terminalHandler *handler.TerminalHandler, agentHandler *handler.AgentHandler) {
	// Middleware
	e.Use(middleware.CORS())

	// Health check
	e.GET("/health", func(c *echo.Context) error {
		return (*c).JSON(200, map[string]string{
			"status": "ok",
		})
	})

	// API v1
	v1 := e.Group("/api/v1")

	// System Metrics endpoint (includes environmental metrics from database)
	v1.GET("/system-metrics", systemMetricsHandler.GetMetrics)

	// WebSocket Terminal endpoint
	v1.GET("/terminal", terminalHandler.HandleTerminal)

	// Agent endpoints
	agents := v1.Group("/agents")
	agents.POST("/register", agentHandler.RegisterAgent)
	agents.GET("", agentHandler.GetAllAgents)
	agents.GET("/:id", agentHandler.GetAgent)
	agents.DELETE("/:id", agentHandler.DeleteAgent)
	agents.POST("/heartbeat", agentHandler.Heartbeat)
	agents.POST("/metrics", agentHandler.ReceiveMetrics)
	agents.GET("/:id/metrics", agentHandler.GetAgentMetrics)
}
