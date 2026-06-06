/**
 * BigCommerce Storefront Agent SDK
 * Main entry point
 */

export { BigCommerceAgentSDK } from './sdk'
export { QUERIES } from './queries'
export { MUTATIONS } from './mutations'
export * from './types'
export { registerWebMCPTools } from './webmcp'

// Default export for convenience
export { BigCommerceAgentSDK as default } from './sdk'
