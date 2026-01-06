# What is Antigravity Gateway?

Antigravity Gateway is a universal AI gateway that allows you to access Claude and Gemini models through any OpenAI or Anthropic-compatible client. It acts as a bridge between your AI tools and Antigravity's Cloud Code service.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         YOUR AI TOOLS                                   │
│  Cursor • Cline • Continue • Aider • Claude Code • Gemini CLI • etc.   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │     Antigravity Gateway       │
                    │  OpenAI + Anthropic API       │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Antigravity Cloud Code      │
                    │   Claude • Gemini models      │
                    └───────────────────────────────┘
```

## Key Features

### Dual API Support
The gateway exposes both OpenAI-compatible and Anthropic-compatible endpoints, so you can use whichever format your tools prefer:

- **OpenAI format**: `POST /v1/chat/completions`
- **Anthropic format**: `POST /v1/messages`

### Multi-Account Load Balancing
Add multiple Google accounts to increase throughput and enable automatic failover when one account hits rate limits.

### Extended Thinking Support
Full support for Claude's thinking/reasoning models with proper streaming of thought content.

### Universal Compatibility
Works with virtually any AI coding tool or SDK that supports OpenAI or Anthropic APIs.

## Use Cases

- **AI-Assisted Coding**: Use Claude or Gemini in Cursor, Cline, Continue, Aider, or any IDE extension
- **CLI Tools**: Power Claude Code CLI, Gemini CLI, or custom scripts
- **Team Deployments**: Run a shared gateway for your team with load balancing
- **Self-Hosted AI**: Keep your AI interactions on your own infrastructure

## Next Steps

- [Getting Started](/guide/getting-started) - Install and configure in 5 minutes
- [Available Models](/guide/models) - See what models you can access
- [Client Configuration](/config/clients) - Set up your favorite AI tools
