package service

import (
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/bwmarrin/discordgo"
	"github.com/rafia9005/realtime-monitoring-server/internal/domain"
)

// DiscordNotifier handles sending notifications to Discord
type DiscordNotifier struct {
	Token     string
	ChannelID string
	Session   *discordgo.Session
}

// NewDiscordNotifier creates a new Discord notifier
func NewDiscordNotifier(token string, channelID string) (*DiscordNotifier, error) {
	if token == "" {
		return nil, fmt.Errorf("discord bot token is not configured")
	}
	if channelID == "" {
		return nil, fmt.Errorf("discord channel ID is not configured")
	}

	session, err := discordgo.New("Bot " + token)
	if err != nil {
		return nil, fmt.Errorf("failed to create discord session: %w", err)
	}

	notifier := &DiscordNotifier{
		Token:     token,
		ChannelID: channelID,
		Session:   session,
	}

	return notifier, nil
}

// Open opens the Discord websocket connection
func (dn *DiscordNotifier) Open() error {
	return dn.Session.Open()
}

// Close closes the Discord websocket connection
func (dn *DiscordNotifier) Close() error {
	return dn.Session.Close()
}

// SendMessage sends a message to Discord channel
func (dn *DiscordNotifier) SendMessage(message string) error {
	if dn.Session == nil {
		return fmt.Errorf("discord session is not initialized")
	}

	_, err := dn.Session.ChannelMessageSend(dn.ChannelID, message)
	if err != nil {
		log.Printf("Failed to send message to Discord: %v", err)
		return err
	}

	return nil
}

// SendEmbed sends an embed message to Discord channel
func (dn *DiscordNotifier) SendEmbed(embed *discordgo.MessageEmbed) error {
	if dn.Session == nil {
		return fmt.Errorf("discord session is not initialized")
	}

	_, err := dn.Session.ChannelMessageSendEmbed(dn.ChannelID, embed)
	if err != nil {
		log.Printf("Failed to send embed to Discord: %v", err)
		return err
	}

	return nil
}

// SendTemperatureAlert sends a temperature alert embed
func (dn *DiscordNotifier) SendTemperatureAlert(agentName string, currentTemp float64, threshold float64) error {
	color := 16776960 // Yellow/Orange color
	if currentTemp > threshold+10 {
		color = 16711680 // Red color
	}

	icon := "🌡️"
	title := "High Temperature Alert"
	if len(agentName) > 5 && agentName[len(agentName)-5:] == "(MCU)" {
		icon = "📡"
		title = "High MCU Temperature Alert"
	}

	embed := &discordgo.MessageEmbed{
		Title:       fmt.Sprintf("%s %s - %s", icon, title, agentName),
		Color:       color,
		Description: fmt.Sprintf("⚠️ Temperature threshold exceeded!"),
		Fields: []*discordgo.MessageEmbedField{
			{
				Name:   "Current Temperature",
				Value:  fmt.Sprintf("**%.2f°C**", currentTemp),
				Inline: true,
			},
			{
				Name:   "Threshold",
				Value:  fmt.Sprintf("**%.2f°C**", threshold),
				Inline: true,
			},
			{
				Name:   "Timestamp",
				Value:  fmt.Sprintf("`%s`", time.Now().Format("2006-01-02 15:04:05")),
				Inline: false,
			},
		},
		Timestamp: time.Now().Format(time.RFC3339),
	}

	return dn.SendEmbed(embed)
}

// SendAgentAlert sends an agent status alert embed
func (dn *DiscordNotifier) SendAgentAlert(agent *domain.Agent, status string) error {
	color := 65280 // Green for online
	icon := "🟢"
	title := "Agent Online"

	if status == "offline" {
		color = 16711680 // Red for offline
		icon = "🔴"
		title = "Agent Offline"
	} else if status == "added" {
		color = 65535 // Cyan for new
		icon = "✅"
		title = "New Agent Registered"
	} else if status == "removed" {
		color = 10181046 // Gray/Purple for removed
		icon = "🗑️"
		title = "Agent Removed"
	}

	embed := &discordgo.MessageEmbed{
		Title:       fmt.Sprintf("%s %s - %s", icon, title, agent.Name),
		Color:       color,
		Description: fmt.Sprintf("**Host:** `%s`", agent.Host),
		Fields: []*discordgo.MessageEmbedField{
			{
				Name:   "Agent Name",
				Value:  agent.Name,
				Inline: true,
			},
			{
				Name:   "Hostname",
				Value:  agent.Hostname,
				Inline: true,
			},
			{
				Name:   "IP Address",
				Value:  fmt.Sprintf("`%s`", agent.IPAddress),
				Inline: true,
			},
			{
				Name:   "Version",
				Value:  fmt.Sprintf("`%s`", agent.Version),
				Inline: true,
			},
			{
				Name:   "Status",
				Value:  fmt.Sprintf("`%s`", agent.Status),
				Inline: true,
			},
		},
		Timestamp: time.Now().Format(time.RFC3339),
	}

	if status == "offline" && !agent.LastSeen.IsZero() {
		embed.Fields = append(embed.Fields, &discordgo.MessageEmbedField{
			Name:   "Last Seen",
			Value:  fmt.Sprintf("`%s`", agent.LastSeen.Format("2006-01-02 15:04:05")),
			Inline: false,
		})
	}

	return dn.SendEmbed(embed)
}

// CheckMetricsAndNotify checks system metrics and sends alerts to Discord
func (dn *DiscordNotifier) CheckMetricsAndNotify(metrics *domain.SystemMetrics, thresholds AlertThresholds) error {
	var alerts []*discordgo.MessageEmbedField

	// Check CPU usage
	if metrics.CPU.UsagePercent > thresholds.CPUUsagePercent {
		alerts = append(alerts, &discordgo.MessageEmbedField{
			Name:   "🔴 High CPU Usage",
			Value:  fmt.Sprintf("Current: **%.2f%%** | Threshold: **%.2f%%**", metrics.CPU.UsagePercent, thresholds.CPUUsagePercent),
			Inline: false,
		})
	}

	// Check Memory usage
	if metrics.Memory.UsedPercent > thresholds.MemoryUsagePercent {
		alerts = append(alerts, &discordgo.MessageEmbedField{
			Name:   "🟠 High Memory Usage",
			Value:  fmt.Sprintf("Current: **%.2f%%** (%s / %s) | Threshold: **%.2f%%**", metrics.Memory.UsedPercent, formatBytes(metrics.Memory.Used), formatBytes(metrics.Memory.Total), thresholds.MemoryUsagePercent),
			Inline: false,
		})
	}

	// Check Disk usage
	for _, disk := range metrics.Disk {
		if strings.Contains(disk.Device, "loop") || strings.Contains(disk.MountPoint, "/snap") {
			continue
		}
		if disk.UsedPercent > thresholds.DiskUsagePercent {
			alerts = append(alerts, &discordgo.MessageEmbedField{
				Name:   fmt.Sprintf("⚠️ High Disk Usage on %s", disk.MountPoint),
				Value:  fmt.Sprintf("Current: **%.2f%%** (%s / %s) | Threshold: **%.2f%%**", disk.UsedPercent, formatBytes(disk.Used), formatBytes(disk.Total), thresholds.DiskUsagePercent),
				Inline: false,
			})
		}
	}

	// Send alerts if any threshold exceeded
	if len(alerts) > 0 {
		embed := &discordgo.MessageEmbed{
			Title:       fmt.Sprintf("⚡ System Alert from %s", metrics.System.Hostname),
			Color:       16776960, // Orange/Yellow
			Description: fmt.Sprintf("One or more system metrics have exceeded their thresholds"),
			Fields:      alerts,
			Timestamp:   time.Now().Format(time.RFC3339),
		}

		return dn.SendEmbed(embed)
	}

	return nil
}

// SendMetricsSummary sends a comprehensive metrics summary to Discord
func (dn *DiscordNotifier) SendMetricsSummary(metrics *domain.SystemMetrics) error {
	embed := &discordgo.MessageEmbed{
		Title:       fmt.Sprintf("📊 System Metrics Summary - %s", metrics.System.Hostname),
		Color:       3447003, // Blue
		Description: fmt.Sprintf("Metrics as of %s", metrics.Timestamp.Format("2006-01-02 15:04:05")),
		Fields: []*discordgo.MessageEmbedField{
			{
				Name:   "CPU Usage",
				Value:  fmt.Sprintf("**%.2f%%** (%d cores)", metrics.CPU.UsagePercent, metrics.CPU.Cores),
				Inline: true,
			},
			{
				Name:   "Memory Usage",
				Value:  fmt.Sprintf("**%.2f%%** (%s / %s)", metrics.Memory.UsedPercent, formatBytes(metrics.Memory.Used), formatBytes(metrics.Memory.Total)),
				Inline: true,
			},
			{
				Name:   "Processes",
				Value:  fmt.Sprintf("Running: **%d** | Total: **%d**", metrics.Process.Running, metrics.Process.Total),
				Inline: false,
			},
			{
				Name:   "Load Average",
				Value:  fmt.Sprintf("1m: **%.2f** | 5m: **%.2f** | 15m: **%.2f**", metrics.Load.Load1, metrics.Load.Load5, metrics.Load.Load15),
				Inline: false,
			},
			{
				Name:   "Uptime",
				Value:  fmt.Sprintf("`%s`", formatUptime(metrics.System.Uptime)),
				Inline: true,
			},
		},
		Timestamp: time.Now().Format(time.RFC3339),
	}

	return dn.SendEmbed(embed)
}
