import { defineConfig, type UserConfig } from 'tsdown'

// Published filenames are kept identical to the previous tsup build:
// CJS → .js/.d.ts, ESM → .esm.js/.d.mts.
const library: UserConfig = {
  format: ['cjs', 'esm'],
  dts: { generator: 'tsgo', sourcemap: false },
  sourcemap: false,
  outDir: 'dist',
  target: 'es2020',
  outExtensions: ({ format }) =>
    format === 'es' ? { js: '.esm.js', dts: '.d.mts' } : { js: '.js', dts: '.d.ts' },
  // index.ts has named + default exports; CJS consumers get `require(...).default`, as with tsup.
  outputOptions: { exports: 'named' },
}

export default defineConfig([
  // Main SDK - ESM and CJS
  { ...library, entry: ['src/index.ts'], clean: true },
  // Tools module - ESM and CJS (separate build so it stays self-contained, no shared chunks)
  { ...library, entry: ['src/tools.ts'], clean: false },
  // Browser bundle - IIFE minified, all dependencies inlined
  {
    entry: { 'bigcommerce-agent-sdk.min': 'src/browser.ts' },
    format: ['iife'],
    globalName: 'BCAgentSDK',
    platform: 'browser',
    target: 'es2020',
    minify: true,
    clean: false,
    outDir: 'dist',
    sourcemap: false,
    deps: { alwaysBundle: [/.*/], onlyBundle: ['@mcp-b/webmcp-polyfill'] },
    outputOptions: { entryFileNames: '[name].js' },
  },
])
