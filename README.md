# @runtypelabs/runtype-bc-graphql-sdk

BigCommerce Storefront Agent SDK - AI agent integration with BigCommerce storefronts via GraphQL Storefront API.

## Installation

```bash
npm install @runtypelabs/runtype-bc-graphql-sdk
```

## Usage

### Node.js / TypeScript

```typescript
import { BigCommerceAgentSDK } from '@runtypelabs/runtype-bc-graphql-sdk'

const sdk = new BigCommerceAgentSDK({
  graphqlEndpoint: 'https://your-store.mybigcommerce.com/graphql',
  token: 'your-storefront-token',
  debug: true,
})

// Search products
const results = await sdk.searchProducts({
  searchTerm: 'jacket',
  hideOutOfStock: true,
  sort: 'BEST_SELLING',
})

// Get product details
const product = await sdk.getProductById(123)

// Add to cart
await sdk.quickAddToCart(123, 1, { sizeOptionId: largeSizeValueId })

// Get cart summary
const cart = await sdk.getCartSummary()

// Proceed to checkout
const urls = await sdk.getCheckoutUrls()
```

### Browser (Script Manager)

Copy the minified browser bundle into BigCommerce Script Manager:

```html
<script src="path/to/bigcommerce-agent-sdk.min.js"></script>
<script>
  // SDK is available as window.BCAgentSDK
  window.addEventListener('bcagentsdk:ready', async () => {
    const products = await BCAgentSDK.searchProducts({ searchTerm: 'shoes' })
    console.log(products)
  })
</script>
```

### Runtype Integration

```typescript
import { BigCommerceAgentSDK } from '@runtypelabs/runtype-bc-graphql-sdk'
import {
  BigCommerceLocalTools,
  createLocalToolImplementations,
  getAllToolDefinitions,
} from '@runtypelabs/runtype-bc-graphql-sdk/tools'

const sdk = new BigCommerceAgentSDK({ token: 'your-token' })

// Get all tool definitions for Runtype flow
const tools = getAllToolDefinitions()

// Create implementations
const implementations = createLocalToolImplementations(sdk)

// Use with Runtype
await Runtype.flows
  .virtual({ name: 'Shopping Assistant' })
  .prompt({
    tools: {
      runtimeTools: tools,
      toolCallStrategy: 'auto',
    },
  })
  .stream({}, { localTools: implementations })
```

## API Reference

### Product Methods

- `searchProducts(params)` - Search products with filters
- `getProductById(id, variantId?)` - Get product by ID
- `getProductByPath(path)` - Get product by URL path
- `getConfiguredProduct(id, selectedOptions)` - Get product with options applied
- `findVariantByOptions(productId, options)` - Find matching variant

### Cart Methods

- `getCart()` - Get current cart
- `addToCart(items)` - Add items to cart
- `quickAddToCart(productId, quantity, options)` - Smart add with auto-configuration
- `updateCartItem(lineItemId, quantity)` - Update item quantity
- `removeFromCart(lineItemId)` - Remove item
- `deleteCart()` - Clear entire cart
- `getCartSummary()` - Get formatted cart summary

### Checkout Methods

- `getCheckoutUrls()` - Get checkout URLs
- `proceedToCheckout(embedded?)` - Redirect to checkout

### Store Methods

- `getCategoryTree(depth?)` - Get category hierarchy
- `getStoreSettings()` - Get store configuration

## Test Endpoint

For testing, you can use the BigCommerce demo store:

```typescript
const sdk = new BigCommerceAgentSDK({
  graphqlEndpoint: 'https://buybutton.store/graphql',
  token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJlYXQiOjE3NjcxMzkyMDAsInN1Yl90eXBlIjoyLCJ0b2tlbl90eXBlIjoxLCJjb3JzIjpbImh0dHBzOi8vZGV2ZWxvcGVyLmJpZ2NvbW1lcmNlLmNvbSJdLCJjaWQiOjEsImlhdCI6MTU3NjI1MzgyNCwic3ViIjoiM3dtZThrcWtrNjQwNzZueWljMGkzamk0NG5wajQ2byIsInNpZCI6OTk5MzMxNzg0LCJpc3MiOiJCQyJ9.Rqt6hNI2W-XSOzHl4pqtfhAOygwka6atCIaIZ_WAa9v3dOctnBlZpBV5wzd3ICCy4sTCOZ9mJwcFH5_CHmJpNQ',
})
```

## License

MIT
