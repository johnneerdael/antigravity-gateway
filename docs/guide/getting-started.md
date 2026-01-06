# Getting Started

Get Antigravity Gateway running in under 5 minutes.

## Prerequisites

- A Google account with Antigravity access
- Docker (recommended) or Node.js 18+

## Quick Start with Docker

### 1. Pull and Run

```bash
docker pull ghcr.io/johnneerdael/antigravity-gateway:latest

docker run -it -p 8080:8080 \
  -v $(pwd)/data:/root/.config/antigravity-gateway \
  ghcr.io/johnneerdael/antigravity-gateway:latest
```

### 2. Add Your Google Account

On first run, you'll be prompted to authenticate:

```bash
# Interactive (opens browser)
docker run -it -p 8080:8080 \
  -v $(pwd)/data:/root/.config/antigravity-gateway \
  ghcr.io/johnneerdael/antigravity-gateway:latest \
  node bin/cli.js accounts add

# Headless servers (manual code entry)
docker run -it \
  -v $(pwd)/data:/root/.config/antigravity-gateway \
  ghcr.io/johnneerdael/antigravity-gateway:latest \
  node bin/cli.js accounts add --no-browser
```

### 3. Start the Gateway

```bash
docker run -d -p 8080:8080 \
  -v $(pwd)/data:/root/.config/antigravity-gateway \
  --restart unless-stopped \
  --name antigravity-gateway \
  ghcr.io/johnneerdael/antigravity-gateway:latest
```

### 4. Verify It Works

```bash
# Check health
curl http://localhost:8080/health

# List available models
curl http://localhost:8080/v1/models

# Test a completion
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-3-flash",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Quick Start with NPM

```bash
# Install globally
npm install -g antigravity-gateway

# Add account
agw accounts add

# Start the gateway
agw start
```

## Quick Start with Docker Compose

Create a `docker-compose.yml`:

```yaml
services:
  antigravity-gateway:
    image: ghcr.io/johnneerdael/antigravity-gateway:latest
    container_name: antigravity-gateway
    ports:
      - "8080:8080"
    volumes:
      - ./data:/root/.config/antigravity-gateway
    environment:
      - FALLBACK=true
    restart: unless-stopped
```

Then run:

```bash
# Add accounts first
docker compose run --rm antigravity-gateway node bin/cli.js accounts add --no-browser

# Start the gateway
docker compose up -d
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |
| `DEBUG` | `false` | Enable debug logging |
| `FALLBACK` | `false` | Enable model fallback on quota exhaustion |

## What's Next?

- [Configure your AI tools](/config/clients) to use the gateway
- [Add more accounts](/guide/multi-account) for higher throughput
- [Deploy to production](/deployment/docker-compose) with Docker Compose
