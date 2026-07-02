# Contributing

Thanks for your interest in improving the BigCommerce Storefront Agent SDK!

## Getting set up

```bash
git clone https://github.com/runtypelabs/runtype-bc-graphql-sdk.git
cd runtype-bc-graphql-sdk
npm install
npm run build
```

Requires Node.js >= 18 (the SDK relies on the native Fetch API).

## Development workflow

1. Create a branch from `main`.
2. Make your changes in `src/`. Keep the SDK zero-runtime-dependency — the only allowed dependency is the WebMCP polyfill used by the browser bundle.
3. Verify locally before opening a PR:

   ```bash
   npm run typecheck
   npm run lint
   npm run build
   npm test
   ```

4. Open a pull request against `main` with a clear description of what changed and why. CI runs typecheck, lint, build, unit tests, and Playwright e2e tests on every PR.

## Project layout

```
src/
├── index.ts      # Main entry point (SDK, types, queries, mutations, WebMCP)
├── sdk.ts        # BigCommerceAgentSDK class
├── types.ts      # TypeScript type definitions
├── queries.ts    # GraphQL query documents
├── mutations.ts  # GraphQL mutation documents
├── tools.ts      # Agent tool definitions + implementations
├── webmcp.ts     # WebMCP tool registration
└── browser.ts    # Browser IIFE wrapper (Script Manager injection)
```

## Guidelines

- **Structured errors over throws in tools.** Tool implementations in `tools.ts` return `{ success: false, error: ... }` rather than throwing, so failures flow back to the model as data.
- **Classify new tools.** When adding a tool, decide whether it belongs in `READ_ONLY_TOOL_NAMES` (see the README's "Read-only vs. mutating tools"). Only tools that cannot change cart/customer/order state are read-only; navigation-only tools count as read-only.
- **Never expose credential flows to the model.** Tools that accept raw credentials must be added to `EXCLUDED_TOOL_NAMES` in `webmcp.ts` so they are not registered with WebMCP.
- **Flatten connections.** Public methods should return plain arrays, not GraphQL connection/edge shapes.
- **Match the existing style.** ESLint enforces most of it; run `npm run lint:fix`.

## E2E tests

The Playwright suite runs against a real BigCommerce sandbox store, so results can vary with store configuration (some tests skip themselves, e.g. when reCAPTCHA is enabled). For interactive debugging:

```bash
npm run generate-certs   # one-time self-signed certs
npm run test:browser     # https://localhost:3000
```

## Releases

Releases are cut by maintainers with `npm run release[:minor|:major]`, which validates, tags, pushes, and triggers the CDN deploy workflow.
