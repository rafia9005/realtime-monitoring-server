package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/rafia9005/realtime-monitoring-server/internal/domain"
)

const (
	baseTgAPI = "https://api.telegram.org/bot"
)

// TelegramNotifier handles sending notifications to Telegram
type TelegramNotifier struct {
	BotToken string
	ChatIDs  []string
	Client   *http.Client
}

// AlertThresholds defines the thresholds for triggering alerts
type AlertThresholds struct {
	CPUUsagePercent    float64
	MemoryUsagePercent float64
	DiskUsagePercent   float64
	TempCelsius        float64
}

// DefaultThresholds provides default alert thresholds
var DefaultThresholds = AlertThresholds{
	CPUUsagePercent:    80.0,
	MemoryUsagePercent: 85.0,
	DiskUsagePercent:   90.0,
	TempCelsius:        80.0,
}

// NewTelegramNotifier creates a new Telegram notifier
func NewTelegramNotifier(botToken string, chatIDs []string) *TelegramNotifier {
	return &TelegramNotifier{
		BotToken: botToken,
		ChatIDs:  chatIDs,
		Client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// SendMessage sends a message to all configured Telegram chats
func (tn *TelegramNotifier) SendMessage(message string) error {
	if tn.BotToken == "" {
		return fmt.Errorf("bot token is not configured")
	}

	if len(tn.ChatIDs) == 0 {
		return fmt.Errorf("no chat IDs configured")
	}

	url := fmt.Sprintf("%s%s/sendMessage", baseTgAPI, tn.BotToken)

	for _, chatID := range tn.ChatIDs {
		payload := map[string]interface{}{
			"chat_id":    chatID,
			"text":       message,
			"parse_mode": "HTML",
		}

		jsonData, err := json.Marshal(payload)
		if err != nil {
			log.Printf("Failed to marshal message payload: %v", err)
			continue
		}

		resp, err := tn.Client.Post(url, "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			log.Printf("Failed to send message to chat %s: %v", chatID, err)
			continue
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			log.Printf("Telegram API error for chat %s: status code %d", chatID, resp.StatusCode)
		}
	}

	return nil
}

// CheckMetricsAndNotify checks system metrics against thresholds and sends alerts
func (tn *TelegramNotifier) CheckMetricsAndNotify(metrics *domain.SystemMetrics, thresholds AlertThresholds) error {
	var alerts []string

	// Check CPU usage
	if metrics.CPU.UsagePercent > thresholds.CPUUsagePercent {
		alerts = append(alerts, fmt.Sprintf(
			"🔴 <b>High CPU Usage</b>\nCurrent: <code>%.2f%%</code>\nThreshold: <code>%.2f%%</code>",
			metrics.CPU.UsagePercent,
			thresholds.CPUUsagePercent,
		))
	}

	// Check Memory usage
	if metrics.Memory.UsedPercent > thresholds.MemoryUsagePercent {
		alerts = append(alerts, fmt.Sprintf(
			"🟠 <b>High Memory Usage</b>\nCurrent: <code>%.2f%%</code> (%s / %s)\nThreshold: <code>%.2f%%</code>",
			metrics.Memory.UsedPercent,
			formatBytes(metrics.Memory.Used),
			formatBytes(metrics.Memory.Total),
			thresholds.MemoryUsagePercent,
		))
	}

	// Check Disk usage
	for _, disk := range metrics.Disk {
		if disk.UsedPercent > thresholds.DiskUsagePercent {
			alerts = append(alerts, fmt.Sprintf(
				"⚠️ <b>High Disk Usage on %s</b>\nCurrent: <code>%.2f%%</code> (%s / %s)\nThreshold: <code>%.2f%%</code>",
				disk.MountPoint,
				disk.UsedPercent,
				formatBytes(disk.Used),
				formatBytes(disk.Total),
				thresholds.DiskUsagePercent,
			))
		}
	}

	// Check Temperature
	if metrics.Temperature.CPUTemp > 0 && metrics.Temperature.CPUTemp > thresholds.TempCelsius {
		alerts = append(alerts, fmt.Sprintf(
			"🌡️ <b>High CPU Temperature</b>\nCurrent: <code>%.2f°C</code>\nThreshold: <code>%.2f°C</code>",
			metrics.Temperature.CPUTemp,
			thresholds.TempCelsius,
		))
	}

	// Send alerts if any threshold exceeded
	if len(alerts) > 0 {
		message := fmt.Sprintf(
			"<b>⚡ System Alert from %s</b>\n<code>%s</code>\n\n%s",
			metrics.System.Hostname,
			metrics.Timestamp.Format("2006-01-02 15:04:05"),
			strings.Join(alerts, "\n\n"),
		)

		return tn.SendMessage(message)
	}

	return nil
}

// SendMetricsSummary sends a comprehensive metrics summary
func (tn *TelegramNotifier) SendMetricsSummary(metrics *domain.SystemMetrics) error {
	message := fmt.Sprintf(
		"<b>📊 System Metrics Summary - %s</b>\n"+
			"<code>%s</code>\n\n"+
			"<b>CPU:</b> <code>%.2f%%</code> (%d cores)\n"+
			"<b>Memory:</b> <code>%.2f%%</code> (%s / %s)\n"+
			"<b>Processes:</b> <code>%d running</code> / <code>%d total</code>\n"+
			"<b>Load Average:</b> <code>%.2f, %.2f, %.2f</code>\n"+
			"<b>Uptime:</b> <code>%s</code>",
		metrics.System.Hostname,
		metrics.Timestamp.Format("2006-01-02 15:04:05"),
		metrics.CPU.UsagePercent,
		metrics.CPU.Cores,
		metrics.Memory.UsedPercent,
		formatBytes(metrics.Memory.Used),
		formatBytes(metrics.Memory.Total),
		metrics.Process.Running,
		metrics.Process.Total,
		metrics.Load.Load1,
		metrics.Load.Load5,
		metrics.Load.Load15,
		formatUptime(metrics.System.Uptime),
	)

	return tn.SendMessage(message)
}

// SendAlertRecovery sends a recovery notification
func (tn *TelegramNotifier) SendAlertRecovery(hostname string, alertType string) error {
	message := fmt.Sprintf(
		"<b>✅ Alert Recovered - %s</b>\n<code>%s</code>\n\n"+
			"<b>Alert Type:</b> %s\n"+
			"<b>Time:</b> <code>%s</code>",
		hostname,
		alertType,
		alertType,
		time.Now().Format("2006-01-02 15:04:05"),
	)

	return tn.SendMessage(message)
}

// formatBytes converts bytes to human-readable format
func formatBytes(bytes uint64) string {
	units := []string{"B", "KB", "MB", "GB", "TB"}
	size := float64(bytes)
	unitIndex := 0

	for size >= 1024 && unitIndex < len(units)-1 {
		size /= 1024
		unitIndex++
	}

	return fmt.Sprintf("%.2f %s", size, units[unitIndex])
}

// formatUptime converts seconds to human-readable uptime format
func formatUptime(seconds uint64) string {
	days := seconds / 86400
	hours := (seconds % 86400) / 3600
	minutes := (seconds % 3600) / 60

	return fmt.Sprintf("%d days, %d hours, %d min", days, hours, minutes)
}
