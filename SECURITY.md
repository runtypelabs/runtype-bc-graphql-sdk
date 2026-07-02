# Security Policy

## Reporting a vulnerability

Please do not open public issues for security vulnerabilities. Instead, report them privately via [GitHub security advisories](https://github.com/runtypelabs/runtype-bc-graphql-sdk/security/advisories/new) or email security@runtype.com. We will acknowledge reports as quickly as we can and keep you informed of the fix's progress.

## Scope notes for integrators

- **Storefront API tokens are public by design** — they are scoped, storefront-facing tokens that end up in browser-delivered code. Never use server-to-server or admin API credentials with this SDK.
- **Customer credentials never flow through agent tools.** The WebMCP registration deliberately excludes login/logout so raw credentials cannot pass through an LLM tool call. Keep it that way in integrations.
- **Mutating tools should be human-confirmed.** Use the exported `READ_ONLY_TOOL_NAMES` (or the `readOnly` flag on tool definitions) to auto-approve only read-only tools in your UI.
- **Use SRI when loading from the CDN.** The deploy pipeline publishes a `sha384.txt` next to each bundle; include the `integrity` attribute on the script tag.
