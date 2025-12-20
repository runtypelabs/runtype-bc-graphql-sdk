/**
 * BigCommerce Storefront Agent SDK
 * Main SDK class implementation
 */

import {
  SDKOptions,
  Product,
  SearchParams,
  SearchResult,
  Cart,
  CartSummary,
  CartLineItemInput,
  CheckoutUrls,
  Category,
  StoreSettings,
  Currency,
  OptionValueId,
  QuickAddResult,
  Variant,
} from './types'

import { QUERIES } from './queries'
import { MUTATIONS } from './mutations'

interface Connection<T> {
  edges: Array<{ node: T }>
}

export class BigCommerceAgentSDK {
  private graphqlEndpoint: string
  private token: string | null
  private debug: boolean
  private currency: string | null
  public cartId: string | null

  constructor(options: SDKOptions = {}) {
    this.graphqlEndpoint = options.graphqlEndpoint || '/graphql'
    this.token = options.token || null
    this.cartId = options.cartId || this.getStoredCartId()
    this.debug = options.debug || false
    this.currency = options.currency || null
  }

  // ---------------------------------------------------------------------------
  // Private Helper Methods
  // ---------------------------------------------------------------------------

  private log(...args: unknown[]): void {
    if (this.debug) {
      console.log('[BCAgentSDK]', ...args)
    }
  }

  private error(...args: unknown[]): void {
    console.error('[BCAgentSDK Error]', ...args)
  }

  private getStoredCartId(): string | null {
    if (typeof localStorage === 'undefined') return null
    try {
      return localStorage.getItem('bc_agent_cart_id') || null
    } catch {
      return null
    }
  }

  private setStoredCartId(cartId: string | null): void {
    if (typeof localStorage === 'undefined') return
    try {
      if (cartId) {
        localStorage.setItem('bc_agent_cart_id', cartId)
      } else {
        localStorage.removeItem('bc_agent_cart_id')
      }
    } catch (e) {
      this.error('Failed to store cart ID:', e)
    }
  }

  private async executeGraphQL<T>(
    query: string,
    variables: Record<string, unknown> = {},
    operationName?: string
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const body: Record<string, unknown> = { query, variables }
    if (operationName) {
      body.operationName = operationName
    }

    this.log('GraphQL Request:', { query: query.slice(0, 100) + '...', variables })

    try {
      const response = await fetch(this.graphqlEndpoint, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        headers,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.errors && result.errors.length > 0) {
        this.error('GraphQL Errors:', result.errors)
        throw new Error(result.errors.map((e: { message: string }) => e.message).join(', '))
      }

      this.log('GraphQL Response:', result.data)
      return result.data
    } catch (error) {
      this.error('GraphQL Request Failed:', error)
      throw error
    }
  }

  private flattenEdges<T>(connection: Connection<T> | undefined | null): T[] {
    if (!connection || !connection.edges) {
      return []
    }
    return connection.edges.map((edge) => edge.node)
  }

  private formatProduct(product: Record<string, unknown> | null): Product | null {
    if (!product) return null

    const formatted = { ...product } as Product & Record<string, unknown>

    if (formatted.images) {
      formatted.images = this.flattenEdges(formatted.images as unknown as Connection<unknown>) as Product['images']
    }
    if (formatted.categories) {
      formatted.categories = this.flattenEdges(formatted.categories as unknown as Connection<unknown>) as Product['categories']
    }
    if (formatted.productOptions) {
      formatted.productOptions = this.flattenEdges(
        formatted.productOptions as unknown as Connection<Record<string, unknown>>
      ).map((opt) => ({
        ...opt,
        values: opt.values ? this.flattenEdges(opt.values as unknown as Connection<unknown>) : [],
      })) as Product['productOptions']
    }
    if (formatted.variants) {
      formatted.variants = this.flattenEdges(
        formatted.variants as unknown as Connection<Record<string, unknown>>
      ).map((v) => ({
        ...v,
        options: v.options
          ? this.flattenEdges(v.options as unknown as Connection<Record<string, unknown>>).map((o) => ({
              ...o,
              values: this.flattenEdges(o.values as unknown as Connection<unknown>),
            }))
          : [],
      })) as Product['variants']
    }
    if (formatted.relatedProducts) {
      formatted.relatedProducts = this.flattenEdges(
        formatted.relatedProducts as unknown as Connection<unknown>
      ) as Product['relatedProducts']
    }
    if (formatted.customFields) {
      formatted.customFields = this.flattenEdges(
        formatted.customFields as unknown as Connection<unknown>
      ) as Product['customFields']
    }

    return formatted as Product
  }

  // ---------------------------------------------------------------------------
  // Product Search
  // ---------------------------------------------------------------------------

  async searchProducts(params: SearchParams = {}): Promise<SearchResult> {
    const variables = {
      searchTerm: params.searchTerm || null,
      categoryEntityId: params.categoryId || null,
      categoryEntityIds: params.categoryIds || null,
      brandEntityIds: params.brandIds || null,
      price: params.price || null,
      rating: params.rating || null,
      hideOutOfStock: params.hideOutOfStock || null,
      first: params.first || 12,
      after: params.after || null,
      sort: params.sort || null,
    }

    const data = await this.executeGraphQL<{
      site: {
        search: {
          searchProducts: {
            products: Connection<Record<string, unknown>> & {
              pageInfo: SearchResult['pageInfo']
              collectionInfo: { totalItems: number }
            }
            filters: Connection<Record<string, unknown>>
          }
        }
      }
    }>(QUERIES.SEARCH_PRODUCTS, variables)

    const searchResult = data?.site?.search?.searchProducts

    if (!searchResult) {
      return { products: [], filters: [], pageInfo: null, totalItems: 0 }
    }

    return {
      products: this.flattenEdges(searchResult.products).map((p) =>
        this.formatProduct(p)
      ) as Product[],
      filters: this.flattenEdges(searchResult.filters).map((f: Record<string, unknown>) => ({
        ...f,
        categories: f.categories
          ? this.flattenEdges(f.categories as Connection<unknown>)
          : undefined,
        brands: f.brands ? this.flattenEdges(f.brands as Connection<unknown>) : undefined,
        ratings: f.ratings ? this.flattenEdges(f.ratings as Connection<unknown>) : undefined,
      })) as SearchResult['filters'],
      pageInfo: searchResult.products?.pageInfo || null,
      totalItems: searchResult.products?.collectionInfo?.totalItems || 0,
    }
  }

  // ---------------------------------------------------------------------------
  // Product Details
  // ---------------------------------------------------------------------------

  async getProductById(entityId: number, variantEntityId?: number): Promise<Product | null> {
    const variables = {
      entityId: Number(entityId),
      variantEntityId: variantEntityId ? Number(variantEntityId) : null,
    }

    const data = await this.executeGraphQL<{
      site: { product: Record<string, unknown> | null }
    }>(QUERIES.GET_PRODUCT_BY_ID, variables)

    return this.formatProduct(data?.site?.product)
  }

  async getProductByPath(path: string): Promise<Product | null> {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`

    const data = await this.executeGraphQL<{
      site: { route: { node: Record<string, unknown> | null } }
    }>(QUERIES.GET_PRODUCT_BY_PATH, { path: normalizedPath })

    return this.formatProduct(data?.site?.route?.node)
  }

  async getConfiguredProduct(
    entityId: number,
    selectedOptions: OptionValueId[] = []
  ): Promise<Product | null> {
    const optionValueIds = selectedOptions.map((opt) => ({
      optionEntityId: Number(opt.optionEntityId),
      valueEntityId: Number(opt.valueEntityId),
    }))

    const data = await this.executeGraphQL<{
      site: { product: Record<string, unknown> | null }
    }>(QUERIES.GET_CONFIGURED_PRODUCT, {
      entityId: Number(entityId),
      optionValueIds,
    })

    return this.formatProduct(data?.site?.product)
  }

  async findVariantByOptions(
    productEntityId: number,
    selectedOptions: Record<number, number>
  ): Promise<Variant | null> {
    const product = await this.getProductById(productEntityId)

    if (!product || !product.variants) {
      return null
    }

    return (
      product.variants.find((variant) => {
        if (!variant.options || variant.options.length === 0) {
          return false
        }

        return variant.options.every((option) => {
          const selectedValueId = selectedOptions[option.entityId]
          if (!selectedValueId) return false

          return option.values.some((value) => value.entityId === Number(selectedValueId))
        })
      }) || null
    )
  }

  // ---------------------------------------------------------------------------
  // Cart Operations
  // ---------------------------------------------------------------------------

  async getCart(cartEntityId?: string): Promise<Cart | null> {
    const id = cartEntityId || this.cartId
    const data = await this.executeGraphQL<{
      site: { cart: Cart | null }
    }>(QUERIES.GET_CART, { cartEntityId: id })

    const cart = data?.site?.cart

    if (cart?.entityId) {
      this.cartId = cart.entityId
      this.setStoredCartId(cart.entityId)
    }

    return cart
  }

  async createCart(lineItems: CartLineItemInput[] = []): Promise<Cart | null> {
    const formattedLineItems = lineItems.map((item) => ({
      productEntityId: Number(item.productEntityId),
      quantity: Number(item.quantity) || 1,
      variantEntityId: item.variantEntityId ? Number(item.variantEntityId) : undefined,
      selectedOptions: item.selectedOptions || undefined,
    }))

    const input = { lineItems: formattedLineItems }

    const data = await this.executeGraphQL<{
      cart: {
        createCart: {
          cart: Cart | null
        }
      }
    }>(MUTATIONS.CREATE_CART, { input })

    const cart = data?.cart?.createCart?.cart
    if (cart?.entityId) {
      this.cartId = cart.entityId
      this.setStoredCartId(cart.entityId)
    }

    return cart
  }

  async addToCart(items: CartLineItemInput | CartLineItemInput[]): Promise<Cart | null> {
    const cart = await this.getCart()

    const itemsArray = Array.isArray(items) ? items : [items]

    const formattedLineItems = itemsArray.map((item) => ({
      productEntityId: Number(item.productEntityId),
      quantity: Number(item.quantity) || 1,
      variantEntityId: item.variantEntityId ? Number(item.variantEntityId) : undefined,
      selectedOptions: item.selectedOptions || undefined,
    }))

    if (!cart || !this.cartId) {
      return this.createCart(formattedLineItems)
    }

    const input = {
      cartEntityId: this.cartId,
      data: { lineItems: formattedLineItems },
    }

    const data = await this.executeGraphQL<{
      cart: {
        addCartLineItems: {
          cart: Cart | null
        }
      }
    }>(MUTATIONS.ADD_CART_LINE_ITEMS, { input })

    return data?.cart?.addCartLineItems?.cart || null
  }

  async updateCartItem(lineItemEntityId: string, quantity: number): Promise<Cart | null> {
    if (!this.cartId) {
      throw new Error('No cart exists')
    }

    // Fetch cart to get the productEntityId for this line item
    const cart = await this.getCart()
    if (!cart) {
      throw new Error('Cart not found')
    }

    const lineItem =
      cart.lineItems?.physicalItems?.find((item) => item.entityId === lineItemEntityId) ||
      cart.lineItems?.digitalItems?.find((item) => item.entityId === lineItemEntityId)

    if (!lineItem) {
      throw new Error(`Line item ${lineItemEntityId} not found in cart`)
    }

    const input = {
      cartEntityId: this.cartId,
      lineItemEntityId,
      data: {
        lineItem: {
          productEntityId: lineItem.productEntityId,
          quantity: Number(quantity),
        },
      },
    }

    const data = await this.executeGraphQL<{
      cart: {
        updateCartLineItem: {
          cart: Cart | null
        }
      }
    }>(MUTATIONS.UPDATE_CART_LINE_ITEM, { input })

    return data?.cart?.updateCartLineItem?.cart || null
  }

  async removeFromCart(lineItemEntityId: string): Promise<Cart | null> {
    if (!this.cartId) {
      throw new Error('No cart exists')
    }

    const input = {
      cartEntityId: this.cartId,
      lineItemEntityId,
    }

    const data = await this.executeGraphQL<{
      cart: {
        deleteCartLineItem: {
          cart: Cart | null
        }
      }
    }>(MUTATIONS.DELETE_CART_LINE_ITEM, { input })

    return data?.cart?.deleteCartLineItem?.cart || null
  }

  async deleteCart(): Promise<string | null> {
    if (!this.cartId) {
      throw new Error('No cart exists')
    }

    const input = { cartEntityId: this.cartId }

    const data = await this.executeGraphQL<{
      cart: {
        deleteCart: {
          deletedCartEntityId: string
        }
      }
    }>(MUTATIONS.DELETE_CART, { input })

    this.cartId = null
    this.setStoredCartId(null)

    return data?.cart?.deleteCart?.deletedCartEntityId || null
  }

  // ---------------------------------------------------------------------------
  // Checkout
  // ---------------------------------------------------------------------------

  async getCheckoutUrls(): Promise<CheckoutUrls> {
    if (!this.cartId) {
      throw new Error('No cart exists. Add items to cart first.')
    }

    const input = { cartEntityId: this.cartId }

    const data = await this.executeGraphQL<{
      cart: {
        createCartRedirectUrls: {
          redirectUrls: CheckoutUrls
        }
      }
    }>(MUTATIONS.CREATE_CART_REDIRECT_URLS, { input })

    return data?.cart?.createCartRedirectUrls?.redirectUrls
  }

  async proceedToCheckout(embedded = false): Promise<void> {
    const urls = await this.getCheckoutUrls()

    if (!urls) {
      throw new Error('Failed to get checkout URLs')
    }

    const checkoutUrl = embedded ? urls.embeddedCheckoutUrl : urls.redirectedCheckoutUrl

    if (checkoutUrl && typeof window !== 'undefined') {
      window.location.href = checkoutUrl
    } else {
      throw new Error('No checkout URL available')
    }
  }

  // ---------------------------------------------------------------------------
  // Category & Store Info
  // ---------------------------------------------------------------------------

  async getCategoryTree(depth = 3): Promise<Category[]> {
    const data = await this.executeGraphQL<{
      site: { categoryTree: Category[] }
    }>(QUERIES.GET_CATEGORY_TREE, { depth })

    return data?.site?.categoryTree || []
  }

  async getStoreSettings(): Promise<{ settings: StoreSettings | null; currencies: Currency[] }> {
    const data = await this.executeGraphQL<{
      site: {
        settings: StoreSettings
      }
    }>(QUERIES.GET_STORE_SETTINGS)

    return {
      settings: data?.site?.settings || null,
      currencies: [],
    }
  }

  // ---------------------------------------------------------------------------
  // Convenience Methods
  // ---------------------------------------------------------------------------

  async quickAddToCart(
    productId: number,
    quantity = 1,
    options: Record<number, number> = {}
  ): Promise<QuickAddResult> {
    const product = await this.getProductById(productId)

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`)
    }

    const requiredOptions = product.productOptions?.filter((o) => o.isRequired) || []
    const hasRequiredOptions = requiredOptions.length > 0

    if (hasRequiredOptions && Object.keys(options).length === 0) {
      return {
        requiresConfiguration: true,
        product,
        requiredOptions,
        message: 'This product requires option selection before adding to cart',
      }
    }

    let selectedOptions: CartLineItemInput['selectedOptions']
    let variantEntityId: number | undefined

    if (Object.keys(options).length > 0) {
      selectedOptions = {
        multipleChoices: Object.entries(options).map(([optionId, valueId]) => ({
          optionEntityId: Number(optionId),
          optionValueEntityId: Number(valueId),
        })),
      }

      const variant = await this.findVariantByOptions(productId, options)
      if (variant) {
        variantEntityId = variant.entityId
      }
    }

    const cart = await this.addToCart({
      productEntityId: productId,
      quantity,
      variantEntityId,
      selectedOptions,
    })

    return {
      requiresConfiguration: false,
      cart: cart || undefined,
      product,
      addedQuantity: quantity,
    }
  }

  async getCartSummary(): Promise<CartSummary> {
    const cart = await this.getCart()

    if (!cart) {
      return {
        isEmpty: true,
        itemCount: 0,
        items: [],
        subtotal: null,
        discounts: null,
        total: null,
      }
    }

    const physicalItems = cart.lineItems?.physicalItems || []
    const digitalItems = cart.lineItems?.digitalItems || []
    const allItems = [...physicalItems, ...digitalItems]

    return {
      isEmpty: allItems.length === 0,
      cartId: cart.entityId,
      itemCount: cart.lineItems?.totalQuantity || 0,
      items: allItems.map((item) => ({
        id: item.entityId,
        productId: item.productEntityId,
        variantId: item.variantEntityId,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        price: item.salePrice || item.listPrice,
        extendedPrice: item.extendedSalePrice || item.extendedListPrice,
        imageUrl: item.imageUrl,
        path: item.path,
        options:
          item.selectedOptions?.map((o) => ({
            name: o.name,
            value: o.value || o.text || o.number,
          })) || [],
      })),
      subtotal: cart.baseAmount,
      discounts: cart.discountedAmount || null,
      total: cart.amount,
      currencyCode: cart.currencyCode,
    }
  }
}

export { QUERIES } from './queries'
export { MUTATIONS } from './mutations'
