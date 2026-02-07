FROM golang:1.23-alpine AS builder

# Install build dependencies for CGO (required for SQLite)
RUN apk add --no-cache gcc musl-dev sqlite-dev

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build with CGO enabled for SQLite
RUN CGO_ENABLED=1 GOOS=linux go build -o monitoring-server .

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates sqlite-libs

WORKDIR /app

# Copy binary and migrations
COPY --from=builder /app/monitoring-server .
COPY --from=builder /app/migrations ./migrations

# Create data directory
RUN mkdir -p /app/data

EXPOSE 8080

CMD ["./monitoring-server"]
