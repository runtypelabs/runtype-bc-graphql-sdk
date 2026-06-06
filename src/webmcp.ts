/**
 * BigCommerce Storefront Agent SDK - WebMCP tool registration
 *
 * Registers the SDK's commerce capabilities as WebMCP tools on
 * `document.modelContext` so a WebMCP-aware chat widget (e.g. Persona) can
 * discover them via `getTools()` and call them. Uses @mcp-b/webmcp-polyfill to
 * provide `document.modelContext` when the browser has no native implementation.
 */

import { initializeWebMCPPolyfill } from '@mcp-b/webmcp-polyfill'
import type { BigCommerceAgentSDK } from './sdk'
import {
  getAllToolDefinitions,
  createLocalToolImplementations,
  READ_ONLY_TOOL_NAMES,
} from './tools'

/**
 * Narrow view of the WebMCP `document.modelContext.registerTool` surface we use.
 * Declared locally so this module does not depend on the global type
 * augmentation from `@mcp-b/webmcp-types` resolving through the bundler.
 */
interface WebMCPToolDescriptor {
  name: string
  description: string
  inputSchema?: unknown
  annotations?: { readOnlyHint?: boolean }
  execute: (args: Record<string, unknown>) => unknown
}
interface RegisterableModelContext {
  registerTool(tool: WebMCPToolDescriptor): void
}

type ToolImplementations = Record<string, (args: Record<string, unknown>) => Promise<unknown>>

/**
 * Tools that must never be exposed to the model: authentication takes raw
 * credentials, which should not flow through an LLM tool call.
 */
const EXCLUDED_TOOL_NAMES = new Set<string>(['login', 'logout'])
const READ_ONLY_TOOL_SET = new Set<string>(READ_ONLY_TOOL_NAMES)

/**
 * Resolve the SDK instance a tool call should run against. A host page may
 * create its own configured instance (e.g. with a storefront API token) and
 * expose it as `window.BCSDK`; prefer that over this bundle's default singleton
 * so authenticated queries (orders, customer, etc.) work. Resolved lazily at
 * call time because the host instance is usually created after this script runs.
 */
function resolveActiveSdk(fallback: BigCommerceAgentSDK): BigCommerceAgentSDK {
  if (typeof window === 'undefined') return fallback
  const hosted = (window as unknown as { BCSDK?: BigCommerceAgentSDK }).BCSDK
  return hosted || fallback
}

/**
 * Register the SDK's commerce capabilities as WebMCP tools on
 * `document.modelContext`, installing @mcp-b/webmcp-polyfill if needed.
 *
 * Installing the polyfill is idempotent (a no-op if a native implementation or
 * another polyfill instance already provided `document.modelContext`). Tool
 * names are registered once; each tool resolves the active SDK instance lazily
 * at call time. Safe to call once, right after the SDK singleton is created.
 */
export function registerWebMCPTools(sdk: BigCommerceAgentSDK): void {
  if (typeof document === 'undefined') return

  const flag = window as unknown as { __bcAgentWebMCPToolsRegistered?: boolean }
  if (flag.__bcAgentWebMCPToolsRegistered) return

  // Provide document.modelContext when the browser has no native WebMCP. No-op
  // if a native implementation or another polyfill instance already installed it
  // (e.g. the chat widget's own copy) - first installer wins, the rest no-op.
  initializeWebMCPPolyfill()

  const modelContext = (document as unknown as { modelContext?: RegisterableModelContext })
    .modelContext
  if (!modelContext || typeof modelContext.registerTool !== 'function') return

  // Implementations are rebuilt whenever the active SDK instance changes, so a
  // host-provided window.BCSDK (token-configured) is used once it exists.
  let cachedSdk: BigCommerceAgentSDK | null = null
  let cachedImpls: ToolImplementations | null = null
  const getImpls = (): ToolImplementations => {
    const active = resolveActiveSdk(sdk)
    if (active !== cachedSdk || !cachedImpls) {
      cachedSdk = active
      cachedImpls = createLocalToolImplementations(active) as unknown as ToolImplementations
    }
    return cachedImpls
  }

  // The implementation set is the same regardless of instance; use the fallback
  // sdk's map to decide which definitions actually have a backing implementation.
  const baseImpls = createLocalToolImplementations(sdk) as unknown as ToolImplementations

  flag.__bcAgentWebMCPToolsRegistered = true

  for (const def of getAllToolDefinitions()) {
    if (EXCLUDED_TOOL_NAMES.has(def.name)) continue
    if (typeof baseImpls[def.name] !== 'function') continue

    const toolName = def.name
    try {
      modelContext.registerTool({
        name: toolName,
        description: def.description,
        inputSchema: def.parametersSchema,
        // Best-effort hint; the widget gates by tool name, not annotations,
        // because the producer-facing getTools() snapshot drops annotations.
        annotations: { readOnlyHint: READ_ONLY_TOOL_SET.has(toolName) },
        execute: (args) => {
          const fn = getImpls()[toolName]
          if (typeof fn !== 'function') {
            return { success: false, error: `Tool not available: ${toolName}` }
          }
          return fn(args || {})
        },
      })
    } catch {
      // Never let one tool's registration failure break the rest of the SDK.
    }
  }
}
