import { defineConfig } from 'tsup'

export default defineConfig([
  // Main SDK - ESM and CJS
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    outDir: 'dist',
    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.esm.js' : '.js'
      }
    }
  },
  // Tools module - ESM and CJS
  {
    entry: ['src/tools.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    outDir: 'dist',
    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.esm.js' : '.js'
      }
    }
  },
  // Browser bundle - IIFE minified
  {
    entry: { 'bigcommerce-agent-sdk.min': 'src/browser.ts' },
    format: ['iife'],
    globalName: 'BCAgentSDK',
    minify: true,
    outDir: 'dist',
    outExtension() {
      return { js: '.js' }
    }
  }
])
