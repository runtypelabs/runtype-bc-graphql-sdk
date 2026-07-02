# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BigCommerce Storefront Agent SDK - a TypeScript library for AI agents to interact with BigCommerce storefronts via the GraphQL Storefront API.

## Build Commands

```bash
npm install          # Install dependencies
npm run build        # Build all bundles (ESM, CJS, browser IIFE)
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix lint issues
npm run codegen      # Regenerate src/generated/graphql.ts from schema.graphql + documents
npm run update-schema # Re-fetch schema.graphql from BigCommerce, then run codegen
```

## GraphQL Schema

The BigCommerce Storefront schema is vendored at `schema.graphql` (introspected from the public GraphQL playground store, see `scripts/fetch-schema.mjs`). Every document in `src/queries.ts` / `src/mutations.ts` is validated against it by `test/unit/graphql-documents.test.ts`, and GraphQL Code Generator emits types to `src/generated/graphql.ts` (committed — CI fails if stale). After editing any query/mutation, run `npm run codegen`. Documents must keep their `/* GraphQL */` template annotation so codegen can extract them.

```bash
```

## Testing

```bash
npm test             # Run unit tests (Vitest)
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run Playwright browser e2e tests (headless)
npm run test:e2e:ui  # Run e2e tests with Playwright UI
npm run test:browser # Start interactive browser test server at https://localhost:3000
npm run generate-certs # Generate SSL certificates (required before first run)
```

### Test Server Setup

The test server uses HTTPS with self-signed certificates:

```bash
# First time setup - generate SSL certificates
npm run generate-certs

# Start interactive browser test server
npm run test:browser
# Opens https://localhost:3000 (accept the self-signed certificate warning)
```

### E2E Test Configuration

E2E tests use Playwright with Chromium and run against a real BigCommerce store:
- Endpoint: `https://store-dvzxci70mm.mybigcommerce.com/graphql`
- CORS configured for both `http://localhost:3000` and `https://localhost:3000`
- Test customer account: `test@test.test` / `Abc12345`

### E2E Test Coverage

Tests cover:
- SDK loading and initialization
- Product search and filtering
- Product details and configuration
- Cart operations (add, update, remove, delete)
- Checkout URL generation
- Customer account (unauthenticated behavior)
- Customer account (authenticated): profile, addresses, orders, wishlists

Note: Some tests may be skipped based on store configuration (e.g., reCAPTCHA requirements for address creation).

## Releasing

```bash
npm run release        # Bump patch version, run checks, push, deploy to CDN
npm run release:minor  # Bump minor version
npm run release:major  # Bump major version
```

The release process:
1. Runs lint, typecheck, build, and tests (preversion hook)
2. Bumps version in package.json
3. Creates git commit and tag
4. Pushes to origin (postversion hook)
5. CDN Deploy workflow detects new version and deploys

## CI/CD Workflows

### CI (`.github/workflows/ci.yml`)
- Triggers on push to main and PRs
- Runs: typecheck, lint, build, unit tests, e2e tests
- E2E tests run in separate job with Playwright

### CDN Deploy (`.github/workflows/cdn-deploy.yml`)
- Triggers when `package.json` changes (version bump)
- Only deploys if version tag doesn't exist yet
- Deploys to BigCommerce WebDAV CDN
- Creates versioned path + updates `latest/`
- Generates SRI hash for security

### E2E Tests (`.github/workflows/e2e.yml`)
- Manual trigger or daily at 6 AM UTC
- Standalone browser test run
- Uploads test reports and failure videos

### CDN URLs
- Versioned: `https://cdn11.bigcommerce.com/s-dvzxci70mm/content/runtype-bc-graphql-sdk/{version}/sdk.min.js`
- Latest: `https://cdn11.bigcommerce.com/s-dvzxci70mm/content/runtype-bc-graphql-sdk/latest/sdk.min.js`
- SRI hash: `https://cdn11.bigcommerce.com/s-dvzxci70mm/content/runtype-bc-graphql-sdk/latest/sha384.txt`

## Project Structure

```
src/
├── index.ts         # Main entry point (exports SDK, types, queries, mutations)
├── sdk.ts           # BigCommerceAgentSDK class implementation
├── types.ts         # TypeScript type definitions
├── queries.ts       # GraphQL query strings
├── mutations.ts     # GraphQL mutation strings
├── tools.ts         # Runtype tool definitions and implementations
└── browser.ts       # Browser IIFE wrapper for Script Manager injection

test/
├── e2e/
│   └── sdk.spec.ts  # Playwright e2e tests
├── browser/
│   └── index.html   # Interactive browser test page
├── certs/           # SSL certificates (gitignored, generated via npm run generate-certs)
└── server.mjs       # HTTPS test server for localhost:3000
```

## Build Outputs

```
dist/
├── index.js                      # CommonJS bundle
├── index.esm.js                  # ES Module bundle
├── index.d.ts                    # TypeScript declarations
├── tools.js                      # Tools CommonJS
├── tools.esm.js                  # Tools ES Module
├── tools.d.ts                    # Tools declarations
└── bigcommerce-agent-sdk.min.js  # Minified browser bundle (IIFE)
```

## SDK API

```
BigCommerceAgentSDK
├── Products
│   ├── searchProducts(params)
│   ├── getProductById(id, variantId?)
│   ├── getProductByPath(path)
│   ├── getConfiguredProduct(id, selectedOptions)
│   └── findVariantByOptions(productId, options)
├── Cart
│   ├── getCart()
│   ├── addToCart(items)
│   ├── quickAddToCart(productId, qty, options)
│   ├── updateCartItem(lineItemId, qty)
│   ├── removeFromCart(lineItemId)
│   ├── deleteCart()
│   ├── getCheckoutUrls()
│   ├── proceedToCheckout(embedded?)
│   └── getCartSummary()
├── Store
│   ├── getCategoryTree(depth?)
│   ├── getBrands(first?)
│   └── getStoreSettings()
└── Customer Account (requires authenticated session)
    ├── isLoggedIn()
    ├── getCustomer()
    ├── updateCustomer(input)
    ├── getCustomerAddresses()
    ├── addCustomerAddress(input)
    ├── updateCustomerAddress(addressEntityId, input)
    ├── deleteCustomerAddress(addressEntityId)
    ├── getCustomerOrders(first?)
    ├── getOrderDetails(orderId)
    ├── getCustomerWishlists()
    ├── addToWishlist(wishlistEntityId, items)
    └── removeFromWishlist(wishlistEntityId, itemEntityIds)
```

## Runtype Integration

Import from `@runtypelabs/runtype-bc-graphql-sdk/tools`:
- `BigCommerceLocalTools` - Tool definitions object
- `createLocalToolImplementations(sdk)` - Factory for tool implementations
- `getAllToolDefinitions()` - Returns tool array for Runtype flows

## Key Design Decisions

- Zero runtime dependencies (native Fetch API)
- Auto cart persistence via localStorage
- `credentials: 'include'` for cross-origin cart sessions
- Connection/edge response flattening for cleaner data
- Structured error responses from tool implementations
- Browser bundle exposes `window.BCAgentSDK` singleton
- Fires `bcagentsdk:ready` custom event when loaded
