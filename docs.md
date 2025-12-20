# BigCommerce Storefront Agent SDK

A lightweight JavaScript library for AI agent integration with BigCommerce storefronts. Designed for injection via Script Manager into Stencil themes.

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [GraphQL Queries Reference](#graphql-queries-reference)
4. [SDK API Reference](#sdk-api-reference)
5. [Usage Examples](#usage-examples)
6. [Agent Integration Guide](#agent-integration-guide)

---

## Overview

This SDK provides a clean interface for AI agents to interact with BigCommerce storefronts via the GraphQL Storefront API. It supports:

- **Product Search** - Text search with faceted filtering (category, brand, price, rating)
- **Product Details** - Full product information including options, variants, and pricing
- **Product Configuration** - Get variant-specific pricing based on option selections
- **Cart Management** - Create, add items, update quantities, remove items
- **Checkout** - Generate checkout URLs and redirect to checkout

### Key Features

- Zero dependencies (uses native Fetch API)
- Automatic cart persistence via localStorage
- Connection-edge response flattening for easier data access
- Built-in error handling
- Debug mode for development
- TypeScript-friendly structure

---

## Installation

### Via BigCommerce Script Manager

1. Copy the contents of `bigcommerce-agent-sdk.js`
2. In BigCommerce Admin, go to **Storefront → Script Manager**
3. Click **Create a Script**
4. Configure:
   - **Location on page**: Footer
   - **Select pages where script will be added**: All Pages
   - **Script type**: Script
5. Paste the SDK code
6. Save

### Via Direct Injection

```html
<script src="/path/to/bigcommerce-agent-sdk.js"></script>
```

### Configuration

Enable debug mode by setting before the SDK loads:
```javascript
window.BC_AGENT_DEBUG = true;
```

Or after initialization:
```javascript
window.BCAgentSDK.debug = true;
```

---

## GraphQL Queries Reference

### 1. Product Search Query

Search products with text queries and faceted filters.

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
          pageInfo {
            hasNextPage
            endCursor
          }
          collectionInfo {
            totalItems
          }
          edges {
            node {
              entityId
              name
              sku
              path
              description
              prices { ... }
              defaultImage { ... }
            }
          }
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

**Sort Options:** `A_TO_Z`, `Z_TO_A`, `LOWEST_PRICE`, `HIGHEST_PRICE`, `NEWEST`, `BEST_SELLING`, `BEST_REVIEWED`, `RELEVANCE`

---

### 2. Get Product by ID

Retrieve full product details including options, variants, and related products.

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
              values(first: 50) {
                edges {
                  node {
                    entityId
                    label
                    isDefault
                  }
                }
              }
            }
          }
        }
      }
      variants(first: 250) {
        edges {
          node {
            entityId
            sku
            prices { ... }
            inventory { ... }
            options { ... }
          }
        }
      }
    }
  }
}
```

---

### 3. Get Product by URL Path

Look up products by their storefront URL path.

```graphql
query GetProductByPath($path: String!) {
  site {
    route(path: $path) {
      node {
        ... on Product {
          entityId
          name
          sku
          path
          prices { ... }
          productOptions { ... }
          variants { ... }
        }
      }
    }
  }
}
```

**Variables:**
```json
{
  "path": "/blue-denim-jacket/"
}
```

---

### 4. Get Configured Product

Get variant-specific details based on option selections.

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

---

### 5. Cart Mutations

#### Create Cart
```graphql
mutation CreateCart($input: CreateCartInput!) {
  cart {
    createCart(input: $input) {
      cart {
        entityId
        lineItems { ... }
        amount { value currencyCode }
      }
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
          "multipleChoices": [
            { "optionEntityId": 100, "optionValueEntityId": 200 }
          ]
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
      cart {
        entityId
        lineItems { ... }
      }
      errors { ... on Error { message } }
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "cartEntityId": "cart-uuid",
    "data": {
      "lineItems": [
        { "productEntityId": 456, "quantity": 1 }
      ]
    }
  }
}
```

#### Create Checkout Redirect URLs
```graphql
mutation CreateCartRedirectUrls($input: CreateCartRedirectUrlsInput!) {
  cart {
    createCartRedirectUrls(input: $input) {
      redirectUrls {
        embeddedCheckoutUrl
        redirectedCheckoutUrl
      }
      errors { ... on Error { message } }
    }
  }
}
```

---

## SDK API Reference

### Initialization

```javascript
// SDK auto-initializes as window.BCAgentSDK
// Or create custom instance:
const sdk = new BigCommerceAgentSDK({
  graphqlEndpoint: '/graphql',  // Default
  token: 'optional-token',       // For authenticated requests
  debug: true                    // Enable logging
});
```

### Product Methods

#### `searchProducts(params)`

Search products with filters.

```javascript
const results = await BCAgentSDK.searchProducts({
  searchTerm: 'jacket',
  categoryId: 23,
  price: { minPrice: 50, maxPrice: 200 },
  rating: { minRating: 4 },
  hideOutOfStock: true,
  first: 12,
  after: 'cursor-string',
  sort: 'LOWEST_PRICE'
});

// Returns:
{
  products: [...],      // Flattened array of products
  filters: [...],       // Available filter facets
  pageInfo: { hasNextPage, endCursor, ... },
  totalItems: 156
}
```

#### `getProductById(entityId, variantEntityId?)`

Get product by ID.

```javascript
const product = await BCAgentSDK.getProductById(123);
const variant = await BCAgentSDK.getProductById(123, 456);
```

#### `getProductByPath(path)`

Get product by URL path.

```javascript
const product = await BCAgentSDK.getProductByPath('/blue-jacket/');
```

#### `getConfiguredProduct(entityId, selectedOptions)`

Get product with selected options applied.

```javascript
const configured = await BCAgentSDK.getConfiguredProduct(123, [
  { optionEntityId: 100, valueEntityId: 200 },
  { optionEntityId: 101, valueEntityId: 205 }
]);
```

#### `findVariantByOptions(productId, options)`

Find variant matching selected options.

```javascript
const variant = await BCAgentSDK.findVariantByOptions(123, {
  100: 200,  // optionId: valueId
  101: 205
});
```

### Cart Methods

#### `getCart(cartEntityId?)`

Get current cart.

```javascript
const cart = await BCAgentSDK.getCart();
```

#### `createCart(lineItems)`

Create new cart with items.

```javascript
const cart = await BCAgentSDK.createCart([
  { productEntityId: 123, quantity: 2 },
  { productEntityId: 456, quantity: 1, variantEntityId: 789 }
]);
```

#### `addToCart(items)`

Add items to existing cart (or create new).

```javascript
// Single item
await BCAgentSDK.addToCart({
  productEntityId: 123,
  quantity: 2,
  variantEntityId: 456,
  selectedOptions: {
    multipleChoices: [
      { optionEntityId: 100, optionValueEntityId: 200 }
    ]
  }
});

// Multiple items
await BCAgentSDK.addToCart([
  { productEntityId: 123, quantity: 2 },
  { productEntityId: 456, quantity: 1 }
]);
```

#### `updateCartItem(lineItemEntityId, quantity)`

Update line item quantity.

```javascript
await BCAgentSDK.updateCartItem('line-item-uuid', 5);
```

#### `removeFromCart(lineItemEntityId)`

Remove item from cart.

```javascript
await BCAgentSDK.removeFromCart('line-item-uuid');
```

#### `deleteCart()`

Delete entire cart.

```javascript
await BCAgentSDK.deleteCart();
```

### Checkout Methods

#### `getCheckoutUrls()`

Get checkout URLs.

```javascript
const urls = await BCAgentSDK.getCheckoutUrls();
// { embeddedCheckoutUrl: '...', redirectedCheckoutUrl: '...' }
```

#### `proceedToCheckout(embedded?)`

Redirect to checkout.

```javascript
await BCAgentSDK.proceedToCheckout();        // Standard checkout
await BCAgentSDK.proceedToCheckout(true);    // Embedded checkout
```

### Convenience Methods

#### `quickAddToCart(productId, quantity, options?)`

Smart add to cart that handles product configuration.

```javascript
// Simple product
const result = await BCAgentSDK.quickAddToCart(123, 2);

// Product with options
const result = await BCAgentSDK.quickAddToCart(123, 1, {
  100: 200,  // Size: Large
  101: 205   // Color: Blue
});

// If product requires configuration:
if (result.requiresConfiguration) {
  console.log('Select options:', result.requiredOptions);
}
```

#### `getCartSummary()`

Get formatted cart summary.

```javascript
const summary = await BCAgentSDK.getCartSummary();
// {
//   isEmpty: false,
//   cartId: 'uuid',
//   itemCount: 3,
//   items: [...],
//   subtotal: { value: 150, currencyCode: 'USD' },
//   total: { value: 150, currencyCode: 'USD' }
// }
```

### Store Methods

#### `getCategoryTree(depth?)`

Get category tree.

```javascript
const categories = await BCAgentSDK.getCategoryTree(3);
```

#### `getStoreSettings()`

Get store settings and currencies.

```javascript
const { settings, currencies } = await BCAgentSDK.getStoreSettings();
```

---

## Usage Examples

### Example 1: Search and Add to Cart Flow

```javascript
async function searchAndAddToCart() {
  // Search for products
  const results = await BCAgentSDK.searchProducts({
    searchTerm: 'running shoes',
    hideOutOfStock: true,
    sort: 'BEST_SELLING'
  });

  if (results.products.length === 0) {
    console.log('No products found');
    return;
  }

  // Get first product details
  const product = await BCAgentSDK.getProductById(results.products[0].entityId);

  // Check if it needs configuration
  const requiredOptions = product.productOptions?.filter(o => o.isRequired) || [];
  
  if (requiredOptions.length > 0) {
    // Select first available value for each required option
    const options = {};
    requiredOptions.forEach(opt => {
      const firstValue = opt.values?.[0];
      if (firstValue) {
        options[opt.entityId] = firstValue.entityId;
      }
    });

    await BCAgentSDK.quickAddToCart(product.entityId, 1, options);
  } else {
    await BCAgentSDK.addToCart({
      productEntityId: product.entityId,
      quantity: 1
    });
  }

  // Get cart summary
  const cart = await BCAgentSDK.getCartSummary();
  console.log(`Cart has ${cart.itemCount} items, total: ${cart.total.value}`);
}
```

### Example 2: Complete Purchase Flow

```javascript
async function completePurchase(productId, quantity, options = {}) {
  try {
    // Add to cart
    const result = await BCAgentSDK.quickAddToCart(productId, quantity, options);
    
    if (result.requiresConfiguration) {
      return {
        success: false,
        message: 'Product requires option selection',
        requiredOptions: result.requiredOptions
      };
    }

    // Get cart summary
    const cart = await BCAgentSDK.getCartSummary();

    // Proceed to checkout
    const checkoutUrls = await BCAgentSDK.getCheckoutUrls();

    return {
      success: true,
      cart: cart,
      checkoutUrl: checkoutUrls.redirectedCheckoutUrl
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

### Example 3: Product Configuration UI

```javascript
async function displayProductOptions(productId) {
  const product = await BCAgentSDK.getProductById(productId);
  
  const options = product.productOptions || [];
  const selectedOptions = {};

  // Render options UI
  options.forEach(option => {
    console.log(`Option: ${option.displayName} (${option.isRequired ? 'Required' : 'Optional'})`);
    
    if (option.values) {
      option.values.forEach(value => {
        console.log(`  - ${value.label} (ID: ${value.entityId})`);
      });
    }
  });

  // When user selects options, get configured product
  async function onOptionChange(optionId, valueId) {
    selectedOptions[optionId] = valueId;
    
    const configured = await BCAgentSDK.getConfiguredProduct(
      productId, 
      Object.entries(selectedOptions).map(([opt, val]) => ({
        optionEntityId: parseInt(opt),
        valueEntityId: parseInt(val)
      }))
    );

    // Update price display
    console.log('Updated price:', configured.prices.price);
  }

  return { product, options, onOptionChange };
}
```

---

## Agent Integration Guide

### Exposing Tools to Your Agent

```javascript
// Define tools for your AI agent
const agentTools = {
  async searchProducts(query, filters = {}) {
    return await BCAgentSDK.searchProducts({
      searchTerm: query,
      ...filters
    });
  },

  async getProductDetails(productId) {
    return await BCAgentSDK.getProductById(productId);
  },

  async addToCart(productId, quantity, options = {}) {
    return await BCAgentSDK.quickAddToCart(productId, quantity, options);
  },

  async getCart() {
    return await BCAgentSDK.getCartSummary();
  },

  async checkout() {
    return await BCAgentSDK.getCheckoutUrls();
  }
};

// Expose to your agent framework
window.agentTools = agentTools;
```

### Event Listening

```javascript
// Listen for SDK ready
window.addEventListener('bcagentsdk:ready', (event) => {
  console.log('SDK is ready:', event.detail.sdk);
  // Initialize your agent here
});
```

### Error Handling

```javascript
async function safeCall(fn, ...args) {
  try {
    return { success: true, data: await fn(...args) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Usage
const result = await safeCall(BCAgentSDK.addToCart, {
  productEntityId: 123,
  quantity: 1
});

if (!result.success) {
  console.error('Failed:', result.error);
}
```

---

## Notes

- The SDK automatically persists cart ID in localStorage
- GraphQL mutations are limited to one per request
- Product search requires merchant to have product filtering enabled
- Some filters (rating, in-stock) require Pro/Enterprise plans
- Always handle the case where products require option selection before cart add
