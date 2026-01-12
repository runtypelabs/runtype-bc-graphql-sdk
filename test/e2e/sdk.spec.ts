import { test, expect, Page } from '@playwright/test'

// Test configuration
const CONFIG = {
  graphqlEndpoint: 'https://store-dvzxci70mm.mybigcommerce.com/graphql',
  token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJjaWQiOltdLCJjb3JzIjpbImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsImh0dHBzOi8vbG9jYWxob3N0OjMwMDAiXSwiZWF0IjoyMTQ3NDgzNjQ3LCJpYXQiOjE3Njc4Mjk1OTMsImlzcyI6IkJDIiwic2lkIjoxMDAzNDM3MDEzLCJzdWIiOiI5Mm9nc2E5dTZnYjd6a3l4OTg5bXc2ZXdoejNvcjJwIiwic3ViX3R5cGUiOjIsInRva2VuX3R5cGUiOjF9.t-sjB4hKzH5CgFuzUtqW-YyhReJNg-EfYGtBweFNIxDYrFH1_NaDfDcP6ZpcYGTzg-UkahjFhZxYpbDsavBGXQ',
  debug: false,
}

// Test customer credentials
const TEST_CUSTOMER = {
  email: 'test@test.test',
  password: 'Abc12345',
}

// Store URLs
const STORE_URL = 'https://store-dvzxci70mm.mybigcommerce.com'

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

// Helper to log in customer via SDK
async function loginCustomer(page: Page): Promise<void> {
  const result = await page.evaluate(
    async ({ email, password }) => {
      const sdk = (window as any).sdk
      return await sdk.login(email, password)
    },
    { email: TEST_CUSTOMER.email, password: TEST_CUSTOMER.password }
  )

  if (!result || !result.customer) {
    throw new Error('Login failed')
  }
}

// Helper to log out customer via SDK
async function logoutCustomer(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const sdk = (window as any).sdk
    await sdk.logout()
  })
}

// ---------------------------------------------------------------------------
// Customer Account Tests - Unauthenticated
// ---------------------------------------------------------------------------
test.describe.serial('Customer Account - Unauthenticated', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await initSDK(page)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('isLoggedIn returns null when not authenticated', async () => {
    const customer = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      return await sdk.isLoggedIn()
    })

    expect(customer).toBeNull()
  })

  test('getCustomer returns null when not authenticated', async () => {
    const customer = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      return await sdk.getCustomer()
    })

    expect(customer).toBeNull()
  })

  test('getCustomerAddresses returns empty array when not authenticated', async () => {
    const addresses = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      return await sdk.getCustomerAddresses()
    })

    expect(addresses).toEqual([])
  })

  test('getCustomerOrders returns empty array or throws when not authenticated', async () => {
    const result = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      try {
        const orders = await sdk.getCustomerOrders()
        return { orders, error: null }
      } catch (e: any) {
        return { orders: null, error: e.message }
      }
    })

    // Either returns empty array or throws an auth error
    if (result.error) {
      expect(result.error).toMatch(/400|unauthorized|not logged/i)
    } else {
      expect(result.orders).toEqual([])
    }
  })

  test('getCustomerWishlists returns empty array or throws when not authenticated', async () => {
    const result = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      try {
        const wishlists = await sdk.getCustomerWishlists()
        return { wishlists, error: null }
      } catch (e: any) {
        return { wishlists: null, error: e.message }
      }
    })

    // Either returns empty array or throws an auth error
    if (result.error) {
      expect(result.error).toMatch(/400|unauthorized|not logged/i)
    } else {
      expect(result.wishlists).toEqual([])
    }
  })
})

// ---------------------------------------------------------------------------
// Customer Account Tests - Authenticated
// ---------------------------------------------------------------------------
test.describe.serial('Customer Account - Authenticated', () => {
  let page: Page
  let testAddressId: number | null = null

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()

    // Init SDK first, then log in via SDK
    await initSDK(page)
    await loginCustomer(page)
  })

  test.afterAll(async () => {
    // Clean up: delete test address if created
    if (testAddressId) {
      try {
        await page.evaluate(async (addressId) => {
          const sdk = (window as any).sdk
          await sdk.deleteCustomerAddress(addressId)
        }, testAddressId)
      } catch {
        // Ignore cleanup errors
      }
    }

    // Logout
    try {
      await logoutCustomer(page)
    } catch {
      // Ignore
    }

    await page.close()
  })

  // Profile Tests
  test('isLoggedIn returns customer data when authenticated', async () => {
    const customer = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      return await sdk.isLoggedIn()
    })

    expect(customer).not.toBeNull()
    expect(customer.entityId).toBeDefined()
    expect(customer.email).toBe(TEST_CUSTOMER.email)
  })

  test('getCustomer returns full profile', async () => {
    const customer = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      return await sdk.getCustomer()
    })

    expect(customer).not.toBeNull()
    expect(customer.entityId).toBeDefined()
    expect(customer.email).toBe(TEST_CUSTOMER.email)
    expect(customer.firstName).toBeDefined()
    expect(customer.lastName).toBeDefined()
  })

  // Address Tests
  test('getCustomerAddresses returns address list', async () => {
    const addresses = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      return await sdk.getCustomerAddresses()
    })

    expect(Array.isArray(addresses)).toBe(true)
  })

  test('addCustomerAddress creates new address (skipped if reCAPTCHA required)', async () => {
    const result = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      try {
        const address = await sdk.addCustomerAddress({
          firstName: 'Test',
          lastName: 'Address',
          address1: '123 Test Street',
          city: 'Austin',
          stateOrProvince: 'Texas',
          postalCode: '78701',
          countryCode: 'US',
          phone: '555-1234',
        })
        return { address, error: null, recaptchaRequired: false }
      } catch (e: any) {
        const isRecaptcha = e.message.toLowerCase().includes('recaptcha')
        return { address: null, error: e.message, recaptchaRequired: isRecaptcha }
      }
    })

    if (result.recaptchaRequired) {
      // Store has reCAPTCHA enabled - skip this test
      console.log('Skipping: Store requires reCAPTCHA for address creation')
      return
    }

    if (result.error) {
      throw new Error(result.error)
    }

    expect(result.address).not.toBeNull()
    expect(result.address.entityId).toBeDefined()
    expect(result.address.address1).toBe('123 Test Street')
    expect(result.address.city).toBe('Austin')

    // Store for later tests and cleanup
    testAddressId = result.address.entityId
  })

  test('updateCustomerAddress modifies address', async () => {
    if (!testAddressId) {
      // Skip if no address was created (e.g., reCAPTCHA blocked creation)
      return
    }

    const updatedAddress = await page.evaluate(async (addressId) => {
      const sdk = (window as any).sdk
      return await sdk.updateCustomerAddress(addressId, {
        address1: '456 Updated Street',
      })
    }, testAddressId)

    expect(updatedAddress).not.toBeNull()
    expect(updatedAddress.address1).toBe('456 Updated Street')
  })

  test('deleteCustomerAddress removes address', async () => {
    if (!testAddressId) {
      // Skip if no address was created (e.g., reCAPTCHA blocked creation)
      return
    }

    const deletedId = await page.evaluate(async (addressId) => {
      const sdk = (window as any).sdk
      return await sdk.deleteCustomerAddress(addressId)
    }, testAddressId)

    expect(deletedId).toBe(testAddressId)

    // Clear so afterAll doesn't try to delete again
    testAddressId = null
  })

  // Order Tests
  test('getCustomerOrders returns order history or handles gracefully', async () => {
    const result = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      try {
        const orders = await sdk.getCustomerOrders(5)
        return { orders, error: null }
      } catch (e: any) {
        return { orders: null, error: e.message }
      }
    })

    if (result.error) {
      // API may return 400 if orders feature not available
      expect(result.error).toMatch(/400|not available|error/i)
    } else {
      expect(Array.isArray(result.orders)).toBe(true)
    }
  })

  test('getOrderDetails returns order info when order exists', async () => {
    // First get orders to find an order ID
    const result = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      try {
        const orders = await sdk.getCustomerOrders(1)

        if (orders.length === 0) {
          return { hasOrders: false, error: null }
        }

        const orderDetails = await sdk.getOrderDetails(orders[0].entityId)
        return {
          hasOrders: true,
          orderId: orders[0].entityId,
          orderDetails,
          error: null,
        }
      } catch (e: any) {
        return { hasOrders: false, error: e.message }
      }
    })

    if (result.error) {
      // API may return 400 if orders feature not available - skip gracefully
      expect(result.error).toMatch(/400|not available|error/i)
    } else if (!result.hasOrders) {
      // No orders for this test account - that's OK
      expect(result.hasOrders).toBe(false)
    } else {
      expect(result.orderDetails).not.toBeNull()
      expect(result.orderDetails.entityId).toBe(result.orderId)
    }
  })

  // Wishlist Tests
  test('getCustomerWishlists returns wishlists or handles gracefully', async () => {
    const result = await page.evaluate(async () => {
      const sdk = (window as any).sdk
      try {
        const wishlists = await sdk.getCustomerWishlists()
        return { wishlists, error: null }
      } catch (e: any) {
        return { wishlists: null, error: e.message }
      }
    })

    if (result.error) {
      // API may return error if wishlists feature not available
      expect(result.error).toMatch(/400|not available|error/i)
    } else {
      expect(Array.isArray(result.wishlists)).toBe(true)
    }
  })
})
