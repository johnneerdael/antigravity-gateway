# Multi-Account Setup

Add multiple Google accounts to increase throughput and enable automatic failover.

## Why Multiple Accounts?

- **Load balancing** across accounts when one hits rate limits
- **Higher throughput** for heavy usage
- **Redundancy** if an account needs re-authentication
- **Prompt cache optimization** via sticky session routing

## Adding Accounts

### Interactive (with browser)

```bash
# NPM
agw accounts add

# Docker
docker run -it --rm \
  -v $(pwd)/data:/root/.config/antigravity-gateway \
  ghcr.io/johnneerdael/antigravity-gateway:latest \
  node bin/cli.js accounts add
```

### Headless (for servers)

```bash
# NPM
agw accounts add --no-browser

# Docker
docker run -it --rm \
  -v $(pwd)/data:/root/.config/antigravity-gateway \
  ghcr.io/johnneerdael/antigravity-gateway:latest \
  node bin/cli.js accounts add --no-browser
```

The headless flow will display a URL to visit on any device. After signing in, paste the redirect URL back into the terminal.

## Managing Accounts

### List Accounts

```bash
agw accounts list

# Docker
docker run -it --rm \
  -v $(pwd)/data:/root/.config/antigravity-gateway \
  ghcr.io/johnneerdael/antigravity-gateway:latest \
  node bin/cli.js accounts list
```

### Verify Accounts

```bash
agw accounts verify

# Docker  
docker run -it --rm \
  -v $(pwd)/data:/root/.config/antigravity-gateway \
  ghcr.io/johnneerdael/antigravity-gateway:latest \
  node bin/cli.js accounts verify
```

### Check Account Status (Runtime)

```bash
# Table format
curl "http://localhost:8080/account-limits?format=table"

# JSON format
curl "http://localhost:8080/account-limits"
```

Example output:
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Account Limits Status                                  │
├─────┬──────────────────────┬────────────┬────────────────────┬──────────────────┤
│ #   │ Email                │ Status     │ Rate Limited Until │ Requests Today   │
├─────┼──────────────────────┼────────────┼────────────────────┼──────────────────┤
│ 1   │ user1@gmail.com      │ ✓ Active   │ -                  │ 45               │
│ 2   │ user2@gmail.com      │ ✓ Active   │ -                  │ 23               │
│ 3   │ user3@gmail.com      │ ⏳ Limited │ 14:30              │ 100              │
└─────┴──────────────────────┴────────────┴────────────────────┴──────────────────┘
```

## Account Selection Behavior

The gateway uses sticky sessions by default:

1. First request picks an available account
2. Subsequent requests prefer the same account (for prompt caching)
3. If rate limited > 2 minutes, switches to next available account
4. Rate-limited accounts automatically rejoin the pool after cooldown

## How Many Accounts?

| Usage Level | Requests/Day | Recommended Accounts |
|-------------|--------------|---------------------|
| Light | < 100 | 1-2 |
| Medium | 100-500 | 3-5 |
| Heavy | 500+ | 5-10+ |

## Re-authenticating Invalid Accounts

If an account becomes invalid (expired refresh token):

```bash
# Stop the gateway
docker compose down

# Re-authenticate
docker run -it --rm \
  -v $(pwd)/data:/root/.config/antigravity-gateway \
  ghcr.io/johnneerdael/antigravity-gateway:latest \
  node bin/cli.js accounts

# Choose "Re-authenticate" for the invalid account

# Restart
docker compose up -d
```

## Backup & Restore

```bash
# Backup
cp ./data/accounts.json ./data/accounts.json.backup

# Restore
cp ./data/accounts.json.backup ./data/accounts.json
docker compose restart
```

::: warning Security Note
The `accounts.json` file contains refresh tokens. Treat it like a password file:
- Never commit it to version control
- Restrict file permissions
- Back up securely
:::
