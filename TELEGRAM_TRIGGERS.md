# Telegram Message Sending Triggers

Dokumentasi lengkap kapan sistem mengirim message ke Telegram.

## Overview

Sistem mengirim Telegram messages secara **otomatis** dalam situasi berikut:

## 1. 🔵 Agent Registration (Saat Agent Baru Didaftar)

**Trigger:** POST `/api/v1/agents/register`

**Event:**
```
✅ New Agent Registered
```

**Details Dikirim:**
- Waktu registrasi
- Nama agent
- Host address
- Hostname
- IP address
- Version
- Status

**Code Location:** `agent_handler.go:95-97`
```go
if h.notificationManager != nil {
    go h.notificationManager.NotifyAgentAdded(agent)
}
```

**Contoh:**
```bash
curl -X POST http://localhost:8080/api/v1/agents/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Server-01", "host": "192.168.1.100:9090"}'
```

→ **Telegram:** ✅ Notifikasi dikirim ke semua recipients

---

## 2. 🔴 Agent Offline Detection (Saat Agent Tidak Merespon)

**Trigger:** Agent poller detects no heartbeat selama 2 menit

**Frequency:** Check setiap 30 detik

**Event:**
```
🔴 Agent Offline
```

**Details Dikirim:**
- Waktu detection
- Nama agent
- Host address
- Hostname
- IP address
- Last seen time

**Code Location:** `agent_status_tracker.go:119-122`
```go
// Check if agent should be marked offline
timeSinceLastHeartbeat := time.Since(ast.agentStatus[agent.ID].LastHeartbeat)
if timeSinceLastHeartbeat > ast.heartbeatTimeout && agent.Status == "online" {
    ast.markAgentOffline(&agent)
}
```

**Kapan Triggered:**
- Agent tidak kirim metrics selama 2 menit
- Agent tidak respond heartbeat
- Network connectivity lost

---

## 3. 🟢 Agent Back Online (Saat Agent Kembali Merespon)

**Trigger:** Agent status tracker detects agent response after offline

**Frequency:** Check setiap 30 detik

**Event:**
```
🟢 Agent Back Online
```

**Details Dikirim:**
- Waktu recovery
- Nama agent
- Host address
- Hostname
- IP address

**Code Location:** `agent_status_tracker.go:127-133`
```go
if timeSinceLastHeartbeat <= ast.heartbeatTimeout && agent.Status == "offline" {
    ast.markAgentOnline(&agent)
}
```

**Kapan Triggered:**
- Agent kembali kirim metrics setelah offline
- Network restored
- Agent service restarted

---

## 4. 🌡️ High Temperature Alert (Saat Suhu CPU Melebihi Threshold)

**Trigger:** Metrics received dengan temperature > 80°C (configurable)

**Event:**
```
🌡️ High Temperature Alert - {Agent Name}
```

**Details Dikirim:**
- Waktu alert
- Current temperature (°C)
- Threshold temperature (°C)
- Agent name

**Code Location:** `temperature_monitor.go:82-87`
```go
if temperature > tm.threshold && !status.AlertSent {
    status.AlertSent = true
    status.HighTempDetected = true
    status.LastAlertTime = time.Now()
    go tm.notificationManager.NotifyTemperature(status.AgentName, temperature, tm.threshold)
}
```

**Kapan Triggered:**
- POST `/api/v1/agents/metrics` dengan `temperature.cpu_temp > 80`
- Hanya dikirim 1x sampai temperature turun

**Contoh:**
```bash
curl -X POST http://localhost:8080/api/v1/agents/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "abc-123",
    "metrics": {
      "temperature": {
        "cpu_temp": 85.5
      }
    }
  }'
```

→ **Telegram:** 🌡️ Alert dikirim

---

## 5. 🔴 High CPU Usage Alert (Saat CPU > 80%)

**Trigger:** System metrics retrieved via `/api/v1/system-metrics`

**Event:**
```
🔴 High CPU Usage
```

**Details Dikirim:**
- Current CPU usage %
- Threshold %
- Cores count
- Usage per core

**Code Location:** `telegram_notifier.go:105-112`
```go
if metrics.CPU.UsagePercent > thresholds.CPUUsagePercent {
    alerts = append(alerts, fmt.Sprintf(
        "🔴 <b>High CPU Usage</b>\nCurrent: <code>%.2f%%</code>",
        metrics.CPU.UsagePercent,
    ))
}
```

**Kapan Triggered:**
- GET `/api/v1/system-metrics` 
- CPU usage > 80%

---

## 6. 🟠 High Memory Usage Alert (Saat RAM > 85%)

**Trigger:** System metrics retrieved via `/api/v1/system-metrics`

**Event:**
```
🟠 High Memory Usage
```

**Details Dikirim:**
- Current memory usage %
- Used memory (formatted)
- Total memory (formatted)
- Threshold %

**Code Location:** `telegram_notifier.go:114-121`
```go
if metrics.Memory.UsedPercent > thresholds.MemoryUsagePercent {
    alerts = append(alerts, fmt.Sprintf(
        "🟠 <b>High Memory Usage</b>\nCurrent: <code>%.2f%%</code>",
        metrics.Memory.UsedPercent,
    ))
}
```

**Kapan Triggered:**
- GET `/api/v1/system-metrics`
- Memory usage > 85%

---

## 7. ⚠️ High Disk Usage Alert (Saat Disk > 90%)

**Trigger:** System metrics retrieved via `/api/v1/system-metrics`

**Event:**
```
⚠️ High Disk Usage on {Mount Point}
```

**Details Dikirim:**
- Disk mount point (e.g., `/`, `/home`)
- Current disk usage %
- Used space (formatted)
- Total space (formatted)
- Threshold %

**Code Location:** `telegram_notifier.go:123-131`
```go
for _, disk := range metrics.Disk {
    if disk.UsedPercent > thresholds.DiskUsagePercent {
        alerts = append(alerts, fmt.Sprintf(
            "⚠️ <b>High Disk Usage on %s</b>",
            disk.MountPoint,
        ))
    }
}
```

**Kapan Triggered:**
- GET `/api/v1/system-metrics`
- Any disk > 90% usage

---

## Summary: Semua Triggers

| # | Event | Trigger | Frequency | Threshold |
|---|-------|---------|-----------|-----------|
| 1 | ✅ Agent Added | Register endpoint | On-demand | - |
| 2 | 🔴 Agent Offline | Status tracker | 30s check | 2 min no heartbeat |
| 3 | 🟢 Agent Online | Status tracker | 30s check | Response received |
| 4 | 🌡️ High Temp | Metrics received | Per metrics | > 80°C |
| 5 | 🔴 High CPU | System metrics | Per request | > 80% |
| 6 | 🟠 High Memory | System metrics | Per request | > 85% |
| 7 | ⚠️ High Disk | System metrics | Per request | > 90% |

---

## Configuration

### Temperature Threshold
Edit `main.go` baris ~77:
```go
temperatureMonitor := service.NewTemperatureMonitor(notificationManager, 80.0) // Change 80.0
```

### Agent Heartbeat Timeout
Edit `agent_status_tracker.go` baris ~42:
```go
ast.heartbeatTimeout = 2 * time.Minute // Change timeout
```

### Status Check Interval
Edit `agent_status_tracker.go` baris ~44:
```go
ast.checkInterval = 30 * time.Second // Change check frequency
```

### CPU/Memory/Disk Thresholds
Edit `telegram_notifier.go` baris ~29-32:
```go
var DefaultThresholds = AlertThresholds{
    CPUUsagePercent:    80.0,     // Change to your threshold
    MemoryUsagePercent: 85.0,
    DiskUsagePercent:   90.0,
    TempCelsius:        80.0,
}
```

---

## Real-Time Flow

```
┌──────────────────────────────────────────┐
│         Event Occurs                      │
├──────────────────────────────────────────┤
│  1. Agent registered                     │
│  2. Metrics received                     │
│  3. Heartbeat timeout detected           │
│  4. Agent recovery detected              │
└────────────────┬─────────────────────────┘
                 │
                 ▼
         ┌──────────────┐
         │  Notification│
         │  Manager     │
         └────────┬─────┘
                  │
        ┌─────────┴──────────┐
        ▼                    ▼
  ┌──────────────┐    ┌──────────────┐
  │  Format Msg  │    │ Publish Event│
  └────────┬─────┘    └────────┬─────┘
           │                   │
           ▼                   ▼
  ┌─────────────────────────────┐
  │ Telegram Bot API            │
  │ (sendMessage)               │
  └─────────────────────────────┘
           │
    ┌──────┴──────┬──────┬──────┐
    ▼             ▼      ▼      ▼
  Chat1        Chat2   Chat3  Chat4
```

---

## Testing

### Test Agent Registration Notification
```bash
curl -X POST http://localhost:8080/api/v1/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Agent",
    "host": "localhost:9090"
  }'
```

### Test High Temperature Notification
```bash
AGENT_ID="your-agent-id"

curl -X POST http://localhost:8080/api/v1/agents/metrics \
  -H "Content-Type: application/json" \
  -d "{
    \"agent_id\": \"$AGENT_ID\",
    \"metrics\": {
      \"temperature\": {
        \"cpu_temp\": 85.5
      }
    }
  }"
```

### Test High Resource Notification
```bash
curl http://localhost:8080/api/v1/system-metrics
```
(Jika CPU/Memory/Disk melebihi threshold)

---

## Monitoring

### Check Notification Logs
```bash
tail -f server.log | grep -E "notification|Telegram|temperature|High|Agent"
```

### Check Telegram Delivery
```bash
# All Telegram API calls
tail -f server.log | grep "Telegram"

# Only errors
tail -f server.log | grep "error" | grep -i telegram
```

---

## Troubleshooting

### Notifikasi Tidak Dikirim

1. **Check Telegram Config:**
   ```env
   BOT_TELEGRAM_TOKEN=valid_token_here
   TELEGRAM_ID=8198011061
   ```

2. **Check Server Logs:**
   ```bash
   tail server.log | grep -i telegram
   ```

3. **Verify Bot Token:**
   ```bash
   curl "https://api.telegram.org/bot{TOKEN}/getMe"
   ```

4. **Verify Chat ID:**
   ```bash
   curl "https://api.telegram.org/bot{TOKEN}/getUpdates"
   ```

### Notifikasi Terlalu Banyak?

Adjust thresholds di code atau kurangi check frequency.

### Hanya Beberapa Notifications Masuk?

- Verify multiple TELEGRAM_ID format di .env
- Check logs untuk API errors per chat ID
- Test dengan single chat ID dulu

---

## Best Practices

1. **Set Realistic Thresholds**
   - CPU: 80-90% untuk servers yang diharapkan high load
   - Memory: 85-95% untuk servers dengan besar RAM
   - Disk: 85-95% untuk monitoring space

2. **Monitor Notification Logs**
   ```bash
   grep "notification sent\|failed" server.log
   ```

3. **Test After Configuration Change**
   - Register new agent
   - Send metrics dengan threshold-breaking values
   - Verify Telegram messages received

4. **Alert Fatigue Prevention**
   - Set appropriate timeouts
   - Don't set thresholds too low
   - Configure meaningful alert windows

5. **Multiple Recipients Setup**
   ```env
   TELEGRAM_ID=id1,id2,id3  # All get same notifications
   ```
