package domain

import "time"

// Agent represents a monitored server
type Agent struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Host        string    `json:"host"` // e.g., "192.168.1.100:9090" or "localhost:9090"
	Hostname    string    `json:"hostname"`
	IPAddress   string    `json:"ip_address"`
	Status      string    `json:"status"` // online, offline, error
	LastSeen    time.Time `json:"last_seen"`
	Version     string    `json:"version"`
	Tags        []string  `json:"tags,omitempty"`
	Description string    `json:"description,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// AgentMetrics combines agent info with system metrics
type AgentMetrics struct {
	AgentID    string        `json:"agent_id"`
	AgentName  string        `json:"agent_name"`
	Metrics    SystemMetrics `json:"metrics"`
	ReceivedAt time.Time     `json:"received_at"`
}

// AgentRegistration represents agent registration request
type AgentRegistration struct {
	Name        string   `json:"name" validate:"required"`
	Host        string   `json:"host" validate:"required"` // e.g., "192.168.1.100:9090" or "localhost:9090"
	Hostname    string   `json:"hostname,omitempty"`
	IPAddress   string   `json:"ip_address,omitempty"`
	Version     string   `json:"version,omitempty"`
	Tags        []string `json:"tags,omitempty"`
	Description string   `json:"description,omitempty"`
}

// AgentHeartbeat represents periodic agent check-in
type AgentHeartbeat struct {
	AgentID   string    `json:"agent_id" validate:"required"`
	Timestamp time.Time `json:"timestamp" validate:"required"`
	Status    string    `json:"status"`
}
