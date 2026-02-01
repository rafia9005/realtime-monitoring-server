package main

import (
	"fmt"
	"log"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
	"github.com/rafia9005/realtime-monitoring-server/internal/config"
	"github.com/rafia9005/realtime-monitoring-server/internal/delivery/http"
	"github.com/rafia9005/realtime-monitoring-server/internal/delivery/http/handler"
	"github.com/rafia9005/realtime-monitoring-server/internal/repository/supabase"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize repository
	envMetricsRepo := supabase.NewEnvMetricsRepository(cfg.Supabase)

	// Initialize handler
	systemMetricsHandler := handler.NewSystemMetricsHandler(envMetricsRepo)

	// Initialize Echo
	e := echo.New()

	// Setup routes
	http.SetupRouter(e, systemMetricsHandler)

	// Start server
	address := fmt.Sprintf(":%s", cfg.App.Port)
	log.Printf("Server starting on %s", address)
	log.Printf("Available endpoints:")
	log.Printf("  - GET  /health")
	log.Printf("  - GET  /api/v1/system-metrics")
	if err := e.Start(address); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
