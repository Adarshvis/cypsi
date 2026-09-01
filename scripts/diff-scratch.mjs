/**
 * Step 3 of the additive-schema workflow.
 *
 * Diffs `cps_scratch` (post-push) against the live database and writes the
 * additive DDL to scratch-diff.sql for review. Also reports anything that
 * would be a *change* rather than an addition, which would be a red flag.
 *
 *   node scripts/diff-scratch.mjs
 */
import { execFileSync } from 'child_process'
import fs from 'fs'
import pg from 'pg'
import { readDbConfig, clientOptions } from './lib-db-env.mjs'

const SCRATCH_DB = 'cps_scratch'
const cfg = readDbConfig()
const env = { ...process.env, PGPASSWORD: cfg.password }

const live = new pg.Client(clientOptions(cfg))
const scratch = new pg.Client(clientOptions(cfg, SCRATCH_DB))
await live.connect()
await scratch.connect()

const TABLES = `SELECT table_name FROM information_schema.tables
                WHERE table_schema='public' ORDER BY table_name`
const ENUMS = `SELECT t.typname, array_agg(e.enumlabel::text ORDER BY e.enumsortorder) AS labels
               FROM pg_type t
               JOIN pg_enum e ON e.enumtypid = t.oid
               JOIN pg_namespace n ON n.oid = t.typnamespace
               WHERE n.nspname='public' GROUP BY t.typname ORDER BY t.typname`
const COLUMNS = `SELECT table_name, column_name FROM information_schema.columns
                 WHERE table_schema='public' ORDER BY table_name, column_name`

const [liveTables, scratchTables] = [await live.query(TABLES), await scratch.query(TABLES)]
const [liveEnums, scratchEnums] = [await live.query(ENUMS), await scratch.query(ENUMS)]
const [liveCols, scratchCols] = [await live.query(COLUMNS), await scratch.query(COLUMNS)]

const liveTableSet = new Set(liveTables.rows.map((r) => r.table_name))
const scratchTableSet = new Set(scratchTables.rows.map((r) => r.table_name))

const newTables = [...scratchTableSet].filter((t) => !liveTableSet.has(t)).sort()
const droppedTables = [...liveTableSet].filter((t) => !scratchTableSet.has(t)).sort()

const liveEnumMap = new Map(liveEnums.rows.map((r) => [r.typname, r.labels]))
const newEnums = scratchEnums.rows.filter((r) => !liveEnumMap.has(r.typname))
const changedEnums = scratchEnums.rows.filter(
  (r) =>
    liveEnumMap.has(r.typname) &&
    JSON.stringify(liveEnumMap.get(r.typname)) !== JSON.stringify(r.labels),
)

const key = (r) => `${r.table_name}.${r.column_name}`
const liveColSet = new Set(liveCols.rows.map(key))
const scratchColSet = new Set(scratchCols.rows.map(key))
// Column additions on tables that already exist in live.
const newCols = scratchCols.rows.filter((r) => liveTableSet.has(r.table_name) && !liveColSet.has(key(r)))
const droppedCols = liveCols.rows.filter(
  (r) => scratchTableSet.has(r.table_name) && !scratchColSet.has(key(r)),
)

const report = []
report.push(`new tables      : ${newTables.length}`)
newTables.forEach((t) => report.push(`    + ${t}`))
report.push(`new enum types  : ${newEnums.length}`)
newEnums.forEach((e) => report.push(`    + ${e.typname}`))
report.push(`new columns on existing tables : ${newCols.length}`)
newCols.forEach((c) => report.push(`    + ${c.table_name}.${c.column_name}`))
report.push('')
report.push('--- red flags (should all be zero) ---')
report.push(`dropped tables  : ${droppedTables.length} ${droppedTables.join(', ')}`)
report.push(`dropped columns : ${droppedCols.length} ${droppedCols.map(key).join(', ')}`)
report.push(`changed enums   : ${changedEnums.length} ${changedEnums.map((e) => e.typname).join(', ')}`)

console.log(report.join('\n'))
fs.writeFileSync('scratch-diff-report.txt', report.join('\n'))

// ---- Build the DDL ----
const ddl = []
ddl.push('BEGIN;')
ddl.push('')

if (newEnums.length) {
  ddl.push('-- enum types')
  for (const e of newEnums) {
    const labels = e.labels.map((l) => `'${l.replace(/'/g, "''")}'`).join(', ')
    ddl.push(`CREATE TYPE public."${e.typname}" AS ENUM(${labels});`)
  }
  ddl.push('')
}

if (newTables.length) {
  const args = ['-U', cfg.user, '-h', cfg.host, '-p', cfg.port, '-d', SCRATCH_DB,
    '--schema-only', '--no-owner', '--no-privileges', '--no-comments']
  newTables.forEach((t) => args.push('-t', `public.${t}`))
  const dumped = execFileSync('pg_dump', args, { env, encoding: 'utf8' })

  ddl.push('-- tables, indexes and constraints (from pg_dump of the scratch copy)')
  ddl.push(
    dumped
      .split('\n')
      .filter((l) => !l.startsWith('--') && !l.startsWith('SET ') && !l.startsWith('SELECT pg_catalog'))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim(),
  )
  ddl.push('')
}

if (newCols.length) {
  ddl.push('-- columns added to existing tables')
  for (const c of newCols) {
    const { rows } = await scratch.query(
      `SELECT data_type, udt_name, is_nullable, column_default
       FROM information_schema.columns WHERE table_name=$1 AND column_name=$2`,
      [c.table_name, c.column_name],
    )
    const d = rows[0]
    const type = d.data_type === 'USER-DEFINED' ? `public."${d.udt_name}"` : d.data_type
    let stmt = `ALTER TABLE public."${c.table_name}" ADD COLUMN IF NOT EXISTS "${c.column_name}" ${type}`
    if (d.column_default) stmt += ` DEFAULT ${d.column_default}`
    if (d.is_nullable === 'NO') stmt += ' NOT NULL'
    ddl.push(stmt + ';')
  }
  ddl.push('')

  // Foreign keys and indexes that the scratch copy added for those columns.
  const { rows: fks } = await scratch.query(
    `SELECT conname, pg_get_constraintdef(oid) AS def, conrelid::regclass::text AS tbl
     FROM pg_constraint
     WHERE contype='f' AND connamespace='public'::regnamespace
       AND conrelid::regclass::text = ANY($1)`,
    [[...new Set(newCols.map((c) => c.table_name))]],
  )
  const { rows: liveFks } = await live.query(
    `SELECT conname FROM pg_constraint WHERE contype='f' AND connamespace='public'::regnamespace`,
  )
  const liveFkNames = new Set(liveFks.map((r) => r.conname))
  const newFks = fks.filter((f) => !liveFkNames.has(f.conname))
  if (newFks.length) {
    ddl.push('-- foreign keys for the new columns')
    newFks.forEach((f) =>
      ddl.push(`ALTER TABLE public."${f.tbl}" ADD CONSTRAINT "${f.conname}" ${f.def};`),
    )
    ddl.push('')
  }

  const { rows: idx } = await scratch.query(
    `SELECT indexname, indexdef FROM pg_indexes
     WHERE schemaname='public' AND tablename = ANY($1)`,
    [[...new Set(newCols.map((c) => c.table_name))]],
  )
  const { rows: liveIdx } = await live.query(
    `SELECT indexname FROM pg_indexes WHERE schemaname='public'`,
  )
  const liveIdxNames = new Set(liveIdx.map((r) => r.indexname))
  const newIdx = idx.filter((i) => !liveIdxNames.has(i.indexname))
  if (newIdx.length) {
    ddl.push('-- indexes for the new columns')
    newIdx.forEach((i) => ddl.push(i.indexdef + ';'))
    ddl.push('')
  }
}

ddl.push('COMMIT;')
fs.writeFileSync('scratch-diff.sql', ddl.join('\n'))
console.log(`\nDDL written to scratch-diff.sql (${ddl.join('\n').split('\n').length} lines)`)

await live.end()
await scratch.end()
