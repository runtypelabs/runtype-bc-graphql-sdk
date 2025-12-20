import { test, expect, Page } from '@playwright/test'

// Test configuration
const CONFIG = {
  graphqlEndpoint: 'https://store-dvzxci70mm-1.mybigcommerce.com/graphql',
  token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJjaWQiOlsxXSwiY29ycyI6WyJodHRwOi8vbG9jYWxob3N0OjMwMDAiXSwiZWF0IjoyMTQ3NDgzNjQ3LCJpYXQiOjE3NjYyMDI1NTEsImlzcyI6IkJDIiwic2lkIjoxMDAzNDM3MDEzLCJzdWIiOiJjYXowaDVzZWxocmc1ZGNoMHplMDc0NWJhbXFiOXJiIiwic3ViX3R5cGUiOjIsInRva2VuX3R5cGUiOjF9.BkAeIZIUlDJc6Ru2qnFz7z_qb0uXbnBUcv4AWNJpgQoxysVWSaV-uCLE9PXGyKwmg_t_GJnZykUo4oTWEfPm8g',
  debug: false,
}

// Initialize SDK in browser and return page for chaining
async function initSDK(page: Page): Promise<Page> {
  await page.goto('/')
  await page.waitForFunction(() => typeof (window as any).BCAgentSDK !== 'undefined')

  await page.evaluate((config) => {
    (window as any).sdk = new (window as any).BCAgentSDK.BigCommerceAgentSDK(config)
  }, CONFIG)

  return page
}

// Use serial mode so tests run in order and share context
test.describe.serial('BigCommerce Agent SDK', () => {
  let page: Page
  let searchedProductId: number
  let searchedProductVariantId: number
  let productWithOptionsId: number
  let cartLineItemId: string

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await initSDK(page)

    // Clean up any existing cart at start
    await page.evaluate(async () => {
      const sdk = (window as any).sdk
      try {
        const cart = await sdk.getCart()
        if (cart) await sdk.deleteCart()
      } catch {
        // No cart to delete
      }
    })
  })

  test.afterAll(async () => {
    // Cleanup cart after all tests
    try {
      await page.evaluate(async () => {
        const sdk = (window as any).sdk
        try {
          await sdk.deleteCart()
        } catch {
          // Ignore
        }
      })
    } catch {
      // Page might be closed
    }
    await page.close()
  })

  test('SDK loads in browser', async () => {
    const hasSDK = await page.evaluate(() => {
      return typeof (window as any).BCAgentSDK.BigCommerceAgentSDK === 'function'
    })
    expect(hasSDK).toBe(true)
  })

  test('SDK is initialized', async () => {
    const isInitialized = await page.evaluate(() => {
      return (window as any).sdk !== undefined
    })
    expect(isInitialized).toBe(true)
  })

  test('searchProducts finds products for "towel"', async () => {
    const result = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      const searchResult = await sdk.searchProducts({ searchTerm: 'towel', first: 5 })
      // Get full product details including variant
      if (searchResult.products.length > 0) {
        const product = await sdk.getProductById(searchResult.products[0].entityId)
        return {
          ...searchResult,
          firstProductVariantId: product?.variants?.[0]?.entityId
        }
      }
      return searchResult
    })

    expect(result.products).toBeDefined()
    expect(result.products.length).toBeGreaterThan(0)
    expect(result.totalItems).toBeGreaterThan(0)

    // Store for later tests
    searchedProductId = result.products[0].entityId
    searchedProductVariantId = result.firstProductVariantId
  })

  test('searchProducts with sort and hideOutOfStock', async () => {
    const result = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      return await sdk.searchProducts({
        searchTerm: 'shirt',
        hideOutOfStock: true,
        first: 10,
        sort: 'BEST_SELLING',
      })
    })

    expect(result.products).toBeDefined()
    expect(Array.isArray(result.filters)).toBe(true)
  })

  test('searchProducts returns pagination info', async () => {
    const result = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      return await sdk.searchProducts({ searchTerm: 'shoes', first: 2 })
    })

    expect(result.pageInfo).toBeDefined()
  })

  test('getProductById returns product details', async () => {
    expect(searchedProductId).toBeDefined()

    const product = await page.evaluate(async (entityId) => {
      const sdk = (window as any).sdk
      return await sdk.getProductById(entityId)
    }, searchedProductId)

    expect(product).toBeDefined()
    expect(product.entityId).toBe(searchedProductId)
    expect(product.name).toBeTruthy()
    expect(product.prices).toBeDefined()
  })

  test('finds product with options', async () => {
    const result = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      const searchResult = await sdk.searchProducts({ searchTerm: 'shirt', first: 30 })

      const productWithOptions = searchResult.products.find(
        (p: any) => p.productOptions && p.productOptions.length > 0
      )

      return productWithOptions || null
    })

    if (result) {
      expect(result.productOptions.length).toBeGreaterThan(0)
      productWithOptionsId = result.entityId
    }
  })

  test('getConfiguredProduct applies options', async () => {
    if (!productWithOptionsId) {
      test.skip()
      return
    }

    const result = await page.evaluate(async (productId) => {
      const sdk = (window as any).sdk
      const product = await sdk.getProductById(productId)

      if (!product.productOptions || product.productOptions.length === 0) {
        return null
      }

      const firstOption = product.productOptions[0]
      const firstValue = firstOption.values[0]

      if (!firstValue) return null

      const configured = await sdk.getConfiguredProduct(productId, [
        {
          optionEntityId: firstOption.entityId,
          valueEntityId: firstValue.entityId,
        },
      ])

      return {
        original: product.name,
        configured: configured?.name,
        optionApplied: `${firstOption.displayName}: ${firstValue.label}`,
      }
    }, productWithOptionsId)

    if (result) {
      expect(result.configured).toBeTruthy()
    }
  })

  test('getCart returns null when no cart exists', async () => {
    // Ensure cart is clean
    await page.evaluate(async () => {
      const sdk = (window as any).sdk
      try {
        await sdk.deleteCart()
      } catch {
        // Ignore
      }
      // Clear stored cart ID
      sdk.cartId = null
    })

    const cart = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      return await sdk.getCart()
    })

    expect(cart).toBeNull()
  })

  test('addToCart creates cart and adds product', async () => {
    expect(searchedProductId).toBeDefined()
    expect(searchedProductVariantId).toBeDefined()

    const result = await page.evaluate(async ({ productId, variantId }) => {
      const sdk = (window as any).sdk
      const cart = await sdk.addToCart({
        productEntityId: productId,
        variantEntityId: variantId,
        quantity: 1,
      })
      return {
        cart,
        cartIdAfterAdd: sdk.cartId,
      }
    }, { productId: searchedProductId, variantId: searchedProductVariantId })

    expect(result.cart).toBeDefined()
    expect(result.cart.entityId).toBeTruthy()
    expect(result.cartIdAfterAdd).toBe(result.cart.entityId)
    expect(result.cart.lineItems.totalQuantity).toBeGreaterThanOrEqual(1)

    // Store line item ID for update test
    cartLineItemId = result.cart.lineItems.physicalItems[0]?.entityId
  })

  test('getCartSummary returns formatted cart data', async () => {
    const summary = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      return await sdk.getCartSummary()
    })

    expect(summary).toBeDefined()
    expect(summary.isEmpty).toBe(false)
    expect(summary.itemCount).toBeGreaterThan(0)
    expect(summary.items.length).toBeGreaterThan(0)
    expect(summary.total).toBeDefined()
  })

  test('quickAddToCart adds more quantity', async () => {
    expect(searchedProductId).toBeDefined()

    const result = await page.evaluate(async (productId) => {
      const sdk = (window as any).sdk
      const beforeSummary = await sdk.getCartSummary()
      const beforeCount = beforeSummary.itemCount

      // Quick add another item - should handle options automatically
      const addResult = await sdk.quickAddToCart(productId, 1)

      const afterSummary = await sdk.getCartSummary()
      return {
        beforeCount,
        afterCount: afterSummary.itemCount,
        requiresConfiguration: addResult.requiresConfiguration,
      }
    }, searchedProductId)

    // If the product requires configuration, the count won't change
    if (!result.requiresConfiguration) {
      expect(result.afterCount).toBeGreaterThan(result.beforeCount)
    }
  })

  test('getCheckoutUrls returns checkout URLs', async () => {
    // Ensure cart has items
    const hasItems = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      const summary = await sdk.getCartSummary()
      return !summary.isEmpty
    })

    expect(hasItems).toBe(true)

    const urls = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      return await sdk.getCheckoutUrls()
    })

    expect(urls).toBeDefined()
    expect(urls.redirectedCheckoutUrl).toBeTruthy()
    expect(urls.embeddedCheckoutUrl).toBeTruthy()
  })

  test('deleteCart removes cart', async () => {
    const deletedId = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      return await sdk.deleteCart()
    })

    expect(deletedId).toBeTruthy()

    const summary = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      return await sdk.getCartSummary()
    })

    expect(summary.isEmpty).toBe(true)
  })
})
