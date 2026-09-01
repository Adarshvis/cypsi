/**
 * Safety check: compares column data types (not just presence) between the
 * live DB and the pushed scratch copy, to catch any ALTER-shaped change that
 * the additive diff would miss.
 */
import fs from 'fs'
import pg from 'pg'
import { readDbConfig, clientOptions } from './lib-db-env.mjs'

const cfg = readDbConfig()
const live = new pg.Client(clientOptions(cfg))
const scratch = new pg.Client(clientOptions(cfg, 'cps_scratch'))
await live.connect()
await scratch.connect()

const Q = `SELECT table_name, column_name, data_type, udt_name, is_nullable, column_default
           FROM information_schema.columns WHERE table_schema='public'`

const [l, s] = [await live.query(Q), await scratch.query(Q)]
const key = (r) => `${r.table_name}.${r.column_name}`
const liveMap = new Map(l.rows.map((r) => [key(r), r]))

const out = []
let changed = 0

for (const r of s.rows) {
  const prev = liveMap.get(key(r))
  if (!prev) continue // additions are already covered
  const diffs = []
  if (prev.data_type !== r.data_type) diffs.push(`type ${prev.data_type} -> ${r.data_type}`)
  if (prev.udt_name !== r.udt_name) diffs.push(`udt ${prev.udt_name} -> ${r.udt_name}`)
  if (prev.is_nullable !== r.is_nullable) diffs.push(`nullable ${prev.is_nullable} -> ${r.is_nullable}`)
  if ((prev.column_default || '') !== (r.column_default || '')) {
    diffs.push(`default ${prev.column_default} -> ${r.column_default}`)
  }
  if (diffs.length) {
    changed++
    out.push(`  ${key(r)}: ${diffs.join('; ')}`)
  }
}

const header = [`columns changed in scratch vs live: ${changed}`]
if (changed === 0) header.push('  none — the push was purely additive')

// What the header nav enum situation actually looks like in live.
const hdr = await live.query(
  `SELECT table_name, column_name, data_type, udt_name FROM information_schema.columns
   WHERE table_schema='public' AND table_name LIKE 'header_nav_items%' ORDER BY table_name, column_name`,
)
header.push('', 'live header_nav_items* columns:')
hdr.rows.forEach((r) => header.push(`  ${r.table_name}.${r.column_name}: ${r.udt_name}`))

const report = [...header, '', ...out].join('\n')
console.log(report)
fs.writeFileSync('column-type-diff.txt', report)

await live.end()
await scratch.end()
