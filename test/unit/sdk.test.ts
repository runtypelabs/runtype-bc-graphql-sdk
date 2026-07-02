import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BigCommerceAgentSDK } from '../../src/sdk'

/** Minimal in-memory localStorage stand-in for the Node test environment. */
function createLocalStorageStub() {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, String(value)),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  }
}

/** Successful GraphQL HTTP response. */
function gqlResponse(data: unknown) {
  return { ok: true, json: async () => ({ data }) }
}

/** GraphQL-level error response (HTTP 200 with an errors array). */
function gqlErrors(...messages: string[]) {
  return { ok: true, json: async () => ({ errors: messages.map((message) => ({ message })) }) }
}

const fetchMock = vi.fn()
const localStorageStub = createLocalStorageStub()

beforeEach(() => {
  fetchMock.mockReset()
  localStorageStub.clear()
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('localStorage', localStorageStub)
  // The SDK logs expected failures via console.error; keep test output clean.
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('constructor', () => {
  it('applies defaults', () => {
    const sdk = new BigCommerceAgentSDK()
    expect(sdk.cartId).toBeNull()
  })

  it('restores a persisted cart ID from localStorage', () => {
    localStorageStub.setItem('bc_agent_cart_id', 'persisted-cart')
    const sdk = new BigCommerceAgentSDK()
    expect(sdk.cartId).toBe('persisted-cart')
  })

  it('prefers an explicitly provided cart ID', () => {
    localStorageStub.setItem('bc_agent_cart_id', 'persisted-cart')
    const sdk = new BigCommerceAgentSDK({ cartId: 'explicit-cart' })
    expect(sdk.cartId).toBe('explicit-cart')
  })
})

describe('request wiring', () => {
  it('POSTs to the configured endpoint with credentials and bearer token', async () => {
    fetchMock.mockResolvedValueOnce(gqlResponse({}))
    const sdk = new BigCommerceAgentSDK({
      graphqlEndpoint: 'https://example.com/graphql',
      token: 'tok-123',
    })

    await sdk.searchProducts({ searchTerm: 'shoes' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://example.com/graphql')
    expect(init.method).toBe('POST')
    expect(init.credentials).toBe('include')
    expect(init.headers.Authorization).toBe('Bearer tok-123')
    expect(JSON.parse(init.body).variables.searchTerm).toBe('shoes')
  })

  it('omits the Authorization header without a token', async () => {
    fetchMock.mockResolvedValueOnce(gqlResponse({}))
    const sdk = new BigCommerceAgentSDK()

    await sdk.searchProducts()

    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers.Authorization).toBeUndefined()
  })

  it('throws on HTTP errors', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 })
    const sdk = new BigCommerceAgentSDK()

    await expect(sdk.searchProducts()).rejects.toThrow('500')
  })

  it('throws joined GraphQL error messages', async () => {
    fetchMock.mockResolvedValueOnce(gqlErrors('first problem', 'second problem'))
    const sdk = new BigCommerceAgentSDK()

    await expect(sdk.getCustomer()).rejects.toThrow('first problem, second problem')
  })
})

describe('searchProducts', () => {
  it('flattens connection edges and surfaces pagination info', async () => {
    fetchMock.mockResolvedValueOnce(
      gqlResponse({
        site: {
          search: {
            searchProducts: {
              products: {
                pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
                collectionInfo: { totalItems: 42 },
                edges: [
                  { node: { entityId: 1, name: 'Alpha' } },
                  { node: { entityId: 2, name: 'Beta' } },
                ],
              },
              filters: { edges: [] },
            },
          },
        },
      })
    )
    const sdk = new BigCommerceAgentSDK()

    const result = await sdk.searchProducts({ searchTerm: 'a' })

    expect(result.totalItems).toBe(42)
    expect(result.products.map((p) => p.name)).toEqual(['Alpha', 'Beta'])
    expect(result.pageInfo?.endCursor).toBe('cursor-1')
  })

  it('returns an empty result when the API returns no search data', async () => {
    fetchMock.mockResolvedValueOnce(gqlResponse({}))
    const sdk = new BigCommerceAgentSDK()

    const result = await sdk.searchProducts()

    expect(result).toEqual({ products: [], filters: [], pageInfo: null, totalItems: 0 })
  })
})

describe('cart persistence', () => {
  it('persists the cart ID from a fetched cart', async () => {
    fetchMock.mockResolvedValueOnce(gqlResponse({ site: { cart: { entityId: 'cart-1' } } }))
    const sdk = new BigCommerceAgentSDK()

    await sdk.getCart('cart-1')

    expect(sdk.cartId).toBe('cart-1')
    expect(localStorageStub.getItem('bc_agent_cart_id')).toBe('cart-1')
  })

  it('clears a stale cart ID when the cart no longer exists', async () => {
    localStorageStub.setItem('bc_agent_cart_id', 'stale-cart')
    fetchMock.mockResolvedValueOnce(gqlErrors('Cart does not exist'))
    const sdk = new BigCommerceAgentSDK()

    const cart = await sdk.getCart()

    expect(cart).toBeNull()
    expect(sdk.cartId).toBeNull()
    expect(localStorageStub.getItem('bc_agent_cart_id')).toBeNull()
  })

  it('getCheckoutUrls throws when there is no cart', async () => {
    const sdk = new BigCommerceAgentSDK()

    await expect(sdk.getCheckoutUrls()).rejects.toThrow('No cart exists')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('getCartSummary', () => {
  it('reports an empty cart when none exists', async () => {
    fetchMock.mockResolvedValueOnce(gqlResponse({ site: { cart: null } }))
    const sdk = new BigCommerceAgentSDK()

    const summary = await sdk.getCartSummary()

    expect(summary.isEmpty).toBe(true)
    expect(summary.itemCount).toBe(0)
    expect(summary.items).toEqual([])
  })

  it('summarizes physical and digital line items', async () => {
    fetchMock.mockResolvedValueOnce(
      gqlResponse({
        site: {
          cart: {
            entityId: 'cart-1',
            currencyCode: 'USD',
            baseAmount: { value: 100, currencyCode: 'USD' },
            amount: { value: 90, currencyCode: 'USD' },
            lineItems: {
              totalQuantity: 3,
              physicalItems: [
                {
                  entityId: 'li-1',
                  productEntityId: 1,
                  name: 'Shirt',
                  quantity: 2,
                  listPrice: { value: 25, currencyCode: 'USD' },
                },
              ],
              digitalItems: [
                {
                  entityId: 'li-2',
                  productEntityId: 2,
                  name: 'Ebook',
                  quantity: 1,
                  listPrice: { value: 50, currencyCode: 'USD' },
                },
              ],
            },
          },
        },
      })
    )
    const sdk = new BigCommerceAgentSDK()

    const summary = await sdk.getCartSummary()

    expect(summary.isEmpty).toBe(false)
    expect(summary.cartId).toBe('cart-1')
    expect(summary.itemCount).toBe(3)
    expect(summary.items.map((i) => i.name)).toEqual(['Shirt', 'Ebook'])
    expect(summary.total).toEqual({ value: 90, currencyCode: 'USD' })
  })
})

describe('quickAddToCart', () => {
  const productWithRequiredOption = {
    site: {
      product: {
        entityId: 123,
        name: 'Configurable',
        productOptions: {
          edges: [
            {
              node: {
                entityId: 100,
                displayName: 'Size',
                isRequired: true,
                values: { edges: [{ node: { entityId: 200, label: 'Large' } }] },
              },
            },
          ],
        },
      },
    },
  }

  it('asks for configuration when required options are missing', async () => {
    fetchMock.mockResolvedValueOnce(gqlResponse(productWithRequiredOption))
    const sdk = new BigCommerceAgentSDK()

    const result = await sdk.quickAddToCart(123, 1)

    expect(result.requiresConfiguration).toBe(true)
    expect(result.requiredOptions?.[0]?.entityId).toBe(100)
    // No cart mutation should have been attempted
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('throws when the product does not exist', async () => {
    fetchMock.mockResolvedValueOnce(gqlResponse({ site: { product: null } }))
    const sdk = new BigCommerceAgentSDK()

    await expect(sdk.quickAddToCart(999)).rejects.toThrow('999')
  })
})

describe('findVariantByOptions', () => {
  const productWithVariants = {
    site: {
      product: {
        entityId: 123,
        name: 'Variant product',
        variants: {
          edges: [
            {
              node: {
                entityId: 11,
                options: {
                  edges: [
                    {
                      node: {
                        entityId: 100,
                        values: { edges: [{ node: { entityId: 200 } }] },
                      },
                    },
                  ],
                },
              },
            },
            {
              node: {
                entityId: 12,
                options: {
                  edges: [
                    {
                      node: {
                        entityId: 100,
                        values: { edges: [{ node: { entityId: 201 } }] },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    },
  }

  it('finds the variant matching the selected option values', async () => {
    fetchMock.mockResolvedValueOnce(gqlResponse(productWithVariants))
    const sdk = new BigCommerceAgentSDK()

    const variant = await sdk.findVariantByOptions(123, { 100: 201 })

    expect(variant?.entityId).toBe(12)
  })

  it('returns null when no variant matches', async () => {
    fetchMock.mockResolvedValueOnce(gqlResponse(productWithVariants))
    const sdk = new BigCommerceAgentSDK()

    const variant = await sdk.findVariantByOptions(123, { 100: 999 })

    expect(variant).toBeNull()
  })
})

describe('isLoggedIn', () => {
  it('returns the customer when a session exists', async () => {
    fetchMock.mockResolvedValueOnce(
      gqlResponse({ customer: { entityId: 7, firstName: 'Ada' } })
    )
    const sdk = new BigCommerceAgentSDK()

    const customer = await sdk.isLoggedIn()

    expect(customer?.entityId).toBe(7)
  })

  it('returns null instead of throwing when the query fails', async () => {
    fetchMock.mockResolvedValueOnce(gqlErrors('Not authenticated'))
    const sdk = new BigCommerceAgentSDK()

    await expect(sdk.isLoggedIn()).resolves.toBeNull()
  })
})
