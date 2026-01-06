# Docker Compose Deployment

Production-ready deployment with Docker Compose.

## Basic Setup

Create `docker-compose.yml`:

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
      - PORT=8080
      - DEBUG=false
      - FALLBACK=true
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

## Directory Structure

```
your-project/
├── docker-compose.yml
├── data/
│   └── accounts.json      # Created after adding accounts
└── .env                   # Optional environment overrides
```

## Setup Steps

### 1. Add Accounts

```bash
# Interactive (with browser)
docker compose run --rm antigravity-gateway node bin/cli.js accounts add

# Headless (for servers)
docker compose run --rm antigravity-gateway node bin/cli.js accounts add --no-browser
```

### 2. Verify Accounts

```bash
docker compose run --rm antigravity-gateway node bin/cli.js accounts verify
```

### 3. Start the Gateway

```bash
docker compose up -d
```

### 4. Check Status

```bash
# Logs
docker compose logs -f

# Health
curl http://localhost:8080/health

# Account status
curl "http://localhost:8080/account-limits?format=table"
```

## Production Configuration

```yaml
services:
  antigravity-gateway:
    image: ghcr.io/johnneerdael/antigravity-gateway:latest
    container_name: antigravity-gateway
    ports:
      - "127.0.0.1:8080:8080"  # Only expose to localhost
    volumes:
      - ./data:/root/.config/antigravity-gateway:rw
    environment:
      - PORT=8080
      - DEBUG=false
      - FALLBACK=true
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 128M
```

## Using .env File

Create `.env`:

```bash
PORT=8080
DEBUG=false
FALLBACK=true
```

Update `docker-compose.yml`:

```yaml
services:
  antigravity-gateway:
    env_file:
      - .env
```

## With LiteLLM

```yaml
services:
  antigravity-gateway:
    image: ghcr.io/johnneerdael/antigravity-gateway:latest
    container_name: antigravity-gateway
    volumes:
      - ./data:/root/.config/antigravity-gateway
    environment:
      - PORT=8080
      - FALLBACK=true
    restart: unless-stopped

  litellm:
    image: ghcr.io/berriai/litellm:main-latest
    container_name: litellm
    ports:
      - "4000:4000"
    volumes:
      - ./litellm-config.yaml:/app/config.yaml
    command: ["--config", "/app/config.yaml", "--port", "4000"]
    environment:
      - LITELLM_MASTER_KEY=sk-your-master-key
    depends_on:
      - antigravity-gateway
    restart: unless-stopped
```

## Commands Reference

```bash
# Start
docker compose up -d

# Stop
docker compose down

# Restart
docker compose restart

# View logs
docker compose logs -f

# View specific logs
docker compose logs -f antigravity-gateway

# Rebuild and restart
docker compose up -d --build

# Update image
docker compose pull
docker compose up -d

# Shell access
docker compose exec antigravity-gateway sh
```

## Updating

```bash
# Pull latest image
docker compose pull

# Restart with new image
docker compose up -d
```

## Backup

```bash
# Backup accounts
cp ./data/accounts.json ./data/accounts.json.backup

# Restore
cp ./data/accounts.json.backup ./data/accounts.json
docker compose restart
```
