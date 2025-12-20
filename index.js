/**
 * BigCommerce Storefront Agent SDK
 * A lightweight JavaScript library for AI agent integration with BigCommerce storefronts
 * Designed for injection via Script Manager into Stencil themes
 * 
 * @version 1.0.0
 */

(function(window) {
  'use strict';

  // ============================================================================
  // GRAPHQL QUERIES & MUTATIONS
  // ============================================================================

  const QUERIES = {
    /**
     * Product Search Query
     * Supports text search, category filtering, price ranges, and faceted search
     */
    SEARCH_PRODUCTS: `
      query SearchProducts(
        $searchTerm: String
        $categoryEntityId: Int
        $categoryEntityIds: [Int!]
        $brandEntityIds: [Int!]
        $price: PriceSearchFilterInput
        $rating: RatingSearchFilterInput
        $hideOutOfStock: Boolean
        $first: Int = 12
        $after: String
        $sort: SearchProductsSortInput
      ) {
        site {
          search {
            searchProducts(
              filters: {
                searchTerm: $searchTerm
                categoryEntityId: $categoryEntityId
                categoryEntityIds: $categoryEntityIds
                brandEntityIds: $brandEntityIds
                price: $price
                rating: $rating
                hideOutOfStock: $hideOutOfStock
              }
              sort: $sort
            ) {
              products(first: $first, after: $after) {
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                  startCursor
                  endCursor
                }
                collectionInfo {
                  totalItems
                }
                edges {
                  cursor
                  node {
                    entityId
                    name
                    sku
                    path
                    description
                    plainTextDescription(characterLimit: 200)
                    defaultImage {
                      url(width: 400, height: 400)
                      altText
                    }
                    images {
                      edges {
                        node {
                          url(width: 400, height: 400)
                          altText
                          isDefault
                        }
                      }
                    }
                    brand {
                      entityId
                      name
                    }
                    prices {
                      price {
                        value
                        currencyCode
                      }
                      salePrice {
                        value
                        currencyCode
                      }
                      retailPrice {
                        value
                        currencyCode
                      }
                      priceRange {
                        min { value currencyCode }
                        max { value currencyCode }
                      }
                    }
                    availabilityV2 {
                      status
                      description
                    }
                    inventory {
                      aggregated {
                        availableToSell
                        warningLevel
                      }
                    }
                  }
                }
              }
              filters {
                edges {
                  node {
                    name
                    isCollapsedByDefault
                    ... on CategorySearchFilter {
                      displayProductCount
                      categories {
                        edges {
                          node {
                            entityId
                            name
                            isSelected
                            productCount
                          }
                        }
                      }
                    }
                    ... on BrandSearchFilter {
                      displayProductCount
                      brands {
                        edges {
                          node {
                            entityId
                            name
                            isSelected
                            productCount
                          }
                        }
                      }
                    }
                    ... on PriceSearchFilter {
                      selected {
                        minPrice
                        maxPrice
                      }
                    }
                    ... on RatingSearchFilter {
                      ratings {
                        edges {
                          node {
                            value
                            isSelected
                            productCount
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,

    /**
     * Get Product Details by Entity ID
     * Full product information including options, variants, and pricing
     */
    GET_PRODUCT_BY_ID: `
      query GetProductById($entityId: Int!, $variantEntityId: Int) {
        site {
          product(entityId: $entityId, variantEntityId: $variantEntityId) {
            entityId
            name
            sku
            path
            description
            plainTextDescription
            addToCartUrl
            upc
            mpn
            gtin
            condition
            weight {
              value
              unit
            }
            defaultImage {
              url(width: 800, height: 800)
              altText
            }
            images {
              edges {
                node {
                  url(width: 800, height: 800)
                  urlOriginal
                  altText
                  isDefault
                }
              }
            }
            brand {
              entityId
              name
              path
            }
            categories {
              edges {
                node {
                  entityId
                  name
                  path
                }
              }
            }
            prices {
              price {
                value
                currencyCode
              }
              salePrice {
                value
                currencyCode
              }
              retailPrice {
                value
                currencyCode
              }
              basePrice {
                value
                currencyCode
              }
              priceRange {
                min { value currencyCode }
                max { value currencyCode }
              }
            }
            availabilityV2 {
              status
              description
            }
            inventory {
              isInStock
              hasVariantInventory
              aggregated {
                availableToSell
                warningLevel
              }
            }
            reviewSummary {
              summationOfRatings
              numberOfReviews
              averageRating
            }
            productOptions(first: 50) {
              edges {
                node {
                  entityId
                  displayName
                  isRequired
                  isVariantOption
                  ... on MultipleChoiceOption {
                    displayStyle
                    values(first: 50) {
                      edges {
                        node {
                          entityId
                          label
                          isDefault
                          isSelected
                          ... on SwatchOptionValue {
                            hexColors
                            imageUrl(width: 100)
                          }
                          ... on ProductPickListOptionValue {
                            productId
                            defaultImage {
                              url(width: 100)
                            }
                          }
                        }
                      }
                    }
                  }
                  ... on CheckboxOption {
                    checkedByDefault
                    label
                    checkedOptionValueEntityId
                    uncheckedOptionValueEntityId
                  }
                  ... on NumberFieldOption {
                    defaultNumber: defaultValue
                    lowest
                    highest
                    isIntegerOnly
                    limitNumberBy
                  }
                  ... on TextFieldOption {
                    defaultText: defaultValue
                    minLength
                    maxLength
                  }
                  ... on MultiLineTextFieldOption {
                    defaultText: defaultValue
                    minLength
                    maxLength
                    maxLines
                  }
                  ... on DateFieldOption {
                    defaultDate: defaultValue
                    earliest
                    latest
                    limitDateBy
                  }
                }
              }
            }
            variants(first: 250) {
              edges {
                node {
                  entityId
                  sku
                  isPurchasable
                  defaultImage {
                    url(width: 400)
                    altText
                  }
                  prices {
                    price {
                      value
                      currencyCode
                    }
                    salePrice {
                      value
                      currencyCode
                    }
                  }
                  inventory {
                    isInStock
                    aggregated {
                      availableToSell
                      warningLevel
                    }
                  }
                  options {
                    edges {
                      node {
                        entityId
                        displayName
                        values {
                          edges {
                            node {
                              entityId
                              label
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            relatedProducts {
              edges {
                node {
                  entityId
                  name
                  path
                  defaultImage {
                    url(width: 300)
                  }
                  prices {
                    price { value currencyCode }
                  }
                }
              }
            }
            customFields {
              edges {
                node {
                  entityId
                  name
                  value
                }
              }
            }
            seo {
              pageTitle
              metaDescription
              metaKeywords
            }
          }
        }
      }
    `,

    /**
     * Get Product by URL Path
     * Uses the route resolver to find products by their URL path
     */
    GET_PRODUCT_BY_PATH: `
      query GetProductByPath($path: String!) {
        site {
          route(path: $path) {
            node {
              ... on Product {
                entityId
                name
                sku
                path
                description
                plainTextDescription
                addToCartUrl
                defaultImage {
                  url(width: 800, height: 800)
                  altText
                }
                images {
                  edges {
                    node {
                      url(width: 800, height: 800)
                      altText
                      isDefault
                    }
                  }
                }
                brand {
                  entityId
                  name
                  path
                }
                prices {
                  price { value currencyCode }
                  salePrice { value currencyCode }
                  retailPrice { value currencyCode }
                  priceRange {
                    min { value currencyCode }
                    max { value currencyCode }
                  }
                }
                availabilityV2 {
                  status
                  description
                }
                inventory {
                  isInStock
                  hasVariantInventory
                  aggregated {
                    availableToSell
                    warningLevel
                  }
                }
                productOptions(first: 50) {
                  edges {
                    node {
                      entityId
                      displayName
                      isRequired
                      isVariantOption
                      ... on MultipleChoiceOption {
                        displayStyle
                        values(first: 50) {
                          edges {
                            node {
                              entityId
                              label
                              isDefault
                              isSelected
                              ... on SwatchOptionValue {
                                hexColors
                                imageUrl(width: 100)
                              }
                            }
                          }
                        }
                      }
                      ... on CheckboxOption {
                        checkedByDefault
                        label
                        checkedOptionValueEntityId
                        uncheckedOptionValueEntityId
                      }
                    }
                  }
                }
                variants(first: 250) {
                  edges {
                    node {
                      entityId
                      sku
                      isPurchasable
                      prices {
                        price { value currencyCode }
                        salePrice { value currencyCode }
                      }
                      inventory {
                        isInStock
                        aggregated {
                          availableToSell
                        }
                      }
                      options {
                        edges {
                          node {
                            entityId
                            displayName
                            values {
                              edges {
                                node {
                                  entityId
                                  label
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,

    /**
     * Get Configured Product (with selected options)
     * Returns variant-specific information based on option selections
     */
    GET_CONFIGURED_PRODUCT: `
      query GetConfiguredProduct($entityId: Int!, $optionValueIds: [OptionValueId!]) {
        site {
          product(entityId: $entityId, optionValueIds: $optionValueIds) {
            entityId
            name
            sku
            path
            defaultImage {
              url(width: 800, height: 800)
              altText
            }
            prices {
              price { value currencyCode }
              salePrice { value currencyCode }
              basePrice { value currencyCode }
            }
            availabilityV2 {
              status
              description
            }
            inventory {
              isInStock
              aggregated {
                availableToSell
                warningLevel
              }
            }
            productOptions(first: 50) {
              edges {
                node {
                  entityId
                  displayName
                  isRequired
                  isVariantOption
                  ... on MultipleChoiceOption {
                    displayStyle
                    values(first: 50) {
                      edges {
                        node {
                          entityId
                          label
                          isDefault
                          isSelected
                          ... on SwatchOptionValue {
                            hexColors
                            imageUrl(width: 100)
                          }
                        }
                      }
                    }
                  }
                  ... on CheckboxOption {
                    checkedByDefault
                    label
                    checkedOptionValueEntityId
                    uncheckedOptionValueEntityId
                  }
                }
              }
            }
          }
        }
      }
    `,

    /**
     * Get Current Cart
     */
    GET_CART: `
      query GetCart($cartEntityId: String) {
        site {
          cart(entityId: $cartEntityId) {
            entityId
            currencyCode
            isTaxIncluded
            baseAmount { value currencyCode }
            discountedAmount { value currencyCode }
            amount { value currencyCode }
            discounts {
              entityId
              discountedAmount { value currencyCode }
            }
            lineItems {
              totalQuantity
              physicalItems {
                entityId
                parentEntityId
                variantEntityId
                productEntityId
                sku
                name
                path
                imageUrl
                brand
                quantity
                isTaxable
                isMutable
                isShippingRequired
                listPrice { value currencyCode }
                originalPrice { value currencyCode }
                salePrice { value currencyCode }
                extendedListPrice { value currencyCode }
                extendedSalePrice { value currencyCode }
                discountedAmount { value currencyCode }
                couponAmount { value currencyCode }
                discounts {
                  entityId
                  discountedAmount { value currencyCode }
                }
                selectedOptions {
                  entityId
                  name
                  ... on CartSelectedCheckboxOption {
                    value
                    valueEntityId
                  }
                  ... on CartSelectedMultipleChoiceOption {
                    value
                    valueEntityId
                  }
                  ... on CartSelectedTextFieldOption {
                    text
                  }
                  ... on CartSelectedNumberFieldOption {
                    number
                  }
                  ... on CartSelectedDateFieldOption {
                    date { utc }
                  }
                }
              }
              digitalItems {
                entityId
                parentEntityId
                variantEntityId
                productEntityId
                sku
                name
                path
                imageUrl
                quantity
                listPrice { value currencyCode }
                salePrice { value currencyCode }
                extendedListPrice { value currencyCode }
                extendedSalePrice { value currencyCode }
                selectedOptions {
                  entityId
                  name
                  ... on CartSelectedMultipleChoiceOption {
                    value
                    valueEntityId
                  }
                }
              }
              giftCertificates {
                entityId
                name
                amount { value currencyCode }
                isTaxable
                sender { name email }
                recipient { name email }
                message
              }
              customItems {
                entityId
                sku
                name
                quantity
                listPrice { value currencyCode }
                extendedListPrice { value currencyCode }
              }
            }
          }
        }
      }
    `,

    /**
     * Get Category Tree
     */
    GET_CATEGORY_TREE: `
      query GetCategoryTree($depth: Int = 3) {
        site {
          categoryTree {
            entityId
            name
            path
            description
            productCount
            hasChildren
            image {
              url(width: 200)
              altText
            }
            children @include(if: true) {
              entityId
              name
              path
              productCount
              hasChildren
              children @include(if: true) {
                entityId
                name
                path
                productCount
                hasChildren
              }
            }
          }
        }
      }
    `,

    /**
     * Get Store Settings
     */
    GET_STORE_SETTINGS: `
      query GetStoreSettings {
        site {
          settings {
            storeName
            storeHash
            status
            url {
              vanityUrl
              cdnUrl
            }
            display {
              productComparison
            }
            logo {
              title
              image {
                url(width: 300)
              }
            }
            contact {
              address
              email
              phone
            }
            socialMediaLinks {
              name
              url
            }
          }
          currencies {
            edges {
              node {
                entityId
                code
                name
                isActive
                isDefault
                display {
                  symbol
                  symbolPlacement
                  decimalPlaces
                }
              }
            }
          }
        }
      }
    `
  };

  const MUTATIONS = {
    /**
     * Create Cart
     */
    CREATE_CART: `
      mutation CreateCart($input: CreateCartInput!) {
        cart {
          createCart(input: $input) {
            cart {
              entityId
              currencyCode
              amount { value currencyCode }
              lineItems {
                totalQuantity
                physicalItems {
                  entityId
                  productEntityId
                  variantEntityId
                  name
                  sku
                  quantity
                  listPrice { value currencyCode }
                  salePrice { value currencyCode }
                  selectedOptions {
                    entityId
                    name
                    ... on CartSelectedMultipleChoiceOption {
                      value
                      valueEntityId
                    }
                  }
                }
                digitalItems {
                  entityId
                  productEntityId
                  name
                  quantity
                }
                giftCertificates {
                  entityId
                  name
                }
              }
            }
            errors {
              ... on Error {
                message
              }
            }
          }
        }
      }
    `,

    /**
     * Add Cart Line Items
     */
    ADD_CART_LINE_ITEMS: `
      mutation AddCartLineItems($input: AddCartLineItemsInput!) {
        cart {
          addCartLineItems(input: $input) {
            cart {
              entityId
              currencyCode
              amount { value currencyCode }
              lineItems {
                totalQuantity
                physicalItems {
                  entityId
                  productEntityId
                  variantEntityId
                  name
                  sku
                  quantity
                  listPrice { value currencyCode }
                  salePrice { value currencyCode }
                  selectedOptions {
                    entityId
                    name
                    ... on CartSelectedMultipleChoiceOption {
                      value
                      valueEntityId
                    }
                  }
                }
                digitalItems {
                  entityId
                  productEntityId
                  name
                  quantity
                }
              }
            }
            errors {
              ... on Error {
                message
              }
            }
          }
        }
      }
    `,

    /**
     * Update Cart Line Item
     */
    UPDATE_CART_LINE_ITEM: `
      mutation UpdateCartLineItem($input: UpdateCartLineItemInput!) {
        cart {
          updateCartLineItem(input: $input) {
            cart {
              entityId
              amount { value currencyCode }
              lineItems {
                totalQuantity
                physicalItems {
                  entityId
                  productEntityId
                  name
                  quantity
                  salePrice { value currencyCode }
                }
              }
            }
            errors {
              ... on Error {
                message
              }
            }
          }
        }
      }
    `,

    /**
     * Delete Cart Line Item
     */
    DELETE_CART_LINE_ITEM: `
      mutation DeleteCartLineItem($input: DeleteCartLineItemInput!) {
        cart {
          deleteCartLineItem(input: $input) {
            cart {
              entityId
              amount { value currencyCode }
              lineItems {
                totalQuantity
                physicalItems {
                  entityId
                  name
                  quantity
                }
              }
            }
            deletedLineItemEntityId
            errors {
              ... on Error {
                message
              }
            }
          }
        }
      }
    `,

    /**
     * Delete Cart
     */
    DELETE_CART: `
      mutation DeleteCart($input: DeleteCartInput!) {
        cart {
          deleteCart(input: $input) {
            deletedCartEntityId
            errors {
              ... on Error {
                message
              }
            }
          }
        }
      }
    `,

    /**
     * Create Cart Redirect URLs (for checkout)
     */
    CREATE_CART_REDIRECT_URLS: `
      mutation CreateCartRedirectUrls($input: CreateCartRedirectUrlsInput!) {
        cart {
          createCartRedirectUrls(input: $input) {
            redirectUrls {
              embeddedCheckoutUrl
              redirectedCheckoutUrl
            }
            errors {
              ... on Error {
                message
              }
            }
          }
        }
      }
    `
  };

  // ============================================================================
  // SDK IMPLEMENTATION
  // ============================================================================

  class BigCommerceAgentSDK {
    constructor(options = {}) {
      this.graphqlEndpoint = options.graphqlEndpoint || '/graphql';
      this.token = options.token || null;
      this.cartId = options.cartId || this._getStoredCartId();
      this.debug = options.debug || false;
      this.currency = options.currency || null;
    }

    // -------------------------------------------------------------------------
    // Private Helper Methods
    // -------------------------------------------------------------------------

    _log(...args) {
      if (this.debug) {
        console.log('[BCAgentSDK]', ...args);
      }
    }

    _error(...args) {
      console.error('[BCAgentSDK Error]', ...args);
    }

    _getStoredCartId() {
      try {
        return localStorage.getItem('bc_agent_cart_id') || null;
      } catch (e) {
        return null;
      }
    }

    _setStoredCartId(cartId) {
      try {
        if (cartId) {
          localStorage.setItem('bc_agent_cart_id', cartId);
        } else {
          localStorage.removeItem('bc_agent_cart_id');
        }
      } catch (e) {
        this._error('Failed to store cart ID:', e);
      }
    }

    async _executeGraphQL(query, variables = {}, operationName = null) {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // Add authorization header if token is available
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const body = {
        query,
        variables
      };

      if (operationName) {
        body.operationName = operationName;
      }

      this._log('GraphQL Request:', { query: query.slice(0, 100) + '...', variables });

      try {
        const response = await fetch(this.graphqlEndpoint, {
          method: 'POST',
          credentials: 'same-origin',
          mode: 'cors',
          headers,
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.errors && result.errors.length > 0) {
          this._error('GraphQL Errors:', result.errors);
          throw new Error(result.errors.map(e => e.message).join(', '));
        }

        this._log('GraphQL Response:', result.data);
        return result.data;
      } catch (error) {
        this._error('GraphQL Request Failed:', error);
        throw error;
      }
    }

    _flattenEdges(connection) {
      if (!connection || !connection.edges) {
        return [];
      }
      return connection.edges.map(edge => edge.node);
    }

    _formatProduct(product) {
      if (!product) return null;

      return {
        ...product,
        images: this._flattenEdges(product.images),
        categories: this._flattenEdges(product.categories),
        productOptions: this._flattenEdges(product.productOptions)?.map(opt => ({
          ...opt,
          values: opt.values ? this._flattenEdges(opt.values) : []
        })),
        variants: this._flattenEdges(product.variants)?.map(v => ({
          ...v,
          options: this._flattenEdges(v.options)?.map(o => ({
            ...o,
            values: this._flattenEdges(o.values)
          }))
        })),
        relatedProducts: this._flattenEdges(product.relatedProducts),
        customFields: this._flattenEdges(product.customFields)
      };
    }

    // -------------------------------------------------------------------------
    // Product Search
    // -------------------------------------------------------------------------

    /**
     * Search for products with various filters
     * @param {Object} params Search parameters
     * @param {string} [params.searchTerm] - Text search query
     * @param {number} [params.categoryId] - Filter by single category ID
     * @param {number[]} [params.categoryIds] - Filter by multiple category IDs
     * @param {number[]} [params.brandIds] - Filter by brand IDs
     * @param {Object} [params.price] - Price range filter
     * @param {number} [params.price.minPrice] - Minimum price
     * @param {number} [params.price.maxPrice] - Maximum price
     * @param {Object} [params.rating] - Rating filter
     * @param {number} [params.rating.minRating] - Minimum rating (1-5)
     * @param {number} [params.rating.maxRating] - Maximum rating (1-5)
     * @param {boolean} [params.hideOutOfStock] - Hide out of stock products
     * @param {number} [params.first=12] - Number of results to return
     * @param {string} [params.after] - Cursor for pagination
     * @param {string} [params.sort] - Sort order (A_TO_Z, Z_TO_A, LOWEST_PRICE, HIGHEST_PRICE, NEWEST, BEST_SELLING, BEST_REVIEWED, RELEVANCE)
     * @returns {Promise<Object>} Search results with products and filters
     */
    async searchProducts(params = {}) {
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
        sort: params.sort || null
      };

      const data = await this._executeGraphQL(QUERIES.SEARCH_PRODUCTS, variables);
      const searchResult = data?.site?.search?.searchProducts;

      if (!searchResult) {
        return { products: [], filters: [], pageInfo: null, totalItems: 0 };
      }

      return {
        products: this._flattenEdges(searchResult.products).map(p => this._formatProduct(p)),
        filters: this._flattenEdges(searchResult.filters).map(f => ({
          ...f,
          categories: f.categories ? this._flattenEdges(f.categories) : undefined,
          brands: f.brands ? this._flattenEdges(f.brands) : undefined,
          ratings: f.ratings ? this._flattenEdges(f.ratings) : undefined
        })),
        pageInfo: searchResult.products?.pageInfo || null,
        totalItems: searchResult.products?.collectionInfo?.totalItems || 0
      };
    }

    // -------------------------------------------------------------------------
    // Product Details
    // -------------------------------------------------------------------------

    /**
     * Get product details by entity ID
     * @param {number} entityId - Product entity ID
     * @param {number} [variantEntityId] - Optional variant entity ID
     * @returns {Promise<Object>} Product details
     */
    async getProductById(entityId, variantEntityId = null) {
      const variables = {
        entityId: parseInt(entityId, 10),
        variantEntityId: variantEntityId ? parseInt(variantEntityId, 10) : null
      };

      const data = await this._executeGraphQL(QUERIES.GET_PRODUCT_BY_ID, variables);
      return this._formatProduct(data?.site?.product);
    }

    /**
     * Get product details by URL path
     * @param {string} path - Product URL path (e.g., '/product-name/')
     * @returns {Promise<Object>} Product details
     */
    async getProductByPath(path) {
      // Ensure path starts with /
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;

      const data = await this._executeGraphQL(QUERIES.GET_PRODUCT_BY_PATH, { path: normalizedPath });
      return this._formatProduct(data?.site?.route?.node);
    }

    /**
     * Get product with selected options (configured product)
     * @param {number} entityId - Product entity ID
     * @param {Array<{optionEntityId: number, valueEntityId: number}>} selectedOptions - Selected option values
     * @returns {Promise<Object>} Configured product with updated price/availability
     */
    async getConfiguredProduct(entityId, selectedOptions = []) {
      const optionValueIds = selectedOptions.map(opt => ({
        optionEntityId: parseInt(opt.optionEntityId, 10),
        valueEntityId: parseInt(opt.valueEntityId, 10)
      }));

      const data = await this._executeGraphQL(QUERIES.GET_CONFIGURED_PRODUCT, {
        entityId: parseInt(entityId, 10),
        optionValueIds
      });

      return this._formatProduct(data?.site?.product);
    }

    /**
     * Find variant by selected options
     * @param {number} productEntityId - Product entity ID
     * @param {Object} selectedOptions - Map of optionEntityId to valueEntityId
     * @returns {Promise<Object|null>} Matching variant or null
     */
    async findVariantByOptions(productEntityId, selectedOptions) {
      const product = await this.getProductById(productEntityId);
      
      if (!product || !product.variants) {
        return null;
      }

      // Find the variant that matches all selected options
      return product.variants.find(variant => {
        if (!variant.options || variant.options.length === 0) {
          return false;
        }

        // Check if all variant options match the selected options
        return variant.options.every(option => {
          const selectedValueId = selectedOptions[option.entityId];
          if (!selectedValueId) return false;

          return option.values.some(value => 
            value.entityId === parseInt(selectedValueId, 10)
          );
        });
      }) || null;
    }

    // -------------------------------------------------------------------------
    // Cart Operations
    // -------------------------------------------------------------------------

    /**
     * Get current cart
     * @param {string} [cartEntityId] - Optional cart ID (uses stored ID if not provided)
     * @returns {Promise<Object|null>} Cart object or null if no cart exists
     */
    async getCart(cartEntityId = null) {
      const id = cartEntityId || this.cartId;
      const data = await this._executeGraphQL(QUERIES.GET_CART, { cartEntityId: id });
      
      const cart = data?.site?.cart;
      
      // Update stored cart ID
      if (cart?.entityId) {
        this.cartId = cart.entityId;
        this._setStoredCartId(cart.entityId);
      }

      return cart;
    }

    /**
     * Create a new cart with line items
     * @param {Array} lineItems - Array of line items to add
     * @param {Object} lineItems[].productEntityId - Product entity ID
     * @param {number} lineItems[].quantity - Quantity
     * @param {number} [lineItems[].variantEntityId] - Variant entity ID
     * @param {Object} [lineItems[].selectedOptions] - Selected options
     * @returns {Promise<Object>} Created cart
     */
    async createCart(lineItems = []) {
      const formattedLineItems = lineItems.map(item => ({
        productEntityId: parseInt(item.productEntityId, 10),
        quantity: parseInt(item.quantity, 10) || 1,
        variantEntityId: item.variantEntityId ? parseInt(item.variantEntityId, 10) : undefined,
        selectedOptions: item.selectedOptions || undefined
      }));

      const input = {
        lineItems: formattedLineItems
      };

      const data = await this._executeGraphQL(MUTATIONS.CREATE_CART, { input });
      const result = data?.cart?.createCart;

      if (result?.errors?.length > 0) {
        throw new Error(result.errors.map(e => e.message).join(', '));
      }

      const cart = result?.cart;
      if (cart?.entityId) {
        this.cartId = cart.entityId;
        this._setStoredCartId(cart.entityId);
      }

      return cart;
    }

    /**
     * Add items to cart
     * @param {Array|Object} items - Single item or array of items to add
     * @param {number} items.productEntityId - Product entity ID
     * @param {number} items.quantity - Quantity
     * @param {number} [items.variantEntityId] - Variant entity ID
     * @param {Object} [items.selectedOptions] - Selected options for the product
     * @returns {Promise<Object>} Updated cart
     */
    async addToCart(items) {
      // Ensure we have a cart
      let cart = await this.getCart();
      
      const itemsArray = Array.isArray(items) ? items : [items];
      
      const formattedLineItems = itemsArray.map(item => ({
        productEntityId: parseInt(item.productEntityId, 10),
        quantity: parseInt(item.quantity, 10) || 1,
        variantEntityId: item.variantEntityId ? parseInt(item.variantEntityId, 10) : undefined,
        selectedOptions: item.selectedOptions || undefined
      }));

      // If no cart exists, create one
      if (!cart || !this.cartId) {
        return this.createCart(formattedLineItems);
      }

      const input = {
        cartEntityId: this.cartId,
        data: {
          lineItems: formattedLineItems
        }
      };

      const data = await this._executeGraphQL(MUTATIONS.ADD_CART_LINE_ITEMS, { input });
      const result = data?.cart?.addCartLineItems;

      if (result?.errors?.length > 0) {
        throw new Error(result.errors.map(e => e.message).join(', '));
      }

      return result?.cart;
    }

    /**
     * Update cart line item quantity
     * @param {string} lineItemEntityId - Line item entity ID
     * @param {number} quantity - New quantity
     * @returns {Promise<Object>} Updated cart
     */
    async updateCartItem(lineItemEntityId, quantity) {
      if (!this.cartId) {
        throw new Error('No cart exists');
      }

      const input = {
        cartEntityId: this.cartId,
        lineItemEntityId: lineItemEntityId,
        data: {
          lineItem: {
            quantity: parseInt(quantity, 10)
          }
        }
      };

      const data = await this._executeGraphQL(MUTATIONS.UPDATE_CART_LINE_ITEM, { input });
      const result = data?.cart?.updateCartLineItem;

      if (result?.errors?.length > 0) {
        throw new Error(result.errors.map(e => e.message).join(', '));
      }

      return result?.cart;
    }

    /**
     * Remove item from cart
     * @param {string} lineItemEntityId - Line item entity ID
     * @returns {Promise<Object>} Updated cart
     */
    async removeFromCart(lineItemEntityId) {
      if (!this.cartId) {
        throw new Error('No cart exists');
      }

      const input = {
        cartEntityId: this.cartId,
        lineItemEntityId: lineItemEntityId
      };

      const data = await this._executeGraphQL(MUTATIONS.DELETE_CART_LINE_ITEM, { input });
      const result = data?.cart?.deleteCartLineItem;

      if (result?.errors?.length > 0) {
        throw new Error(result.errors.map(e => e.message).join(', '));
      }

      return result?.cart;
    }

    /**
     * Delete entire cart
     * @returns {Promise<string>} Deleted cart entity ID
     */
    async deleteCart() {
      if (!this.cartId) {
        throw new Error('No cart exists');
      }

      const input = {
        cartEntityId: this.cartId
      };

      const data = await this._executeGraphQL(MUTATIONS.DELETE_CART, { input });
      const result = data?.cart?.deleteCart;

      if (result?.errors?.length > 0) {
        throw new Error(result.errors.map(e => e.message).join(', '));
      }

      // Clear stored cart ID
      this.cartId = null;
      this._setStoredCartId(null);

      return result?.deletedCartEntityId;
    }

    // -------------------------------------------------------------------------
    // Checkout
    // -------------------------------------------------------------------------

    /**
     * Get checkout redirect URLs
     * @returns {Promise<Object>} Object with embeddedCheckoutUrl and redirectedCheckoutUrl
     */
    async getCheckoutUrls() {
      if (!this.cartId) {
        throw new Error('No cart exists. Add items to cart first.');
      }

      const input = {
        cartEntityId: this.cartId
      };

      const data = await this._executeGraphQL(MUTATIONS.CREATE_CART_REDIRECT_URLS, { input });
      const result = data?.cart?.createCartRedirectUrls;

      if (result?.errors?.length > 0) {
        throw new Error(result.errors.map(e => e.message).join(', '));
      }

      return result?.redirectUrls;
    }

    /**
     * Redirect to checkout
     * @param {boolean} [embedded=false] - Use embedded checkout URL
     */
    async proceedToCheckout(embedded = false) {
      const urls = await this.getCheckoutUrls();
      
      if (!urls) {
        throw new Error('Failed to get checkout URLs');
      }

      const checkoutUrl = embedded ? urls.embeddedCheckoutUrl : urls.redirectedCheckoutUrl;
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No checkout URL available');
      }
    }

    // -------------------------------------------------------------------------
    // Category & Store Info
    // -------------------------------------------------------------------------

    /**
     * Get category tree
     * @param {number} [depth=3] - Depth of category tree to return
     * @returns {Promise<Array>} Category tree
     */
    async getCategoryTree(depth = 3) {
      const data = await this._executeGraphQL(QUERIES.GET_CATEGORY_TREE, { depth });
      return data?.site?.categoryTree || [];
    }

    /**
     * Get store settings
     * @returns {Promise<Object>} Store settings
     */
    async getStoreSettings() {
      const data = await this._executeGraphQL(QUERIES.GET_STORE_SETTINGS);
      return {
        settings: data?.site?.settings,
        currencies: this._flattenEdges(data?.site?.currencies)
      };
    }

    // -------------------------------------------------------------------------
    // Convenience Methods for Agent Integration
    // -------------------------------------------------------------------------

    /**
     * Quick add to cart by product ID and quantity
     * Automatically handles simple products vs products with options
     * @param {number} productId - Product entity ID
     * @param {number} [quantity=1] - Quantity to add
     * @param {Object} [options={}] - Selected options as { optionId: valueId }
     * @returns {Promise<Object>} Result with cart and product info
     */
    async quickAddToCart(productId, quantity = 1, options = {}) {
      // Get product details to check if it needs configuration
      const product = await this.getProductById(productId);
      
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      // Check if product has required options
      const requiredOptions = product.productOptions?.filter(o => o.isRequired) || [];
      const hasRequiredOptions = requiredOptions.length > 0;

      // If product has required options but none provided, return product info
      if (hasRequiredOptions && Object.keys(options).length === 0) {
        return {
          requiresConfiguration: true,
          product: product,
          requiredOptions: requiredOptions,
          message: 'This product requires option selection before adding to cart'
        };
      }

      // Build selected options for cart
      let selectedOptions = null;
      let variantEntityId = null;

      if (Object.keys(options).length > 0) {
        selectedOptions = {
          multipleChoices: Object.entries(options).map(([optionId, valueId]) => ({
            optionEntityId: parseInt(optionId, 10),
            optionValueEntityId: parseInt(valueId, 10)
          }))
        };

        // Try to find matching variant
        const variant = await this.findVariantByOptions(productId, options);
        if (variant) {
          variantEntityId = variant.entityId;
        }
      }

      // Add to cart
      const cart = await this.addToCart({
        productEntityId: productId,
        quantity: quantity,
        variantEntityId: variantEntityId,
        selectedOptions: selectedOptions
      });

      return {
        requiresConfiguration: false,
        cart: cart,
        product: product,
        addedQuantity: quantity
      };
    }

    /**
     * Get full cart summary for agent display
     * @returns {Promise<Object>} Cart summary with formatted data
     */
    async getCartSummary() {
      const cart = await this.getCart();

      if (!cart) {
        return {
          isEmpty: true,
          itemCount: 0,
          items: [],
          subtotal: null,
          total: null
        };
      }

      const physicalItems = cart.lineItems?.physicalItems || [];
      const digitalItems = cart.lineItems?.digitalItems || [];
      const allItems = [...physicalItems, ...digitalItems];

      return {
        isEmpty: allItems.length === 0,
        cartId: cart.entityId,
        itemCount: cart.lineItems?.totalQuantity || 0,
        items: allItems.map(item => ({
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
          options: item.selectedOptions?.map(o => ({
            name: o.name,
            value: o.value || o.text || o.number
          })) || []
        })),
        subtotal: cart.baseAmount,
        discounts: cart.discountedAmount,
        total: cart.amount,
        currencyCode: cart.currencyCode
      };
    }
  }

  // ============================================================================
  // EXPORT SDK
  // ============================================================================

  // Create singleton instance
  const sdk = new BigCommerceAgentSDK({
    debug: window.BC_AGENT_DEBUG || false
  });

  // Expose to window
  window.BCAgentSDK = sdk;
  window.BigCommerceAgentSDK = BigCommerceAgentSDK;

  // Also expose queries and mutations for advanced usage
  window.BCAgentSDK.QUERIES = QUERIES;
  window.BCAgentSDK.MUTATIONS = MUTATIONS;

  // Fire ready event
  const event = new CustomEvent('bcagentsdk:ready', { detail: { sdk } });
  window.dispatchEvent(event);

  console.log('[BCAgentSDK] BigCommerce Agent SDK loaded and ready');

})(window);
