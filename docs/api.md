# API Guide

Full reference for the BigCommerce Storefront Agent SDK: method-by-method examples, the underlying GraphQL documents, and the agent integration guide. For a quick overview and installation, see the [README](../README.md).

## Table of Contents

1. [Initialization](#initialization)
2. [SDK API Reference](#sdk-api-reference)
   - [Products](#product-methods)
   - [Cart](#cart-methods)
   - [Checkout](#checkout-methods)
   - [Store & Content](#store--content-methods)
   - [Customer Account](#customer-account-methods)
3. [GraphQL Queries Reference](#graphql-queries-reference)
4. [Usage Examples](#usage-examples)
5. [Agent Integration Guide](#agent-integration-guide)
6. [Notes](#notes)

---

## Initialization

```javascript
import { BigCommerceAgentSDK } from '@runtypelabs/runtype-bc-graphql-sdk'

const sdk = new BigCommerceAgentSDK({
  graphqlEndpoint: '/graphql', // default — works on the storefront's own domain
  token: 'storefront-api-token', // required cross-origin; optional on-storefront
  cartId: 'existing-cart-uuid',  // optional; defaults to the persisted cart
  currency: 'EUR',               // optional; sent as X-Bc-Currency
  debug: true,                   // log requests/responses
})
```

In the browser bundle the SDK auto-initializes as `window.BCAgentSDK` with defaults (set `window.BC_AGENT_DEBUG = true` before the script tag to enable logging, or `BCAgentSDK.debug = true` afterwards). To use a configured instance with the bundle's WebMCP tools, expose it as `window.BCSDK` — tool calls resolve it lazily and prefer it over the default singleton.

---

## SDK API Reference

All methods return Promises and flatten GraphQL connection/edge shapes into plain arrays.

### Product Methods

#### `searchProducts(params)`

Text search with faceted filters, sorting, and cursor pagination.

```javascript
const results = await sdk.searchProducts({
  searchTerm: 'jacket',
  categoryId: 23,                          // or categoryIds: [23, 24]
  brandIds: [5],
  price: { minPrice: 50, maxPrice: 200 },
  rating: { minRating: 4 },
  hideOutOfStock: true,
  first: 12,
  after: 'cursor-string',
  sort: 'LOWEST_PRICE',
})

// Returns:
// {
//   products: [...],   // flattened product array
//   filters: [...],    // available filter facets
//   pageInfo: { hasNextPage, endCursor, ... },
//   totalItems: 156
// }
```

**Sort options:** `A_TO_Z`, `Z_TO_A`, `LOWEST_PRICE`, `HIGHEST_PRICE`, `NEWEST`, `BEST_SELLING`, `BEST_REVIEWED`, `RELEVANCE`

#### `getProductById(entityId, variantEntityId?)`

```javascript
const product = await sdk.getProductById(123)
const variant = await sdk.getProductById(123, 456) // variant-specific details
```

#### `getProductByPath(path)`

Look up a product by its storefront URL path.

```javascript
const product = await sdk.getProductByPath('/blue-jacket/')
```

#### `getConfiguredProduct(entityId, selectedOptions)`

Product with option selections applied — variant-specific pricing, SKU, and stock.

```javascript
const configured = await sdk.getConfiguredProduct(123, [
  { optionEntityId: 100, valueEntityId: 200 },
  { optionEntityId: 101, valueEntityId: 205 },
])
```

#### `findVariantByOptions(productEntityId, selectedOptions)`

Resolve the variant matching a set of option choices.

```javascript
const variant = await sdk.findVariantByOptions(123, {
  100: 200, // optionEntityId: valueEntityId
  101: 205,
})
```

### Cart Methods

The cart ID is persisted to `localStorage` automatically; requests are sent with `credentials: 'include'` so cart sessions survive across pages.

#### `getCart(cartEntityId?)`

```javascript
const cart = await sdk.getCart() // null when there is no cart
```

#### `createCart(lineItems)`

```javascript
const cart = await sdk.createCart([
  { productEntityId: 123, quantity: 2 },
  { productEntityId: 456, quantity: 1, variantEntityId: 789 },
])
```

#### `addToCart(items)`

Adds to the existing cart, creating one if needed. Accepts a single item or an array.

```javascript
await sdk.addToCart({
  productEntityId: 123,
  quantity: 2,
  variantEntityId: 456,
  selectedOptions: {
    multipleChoices: [{ optionEntityId: 100, optionValueEntityId: 200 }],
  },
})
```

#### `quickAddToCart(productId, quantity?, options?)`

Smart add: fetches the product, resolves required options/variants, and reports back when configuration is needed instead of failing.

```javascript
// Simple product
let result = await sdk.quickAddToCart(123, 2)

// Product with options (optionEntityId -> valueEntityId)
result = await sdk.quickAddToCart(123, 1, { 100: 200, 101: 205 })

if (result.requiresConfiguration) {
  console.log('Select options first:', result.requiredOptions)
}
```

#### `updateCartItem(lineItemEntityId, quantity)` / `removeFromCart(lineItemEntityId)` / `deleteCart()`

```javascript
await sdk.updateCartItem('line-item-uuid', 5)
await sdk.removeFromCart('line-item-uuid')
await sdk.deleteCart()
```

#### `getCartSummary()`

Compact, display-friendly summary.

```javascript
const summary = await sdk.getCartSummary()
// {
//   isEmpty: false,
//   cartId: 'uuid',
//   itemCount: 3,
//   items: [...],
//   subtotal: { value: 150, currencyCode: 'USD' },
//   total: { value: 150, currencyCode: 'USD' }
// }
```

### Checkout Methods

#### `getCheckoutUrls()`

```javascript
const urls = await sdk.getCheckoutUrls()
// { embeddedCheckoutUrl: '...', redirectedCheckoutUrl: '...' }
```

#### `proceedToCheckout(embedded?)`

Navigates the browser to checkout. Navigation-only — it mutates nothing, which is why the corresponding agent tool is classified read-only.

```javascript
await sdk.proceedToCheckout()     // standard checkout
await sdk.proceedToCheckout(true) // embedded checkout
```

### Store & Content Methods

#### `getCategoryTree(depth?)`

```javascript
const categories = await sdk.getCategoryTree(3)
```

#### `getStoreSettings()`

```javascript
const { settings, currencies } = await sdk.getStoreSettings()
```

#### `getWebPages(filters?)` / `getWebPage(entityId)`

CMS web pages (content pages, contact pages, external links).

```javascript
const pages = await sdk.getWebPages({ pageType: 'NormalPage' })
const page = await sdk.getWebPage(pages[0].entityId) // includes page content
```

Page types: `NormalPage`, `ContactPage`, `ExternalLinkPage`, `BlogIndexPage`, `RawPage`.

### Customer Account Methods

These require an authenticated customer session — either the shopper is logged in on the storefront, or the session was established via `login()`.

#### `login(email, password)` / `logout()` / `isLoggedIn()`

```javascript
const session = await sdk.login('shopper@example.com', 'password') // { customer } or null
const customer = await sdk.isLoggedIn() // Customer when logged in, null otherwise
await sdk.logout()
```

> `login`/`logout` are deliberately **not** exposed as agent tools — raw credentials must never flow through an LLM tool call. Authentication belongs to the host page.

#### `getCustomer()` / `updateCustomer(input)`

```javascript
const customer = await sdk.getCustomer()
await sdk.updateCustomer({ firstName: 'Ada', phone: '555-0100' })
```

#### Addresses

```javascript
const addresses = await sdk.getCustomerAddresses()

const added = await sdk.addCustomerAddress({
  firstName: 'Ada',
  lastName: 'Lovelace',
  address1: '1 Analytical Way',
  city: 'London',
  stateOrProvince: 'London',
  postalCode: 'EC1A 1AA',
  countryCode: 'GB',
})

await sdk.updateCustomerAddress(added.entityId, { phone: '555-0100' })
await sdk.deleteCustomerAddress(added.entityId)
```

#### Orders

```javascript
const orders = await sdk.getCustomerOrders(20)   // most recent order summaries
const order = await sdk.getOrderDetails(orders[0].entityId)
```

#### Wishlists

```javascript
const wishlists = await sdk.getCustomerWishlists()

await sdk.addToWishlist(wishlists[0].entityId, [
  { productEntityId: 123, variantEntityId: 456 },
])

await sdk.removeFromWishlist(wishlists[0].entityId, [itemEntityId])
```

---

## GraphQL Queries Reference

The SDK's GraphQL documents are exported as `QUERIES` and `MUTATIONS` from the main entry point if you need to execute or customize them yourself. The most important shapes:

### Product Search

```graphql
query SearchProducts(
  $searchTerm: String
  $categoryEntityId: Int
  $categoryEntityIds: [Int!]
  $brandEntityIds: [Int!]
  $price: PriceSearchFilterInput
  $rating: RatingSearchFilterInput
  $hideOutOfStock: Boolean
  $first: Int = 12
  $after: String
  $sort: SearchProductsSortInput
) {
  site {
    search {
      searchProducts(
        filters: {
          searchTerm: $searchTerm
          categoryEntityId: $categoryEntityId
          categoryEntityIds: $categoryEntityIds
          brandEntityIds: $brandEntityIds
          price: $price
          rating: $rating
          hideOutOfStock: $hideOutOfStock
        }
        sort: $sort
      ) {
        products(first: $first, after: $after) {
          pageInfo { hasNextPage endCursor }
          collectionInfo { totalItems }
          edges { node { entityId name sku path prices { ... } defaultImage { ... } } }
        }
        filters {
          edges {
            node {
              ... on CategorySearchFilter { ... }
              ... on BrandSearchFilter { ... }
              ... on PriceSearchFilter { ... }
              ... on RatingSearchFilter { ... }
            }
          }
        }
      }
    }
  }
}
```

**Variables:**

```json
{
  "searchTerm": "jacket",
  "categoryEntityId": 23,
  "price": { "minPrice": 50, "maxPrice": 200 },
  "rating": { "minRating": 4 },
  "hideOutOfStock": true,
  "first": 12,
  "sort": "LOWEST_PRICE"
}
```

### Get Product by ID

```graphql
query GetProductById($entityId: Int!, $variantEntityId: Int) {
  site {
    product(entityId: $entityId, variantEntityId: $variantEntityId) {
      entityId
      name
      sku
      path
      description
      prices { ... }
      productOptions(first: 50) {
        edges {
          node {
            entityId
            displayName
            isRequired
            isVariantOption
            ... on MultipleChoiceOption {
              values(first: 50) { edges { node { entityId label isDefault } } }
            }
          }
        }
      }
      variants(first: 250) {
        edges { node { entityId sku prices { ... } inventory { ... } options { ... } } }
      }
    }
  }
}
```

### Get Product by URL Path

```graphql
query GetProductByPath($path: String!) {
  site {
    route(path: $path) {
      node {
        ... on Product { entityId name sku path prices { ... } productOptions { ... } variants { ... } }
      }
    }
  }
}
```

### Get Configured Product

```graphql
query GetConfiguredProduct($entityId: Int!, $optionValueIds: [OptionValueId!]) {
  site {
    product(entityId: $entityId, optionValueIds: $optionValueIds) {
      entityId
      name
      sku
      prices { ... }
      inventory { ... }
      productOptions { ... }
    }
  }
}
```

**Variables:**

```json
{
  "entityId": 123,
  "optionValueIds": [
    { "optionEntityId": 456, "valueEntityId": 789 },
    { "optionEntityId": 460, "valueEntityId": 795 }
  ]
}
```

### Cart Mutations

#### Create Cart

```graphql
mutation CreateCart($input: CreateCartInput!) {
  cart {
    createCart(input: $input) {
      cart { entityId lineItems { ... } amount { value currencyCode } }
      errors { ... on Error { message } }
    }
  }
}
```

**Variables:**

```json
{
  "input": {
    "lineItems": [
      {
        "productEntityId": 123,
        "quantity": 2,
        "variantEntityId": 456,
        "selectedOptions": {
          "multipleChoices": [{ "optionEntityId": 100, "optionValueEntityId": 200 }]
        }
      }
    ]
  }
}
```

#### Add Cart Line Items

```graphql
mutation AddCartLineItems($input: AddCartLineItemsInput!) {
  cart {
    addCartLineItems(input: $input) {
      cart { entityId lineItems { ... } }
      errors { ... on Error { message } }
    }
  }
}
```

#### Create Checkout Redirect URLs

```graphql
mutation CreateCartRedirectUrls($input: CreateCartRedirectUrlsInput!) {
  cart {
    createCartRedirectUrls(input: $input) {
      redirectUrls { embeddedCheckoutUrl redirectedCheckoutUrl }
      errors { ... on Error { message } }
    }
  }
}
```

Customer account operations (login, profile, addresses, orders, wishlists) and web-page queries follow the same pattern — see `src/queries.ts` and `src/mutations.ts` for the exact documents.

---

## Usage Examples

### Search and Add to Cart

```javascript
async function searchAndAddToCart() {
  const results = await sdk.searchProducts({
    searchTerm: 'running shoes',
    hideOutOfStock: true,
    sort: 'BEST_SELLING',
  })

  if (results.products.length === 0) return console.log('No products found')

  const product = await sdk.getProductById(results.products[0].entityId)

  // quickAddToCart resolves required options; when it can't, it says so
  const result = await sdk.quickAddToCart(product.entityId, 1)
  if (result.requiresConfiguration) {
    // pick a value for each required option, then retry
    const options = {}
    for (const opt of result.requiredOptions) {
      const first = opt.values?.[0]
      if (first) options[opt.entityId] = first.entityId
    }
    await sdk.quickAddToCart(product.entityId, 1, options)
  }

  const cart = await sdk.getCartSummary()
  console.log(`Cart has ${cart.itemCount} items, total: ${cart.total.value}`)
}
```

### Complete Purchase Flow

```javascript
async function completePurchase(productId, quantity, options = {}) {
  try {
    const result = await sdk.quickAddToCart(productId, quantity, options)

    if (result.requiresConfiguration) {
      return {
        success: false,
        message: 'Product requires option selection',
        requiredOptions: result.requiredOptions,
      }
    }

    const cart = await sdk.getCartSummary()
    const checkoutUrls = await sdk.getCheckoutUrls()

    return { success: true, cart, checkoutUrl: checkoutUrls.redirectedCheckoutUrl }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### Product Configuration UI

```javascript
async function displayProductOptions(productId) {
  const product = await sdk.getProductById(productId)
  const options = product.productOptions || []
  const selectedOptions = {}

  options.forEach((option) => {
    console.log(`Option: ${option.displayName} (${option.isRequired ? 'Required' : 'Optional'})`)
    option.values?.forEach((value) => console.log(`  - ${value.label} (ID: ${value.entityId})`))
  })

  // As the user selects options, fetch variant-specific pricing
  async function onOptionChange(optionId, valueId) {
    selectedOptions[optionId] = valueId

    const configured = await sdk.getConfiguredProduct(
      productId,
      Object.entries(selectedOptions).map(([opt, val]) => ({
        optionEntityId: parseInt(opt),
        valueEntityId: parseInt(val),
      }))
    )

    console.log('Updated price:', configured.prices.price)
  }

  return { product, options, onOptionChange }
}
```

### Customer Account Flow

```javascript
async function showAccountSummary() {
  const customer = await sdk.isLoggedIn()
  if (!customer) return console.log('Not logged in')

  const [orders, wishlists, addresses] = await Promise.all([
    sdk.getCustomerOrders(5),
    sdk.getCustomerWishlists(),
    sdk.getCustomerAddresses(),
  ])

  console.log(`Hi ${customer.firstName}: ${orders.length} recent orders, ` +
    `${wishlists.length} wishlists, ${addresses.length} saved addresses`)
}
```

---

## Agent Integration Guide

Don't hand-roll tool wrappers — the `tools` entry point ships 27 ready-made definitions (name, description, JSON Schema parameters) and implementations that return structured errors instead of throwing:

```javascript
import { BigCommerceAgentSDK } from '@runtypelabs/runtype-bc-graphql-sdk'
import {
  getAllToolDefinitions,
  createLocalToolImplementations,
  READ_ONLY_TOOL_NAMES,
} from '@runtypelabs/runtype-bc-graphql-sdk/tools'

const sdk = new BigCommerceAgentSDK({ token: 'your-token' })

const tools = getAllToolDefinitions()                 // ToolDefinition[] with readOnly flags
const implementations = createLocalToolImplementations(sdk)

// e.g. dispatch a model's tool call
const result = await implementations[toolCall.name](toolCall.arguments)
// on failure: { success: false, error: '...' } — feed it back to the model
```

Use the `readOnly` flag (or `READ_ONLY_TOOL_NAMES`) to auto-approve reads and require human confirmation for mutations — see the README's [read-only vs. mutating tools](../README.md#read-only-vs-mutating-tools) table.

### WebMCP (browser)

On the storefront, the browser bundle registers all tools on `document.modelContext` automatically, so a WebMCP-aware chat widget discovers them with no wiring. The full strategy (polyfill install, credential-tool exclusion, `readOnlyHint` annotations, `window.BCSDK` resolution) is documented in the README's [WebMCP tool registration](../README.md#webmcp-tool-registration) section. For custom setups, `registerWebMCPTools(sdk)` is exported from the main entry point.

### Ready event

```javascript
window.addEventListener('bcagentsdk:ready', (event) => {
  console.log('SDK is ready:', event.detail.sdk)
  // Initialize your agent here
})
```

---

## Notes

- The SDK persists the cart ID in `localStorage` (`bc_agent_cart_id`) automatically.
- The GraphQL Storefront API allows one mutation per request.
- Product search filters require the merchant to have product filtering enabled; some filters (rating, in-stock) require Pro/Enterprise plans.
- Always handle `requiresConfiguration` from `quickAddToCart` — products with required options can't be added blind.
- SDK methods throw on HTTP/GraphQL errors (including calling customer methods without a session) — only the tool implementations wrap failures into `{ success: false, error }`. The exception is `isLoggedIn()`, which never throws; call it first when a session is uncertain.
