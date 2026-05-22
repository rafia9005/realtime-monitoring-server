# Discord Integration - Quick Start Guide

## 5-Minute Setup

### 1. Create Discord Bot (2 minutes)
```bash
# Go to: https://discord.com/developers/applications
# 1. Click "New Application"
# 2. Name it (e.g., "Monitoring Bot")
# 3. Go to "Bot" section → "Add Bot"
# 4. Copy the token (looks like: OTk2Njk0NzQ2NDA0MTk5OTY0.G2o-zz.abc123...)
```

### 2. Add Bot to Server (1 minute)
```bash
# In Developer Portal:
# 1. OAuth2 → URL Generator
# 2. Select scopes: "bot"
# 3. Select permissions: "Send Messages", "Embed Links"
# 4. Copy and open the generated URL
# 5. Select your server and authorize
```

### 3. Get Channel ID (1 minute)
```bash
# In Discord:
# 1. Settings → Advanced → Developer Mode (ON)
# 2. Right-click your monitoring channel
# 3. "Copy Channel ID"
```

### 4. Configure (1 minute)
```bash
# In your server/.env file:
BOT_DISCORD_TOKEN=your-bot-token-here
DISCORD_CHANNEL_ID=your-channel-id-here
```

### 5. Run
```bash
cd server
go build -o bin/monitoring-server main.go
./bin/monitoring-server
```

## Environment Variables

```env
# Required for Discord
BOT_DISCORD_TOKEN=your-bot-token
DISCORD_CHANNEL_ID=your-channel-id

# Optional (Telegram still works)
BOT_TELEGRAM_TOKEN=your-telegram-token
TELEGRAM_ID=your-chat-id

# Temperature alerts
TEMP_ALERT_CPU_THRESHOLD=80.0
TEMP_ALERT_MCU_THRESHOLD=30.0
```

## What You'll Get

### In Discord Channel:
- 🌡️ Temperature alerts (yellow/red embeds)
- ✅ New agent notifications (cyan embeds)
- 🟢 Agent online alerts (green embeds)
- 🔴 Agent offline alerts (red embeds)
- ⚠️ Error notifications (red embeds)

### Color Coding:
- 🔵 Blue = Metrics summary
- 🟢 Green = Agent online
- 🟡 Yellow = Temperature warning
- 🔴 Red = Offline/Errors/Critical

## Verify It Works

```bash
# Watch logs
tail -f /var/log/syslog | grep monitoring

# Should see:
# "Discord notifier initialized and connected"

# Test by adding an agent:
# Should get Discord embed in ~30 seconds
```

## Troubleshooting

### Bot doesn't send messages
```bash
# 1. Check permissions in Discord server
# 2. Verify channel ID is correct
# 3. Check logs: journalctl -u monitoring-server -f
```

### "Warning: Discord notifier not configured"
```bash
# Missing BOT_DISCORD_TOKEN or DISCORD_CHANNEL_ID
# Add to .env and restart server
```

### Invalid token error
```bash
# 1. Regenerate in Developer Portal
# 2. Copy again carefully
# 3. Restart server
```

## Files Changed

```
server/
├── main.go                          (Updated - Discord init)
├── internal/
│   ├── config/config.go            (Updated - Discord config)
│   └── service/
│       ├── discord_notifier.go      (New - Discord service)
│       └── notification_manager.go  (Updated - Both notifiers)
├── .env.example                     (Updated - Discord vars)
└── go.mod                           (Updated - discordgo)

Root:
├── DISCORD_SETUP.md                 (Full setup guide)
└── QUICK_START_DISCORD.md          (This file)
```

## Common Commands

```bash
# Build
cd server && go build -o bin/monitoring-server main.go

# Run
./bin/monitoring-server

# Check status
systemctl status monitoring-server

# View logs
journalctl -u monitoring-server -f

# Restart
systemctl restart monitoring-server

# Rebuild and restart
cd server && go build -o bin/monitoring-server main.go && systemctl restart monitoring-server
```

## Security Reminders

⚠️ **IMPORTANT:**
- Never commit `.env` with real tokens
- Treat bot token like a password
- Rotate tokens periodically
- Limit bot permissions in Discord

## Need Help?

See **DISCORD_SETUP.md** for:
- Detailed step-by-step guide
- Troubleshooting section
- Permissions explanation
- All Discord embed examples

---

**Status**: ✅ Ready to use
**Build**: Successful (17 MB binary)
**Version**: discordgo v0.29.0
