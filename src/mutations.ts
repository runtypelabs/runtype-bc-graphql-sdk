/**
 * BigCommerce Storefront GraphQL Mutations
 */

export const CREATE_CART = /* GraphQL */ `
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
      }
    }
  }
`

export const ADD_CART_LINE_ITEMS = /* GraphQL */ `
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
      }
    }
  }
`

export const UPDATE_CART_LINE_ITEM = /* GraphQL */ `
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
      }
    }
  }
`

export const DELETE_CART_LINE_ITEM = /* GraphQL */ `
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
      }
    }
  }
`

export const DELETE_CART = /* GraphQL */ `
  mutation DeleteCart($input: DeleteCartInput!) {
    cart {
      deleteCart(input: $input) {
        deletedCartEntityId
      }
    }
  }
`

export const CREATE_CART_REDIRECT_URLS = /* GraphQL */ `
  mutation CreateCartRedirectUrls($input: CreateCartRedirectUrlsInput!) {
    cart {
      createCartRedirectUrls(input: $input) {
        redirectUrls {
          embeddedCheckoutUrl
          redirectedCheckoutUrl
        }
      }
    }
  }
`

// ---------------------------------------------------------------------------
// Customer Mutations
// ---------------------------------------------------------------------------

export const UPDATE_CUSTOMER = /* GraphQL */ `
  mutation UpdateCustomer($input: UpdateCustomerInput!) {
    customer {
      updateCustomer(input: $input) {
        customer {
          entityId
          email
          firstName
          lastName
          phone
          company
        }
        errors {
          ... on ValidationError {
            message
            path
          }
          ... on CustomerNotLoggedInError {
            message
          }
        }
      }
    }
  }
`

export const ADD_CUSTOMER_ADDRESS = /* GraphQL */ `
  mutation AddCustomerAddress($input: AddCustomerAddressInput!) {
    customer {
      addCustomerAddress(input: $input) {
        address {
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
        errors {
          ... on ValidationError {
            message
            path
          }
          ... on CustomerNotLoggedInError {
            message
          }
          ... on CustomerAddressCreationError {
            message
          }
        }
      }
    }
  }
`

export const UPDATE_CUSTOMER_ADDRESS = /* GraphQL */ `
  mutation UpdateCustomerAddress($input: UpdateCustomerAddressInput!) {
    customer {
      updateCustomerAddress(input: $input) {
        address {
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
        errors {
          ... on ValidationError {
            message
            path
          }
          ... on CustomerNotLoggedInError {
            message
          }
          ... on CustomerAddressUpdateError {
            message
          }
        }
      }
    }
  }
`

export const DELETE_CUSTOMER_ADDRESS = /* GraphQL */ `
  mutation DeleteCustomerAddress($input: DeleteCustomerAddressInput!) {
    customer {
      deleteCustomerAddress(input: $input) {
        errors {
          ... on CustomerNotLoggedInError {
            message
          }
          ... on CustomerAddressDeletionError {
            message
          }
        }
      }
    }
  }
`

export const ADD_WISHLIST_ITEMS = /* GraphQL */ `
  mutation AddWishlistItems($input: AddWishlistItemsInput!) {
    wishlist {
      addWishlistItems(input: $input) {
        result {
          entityId
          name
          items(first: 50) {
            edges {
              node {
                entityId
                productEntityId
                variantEntityId
              }
            }
          }
        }
      }
    }
  }
`

export const DELETE_WISHLIST_ITEMS = /* GraphQL */ `
  mutation DeleteWishlistItems($input: DeleteWishlistItemsInput!) {
    wishlist {
      deleteWishlistItems(input: $input) {
        result {
          entityId
          name
        }
      }
    }
  }
`

// ---------------------------------------------------------------------------
// Authentication Mutations
// ---------------------------------------------------------------------------

export const LOGIN = /* GraphQL */ `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      customer {
        entityId
        firstName
        lastName
        email
      }
    }
  }
`

export const LOGOUT = /* GraphQL */ `
  mutation Logout {
    logout {
      result
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
  UPDATE_CUSTOMER,
  ADD_CUSTOMER_ADDRESS,
  UPDATE_CUSTOMER_ADDRESS,
  DELETE_CUSTOMER_ADDRESS,
  ADD_WISHLIST_ITEMS,
  DELETE_WISHLIST_ITEMS,
  LOGIN,
  LOGOUT,
}
