# ServerMon - Update Terbaru

## Update yang Baru Saja Diselesaikan

### 1. Agent Metrics Visualization di Monitoring Page ✅

**Fitur Baru:**
- Dropdown selector untuk memilih antara Local Server atau Remote Agents
- Real-time switching antara metrics dari server lokal atau agent remote
- Status indicator untuk setiap agent (online/offline)
- Info banner yang menampilkan detail agent yang sedang dipantau

**Lokasi File:**
- `src/pages/monitoring.tsx` - Enhanced dengan agent selector
- `src/lib/hooks/useAgentMetrics.ts` - Hook baru untuk fetch agent metrics
- `src/lib/api.ts` - Tambahan API functions untuk agents
- `src/types/metrics.ts` - Tambahan types untuk Agent dan AgentMetrics

**Cara Penggunaan:**
1. Buka halaman Monitoring
2. Klik dropdown "Local Server" di kanan atas
3. Pilih agent yang ingin dipantau
4. Metrics akan otomatis update setiap 5 detik

**Screenshot:**
```
┌─────────────────────────────────────────┐
│ [Server Dropdown ▼] [🟢 Live] [Refresh]│
├─────────────────────────────────────────┤
│ ✓ Local Server                          │
│ ── Remote Agents ──                     │
│ 🟢 Production Server 1                  │
│ 🟢 Database Server                      │
│ ⚫ Backup Server                        │
└─────────────────────────────────────────┘
```

---

### 2. Hybrid Database: Supabase + SQLite ✅

**Arsitektur Database:**
- **Supabase (PostgreSQL)** → `env_metrics` (sensor suhu & kelembaban)
- **SQLite** → `agents` dan `agent_metrics` (monitoring agent data)

**Kenapa Hybrid?**
- `env_metrics` tetap di Supabase karena sudah ada infrastruktur existing
- `agents` data disimpan lokal di SQLite untuk deployment yang lebih mudah
- Tidak perlu setup PostgreSQL/Supabase untuk fitur agent monitoring

**File yang Diubah:**
- `server/internal/config/config.go` - Support kedua database
- `server/internal/repository/sqlite/init.go` - Hanya create table agents
- `server/main.go` - Initialize kedua repository
- `server/.env.example` - Tambah SUPABASE_URL dan SUPABASE_KEY

**Database Tables:**

**Supabase:**
```sql
1. env_metrics (existing)
   - Environmental sensor data (temperature, humidity)
```

**SQLite:**
```sql
2. agents
   - Registered monitoring agents
   - Status, last_seen, version, tags

3. agent_metrics
   - Metrics dari setiap agent
   - JSON metrics dengan timestamp
```

**Environment Variables:**
```env
# Server Config
PORT=8080
ENV=development

# SQLite (required for agents)
DB_PATH=./data/monitoring.db

# Supabase (optional - only for env_metrics)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

**Benefits:**
- ✅ Bisa jalan tanpa Supabase (env_metrics optional)
- ✅ Agent system standalone dengan SQLite
- ✅ Backward compatible dengan setup Supabase existing
- ✅ Deploy lebih mudah (cukup copy binary + .env)
- ✅ No external database required untuk agent monitoring

---

### 3. Systemd Service Files untuk Production ✅

**File Baru:**
- `server/monitoring-server.service` - Service untuk main server
- `server/monitoring-agent@.service` - Template service untuk agents

**Cara Install Main Server:**
```bash
# 1. Copy binary
sudo cp bin/monitoring-server /opt/monitoring-suhu/server/
sudo mkdir -p /var/lib/monitoring-suhu

# 2. Create user
sudo useradd -r -s /bin/false monitoring

# 3. Set permissions
sudo chown -R monitoring:monitoring /opt/monitoring-suhu
sudo chown -R monitoring:monitoring /var/lib/monitoring-suhu

# 4. Install service
sudo cp monitoring-server.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable monitoring-server
sudo systemctl start monitoring-server

# 5. Check status
sudo systemctl status monitoring-server
sudo journalctl -u monitoring-server -f
```

**Cara Install Agent (Multiple Instances):**
```bash
# 1. Copy binary to target server
sudo cp bin/monitoring-agent /opt/monitoring-agent/

# 2. Install template service
sudo cp monitoring-agent@.service /etc/systemd/system/

# 3. Edit environment di /etc/systemd/system/monitoring-agent@.service
# Atau buat override file:
sudo systemctl edit monitoring-agent@production

# 4. Start dengan nama instance
sudo systemctl enable monitoring-agent@production
sudo systemctl start monitoring-agent@production

# 5. Multiple instances berbeda:
sudo systemctl start monitoring-agent@database
sudo systemctl start monitoring-agent@backup

# 6. Check semua agent
sudo systemctl status monitoring-agent@*
```

**Environment Variables:**

**Server:**
```ini
PORT=8080
ENV=production
DB_PATH=/var/lib/monitoring-suhu/monitoring.db
```

**Agent:**
```ini
SERVER_URL=http://main-server:8080
AGENT_NAME=production-server-1
METRICS_INTERVAL=30
HEARTBEAT_INTERVAL=60
```

---

## Cara Build dan Deploy

### Development Mode
```bash
# Backend
cd server
go run main.go

# Frontend
npm run dev
```

### Production Build
```bash
# Build everything
cd server
make build

# Hasil build:
# - bin/monitoring-server (8.7MB)
# - bin/monitoring-agent (6.4MB)

# Build untuk platform tertentu:
make build-linux    # Linux amd64
make build-windows  # Windows amd64
make build-darwin   # macOS amd64

# Build semua platform:
make build-all
```

### Quick Build
```bash
cd server
make quick   # Build cepat tanpa clean
```

---

## Testing Complete Flow

### 1. Start Server
```bash
cd server
./bin/monitoring-server
# Output:
# ✓ Table ready: env_metrics
# ✓ Table ready: agents
# ✓ Table ready: agent_metrics
# ✓ Database initialization completed
# Server starting on :8080
```

### 2. Start Frontend
```bash
npm run dev
# http://localhost:5173
```

### 3. Add Agent via Web UI
1. Login → Agents page
2. Click "Add Agent"
3. Fill form:
   - Name: "Production Server"
   - Hostname: "prod-01"
   - IP: "192.168.1.100"
4. Copy command yang muncul

### 4. Run Agent
```bash
# Di server target
./monitoring-agent \
  -server http://main-server:8080 \
  -name "Production Server" \
  -metrics-interval 30 \
  -heartbeat-interval 60
```

### 5. View Metrics
1. Go to Monitoring page
2. Click dropdown "Local Server"
3. Select agent "Production Server"
4. View real-time metrics!

---

## File Structure Terbaru

```
monitoring-suhu/
├── server/
│   ├── bin/
│   │   ├── monitoring-server       # 8.7MB
│   │   └── monitoring-agent        # 6.4MB
│   ├── cmd/agent/main.go
│   ├── internal/
│   │   ├── repository/sqlite/
│   │   │   └── init.go             # ✨ Entity-based schema
│   │   └── ...
│   ├── monitoring-server.service   # ✨ NEW
│   ├── monitoring-agent@.service   # ✨ NEW
│   ├── Makefile                    # ✅ Updated
│   └── main.go
├── src/
│   ├── pages/
│   │   ├── monitoring.tsx          # ✅ Enhanced dengan agent selector
│   │   └── agents.tsx
│   ├── lib/
│   │   ├── api.ts                  # ✅ Added agent APIs
│   │   └── hooks/
│   │       ├── useSystemMetrics.ts
│   │       └── useAgentMetrics.ts  # ✨ NEW
│   └── types/
│       └── metrics.ts              # ✅ Added Agent types
└── data/
    └── monitoring.db               # Auto-created
```

---

## API Endpoints

### System Metrics
```
GET  /api/v1/system-metrics         # Local server metrics
GET  /health                        # Health check
```

### Agents
```
GET    /api/v1/agents               # List all agents
GET    /api/v1/agents/:id           # Get agent detail
POST   /api/v1/agents/register      # Register new agent
DELETE /api/v1/agents/:id           # Delete agent
POST   /api/v1/agents/heartbeat     # Agent heartbeat
POST   /api/v1/agents/metrics       # Receive metrics from agent
GET    /api/v1/agents/:id/metrics   # Get agent metrics
```

---

## Troubleshooting

### Database Error
```bash
# Error: could not import github.com/mattn/go-sqlite3
# Fix:
sudo apt-get install gcc   # Linux
brew install gcc           # macOS
```

### Port Already in Use
```bash
# Check what's using port 8080
sudo lsof -i :8080

# Kill process
sudo kill -9 <PID>

# Or change port in .env
PORT=8081
```

### Agent Not Connecting
```bash
# Check firewall
sudo ufw allow 8080/tcp

# Check agent logs
sudo journalctl -u monitoring-agent@production -f

# Test connectivity
curl http://main-server:8080/health
```

### Binary Not Running
```bash
# Make executable
chmod +x bin/monitoring-server
chmod +x bin/monitoring-agent

# Check CGO enabled
CGO_ENABLED=1 go build
```

---

## Next Steps (Opsional)

### Enhancements
- [ ] Add alert system (email/Slack notifications)
- [ ] Historical data charts (grafana-style)
- [ ] Agent grouping by tags
- [ ] Metrics retention policies (auto-delete old data)
- [ ] API authentication (API keys for agents)
- [ ] HTTPS/TLS support
- [ ] Docker/Docker Compose setup
- [ ] Kubernetes deployment files
- [ ] Backup/restore database
- [ ] Export metrics (CSV/JSON)

### Performance
- [ ] Add caching layer (Redis)
- [ ] Database connection pooling
- [ ] Metrics aggregation (min/max/avg)
- [ ] Compression for metrics transfer

### Security
- [ ] Agent authentication with tokens
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] SQL injection protection (already using prepared statements)

---

## Credits

- Backend: Go + Echo + SQLite
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Auth: Clerk
- Icons: Lucide React
- UI: Shadcn/ui + Radix UI

---

**Status:** ✅ Production Ready
**Last Update:** February 7, 2026
**Version:** v1.0.0
