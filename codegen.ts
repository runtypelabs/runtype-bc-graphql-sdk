import type { CodegenConfig } from '@graphql-codegen/cli'

/**
 * GraphQL Code Generator config. Generates per-operation result/variables
 * TypeScript types for every document in src/queries.ts and src/mutations.ts
 * (extracted via their `/* GraphQL *\/` template annotations), validated
 * against the vendored BigCommerce Storefront schema.
 *
 * Run `npm run codegen` after editing a document, or `npm run update-schema`
 * to refresh the schema from BigCommerce and regenerate.
 */
const config: CodegenConfig = {
  schema: 'schema.graphql',
  documents: ['src/queries.ts', 'src/mutations.ts'],
  generates: {
    'src/generated/graphql.ts': {
      // typescript-operations v6 output is self-contained: it emits every
      // input/enum type its operations reference, so adding the full-schema
      // `typescript` plugin to the same file produces duplicate identifiers.
      plugins: ['typescript-operations'],
      config: {
        // Keep output stable and lint-friendly
        skipTypename: true,
        useTypeImports: true,
      },
    },
  },
}

export default config
