# Production Setup

Best practices for production deployments of Antigravity Gateway.

## Recommended Architecture

```
                        ┌──────────────────┐
                        │   Load Balancer  │
                        │   (Caddy/nginx)  │
                        └────────┬─────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
           ┌────────▼────────┐       ┌────────▼────────┐
           │  Gateway Node 1 │       │  Gateway Node 2 │
           │  (Primary)      │       │  (Standby)      │
           └─────────────────┘       └─────────────────┘
```

## Security Checklist

- [ ] Run behind reverse proxy (Caddy/nginx)
- [ ] Enable authentication (Bearer token or Basic Auth)
- [ ] Use HTTPS for all external traffic
- [ ] Restrict gateway port to localhost (`127.0.0.1:8080:8080`)
- [ ] Secure `accounts.json` file permissions
- [ ] Never commit credentials to version control
- [ ] Set up log rotation
- [ ] Enable health monitoring

## Production Docker Compose

```yaml
services:
  antigravity-gateway:
    image: ghcr.io/johnneerdael/antigravity-gateway:latest
    container_name: antigravity-gateway
    ports:
      - "127.0.0.1:8080:8080"  # Only localhost
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
        max-file: "5"
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1'
        reservations:
          memory: 128M
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp

  caddy:
    image: caddy:2-alpine
    container_name: caddy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    environment:
      - API_SECRET_KEY=${API_SECRET_KEY}
    depends_on:
      antigravity-gateway:
        condition: service_healthy
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"

volumes:
  caddy_data:
  caddy_config:
```

## Environment File

Create `.env`:

```bash
# Gateway settings
PORT=8080
DEBUG=false
FALLBACK=true
NODE_ENV=production

# Caddy authentication
API_SECRET_KEY=sk-your-very-long-random-secret-key
```

Generate a secure key:
```bash
openssl rand -hex 32
```

## File Permissions

```bash
# Restrict accounts.json
chmod 600 ./data/accounts.json

# Restrict .env
chmod 600 .env
```

## Monitoring

### Health Endpoint

```bash
# Simple health check
curl http://localhost:8080/health

# Detailed status
curl "http://localhost:8080/account-limits?format=table"
```

### Prometheus Metrics (Optional)

Add a metrics sidecar:

```yaml
services:
  # ... existing services ...

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    ports:
      - "127.0.0.1:9100:9100"
    restart: unless-stopped
```

### Log Monitoring

```bash
# Follow logs
docker compose logs -f --tail=100

# Search for errors
docker compose logs | grep -i error

# Export logs
docker compose logs > gateway-$(date +%Y%m%d).log
```

## Backup Strategy

### Automated Backup Script

Create `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backup/antigravity"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup accounts
cp ./data/accounts.json "$BACKUP_DIR/accounts_$DATE.json"

# Keep only last 7 backups
ls -t "$BACKUP_DIR"/accounts_*.json | tail -n +8 | xargs -r rm

echo "Backup completed: $BACKUP_DIR/accounts_$DATE.json"
```

### Cron Job

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

## Scaling Considerations

### Account Recommendations

| Usage Level | Daily Requests | Recommended Accounts |
|-------------|----------------|---------------------|
| Light | < 100 | 1-2 |
| Medium | 100-500 | 3-5 |
| Heavy | 500-1000 | 5-10 |
| Enterprise | 1000+ | 10+ |

### Performance Tips

1. **Use Gemini models** for higher quotas
2. **Enable fallback mode** for automatic model switching
3. **Monitor account status** and add accounts before exhaustion
4. **Use sticky sessions** for prompt caching benefits

## Troubleshooting

### Gateway Won't Start

```bash
# Check logs
docker compose logs antigravity-gateway

# Common issues:
# - Missing accounts.json
# - Invalid accounts.json format
# - Port already in use
```

### All Accounts Rate Limited

```bash
# Check status
curl "http://localhost:8080/account-limits?format=table"

# Options:
# 1. Wait for cooldown
# 2. Add more accounts
# 3. Enable fallback to switch models
```

### Memory Issues

```bash
# Check memory usage
docker stats antigravity-gateway

# Increase limit if needed
deploy:
  resources:
    limits:
      memory: 1G
```

## Updating

```bash
# Pull latest image
docker compose pull

# Restart with new image
docker compose up -d

# Verify
curl http://localhost:8080/health
```

## Rollback

```bash
# List available versions
docker image ls ghcr.io/johnneerdael/antigravity-gateway

# Use specific version
image: ghcr.io/johnneerdael/antigravity-gateway:v2.0.0

# Restart
docker compose up -d
```
