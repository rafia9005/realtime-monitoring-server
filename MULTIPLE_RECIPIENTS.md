# Multiple Recipients Telegram Notifications

Sistem notifikasi real-time support mengirim ke multiple Telegram chat IDs.

## Configuration Format

### Format 1: Single ID
```env
TELEGRAM_ID=8198011061
```

### Format 2: Comma-Separated
```env
TELEGRAM_ID=8198011061,9876543210,1112223334
```

### Format 3: JSON Array dengan Double Quotes
```env
TELEGRAM_ID=["8198011061", "9876543210", "1112223334"]
```

### Format 4: JSON Array dengan Single Quotes
```env
TELEGRAM_ID=['8198011061', '9876543210', '1112223334']
```

## Setup Guide

### 1. Get Multiple Chat IDs dari Telegram

#### Untuk Personal Account:
1. Buat bot via [@BotFather](https://t.me/botfather)
2. Dapatkan token bot
3. Chat ke bot untuk dapetin Chat ID:
   ```bash
   curl "https://api.telegram.org/bot{TOKEN}/getUpdates"
   ```
4. Lihat `"id": 8198011061` di response

#### Untuk Grup/Channel:
1. Add bot ke grup/channel
2. Send message di grup
3. Jalankan:
   ```bash
   curl "https://api.telegram.org/bot{TOKEN}/getUpdates"
   ```
4. Chat ID akan muncul (bisa negative untuk grup)

### 2. Update .env

```env
# Bot Token (sama untuk semua recipients)
BOT_TELEGRAM_TOKEN=YOUR_BOT_TOKEN

# Multiple Recipients
TELEGRAM_ID=8198011061,9876543210,1112223334
```

## Contoh Setup

### Kirim ke 3 Chat ID
```env
BOT_TELEGRAM_TOKEN=8526268130:AAHmvJfT_-mCVAWZdSzu1Un31ThXXwQjlZU
TELEGRAM_ID=['8198011061', '9876543210', '1112223334']
```

### Startup Log
```
Telegram notifier initialized with 3 chat(s)
```

## Notification Delivery

Semua notifikasi dikirim ke **semua** configured chat IDs:

```
┌──────────────────┐
│  Notification    │
│  Event           │
└────────┬─────────┘
         │
         ▼
    ┌────────────────────┐
    │ NotificationManager│
    └────────┬───────────┘
             │
    ┌────────┼────────┬──────────┐
    ▼        ▼        ▼          ▼
Chat ID1  Chat ID2  Chat ID3  Chat ID4
```

## Notification Types

Semua notification types dikirim ke **semua recipients**:

### 1. Agent Registered
```
✅ New Agent Registered
Host: 192.168.1.100:9090
Name: Production Server
```
→ Dikirim ke: Chat ID 1, 2, 3, ...

### 2. Agent Offline
```
🔴 Agent Offline
Host: 192.168.1.100:9090
Last Seen: 2024-01-15 10:30:00
```
→ Dikirim ke: Chat ID 1, 2, 3, ...

### 3. Temperature Alert
```
🌡️ High Temperature Alert - Production Server
Current: 85.5°C
Threshold: 80.0°C
```
→ Dikirim ke: Chat ID 1, 2, 3, ...

### 4. High Resource Usage
```
🔴 High CPU Usage
Current: 92.50%
Threshold: 80.00%
```
→ Dikirim ke: Chat ID 1, 2, 3, ...

## Use Cases

### Monitoring Team Setup
```env
# Kirim alerts ke multiple team members
TELEGRAM_ID=8198011061,9876543210,1112223334
```

### Multi-Channel Notifications
```env
# Kirim ke personal + team group
TELEGRAM_ID=8198011061,-1001234567890
```

### On-Call Rotation
```env
# Kirim ke on-call engineer + escalation channel
TELEGRAM_ID=8198011061,9876543210,-1005678901234
```

## Troubleshooting

### Some Recipients Not Receiving

1. **Verify Chat IDs:**
   ```bash
   curl "https://api.telegram.org/bot{TOKEN}/getUpdates"
   ```

2. **Check Server Logs:**
   ```
   Telegram API error for chat 8198011061: status code 400
   ```
   → Chat ID tidak valid atau bot tidak punya akses

3. **Test Individual ID:**
   ```bash
   curl -X POST "https://api.telegram.org/bot{TOKEN}/sendMessage" \
     -H "Content-Type: application/json" \
     -d '{"chat_id": "8198011061", "text": "Test"}'
   ```

### Bot Not Authorized

1. Pastikan bot sudah added ke grup/channel
2. Pastikan bot punya message permission
3. Bot tidak bisa message private chats yang tidak pernah chat ke bot

## Async Delivery

Notifikasi dikirim **asynchronously** tanpa blocking request:

```go
// Tidak memblok response
go h.notificationManager.NotifyAgentAdded(agent)

// Request langsung return success
return response.Success(c, http.StatusCreated, "Agent registered", agent)
```

## Rate Limiting

Telegram API memiliki rate limit ~30 msg/sec per bot.

Dengan multiple recipients:
- 1 event × 3 recipients = 3 messages
- System handle ini efficiently dengan goroutines

## Best Practices

1. **Use One Bot for All Recipients**
   ```env
   BOT_TELEGRAM_TOKEN=SAME_TOKEN  # Satu bot
   TELEGRAM_ID=id1,id2,id3        # Multiple chat
   ```

2. **Keep Chat IDs Updated**
   - Jika ada perubahan, update .env dan restart server
   - Tidak perlu build ulang

3. **Monitor Delivery**
   ```bash
   grep "Telegram" server.log
   ```

4. **Test Setup**
   ```bash
   # Register test agent
   curl -X POST http://localhost:8080/api/v1/agents/register \
     -H "Content-Type: application/json" \
     -d '{"name": "Test", "host": "localhost:9090"}'
   ```

## Example .env untuk Production

```env
# Production Setup dengan 3 Recipients
PORT=8080
ENV=production

BOT_TELEGRAM_TOKEN=YOUR_BOT_TOKEN
# Format: pilih salah satu
TELEGRAM_ID=['8198011061', '9876543210', '1112223334']
# atau
# TELEGRAM_ID=8198011061,9876543210,1112223334

DB_PATH=/data/monitoring.db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-key
```

## Migration Guide

### Dari Single Chat ke Multiple
1. Update TELEGRAM_ID format
2. Restart server
3. Test dengan register agent
4. Verify semua recipients dapat notifikasi

### Contoh:
```env
# Before
TELEGRAM_ID=8198011061

# After (choose format)
TELEGRAM_ID=8198011061,9876543210,1112223334
# atau
TELEGRAM_ID=['8198011061', '9876543210', '1112223334']
```
