/**
 * BigCommerce Storefront Agent SDK - Browser Bundle
 * IIFE wrapper for Script Manager injection
 */

import { BigCommerceAgentSDK } from './sdk'
import { QUERIES } from './queries'
import { MUTATIONS } from './mutations'
import { registerWebMCPTools } from './webmcp'

declare global {
  interface Window {
    BCAgentSDK: BigCommerceAgentSDK & {
      QUERIES: typeof QUERIES
      MUTATIONS: typeof MUTATIONS
    }
    BigCommerceAgentSDK: typeof BigCommerceAgentSDK
    BC_AGENT_DEBUG?: boolean
  }
}

// Create singleton instance
const sdk = new BigCommerceAgentSDK({
  debug: typeof window !== 'undefined' && window.BC_AGENT_DEBUG || false,
}) as BigCommerceAgentSDK & {
  QUERIES: typeof QUERIES
  MUTATIONS: typeof MUTATIONS
}

// Attach queries and mutations for advanced usage
sdk.QUERIES = QUERIES
sdk.MUTATIONS = MUTATIONS

// Expose to window
if (typeof window !== 'undefined') {
  window.BCAgentSDK = sdk
  window.BigCommerceAgentSDK = BigCommerceAgentSDK

  // Register the SDK's commerce capabilities as WebMCP tools on
  // document.modelContext so a WebMCP-aware chat widget can discover and call
  // them. Installs the polyfill at load so the registry exists before the
  // widget's first dispatch. Guarded so failure never breaks the SDK.
  try {
    registerWebMCPTools(sdk)
  } catch (error) {
    console.warn('[BCAgentSDK] Failed to register WebMCP tools:', error)
  }

  // Fire ready event
  const event = new CustomEvent('bcagentsdk:ready', { detail: { sdk } })
  window.dispatchEvent(event)

  console.log('[BCAgentSDK] BigCommerce Agent SDK loaded and ready')
}

export { sdk as BCAgentSDK, BigCommerceAgentSDK }
