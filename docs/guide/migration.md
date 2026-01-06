# Migration from v1.x

Upgrading from `antigravity-claude-proxy` to `antigravity-gateway` v2.0.

## What Changed

| Component | v1.x | v2.x |
|-----------|------|------|
| Package name | `antigravity-claude-proxy` | `antigravity-gateway` |
| CLI command | `antigravity-claude-proxy` | `antigravity-gateway` or `agw` |
| Config path | `~/.config/antigravity-proxy` | `~/.config/antigravity-gateway` |
| Docker image | `ghcr.io/johnneerdael/antigravity-claude-proxy` | `ghcr.io/johnneerdael/antigravity-gateway` |
| API endpoints | `/v1/messages` only | `/v1/messages` + `/v1/chat/completions` |

## Migration Steps

### 1. Copy Your Accounts

Your existing accounts still work - just copy them to the new location:

```bash
# Create new config directory
mkdir -p ~/.config/antigravity-gateway

# Copy accounts
cp ~/.config/antigravity-proxy/accounts.json ~/.config/antigravity-gateway/
```

### 2. Update Docker Image

Update your `docker-compose.yml`:

```yaml
services:
  antigravity-gateway:
    # OLD
    # image: ghcr.io/johnneerdael/antigravity-claude-proxy:latest
    
    # NEW
    image: ghcr.io/johnneerdael/antigravity-gateway:latest
    volumes:
      # OLD
      # - ./data:/root/.config/antigravity-proxy
      
      # NEW
      - ./data:/root/.config/antigravity-gateway
```

### 3. Update NPM Package

```bash
# Remove old package
npm uninstall -g antigravity-claude-proxy

# Install new package
npm install -g antigravity-gateway
```

### 4. Update Client Configurations

If you were using Anthropic-only clients, no changes needed - `/v1/messages` still works.

For OpenAI-compatible clients, you can now use the native format:

```bash
# Before (workaround with anthropic/ prefix)
model: anthropic/claude-sonnet-4-5-thinking

# After (native OpenAI format)
model: claude-sonnet-4-5-thinking
```

## New Features in v2.0

### OpenAI-Compatible Endpoint

The new `/v1/chat/completions` endpoint means better compatibility with:

- Cursor
- Continue
- Aider
- LiteLLM (with `openai/` prefix)
- Any OpenAI SDK

### New CLI Alias

Use the shorter `agw` command:

```bash
agw start
agw accounts add
agw accounts list
```

### More Models

v2.0 adds support for additional Gemini models:

- `gemini-3-pro-image`
- `gemini-2.5-pro`
- `gemini-2.5-flash`
- `gemini-2.5-flash-thinking`
- `gemini-2.5-flash-lite`

## Rollback

If you need to rollback:

```bash
# Docker
docker pull ghcr.io/johnneerdael/antigravity-claude-proxy:latest

# NPM
npm install -g antigravity-claude-proxy
```

Your v1 config in `~/.config/antigravity-proxy` is untouched.
