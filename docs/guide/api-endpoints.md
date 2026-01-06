# API Endpoints

The gateway exposes both OpenAI and Anthropic-compatible endpoints.

## Endpoints Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/chat/completions` | POST | OpenAI Chat Completions API |
| `/v1/messages` | POST | Anthropic Messages API |
| `/v1/models` | GET | List available models |
| `/health` | GET | Health check |
| `/account-limits` | GET | Account quotas (add `?format=table`) |
| `/refresh-token` | POST | Force token refresh |

## OpenAI Format

`POST /v1/chat/completions`

```bash
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer any-value" \
  -d '{
    "model": "gemini-3-flash",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "stream": true
  }'
```

### Request Body

```json
{
  "model": "gemini-3-flash",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  "stream": true,
  "max_tokens": 1024,
  "temperature": 0.7
}
```

### Response (non-streaming)

```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gemini-3-flash",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 8,
    "total_tokens": 18
  }
}
```

## Anthropic Format

`POST /v1/messages`

```bash
curl http://localhost:8080/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: any-value" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-5-thinking",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

### Request Body

```json
{
  "model": "claude-sonnet-4-5-thinking",
  "max_tokens": 1024,
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "stream": true,
  "system": "You are a helpful assistant."
}
```

### Response (non-streaming)

```json
{
  "id": "msg_xxx",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Hello! How can I help you today?"
    }
  ],
  "model": "claude-sonnet-4-5-thinking",
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 10,
    "output_tokens": 8
  }
}
```

## List Models

`GET /v1/models`

```bash
curl http://localhost:8080/v1/models
```

Response:
```json
{
  "object": "list",
  "data": [
    {"id": "claude-sonnet-4-5-thinking", "object": "model", "owned_by": "anthropic"},
    {"id": "gemini-3-flash", "object": "model", "owned_by": "google"},
    ...
  ]
}
```

## Health Check

`GET /health`

```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "status": "ok",
  "accounts": 3,
  "activeAccounts": 2
}
```

## Account Limits

`GET /account-limits`

```bash
# JSON format
curl http://localhost:8080/account-limits

# Table format (human readable)
curl "http://localhost:8080/account-limits?format=table"
```

## Authentication

The gateway accepts any value for API keys since authentication is handled via your Google accounts. However, you still need to provide a key to satisfy client requirements:

```bash
# OpenAI style
-H "Authorization: Bearer any-value"

# Anthropic style
-H "x-api-key: any-value"
```

::: tip
When using behind a reverse proxy with authentication, the API key becomes meaningful for access control. See [Caddy Reverse Proxy](/deployment/caddy) for details.
:::
