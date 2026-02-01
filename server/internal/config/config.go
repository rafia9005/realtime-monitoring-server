package config

import (
	"fmt"
	"os"

	"github.com/supabase-community/supabase-go"
)

type Config struct {
	App      AppConfig
	Supabase *supabase.Client
}

type AppConfig struct {
	Port string
	Env  string
}

func Load() (*Config, error) {
	// Load App Config
	port := getEnv("PORT", "8080")
	env := getEnv("ENV", "development")

	// Load Supabase Config
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")

	if supabaseURL == "" || supabaseKey == "" {
		return nil, fmt.Errorf("SUPABASE_URL and SUPABASE_KEY must be set")
	}

	// Initialize Supabase Client
	client, err := supabase.NewClient(supabaseURL, supabaseKey, &supabase.ClientOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to initialize supabase client: %w", err)
	}

	return &Config{
		App: AppConfig{
			Port: port,
			Env:  env,
		},
		Supabase: client,
	}, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
