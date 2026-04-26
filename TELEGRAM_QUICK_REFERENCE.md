# Quick Reference - When Telegram Messages Are Sent

## 7 Situasi Kapan Telegram Messages Dikirim

### 1️⃣ **Agent Baru Didaftar**
```
Endpoint: POST /api/v1/agents/register
Trigger: Langsung saat registration
Message: ✅ New Agent Registered
```

### 2️⃣ **Agent Offline (Tidak Merespon 2 Menit)**
```
Trigger: Agent Poller detects no heartbeat
Frequency: Check setiap 30 detik
Message: 🔴 Agent Offline
Timeout: 2 menit tanpa response
```

### 3️⃣ **Agent Kembali Online**
```
Trigger: Agent responses after offline
Frequency: Check setiap 30 detik
Message: 🟢 Agent Back Online
```

### 4️⃣ **Suhu CPU Terlalu Tinggi**
```
Endpoint: POST /api/v1/agents/metrics
Trigger: temperature.cpu_temp > 80°C
Message: 🌡️ High Temperature Alert
Note: Hanya 1x sampai suhu normal
```

### 5️⃣ **CPU Usage Terlalu Tinggi**
```
Endpoint: GET /api/v1/system-metrics
Trigger: CPU > 80%
Message: 🔴 High CPU Usage
```

### 6️⃣ **Memory Usage Terlalu Tinggi**
```
Endpoint: GET /api/v1/system-metrics
Trigger: Memory > 85%
Message: 🟠 High Memory Usage
```

### 7️⃣ **Disk Usage Terlalu Tinggi**
```
Endpoint: GET /api/v1/system-metrics
Trigger: Disk > 90%
Message: ⚠️ High Disk Usage
```

---

## Setup in 5 Minutes

### 1. Add Environment Variables
```bash
# .env di folder @server/
BOT_TELEGRAM_TOKEN=YOUR_BOT_TOKEN
TELEGRAM_ID=YOUR_CHAT_ID
```

### 2. Start Server
```bash
cd server && go run main.go
```

### 3. Register Agent
```bash
curl -X POST http://localhost:8080/api/v1/agents/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Server-01", "host": "localhost:9090"}'
```
→ ✅ Telegram notification sent

### 4. Send Metrics
```bash
curl -X POST http://localhost:8080/api/v1/agents/metrics \
  -H "Content-Type: application/json" \
  -d '{"agent_id": "...", "metrics": {"temperature": {"cpu_temp": 85}}}'
```
→ 🌡️ Telegram alert sent (if > 80°C)

### 5. Monitor
```bash
tail -f server.log | grep Telegram
```

---

## Message Format Examples

### ✅ New Agent Message
```
✅ New Agent Registered
2024-01-15 10:30:00

Name: Production Server
Host: 192.168.1.100:9090
Hostname: prod-machine
IP Address: 192.168.1.100
Version: 1.0.0
Status: online
```

### 🌡️ Temperature Alert
```
🌡️ High Temperature Alert - Production Server
2024-01-15 10:35:00

Current: 85.50°C
Threshold: 80.00°C
```

### 🔴 Agent Offline Message
```
🔴 Agent Offline
2024-01-15 10:40:00

Agent Name: Production Server
Host: 192.168.1.100:9090
Hostname: prod-machine
IP Address: 192.168.1.100
Last Seen: 2024-01-15 10:38:00
```

### 🟢 Agent Back Online
```
🟢 Agent Back Online
2024-01-15 10:45:00

Agent Name: Production Server
Host: 192.168.1.100:9090
Hostname: prod-machine
IP Address: 192.168.1.100
```

---

## Multiple Recipients

### Format Supported ✅
```env
# Single
TELEGRAM_ID=8198011061

# Comma-separated
TELEGRAM_ID=8198011061,9876543210,1112223334

# JSON Array
TELEGRAM_ID=['8198011061', '9876543210']
TELEGRAM_ID=["8198011061", "9876543210"]
```

**Semua akan menerima notifikasi yang sama!**

---

## Configuration Quick Edit

### Change Temperature Threshold
File: `server/main.go` line ~77
```go
temperatureMonitor := service.NewTemperatureMonitor(notificationManager, 80.0)
// Change 80.0 to your value
```

### Change Agent Timeout
File: `server/internal/service/agent_status_tracker.go` line ~42
```go
ast.heartbeatTimeout = 2 * time.Minute
// Change to your value
```

### Change Check Frequency
File: `server/internal/service/agent_status_tracker.go` line ~44
```go
ast.checkInterval = 30 * time.Second
// Change to your value
```

### Change CPU/Memory/Disk Thresholds
File: `server/internal/service/telegram_notifier.go` line ~29
```go
var DefaultThresholds = AlertThresholds{
    CPUUsagePercent:    80.0,     // <- Change
    MemoryUsagePercent: 85.0,     // <- Change
    DiskUsagePercent:   90.0,     // <- Change
    TempCelsius:        80.0,     // <- Change
}
```

---

## Testing Checklist

- [ ] Setup BOT_TELEGRAM_TOKEN & TELEGRAM_ID
- [ ] Start server: `go run main.go`
- [ ] Register agent: `curl ... /agents/register`
- [ ] Check Telegram: ✅ received message
- [ ] Send high-temp metrics: `curl ... /agents/metrics`
- [ ] Check Telegram: 🌡️ received alert
- [ ] Wait 2 min with no heartbeat
- [ ] Check Telegram: 🔴 received offline alert
- [ ] Send metrics again
- [ ] Check Telegram: 🟢 received online message

---

## Troubleshooting Quick Tips

| Issue | Solution |
|-------|----------|
| Notifikasi tidak masuk | Check BOT_TELEGRAM_TOKEN & TELEGRAM_ID |
| "API error 400" | Chat ID invalid atau format salah |
| "Failed to connect" | Bot tidak punya akses ke chat |
| Hanya beberapa recipients dapat | Check TELEGRAM_ID format |
| Too many notifications | Raise thresholds atau increase timeout |
| No notifications at all | Check `tail -f server.log \| grep Telegram` |

---

## API Endpoints Summary

| Endpoint | Trigger | Message |
|----------|---------|---------|
| `POST /api/v1/agents/register` | New agent | ✅ Registered |
| `POST /api/v1/agents/metrics` | Temp > 80°C | 🌡️ Alert |
| `POST /api/v1/agents/metrics` | No heartbeat 2min | 🔴 Offline |
| `POST /api/v1/agents/metrics` | Response after offline | 🟢 Online |
| `GET /api/v1/system-metrics` | CPU > 80% | 🔴 CPU Alert |
| `GET /api/v1/system-metrics` | Memory > 85% | 🟠 Memory Alert |
| `GET /api/v1/system-metrics` | Disk > 90% | ⚠️ Disk Alert |

---

## Performance Notes

- **Async Delivery:** Notifications sent without blocking requests
- **Rate Limiting:** Telegram ~30 msg/sec per bot
- **Multiple Recipients:** Scales horizontally (1 event × N recipients)
- **No Duplicates:** Temperature alert only sent once until normalized

---

## Common Patterns

### Monitor Single Server
```env
BOT_TELEGRAM_TOKEN=token
TELEGRAM_ID=your_chat_id
```

### Alert Team
```env
BOT_TELEGRAM_TOKEN=token
TELEGRAM_ID=engineer1_id,engineer2_id,team_group_id
```

### On-Call Rotation
```env
BOT_TELEGRAM_TOKEN=token
TELEGRAM_ID=on_call_id,escalation_channel_id,ops_team_id
```

---

## Need More Info?

- Full documentation: See `TELEGRAM_TRIGGERS.md`
- Multiple recipients: See `MULTIPLE_RECIPIENTS.md`
- Real-time features: See `NOTIFICATIONS.md`
- Setup guide: See `REAL_TIME_SETUP.md`
