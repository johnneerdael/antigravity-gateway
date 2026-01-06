# Available Models

The gateway provides access to both Claude and Gemini models through Antigravity Cloud Code.

## Model List

| Model ID | Type | Context | Max Output | Thinking |
|----------|------|---------|------------|----------|
| `claude-sonnet-4-5-thinking` | Claude | 200K | 16K | ✓ |
| `claude-opus-4-5-thinking` | Claude | 200K | 16K | ✓ |
| `claude-sonnet-4-5` | Claude | 200K | 8K | ✗ |
| `gemini-3-flash` | Gemini | 1M | 16K | ✓ |
| `gemini-3-pro-high` | Gemini | 1M | 16K | ✓ |
| `gemini-3-pro-low` | Gemini | 1M | 16K | ✓ |
| `gemini-3-pro-image` | Gemini | 1M | 16K | ✓ |
| `gemini-2.5-pro` | Gemini | 1M | 16K | ✓ |
| `gemini-2.5-flash` | Gemini | 1M | 16K | ✓ |
| `gemini-2.5-flash-thinking` | Gemini | 1M | 16K | ✓ |
| `gemini-2.5-flash-lite` | Gemini | 1M | 8K | ✗ |

::: tip
Model availability depends on your Antigravity account. Check available models with:
```bash
curl http://localhost:8080/v1/models
```
:::

## Model Recommendations

### For Speed
**`gemini-3-flash`** - Fastest responses, great for autocomplete and quick tasks.

### For Quality
**`claude-sonnet-4-5-thinking`** - Best reasoning capabilities with extended thinking.

### For Long Context
**`gemini-2.5-pro`** - 1M token context window for large codebases.

### For Budget
**`gemini-2.5-flash-lite`** - Lower resource usage, good for simple tasks.

## Thinking Models

Models with "thinking" support (marked with ✓) can show their reasoning process. This is useful for:

- Complex problem solving
- Step-by-step explanations
- Debugging logic errors

When using thinking models, the gateway properly handles the extended thinking format and streams thought content to compatible clients.

## Checking Your Available Models

```bash
# JSON format
curl http://localhost:8080/v1/models

# Pretty printed
curl -s http://localhost:8080/v1/models | jq '.data[].id'
```

Example output:
```json
{
  "data": [
    {"id": "claude-sonnet-4-5-thinking", "object": "model"},
    {"id": "gemini-3-flash", "object": "model"},
    ...
  ]
}
```
