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
    expect(result.errorType).toBe('SEARCH_ERROR')
  })

  it('returns NOT_FOUND for a missing product', async () => {
    const sdk = {
      getProductById: async () => null,
    } as unknown as BigCommerceAgentSDK
    const impls = createLocalToolImplementations(sdk)

    const result = await impls.get_product_details({ productId: 999 })

    expect(result.success).toBe(false)
    expect(result.errorType).toBe('NOT_FOUND')
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
