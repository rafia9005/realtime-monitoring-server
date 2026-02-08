# Makefile for Monitoring System
# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod

# Binary names
BINARY_SERVER=monitoring-server
BINARY_AGENT=monitoring-agent

# Build directory
BUILD_DIR=./bin

# Source files
SERVER_MAIN=./main.go
AGENT_MAIN=./cmd/agent/main.go

# Build flags
LDFLAGS=-ldflags "-s -w"
CGO_ENABLED=1

# Version info
VERSION=$(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
BUILD_TIME=$(shell date -u '+%Y-%m-%d_%H:%M:%S')
GIT_COMMIT=$(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")

.PHONY: all build server agent clean test deps help install run dev build-all build-linux build-windows build-darwin

# Default target
all: clean deps build

# Help command
help:
	@echo "================================================"
	@echo "  Monitoring System - Makefile Commands"
	@echo "================================================"
	@echo ""
	@echo "DEVELOPMENT:"
	@echo "  make dev          - Run server in development mode"
	@echo "  make run          - Run server binary"
	@echo "  make test         - Run tests"
	@echo ""
	@echo "BUILDING:"
	@echo "  make build        - Build both server and agent"
	@echo "  make server       - Build server only"
	@echo "  make agent        - Build agent only"
	@echo "  make build-all    - Build for all platforms"
	@echo "  make quick        - Quick build without cleaning"
	@echo ""
	@echo "PLATFORM-SPECIFIC:"
	@echo "  make build-linux      - Build for Linux (amd64)"
	@echo "  make build-windows    - Build for Windows (amd64)"
	@echo "  make build-darwin     - Build for macOS (amd64)"
	@echo ""
	@echo "UTILITIES:"
	@echo "  make deps         - Download dependencies"
	@echo "  make clean        - Clean build files"
	@echo "  make install      - Install binaries to system"
	@echo "  make version      - Show version info"
	@echo "  make release      - Create release archives"
	@echo ""
	@echo "================================================"

# Build both server and agent
build: server agent
	@echo ""
	@echo "================================================"
	@echo "  ✓ Build complete!"
	@echo "================================================"
	@echo "  Server: $(BUILD_DIR)/$(BINARY_SERVER)"
	@echo "  Agent:  $(BUILD_DIR)/$(BINARY_AGENT)"
	@echo "================================================"

# Build server
server:
	@echo "[BUILD] Building server..."
	@mkdir -p $(BUILD_DIR)
	CGO_ENABLED=$(CGO_ENABLED) $(GOBUILD) $(LDFLAGS) \
		-o $(BUILD_DIR)/$(BINARY_SERVER) \
		-v $(SERVER_MAIN)
	@echo "[DONE] Server built: $(BUILD_DIR)/$(BINARY_SERVER)"

# Build agent
agent:
	@echo "[BUILD] Building agent..."
	@mkdir -p $(BUILD_DIR)
	CGO_ENABLED=$(CGO_ENABLED) $(GOBUILD) $(LDFLAGS) \
		-o $(BUILD_DIR)/$(BINARY_AGENT) \
		-v $(AGENT_MAIN)
	@echo "[DONE] Agent built: $(BUILD_DIR)/$(BINARY_AGENT)"

# Build for Linux
build-linux:
	@echo "[BUILD] Building for Linux (amd64)..."
	@mkdir -p $(BUILD_DIR)/linux
	GOOS=linux GOARCH=amd64 CGO_ENABLED=$(CGO_ENABLED) $(GOBUILD) $(LDFLAGS) \
		-o $(BUILD_DIR)/linux/$(BINARY_SERVER) \
		-v $(SERVER_MAIN)
	GOOS=linux GOARCH=amd64 CGO_ENABLED=$(CGO_ENABLED) $(GOBUILD) $(LDFLAGS) \
		-o $(BUILD_DIR)/linux/$(BINARY_AGENT) \
		-v $(AGENT_MAIN)
	@echo "[DONE] Linux builds complete"
	@echo "  Server: $(BUILD_DIR)/linux/$(BINARY_SERVER)"
	@echo "  Agent:  $(BUILD_DIR)/linux/$(BINARY_AGENT)"

# Build for Windows
build-windows:
	@echo "[BUILD] Building for Windows (amd64)..."
	@mkdir -p $(BUILD_DIR)/windows
	GOOS=windows GOARCH=amd64 CGO_ENABLED=$(CGO_ENABLED) $(GOBUILD) $(LDFLAGS) \
		-o $(BUILD_DIR)/windows/$(BINARY_SERVER).exe \
		-v $(SERVER_MAIN)
	GOOS=windows GOARCH=amd64 CGO_ENABLED=$(CGO_ENABLED) $(GOBUILD) $(LDFLAGS) \
		-o $(BUILD_DIR)/windows/$(BINARY_AGENT).exe \
		-v $(AGENT_MAIN)
	@echo "[DONE] Windows builds complete"
	@echo "  Server: $(BUILD_DIR)/windows/$(BINARY_SERVER).exe"
	@echo "  Agent:  $(BUILD_DIR)/windows/$(BINARY_AGENT).exe"

# Build for macOS
build-darwin:
	@echo "[BUILD] Building for macOS (amd64)..."
	@mkdir -p $(BUILD_DIR)/darwin
	GOOS=darwin GOARCH=amd64 CGO_ENABLED=$(CGO_ENABLED) $(GOBUILD) $(LDFLAGS) \
		-o $(BUILD_DIR)/darwin/$(BINARY_SERVER) \
		-v $(SERVER_MAIN)
	GOOS=darwin GOARCH=amd64 CGO_ENABLED=$(CGO_ENABLED) $(GOBUILD) $(LDFLAGS) \
		-o $(BUILD_DIR)/darwin/$(BINARY_AGENT) \
		-v $(AGENT_MAIN)
	@echo "[DONE] macOS builds complete"
	@echo "  Server: $(BUILD_DIR)/darwin/$(BINARY_SERVER)"
	@echo "  Agent:  $(BUILD_DIR)/darwin/$(BINARY_AGENT)"

# Build for all platforms
build-all: build-linux build-windows build-darwin
	@echo ""
	@echo "================================================"
	@echo "  ✓ All platform builds complete!"
	@echo "================================================"
	@ls -lh $(BUILD_DIR)/*/

# Clean build files
clean:
	@echo "[CLEAN] Cleaning build files..."
	@$(GOCLEAN)
	@rm -rf $(BUILD_DIR)
	@rm -f data/monitoring.db
	@echo "[DONE] Clean complete"

# Run tests
test:
	@echo "[TEST] Running tests..."
	@$(GOTEST) -v ./...

# Download dependencies
deps:
	@echo "[DEPS] Downloading dependencies..."
	@$(GOMOD) download
	@$(GOMOD) tidy
	@echo "[DONE] Dependencies ready"

# Install binaries to system
install: build
	@echo "[INSTALL] Installing binaries..."
	@sudo cp $(BUILD_DIR)/$(BINARY_SERVER) /usr/local/bin/
	@sudo cp $(BUILD_DIR)/$(BINARY_AGENT) /usr/local/bin/
	@sudo chmod +x /usr/local/bin/$(BINARY_SERVER)
	@sudo chmod +x /usr/local/bin/$(BINARY_AGENT)
	@echo "[DONE] Installed to /usr/local/bin/"

# Run server in development mode
dev:
	@echo "[DEV] Starting development server..."
	@$(GOCMD) run $(SERVER_MAIN)

# Run server
run: server
	@echo "[RUN] Starting server..."
	@./$(BUILD_DIR)/$(BINARY_SERVER)

# Show version info
version:
	@echo "Version:    $(VERSION)"
	@echo "Build time: $(BUILD_TIME)"
	@echo "Git commit: $(GIT_COMMIT)"

# Create release archive
release: clean build-all
	@echo "[RELEASE] Creating release archives..."
	@mkdir -p $(BUILD_DIR)/release
	@cd $(BUILD_DIR)/linux && tar -czf ../release/monitoring-linux-amd64-$(VERSION).tar.gz *
	@cd $(BUILD_DIR)/windows && zip -r ../release/monitoring-windows-amd64-$(VERSION).zip * > /dev/null 2>&1
	@cd $(BUILD_DIR)/darwin && tar -czf ../release/monitoring-darwin-amd64-$(VERSION).tar.gz *
	@echo "[DONE] Release archives created in $(BUILD_DIR)/release/"
	@ls -lh $(BUILD_DIR)/release/

# Quick build without cleaning
quick:
	@echo "[QUICK] Quick build..."
	@mkdir -p $(BUILD_DIR)
	@CGO_ENABLED=$(CGO_ENABLED) $(GOBUILD) -o $(BUILD_DIR)/$(BINARY_SERVER) $(SERVER_MAIN)
	@CGO_ENABLED=$(CGO_ENABLED) $(GOBUILD) -o $(BUILD_DIR)/$(BINARY_AGENT) $(AGENT_MAIN)
	@echo "[DONE] Quick build complete!"
	@echo "  Server: $(BUILD_DIR)/$(BINARY_SERVER)"
	@echo "  Agent:  $(BUILD_DIR)/$(BINARY_AGENT)"
