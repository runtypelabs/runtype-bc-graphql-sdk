/**
 * BigCommerce Storefront GraphQL Queries
 */

export const SEARCH_PRODUCTS = `
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
`

export const GET_PRODUCT_BY_ID = `
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
`

export const GET_PRODUCT_BY_PATH = `
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
`

export const GET_CONFIGURED_PRODUCT = `
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
`

export const GET_CART = `
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
`

export const GET_CATEGORY_TREE = `
  query GetCategoryTree {
    site {
      categoryTree {
        entityId
        name
        path
        description
        productCount
        hasChildren
        children {
          entityId
          name
          path
          productCount
          hasChildren
          children {
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
`

export const GET_BRANDS = `
  query GetBrands($first: Int = 50) {
    site {
      brands(first: $first) {
        edges {
          node {
            entityId
            name
            path
            defaultImage {
              url(width: 160)
            }
          }
        }
      }
    }
  }
`

export const GET_STORE_SETTINGS = `
  query GetStoreSettings {
    site {
      settings {
        storeName
        url {
          vanityUrl
          cdnUrl
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
    }
  }
`

// ---------------------------------------------------------------------------
// Customer Queries
// ---------------------------------------------------------------------------

export const GET_CUSTOMER = `
  query GetCustomer {
    customer {
      entityId
      email
      firstName
      lastName
      phone
      company
      customerGroupId
      customerGroupName
      addressCount
      storeCredit {
        value
        currencyCode
      }
      isSubscribedToNewsletter
    }
  }
`

export const GET_CUSTOMER_ADDRESSES = `
  query GetCustomerAddresses($first: Int = 50, $after: String) {
    customer {
      entityId
      addresses(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            entityId
            firstName
            lastName
            address1
            address2
            city
            company
            countryCode
            stateOrProvince
            phone
            postalCode
          }
        }
      }
    }
  }
`

export const GET_CUSTOMER_ORDERS = `
  query GetCustomerOrders($first: Int = 20, $after: String) {
    customer {
      entityId
      orders(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            entityId
            orderedAt
            updatedAt
            status {
              value
              label
            }
            totalIncTax {
              value
              currencyCode
            }
          }
        }
      }
    }
  }
`

export const GET_ORDER_DETAILS = `
  query GetOrderDetails($filter: OrderFilterInput) {
    customer {
      orders(first: 1, filter: $filter) {
        edges {
          node {
            entityId
            orderedAt
            updatedAt
            status {
              value
              label
            }
            billingAddress {
              firstName
              lastName
              email
              company
              address1
              address2
              city
              stateOrProvince
              postalCode
              countryCode
              phone
            }
            consignments {
              shipping {
                edges {
                  node {
                    entityId
                    status
                    shippingAddress {
                      firstName
                      lastName
                      email
                      company
                      address1
                      address2
                      city
                      stateOrProvince
                      postalCode
                      countryCode
                      phone
                    }
                    shippingCost {
                      value
                      currencyCode
                    }
                    handlingCost {
                      value
                      currencyCode
                    }
                    lineItems {
                      edges {
                        node {
                          entityId
                          productEntityId
                          variantEntityId
                          name
                          sku
                          quantity
                          subTotalListPrice {
                            value
                            currencyCode
                          }
                          subTotalSalePrice {
                            value
                            currencyCode
                          }
                          imageUrl
                        }
                      }
                    }
                  }
                }
              }
            }
            subTotal {
              value
              currencyCode
            }
            shippingCostTotal {
              value
              currencyCode
            }
            taxTotal {
              value
              currencyCode
            }
            totalIncTax {
              value
              currencyCode
            }
            customerMessage
            discounts {
              couponCode
              discountedAmount {
                value
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`

export const GET_CUSTOMER_WISHLISTS = `
  query GetCustomerWishlists($first: Int = 10) {
    customer {
      entityId
      wishlists(first: $first) {
        edges {
          node {
            entityId
            name
            isPublic
            token
            items(first: 50) {
              edges {
                node {
                  entityId
                  productEntityId
                  variantEntityId
                  product {
                    entityId
                    name
                    path
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
                    defaultImage {
                      url(width: 200)
                      altText
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
`

// ---------------------------------------------------------------------------
// Web Content Page Queries
// ---------------------------------------------------------------------------

export const GET_WEB_PAGES = `
  query GetWebPages($filters: WebPagesFiltersInput) {
    site {
      content {
        pages(filters: $filters) {
          edges {
            node {
              entityId
              name
              __typename
              ... on ContactPage {
                path
              }
              ... on ExternalLinkPage {
                link
              }
              ... on NormalPage {
                path
                plainTextSummary(characterLimit: 100)
              }
            }
          }
        }
      }
    }
  }
`

export const GET_WEB_PAGE = `
  query GetWebPage($entityId: Int!) {
    site {
      content {
        page(entityId: $entityId) {
          name
          parentEntityId
          entityId
          __typename
          children {
            edges {
              node {
                name
                ... on NormalPage {
                  path
                }
              }
            }
          }
          ... on NormalPage {
            name
            htmlBody
            plainTextSummary
            path
          }
          ... on ContactPage {
            path
          }
        }
      }
    }
  }
`

export const QUERIES = {
  SEARCH_PRODUCTS,
  GET_PRODUCT_BY_ID,
  GET_PRODUCT_BY_PATH,
  GET_CONFIGURED_PRODUCT,
  GET_CART,
  GET_CATEGORY_TREE,
  GET_BRANDS,
  GET_STORE_SETTINGS,
  GET_CUSTOMER,
  GET_CUSTOMER_ADDRESSES,
  GET_CUSTOMER_ORDERS,
  GET_ORDER_DETAILS,
  GET_CUSTOMER_WISHLISTS,
  GET_WEB_PAGES,
  GET_WEB_PAGE,
}
