/**
 * BigCommerce Storefront Agent SDK - Runtype Local Tools Definitions
 * 
 * These tool definitions are designed to be passed to a Runtype flow's
 * runtimeTools configuration. The actual implementations run client-side
 * via the BCAgentSDK on the storefront.
 * 
 * @version 1.0.0
 */

// ============================================================================
// TOOL DEFINITIONS (for Runtype flow configuration)
// ============================================================================

export const BigCommerceLocalTools = {
  
  /**
   * Search Products Tool
   * Searches the product catalog with text queries and faceted filters
   */
  search_products: {
    name: "search_products",
    description: `Search the BigCommerce product catalog. Use this to find products based on:
- Text search queries (product names, descriptions, SKUs)
- Category filtering (by category ID)
- Brand filtering (by brand IDs)
- Price range filtering (min/max price)
- Rating filtering (min/max rating 1-5)
- Stock availability filtering

Returns matching products with names, prices, images, and availability. Also returns available filter facets for refinement.

Call this FIRST when a user asks about products, wants to browse, or needs product recommendations.`,
    toolType: "local" as const,
    parametersSchema: {
      type: "object",
      properties: {
        searchTerm: {
          type: "string",
          description: "Text search query to find products by name, description, or SKU"
        },
        categoryId: {
          type: "number",
          description: "Filter products by a specific category ID"
        },
        categoryIds: {
          type: "array",
          items: { type: "number" },
          description: "Filter products by multiple category IDs"
        },
        brandIds: {
          type: "array",
          items: { type: "number" },
          description: "Filter products by brand IDs"
        },
        price: {
          type: "object",
          properties: {
            minPrice: { type: "number", description: "Minimum price filter" },
            maxPrice: { type: "number", description: "Maximum price filter" }
          },
          description: "Price range filter"
        },
        rating: {
          type: "object",
          properties: {
            minRating: { type: "number", minimum: 1, maximum: 5, description: "Minimum rating (1-5)" },
            maxRating: { type: "number", minimum: 1, maximum: 5, description: "Maximum rating (1-5)" }
          },
          description: "Rating filter (1-5 stars)"
        },
        hideOutOfStock: {
          type: "boolean",
          description: "Set to true to hide out-of-stock products"
        },
        first: {
          type: "number",
          default: 12,
          description: "Number of products to return (default: 12)"
        },
        sort: {
          type: "string",
          enum: ["A_TO_Z", "Z_TO_A", "LOWEST_PRICE", "HIGHEST_PRICE", "NEWEST", "BEST_SELLING", "BEST_REVIEWED", "RELEVANCE"],
          description: "Sort order for results"
        }
      }
    }
  },

  /**
   * Get Product Details Tool
   * Retrieves full product information including options and variants
   */
  get_product_details: {
    name: "get_product_details",
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
    toolType: "local" as const,
    parametersSchema: {
      type: "object",
      properties: {
        productId: {
          type: "number",
          description: "The product entity ID to retrieve details for"
        },
        variantId: {
          type: "number",
          description: "Optional: specific variant ID to get variant-specific details"
        }
      },
      required: ["productId"]
    }
  },

  /**
   * Get Product by URL Tool
   * Looks up a product by its storefront URL path
   */
  get_product_by_url: {
    name: "get_product_by_url",
    description: `Look up a product by its URL path (e.g., "/blue-jacket/" or "blue-jacket"). Use this when:
- User shares a product URL
- You have a product path but not the ID
- Navigating from a link or category page

Returns the same detailed product information as get_product_details.`,
    toolType: "local" as const,
    parametersSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "The product URL path (e.g., '/product-name/' or 'product-name')"
        }
      },
      required: ["path"]
    }
  },

  /**
   * Configure Product Tool
   * Gets updated pricing/availability based on option selections
   */
  configure_product: {
    name: "configure_product",
    description: `Get updated product information based on selected options. When a product has options (like Size or Color), selecting different values may change:
- The price
- The availability/stock status
- The product image
- The SKU

Call this when helping a user select options to show them accurate pricing before adding to cart.`,
    toolType: "local" as const,
    parametersSchema: {
      type: "object",
      properties: {
        productId: {
          type: "number",
          description: "The product entity ID"
        },
        selectedOptions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              optionEntityId: { type: "number", description: "The option ID (e.g., Size option)" },
              valueEntityId: { type: "number", description: "The selected value ID (e.g., 'Large' value)" }
            },
            required: ["optionEntityId", "valueEntityId"]
          },
          description: "Array of selected option-value pairs"
        }
      },
      required: ["productId", "selectedOptions"]
    }
  },

  /**
   * Get Cart Tool
   * Retrieves the current shopping cart contents
   */
  get_cart: {
    name: "get_cart",
    description: `Get the current shopping cart contents. Returns:
- All items in cart with names, quantities, prices
- Selected options for each item
- Subtotal and total amounts
- Applied discounts
- Whether cart is empty

Call this to check what's in the cart, show cart summary, or before checkout.`,
    toolType: "local" as const,
    parametersSchema: {
      type: "object",
      properties: {}
    }
  },

  /**
   * Add to Cart Tool
   * Adds one or more products to the shopping cart
   */
  add_to_cart: {
    name: "add_to_cart",
    description: `Add products to the shopping cart. Supports:
- Simple products (just product ID and quantity)
- Products with options (include variantId or selectedOptions)
- Multiple items at once

IMPORTANT: If a product has required options (like Size), you MUST either:
1. Include the variantId, OR
2. Include selectedOptions with all required option selections

If you're unsure, call get_product_details first to see the required options.

Returns the updated cart on success, or an error if options are missing.`,
    toolType: "local" as const,
    parametersSchema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              productEntityId: {
                type: "number",
                description: "The product ID to add"
              },
              quantity: {
                type: "number",
                minimum: 1,
                default: 1,
                description: "Quantity to add (default: 1)"
              },
              variantEntityId: {
                type: "number",
                description: "Optional: specific variant ID if product has variants"
              },
              selectedOptions: {
                type: "object",
                properties: {
                  multipleChoices: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        optionEntityId: { type: "number" },
                        optionValueEntityId: { type: "number" }
                      },
                      required: ["optionEntityId", "optionValueEntityId"]
                    },
                    description: "Selected multiple choice options (size, color, etc.)"
                  }
                },
                description: "Selected options for configurable products"
              }
            },
            required: ["productEntityId"]
          },
          description: "Array of items to add to cart"
        }
      },
      required: ["items"]
    }
  },

  /**
   * Quick Add to Cart Tool
   * Smart add-to-cart that handles product configuration automatically
   */
  quick_add_to_cart: {
    name: "quick_add_to_cart",
    description: `Intelligently add a product to cart. This tool:
1. Checks if the product requires option selection
2. If options are provided, finds the matching variant
3. Adds to cart with correct configuration

If the product requires options but none are provided, returns requiresConfiguration=true with the list of required options, allowing you to ask the user to select.

This is the RECOMMENDED way to add products to cart.`,
    toolType: "local" as const,
    parametersSchema: {
      type: "object",
      properties: {
        productId: {
          type: "number",
          description: "The product ID to add"
        },
        quantity: {
          type: "number",
          minimum: 1,
          default: 1,
          description: "Quantity to add (default: 1)"
        },
        options: {
          type: "object",
          additionalProperties: { type: "number" },
          description: "Selected options as { optionId: valueId } pairs. Get option/value IDs from get_product_details."
        }
      },
      required: ["productId"]
    }
  },

  /**
   * Update Cart Item Tool
   * Changes the quantity of an item in the cart
   */
  update_cart_item: {
    name: "update_cart_item",
    description: `Update the quantity of an item already in the cart. Use the lineItemEntityId from get_cart results.

To remove an item completely, use remove_from_cart instead.`,
    toolType: "local" as const,
    parametersSchema: {
      type: "object",
      properties: {
        lineItemEntityId: {
          type: "string",
          description: "The line item ID from the cart (get this from get_cart)"
        },
        quantity: {
          type: "number",
          minimum: 1,
          description: "New quantity for the item"
        }
      },
      required: ["lineItemEntityId", "quantity"]
    }
  },

  /**
   * Remove from Cart Tool
   * Removes an item from the shopping cart
   */
  remove_from_cart: {
    name: "remove_from_cart",
    description: `Remove an item from the cart completely. Use the lineItemEntityId from get_cart results.`,
    toolType: "local" as const,
    parametersSchema: {
      type: "object",
      properties: {
        lineItemEntityId: {
          type: "string",
          description: "The line item ID to remove (get this from get_cart)"
        }
      },
      required: ["lineItemEntityId"]
    }
  },

  /**
   * Clear Cart Tool
   * Removes all items and deletes the cart
   */
  clear_cart: {
    name: "clear_cart",
    description: `Delete the entire cart and all its contents. Use when user wants to start over or empty their cart.`,
    toolType: "local" as const,
    parametersSchema: {
      type: "object",
      properties: {}
    }
  },

  /**
   * Proceed to Checkout Tool
   * Gets checkout URL and optionally redirects the user
   */
  proceed_to_checkout: {
    name: "proceed_to_checkout",
    description: `Get the checkout URL or redirect the user to checkout. 

Call this when the user is ready to complete their purchase. Returns the checkout URL that can be shared with the user, or automatically redirects them.

Note: Actual payment processing happens on BigCommerce's checkout page, not through this tool.`,
    toolType: "local" as const,
    parametersSchema: {
      type: "object",
      properties: {
        redirect: {
          type: "boolean",
          default: false,
          description: "If true, immediately redirects user to checkout. If false, just returns the URL."
        },
        embedded: {
          type: "boolean",
          default: false,
          description: "If true, returns embedded checkout URL for iframe use"
        }
      }
    }
  },

  /**
   * Get Categories Tool
   * Retrieves the store's category tree
   */
  get_categories: {
    name: "get_categories",
    description: `Get the store's category tree structure. Returns categories with:
- Category names and IDs
- URL paths
- Product counts
- Child categories (nested)

Use this to help users browse by category or to understand the store's organization.`,
    toolType: "local" as const,
    parametersSchema: {
      type: "object",
      properties: {
        depth: {
          type: "number",
          default: 3,
          description: "How deep to fetch the category tree (default: 3 levels)"
        }
      }
    }
  },

  /**
   * Get Store Info Tool
   * Retrieves store settings and configuration
   */
  get_store_info: {
    name: "get_store_info",
    description: `Get store information including:
- Store name
- Contact information
- Logo
- Available currencies
- Social media links

Use this to answer questions about the store itself.`,
    toolType: "local" as const,
    parametersSchema: {
      type: "object",
      properties: {}
    }
  }
};

// ============================================================================
// LOCAL TOOL IMPLEMENTATIONS (for Runtype stream localTools option)
// ============================================================================

/**
 * Creates the localTools implementation object for Runtype.stream()
 * 
 * @param sdk - BCAgentSDK instance (window.BCAgentSDK)
 * @returns Object with all local tool implementations
 * 
 * @example
 * ```typescript
 * import { createLocalToolImplementations } from './bigcommerce-local-tools'
 * 
 * await Runtype.flows.virtual({ name: 'Shopping Assistant' })
 *   .prompt({
 *     tools: {
 *       runtimeTools: Object.values(BigCommerceLocalTools),
 *       toolCallStrategy: "auto"
 *     }
 *   })
 *   .stream({}, {
 *     localTools: createLocalToolImplementations(window.BCAgentSDK)
 *   })
 * ```
 */
export function createLocalToolImplementations(sdk: any) {
  return {
    
    search_products: async (args: any) => {
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
          sort: args.sort
        });
        
        return {
          success: true,
          totalItems: result.totalItems,
          products: result.products.map((p: any) => ({
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
            inventory: p.inventory?.aggregated?.availableToSell
          })),
          filters: result.filters,
          hasMoreResults: result.pageInfo?.hasNextPage || false,
          nextCursor: result.pageInfo?.endCursor
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          errorType: 'SEARCH_ERROR'
        };
      }
    },

    get_product_details: async (args: any) => {
      try {
        const product = await sdk.getProductById(args.productId, args.variantId);
        
        if (!product) {
          return {
            success: false,
            error: `Product with ID ${args.productId} not found`,
            errorType: 'NOT_FOUND'
          };
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
            images: product.images?.map((img: any) => ({
              url: img.url,
              altText: img.altText,
              isDefault: img.isDefault
            })),
            brand: product.brand,
            categories: product.categories,
            inStock: product.inventory?.isInStock,
            stockLevel: product.inventory?.aggregated?.availableToSell,
            options: product.productOptions?.map((opt: any) => ({
              id: opt.entityId,
              name: opt.displayName,
              required: opt.isRequired,
              isVariantOption: opt.isVariantOption,
              type: opt.displayStyle || 'dropdown',
              values: opt.values?.map((v: any) => ({
                id: v.entityId,
                label: v.label,
                isDefault: v.isDefault,
                hexColors: v.hexColors,
                imageUrl: v.imageUrl
              }))
            })),
            variants: product.variants?.map((v: any) => ({
              id: v.entityId,
              sku: v.sku,
              price: v.prices?.price,
              salePrice: v.prices?.salePrice,
              inStock: v.inventory?.isInStock,
              stockLevel: v.inventory?.aggregated?.availableToSell,
              options: v.options?.flatMap((o: any) => 
                o.values?.map((val: any) => ({
                  optionId: o.entityId,
                  optionName: o.displayName,
                  valueId: val.entityId,
                  valueLabel: val.label
                }))
              )
            })),
            reviews: product.reviewSummary,
            relatedProducts: product.relatedProducts?.slice(0, 5).map((rp: any) => ({
              id: rp.entityId,
              name: rp.name,
              path: rp.path,
              price: rp.prices?.price,
              imageUrl: rp.defaultImage?.url
            }))
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          errorType: 'FETCH_ERROR'
        };
      }
    },

    get_product_by_url: async (args: any) => {
      try {
        const product = await sdk.getProductByPath(args.path);
        
        if (!product) {
          return {
            success: false,
            error: `No product found at path: ${args.path}`,
            errorType: 'NOT_FOUND'
          };
        }

        // Return same structure as get_product_details
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
            images: product.images,
            brand: product.brand,
            inStock: product.inventory?.isInStock,
            options: product.productOptions?.map((opt: any) => ({
              id: opt.entityId,
              name: opt.displayName,
              required: opt.isRequired,
              values: opt.values
            })),
            variants: product.variants
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          errorType: 'FETCH_ERROR'
        };
      }
    },

    configure_product: async (args: any) => {
      try {
        const configured = await sdk.getConfiguredProduct(
          args.productId,
          args.selectedOptions
        );

        if (!configured) {
          return {
            success: false,
            error: 'Failed to configure product with selected options',
            errorType: 'CONFIGURATION_ERROR'
          };
        }

        return {
          success: true,
          configuredProduct: {
            id: configured.entityId,
            name: configured.name,
            sku: configured.sku,
            price: configured.prices?.price,
            salePrice: configured.prices?.salePrice,
            inStock: configured.inventory?.isInStock,
            stockLevel: configured.inventory?.aggregated?.availableToSell,
            imageUrl: configured.defaultImage?.url
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          errorType: 'CONFIGURATION_ERROR'
        };
      }
    },

    get_cart: async () => {
      try {
        const summary = await sdk.getCartSummary();
        
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
            currencyCode: summary.currencyCode
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          errorType: 'CART_ERROR'
        };
      }
    },

    add_to_cart: async (args: any) => {
      try {
        const items = args.items.map((item: any) => ({
          productEntityId: item.productEntityId,
          quantity: item.quantity || 1,
          variantEntityId: item.variantEntityId,
          selectedOptions: item.selectedOptions
        }));

        const cart = await sdk.addToCart(items);

        return {
          success: true,
          cart: {
            cartId: cart.entityId,
            itemCount: cart.lineItems?.totalQuantity,
            total: cart.amount
          },
          addedItems: items.length
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          errorType: 'ADD_TO_CART_ERROR',
          hint: 'If the product has required options, make sure to include variantEntityId or selectedOptions'
        };
      }
    },

    quick_add_to_cart: async (args: any) => {
      try {
        const result = await sdk.quickAddToCart(
          args.productId,
          args.quantity || 1,
          args.options || {}
        );

        if (result.requiresConfiguration) {
          return {
            success: false,
            requiresConfiguration: true,
            message: result.message,
            product: {
              id: result.product?.entityId,
              name: result.product?.name
            },
            requiredOptions: result.requiredOptions?.map((opt: any) => ({
              id: opt.entityId,
              name: opt.displayName,
              values: opt.values?.map((v: any) => ({
                id: v.entityId,
                label: v.label
              }))
            })),
            errorType: 'OPTIONS_REQUIRED'
          };
        }

        return {
          success: true,
          addedProduct: {
            id: result.product?.entityId,
            name: result.product?.name,
            quantity: result.addedQuantity
          },
          cart: {
            cartId: result.cart?.entityId,
            itemCount: result.cart?.lineItems?.totalQuantity,
            total: result.cart?.amount
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          errorType: 'ADD_TO_CART_ERROR'
        };
      }
    },

    update_cart_item: async (args: any) => {
      try {
        const cart = await sdk.updateCartItem(args.lineItemEntityId, args.quantity);

        return {
          success: true,
          cart: {
            cartId: cart.entityId,
            itemCount: cart.lineItems?.totalQuantity,
            total: cart.amount
          }
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          errorType: 'UPDATE_ERROR'
        };
      }
    },

    remove_from_cart: async (args: any) => {
      try {
        const cart = await sdk.removeFromCart(args.lineItemEntityId);

        return {
          success: true,
          cart: {
            cartId: cart.entityId,
            itemCount: cart.lineItems?.totalQuantity,
            total: cart.amount
          },
          removedItemId: args.lineItemEntityId
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          errorType: 'REMOVE_ERROR'
        };
      }
    },

    clear_cart: async () => {
      try {
        await sdk.deleteCart();

        return {
          success: true,
          message: 'Cart has been cleared'
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          errorType: 'CLEAR_ERROR'
        };
      }
    },

    proceed_to_checkout: async (args: any) => {
      try {
        const urls = await sdk.getCheckoutUrls();

        if (args.redirect) {
          const url = args.embedded ? urls.embeddedCheckoutUrl : urls.redirectedCheckoutUrl;
          window.location.href = url;
          return {
            success: true,
            redirecting: true,
            checkoutUrl: url
          };
        }

        return {
          success: true,
          checkoutUrl: urls.redirectedCheckoutUrl,
          embeddedCheckoutUrl: urls.embeddedCheckoutUrl,
          message: 'Checkout URLs generated. Share the checkoutUrl with the user or redirect them.'
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          errorType: 'CHECKOUT_ERROR',
          hint: 'Make sure there are items in the cart before proceeding to checkout'
        };
      }
    },

    get_categories: async (args: any) => {
      try {
        const categories = await sdk.getCategoryTree(args.depth || 3);

        const formatCategory = (cat: any): any => ({
          id: cat.entityId,
          name: cat.name,
          path: cat.path,
          productCount: cat.productCount,
          hasChildren: cat.hasChildren,
          children: cat.children?.map(formatCategory)
        });

        return {
          success: true,
          categories: categories.map(formatCategory)
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          errorType: 'CATEGORY_ERROR'
        };
      }
    },

    get_store_info: async () => {
      try {
        const { settings, currencies } = await sdk.getStoreSettings();

        return {
          success: true,
          store: {
            name: settings.storeName,
            url: settings.url?.vanityUrl,
            contact: settings.contact,
            logo: settings.logo,
            socialLinks: settings.socialMediaLinks
          },
          currencies: currencies?.map((c: any) => ({
            code: c.code,
            name: c.name,
            symbol: c.display?.symbol,
            isDefault: c.isDefault
          }))
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          errorType: 'STORE_INFO_ERROR'
        };
      }
    }
  };
}

// ============================================================================
// HELPER: Get all tool definitions as array for Runtype
// ============================================================================

export function getAllToolDefinitions() {
  return Object.values(BigCommerceLocalTools);
}

// ============================================================================
// HELPER: Complete Runtype integration example
// ============================================================================

/**
 * Example usage with Runtype SDK:
 * 
 * ```typescript
 * import { Runtype } from '@travrse/client'
 * import { 
 *   getAllToolDefinitions, 
 *   createLocalToolImplementations 
 * } from './bigcommerce-local-tools'
 * 
 * // Wait for BCAgentSDK to be ready
 * window.addEventListener('bcagentsdk:ready', async () => {
 *   
 *   await Runtype.flows.virtual({ name: 'Shopping Assistant' })
 *     .prompt({
 *       name: 'ShopAssist',
 *       model: 'anthropic/claude-3.5-sonnet',
 *       systemPrompt: `You are a helpful shopping assistant for an online store.
 *         Help customers find products, answer questions, and complete purchases.
 *         Always use the available tools to get real product data.
 *         Be friendly and helpful.`,
 *       userPrompt: '{{userMessage}}',
 *       tools: {
 *         runtimeTools: getAllToolDefinitions(),
 *         toolCallStrategy: 'auto'
 *       }
 *     })
 *     .stream({
 *       onStepChunk: (chunk) => {
 *         // Handle streaming response
 *         console.log(chunk)
 *       }
 *     }, {
 *       localTools: createLocalToolImplementations(window.BCAgentSDK)
 *     })
 * })
 * ```
 */
