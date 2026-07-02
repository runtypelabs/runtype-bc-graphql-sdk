# BigCommerce Storefront Agent SDK

[![CI](https://github.com/runtypelabs/runtype-bc-graphql-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/runtypelabs/runtype-bc-graphql-sdk/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@runtypelabs/runtype-bc-graphql-sdk)](https://www.npmjs.com/package/@runtypelabs/runtype-bc-graphql-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A zero-dependency TypeScript SDK that lets AI agents shop a BigCommerce storefront through the [GraphQL Storefront API](https://developer.bigcommerce.com/docs/storefront/graphql) — search the catalog, configure products, manage the cart, hand off to checkout, and (for logged-in shoppers) work with the customer's account. It ships with ready-made agent tool definitions and automatic [WebMCP](https://github.com/webmachinelearning/webmcp) tool registration so any WebMCP-aware chat widget on the page can discover and call storefront capabilities.

## Highlights

- **Zero runtime dependencies** — built on the native Fetch API (the only dependency, a WebMCP polyfill, is used exclusively by the browser bundle)
- **Full storefront coverage** — product search with faceted filters, product configuration/variants, cart CRUD, checkout URLs, categories, store settings, CMS web pages
- **Customer account support** — profile, addresses, order history, and wishlists when a customer session exists
- **Agent-native** — 27 typed tool definitions with JSON Schema parameters, structured error responses, and a read-only/mutating classification for approval gating
- **WebMCP integration** — the browser bundle registers tools on `document.modelContext` automatically (see [WebMCP tool registration](#webmcp-tool-registration))
- **Cart persistence** — cart ID stored in `localStorage`, requests sent with `credentials: 'include'` so cart sessions survive across pages
- **Clean responses** — GraphQL connection/edge boilerplate is flattened into plain arrays

## Installation

```bash
npm install @runtypelabs/runtype-bc-graphql-sdk
```

Or load the browser bundle from a CDN / BigCommerce Script Manager — see [Browser usage](#browser-cdn--script-manager).

## Quick start

```typescript
import { BigCommerceAgentSDK } from '@runtypelabs/runtype-bc-graphql-sdk'

const sdk = new BigCommerceAgentSDK({
  graphqlEndpoint: 'https://your-store.mybigcommerce.com/graphql',
  token: 'your-storefront-api-token',
})

// Search products
const results = await sdk.searchProducts({
  searchTerm: 'jacket',
  hideOutOfStock: true,
  sort: 'BEST_SELLING',
})

// Get product details
const product = await sdk.getProductById(123)

// Add to cart (auto-resolves required options / variants)
// options map option entityId -> selected value entityId
await sdk.quickAddToCart(123, 1, { [sizeOptionId]: largeValueId })

// Get a formatted cart summary
const cart = await sdk.getCartSummary()

// Hand off to checkout
const urls = await sdk.getCheckoutUrls()
```

When the SDK runs on the storefront itself (e.g. injected into a Stencil theme), `graphqlEndpoint` defaults to `/graphql` and the shopper's own session provides authentication — no token needed for guest-level operations.

### Configuration

All options are optional:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `graphqlEndpoint` | `string` | `/graphql` | GraphQL Storefront API URL. The relative default works when running on the storefront's own domain. |
| `token` | `string` | `null` | [Storefront API token](https://developer.bigcommerce.com/docs/storefront/graphql#tokens). Required for cross-origin use; optional on-storefront. |
| `cartId` | `string` | from `localStorage` | Resume an existing cart. When omitted, the persisted cart ID (if any) is used. |
| `currency` | `string` | store default | ISO currency code sent as `X-Bc-Currency`. |
| `debug` | `boolean` | `false` | Log requests/responses to the console. |

## Browser (CDN / Script Manager)

The IIFE bundle (`dist/bigcommerce-agent-sdk.min.js`) is designed for injection into a BigCommerce Stencil theme via Script Manager. On load it:

1. Creates a singleton instance as `window.BCAgentSDK` (endpoint `/graphql`, shopper-session auth)
2. Exposes the class as `window.BigCommerceAgentSDK` for custom instances
3. Registers all agent tools with WebMCP (see below)
4. Fires a `bcagentsdk:ready` `CustomEvent` on `window`

```html
<script
  src="https://cdn11.bigcommerce.com/s-dvzxci70mm/content/runtype-bc-graphql-sdk/latest/sdk.min.js"
  integrity="sha384-..."
  crossorigin="anonymous">
</script>
<script>
  window.addEventListener('bcagentsdk:ready', async () => {
    const products = await BCAgentSDK.searchProducts({ searchTerm: 'shoes' })
    console.log(products)
  })
</script>
```

The current SRI hash is published alongside the bundle at `https://cdn11.bigcommerce.com/s-dvzxci70mm/content/runtype-bc-graphql-sdk/latest/sha384.txt`; versioned builds live at `.../runtype-bc-graphql-sdk/{version}/sdk.min.js`. Set `window.BC_AGENT_DEBUG = true` before the script tag to enable debug logging.

## Agent tools

`@runtypelabs/runtype-bc-graphql-sdk/tools` exports the SDK's capabilities as agent tool definitions (name, description, JSON Schema parameters) plus a factory that binds them to an SDK instance:

```typescript
import { BigCommerceAgentSDK } from '@runtypelabs/runtype-bc-graphql-sdk'
import {
  getAllToolDefinitions,        // ToolDefinition[] with readOnly flags applied
  createLocalToolImplementations, // (sdk) => { [toolName]: async (args) => result }
  READ_ONLY_TOOL_NAMES,         // names of tools that never mutate state
} from '@runtypelabs/runtype-bc-graphql-sdk/tools'

const sdk = new BigCommerceAgentSDK({ token: 'your-token' })
const tools = getAllToolDefinitions()
const implementations = createLocalToolImplementations(sdk)
```

Every implementation returns a structured result rather than throwing, so failures flow back to the model as data it can react to:

```json
{ "success": false, "error": "Product not found: 999" }
```

The definitions are plug-in ready for [Runtype](https://runtype.com) flows (`runtimeTools` + `localTools`), and the same shapes adapt easily to other tool-calling frameworks.

### Read-only vs. mutating tools

Each tool definition carries a `readOnly` flag, derived from `READ_ONLY_TOOL_NAMES`. The classification is behavioral, not just semantic: **read-only tools are safe to auto-approve** (they cannot change cart, customer, or order state), while everything else deserves a human confirmation step in UIs that gate tool calls.

| Read-only (auto-approvable) | Mutating (confirm before running) |
| --- | --- |
| `search_products`, `get_product_details`, `get_product_by_url`, `configure_product`, `get_cart`, `proceed_to_checkout`, `get_categories`, `get_store_info`, `check_login_status`, `get_customer_profile`, `get_customer_addresses`, `get_order_history`, `get_order_details`, `get_wishlists`, `get_web_pages`, `get_web_page` | `add_to_cart`, `quick_add_to_cart`, `update_cart_item`, `remove_from_cart`, `clear_cart`, `update_customer_profile`, `add_customer_address`, `update_customer_address`, `delete_customer_address`, `add_to_wishlist`, `remove_from_wishlist` |

Note that `proceed_to_checkout` is classified read-only by design: it is a *navigation* tool (it resolves and redirects to the checkout URL) and mutates nothing — the shopper still confirms everything on the checkout page itself.

## WebMCP tool registration

The browser bundle exposes the storefront to on-page AI assistants via [WebMCP](https://github.com/webmachinelearning/webmcp): at load time it calls `registerWebMCPTools(sdk)` (also exported from the main entry point for custom setups), which registers every tool on `document.modelContext` so a WebMCP-aware chat widget can discover them with `getTools()` and call them directly.

The registration strategy:

- **Polyfill, native-first.** If the browser has no native `document.modelContext`, [`@mcp-b/webmcp-polyfill`](https://www.npmjs.com/package/@mcp-b/webmcp-polyfill) is installed. Installation is first-wins and idempotent — a native implementation or a polyfill already installed by the chat widget is left untouched.
- **Idempotent registration.** A `window.__bcAgentWebMCPToolsRegistered` guard ensures tools are registered exactly once, even if the script is injected multiple times.
- **Credential tools are never exposed.** `login`/`logout` are excluded from registration: raw customer credentials must never flow through an LLM tool call. Authentication stays with the host page.
- **Read-only annotations for approval gating.** Each tool is registered with `annotations: { readOnlyHint }` from the read-only classification above, so hosts can silently auto-approve reads while surfacing a confirmation prompt for mutations. Because some WebMCP consumers drop annotations from their `getTools()` snapshot, hosts may equivalently gate by name using the exported `READ_ONLY_TOOL_NAMES`.
- **Lazy SDK resolution.** Tool implementations resolve the active SDK instance at call time. If the host page creates its own configured instance (e.g. with a Storefront API token for authenticated customer queries) and exposes it as `window.BCSDK`, tools automatically run against it instead of the default singleton — even when it is created after the bundle loads.
- **Failure isolation.** Each tool registers inside a try/catch; one bad registration never breaks the rest of the SDK or the page.

## API reference

All methods return Promises. Connection/edge responses are flattened into plain arrays. This is a summary — for per-method examples, the underlying GraphQL documents, and the agent integration guide, see **[docs/api.md](docs/api.md)**.

### Products

| Method | Description |
| --- | --- |
| `searchProducts(params)` | Text search with faceted filters (category, brand, price range, rating, stock), sorting, and pagination |
| `getProductById(id, variantId?)` | Full product details, optionally variant-specific |
| `getProductByPath(path)` | Look up a product by its URL path (e.g. `/blue-jacket/`) |
| `getConfiguredProduct(id, selectedOptions)` | Product with option selections applied (variant pricing/stock) |
| `findVariantByOptions(productId, options)` | Resolve the variant matching a set of option choices |

### Cart & checkout

| Method | Description |
| --- | --- |
| `getCart()` | Current cart (or `null`) |
| `addToCart(items)` | Add line items; creates the cart if needed |
| `quickAddToCart(productId, quantity, options?)` | Smart add — auto-resolves required options and variants |
| `updateCartItem(lineItemId, quantity)` | Change a line item's quantity |
| `removeFromCart(lineItemId)` | Remove a line item |
| `deleteCart()` | Delete the cart entirely |
| `getCartSummary()` | Compact, display-friendly cart summary |
| `getCheckoutUrls()` | Checkout and cart URLs for the current cart |
| `proceedToCheckout(embedded?)` | Navigate the browser to checkout |

### Store

| Method | Description |
| --- | --- |
| `getCategoryTree(depth?)` | Category hierarchy |
| `getStoreSettings()` | Store name, URLs, currencies, and settings |
| `getWebPages(filters?)` | CMS web pages (contact, content pages, links) |
| `getWebPage(entityId)` | A single web page with content |

### Customer account

These require an authenticated customer session (the shopper is logged in on the storefront, or the instance is configured with a customer-impersonation token).

| Method | Description |
| --- | --- |
| `login(email, password)` / `logout()` | Establish / end a customer session (never exposed as agent tools) |
| `isLoggedIn()` | Returns the `Customer` when a session exists, `null` otherwise (never throws) |
| `getCustomer()` / `updateCustomer(input)` | Read / update the customer profile |
| `getCustomerAddresses()` | List saved addresses |
| `addCustomerAddress(input)` / `updateCustomerAddress(id, input)` / `deleteCustomerAddress(id)` | Manage addresses |
| `getCustomerOrders(first?)` / `getOrderDetails(orderId)` | Order history and details |
| `getCustomerWishlists()` | List wishlists with items |
| `addToWishlist(wishlistId, items)` / `removeFromWishlist(wishlistId, itemIds)` | Manage wishlist items |

Raw GraphQL documents are also exported (`QUERIES`, `MUTATIONS`) if you need to customize requests.

## Development

```bash
npm install
npm run build        # ESM + CJS + browser IIFE bundles (tsup)
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm test             # unit tests (Vitest)
```

### Browser / e2e testing

The e2e suite (Playwright) and the interactive test page run against a real BigCommerce sandbox store over HTTPS:

```bash
npm run generate-certs   # one-time: self-signed certs for localhost
npm run test:e2e         # headless Playwright run
npm run test:e2e:ui      # Playwright UI mode
npm run test:browser     # interactive test page at https://localhost:3000
```

Accept the self-signed certificate warning the first time you open the test page. Some e2e tests skip themselves depending on store configuration (e.g. reCAPTCHA on address creation).

## Releasing

```bash
npm run release        # patch bump
npm run release:minor
npm run release:major
```

`preversion` runs lint, typecheck, build, and tests; `postversion` pushes the commit and tag. The [CDN Deploy workflow](.github/workflows/cdn-deploy.yml) picks up the version bump, uploads the browser bundle to the CDN (versioned path + `latest/`), and publishes its SRI hash.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). To report a security issue, see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © Runtype Labs
