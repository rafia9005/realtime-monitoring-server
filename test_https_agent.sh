#!/bin/bash

# Test HTTPS agent registration
echo "Testing HTTPS agent registration..."

# Test 1: Register agent with HTTPS protocol separately
echo -e "\n=== Test 1: Register with separate protocol field ==="
curl -X POST http://localhost:8080/api/v1/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-agent-https",
    "host": "monit.museumpintar.my.id",
    "protocol": "https",
    "tags": ["production"],
    "description": "Test HTTPS agent"
  }' 2>/dev/null | jq .

# Test 2: Register agent with HTTPS in host field
echo -e "\n=== Test 2: Register with protocol in host field ==="
curl -X POST http://localhost:8080/api/v1/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-agent-https-2",
    "host": "https://monit.museumpintar.my.id",
    "tags": ["production"],
    "description": "Test HTTPS agent with protocol in host"
  }' 2>/dev/null | jq .

# Test 3: List agents
echo -e "\n=== Test 3: List registered agents ==="
curl -X GET http://localhost:8080/api/v1/agents \
  -H "Content-Type: application/json" 2>/dev/null | jq '.data[] | {id, name, host, protocol, status}'
