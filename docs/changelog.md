# Changelog

All notable changes to Antigravity Gateway.

## [2.0.0] - 2024

### Breaking Changes

- **Package renamed**: `antigravity-claude-proxy` → `antigravity-gateway`
- **Config path changed**: `~/.config/antigravity-proxy` → `~/.config/antigravity-gateway`
- **Docker image changed**: `ghcr.io/johnneerdael/antigravity-claude-proxy` → `ghcr.io/johnneerdael/antigravity-gateway`

### Added

- **OpenAI-compatible endpoint**: New `/v1/chat/completions` endpoint for native OpenAI SDK support
- **CLI alias**: New `agw` command as shorthand for `antigravity-gateway`
- **Additional Gemini models**:
  - `gemini-3-pro-image`
  - `gemini-2.5-pro`
  - `gemini-2.5-flash`
  - `gemini-2.5-flash-thinking`
  - `gemini-2.5-flash-lite`
- **Streaming support**: Full SSE streaming for both OpenAI and Anthropic formats
- **Documentation site**: VitePress-powered docs with dark mode

### Changed

- Improved error messages for rate limiting
- Better handling of thinking/reasoning model outputs
- Enhanced multi-account load balancing

### Migration

See [Migration Guide](/guide/migration) for upgrading from v1.x.

## [1.x] - Previous Releases

See [GitHub Releases](https://github.com/johnneerdael/antigravity-gateway/releases) for earlier versions.
