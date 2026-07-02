import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'
import { buildSchema, parse, validate } from 'graphql'
import { QUERIES } from '../../src/queries'
import { MUTATIONS } from '../../src/mutations'

/**
 * Validates every hand-written GraphQL document against the vendored
 * BigCommerce Storefront schema (schema.graphql, refreshed via
 * `npm run update-schema`). Catches field typos, wrong argument names, and
 * upstream schema drift at test time instead of at runtime on a storefront.
 */
const schema = buildSchema(readFileSync(join(__dirname, '../../schema.graphql'), 'utf8'))

function validateDocuments(documents: Record<string, string>) {
  for (const [name, document] of Object.entries(documents)) {
    it(`${name} is valid against the BigCommerce Storefront schema`, () => {
      const errors = validate(schema, parse(document))
      expect(errors.map(String)).toEqual([])
    })
  }
}

describe('QUERIES', () => {
  validateDocuments(QUERIES)
})

describe('MUTATIONS', () => {
  validateDocuments(MUTATIONS)
})
