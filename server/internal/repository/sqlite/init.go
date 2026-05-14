package sqlite

import (
	"database/sql"
	"fmt"
)

// InitDB initializes the SQLite database with schema for agents only
// Note: env_metrics is stored in Supabase
func InitDB(db *sql.DB) error {
	// Define all table schemas
	schemas := []struct {
		name   string
		schema string
	}{
		{
			name: "agents",
			schema: `
				CREATE TABLE IF NOT EXISTS agents (
					id TEXT PRIMARY KEY,
					name TEXT NOT NULL,
					host TEXT NOT NULL,
					hostname TEXT,
					ip_address TEXT,
					protocol TEXT DEFAULT 'http',
					status TEXT NOT NULL DEFAULT 'offline',
					last_seen DATETIME,
					version TEXT,
					tags TEXT,
					description TEXT,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
				);
				CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
				CREATE INDEX IF NOT EXISTS idx_agents_last_seen ON agents(last_seen);
			`,
		},
		{
			name: "agent_metrics",
			schema: `
				CREATE TABLE IF NOT EXISTS agent_metrics (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					agent_id TEXT NOT NULL,
					agent_name TEXT NOT NULL,
					metrics TEXT NOT NULL,
					received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
				);
				CREATE INDEX IF NOT EXISTS idx_agent_metrics_agent_id ON agent_metrics(agent_id);
				CREATE INDEX IF NOT EXISTS idx_agent_metrics_received_at ON agent_metrics(received_at);
			`,
		},
	}

	// Execute each schema
	for _, table := range schemas {
		if _, err := db.Exec(table.schema); err != nil {
			return fmt.Errorf("failed to create table %s: %w", table.name, err)
		}
		fmt.Printf("✓ Table ready: %s\n", table.name)
	}

	// Run migrations for existing databases
	if err := runMigrations(db); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	fmt.Println("✓ Database initialization completed (SQLite for agents)")
	fmt.Println("  Note: env_metrics is stored in Supabase")
	return nil
}

// runMigrations runs database migrations for schema updates
func runMigrations(db *sql.DB) error {
	migrations := []struct {
		name string
		sql  string
	}{
		{
			name: "add_protocol_column_to_agents",
			sql: `
				ALTER TABLE agents ADD COLUMN protocol TEXT DEFAULT 'http';
			`,
		},
	}

	for _, migration := range migrations {
		// Try to run the migration, ignore errors if column already exists
		_, err := db.Exec(migration.sql)
		if err == nil {
			fmt.Printf("✓ Migration applied: %s\n", migration.name)
		} else {
			// Check if the error is about the column already existing
			errMsg := err.Error()
			if errMsg != "duplicate column name: protocol" && !contains(errMsg, "already exists") {
				// Only return error if it's not about column already existing
				// SQLite might report different error messages
				if !contains(errMsg, "protocol") {
					return fmt.Errorf("migration %s failed: %w", migration.name, err)
				}
			}
			fmt.Printf("ℹ️  Migration skipped (already applied): %s\n", migration.name)
		}
	}

	return nil
}

// contains checks if a string contains a substring
func contains(s, substr string) bool {
	for i := 0; i < len(s)-len(substr)+1; i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
