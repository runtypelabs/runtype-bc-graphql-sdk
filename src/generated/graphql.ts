/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** Add cart line items data object */
export type AddCartLineItemsDataInput = {
  /** List of gift certificates */
  giftCertificates?: Array<CartGiftCertificateInput> | null | undefined;
  /** List of cart line items */
  lineItems?: Array<CartLineItemInput> | null | undefined;
};

/** Add cart line items input object */
export type AddCartLineItemsInput = {
  /** The cart id */
  cartEntityId: string;
  /** Add cart line items data object */
  data: AddCartLineItemsDataInput;
  /** Version number. When provided, will reject the request if the version number is not the latest version of the cart, in order to prevent race conditions. */
  version?: number | null | undefined;
};

/** Input for adding a customer address. */
export type AddCustomerAddressInput = {
  /** First line for the street address. */
  address1: string;
  /** Second line for the street address. */
  address2?: string | null | undefined;
  /** City. */
  city: string;
  /** Company name associated with the address. */
  company?: string | null | undefined;
  /** 2-letter country code. */
  countryCode: string;
  /** First name of the address owner. */
  firstName: string;
  /** Additional form fields defined by merchant. */
  formFields?: CustomerFormFieldsInput | null | undefined;
  /** Last name of the address owner. */
  lastName: string;
  /** Phone number. */
  phone?: string | null | undefined;
  /** Postal code for the address. This is only required for certain countries. */
  postalCode?: string | null | undefined;
  /** Name of State or Province. */
  stateOrProvince?: string | null | undefined;
};

/** Add wishlist items input object */
export type AddWishlistItemsInput = {
  /** The wishlist id */
  entityId: number;
  /** The new wishlist items */
  items: Array<WishlistItemInput>;
};

/** A common input object for analytics events containing shared fields. */
export type AnalyticsCommonEventInput = {
  /** Consent-related details for the analytics event. */
  consent?: AnalyticsEventConsentInput | null | undefined;
  /** Details about the initiator of the analytics event. */
  initiator?: AnalyticsEventInitiatorInput | null | undefined;
  /** Request-related details for the analytics event. */
  request: AnalyticsEventRequestInput;
};

/** Input object for capturing user consent details in analytics events. */
export type AnalyticsEventConsentInput = {
  /** User consent related to analytics tracking. */
  analytics: boolean;
  /** User consent related to functional cookies or settings. */
  functional: boolean;
  /** User consent related to targeted advertising. */
  targeting: boolean;
};

/** Input object representing the initiator of an analytics event. */
export type AnalyticsEventInitiatorInput = {
  /** Unique identifier for the visit initiating the event. */
  visitId: string;
  /** Unique identifier for the visitor initiating the event. */
  visitorId: string;
};

/** Input object containing request-related details for analytics events. */
export type AnalyticsEventRequestInput = {
  /** Accepted language preference from the request header. */
  acceptLanguage?: string | null | undefined;
  /** IP address associated with the request. */
  ip?: unknown;
  /** Referrer URL for the analytics event request. */
  refererUrl?: unknown;
  /** URL associated with the analytics event request. */
  url: unknown;
  /** User agent string from the request header. */
  userAgent: string;
};

/** Cart gift certificate input object */
export type CartGiftCertificateInput = {
  /** Value must be between 1.00 and 1,000.00 in the store's default currency. */
  amount: unknown;
  /** Message that will be sent to the gift certificate's recipient. Limited to 200 characters. */
  message?: string | null | undefined;
  /** GiftCertificate-provided name that will appear in the control panel. */
  name: string;
  /** The total number of certificates */
  quantity: number;
  /** Recipient of the gift certificate. */
  recipient: CartGiftCertificateRecipientInput;
  /** Sender of the gift certificate. */
  sender: CartGiftCertificateSenderInput;
  /** Currently supports Birthday, Boy, Celebration, Christmas, General, and Girl. */
  theme: CartGiftCertificateTheme;
};

/** Cart gift certificate recipient input object */
export type CartGiftCertificateRecipientInput = {
  /** Contact's email address. */
  email: string;
  /** Contact's name. */
  name: string;
};

/** Cart gift certificate sender input object */
export type CartGiftCertificateSenderInput = {
  /** Contact's email address. */
  email: string;
  /** Contact's name. */
  name: string;
};

/** Cart gift certificate theme */
export type CartGiftCertificateTheme =
  | 'BIRTHDAY'
  | 'BOY'
  | 'CELEBRATION'
  | 'CHRISTMAS'
  | 'GENERAL'
  | 'GIRL'
  | 'NONE';

/** Cart line item input object */
export type CartLineItemInput = {
  /** The product id (either `SKU` or `productEntityId` must be provided). */
  productEntityId?: number | null | undefined;
  /** Total number of line items. */
  quantity: number;
  /** The list of selected options for this item. */
  selectedOptions?: CartSelectedOptionsInput | null | undefined;
  /** The product SKU (either `SKU` or `productEntityId` must be provided). */
  sku?: string | null | undefined;
  /** The variant id */
  variantEntityId?: number | null | undefined;
};

/** Cart selected checkbox option input object */
export type CartSelectedCheckboxOptionInput = {
  /** The product option ID. */
  optionEntityId: number;
  /** The product option value ID. */
  optionValueEntityId: number;
};

/** Cart selected date field option input object */
export type CartSelectedDateFieldOptionInput = {
  /** Date value. */
  date: unknown;
  /** The product option ID. */
  optionEntityId: number;
};

/** Cart selected multiple line text field option input object */
export type CartSelectedMultiLineTextFieldOptionInput = {
  /** The product option ID. */
  optionEntityId: number;
  /** Text value. */
  text: string;
};

/** Cart selected multiple choice option input object */
export type CartSelectedMultipleChoiceOptionInput = {
  /** The product option ID. */
  optionEntityId: number;
  /** The product option value ID. */
  optionValueEntityId: number;
};

/** Cart selected number field option input object */
export type CartSelectedNumberFieldOptionInput = {
  /** Number value. */
  number: number;
  /** The product option ID. */
  optionEntityId: number;
};

/** Selected product options. */
export type CartSelectedOptionsInput = {
  /** List of selected checkbox options. */
  checkboxes?: Array<CartSelectedCheckboxOptionInput> | null | undefined;
  /** List of selected date field options. */
  dateFields?: Array<CartSelectedDateFieldOptionInput> | null | undefined;
  /** List of selected multi-line text field options. */
  multiLineTextFields?: Array<CartSelectedMultiLineTextFieldOptionInput> | null | undefined;
  /** List of selected multiple choice options. */
  multipleChoices?: Array<CartSelectedMultipleChoiceOptionInput> | null | undefined;
  /** List of selected number field options. */
  numberFields?: Array<CartSelectedNumberFieldOptionInput> | null | undefined;
  /** List of selected text field options. */
  textFields?: Array<CartSelectedTextFieldOptionInput> | null | undefined;
};

/** Cart selected multiple line text field option input object */
export type CartSelectedTextFieldOptionInput = {
  /** The product option ID. */
  optionEntityId: number;
  /** TODO */
  text: string;
};

/** The user input for checkbox form fields. */
export type CheckboxesFormFieldInput = {
  /** The custom form field ID. */
  fieldEntityId: number;
  /** The choice indexes of the form field values. */
  fieldValueEntityIds: Array<number>;
};

/** Create cart input object */
export type CreateCartInput = {
  /** ISO-4217 currency code */
  currencyCode?: string | null | undefined;
  /** List of gift certificates */
  giftCertificates?: Array<CartGiftCertificateInput> | null | undefined;
  /** List of cart line items */
  lineItems?: Array<CartLineItemInput> | null | undefined;
  /** Locale of the cart */
  locale?: string | null | undefined;
};

/** Create cart redirect URLs input object. */
export type CreateCartRedirectUrlsInput = {
  /** Synchronize analytics data on session synchronization. */
  analytics?: AnalyticsCommonEventInput | null | undefined;
  /** The cart id to create the redirect URLs for. */
  cartEntityId?: string | null | undefined;
  /** IP4 or IP6 compatible address to include in the session redirect url */
  ipAddress?: unknown;
  /** Payment wallet data on session synchronization. */
  paymentWalletData?: PaymentWalletDataInput | null | undefined;
  /** The query parameters to pass when redirecting to the URLs. */
  queryParams?: Array<CreateCartRedirectUrlsQueryParamsInput> | null | undefined;
  /** Visit id to synchronise analytics data on session synchronization. */
  visitId?: unknown;
  /** Visitor id to synchronise analytics data on session synchronization. */
  visitorId?: unknown;
};

/** Create cart redirect URLs query params input object. */
export type CreateCartRedirectUrlsQueryParamsInput = {
  /** The key of the query parameter to pass. */
  key: string;
  /** The value of the query parameter to pass. */
  value: string;
};

/** The input for the filled out customer form fields. */
export type CustomerFormFieldsInput = {
  /** List of checkboxes custom form fields input. */
  checkboxes?: Array<CheckboxesFormFieldInput> | null | undefined;
  /** List of date custom form fields input. */
  dates?: Array<DateFormFieldInput> | null | undefined;
  /** List of multiline text custom form fields input. */
  multilineTexts?: Array<MultilineTextFormFieldInput> | null | undefined;
  /** List of multiple choice custom form fields input. This includes pick lists. */
  multipleChoices?: Array<MultipleChoiceFormFieldInput> | null | undefined;
  /** List of number custom form fields input. */
  numbers?: Array<NumberFormFieldInput> | null | undefined;
  /** List of password custom form fields input. */
  passwords?: Array<PasswordFormFieldInput> | null | undefined;
  /** List of text custom form fields input. */
  texts?: Array<TextFormFieldInput> | null | undefined;
};

/** The user input for date form fields. */
export type DateFormFieldInput = {
  /** The user date input for the form field in ISO-8601 format. */
  date: unknown;
  /** The custom form field ID. */
  fieldEntityId: number;
};

/** Delete cart input object */
export type DeleteCartInput = {
  /** The cart id */
  cartEntityId: string;
};

/** Delete cart line item input object */
export type DeleteCartLineItemInput = {
  /** The cart id */
  cartEntityId: string;
  /** The line item id */
  lineItemEntityId: string;
  /** Version number. When provided, will reject the request if the version number is not the latest version of the cart, in order to prevent race conditions. */
  version?: number | null | undefined;
};

/** Input for deleting a customer address. */
export type DeleteCustomerAddressInput = {
  /** Address entity ID for the customer address to delete. */
  addressEntityId: number;
};

/** Delete wishlist items input object */
export type DeleteWishlistItemsInput = {
  /** The wishlist id */
  entityId: number;
  /** The wishlist item ids */
  itemEntityIds: Array<number>;
};

/** Limit date by */
export type LimitDateOption =
  | 'EARLIEST_DATE'
  | 'LATEST_DATE'
  | 'NO_LIMIT'
  | 'RANGE';

/** Limit numbers by several options. */
export type LimitInputBy =
  | 'HIGHEST_VALUE'
  | 'LOWEST_VALUE'
  | 'NO_LIMIT'
  | 'RANGE';

/** The user input for multiline text form fields. */
export type MultilineTextFormFieldInput = {
  /** The custom form field ID. */
  fieldEntityId: number;
  /** Multiline text value. */
  multilineText: string;
};

/** The user input for multiple choice form fields. */
export type MultipleChoiceFormFieldInput = {
  /** The custom form field ID. */
  fieldEntityId: number;
  /** The choice index of the form field value. */
  fieldValueEntityId: number;
};

/** The user input for number form fields. */
export type NumberFormFieldInput = {
  /** The custom form field ID. */
  fieldEntityId: number;
  /** The number input of the number field. */
  number: number;
};

/** A variant option value id input object */
export type OptionValueId = {
  /** A variant option id filter */
  optionEntityId: number;
  /** A variant value id filter. */
  valueEntityId: number;
};

/** Filter for order query. */
export type OrderFilterInput = {
  /** Cart id. Only guest orders can be fetched by cart id. Customer orders will not be returned. */
  cartEntityId?: string | null | undefined;
  /** Order id. */
  entityId: number;
};

/** The current status of an order. */
export type OrderStatusValue =
  | 'AWAITING_FULFILLMENT'
  | 'AWAITING_PAYMENT'
  | 'AWAITING_PICKUP'
  | 'AWAITING_SHIPMENT'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'DECLINED'
  | 'DISPUTED'
  | 'INCOMPLETE'
  | 'MANUAL_VERIFICATION_REQUIRED'
  | 'PARTIALLY_REFUNDED'
  | 'PARTIALLY_SHIPPED'
  | 'PENDING'
  | 'REFUNDED'
  | 'SHIPPED';

/** The user input for password form fields. */
export type PasswordFormFieldInput = {
  /** The custom form field ID. */
  fieldEntityId: number;
  /** Password value. */
  password: string;
};

/** The payment wallet data input. */
export type PaymentWalletDataInput = {
  /** Initialization id. */
  initializationId?: string | null | undefined;
  /** Provider id. */
  providerId?: string | null | undefined;
  /** Provider order id. */
  providerOrderId?: string | null | undefined;
};

/** Search by price range. At least a minPrice or maxPrice must be supplied. */
export type PriceSearchFilterInput = {
  /** Maximum price of the product. */
  maxPrice?: number | null | undefined;
  /** Minimum price of the product. */
  minPrice?: number | null | undefined;
};

/** Product availability status */
export type ProductAvailabilityStatus =
  | 'Available'
  | 'Preorder'
  | 'Unavailable';

/** Product condition */
export type ProductConditionType =
  | 'NEW'
  | 'REFURBISHED'
  | 'USED';

/** Filter by rating. At least a minRating or maxRating must be supplied. This filter will do nothing unless your store has the Product Filtering feature available on your plan and enabled. If it is supplied when your store does not have the feature enabled, it will be silently ignored. */
export type RatingSearchFilterInput = {
  /** Maximum rating of the product. */
  maxRating?: number | null | undefined;
  /** Minimum rating of the product. */
  minRating?: number | null | undefined;
};

/** Sort to use for the product results. Relevance is the default for textual search terms, and “Featured” is the default for category page contexts without a search term. */
export type SearchProductsSortInput =
  | 'A_TO_Z'
  | 'BEST_REVIEWED'
  | 'BEST_SELLING'
  | 'FEATURED'
  | 'HIGHEST_PRICE'
  | 'LOWEST_PRICE'
  | 'NEWEST'
  | 'RELEVANCE'
  | 'Z_TO_A';

/** The user input for text form fields. */
export type TextFormFieldInput = {
  /** The custom form field ID. */
  fieldEntityId: number;
  /** Text value. */
  text: string;
};

/** Update cart line item data object */
export type UpdateCartLineItemDataInput = {
  /** The gift certificate */
  giftCertificate?: CartGiftCertificateInput | null | undefined;
  /** The cart line item */
  lineItem?: CartLineItemInput | null | undefined;
};

/** Update cart line item input object */
export type UpdateCartLineItemInput = {
  /** The cart id */
  cartEntityId: string;
  /** Update cart line item data object */
  data: UpdateCartLineItemDataInput;
  /** The line item id */
  lineItemEntityId: string;
  /** Version number. When provided, will reject the request if the version number is not the latest version of the cart, in order to prevent race conditions. */
  version?: number | null | undefined;
};

/** Data fields to update on address. */
export type UpdateCustomerAddressDataInput = {
  /** First line for the street address. */
  address1?: string | null | undefined;
  /** Second line for the street address. */
  address2?: string | null | undefined;
  /** City. */
  city?: string | null | undefined;
  /** Company name associated with the address. */
  company?: string | null | undefined;
  /** 2-letter country code. */
  countryCode?: string | null | undefined;
  /** First name of address owner. */
  firstName?: string | null | undefined;
  /** Additional form fields defined by merchant. */
  formFields?: CustomerFormFieldsInput | null | undefined;
  /** Last name of the address owner. */
  lastName?: string | null | undefined;
  /** Phone number. */
  phone?: string | null | undefined;
  /** Postal code for the address. This is only required for certain countries. */
  postalCode?: string | null | undefined;
  /** Name of State or Province. */
  stateOrProvince?: string | null | undefined;
};

/** Input for updating a customer address. */
export type UpdateCustomerAddressInput = {
  /** ID of the address to update. */
  addressEntityId: number;
  /** Data fields to update on address. */
  data: UpdateCustomerAddressDataInput;
};

/** The values to use for customer update operation. */
export type UpdateCustomerInput = {
  /** The company of the customer. */
  company?: string | null | undefined;
  /** The email of the customer. */
  email?: string | null | undefined;
  /** The first name of the customer. */
  firstName?: string | null | undefined;
  /** The custom form fields that the customer filled out. */
  formFields?: CustomerFormFieldsInput | null | undefined;
  /** The last name of the customer. */
  lastName?: string | null | undefined;
  /** The phone number of the customer. */
  phone?: string | null | undefined;
};

/** Web page type */
export type WebPageType =
  | 'BLOG'
  | 'CONTACT'
  | 'LINK'
  | 'NORMAL'
  | 'RAW';

/** Object containing filters for querying web pages */
export type WebPagesFiltersInput = {
  /** Ids of the expected pages. */
  entityIds?: Array<number> | null | undefined;
  /** Whether the expected pages are visible in the navigation bar. */
  isVisibleInNavigation?: boolean | null | undefined;
  /** Type of the expected pages. */
  pageType?: WebPageType | null | undefined;
  /** Parent IDs of the expected pages. */
  parentEntityIds?: Array<number> | null | undefined;
};

/** Wishlist item input object */
export type WishlistItemInput = {
  /** An id of the product from the wishlist. */
  productEntityId: number;
  /** An id of the specific product variant from the wishlist. */
  variantEntityId?: number | null | undefined;
};

export type CreateCartMutationVariables = Exact<{
  input: CreateCartInput;
}>;


export type CreateCartMutation = { cart: { createCart: { cart: { entityId: string, currencyCode: string, amount: { value: unknown, currencyCode: string }, lineItems: { totalQuantity: number, physicalItems: Array<{ entityId: string, productEntityId: number, variantEntityId: number | null, name: string, sku: string | null, quantity: number, listPrice: { value: unknown, currencyCode: string }, salePrice: { value: unknown, currencyCode: string }, selectedOptions: Array<
              | { entityId: number, name: string }
              | { entityId: number, name: string }
              | { entityId: number, name: string }
              | { entityId: number, name: string }
              | { value: string, valueEntityId: number, entityId: number, name: string }
              | { entityId: number, name: string }
              | { entityId: number, name: string }
            > }>, digitalItems: Array<{ entityId: string, productEntityId: number, name: string, quantity: number }>, giftCertificates: Array<{ entityId: string, name: string }> } } | null } | null } };

export type AddCartLineItemsMutationVariables = Exact<{
  input: AddCartLineItemsInput;
}>;


export type AddCartLineItemsMutation = { cart: { addCartLineItems: { cart: { entityId: string, currencyCode: string, amount: { value: unknown, currencyCode: string }, lineItems: { totalQuantity: number, physicalItems: Array<{ entityId: string, productEntityId: number, variantEntityId: number | null, name: string, sku: string | null, quantity: number, listPrice: { value: unknown, currencyCode: string }, salePrice: { value: unknown, currencyCode: string }, selectedOptions: Array<
              | { entityId: number, name: string }
              | { entityId: number, name: string }
              | { entityId: number, name: string }
              | { entityId: number, name: string }
              | { value: string, valueEntityId: number, entityId: number, name: string }
              | { entityId: number, name: string }
              | { entityId: number, name: string }
            > }>, digitalItems: Array<{ entityId: string, productEntityId: number, name: string, quantity: number }> } } | null } | null } };

export type UpdateCartLineItemMutationVariables = Exact<{
  input: UpdateCartLineItemInput;
}>;


export type UpdateCartLineItemMutation = { cart: { updateCartLineItem: { cart: { entityId: string, amount: { value: unknown, currencyCode: string }, lineItems: { totalQuantity: number, physicalItems: Array<{ entityId: string, productEntityId: number, name: string, quantity: number, salePrice: { value: unknown, currencyCode: string } }> } } | null } | null } };

export type DeleteCartLineItemMutationVariables = Exact<{
  input: DeleteCartLineItemInput;
}>;


export type DeleteCartLineItemMutation = { cart: { deleteCartLineItem: { deletedLineItemEntityId: string | null, cart: { entityId: string, amount: { value: unknown, currencyCode: string }, lineItems: { totalQuantity: number, physicalItems: Array<{ entityId: string, name: string, quantity: number }> } } | null } | null } };

export type DeleteCartMutationVariables = Exact<{
  input: DeleteCartInput;
}>;


export type DeleteCartMutation = { cart: { deleteCart: { deletedCartEntityId: string | null } | null } };

export type CreateCartRedirectUrlsMutationVariables = Exact<{
  input: CreateCartRedirectUrlsInput;
}>;


export type CreateCartRedirectUrlsMutation = { cart: { createCartRedirectUrls: { redirectUrls: { embeddedCheckoutUrl: string, redirectedCheckoutUrl: string } | null } } };

export type UpdateCustomerMutationVariables = Exact<{
  input: UpdateCustomerInput;
}>;


export type UpdateCustomerMutation = { customer: { updateCustomer: { customer: { entityId: number, email: string, firstName: string, lastName: string, phone: string, company: string } | null, errors: Array<
        | { message: string }
        | { message: string, path: Array<string> }
        | Record<PropertyKey, never>
      > } } };

export type AddCustomerAddressMutationVariables = Exact<{
  input: AddCustomerAddressInput;
}>;


export type AddCustomerAddressMutation = { customer: { addCustomerAddress: { address: { entityId: number, firstName: string, lastName: string, address1: string, address2: string | null, city: string, company: string | null, countryCode: string, stateOrProvince: string | null, phone: string | null, postalCode: string | null } | null, errors: Array<
        | { message: string }
        | { message: string }
        | { message: string, path: Array<string> }
      > } } };

export type UpdateCustomerAddressMutationVariables = Exact<{
  input: UpdateCustomerAddressInput;
}>;


export type UpdateCustomerAddressMutation = { customer: { updateCustomerAddress: { address: { entityId: number, firstName: string, lastName: string, address1: string, address2: string | null, city: string, company: string | null, countryCode: string, stateOrProvince: string | null, phone: string | null, postalCode: string | null } | null, errors: Array<
        | { message: string }
        | { message: string }
        | { message: string, path: Array<string> }
        | Record<PropertyKey, never>
      > } } };

export type DeleteCustomerAddressMutationVariables = Exact<{
  input: DeleteCustomerAddressInput;
}>;


export type DeleteCustomerAddressMutation = { customer: { deleteCustomerAddress: { errors: Array<
        | { message: string }
        | { message: string }
      > } } };

export type AddWishlistItemsMutationVariables = Exact<{
  input: AddWishlistItemsInput;
}>;


export type AddWishlistItemsMutation = { wishlist: { addWishlistItems: { result: { entityId: number, name: string, items: { edges: Array<{ node: { entityId: number, productEntityId: number, variantEntityId: number | null } }> | null } } } | null } };

export type DeleteWishlistItemsMutationVariables = Exact<{
  input: DeleteWishlistItemsInput;
}>;


export type DeleteWishlistItemsMutation = { wishlist: { deleteWishlistItems: { result: { entityId: number, name: string } } | null } };

export type LoginMutationVariables = Exact<{
  email: string;
  password: string;
}>;


export type LoginMutation = { login: { customer: { entityId: number, firstName: string, lastName: string, email: string } | null } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout: { result: string } };

export type SearchProductsQueryVariables = Exact<{
  searchTerm?: string | null | undefined;
  categoryEntityId?: number | null | undefined;
  categoryEntityIds?: Array<number> | number | null | undefined;
  brandEntityIds?: Array<number> | number | null | undefined;
  price?: PriceSearchFilterInput | null | undefined;
  rating?: RatingSearchFilterInput | null | undefined;
  hideOutOfStock?: boolean | null | undefined;
  first?: number | null | undefined;
  after?: string | null | undefined;
  sort?: SearchProductsSortInput | null | undefined;
}>;


export type SearchProductsQuery = { site: { search: { searchProducts: { products: { pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null, endCursor: string | null }, collectionInfo: { totalItems: unknown } | null, edges: Array<{ cursor: string, node: { entityId: number, name: string, sku: string, path: string, description: string, plainTextDescription: string, defaultImage: { url: string, altText: string } | null, images: { edges: Array<{ node: { url: string, altText: string, isDefault: boolean } }> | null }, brand: { entityId: number, name: string } | null, prices: { price: { value: unknown, currencyCode: string }, salePrice: { value: unknown, currencyCode: string } | null, retailPrice: { value: unknown, currencyCode: string } | null, priceRange: { min: { value: unknown, currencyCode: string }, max: { value: unknown, currencyCode: string } } } | null, availabilityV2:
                | { status: ProductAvailabilityStatus, description: string }
                | { status: ProductAvailabilityStatus, description: string }
                | { status: ProductAvailabilityStatus, description: string }
              , inventory: { aggregated: { availableToSell: number, warningLevel: number } | null } } }> | null }, filters: { edges: Array<{ node:
              | { displayProductCount: boolean, name: string, isCollapsedByDefault: boolean, brands: { edges: Array<{ node: { entityId: number, name: string, isSelected: boolean, productCount: number } }> | null } }
              | { displayProductCount: boolean, name: string, isCollapsedByDefault: boolean, categories: { edges: Array<{ node: { entityId: number, name: string, isSelected: boolean, productCount: number } }> | null } }
              | { name: string, isCollapsedByDefault: boolean }
              | { name: string, isCollapsedByDefault: boolean, selected: { minPrice: number | null, maxPrice: number | null } | null }
              | { name: string, isCollapsedByDefault: boolean }
              | { name: string, isCollapsedByDefault: boolean, ratings: { edges: Array<{ node: { value: string, isSelected: boolean, productCount: number } }> | null } }
             }> | null } } } } };

export type GetProductByIdQueryVariables = Exact<{
  entityId: number;
  variantEntityId?: number | null | undefined;
}>;


export type GetProductByIdQuery = { site: { product: { entityId: number, name: string, sku: string, path: string, description: string, plainTextDescription: string, addToCartUrl: string, upc: string | null, mpn: string | null, gtin: string | null, condition: ProductConditionType | null, weight: { value: number, unit: string } | null, defaultImage: { url: string, altText: string } | null, images: { edges: Array<{ node: { url: string, urlOriginal: string, altText: string, isDefault: boolean } }> | null }, brand: { entityId: number, name: string, path: string } | null, categories: { edges: Array<{ node: { entityId: number, name: string, path: string } }> | null }, prices: { price: { value: unknown, currencyCode: string }, salePrice: { value: unknown, currencyCode: string } | null, retailPrice: { value: unknown, currencyCode: string } | null, basePrice: { value: unknown, currencyCode: string } | null, priceRange: { min: { value: unknown, currencyCode: string }, max: { value: unknown, currencyCode: string } } } | null, availabilityV2:
        | { status: ProductAvailabilityStatus, description: string }
        | { status: ProductAvailabilityStatus, description: string }
        | { status: ProductAvailabilityStatus, description: string }
      , inventory: { isInStock: boolean, hasVariantInventory: boolean, aggregated: { availableToSell: number, warningLevel: number } | null }, reviewSummary: { summationOfRatings: number, numberOfReviews: number, averageRating: number }, productOptions: { edges: Array<{ node:
            | { checkedByDefault: boolean, label: string, checkedOptionValueEntityId: number, uncheckedOptionValueEntityId: number, entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean }
            | { earliest: unknown, latest: unknown, limitDateBy: LimitDateOption, entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean, defaultDate: unknown }
            | { entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean }
            | { minLength: number | null, maxLength: number | null, maxLines: number | null, entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean, defaultText: string | null }
            | { displayStyle: string, entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean, values: { edges: Array<{ node:
                    | { entityId: number, label: string, isDefault: boolean, isSelected: boolean | null }
                    | { productId: number, entityId: number, label: string, isDefault: boolean, isSelected: boolean | null, defaultImage: { url: string } | null }
                    | { hexColors: Array<string>, imageUrl: string | null, entityId: number, label: string, isDefault: boolean, isSelected: boolean | null }
                   }> | null } }
            | { lowest: number | null, highest: number | null, isIntegerOnly: boolean, limitNumberBy: LimitInputBy, entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean, defaultNumber: number | null }
            | { minLength: number | null, maxLength: number | null, entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean, defaultText: string | null }
           }> | null }, variants: { edges: Array<{ node: { entityId: number, sku: string, isPurchasable: boolean, defaultImage: { url: string, altText: string } | null, prices: { price: { value: unknown, currencyCode: string }, salePrice: { value: unknown, currencyCode: string } | null } | null, inventory: { isInStock: boolean, aggregated: { availableToSell: unknown, warningLevel: number } | null } | null, options: { edges: Array<{ node: { entityId: number, displayName: string, values: { edges: Array<{ node: { entityId: number, label: string } }> | null } } }> | null } } }> | null }, relatedProducts: { edges: Array<{ node: { entityId: number, name: string, path: string, defaultImage: { url: string } | null, prices: { price: { value: unknown, currencyCode: string } } | null } }> | null }, customFields: { edges: Array<{ node: { entityId: number, name: string, value: string } }> | null }, seo: { pageTitle: string, metaDescription: string, metaKeywords: string } } | null } };

export type GetProductByPathQueryVariables = Exact<{
  path: string;
}>;


export type GetProductByPathQuery = { site: { route: { node:
        | { entityId: number, name: string, sku: string, path: string, description: string, plainTextDescription: string, addToCartUrl: string, defaultImage: { url: string, altText: string } | null, images: { edges: Array<{ node: { url: string, altText: string, isDefault: boolean } }> | null }, brand: { entityId: number, name: string, path: string } | null, prices: { price: { value: unknown, currencyCode: string }, salePrice: { value: unknown, currencyCode: string } | null, retailPrice: { value: unknown, currencyCode: string } | null, priceRange: { min: { value: unknown, currencyCode: string }, max: { value: unknown, currencyCode: string } } } | null, availabilityV2:
            | { status: ProductAvailabilityStatus, description: string }
            | { status: ProductAvailabilityStatus, description: string }
            | { status: ProductAvailabilityStatus, description: string }
          , inventory: { isInStock: boolean, hasVariantInventory: boolean, aggregated: { availableToSell: number, warningLevel: number } | null }, productOptions: { edges: Array<{ node:
                | { checkedByDefault: boolean, label: string, checkedOptionValueEntityId: number, uncheckedOptionValueEntityId: number, entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean }
                | { entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean }
                | { entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean }
                | { entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean }
                | { displayStyle: string, entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean, values: { edges: Array<{ node:
                        | { entityId: number, label: string, isDefault: boolean, isSelected: boolean | null }
                        | { entityId: number, label: string, isDefault: boolean, isSelected: boolean | null }
                        | { hexColors: Array<string>, imageUrl: string | null, entityId: number, label: string, isDefault: boolean, isSelected: boolean | null }
                       }> | null } }
                | { entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean }
                | { entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean }
               }> | null }, variants: { edges: Array<{ node: { entityId: number, sku: string, isPurchasable: boolean, prices: { price: { value: unknown, currencyCode: string }, salePrice: { value: unknown, currencyCode: string } | null } | null, inventory: { isInStock: boolean, aggregated: { availableToSell: unknown } | null } | null, options: { edges: Array<{ node: { entityId: number, displayName: string, values: { edges: Array<{ node: { entityId: number, label: string } }> | null } } }> | null } } }> | null } }
        | Record<PropertyKey, never>
       | null } } };

export type GetConfiguredProductQueryVariables = Exact<{
  entityId: number;
  optionValueIds?: Array<OptionValueId> | OptionValueId | null | undefined;
}>;


export type GetConfiguredProductQuery = { site: { product: { entityId: number, name: string, sku: string, path: string, defaultImage: { url: string, altText: string } | null, prices: { price: { value: unknown, currencyCode: string }, salePrice: { value: unknown, currencyCode: string } | null, basePrice: { value: unknown, currencyCode: string } | null } | null, availabilityV2:
        | { status: ProductAvailabilityStatus, description: string }
        | { status: ProductAvailabilityStatus, description: string }
        | { status: ProductAvailabilityStatus, description: string }
      , inventory: { isInStock: boolean, aggregated: { availableToSell: number, warningLevel: number } | null }, productOptions: { edges: Array<{ node:
            | { checkedByDefault: boolean, label: string, checkedOptionValueEntityId: number, uncheckedOptionValueEntityId: number, entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean }
            | { entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean }
            | { entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean }
            | { entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean }
            | { displayStyle: string, entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean, values: { edges: Array<{ node:
                    | { entityId: number, label: string, isDefault: boolean, isSelected: boolean | null }
                    | { entityId: number, label: string, isDefault: boolean, isSelected: boolean | null }
                    | { hexColors: Array<string>, imageUrl: string | null, entityId: number, label: string, isDefault: boolean, isSelected: boolean | null }
                   }> | null } }
            | { entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean }
            | { entityId: number, displayName: string, isRequired: boolean, isVariantOption: boolean }
           }> | null } } | null } };

export type GetCartQueryVariables = Exact<{
  cartEntityId?: string | null | undefined;
}>;


export type GetCartQuery = { site: { cart: { entityId: string, currencyCode: string, isTaxIncluded: boolean, baseAmount: { value: unknown, currencyCode: string }, discountedAmount: { value: unknown, currencyCode: string }, amount: { value: unknown, currencyCode: string }, discounts: Array<{ entityId: string, discountedAmount: { value: unknown, currencyCode: string } }>, lineItems: { totalQuantity: number, physicalItems: Array<{ entityId: string, parentEntityId: string | null, variantEntityId: number | null, productEntityId: number, sku: string | null, name: string, path: string, imageUrl: string | null, brand: string | null, quantity: number, isTaxable: boolean, isMutable: boolean, isShippingRequired: boolean, listPrice: { value: unknown, currencyCode: string }, originalPrice: { value: unknown, currencyCode: string }, salePrice: { value: unknown, currencyCode: string }, extendedListPrice: { value: unknown, currencyCode: string }, extendedSalePrice: { value: unknown, currencyCode: string }, discountedAmount: { value: unknown, currencyCode: string }, couponAmount: { value: unknown, currencyCode: string }, discounts: Array<{ entityId: string, discountedAmount: { value: unknown, currencyCode: string } }>, selectedOptions: Array<
            | { value: string, valueEntityId: number, entityId: number, name: string }
            | { entityId: number, name: string, date: { utc: unknown } }
            | { entityId: number, name: string }
            | { entityId: number, name: string }
            | { value: string, valueEntityId: number, entityId: number, name: string }
            | { number: number, entityId: number, name: string }
            | { text: string, entityId: number, name: string }
          > }>, digitalItems: Array<{ entityId: string, parentEntityId: string | null, variantEntityId: number | null, productEntityId: number, sku: string | null, name: string, path: string, imageUrl: string | null, quantity: number, listPrice: { value: unknown, currencyCode: string }, salePrice: { value: unknown, currencyCode: string }, extendedListPrice: { value: unknown, currencyCode: string }, extendedSalePrice: { value: unknown, currencyCode: string }, selectedOptions: Array<
            | { entityId: number, name: string }
            | { entityId: number, name: string }
            | { entityId: number, name: string }
            | { entityId: number, name: string }
            | { value: string, valueEntityId: number, entityId: number, name: string }
            | { entityId: number, name: string }
            | { entityId: number, name: string }
          > }>, giftCertificates: Array<{ entityId: string, name: string, isTaxable: boolean, message: string | null, amount: { value: unknown, currencyCode: string }, sender: { name: string, email: string }, recipient: { name: string, email: string } }>, customItems: Array<{ entityId: string, sku: string | null, name: string, quantity: number, listPrice: { value: unknown, currencyCode: string }, extendedListPrice: { value: unknown, currencyCode: string } }> } } | null } };

export type GetCategoryTreeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCategoryTreeQuery = { site: { categoryTree: Array<{ entityId: number, name: string, path: string, description: string, productCount: number, hasChildren: boolean, children: Array<{ entityId: number, name: string, path: string, productCount: number, hasChildren: boolean, children: Array<{ entityId: number, name: string, path: string, productCount: number, hasChildren: boolean }> }> }> } };

export type GetBrandsQueryVariables = Exact<{
  first?: number | null | undefined;
}>;


export type GetBrandsQuery = { site: { brands: { edges: Array<{ node: { entityId: number, name: string, path: string, defaultImage: { url: string } | null } }> | null } } };

export type GetStoreSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStoreSettingsQuery = { site: { settings: { storeName: string, url: { vanityUrl: string, cdnUrl: string }, logo: { title: string, image: { url: string } }, contact: { address: string, email: string, phone: string } | null, socialMediaLinks: Array<{ name: string, url: string }> } | null } };

export type GetCustomerQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCustomerQuery = { customer: { entityId: number, email: string, firstName: string, lastName: string, phone: string, company: string, customerGroupId: number, customerGroupName: string | null, addressCount: number, isSubscribedToNewsletter: boolean, storeCredit: Array<{ value: unknown, currencyCode: string }> } | null };

export type GetCustomerAddressesQueryVariables = Exact<{
  first?: number | null | undefined;
  after?: string | null | undefined;
}>;


export type GetCustomerAddressesQuery = { customer: { entityId: number, addresses: { pageInfo: { hasNextPage: boolean, endCursor: string | null }, edges: Array<{ node: { entityId: number, firstName: string, lastName: string, address1: string, address2: string | null, city: string, company: string | null, countryCode: string, stateOrProvince: string | null, phone: string | null, postalCode: string | null } }> | null } } | null };

export type GetCustomerOrdersQueryVariables = Exact<{
  first?: number | null | undefined;
  after?: string | null | undefined;
}>;


export type GetCustomerOrdersQuery = { customer: { entityId: number, orders: { pageInfo: { hasNextPage: boolean, endCursor: string | null }, edges: Array<{ node: { entityId: number, orderedAt: { utc: unknown }, updatedAt: { utc: unknown }, status: { value: OrderStatusValue | null, label: string }, totalIncTax: { value: unknown, currencyCode: string } } }> | null } | null } | null };

export type GetOrderDetailsQueryVariables = Exact<{
  filter?: OrderFilterInput | null | undefined;
}>;


export type GetOrderDetailsQuery = { site: { order: { entityId: number, customerMessage: string | null, orderedAt: { utc: unknown }, updatedAt: { utc: unknown }, status: { value: OrderStatusValue | null, label: string }, billingAddress: { firstName: string | null, lastName: string | null, email: string | null, company: string | null, address1: string | null, address2: string | null, city: string | null, stateOrProvince: string | null, postalCode: string, countryCode: string, phone: string | null }, consignments: { shipping: { edges: Array<{ node: { entityId: number, shippingAddress: { firstName: string | null, lastName: string | null, email: string | null, company: string | null, address1: string | null, address2: string | null, city: string | null, stateOrProvince: string | null, postalCode: string, countryCode: string, phone: string | null }, shippingCost: { value: unknown, currencyCode: string }, handlingCost: { value: unknown, currencyCode: string }, shipments: { edges: Array<{ node: { entityId: number, shippingProviderName: string, shippingMethodName: string, shippedAt: { utc: unknown }, tracking:
                      | { __typename: 'OrderShipmentNumberAndUrlTracking', number: string, url: string }
                      | { __typename: 'OrderShipmentNumberOnlyTracking', number: string }
                      | { __typename: 'OrderShipmentUrlOnlyTracking', url: string }
                     | null } }> | null }, lineItems: { edges: Array<{ node: { entityId: number, productEntityId: number, name: string, sku: string, quantity: number, subTotalListPrice: { value: unknown, currencyCode: string }, subTotalSalePrice: { value: unknown, currencyCode: string }, image: { url: string, altText: string } | null } }> | null } } }> | null } } | null, subTotal: { value: unknown, currencyCode: string }, shippingCostTotal: { value: unknown, currencyCode: string }, taxTotal: { value: unknown, currencyCode: string }, totalIncTax: { value: unknown, currencyCode: string }, discounts: { nonCouponDiscountTotal: { value: unknown, currencyCode: string }, couponDiscounts: Array<{ couponCode: string, discountedAmount: { value: unknown, currencyCode: string } }> } } | null } };

export type GetCustomerWishlistsQueryVariables = Exact<{
  first?: number | null | undefined;
}>;


export type GetCustomerWishlistsQuery = { customer: { entityId: number, wishlists: { edges: Array<{ node: { entityId: number, name: string, isPublic: boolean, token: string, items: { edges: Array<{ node: { entityId: number, productEntityId: number, variantEntityId: number | null, product: { entityId: number, name: string, path: string, prices: { price: { value: unknown, currencyCode: string }, salePrice: { value: unknown, currencyCode: string } | null } | null, defaultImage: { url: string, altText: string } | null } | null } }> | null } } }> | null } } | null };

export type GetWebPagesQueryVariables = Exact<{
  filters?: WebPagesFiltersInput | null | undefined;
}>;


export type GetWebPagesQuery = { site: { content: { pages: { edges: Array<{ node:
            | { __typename: 'BlogIndexPage', entityId: number, name: string }
            | { __typename: 'ContactPage', path: string, entityId: number, name: string }
            | { __typename: 'ExternalLinkPage', link: string, entityId: number, name: string }
            | { __typename: 'NormalPage', path: string, plainTextSummary: string, entityId: number, name: string }
            | { __typename: 'RawHtmlPage', entityId: number, name: string }
           }> | null } } } };

export type GetWebPageQueryVariables = Exact<{
  entityId: number;
}>;


export type GetWebPageQuery = { site: { content: { page:
        | { __typename: 'BlogIndexPage', name: string, parentEntityId: number | null, entityId: number, children: { edges: Array<{ node:
                | { name: string }
                | { name: string }
                | { name: string }
                | { path: string, name: string }
                | { name: string }
               }> | null } }
        | { __typename: 'ContactPage', path: string, name: string, parentEntityId: number | null, entityId: number, children: { edges: Array<{ node:
                | { name: string }
                | { name: string }
                | { name: string }
                | { path: string, name: string }
                | { name: string }
               }> | null } }
        | { __typename: 'ExternalLinkPage', name: string, parentEntityId: number | null, entityId: number, children: { edges: Array<{ node:
                | { name: string }
                | { name: string }
                | { name: string }
                | { path: string, name: string }
                | { name: string }
               }> | null } }
        | { __typename: 'NormalPage', name: string, htmlBody: string, plainTextSummary: string, path: string, parentEntityId: number | null, entityId: number, children: { edges: Array<{ node:
                | { name: string }
                | { name: string }
                | { name: string }
                | { path: string, name: string }
                | { name: string }
               }> | null } }
        | { __typename: 'RawHtmlPage', name: string, parentEntityId: number | null, entityId: number, children: { edges: Array<{ node:
                | { name: string }
                | { name: string }
                | { name: string }
                | { path: string, name: string }
                | { name: string }
               }> | null } }
       | null } } };
