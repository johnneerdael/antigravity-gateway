# Docker Deployment

Run Antigravity Gateway in a Docker container.

## Quick Start

```bash
# Pull the image
docker pull ghcr.io/johnneerdael/antigravity-gateway:latest

# Run with interactive account setup
docker run -it -p 8080:8080 \
  -v $(pwd)/data:/root/.config/antigravity-gateway \
  ghcr.io/johnneerdael/antigravity-gateway:latest
```

## Image Tags

| Tag | Description |
|-----|-------------|
| `latest` | Latest stable release from main branch |
| `main` | Latest build from main branch |
| `v2.0.0` | Specific version |
| `abc1234` | Specific commit SHA |

Images are built for both `linux/amd64` and `linux/arm64` architectures.

## Adding Accounts

### Interactive (with browser)

```bash
docker run -it --rm \
  -v $(pwd)/data:/root/.config/antigravity-gateway \
  ghcr.io/johnneerdael/antigravity-gateway:latest \
  node bin/cli.js accounts add
```

### Headless (for servers)

```bash
docker run -it --rm \
  -v $(pwd)/data:/root/.config/antigravity-gateway \
  ghcr.io/johnneerdael/antigravity-gateway:latest \
  node bin/cli.js accounts add --no-browser
```

## Running the Gateway

### Foreground

```bash
docker run -p 8080:8080 \
  -v $(pwd)/data:/root/.config/antigravity-gateway \
  ghcr.io/johnneerdael/antigravity-gateway:latest
```

### Background (daemon)

```bash
docker run -d -p 8080:8080 \
  -v $(pwd)/data:/root/.config/antigravity-gateway \
  --restart unless-stopped \
  --name antigravity-gateway \
  ghcr.io/johnneerdael/antigravity-gateway:latest
```

### With Environment Variables

```bash
docker run -d -p 8080:8080 \
  -v $(pwd)/data:/root/.config/antigravity-gateway \
  -e DEBUG=true \
  -e FALLBACK=true \
  --restart unless-stopped \
  --name antigravity-gateway \
  ghcr.io/johnneerdael/antigravity-gateway:latest
```

## Managing the Container

```bash
# View logs
docker logs -f antigravity-gateway

# Stop
docker stop antigravity-gateway

# Start
docker start antigravity-gateway

# Restart
docker restart antigravity-gateway

# Remove
docker rm -f antigravity-gateway
```

## Health Check

```bash
# Check if running
docker ps | grep antigravity-gateway

# Check health endpoint
curl http://localhost:8080/health

# Check account status
curl "http://localhost:8080/account-limits?format=table"
```

## Volume Mounts

| Container Path | Purpose |
|----------------|---------|
| `/root/.config/antigravity-gateway` | Account credentials and config |

::: warning
The `accounts.json` file in this volume contains sensitive credentials. Ensure proper permissions and backup securely.
:::

## Resource Limits

For production, consider setting resource limits:

```bash
docker run -d -p 8080:8080 \
  -v $(pwd)/data:/root/.config/antigravity-gateway \
  --memory=512m \
  --cpus=1 \
  --restart unless-stopped \
  --name antigravity-gateway \
  ghcr.io/johnneerdael/antigravity-gateway:latest
```

## Building from Source

```bash
# Clone the repository
git clone https://github.com/johnneerdael/antigravity-gateway.git
cd antigravity-gateway

# Build the image
docker build -t antigravity-gateway:local .

# Run
docker run -p 8080:8080 \
  -v $(pwd)/data:/root/.config/antigravity-gateway \
  antigravity-gateway:local
```
