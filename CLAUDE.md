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
npm run test         # Run tests with Vitest
```

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
```

## Build Outputs

```
dist/
├── index.js         # CommonJS bundle
├── index.esm.js     # ES Module bundle
├── index.d.ts       # TypeScript declarations
├── tools.js         # Tools CommonJS
├── tools.esm.js     # Tools ES Module
├── tools.d.ts       # Tools declarations
└── bigcommerce-agent-sdk.min.js  # Minified browser bundle (IIFE)
```

## SDK API

```
BigCommerceAgentSDK
├── searchProducts(params)
├── getProductById(id, variantId?)
├── getProductByPath(path)
├── getConfiguredProduct(id, selectedOptions)
├── findVariantByOptions(productId, options)
├── getCart()
├── addToCart(items)
├── quickAddToCart(productId, qty, options)
├── updateCartItem(lineItemId, qty)
├── removeFromCart(lineItemId)
├── deleteCart()
├── getCheckoutUrls()
├── proceedToCheckout(embedded?)
├── getCategoryTree(depth?)
├── getCartSummary()
└── getStoreSettings()
```

## Runtype Integration

Import from `@runtypelabs/runtype-bc-graphql-sdk/tools`:
- `BigCommerceLocalTools` - Tool definitions object
- `createLocalToolImplementations(sdk)` - Factory for tool implementations
- `getAllToolDefinitions()` - Returns tool array for Runtype flows

## Test Endpoint

Public BigCommerce demo store for testing:
- Endpoint: `https://buybutton.store/graphql`
- Token: `eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJlYXQiOjE3NjcxMzkyMDAsInN1Yl90eXBlIjoyLCJ0b2tlbl90eXBlIjoxLCJjb3JzIjpbImh0dHBzOi8vZGV2ZWxvcGVyLmJpZ2NvbW1lcmNlLmNvbSJdLCJjaWQiOjEsImlhdCI6MTU3NjI1MzgyNCwic3ViIjoiM3dtZThrcWtrNjQwNzZueWljMGkzamk0NG5wajQ2byIsInNpZCI6OTk5MzMxNzg0LCJpc3MiOiJCQyJ9.Rqt6hNI2W-XSOzHl4pqtfhAOygwka6atCIaIZ_WAa9v3dOctnBlZpBV5wzd3ICCy4sTCOZ9mJwcFH5_CHmJpNQ`

## Key Design Decisions

- Zero runtime dependencies (native Fetch API)
- Auto cart persistence via localStorage
- Connection/edge response flattening for cleaner data
- Structured error responses from tool implementations
- Browser bundle exposes `window.BCAgentSDK` singleton
- Fires `bcagentsdk:ready` custom event when loaded

## CI/CD

- GitHub Actions runs on push to main and PRs
- NPM publish triggers on GitHub release creation
- Requires `NPM_TOKEN` secret for publishing
