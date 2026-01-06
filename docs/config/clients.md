# AI Coding Tools

Configure popular AI coding tools to use Antigravity Gateway.

## Cursor

Settings → Models → Add Model:

```
Provider: OpenAI Compatible
Base URL: http://localhost:8080/v1
API Key: any-value
Model: gemini-3-flash
```

## Continue.dev

Edit `~/.continue/config.json`:

```json
{
  "models": [{
    "title": "Antigravity Gateway",
    "provider": "openai",
    "model": "gemini-3-flash",
    "apiBase": "http://localhost:8080/v1",
    "apiKey": "any-value"
  }]
}
```

## Cline (VS Code)

Settings → Cline → API Provider:

```
Provider: OpenAI Compatible
Base URL: http://localhost:8080/v1
API Key: any-value
Model ID: claude-sonnet-4-5-thinking
```

## Roo Code

Settings → Custom API:

```
API Endpoint: http://localhost:8080/v1/chat/completions
API Key: any-value
Model: gemini-3-flash
```

## Kilo Code

Settings → Provider → OpenAI Compatible:

```
Base URL: http://localhost:8080/v1
API Key: any-value
Model: claude-sonnet-4-5-thinking
```

## TRAE

Configure in settings:

```
Provider: OpenAI
Base URL: http://localhost:8080/v1
API Key: any-value
```

## OpenCode

Edit `~/.opencode/config.json`:

```json
{
  "provider": {
    "type": "openai",
    "baseUrl": "http://localhost:8080/v1",
    "apiKey": "any-value",
    "model": "gemini-3-flash"
  }
}
```

## Goose

Edit `~/.config/goose/config.yaml`:

```yaml
provider: openai
model: gemini-3-flash
api_base: http://localhost:8080/v1
api_key: any-value
```

## Aider

```bash
aider --openai-api-base http://localhost:8080/v1 \
      --openai-api-key any-value \
      --model openai/gemini-3-flash
```

Or set environment variables:

```bash
export OPENAI_API_BASE=http://localhost:8080/v1
export OPENAI_API_KEY=any-value
aider --model openai/gemini-3-flash
```

## Cody (Sourcegraph)

Settings → Cody → Enterprise:

```
Server Endpoint: http://localhost:8080
Access Token: any-value
```

## Claude Code CLI

Create `~/.claude/settings.json`:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://localhost:8080",
    "ANTHROPIC_API_KEY": "any-value"
  }
}
```

Then run: `claude`

## Gemini CLI

```bash
export GEMINI_API_BASE=http://localhost:8080/v1
export GEMINI_API_KEY=any-value
gemini chat
```

## Cherry Studio

Settings → API Configuration:

```
Provider: OpenAI Compatible
API URL: http://localhost:8080/v1
API Key: any-value
Model: gemini-3-flash
```

## Factory Droid

Configure provider:

```
Type: OpenAI
Base URL: http://localhost:8080/v1
API Key: any-value
```

## Crush

Settings → AI Provider:

```
Provider: OpenAI Compatible
Endpoint: http://localhost:8080/v1
Key: any-value
```

::: tip Remote Access
If running the gateway on a remote server, replace `localhost:8080` with your server address. Consider using a [reverse proxy with authentication](/deployment/caddy) for security.
:::
