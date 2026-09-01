/**
 * Step 4 of the additive-schema workflow.
 *
 * Applies scratch-diff.sql to the live database, in one transaction.
 *
 * Cleaning applied first:
 *  - strips psql meta-commands (\restrict / \unrestrict) that pg_dump 18 emits
 *    and which a non-psql client cannot parse
 *  - drops statements listed in EXCLUDE, so pre-existing schema drift unrelated
 *    to the new collections does not ride along
 *
 *   node scripts/apply-new-schema.mjs            # dry run, writes cleaned SQL
 *   node scripts/apply-new-schema.mjs --execute  # apply
 */
import fs from 'fs'
import pg from 'pg'
import { readDbConfig, clientOptions } from './lib-db-env.mjs'

const EXECUTE = process.argv.includes('--execute')

/** Substrings identifying statements to leave out (pre-existing drift, not ours). */
const EXCLUDE = ['enum_header_nav_items_children_type']

const raw = fs.readFileSync('scratch-diff.sql', 'utf8')

const cleanedLines = raw
  .split('\n')
  .filter((l) => !l.trimStart().startsWith('\\restrict'))
  .filter((l) => !l.trimStart().startsWith('\\unrestrict'))

// Statement-level filtering for the excluded objects.
const sql = cleanedLines.join('\n')
const statements = sql
  .split(/;\s*(?:\n|$)/)
  .map((s) => s.trim())
  .filter(Boolean)

const kept = []
const skipped = []
for (const st of statements) {
  if (st === 'BEGIN' || st === 'COMMIT') continue
  if (EXCLUDE.some((needle) => st.includes(needle))) skipped.push(st)
  else kept.push(st)
}

console.log(`statements to run  : ${kept.length}`)
console.log(`statements skipped : ${skipped.length}`)
skipped.forEach((s) => console.log(`    - ${s.split('\n')[0].slice(0, 90)}`))

fs.writeFileSync('applied-schema.sql', kept.map((s) => s + ';').join('\n\n'))
console.log('cleaned SQL written to applied-schema.sql')

if (!EXECUTE) {
  console.log('\nDRY RUN — nothing applied. Re-run with --execute.')
  process.exit(0)
}

const cfg = readDbConfig()
const client = new pg.Client(clientOptions(cfg))
await client.connect()

try {
  await client.query('BEGIN')
  let n = 0
  for (const st of kept) {
    await client.query(st)
    n++
  }
  await client.query('COMMIT')
  console.log(`\nApplied ${n} statements to "${cfg.database}".`)
} catch (err) {
  await client.query('ROLLBACK')
  console.error('\nFailed — rolled back, database unchanged.')
  console.error(err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
