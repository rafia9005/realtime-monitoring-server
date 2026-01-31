CREATE TABLE server_metrics (
    id BIGSERIAL PRIMARY KEY,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    cpu_usage_pct DECIMAL(5,2),
    cpu_load_1m DECIMAL(5,2),
    cpu_iowait_pct DECIMAL(5,2),
    cpu_temp_internal_c DECIMAL(4,1), 
    ram_used_gb DECIMAL(10,3),
    ram_total_gb DECIMAL(10,3),
    disk_usage_pct DECIMAL(5,2),
    net_in_mbps DECIMAL(10,2),
    net_out_mbps DECIMAL(10,2),
    env_temp_external_c DECIMAL(4,1), 
    env_humidity_pct DECIMAL(5,2),    
    env_heat_index_c DECIMAL(4,1),    

    uptime_seconds BIGINT,
    process_count INTEGER,
    status VARCHAR(20) DEFAULT 'healthy'
);

CREATE INDEX idx_metrics_recorded_at ON server_metrics (recorded_at DESC);
