# Multi-Account Docker Compose Setup Guide

This guide covers running Antigravity Claude Proxy with multiple Google accounts in a production-ready Docker Compose environment.

## Image Availability

Pre-built Docker images are automatically published to GitHub Container Registry on every push to main and on version tags:

```bash
# Latest from main branch
docker pull ghcr.io/badri-s2001/antigravity-claude-proxy:latest

# Specific version
docker pull ghcr.io/badri-s2001/antigravity-claude-proxy:1.0.2

# Specific commit
docker pull ghcr.io/badri-s2001/antigravity-claude-proxy:abc1234
```

Images are built for both `linux/amd64` and `linux/arm64` architectures.

## Overview

Running multiple Google accounts provides:
- **Load balancing** across accounts when one hits rate limits
- **Higher throughput** for heavy usage
- **Redundancy** if an account needs re-authentication
- **Prompt cache optimization** via sticky session routing

## Prerequisites

- Docker and Docker Compose installed
- One or more Google accounts with Antigravity access
- A machine where you can run the initial OAuth setup

## Directory Structure

```
antigravity-proxy/
├── docker-compose.yml
├── data/
│   └── accounts.json      # Created after adding accounts
└── .env                   # Optional environment overrides
```

## Quick Start

### Step 1: Create the Docker Compose File

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  antigravity-proxy:
    image: ghcr.io/badri-s2001/antigravity-claude-proxy:latest
    # Or build locally:
    # build: .
    container_name: antigravity-proxy
    ports:
      - "8080:8080"
    volumes:
      - ./data:/root/.config/antigravity-proxy
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

### Step 2: Add Google Accounts

Accounts must be added **before** the container runs in production mode. You have two options:

#### Option A: Add Accounts on Your Local Machine, Then Copy

The easiest approach for headless servers.

```bash
# On your local machine (with browser)
npm install -g antigravity-claude-proxy

# Add first account
antigravity-claude-proxy accounts add
# Browser opens → sign in → authorize

# Add more accounts
antigravity-claude-proxy accounts add
antigravity-claude-proxy accounts add
# Repeat for each Google account

# Verify all accounts work
antigravity-claude-proxy accounts verify

# Copy accounts file to your server
scp ~/.config/antigravity-proxy/accounts.json user@server:~/antigravity-proxy/data/
```

#### Option B: Add Accounts via Headless OAuth

If you can't use a local machine, run the OAuth flow in headless mode:

```bash
# Start a temporary container for account setup
docker run -it --rm \
  -v $(pwd)/data:/root/.config/antigravity-proxy \
  ghcr.io/badri-s2001/antigravity-claude-proxy:latest \
  node bin/cli.js accounts add --no-browser

# The container will display a URL like:
# Please visit this URL to authenticate:
# https://accounts.google.com/o/oauth2/v2/auth?client_id=...
#
# After signing in, paste the redirect URL or authorization code here:

# Open the URL on any device (phone, another computer)
# Sign in with your Google account
# Copy the redirect URL from your browser's address bar
# Paste it into the terminal

# Repeat for each account:
docker run -it --rm \
  -v $(pwd)/data:/root/.config/antigravity-proxy \
  ghcr.io/badri-s2001/antigravity-claude-proxy:latest \
  node bin/cli.js accounts add --no-browser
```

### Step 3: Verify Accounts

```bash
# List configured accounts
docker run -it --rm \
  -v $(pwd)/data:/root/.config/antigravity-proxy \
  ghcr.io/badri-s2001/antigravity-claude-proxy:latest \
  node bin/cli.js accounts list

# Verify all accounts can authenticate
docker run -it --rm \
  -v $(pwd)/data:/root/.config/antigravity-proxy \
  ghcr.io/badri-s2001/antigravity-claude-proxy:latest \
  node bin/cli.js accounts verify
```

### Step 4: Start the Proxy

```bash
# Start in background
docker-compose up -d

# Check logs
docker-compose logs -f

# Verify health
curl http://localhost:8080/health

# Check account status
curl "http://localhost:8080/account-limits?format=table"
```

## Production Configuration

### Enhanced Docker Compose

For production deployments, use this enhanced configuration:

```yaml
version: '3.8'

services:
  antigravity-proxy:
    image: ghcr.io/badri-s2001/antigravity-claude-proxy:latest
    container_name: antigravity-proxy
    ports:
      - "127.0.0.1:8080:8080"  # Only expose to localhost
    volumes:
      - ./data:/root/.config/antigravity-proxy:rw
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

### Using .env File

Create a `.env` file for configuration:

```bash
# .env
PORT=8080
DEBUG=false
FALLBACK=true
```

Update `docker-compose.yml` to use it:

```yaml
services:
  antigravity-proxy:
    # ...
    env_file:
      - .env
```

### Reverse Proxy with Traefik

If using Traefik for SSL termination:

```yaml
version: '3.8'

services:
  antigravity-proxy:
    image: ghcr.io/badri-s2001/antigravity-claude-proxy:latest
    container_name: antigravity-proxy
    volumes:
      - ./data:/root/.config/antigravity-proxy
    environment:
      - PORT=8080
      - DEBUG=false
      - FALLBACK=true
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.antigravity.rule=Host(`proxy.yourdomain.com`)"
      - "traefik.http.routers.antigravity.entrypoints=websecure"
      - "traefik.http.routers.antigravity.tls.certresolver=letsencrypt"
      - "traefik.http.services.antigravity.loadbalancer.server.port=8080"
    networks:
      - traefik-network

networks:
  traefik-network:
    external: true
```

### Reverse Proxy with nginx

If using nginx:

```yaml
version: '3.8'

services:
  antigravity-proxy:
    image: ghcr.io/badri-s2001/antigravity-claude-proxy:latest
    container_name: antigravity-proxy
    volumes:
      - ./data:/root/.config/antigravity-proxy
    environment:
      - PORT=8080
    restart: unless-stopped
    networks:
      - proxy-network

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - antigravity-proxy
    networks:
      - proxy-network

networks:
  proxy-network:
    driver: bridge
```

Example `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream antigravity {
        server antigravity-proxy:8080;
    }

    server {
        listen 443 ssl;
        server_name proxy.yourdomain.com;

        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;

        location / {
            proxy_pass http://antigravity;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # SSE support for streaming
            proxy_set_header Connection '';
            proxy_buffering off;
            proxy_cache off;
            chunked_transfer_encoding off;
        }
    }
}
```

## Account Management

### Adding More Accounts to Running Container

```bash
# Stop the container
docker-compose down

# Add new account
docker run -it --rm \
  -v $(pwd)/data:/root/.config/antigravity-proxy \
  ghcr.io/badri-s2001/antigravity-claude-proxy:latest \
  node bin/cli.js accounts add --no-browser

# Restart
docker-compose up -d
```

### Re-authenticating Invalid Accounts

If an account becomes invalid (expired refresh token):

```bash
# Check which accounts need attention
curl "http://localhost:8080/account-limits?format=table"

# Stop the container
docker-compose down

# Interactive account management
docker run -it --rm \
  -v $(pwd)/data:/root/.config/antigravity-proxy \
  ghcr.io/badri-s2001/antigravity-claude-proxy:latest \
  node bin/cli.js accounts

# Choose "Re-authenticate" for the invalid account
# Restart
docker-compose up -d
```

### Backup Accounts

```bash
# Backup
cp ./data/accounts.json ./data/accounts.json.backup

# Restore
cp ./data/accounts.json.backup ./data/accounts.json
docker-compose restart
```

## Monitoring

### Health Check Endpoint

```bash
# Basic health
curl http://localhost:8080/health

# Detailed account status
curl "http://localhost:8080/account-limits?format=table"

# JSON format for monitoring systems
curl "http://localhost:8080/account-limits"
```

### Example Account Status Output

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Account Limits Status                                  │
├─────┬──────────────────────┬────────────┬────────────────────┬──────────────────┤
│ #   │ Email                │ Status     │ Rate Limited Until │ Requests Today   │
├─────┼──────────────────────┼────────────┼────────────────────┼──────────────────┤
│ 1   │ user1@gmail.com      │ ✓ Active   │ -                  │ 45               │
│ 2   │ user2@gmail.com      │ ✓ Active   │ -                  │ 23               │
│ 3   │ user3@gmail.com      │ ⏳ Limited │ 14:30              │ 100              │
│ 4   │ user4@gmail.com      │ ✗ Invalid  │ -                  │ 0                │
└─────┴──────────────────────┴────────────┴────────────────────┴──────────────────┘
```

### Docker Logs

```bash
# Follow logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# With timestamps
docker-compose logs -t
```

### Prometheus Metrics (Optional)

If you want to add Prometheus monitoring, you can add a metrics endpoint via a sidecar:

```yaml
version: '3.8'

services:
  antigravity-proxy:
    # ... your config
    
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs antigravity-proxy

# Common issues:
# - Missing accounts.json: Add accounts first
# - Permission denied: Check volume permissions
# - Port in use: Change port mapping
```

### All Accounts Rate Limited

```bash
# Check status
curl "http://localhost:8080/account-limits?format=table"

# Wait for cooldown or add more accounts
# Accounts automatically become available after rate limit expires
```

### Account Shows Invalid

```bash
# Re-authenticate the account
docker-compose down

docker run -it --rm \
  -v $(pwd)/data:/root/.config/antigravity-proxy \
  ghcr.io/badri-s2001/antigravity-claude-proxy:latest \
  node bin/cli.js accounts

# Select the invalid account and re-authenticate
docker-compose up -d
```

### Token Refresh Failures

```bash
# Force token refresh
curl -X POST http://localhost:8080/refresh-token

# If still failing, re-authenticate the account
```

### Connection Issues from Claude Code

Verify the proxy is accessible:

```bash
# From the same machine
curl http://localhost:8080/health

# From another machine (if exposed)
curl http://your-server:8080/health
```

Ensure Claude Code is configured correctly:

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "test",
    "ANTHROPIC_BASE_URL": "http://your-server:8080"
  }
}
```

## Scaling Considerations

### How Many Accounts?

- **Light usage (< 100 requests/day)**: 1-2 accounts
- **Medium usage (100-500 requests/day)**: 3-5 accounts
- **Heavy usage (500+ requests/day)**: 5-10+ accounts

### Account Selection Behavior

The proxy uses sticky sessions by default:
1. First request picks an available account
2. Subsequent requests prefer the same account (for prompt caching)
3. If rate limited > 2 minutes, switches to next available account
4. Rate-limited accounts automatically rejoin the pool after cooldown

### Performance Tips

- **Use thinking models sparingly**: They consume more quota
- **Leverage prompt caching**: Keep conversations on the same account
- **Monitor account status**: Add accounts before all are rate-limited
- **Use Gemini models**: Often have higher quotas than Claude models

## Security Notes

- **Never commit `accounts.json`**: Contains refresh tokens
- **Restrict port exposure**: Use `127.0.0.1:8080:8080` and a reverse proxy
- **Use HTTPS**: Always use SSL in production (via reverse proxy)
- **Backup accounts.json securely**: Treat it like a password file

## Quick Reference

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# View logs
docker-compose logs -f

# Check health
curl http://localhost:8080/health

# Check accounts
curl "http://localhost:8080/account-limits?format=table"

# Add account (interactive)
docker run -it --rm \
  -v $(pwd)/data:/root/.config/antigravity-proxy \
  ghcr.io/badri-s2001/antigravity-claude-proxy:latest \
  node bin/cli.js accounts add --no-browser

# List accounts
docker run -it --rm \
  -v $(pwd)/data:/root/.config/antigravity-proxy \
  ghcr.io/badri-s2001/antigravity-claude-proxy:latest \
  node bin/cli.js accounts list
```
