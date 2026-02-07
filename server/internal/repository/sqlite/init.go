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

	fmt.Println("✓ Database initialization completed (SQLite for agents)")
	fmt.Println("  Note: env_metrics is stored in Supabase")
	return nil
}
