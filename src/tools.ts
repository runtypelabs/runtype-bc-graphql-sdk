/**
 * BigCommerce Storefront Agent SDK - Runtype Local Tools Definitions
 *
 * These tool definitions are designed to be passed to a Runtype flow's
 * runtimeTools configuration. The actual implementations run client-side
 * via the BCAgentSDK on the storefront.
 */

import type { BigCommerceAgentSDK } from './sdk'
import type {
  Product,
  OptionValueId,
  SortOrder,
  UpdateCustomerInput,
  AddCustomerAddressInput,
  WebPagesFiltersInput,
} from './types'

// Tool definition types
export interface ToolParameterSchema {
  type: string
  properties?: Record<string, unknown>
  required?: string[]
  items?: unknown
  enum?: string[]
  default?: unknown
  description?: string
  minimum?: number
  maximum?: number
}

export interface ToolDefinition {
  name: string
  description: string
  toolType: 'local'
  parametersSchema: ToolParameterSchema
  /**
   * Whether the tool only reads data (no mutations / side effects). Drives the
   * widget's WebMCP `autoApprove` gate: read-only tools run silently, mutating
   * tools surface a confirmation bubble.
   */
  readOnly: boolean
}

// Tool result types
export interface ToolResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  errorType?: string
  hint?: string
}

export interface SearchProductsResult extends ToolResult {
  totalItems?: number
  products?: Array<{
    id: number
    name: string
    sku: string
    path: string
    description?: string
    price: unknown
    salePrice: unknown
    imageUrl?: string
    brand?: string
    inStock: boolean
    inventory?: number
  }>
  filters?: unknown[]
  hasMoreResults?: boolean
  nextCursor?: string
}

export interface ProductDetailsResult extends ToolResult {
  product?: {
    id: number
    name: string
    sku: string
    path: string
    description?: string
    shortDescription?: string
    price: unknown
    salePrice: unknown
    retailPrice: unknown
    images?: unknown[]
    brand?: unknown
    categories?: unknown[]
    inStock?: boolean
    stockLevel?: number
    options?: unknown[]
    variants?: unknown[]
    reviews?: unknown
    relatedProducts?: unknown[]
  }
}

export interface CartResult extends ToolResult {
  cart?: {
    isEmpty?: boolean
    cartId?: string
    itemCount?: number
    items?: unknown[]
    subtotal?: unknown
    discounts?: unknown
    total?: unknown
    currencyCode?: string
  }
}

export interface QuickAddResult extends ToolResult {
  requiresConfiguration?: boolean
  message?: string
  product?: {
    id?: number
    name?: string
  }
  requiredOptions?: unknown[]
  addedProduct?: {
    id?: number
    name?: string
    quantity?: number
  }
}

export interface CheckoutResult extends ToolResult {
  redirecting?: boolean
  checkoutUrl?: string
  embeddedCheckoutUrl?: string
  message?: string
}

// Tool Definitions
export const BigCommerceLocalTools = {
  search_products: {
    name: 'search_products',
    description: `Search the BigCommerce product catalog. Use this to find products based on:
- Text search queries (product names, descriptions, SKUs)
- Category filtering (by category ID)
- Brand filtering (by brand IDs)
- Price range filtering (min/max price)
- Rating filtering (min/max rating 1-5)
- Stock availability filtering

Returns matching products with names, prices, images, and availability. Also returns available filter facets for refinement.

Call this FIRST when a user asks about products, wants to browse, or needs product recommendations.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {
        searchTerm: {
          type: 'string',
          description: 'Text search query to find products by name, description, or SKU',
        },
        categoryId: {
          type: 'number',
          description: 'Filter products by a specific category ID',
        },
        categoryIds: {
          type: 'array',
          items: { type: 'number' },
          description: 'Filter products by multiple category IDs',
        },
        brandIds: {
          type: 'array',
          items: { type: 'number' },
          description: 'Filter products by brand IDs',
        },
        price: {
          type: 'object',
          properties: {
            minPrice: { type: 'number', description: 'Minimum price filter' },
            maxPrice: { type: 'number', description: 'Maximum price filter' },
          },
          description: 'Price range filter',
        },
        rating: {
          type: 'object',
          properties: {
            minRating: { type: 'number', minimum: 1, maximum: 5, description: 'Minimum rating (1-5)' },
            maxRating: { type: 'number', minimum: 1, maximum: 5, description: 'Maximum rating (1-5)' },
          },
          description: 'Rating filter (1-5 stars)',
        },
        hideOutOfStock: {
          type: 'boolean',
          description: 'Set to true to hide out-of-stock products',
        },
        first: {
          type: 'number',
          default: 12,
          description: 'Number of products to return (default: 12)',
        },
        sort: {
          type: 'string',
          enum: ['A_TO_Z', 'Z_TO_A', 'LOWEST_PRICE', 'HIGHEST_PRICE', 'NEWEST', 'BEST_SELLING', 'BEST_REVIEWED', 'RELEVANCE'],
          description: 'Sort order for results',
        },
      },
    },
  },

  get_product_details: {
    name: 'get_product_details',
    description: `Get detailed information about a specific product by its ID. Returns:
- Full product name, description, and SKU
- All images
- Pricing (regular, sale, retail prices)
- Product options (size, color, etc.) with available values
- All variants with their specific SKUs and prices
- Inventory/stock status
- Related products
- Customer reviews summary

Use this after search_products to get complete details, or when you have a product ID and need full information before adding to cart.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {
        productId: {
          type: 'number',
          description: 'The product entity ID to retrieve details for',
        },
        variantId: {
          type: 'number',
          description: 'Optional: specific variant ID to get variant-specific details',
        },
      },
      required: ['productId'],
    },
  },

  get_product_by_url: {
    name: 'get_product_by_url',
    description: `Look up a product by its URL path (e.g., "/blue-jacket/" or "blue-jacket"). Use this when:
- User shares a product URL
- You have a product path but not the ID
- Navigating from a link or category page

Returns the same detailed product information as get_product_details.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: "The product URL path (e.g., '/product-name/' or 'product-name')",
        },
      },
      required: ['path'],
    },
  },

  configure_product: {
    name: 'configure_product',
    description: `Get updated product information based on selected options. When a product has options (like Size or Color), selecting different values may change:
- The price
- The availability/stock status
- The product image
- The SKU

Call this when helping a user select options to show them accurate pricing before adding to cart.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {
        productId: {
          type: 'number',
          description: 'The product entity ID',
        },
        selectedOptions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              optionEntityId: { type: 'number', description: 'The option ID (e.g., Size option)' },
              valueEntityId: { type: 'number', description: "The selected value ID (e.g., 'Large' value)" },
            },
            required: ['optionEntityId', 'valueEntityId'],
          },
          description: 'Array of selected option-value pairs',
        },
      },
      required: ['productId', 'selectedOptions'],
    },
  },

  get_cart: {
    name: 'get_cart',
    description: `Get the current shopping cart contents. Returns:
- All items in cart with names, quantities, prices
- Selected options for each item
- Subtotal and total amounts
- Applied discounts
- Whether cart is empty

Call this to check what's in the cart, show cart summary, or before checkout.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {},
    },
  },

  add_to_cart: {
    name: 'add_to_cart',
    description: `Add products to the shopping cart. Supports:
- Simple products (just product ID and quantity)
- Products with options (include variantId or selectedOptions)
- Multiple items at once

IMPORTANT: If a product has required options (like Size), you MUST either:
1. Include the variantId, OR
2. Include selectedOptions with all required option selections

If you're unsure, call get_product_details first to see the required options.

Returns the updated cart on success, or an error if options are missing.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productEntityId: {
                type: 'number',
                description: 'The product ID to add',
              },
              quantity: {
                type: 'number',
                minimum: 1,
                default: 1,
                description: 'Quantity to add (default: 1)',
              },
              variantEntityId: {
                type: 'number',
                description: 'Optional: specific variant ID if product has variants',
              },
              selectedOptions: {
                type: 'object',
                properties: {
                  multipleChoices: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        optionEntityId: { type: 'number' },
                        optionValueEntityId: { type: 'number' },
                      },
                      required: ['optionEntityId', 'optionValueEntityId'],
                    },
                    description: 'Selected multiple choice options (size, color, etc.)',
                  },
                },
                description: 'Selected options for configurable products',
              },
            },
            required: ['productEntityId'],
          },
          description: 'Array of items to add to cart',
        },
      },
      required: ['items'],
    },
  },

  quick_add_to_cart: {
    name: 'quick_add_to_cart',
    description: `Intelligently add a product to cart. This tool:
1. Checks if the product requires option selection
2. If options are provided, finds the matching variant
3. Adds to cart with correct configuration

If the product requires options but none are provided, returns requiresConfiguration=true with the list of required options, allowing you to ask the user to select.

This is the RECOMMENDED way to add products to cart.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {
        productId: {
          type: 'number',
          description: 'The product ID to add',
        },
        quantity: {
          type: 'number',
          minimum: 1,
          default: 1,
          description: 'Quantity to add (default: 1)',
        },
        options: {
          type: 'object',
          additionalProperties: { type: 'number' },
          description: 'Selected options as { optionId: valueId } pairs. Get option/value IDs from get_product_details.',
        },
      },
      required: ['productId'],
    },
  },

  update_cart_item: {
    name: 'update_cart_item',
    description: `Update the quantity of an item already in the cart. Use the lineItemEntityId from get_cart results.

To remove an item completely, use remove_from_cart instead.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {
        lineItemEntityId: {
          type: 'string',
          description: 'The line item ID from the cart (get this from get_cart)',
        },
        quantity: {
          type: 'number',
          minimum: 1,
          description: 'New quantity for the item',
        },
      },
      required: ['lineItemEntityId', 'quantity'],
    },
  },

  remove_from_cart: {
    name: 'remove_from_cart',
    description: 'Remove an item from the cart completely. Use the lineItemEntityId from get_cart results.',
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {
        lineItemEntityId: {
          type: 'string',
          description: 'The line item ID to remove (get this from get_cart)',
        },
      },
      required: ['lineItemEntityId'],
    },
  },

  clear_cart: {
    name: 'clear_cart',
    description: 'Delete the entire cart and all its contents. Use when user wants to start over or empty their cart.',
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {},
    },
  },

  proceed_to_checkout: {
    name: 'proceed_to_checkout',
    description: `Get the checkout URL or redirect the user to checkout.

Call this when the user is ready to complete their purchase. Returns the checkout URL that can be shared with the user, or automatically redirects them.

Note: Actual payment processing happens on BigCommerce's checkout page, not through this tool.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {
        redirect: {
          type: 'boolean',
          default: false,
          description: 'If true, immediately redirects user to checkout. If false, just returns the URL.',
        },
        embedded: {
          type: 'boolean',
          default: false,
          description: 'If true, returns embedded checkout URL for iframe use',
        },
      },
    },
  },

  get_categories: {
    name: 'get_categories',
    description: `Get the store's category tree structure. Returns categories with:
- Category names and IDs
- URL paths
- Product counts
- Child categories (nested)

Use this to help users browse by category or to understand the store's organization.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {
        depth: {
          type: 'number',
          default: 3,
          description: 'How deep to fetch the category tree (default: 3 levels)',
        },
      },
    },
  },

  get_store_info: {
    name: 'get_store_info',
    description: `Get store information including:
- Store name
- Contact information
- Logo
- Available currencies
- Social media links

Use this to answer questions about the store itself.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ---------------------------------------------------------------------------
  // Customer Account Tools
  // ---------------------------------------------------------------------------

  check_login_status: {
    name: 'check_login_status',
    description: `Check if a customer is currently logged in to the store. Returns customer profile if logged in, or null if not.

Use this FIRST before any customer account operations to verify the user is authenticated.

If not logged in, you should guide the user to log in before accessing account features.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {},
    },
  },

  get_customer_profile: {
    name: 'get_customer_profile',
    description: `Get the current logged-in customer's profile information including:
- Name (first and last)
- Email address
- Phone number
- Company name
- Customer group
- Store credit balance
- Number of saved addresses

Use this when the user asks about their account, profile, or personal information.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {},
    },
  },

  update_customer_profile: {
    name: 'update_customer_profile',
    description: `Update the logged-in customer's profile information. Can update:
- First name
- Last name
- Email address
- Phone number
- Company name

Requires customer to be logged in.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          description: "Customer's first name",
        },
        lastName: {
          type: 'string',
          description: "Customer's last name",
        },
        email: {
          type: 'string',
          description: "Customer's email address",
        },
        phone: {
          type: 'string',
          description: "Customer's phone number",
        },
        company: {
          type: 'string',
          description: "Customer's company name",
        },
      },
    },
  },

  get_customer_addresses: {
    name: 'get_customer_addresses',
    description: `Get all saved addresses for the logged-in customer. Returns address book with:
- Full address details (street, city, state, zip, country)
- Contact name and phone for each address
- Address ID for use in orders or updates

Use when user asks about their addresses, shipping addresses, or address book.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {},
    },
  },

  add_customer_address: {
    name: 'add_customer_address',
    description: `Add a new address to the customer's address book. Required fields:
- firstName, lastName
- address1, city, stateOrProvince, postalCode, countryCode

Optional: address2, company, phone

Use when user wants to save a new shipping or billing address.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', description: 'First name for this address' },
        lastName: { type: 'string', description: 'Last name for this address' },
        address1: { type: 'string', description: 'Street address line 1' },
        address2: { type: 'string', description: 'Street address line 2 (optional)' },
        city: { type: 'string', description: 'City' },
        stateOrProvince: { type: 'string', description: 'State or province' },
        postalCode: { type: 'string', description: 'ZIP or postal code' },
        countryCode: { type: 'string', description: 'Two-letter country code (e.g., US, CA, GB)' },
        company: { type: 'string', description: 'Company name (optional)' },
        phone: { type: 'string', description: 'Phone number (optional)' },
      },
      required: ['firstName', 'lastName', 'address1', 'city', 'stateOrProvince', 'postalCode', 'countryCode'],
    },
  },

  update_customer_address: {
    name: 'update_customer_address',
    description: `Update an existing address in the customer's address book. Requires the addressEntityId.

Get the addressEntityId from get_customer_addresses first.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {
        addressEntityId: { type: 'number', description: 'The address ID to update (from get_customer_addresses)' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        address1: { type: 'string' },
        address2: { type: 'string' },
        city: { type: 'string' },
        stateOrProvince: { type: 'string' },
        postalCode: { type: 'string' },
        countryCode: { type: 'string' },
        company: { type: 'string' },
        phone: { type: 'string' },
      },
      required: ['addressEntityId'],
    },
  },

  delete_customer_address: {
    name: 'delete_customer_address',
    description: `Delete an address from the customer's address book. Requires the addressEntityId.

Get the addressEntityId from get_customer_addresses first.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {
        addressEntityId: {
          type: 'number',
          description: 'The address ID to delete (from get_customer_addresses)',
        },
      },
      required: ['addressEntityId'],
    },
  },

  get_order_history: {
    name: 'get_order_history',
    description: `Get the customer's order history. Returns a list of orders with:
- Order ID and date
- Order status (e.g., Pending, Shipped, Completed)
- Order total

Use when user asks "what are my orders", "show my order history", "did my order ship", etc.

For full order details, use get_order_details with a specific order ID.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          default: 20,
          description: 'Maximum number of orders to return (default: 20)',
        },
      },
    },
  },

  get_order_details: {
    name: 'get_order_details',
    description: `Get detailed information about a specific order including:
- All items ordered with quantities and prices
- Billing and shipping addresses
- Shipping cost and tax
- Order status and any customer notes
- Tracking information (if available)

Use when user asks about a specific order, "where is my order", or needs invoice/receipt details.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {
        orderId: {
          type: 'number',
          description: 'The order ID to get details for (from get_order_history)',
        },
      },
      required: ['orderId'],
    },
  },

  get_wishlists: {
    name: 'get_wishlists',
    description: `Get all of the customer's wishlists with their items. Returns:
- Wishlist names and IDs
- Products in each wishlist with names, prices, and images
- Whether each wishlist is public or private

Use when user asks about their wishlist, saved items, or favorites.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {},
    },
  },

  add_to_wishlist: {
    name: 'add_to_wishlist',
    description: `Add a product to one of the customer's wishlists.

Requires the wishlistEntityId (from get_wishlists) and productEntityId.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {
        wishlistEntityId: {
          type: 'number',
          description: 'The wishlist ID to add to (from get_wishlists)',
        },
        productEntityId: {
          type: 'number',
          description: 'The product ID to add',
        },
        variantEntityId: {
          type: 'number',
          description: 'Optional: specific variant ID if product has variants',
        },
      },
      required: ['wishlistEntityId', 'productEntityId'],
    },
  },

  remove_from_wishlist: {
    name: 'remove_from_wishlist',
    description: `Remove items from a wishlist.

Requires the wishlistEntityId and the itemEntityIds (wishlist item IDs, not product IDs).`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {
        wishlistEntityId: {
          type: 'number',
          description: 'The wishlist ID (from get_wishlists)',
        },
        itemEntityIds: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of wishlist item IDs to remove (from get_wishlists items)',
        },
      },
      required: ['wishlistEntityId', 'itemEntityIds'],
    },
  },

  get_web_pages: {
    name: 'get_web_pages',
    description: `List the store's web content pages (policies, FAQs, About, Contact, blog index, etc.). Returns:
- Page name, type, and path/link
- A short plain-text summary of each page

Use this FIRST to discover which page answers a policy/shipping/returns/FAQ question, then call get_web_page for the full content.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {
        entityIds: {
          type: 'array',
          items: { type: 'number' },
          description: 'Optional: only return pages with these entity IDs',
        },
        pageType: {
          type: 'string',
          enum: ['NormalPage', 'ContactPage', 'ExternalLinkPage', 'BlogIndexPage', 'RawPage'],
          description: 'Optional: filter by page type',
        },
      },
    },
  },

  get_web_page: {
    name: 'get_web_page',
    description: `Get the full content of a single web content page by its entity ID. Returns the page name, path, plain-text summary, and full HTML body.

Use this after get_web_pages to read a page's content so you can answer policy/shipping/returns/FAQ questions directly without sending the customer away.`,
    toolType: 'local' as const,
    parametersSchema: {
      type: 'object',
      properties: {
        entityId: {
          type: 'number',
          description: 'The web page entity ID to retrieve (from get_web_pages)',
        },
      },
      required: ['entityId'],
    },
  },
} as const

/**
 * Names of the read-only tools (no mutations / side effects). The widget's
 * WebMCP `autoApprove` gate uses this set: read-only tools run silently while
 * everything else surfaces a confirmation bubble. Keep in sync with the
 * `readOnly` flags applied in {@link getAllToolDefinitions}.
 */
export const READ_ONLY_TOOL_NAMES = [
  'search_products',
  'get_product_details',
  'get_product_by_url',
  'configure_product',
  'get_cart',
  'get_categories',
  'get_store_info',
  'check_login_status',
  'get_customer_profile',
  'get_customer_addresses',
  'get_order_history',
  'get_order_details',
  'get_wishlists',
  'get_web_pages',
  'get_web_page',
] as const

const READ_ONLY_TOOL_SET = new Set<string>(READ_ONLY_TOOL_NAMES)

// Helper to get all tool definitions as array, with read-only flags applied
export function getAllToolDefinitions(): ToolDefinition[] {
  return Object.values(BigCommerceLocalTools).map((tool) => ({
    ...tool,
    readOnly: READ_ONLY_TOOL_SET.has(tool.name),
  })) as ToolDefinition[]
}

// Tool argument types
interface SearchProductsArgs {
  searchTerm?: string
  categoryId?: number
  categoryIds?: number[]
  brandIds?: number[]
  price?: { minPrice?: number; maxPrice?: number }
  rating?: { minRating?: number; maxRating?: number }
  hideOutOfStock?: boolean
  first?: number
  sort?: SortOrder
}

interface GetProductDetailsArgs {
  productId: number
  variantId?: number
}

interface GetProductByUrlArgs {
  path: string
}

interface ConfigureProductArgs {
  productId: number
  selectedOptions: OptionValueId[]
}

interface AddToCartArgs {
  items: Array<{
    productEntityId: number
    quantity?: number
    variantEntityId?: number
    selectedOptions?: {
      multipleChoices?: Array<{
        optionEntityId: number
        optionValueEntityId: number
      }>
    }
  }>
}

interface QuickAddToCartArgs {
  productId: number
  quantity?: number
  options?: Record<number, number>
}

interface UpdateCartItemArgs {
  lineItemEntityId: string
  quantity: number
}

interface RemoveFromCartArgs {
  lineItemEntityId: string
}

interface ProceedToCheckoutArgs {
  redirect?: boolean
  embedded?: boolean
}

interface GetCategoriesArgs {
  depth?: number
}

// Local tool implementations factory
export function createLocalToolImplementations(sdk: BigCommerceAgentSDK) {
  return {
    async search_products(args: SearchProductsArgs): Promise<SearchProductsResult> {
      try {
        const result = await sdk.searchProducts({
          searchTerm: args.searchTerm,
          categoryId: args.categoryId,
          categoryIds: args.categoryIds,
          brandIds: args.brandIds,
          price: args.price,
          rating: args.rating,
          hideOutOfStock: args.hideOutOfStock,
          first: args.first || 12,
          sort: args.sort,
        })

        return {
          success: true,
          totalItems: result.totalItems,
          products: result.products.map((p: Product) => ({
            id: p.entityId,
            name: p.name,
            sku: p.sku,
            path: p.path,
            description: p.plainTextDescription || p.description?.substring(0, 200),
            price: p.prices?.price,
            salePrice: p.prices?.salePrice,
            imageUrl: p.defaultImage?.url,
            brand: p.brand?.name,
            inStock: p.availabilityV2?.status === 'Available',
            inventory: p.inventory?.aggregated?.availableToSell,
          })),
          filters: result.filters,
          hasMoreResults: result.pageInfo?.hasNextPage || false,
          nextCursor: result.pageInfo?.endCursor,
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'SEARCH_ERROR',
        }
      }
    },

    async get_product_details(args: GetProductDetailsArgs): Promise<ProductDetailsResult> {
      try {
        const product = await sdk.getProductById(args.productId, args.variantId)

        if (!product) {
          return {
            success: false,
            error: `Product with ID ${args.productId} not found`,
            errorType: 'NOT_FOUND',
          }
        }

        return {
          success: true,
          product: {
            id: product.entityId,
            name: product.name,
            sku: product.sku,
            path: product.path,
            description: product.description,
            shortDescription: product.plainTextDescription?.substring(0, 300),
            price: product.prices?.price,
            salePrice: product.prices?.salePrice,
            retailPrice: product.prices?.retailPrice,
            images: product.images?.map((img) => ({
              url: img.url,
              altText: img.altText,
              isDefault: img.isDefault,
            })),
            brand: product.brand,
            categories: product.categories,
            inStock: product.inventory?.isInStock,
            stockLevel: product.inventory?.aggregated?.availableToSell,
            options: product.productOptions?.map((opt) => ({
              id: opt.entityId,
              name: opt.displayName,
              required: opt.isRequired,
              isVariantOption: opt.isVariantOption,
              type: opt.displayStyle || 'dropdown',
              values: opt.values?.map((v) => ({
                id: v.entityId,
                label: v.label,
                isDefault: v.isDefault,
                hexColors: v.hexColors,
                imageUrl: v.imageUrl,
              })),
            })),
            variants: product.variants?.map((v) => ({
              id: v.entityId,
              sku: v.sku,
              price: v.prices?.price,
              salePrice: v.prices?.salePrice,
              inStock: v.inventory?.isInStock,
              stockLevel: v.inventory?.aggregated?.availableToSell,
              options: v.options?.flatMap((o) =>
                o.values?.map((val) => ({
                  optionId: o.entityId,
                  optionName: o.displayName,
                  valueId: val.entityId,
                  valueLabel: val.label,
                }))
              ),
            })),
            reviews: product.reviewSummary,
            relatedProducts: product.relatedProducts?.slice(0, 5).map((rp) => ({
              id: rp.entityId,
              name: rp.name,
              path: rp.path,
              price: rp.prices?.price,
              imageUrl: rp.defaultImage?.url,
            })),
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'FETCH_ERROR',
        }
      }
    },

    async get_product_by_url(args: GetProductByUrlArgs): Promise<ProductDetailsResult> {
      try {
        const product = await sdk.getProductByPath(args.path)

        if (!product) {
          return {
            success: false,
            error: `No product found at path: ${args.path}`,
            errorType: 'NOT_FOUND',
          }
        }

        return {
          success: true,
          product: {
            id: product.entityId,
            name: product.name,
            sku: product.sku,
            path: product.path,
            description: product.description,
            price: product.prices?.price,
            salePrice: product.prices?.salePrice,
            retailPrice: product.prices?.retailPrice,
            images: product.images,
            brand: product.brand,
            inStock: product.inventory?.isInStock,
            options: product.productOptions?.map((opt) => ({
              id: opt.entityId,
              name: opt.displayName,
              required: opt.isRequired,
              values: opt.values,
            })),
            variants: product.variants,
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'FETCH_ERROR',
        }
      }
    },

    async configure_product(args: ConfigureProductArgs): Promise<ToolResult> {
      try {
        const configured = await sdk.getConfiguredProduct(args.productId, args.selectedOptions)

        if (!configured) {
          return {
            success: false,
            error: 'Failed to configure product with selected options',
            errorType: 'CONFIGURATION_ERROR',
          }
        }

        return {
          success: true,
          data: {
            id: configured.entityId,
            name: configured.name,
            sku: configured.sku,
            price: configured.prices?.price,
            salePrice: configured.prices?.salePrice,
            inStock: configured.inventory?.isInStock,
            stockLevel: configured.inventory?.aggregated?.availableToSell,
            imageUrl: configured.defaultImage?.url,
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'CONFIGURATION_ERROR',
        }
      }
    },

    async get_cart(): Promise<CartResult> {
      try {
        const summary = await sdk.getCartSummary()

        return {
          success: true,
          cart: {
            isEmpty: summary.isEmpty,
            cartId: summary.cartId,
            itemCount: summary.itemCount,
            items: summary.items,
            subtotal: summary.subtotal,
            discounts: summary.discounts,
            total: summary.total,
            currencyCode: summary.currencyCode,
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'CART_ERROR',
        }
      }
    },

    async add_to_cart(args: AddToCartArgs): Promise<CartResult> {
      try {
        const items = args.items.map((item) => ({
          productEntityId: item.productEntityId,
          quantity: item.quantity || 1,
          variantEntityId: item.variantEntityId,
          selectedOptions: item.selectedOptions,
        }))

        const cart = await sdk.addToCart(items)

        return {
          success: true,
          cart: {
            cartId: cart?.entityId,
            itemCount: cart?.lineItems?.totalQuantity,
            total: cart?.amount,
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'ADD_TO_CART_ERROR',
          hint: 'If the product has required options, make sure to include variantEntityId or selectedOptions',
        }
      }
    },

    async quick_add_to_cart(args: QuickAddToCartArgs): Promise<QuickAddResult> {
      try {
        const result = await sdk.quickAddToCart(args.productId, args.quantity || 1, args.options || {})

        if (result.requiresConfiguration) {
          return {
            success: false,
            requiresConfiguration: true,
            message: result.message,
            product: {
              id: result.product?.entityId,
              name: result.product?.name,
            },
            requiredOptions: result.requiredOptions?.map((opt) => ({
              id: opt.entityId,
              name: opt.displayName,
              values: opt.values?.map((v) => ({
                id: v.entityId,
                label: v.label,
              })),
            })),
            errorType: 'OPTIONS_REQUIRED',
          }
        }

        return {
          success: true,
          addedProduct: {
            id: result.product?.entityId,
            name: result.product?.name,
            quantity: result.addedQuantity,
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'ADD_TO_CART_ERROR',
        }
      }
    },

    async update_cart_item(args: UpdateCartItemArgs): Promise<CartResult> {
      try {
        const cart = await sdk.updateCartItem(args.lineItemEntityId, args.quantity)

        return {
          success: true,
          cart: {
            cartId: cart?.entityId,
            itemCount: cart?.lineItems?.totalQuantity,
            total: cart?.amount,
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'UPDATE_ERROR',
        }
      }
    },

    async remove_from_cart(args: RemoveFromCartArgs): Promise<CartResult> {
      try {
        const cart = await sdk.removeFromCart(args.lineItemEntityId)

        return {
          success: true,
          cart: {
            cartId: cart?.entityId,
            itemCount: cart?.lineItems?.totalQuantity,
            total: cart?.amount,
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'REMOVE_ERROR',
        }
      }
    },

    async clear_cart(): Promise<ToolResult> {
      try {
        await sdk.deleteCart()

        return {
          success: true,
          data: { message: 'Cart has been cleared' },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'CLEAR_ERROR',
        }
      }
    },

    async proceed_to_checkout(args: ProceedToCheckoutArgs): Promise<CheckoutResult> {
      try {
        const urls = await sdk.getCheckoutUrls()

        if (args.redirect && typeof window !== 'undefined') {
          const url = args.embedded ? urls.embeddedCheckoutUrl : urls.redirectedCheckoutUrl
          window.location.href = url
          return {
            success: true,
            redirecting: true,
            checkoutUrl: url,
          }
        }

        return {
          success: true,
          checkoutUrl: urls.redirectedCheckoutUrl,
          embeddedCheckoutUrl: urls.embeddedCheckoutUrl,
          message: 'Checkout URLs generated. Share the checkoutUrl with the user or redirect them.',
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'CHECKOUT_ERROR',
          hint: 'Make sure there are items in the cart before proceeding to checkout',
        }
      }
    },

    async get_categories(args: GetCategoriesArgs): Promise<ToolResult> {
      try {
        const categories = await sdk.getCategoryTree(args.depth || 3)

        const formatCategory = (cat: {
          entityId: number
          name: string
          path: string
          productCount?: number
          hasChildren?: boolean
          children?: unknown[]
        }): unknown => ({
          id: cat.entityId,
          name: cat.name,
          path: cat.path,
          productCount: cat.productCount,
          hasChildren: cat.hasChildren,
          children: cat.children?.map(formatCategory as (c: unknown) => unknown),
        })

        return {
          success: true,
          data: { categories: categories.map(formatCategory) },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'CATEGORY_ERROR',
        }
      }
    },

    async get_store_info(): Promise<ToolResult> {
      try {
        const { settings, currencies } = await sdk.getStoreSettings()

        return {
          success: true,
          data: {
            store: {
              name: settings?.storeName,
              url: settings?.url?.vanityUrl,
              contact: settings?.contact,
              logo: settings?.logo,
              socialLinks: settings?.socialMediaLinks,
            },
            currencies: currencies?.map((c) => ({
              code: c.code,
              name: c.name,
              symbol: c.display?.symbol,
              isDefault: c.isDefault,
            })),
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'STORE_INFO_ERROR',
        }
      }
    },

    // -------------------------------------------------------------------------
    // Customer Account Tool Implementations
    // -------------------------------------------------------------------------

    async check_login_status(): Promise<ToolResult> {
      try {
        const customer = await sdk.isLoggedIn()

        if (!customer) {
          return {
            success: true,
            data: {
              isLoggedIn: false,
              message: 'Customer is not logged in. Please log in to access account features.',
            },
          }
        }

        return {
          success: true,
          data: {
            isLoggedIn: true,
            customer: {
              id: customer.entityId,
              email: customer.email,
              firstName: customer.firstName,
              lastName: customer.lastName,
            },
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'AUTH_CHECK_ERROR',
        }
      }
    },

    async get_customer_profile(): Promise<ToolResult> {
      try {
        const customer = await sdk.getCustomer()

        if (!customer) {
          return {
            success: false,
            error: 'Not logged in',
            errorType: 'NOT_LOGGED_IN',
            hint: 'Customer must be logged in to view profile',
          }
        }

        return {
          success: true,
          data: {
            id: customer.entityId,
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone,
            company: customer.company,
            customerGroup: customer.customerGroupName,
            storeCredit: customer.storeCredit,
            addressCount: customer.addressCount,
            isSubscribedToNewsletter: customer.isSubscribedToNewsletter,
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'PROFILE_ERROR',
        }
      }
    },

    async update_customer_profile(args: UpdateCustomerInput): Promise<ToolResult> {
      try {
        const updated = await sdk.updateCustomer(args)

        if (!updated) {
          return {
            success: false,
            error: 'Failed to update profile',
            errorType: 'UPDATE_ERROR',
          }
        }

        return {
          success: true,
          data: {
            message: 'Profile updated successfully',
            customer: {
              firstName: updated.firstName,
              lastName: updated.lastName,
              email: updated.email,
              phone: updated.phone,
              company: updated.company,
            },
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'UPDATE_ERROR',
        }
      }
    },

    async get_customer_addresses(): Promise<ToolResult> {
      try {
        const addresses = await sdk.getCustomerAddresses()

        return {
          success: true,
          data: {
            addressCount: addresses.length,
            addresses: addresses.map((addr) => ({
              id: addr.entityId,
              name: `${addr.firstName} ${addr.lastName}`,
              address1: addr.address1,
              address2: addr.address2,
              city: addr.city,
              stateOrProvince: addr.stateOrProvince,
              postalCode: addr.postalCode,
              countryCode: addr.countryCode,
              company: addr.company,
              phone: addr.phone,
            })),
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'ADDRESS_ERROR',
        }
      }
    },

    async add_customer_address(args: AddCustomerAddressInput): Promise<ToolResult> {
      try {
        const address = await sdk.addCustomerAddress(args)

        if (!address) {
          return {
            success: false,
            error: 'Failed to add address',
            errorType: 'ADD_ADDRESS_ERROR',
          }
        }

        return {
          success: true,
          data: {
            message: 'Address added successfully',
            address: {
              id: address.entityId,
              fullAddress: `${address.address1}, ${address.city}, ${address.stateOrProvince} ${address.postalCode}`,
            },
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'ADD_ADDRESS_ERROR',
        }
      }
    },

    async update_customer_address(
      args: { addressEntityId: number } & Partial<AddCustomerAddressInput>
    ): Promise<ToolResult> {
      try {
        const { addressEntityId, ...input } = args
        const address = await sdk.updateCustomerAddress(addressEntityId, input)

        if (!address) {
          return {
            success: false,
            error: 'Failed to update address',
            errorType: 'UPDATE_ADDRESS_ERROR',
          }
        }

        return {
          success: true,
          data: {
            message: 'Address updated successfully',
            address: {
              id: address.entityId,
            },
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'UPDATE_ADDRESS_ERROR',
        }
      }
    },

    async delete_customer_address(args: { addressEntityId: number }): Promise<ToolResult> {
      try {
        const deletedId = await sdk.deleteCustomerAddress(args.addressEntityId)

        return {
          success: true,
          data: {
            message: 'Address deleted successfully',
            deletedAddressId: deletedId,
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'DELETE_ADDRESS_ERROR',
        }
      }
    },

    async get_order_history(args: { limit?: number }): Promise<ToolResult> {
      try {
        const orders = await sdk.getCustomerOrders(args.limit || 20)

        if (orders.length === 0) {
          return {
            success: true,
            data: {
              orderCount: 0,
              orders: [],
              message: 'No orders found',
            },
          }
        }

        return {
          success: true,
          data: {
            orderCount: orders.length,
            orders: orders.map((order) => ({
              id: order.entityId,
              date: order.orderedAt,
              status: order.status,
              total: order.total,
            })),
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'ORDER_HISTORY_ERROR',
        }
      }
    },

    async get_order_details(args: { orderId: number }): Promise<ToolResult> {
      try {
        const order = await sdk.getOrderDetails(args.orderId)

        if (!order) {
          return {
            success: false,
            error: `Order ${args.orderId} not found`,
            errorType: 'NOT_FOUND',
          }
        }

        return {
          success: true,
          data: {
            id: order.entityId,
            date: order.orderedAt,
            status: order.status,
            billingAddress: order.billingAddress,
            consignments: order.consignments,
            subTotal: order.subTotal,
            shippingTotal: order.shippingCostTotal,
            taxTotal: order.taxTotal,
            total: order.totalIncTax,
            customerMessage: order.customerMessage,
            discounts: order.discounts,
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'ORDER_DETAILS_ERROR',
        }
      }
    },

    async get_wishlists(): Promise<ToolResult> {
      try {
        const wishlists = await sdk.getCustomerWishlists()

        return {
          success: true,
          data: {
            wishlistCount: wishlists.length,
            wishlists: wishlists.map((wl) => ({
              id: wl.entityId,
              name: wl.name,
              isPublic: wl.isPublic,
              itemCount: wl.items.length,
              items: wl.items.map((item) => ({
                itemId: item.entityId,
                product: {
                  id: item.product.entityId,
                  name: item.product.name,
                  path: item.product.path,
                  price: item.product.prices?.price,
                  imageUrl: item.product.defaultImage?.url,
                },
                variantId: item.variantEntityId,
              })),
            })),
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'WISHLIST_ERROR',
        }
      }
    },

    async add_to_wishlist(args: {
      wishlistEntityId: number
      productEntityId: number
      variantEntityId?: number
    }): Promise<ToolResult> {
      try {
        const result = await sdk.addToWishlist(args.wishlistEntityId, [
          {
            productEntityId: args.productEntityId,
            variantEntityId: args.variantEntityId,
          },
        ])

        return {
          success: true,
          data: {
            message: 'Item added to wishlist',
            wishlistId: result?.entityId,
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'ADD_WISHLIST_ERROR',
        }
      }
    },

    async remove_from_wishlist(args: {
      wishlistEntityId: number
      itemEntityIds: number[]
    }): Promise<ToolResult> {
      try {
        const result = await sdk.removeFromWishlist(args.wishlistEntityId, args.itemEntityIds)

        return {
          success: true,
          data: {
            message: 'Items removed from wishlist',
            wishlistId: result?.entityId,
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'REMOVE_WISHLIST_ERROR',
        }
      }
    },

    async get_web_pages(args: WebPagesFiltersInput = {}): Promise<ToolResult> {
      try {
        const pages = await sdk.getWebPages({
          entityIds: args.entityIds,
          pageType: args.pageType,
        })

        return {
          success: true,
          data: {
            pageCount: pages.length,
            pages: pages.map((page) => ({
              id: page.entityId,
              name: page.name,
              type: page.type,
              path: page.path,
              link: page.link,
              summary: page.plainTextSummary,
            })),
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'WEB_PAGES_ERROR',
        }
      }
    },

    async get_web_page(args: { entityId: number }): Promise<ToolResult> {
      try {
        const page = await sdk.getWebPage(args.entityId)

        if (!page) {
          return {
            success: false,
            error: `Web page with ID ${args.entityId} not found`,
            errorType: 'NOT_FOUND',
          }
        }

        return {
          success: true,
          data: {
            id: page.entityId,
            name: page.name,
            type: page.type,
            path: page.path,
            summary: page.plainTextSummary,
            htmlBody: page.htmlBody,
            parentId: page.parentEntityId,
          },
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          errorType: 'WEB_PAGE_ERROR',
        }
      }
    },
  }
}
