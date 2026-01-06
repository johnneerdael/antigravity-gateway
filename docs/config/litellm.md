# LiteLLM Integration

Use Antigravity Gateway as a backend for LiteLLM proxy.

## Basic Configuration

Create `litellm-config.yaml`:

```yaml
model_list:
  # Claude models
  - model_name: claude-sonnet-4-5-thinking
    model_info:
      mode: chat
      supports_vision: true
      supports_function_calling: true
      supports_parallel_function_calling: true
      max_input_tokens: 200000
      max_output_tokens: 16000
    litellm_params:
      model: openai/claude-sonnet-4-5-thinking
      api_base: http://antigravity-gateway:8080/v1
      api_key: "not-needed"
      stream: true

  - model_name: claude-opus-4-5-thinking
    model_info:
      mode: chat
      supports_vision: true
      supports_function_calling: true
      max_input_tokens: 200000
      max_output_tokens: 16000
    litellm_params:
      model: openai/claude-opus-4-5-thinking
      api_base: http://antigravity-gateway:8080/v1
      api_key: "not-needed"
      stream: true

  - model_name: claude-sonnet-4-5
    model_info:
      mode: chat
      supports_vision: true
      supports_function_calling: true
      max_input_tokens: 200000
      max_output_tokens: 8000
    litellm_params:
      model: openai/claude-sonnet-4-5
      api_base: http://antigravity-gateway:8080/v1
      api_key: "not-needed"
      stream: true

  # Gemini 3 models
  - model_name: gemini-3-flash
    model_info:
      mode: chat
      supports_vision: true
      supports_function_calling: true
      supports_parallel_function_calling: true
      max_input_tokens: 1048576
      max_output_tokens: 16384
    litellm_params:
      model: openai/gemini-3-flash
      api_base: http://antigravity-gateway:8080/v1
      api_key: "not-needed"
      stream: true

  - model_name: gemini-3-pro-high
    model_info:
      mode: chat
      supports_vision: true
      supports_function_calling: true
      max_input_tokens: 1048576
      max_output_tokens: 16384
    litellm_params:
      model: openai/gemini-3-pro-high
      api_base: http://antigravity-gateway:8080/v1
      api_key: "not-needed"
      stream: true

  - model_name: gemini-3-pro-low
    model_info:
      mode: chat
      supports_vision: true
      supports_function_calling: true
      max_input_tokens: 1048576
      max_output_tokens: 16384
    litellm_params:
      model: openai/gemini-3-pro-low
      api_base: http://antigravity-gateway:8080/v1
      api_key: "not-needed"
      stream: true

  # Gemini 2.5 models
  - model_name: gemini-2.5-pro
    model_info:
      mode: chat
      supports_vision: true
      supports_function_calling: true
      max_input_tokens: 1048576
      max_output_tokens: 16384
    litellm_params:
      model: openai/gemini-2.5-pro
      api_base: http://antigravity-gateway:8080/v1
      api_key: "not-needed"
      stream: true

  - model_name: gemini-2.5-flash
    model_info:
      mode: chat
      supports_vision: true
      supports_function_calling: true
      max_input_tokens: 1048576
      max_output_tokens: 16384
    litellm_params:
      model: openai/gemini-2.5-flash
      api_base: http://antigravity-gateway:8080/v1
      api_key: "not-needed"
      stream: true
```

## Docker Compose with LiteLLM

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

## Using LiteLLM

Once running, use LiteLLM as your AI endpoint:

```bash
# List models
curl http://localhost:4000/v1/models \
  -H "Authorization: Bearer sk-your-master-key"

# Chat completion
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-your-master-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-3-flash",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## With Caddy Authentication

If using Caddy with Bearer token authentication:

```yaml
model_list:
  - model_name: claude-sonnet-4-5-thinking
    litellm_params:
      model: openai/claude-sonnet-4-5-thinking
      api_base: https://api.example.com/v1
      api_key: "sk-your-caddy-api-key"  # Becomes Bearer token
```

## With Basic Auth

If using Caddy with basic authentication:

```yaml
model_list:
  - model_name: claude-sonnet-4-5-thinking
    litellm_params:
      model: openai/claude-sonnet-4-5-thinking
      api_base: https://username:password@api.example.com/v1
      api_key: "not-needed"
```

## Environment Variables

Use environment variables for sensitive values:

```yaml
model_list:
  - model_name: claude-sonnet-4-5-thinking
    litellm_params:
      model: openai/claude-sonnet-4-5-thinking
      api_base: os.environ/ANTIGRAVITY_API_BASE
      api_key: os.environ/ANTIGRAVITY_API_KEY
```

```bash
export ANTIGRAVITY_API_BASE="http://antigravity-gateway:8080/v1"
export ANTIGRAVITY_API_KEY="not-needed"
```

::: tip Model Prefix
Note the `openai/` prefix in model names (e.g., `openai/gemini-3-flash`). This tells LiteLLM to use the OpenAI-compatible endpoint format.
:::
