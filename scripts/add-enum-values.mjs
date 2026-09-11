/**
 * Adds missing values to existing enum types.
 *
 * The additive-schema script creates new enum *types* but cannot extend one that
 * already exists, and drizzle would want to recreate the type — which means
 * rewriting every table that uses it under an exclusive lock. ALTER TYPE ... ADD
 * VALUE appends in place instead.
 *
 * Reads what the config expects from the generated Drizzle schema, so it stays
 * correct as options are added.
 *
 *   node scripts/add-enum-values.mjs             # report
 *   node scripts/add-enum-values.mjs --execute
 */
import { readFileSync, writeFileSync } from 'fs'
import pg from 'pg'

for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
  if (m && process.env[m[1]] === undefined)
    process.env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '')
}

const EXECUTE = process.argv.includes('--execute')

/** Enum name -> values it must contain, parsed from the generated schema. */
function expectedFromGeneratedSchema() {
  const src = readFileSync('src/payload-generated-schema.ts', 'utf8')
  const map = new Map()
  // pgEnum('enum_name', ['a', 'b', 'c'])
  const re = /pgEnum\(\s*'([^']+)'\s*,\s*\[([^\]]*)\]/g
  let m
  while ((m = re.exec(src))) {
    const values = [...m[2].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((v) => v[1].replace(/\\'/g, "'"))
    if (values.length) map.set(m[1], values)
  }
  return map
}

const expected = expectedFromGeneratedSchema()

const client = new pg.Client({ connectionString: process.env.CMS_DATABASE_URL })
await client.connect()

const { rows } = await client.query(
  `select t.typname as name, e.enumlabel as label, e.enumsortorder as ord
   from pg_type t join pg_enum e on e.enumtypid = t.oid
   where t.typnamespace = 'public'::regnamespace
   order by t.typname, e.enumsortorder`,
)

const live = new Map()
for (const r of rows) {
  if (!live.has(r.name)) live.set(r.name, [])
  live.get(r.name).push(r.label)
}

const log = []
const say = (m) => {
  console.log(m)
  log.push(m)
}

const statements = []
for (const [name, want] of expected) {
  const have = live.get(name)
  if (!have) continue // type does not exist yet; the additive script creates it
  const missing = want.filter((v) => !have.includes(v))
  if (missing.length === 0) continue

  say(`${name}: adding ${missing.join(', ')}`)
  for (const value of missing) {
    statements.push(
      `ALTER TYPE public."${name}" ADD VALUE IF NOT EXISTS '${value.replace(/'/g, "''")}';`,
    )
  }
}

say('')
say(`enums inspected : ${expected.size}`)
say(`statements      : ${statements.length}`)

if (statements.length === 0) {
  say('nothing to add')
  writeFileSync('enum-values.txt', log.join('\n'))
  await client.end()
  process.exit(0)
}

if (!EXECUTE) {
  for (const s of statements) say(`  ${s}`)
  say('')
  say('report only — pass --execute to apply')
  writeFileSync('enum-values.txt', log.join('\n'))
  await client.end()
  process.exit(0)
}

// ADD VALUE is not run inside an explicit transaction here: Postgres forbids
// using a newly added label in the same transaction that created it, and each
// statement is independently safe and idempotent.
for (const s of statements) {
  await client.query(s)
  say(`applied: ${s}`)
}

writeFileSync('enum-values.txt', log.join('\n'))
await client.end()
