package config

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	_ "github.com/mattn/go-sqlite3"
	supabase "github.com/supabase-community/supabase-go"
)

type TelegramConfig struct {
	BotToken string
	ChatIDs  []string
}

type DiscordConfig struct {
	BotToken  string
	ChannelID string
}

type TemperatureConfig struct {
	CPUThreshold float64
	MCUThreshold float64
}

type CORSConfig struct {
	AllowedOrigins []string
	AllowedMethods []string
	AllowedHeaders []string
}

type HTTPSConfig struct {
	InsecureSkipVerify bool
}

type Config struct {
	App            AppConfig
	DB             *sql.DB          // SQLite for agents
	SupabaseClient *supabase.Client // Supabase for env_metrics
	Telegram       TelegramConfig
	Discord        DiscordConfig
	Temperature    TemperatureConfig
	CORS           CORSConfig
	HTTPS          HTTPSConfig
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
	discordBotToken := getEnv("BOT_DISCORD_TOKEN", "")
	discordChannelID := getEnv("DISCORD_CHANNEL_ID", "")
	corsOriginsStr := getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173")
	corsMethods := getEnv("CORS_ALLOWED_METHODS", "GET,POST,PUT,DELETE,OPTIONS,PATCH")
	corsHeaders := getEnv("CORS_ALLOWED_HEADERS", "Content-Type,Authorization,Accept,Origin")
	insecureSkipVerify := getEnv("HTTPS_INSECURE_SKIP_VERIFY", "false") == "true"

	// Parse temperature thresholds
	cpuTempThreshold := parseFloat64(getEnv("TEMP_ALERT_CPU_THRESHOLD", "80.0"), 80.0)
	mcuTempThreshold := parseFloat64(getEnv("TEMP_ALERT_MCU_THRESHOLD", "45.0"), 45.0)

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

	// Parse CORS configuration
	corsOrigins := parseCSVString(corsOriginsStr)
	if len(corsOrigins) == 0 {
		corsOrigins = []string{"http://localhost:3000", "http://localhost:5173"}
	}

	corsMethodsList := parseCSVString(corsMethods)
	if len(corsMethodsList) == 0 {
		corsMethodsList = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"}
	}

	corsHeadersList := parseCSVString(corsHeaders)
	if len(corsHeadersList) == 0 {
		corsHeadersList = []string{"Content-Type", "Authorization", "Accept", "Origin"}
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
		Discord: DiscordConfig{
			BotToken:  discordBotToken,
			ChannelID: discordChannelID,
		},
		Temperature: TemperatureConfig{
			CPUThreshold: cpuTempThreshold,
			MCUThreshold: mcuTempThreshold,
		},
		CORS: CORSConfig{
			AllowedOrigins: corsOrigins,
			AllowedMethods: corsMethodsList,
			AllowedHeaders: corsHeadersList,
		},
		HTTPS: HTTPSConfig{
			InsecureSkipVerify: insecureSkipVerify,
		},
	}, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func parseFloat64(value string, defaultValue float64) float64 {
	if parsed, err := strconv.ParseFloat(value, 64); err == nil {
		return parsed
	}
	return defaultValue
}

func parseCSVString(str string) []string {
	var result []string
	parts := strings.Split(str, ",")
	for _, part := range parts {
		cleaned := strings.TrimSpace(part)
		if cleaned != "" {
			result = append(result, cleaned)
		}
	}
	return result
}
