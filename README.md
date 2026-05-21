# 📡 WATCHTOWER — Real-time Infrastructure Monitoring

Watchtower is an elite infrastructure intelligence and system health monitoring suite. It provides real-time telemetry, unified control segments, and predictive diagnostics for host servers and remote agents.

## 🚀 Key Features

- **Real-time Host Telemetry**: Directly monitors CPU, virtual memory, network activity, load average, temperature sensors, processes, and disk utilization on the system.
- **Cluster Node_01 Live Telemetry**: The homepage includes a live dashboard for `Cluster Node_01` which pulls real-time telemetry directly from the `/api/v1/system-metrics` endpoint to monitor:
  - **Neural Engine (CPU Usage %)**: Dynamic gauge showing processor load.
  - **Memory Segment (RAM Usage %)**: Visualizer of RAM utilization.
  - **Network Pulse (IO Traffic)**: Calculates system network activity percentage based on connection states.
  - **System Uptime & Live Status**: Automatically reports system uptime and synchronized connectivity status.
- **Multilingual Support (Indonesian & English)**: The entire application context supports runtime translation toggling. All pages, including the **Our Vision (About)** page and the Detective Blackboard team component, are fully translatable.
- **Remote Terminal Integrations**: Remote command-line console interface utilizing xterm.js.
- **Micro-controller (MCU) Logging**: Environmental tracking support (Temperature & Humidity) powered by IoT endpoints.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Libraries**: Recharts (for telemetry charts), Lucide React (icons), Clerk (authentication)

### Backend
- **Framework**: Go + Echo v5
- **Database**: SQLite (local status tracking) & Supabase (historical metrics persistence)
- **Monitoring Utilities**: `gopsutil` for native host system details

## 🌐 API Overview

- `GET /api/v1/system-metrics`: Fetch comprehensive host machine CPU, Memory, Disk, Network, and Thermal data.
- `GET /api/v1/agents`: Retrieve all registered monitoring agents.
- `POST /api/v1/agents/register`: Register a new host agent.
- `GET /api/v1/mcu-metrics`: Query IoT environmental sensor telemetry.
- `GET /health`: Server health check.

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- Go (1.20+)

### Setup Environment
Configure the `.env` in the root:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_API_BASE_URL=http://localhost:8080
```

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the client in development mode:
   ```bash
   npm run dev
   ```
