package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
	"github.com/rafia9005/realtime-monitoring-server/internal/config"
	"github.com/rafia9005/realtime-monitoring-server/internal/delivery/http"
	"github.com/rafia9005/realtime-monitoring-server/internal/delivery/http/handler"
	"github.com/rafia9005/realtime-monitoring-server/internal/domain"
	"github.com/rafia9005/realtime-monitoring-server/internal/repository/sqlite"
	supabaseRepo "github.com/rafia9005/realtime-monitoring-server/internal/repository/supabase"
	"github.com/rafia9005/realtime-monitoring-server/internal/service"
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
	defer cfg.DB.Close()

	// Initialize database schema (SQLite for agents)
	if err := sqlite.InitDB(cfg.DB); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	log.Println("Database initialized successfully")

	// Initialize repositories
	var envMetricsRepo domain.EnvMetricsRepository

	// Use Supabase for env_metrics if configured, otherwise use SQLite (for backward compatibility)
	if cfg.SupabaseClient != nil {
		log.Println("Using Supabase for env_metrics")
		envMetricsRepo = supabaseRepo.NewEnvMetricsRepository(cfg.SupabaseClient)
	} else {
		log.Println("Warning: Supabase not configured, env_metrics will not be available")
		// You could use a null repository or SQLite fallback here
		envMetricsRepo = nil
	}

	agentRepo := sqlite.NewAgentRepositoryWithHTTPS(cfg.DB, cfg.HTTPS.InsecureSkipVerify)

	// Initialize agent poller (polls agents every 30 seconds)
	poller := service.NewAgentPoller(agentRepo, 30*time.Second)
	poller.Start()

	// Setup graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	// Initialize Telegram notifier
	var telegramNotifier *service.TelegramNotifier
	if cfg.Telegram.BotToken != "" && len(cfg.Telegram.ChatIDs) > 0 {
		telegramNotifier = service.NewTelegramNotifier(cfg.Telegram.BotToken, cfg.Telegram.ChatIDs)
		log.Printf("Telegram notifier initialized with %d chat(s)", len(cfg.Telegram.ChatIDs))
	} else {
		log.Println("Warning: Telegram notifier not configured")
	}

	// Initialize notification manager
	notificationManager := service.NewNotificationManager(telegramNotifier)

	// Initialize temperature monitor
	temperatureMonitor := service.NewTemperatureMonitor(notificationManager, 80.0) // 80°C threshold

	// Initialize temperature listener and start it
	temperatureListener := service.NewTemperatureListener(temperatureMonitor)
	temperatureListener.Start()

	// Initialize agent status tracker
	agentStatusTracker := service.NewAgentStatusTracker(agentRepo, notificationManager, temperatureListener)
	agentStatusTracker.Start()

	// Initialize handlers
	systemMetricsHandler := handler.NewSystemMetricsHandler(envMetricsRepo, telegramNotifier)
	terminalHandler := handler.NewTerminalHandler()
	temperatureHandler := handler.NewTemperatureHandler(temperatureListener)
	agentHandler := handler.NewAgentHandlerWithHTTPS(agentRepo, notificationManager, temperatureMonitor, agentStatusTracker, cfg.HTTPS.InsecureSkipVerify)

	// Initialize Echo
	e := echo.New()

	// Setup CORS middleware
	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			origin := c.Request().Header.Get("Origin")

			// Check if origin is allowed
			isAllowed := false
			for _, allowedOrigin := range cfg.CORS.AllowedOrigins {
				if origin == allowedOrigin {
					isAllowed = true
					break
				}
			}

			if isAllowed {
				c.Response().Header().Set("Access-Control-Allow-Origin", origin)
			}

			c.Response().Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
			c.Response().Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin")
			c.Response().Header().Set("Access-Control-Allow-Credentials", "true")
			c.Response().Header().Set("Access-Control-Max-Age", "86400")

			if c.Request().Method == "OPTIONS" {
				return c.NoContent(200)
			}

			return next(c)
		}
	})

	// Setup routes
	http.SetupRouter(e, systemMetricsHandler, terminalHandler, agentHandler, temperatureHandler)

	// Start server in a goroutine
	go func() {
		address := fmt.Sprintf(":%s", cfg.App.Port)
		log.Printf("🚀 Server starting on %s", address)
		if err := e.Start(address); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal
	<-sigChan
	log.Println("\n🛑 Shutting down gracefully...")

	// Stop the agent status tracker
	agentStatusTracker.Stop()

	// Stop the poller
	poller.Stop()

	// Close database
	cfg.DB.Close()
	log.Println("✓ Server stopped")
}
