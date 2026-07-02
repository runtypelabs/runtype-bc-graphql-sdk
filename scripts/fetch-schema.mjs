/**
 * Fetch the BigCommerce GraphQL Storefront schema via introspection and vendor
 * it as schema.graphql, so query/mutation documents can be validated offline
 * (see test/unit/graphql-documents.test.ts).
 *
 * Usage: npm run update-schema
 *
 * The endpoint and token are BigCommerce's public GraphQL playground store
 * (https://gql-playground.bigcommerce.com/), not a secret. Override with
 * BC_SCHEMA_ENDPOINT / BC_SCHEMA_TOKEN to fetch from a different store.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { getIntrospectionQuery, buildClientSchema, printSchema } from 'graphql'

const ENDPOINT = process.env.BC_SCHEMA_ENDPOINT || 'https://buybutton.store/graphql'
const TOKEN =
  process.env.BC_SCHEMA_TOKEN ||
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJjaWQiOlsxXSwiY29ycyI6WyJodHRwczovL2dxbC1wbGF5Z3JvdW5kLmJpZ2NvbW1lcmNlLmNvbSJdLCJlYXQiOjE5NjMwNTAzMjcsImlhdCI6MTc3NTY3OTEyNywiaXNzIjoiQkMiLCJzaWQiOjk5OTMzMTc4NCwic3ViIjoiNnIydTYyNDM1bDEzaGdnZ3dicjhoMWF1b282NXU0aiIsInN1Yl90eXBlIjoyLCJ0b2tlbl90eXBlIjoxfQ.wFvWGg_mI8V_OofLdrcxEgtI8HgyEg5_MCPX-DxdQq3eHACkmVPeznt1gNsiumdvj2VSBUx7Y2YWJVcz0ua_og'

const response = await fetch(ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${TOKEN}`,
  },
  body: JSON.stringify({ query: getIntrospectionQuery() }),
})

if (!response.ok) {
  throw new Error(`Introspection request failed: HTTP ${response.status}`)
}

const { data, errors } = await response.json()
if (errors?.length) {
  throw new Error(`Introspection returned errors: ${errors.map((e) => e.message).join(', ')}`)
}

const sdl = printSchema(buildClientSchema(data))
const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'schema.graphql')
writeFileSync(outPath, sdl + '\n')
console.log(`Wrote ${outPath} (${sdl.length} chars) from ${ENDPOINT}`)
