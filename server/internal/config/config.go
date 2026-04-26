package config

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	_ "github.com/mattn/go-sqlite3"
	supabase "github.com/supabase-community/supabase-go"
)

type TelegramConfig struct {
	BotToken string
	ChatIDs  []string
}

type Config struct {
	App            AppConfig
	DB             *sql.DB          // SQLite for agents
	SupabaseClient *supabase.Client // Supabase for env_metrics
	Telegram       TelegramConfig
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
	botToken := getEnv("BOT_TELEGRAM_TOKEN", "")
	telegramIDsStr := getEnv("TELEGRAM_ID", "[]")

	// Parse Telegram chat IDs
	var chatIDs []string
	cleanStr := strings.TrimSpace(telegramIDsStr)

	// Remove square brackets if present
	if strings.HasPrefix(cleanStr, "[") && strings.HasSuffix(cleanStr, "]") {
		cleanStr = cleanStr[1 : len(cleanStr)-1]
	}

	// Try JSON parsing first
	if strings.Contains(cleanStr, "\"") {
		// Has quotes, try JSON array
		var jsonIDs []string
		if err := json.Unmarshal([]byte("["+cleanStr+"]"), &jsonIDs); err == nil {
			chatIDs = jsonIDs
		}
	}

	// If empty, try other formats
	if len(chatIDs) == 0 {
		if strings.Contains(cleanStr, ",") {
			// Comma-separated
			parts := strings.Split(cleanStr, ",")
			for _, part := range parts {
				cleaned := strings.TrimSpace(part)
				cleaned = strings.Trim(cleaned, "'\"")
				if cleaned != "" {
					chatIDs = append(chatIDs, cleaned)
				}
			}
		} else if cleanStr != "" && cleanStr != "[]" {
			// Single ID
			cleaned := strings.Trim(cleanStr, "'\"")
			if cleaned != "" {
				chatIDs = []string{cleaned}
			}
		}
	}

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
		Telegram: TelegramConfig{
			BotToken: botToken,
			ChatIDs:  chatIDs,
		},
	}, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
