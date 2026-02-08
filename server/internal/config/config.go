package config

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
	supabase "github.com/supabase-community/supabase-go"
)

type Config struct {
	App            AppConfig
	DB             *sql.DB          // SQLite for agents
	SupabaseClient *supabase.Client // Supabase for env_metrics
}

type AppConfig struct {
	Port        string
	Env         string
	DBPath      string
	SupabaseURL string
	SupabaseKey string
}

func Load() (*Config, error) {
	// Load App Config
	port := getEnv("PORT", "8080")
	env := getEnv("ENV", "development")
	dbPath := getEnv("DB_PATH", "./data/monitoring.db")
	supabaseURL := getEnv("SUPABASE_URL", "")
	supabaseKey := getEnv("SUPABASE_KEY", "")

	// Ensure data directory exists
	dbDir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create database directory: %w", err)
	}

	// Initialize SQLite Database (for agents)
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Enable foreign keys
	if _, err := db.Exec("PRAGMA foreign_keys = ON"); err != nil {
		return nil, fmt.Errorf("failed to enable foreign keys: %w", err)
	}

	// Initialize Supabase Client (for env_metrics) - optional
	var supabaseClient *supabase.Client
	if supabaseURL != "" && supabaseKey != "" {
		supabaseClient, err = supabase.NewClient(supabaseURL, supabaseKey, nil)
		if err != nil {
			return nil, fmt.Errorf("failed to create supabase client: %w", err)
		}
	}

	return &Config{
		App: AppConfig{
			Port:        port,
			Env:         env,
			DBPath:      dbPath,
			SupabaseURL: supabaseURL,
			SupabaseKey: supabaseKey,
		},
		DB:             db,
		SupabaseClient: supabaseClient,
	}, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
