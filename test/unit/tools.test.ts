import { describe, it, expect } from 'vitest'
import type { BigCommerceAgentSDK } from '../../src/sdk'
import {
  getAllToolDefinitions,
  createLocalToolImplementations,
  READ_ONLY_TOOL_NAMES,
} from '../../src/tools'

/**
 * The core tool set. New tools may be added over time (tests assert membership,
 * not an exact count), but removing or renaming any of these is a breaking
 * change for integrations and must be deliberate.
 */
const CORE_TOOL_NAMES = [
  'search_products',
  'get_product_details',
  'get_product_by_url',
  'configure_product',
  'get_cart',
  'add_to_cart',
  'quick_add_to_cart',
  'update_cart_item',
  'remove_from_cart',
  'clear_cart',
  'proceed_to_checkout',
  'get_categories',
  'get_brands',
  'get_store_info',
  'check_login_status',
  'get_customer_profile',
  'update_customer_profile',
  'get_customer_addresses',
  'add_customer_address',
  'update_customer_address',
  'delete_customer_address',
  'get_order_history',
  'get_order_details',
  'get_wishlists',
  'add_to_wishlist',
  'remove_from_wishlist',
  'get_web_pages',
  'get_web_page',
]

describe('getAllToolDefinitions', () => {
  const definitions = getAllToolDefinitions()

  it('includes every core tool', () => {
    const names = definitions.map((d) => d.name)
    for (const name of CORE_TOOL_NAMES) {
      expect(names).toContain(name)
    }
  })

  it('has unique tool names', () => {
    const names = definitions.map((d) => d.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('produces well-formed definitions', () => {
    for (const def of definitions) {
      expect(def.name, 'tool name').toMatch(/^[a-z0-9_]+$/)
      expect(def.description.length, `${def.name} description`).toBeGreaterThan(0)
      expect(def.toolType, `${def.name} toolType`).toBe('local')
      expect(def.parametersSchema, `${def.name} parametersSchema`).toBeTypeOf('object')
      expect(def.readOnly, `${def.name} readOnly`).toBeTypeOf('boolean')
    }
  })

  it('sets readOnly exactly for the tools in READ_ONLY_TOOL_NAMES', () => {
    const readOnlySet = new Set<string>(READ_ONLY_TOOL_NAMES)
    for (const def of definitions) {
      expect(def.readOnly, def.name).toBe(readOnlySet.has(def.name))
    }
  })

  it('classifies navigation as read-only and cart mutations as mutating', () => {
    const byName = Object.fromEntries(definitions.map((d) => [d.name, d]))
    // proceed_to_checkout only navigates; it must stay auto-approvable
    expect(byName.proceed_to_checkout.readOnly).toBe(true)
    for (const mutating of ['add_to_cart', 'clear_cart', 'update_customer_profile']) {
      expect(byName[mutating].readOnly, mutating).toBe(false)
    }
  })

  it('every read-only name refers to a real tool', () => {
    const names = new Set(getAllToolDefinitions().map((d) => d.name))
    for (const name of READ_ONLY_TOOL_NAMES) {
      expect(names.has(name), name).toBe(true)
    }
  })
})

describe('createLocalToolImplementations', () => {
  it('provides an implementation for every tool definition', () => {
    const impls = createLocalToolImplementations({} as BigCommerceAgentSDK) as Record<
      string,
      unknown
    >
    for (const def of getAllToolDefinitions()) {
      expect(typeof impls[def.name], def.name).toBe('function')
    }
  })

  it('returns a structured error instead of throwing when the SDK fails', async () => {
    const sdk = {
      searchProducts: async () => {
        throw new Error('network down')
      },
    } as unknown as BigCommerceAgentSDK
    const impls = createLocalToolImplementations(sdk)

    const result = await impls.search_products({})

    expect(result.success).toBe(false)
    expect(result.error).toBe('network down')
    expect(result.errorType).toBe('NETWORK')
    expect(result.retryable).toBe(true)
  })

  it('classifies auth failures as NOT_LOGGED_IN and not retryable', async () => {
    const sdk = {
      getCustomerAddresses: async () => {
        throw new Error('Not authorized to query customer')
      },
    } as unknown as BigCommerceAgentSDK
    const impls = createLocalToolImplementations(sdk)

    const result = await impls.get_customer_addresses({})

    expect(result.success).toBe(false)
    expect(result.errorType).toBe('NOT_LOGGED_IN')
    expect(result.retryable).toBe(false)
    expect(result.hint).toMatch(/log in/i)
  })

  it('classifies unrecognized failures as UNKNOWN and not retryable', async () => {
    const sdk = {
      getCategoryTree: async () => {
        throw new Error('something exploded')
      },
    } as unknown as BigCommerceAgentSDK
    const impls = createLocalToolImplementations(sdk)

    const result = await impls.get_categories({})

    expect(result.success).toBe(false)
    expect(result.errorType).toBe('UNKNOWN')
    expect(result.retryable).toBe(false)
  })

  it('keeps tool-specific hints on classified errors', async () => {
    const sdk = {
      addToCart: async () => {
        throw new Error('missing required options')
      },
    } as unknown as BigCommerceAgentSDK
    const impls = createLocalToolImplementations(sdk)

    const result = await impls.add_to_cart({ items: [{ productEntityId: 1 }] })

    expect(result.success).toBe(false)
    expect(result.hint).toContain('variantEntityId or selectedOptions')
  })

  it('returns NOT_FOUND for a missing product', async () => {
    const sdk = {
      getProductById: async () => null,
    } as unknown as BigCommerceAgentSDK
    const impls = createLocalToolImplementations(sdk)

    const result = await impls.get_product_details({ productId: 999 })

    expect(result.success).toBe(false)
    expect(result.errorType).toBe('NOT_FOUND')
    expect(result.retryable).toBe(false)
    expect(result.error).toContain('999')
  })

  it('returns data on success', async () => {
    const sdk = {
      searchProducts: async () => ({
        totalItems: 1,
        products: [{ entityId: 1, name: 'Alpha', prices: { price: { value: 10 } } }],
        filters: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      }),
    } as unknown as BigCommerceAgentSDK
    const impls = createLocalToolImplementations(sdk)

    const result = await impls.search_products({ searchTerm: 'alpha' })

    expect(result.success).toBe(true)
    expect(result.totalItems).toBe(1)
    expect(result.products?.[0]?.name).toBe('Alpha')
  })
})

describe('search_products pagination', () => {
  it('declares the after parameter in the tool schema', () => {
    const def = getAllToolDefinitions().find((d) => d.name === 'search_products')
    expect(def?.parametersSchema.properties?.after).toBeDefined()
  })

  it('passes the after cursor through to the SDK', async () => {
    let received: { after?: string } | undefined
    const sdk = {
      searchProducts: async (params: { after?: string }) => {
        received = params
        return { totalItems: 0, products: [], filters: [], pageInfo: null }
      },
    } as unknown as BigCommerceAgentSDK
    const impls = createLocalToolImplementations(sdk)

    await impls.search_products({ searchTerm: 'a', after: 'cursor-1' })

    expect(received?.after).toBe('cursor-1')
  })

  it('surfaces the next cursor so the agent can continue', async () => {
    const sdk = {
      searchProducts: async () => ({
        totalItems: 24,
        products: [],
        filters: [],
        pageInfo: { hasNextPage: true, endCursor: 'cursor-2' },
      }),
    } as unknown as BigCommerceAgentSDK
    const impls = createLocalToolImplementations(sdk)

    const result = await impls.search_products({})

    expect(result.hasMoreResults).toBe(true)
    expect(result.nextCursor).toBe('cursor-2')
  })
})

describe('get_brands', () => {
  it('is registered as a read-only tool', () => {
    const def = getAllToolDefinitions().find((d) => d.name === 'get_brands')
    expect(def).toBeDefined()
    expect(def?.readOnly).toBe(true)
  })

  it('maps brands into agent-friendly shapes', async () => {
    const sdk = {
      getBrands: async () => [
        { entityId: 1, name: 'Acme', path: '/acme/', defaultImage: { url: 'logo.png' } },
        { entityId: 2, name: 'Zenith', path: '/zenith/' },
      ],
    } as unknown as BigCommerceAgentSDK
    const impls = createLocalToolImplementations(sdk)

    const result = await impls.get_brands({})

    expect(result.success).toBe(true)
    const data = result.data as { brandCount: number; brands: Array<Record<string, unknown>> }
    expect(data.brandCount).toBe(2)
    expect(data.brands[0]).toEqual({ id: 1, name: 'Acme', path: '/acme/', logoUrl: 'logo.png' })
    expect(data.brands[1].logoUrl).toBeUndefined()
  })
})

describe('get_product_details variant capping', () => {
  const productWithVariants = (count: number) => ({
    entityId: 9,
    name: 'Configurable',
    sku: 'CFG',
    path: '/cfg/',
    variants: Array.from({ length: count }, (_, i) => ({ entityId: i + 1, sku: `V${i + 1}` })),
  })

  it('caps returned variants and reports the full count', async () => {
    const sdk = {
      getProductById: async () => productWithVariants(25),
    } as unknown as BigCommerceAgentSDK
    const impls = createLocalToolImplementations(sdk)

    const result = await impls.get_product_details({ productId: 9 })

    expect(result.success).toBe(true)
    expect(result.product?.variants).toHaveLength(10)
    expect(result.product?.variantCount).toBe(25)
    expect(result.product?.variantsTruncated).toBe(true)
    expect(result.hint).toContain('configure_product')
  })

  it('returns all variants untruncated when under the cap', async () => {
    const sdk = {
      getProductById: async () => productWithVariants(3),
    } as unknown as BigCommerceAgentSDK
    const impls = createLocalToolImplementations(sdk)

    const result = await impls.get_product_details({ productId: 9 })

    expect(result.product?.variants).toHaveLength(3)
    expect(result.product?.variantCount).toBe(3)
    expect(result.product?.variantsTruncated).toBe(false)
    expect(result.hint).toBeUndefined()
  })
})

describe('get_web_page content formats', () => {
  const page = {
    entityId: 5,
    name: 'Shipping',
    type: 'NormalPage',
    path: '/shipping/',
    plainTextSummary: 'summary',
    htmlBody:
      '<div><h1>Shipping</h1><p>We ship &amp; handle in 2&nbsp;days.</p><script>evil()</script></div>',
  }

  it('returns compact plain text by default and omits the HTML body', async () => {
    const sdk = { getWebPage: async () => page } as unknown as BigCommerceAgentSDK
    const impls = createLocalToolImplementations(sdk)

    const result = await impls.get_web_page({ entityId: 5 })

    expect(result.success).toBe(true)
    const data = result.data as { content?: string; htmlBody?: string }
    expect(data.content).toBe('Shipping\nWe ship & handle in 2 days.')
    expect(data.htmlBody).toBeUndefined()
  })

  it('returns raw HTML only when format is html', async () => {
    const sdk = { getWebPage: async () => page } as unknown as BigCommerceAgentSDK
    const impls = createLocalToolImplementations(sdk)

    const result = await impls.get_web_page({ entityId: 5, format: 'html' })

    const data = result.data as { content?: string; htmlBody?: string }
    expect(data.htmlBody).toContain('<h1>')
    expect(data.content).toBeUndefined()
  })
})
