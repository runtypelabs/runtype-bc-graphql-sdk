/**
 * BigCommerce Storefront GraphQL Mutations
 */

export const CREATE_CART = `
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
`

export const ADD_CART_LINE_ITEMS = `
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
`

export const UPDATE_CART_LINE_ITEM = `
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
`

export const DELETE_CART_LINE_ITEM = `
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
`

export const DELETE_CART = `
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
`

export const CREATE_CART_REDIRECT_URLS = `
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

export const MUTATIONS = {
  CREATE_CART,
  ADD_CART_LINE_ITEMS,
  UPDATE_CART_LINE_ITEM,
  DELETE_CART_LINE_ITEM,
  DELETE_CART,
  CREATE_CART_REDIRECT_URLS,
}
