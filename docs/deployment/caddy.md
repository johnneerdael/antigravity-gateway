# Caddy Reverse Proxy

Deploy Antigravity Gateway behind Caddy with authentication and automatic HTTPS.

## Why Caddy?

- **Automatic HTTPS** with Let's Encrypt
- **Simple configuration** syntax
- **Built-in authentication** support
- **Proper SSE handling** for streaming

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────┐
│   LiteLLM /     │────▶│   Caddy         │────▶│  Antigravity        │
│   OpenAI Client │     │   (Auth + TLS)  │     │  Gateway            │
└─────────────────┘     └─────────────────┘     └─────────────────────┘
```

## Docker Compose Setup

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
    networks:
      - proxy-network

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
    depends_on:
      - antigravity-gateway
    restart: unless-stopped
    networks:
      - proxy-network

volumes:
  caddy_data:
  caddy_config:

networks:
  proxy-network:
    driver: bridge
```

## Caddyfile Options

### Option A: Bearer Token (Recommended)

Most compatible with OpenAI clients:

```caddyfile
api.example.com {
    @valid_token {
        header Authorization "Bearer sk-your-secret-api-key"
    }

    handle @valid_token {
        reverse_proxy antigravity-gateway:8080 {
            flush_interval -1
            health_uri /health
            health_interval 30s
        }
    }

    handle {
        respond "Unauthorized" 401
    }

    header {
        -Server
    }
}
```

### Option B: Basic Auth

```caddyfile
api.example.com {
    # Generate hash: docker run --rm caddy:2-alpine caddy hash-password --plaintext "your-password"
    basic_auth {
        api-user $2a$14$HASH_FROM_CADDY_HASH_PASSWORD
    }

    reverse_proxy antigravity-gateway:8080 {
        flush_interval -1
        health_uri /health
        health_interval 30s
    }

    header {
        -Server
        X-Content-Type-Options "nosniff"
    }
}
```

### Option C: Multiple API Keys

For multiple users/services:

```caddyfile
api.example.com {
    @user1 header Authorization "Bearer sk-user1-key"
    @user2 header Authorization "Bearer sk-user2-key"
    @service header Authorization "Bearer sk-service-key"

    handle @user1 {
        reverse_proxy antigravity-gateway:8080 {
            flush_interval -1
            header_up X-User-ID "user1"
        }
    }

    handle @user2 {
        reverse_proxy antigravity-gateway:8080 {
            flush_interval -1
            header_up X-User-ID "user2"
        }
    }

    handle @service {
        reverse_proxy antigravity-gateway:8080 {
            flush_interval -1
            header_up X-User-ID "service"
        }
    }

    handle {
        respond "Unauthorized" 401
    }
}
```

### Option D: Local Development

For testing without a domain:

```caddyfile
:8443 {
    basic_auth {
        api $2a$14$HASH_FROM_CADDY_HASH_PASSWORD
    }

    reverse_proxy antigravity-gateway:8080 {
        flush_interval -1
    }
}
```

## Generate Password Hash

```bash
docker run --rm caddy:2-alpine caddy hash-password --plaintext "your-secret-api-key"
# Output: $2a$14$Zkq...
```

## Start the Stack

```bash
# Add accounts first
docker compose run --rm antigravity-gateway node bin/cli.js accounts add --no-browser

# Start
docker compose up -d

# Verify
curl -H "Authorization: Bearer sk-your-secret-api-key" https://api.example.com/health
```

## Client Configuration

### With Bearer Token

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.example.com/v1",
    api_key="sk-your-secret-api-key"
)
```

### With Basic Auth

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api-user:your-password@api.example.com/v1",
    api_key="not-needed"
)
```

## Production Caddyfile

```caddyfile
api.example.com {
    @valid_token {
        header Authorization "Bearer {$API_SECRET_KEY}"
    }

    handle @valid_token {
        reverse_proxy antigravity-gateway:8080 {
            flush_interval -1
            
            transport http {
                dial_timeout 5s
                response_header_timeout 120s
            }
            
            health_uri /health
            health_interval 30s
            health_timeout 5s
        }
    }

    handle {
        respond "Unauthorized" 401
    }

    header {
        -Server
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
    }

    log {
        output file /var/log/caddy/api.log
        format json
    }
}
```

Run with:
```bash
API_SECRET_KEY="sk-your-secret" docker compose up -d
```

## Troubleshooting

### Streaming Not Working

Ensure `flush_interval -1` is set:

```caddyfile
reverse_proxy antigravity-gateway:8080 {
    flush_interval -1  # Required for SSE
}
```

### 502 Bad Gateway

```bash
# Check gateway is running
docker compose logs antigravity-gateway

# Test direct access
curl http://localhost:8080/health
```

### Timeout on Long Requests

Increase timeouts:

```caddyfile
reverse_proxy antigravity-gateway:8080 {
    transport http {
        response_header_timeout 300s
    }
}
```

## Security Best Practices

1. **Strong API keys**: `openssl rand -hex 32`
2. **Environment variables**: Don't commit secrets
3. **Internal network**: Only expose Caddy publicly
4. **Monitor logs**: Enable Caddy logging
5. **Rotate keys**: Update periodically
