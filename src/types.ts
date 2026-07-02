/**
 * BigCommerce Storefront Agent SDK - Type Definitions
 */

// Price Types
export interface Money {
  value: number
  currencyCode: string
}

export interface PriceRange {
  min: Money
  max: Money
}

export interface Prices {
  price: Money | null
  salePrice: Money | null
  retailPrice: Money | null
  basePrice?: Money | null
  priceRange?: PriceRange | null
}

// Image Types
export interface Image {
  url: string
  altText: string | null
  isDefault?: boolean
  urlOriginal?: string
}

// Brand & Category Types
export interface Brand {
  entityId: number
  name: string
  path?: string
  defaultImage?: Image
}

export interface Category {
  entityId: number
  name: string
  path: string
  productCount?: number
  hasChildren?: boolean
  children?: Category[]
}

// Product Option Types
export interface OptionValue {
  entityId: number
  label: string
  isDefault?: boolean
  isSelected?: boolean
  hexColors?: string[]
  imageUrl?: string
  productId?: number
}

export interface ProductOption {
  entityId: number
  displayName: string
  isRequired: boolean
  isVariantOption?: boolean
  displayStyle?: string
  values?: OptionValue[]
  // Checkbox specific
  checkedByDefault?: boolean
  label?: string
  checkedOptionValueEntityId?: number
  uncheckedOptionValueEntityId?: number
  // Number field specific
  defaultNumber?: number
  lowest?: number
  highest?: number
  isIntegerOnly?: boolean
  limitNumberBy?: string
  // Text field specific
  defaultText?: string
  minLength?: number
  maxLength?: number
  maxLines?: number
  // Date field specific
  defaultDate?: string
  earliest?: string
  latest?: string
  limitDateBy?: string
}

// Variant Types
export interface VariantOption {
  entityId: number
  displayName: string
  values: OptionValue[]
}

export interface Variant {
  entityId: number
  sku: string
  isPurchasable?: boolean
  defaultImage?: Image
  prices: Prices
  inventory?: {
    isInStock: boolean
    aggregated?: {
      availableToSell: number
      warningLevel?: number
    }
  }
  options?: VariantOption[]
}

// Inventory Types
export interface Inventory {
  isInStock?: boolean
  hasVariantInventory?: boolean
  aggregated?: {
    availableToSell: number
    warningLevel?: number
  }
}

// Review Types
export interface ReviewSummary {
  summationOfRatings: number
  numberOfReviews: number
  averageRating: number
}

// Custom Field Types
export interface CustomField {
  entityId: number
  name: string
  value: string
}

// SEO Types
export interface SEO {
  pageTitle: string
  metaDescription: string
  metaKeywords: string
}

// Product Types
export interface Product {
  entityId: number
  name: string
  sku: string
  path: string
  description?: string
  plainTextDescription?: string
  addToCartUrl?: string
  upc?: string
  mpn?: string
  gtin?: string
  condition?: string
  weight?: { value: number; unit: string }
  defaultImage?: Image
  images?: Image[]
  brand?: Brand
  categories?: Category[]
  prices: Prices
  availabilityV2?: {
    status: string
    description: string
  }
  inventory?: Inventory
  reviewSummary?: ReviewSummary
  productOptions?: ProductOption[]
  variants?: Variant[]
  relatedProducts?: Product[]
  customFields?: CustomField[]
  seo?: SEO
}

// Search Types
export interface PriceFilter {
  minPrice?: number
  maxPrice?: number
}

export interface RatingFilter {
  minRating?: number
  maxRating?: number
}

export type SortOrder =
  | 'A_TO_Z'
  | 'Z_TO_A'
  | 'LOWEST_PRICE'
  | 'HIGHEST_PRICE'
  | 'NEWEST'
  | 'BEST_SELLING'
  | 'BEST_REVIEWED'
  | 'RELEVANCE'

export interface SearchParams {
  searchTerm?: string
  categoryId?: number
  categoryIds?: number[]
  brandIds?: number[]
  price?: PriceFilter
  rating?: RatingFilter
  hideOutOfStock?: boolean
  first?: number
  after?: string
  sort?: SortOrder
}

export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: string
  endCursor: string
}

export interface SearchFilter {
  name: string
  isCollapsedByDefault?: boolean
  displayProductCount?: boolean
  categories?: Array<{
    entityId: number
    name: string
    isSelected: boolean
    productCount: number
  }>
  brands?: Array<{
    entityId: number
    name: string
    isSelected: boolean
    productCount: number
  }>
  selected?: {
    minPrice?: number
    maxPrice?: number
  }
  ratings?: Array<{
    value: number
    isSelected: boolean
    productCount: number
  }>
}

export interface SearchResult {
  products: Product[]
  filters: SearchFilter[]
  pageInfo: PageInfo | null
  totalItems: number
}

// Cart Types
export interface SelectedOption {
  entityId: number
  name: string
  value?: string
  valueEntityId?: number
  text?: string
  number?: number
  date?: { utc: string }
}

export interface CartLineItem {
  entityId: string
  parentEntityId?: string
  variantEntityId?: number
  productEntityId: number
  sku: string
  name: string
  path?: string
  imageUrl?: string
  brand?: string
  quantity: number
  isTaxable?: boolean
  isMutable?: boolean
  isShippingRequired?: boolean
  listPrice: Money
  originalPrice?: Money
  salePrice?: Money
  extendedListPrice: Money
  extendedSalePrice?: Money
  discountedAmount?: Money
  couponAmount?: Money
  discounts?: Array<{
    entityId: string
    discountedAmount: Money
  }>
  selectedOptions?: SelectedOption[]
}

export interface Cart {
  entityId: string
  currencyCode: string
  isTaxIncluded?: boolean
  baseAmount: Money
  discountedAmount?: Money
  amount: Money
  discounts?: Array<{
    entityId: string
    discountedAmount: Money
  }>
  lineItems: {
    totalQuantity: number
    physicalItems: CartLineItem[]
    digitalItems: CartLineItem[]
    giftCertificates?: any[]
    customItems?: any[]
  }
}

export interface CartSummary {
  isEmpty: boolean
  cartId?: string
  itemCount: number
  items: Array<{
    id: string
    productId: number
    variantId?: number
    name: string
    sku: string
    quantity: number
    price: Money | null
    extendedPrice: Money | null
    imageUrl?: string
    path?: string
    options: Array<{
      name: string
      value: string | number | undefined
    }>
  }>
  subtotal: Money | null
  discounts: Money | null
  total: Money | null
  currencyCode?: string
}

// Cart Input Types
export interface CartLineItemInput {
  productEntityId: number
  quantity: number
  variantEntityId?: number
  selectedOptions?: {
    multipleChoices?: Array<{
      optionEntityId: number
      optionValueEntityId: number
    }>
  }
}

// Checkout Types
export interface CheckoutUrls {
  embeddedCheckoutUrl: string
  redirectedCheckoutUrl: string
}

// Store Settings Types
export interface StoreSettings {
  storeName: string
  storeHash?: string
  status?: string
  url?: {
    vanityUrl: string
    cdnUrl: string
  }
  display?: {
    productComparison: boolean
  }
  logo?: {
    title: string
    image?: {
      url: string
    }
  }
  contact?: {
    address: string
    email: string
    phone: string
  }
  socialMediaLinks?: Array<{
    name: string
    url: string
  }>
}

export interface Currency {
  entityId: number
  code: string
  name: string
  isActive: boolean
  isDefault: boolean
  display: {
    symbol: string
    symbolPlacement: string
    decimalPlaces: number
  }
}

// SDK Options
export interface SDKOptions {
  graphqlEndpoint?: string
  token?: string
  cartId?: string
  debug?: boolean
  currency?: string
}

// Quick Add Result
export interface QuickAddResult {
  requiresConfiguration: boolean
  product: Product
  requiredOptions?: ProductOption[]
  message?: string
  cart?: Cart
  addedQuantity?: number
}

// Option Selection Types
export interface OptionValueId {
  optionEntityId: number
  valueEntityId: number
}

// ---------------------------------------------------------------------------
// Customer Types
// ---------------------------------------------------------------------------

export interface CustomerAddress {
  entityId: number
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  company?: string
  countryCode: string
  stateOrProvince: string
  phone?: string
  postalCode: string
}

export interface Customer {
  entityId: number
  email: string
  firstName: string
  lastName: string
  phone?: string
  company?: string
  customerGroupId?: number
  customerGroupName?: string
  storeCredit?: Money
  addressCount?: number
  addresses?: CustomerAddress[]
  isSubscribedToNewsletter?: boolean
}

// ---------------------------------------------------------------------------
// Order Types
// ---------------------------------------------------------------------------

export interface OrderAddress {
  firstName: string
  lastName: string
  email?: string
  company?: string
  address1: string
  address2?: string
  city: string
  stateOrProvince: string
  postalCode: string
  countryCode: string
  phone?: string
}

export interface OrderLineItem {
  entityId: number
  productEntityId: number
  variantEntityId?: number
  name: string
  sku: string
  quantity: number
  priceBeforeDiscount: Money
  priceAfterDiscount: Money
  imageUrl?: string
  selectedOptions?: Array<{
    name: string
    value: string
  }>
}

export interface OrderConsignment {
  entityId: number
  shippingAddress: OrderAddress
  lineItems: OrderLineItem[]
  shippingCost: Money
  handlingCost?: Money
  status: string
  trackingNumber?: string
  trackingUrl?: string
}

export interface Order {
  entityId: number
  orderedAt: string
  updatedAt: string
  status: {
    value: string
    label: string
  }
  billingAddress: OrderAddress
  consignments?: OrderConsignment[]
  subTotal: Money
  discounts?: Array<{
    couponCode?: string
    discountedAmount: Money
  }>
  shippingCostTotal: Money
  taxTotal: Money
  totalIncTax: Money
  customerMessage?: string
}

export interface OrderSummary {
  entityId: number
  orderedAt: string
  status: string
  total: Money
  itemCount: number
}

// ---------------------------------------------------------------------------
// Wishlist Types
// ---------------------------------------------------------------------------

export interface WishlistItem {
  entityId: number
  productEntityId: number
  variantEntityId?: number
  product: {
    entityId: number
    name: string
    path: string
    prices?: Prices
    defaultImage?: Image
  }
}

export interface Wishlist {
  entityId: number
  name: string
  isPublic: boolean
  token?: string
  items: WishlistItem[]
}

// ---------------------------------------------------------------------------
// Customer Input Types
// ---------------------------------------------------------------------------

export interface UpdateCustomerInput {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  company?: string
}

export interface AddCustomerAddressInput {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  company?: string
  countryCode: string
  stateOrProvince: string
  phone?: string
  postalCode: string
}

// ---------------------------------------------------------------------------
// Web Content Page Types
// ---------------------------------------------------------------------------

export type WebPageType = 'NormalPage' | 'ContactPage' | 'ExternalLinkPage' | 'BlogIndexPage' | 'RawPage'

export interface WebPageBase {
  entityId: number
  name: string
  __typename: WebPageType
}

export interface ContactPage extends WebPageBase {
  __typename: 'ContactPage'
  path: string
}

export interface ExternalLinkPage extends WebPageBase {
  __typename: 'ExternalLinkPage'
  link: string
}

export interface NormalPage extends WebPageBase {
  __typename: 'NormalPage'
  path: string
  plainTextSummary?: string
  htmlBody?: string
  parentEntityId?: number
  children?: WebPageChild[]
}

export interface WebPageChild {
  name: string
  path?: string
}

export type WebPage = ContactPage | ExternalLinkPage | NormalPage | WebPageBase

export interface WebPageSummary {
  entityId: number
  name: string
  type: WebPageType
  path?: string
  link?: string
  plainTextSummary?: string
}

export interface WebPageDetail {
  entityId: number
  name: string
  type: WebPageType
  path?: string
  htmlBody?: string
  plainTextSummary?: string
  parentEntityId?: number
  children?: WebPageChild[]
}

export interface WebPagesFiltersInput {
  entityIds?: number[]
  pageType?: WebPageType
}
