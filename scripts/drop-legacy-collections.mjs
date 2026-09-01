/**
 * One-off cleanup: drop the Postgres objects for the DUCC-only collections
 * that CyPSi does not use — `software`, `projects`, `trainings`.
 *
 * This DB was built by schema push (payload_migrations holds a single
 * synthetic `dev` row), so the migration system cannot express this change.
 * The drop is therefore done as an explicit, reviewable script.
 *
 * Safe by default: prints exactly what it would drop and changes nothing.
 * Pass --execute to apply, inside a single transaction.
 *
 *   node scripts/drop-legacy-collections.mjs             # dry run
 *   node scripts/drop-legacy-collections.mjs --execute   # apply
 */
import fs from 'fs'
import path from 'path'
import pg from 'pg'

/** Table-name prefixes of the collections being removed (note: underscores, not slugs). */
const COLLECTIONS = ['software', 'projects', 'trainings', 'job_applications', 'resumes']

/** Extra orphaned tables that don't share a collection prefix. */
const EXTRA_TABLES = [
  // form-builder field type `resumeUpload`, removed along with the Resumes collection
  'forms_blocks_resume_upload',
]

const EXECUTE = process.argv.includes('--execute')

/** Matches the collection table and all of its block/array child tables. */
const TABLE_PATTERN = `^(${COLLECTIONS.join('|')})(_|$)`
/** Matches enums scoped to those collections, e.g. enum_software_blocks_hero_layout. */
const ENUM_PATTERN = `^enum_(${COLLECTIONS.join('|')})_`

function readConnectionUrl() {
  const envPath = path.resolve(process.cwd(), '.env')
  const line = fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .find((l) => l.startsWith('CMS_DATABASE_URL='))

  if (!line) throw new Error('CMS_DATABASE_URL not found in .env')
  return line.slice('CMS_DATABASE_URL='.length).trim().replace(/^['"]|['"]$/g, '')
}

function buildClient(rawUrl) {
  // Parse manually so percent-encoded characters in the password survive.
  const u = new URL(rawUrl)
  return new pg.Client({
    host: u.hostname,
    port: Number(u.port) || 5432,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.slice(1),
  })
}

const client = buildClient(readConnectionUrl())
await client.connect()

const { rows: tables } = await client.query(
  `SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' AND (table_name ~ $1 OR table_name = ANY($2))
   ORDER BY table_name`,
  [TABLE_PATTERN, EXTRA_TABLES],
)

const { rows: enums } = await client.query(
  `SELECT t.typname FROM pg_type t
   JOIN pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typtype = 'e' AND t.typname ~ $1
   ORDER BY t.typname`,
  [ENUM_PATTERN],
)

const relColumns = COLLECTIONS.map((c) => `${c}_id`)
const { rows: presentRelColumns } = await client.query(
  `SELECT column_name FROM information_schema.columns
   WHERE table_name = 'payload_locked_documents_rels' AND column_name = ANY($1)
   ORDER BY column_name`,
  [relColumns],
)

const existingRoots = tables.map((t) => t.table_name)
const { rows: counts } = await client.query(
  COLLECTIONS.filter((c) => existingRoots.includes(c))
    .map((c) => `SELECT '${c}' AS name, count(*)::int AS n FROM "${c}"`)
    .join(' UNION ALL '),
)

console.log(`\nTarget collections : ${COLLECTIONS.join(', ')}`)
console.log(`Rows to be deleted : ${counts.map((r) => `${r.name}=${r.n}`).join('  ')}`)
console.log(`Tables to drop     : ${tables.length}`)
console.log(`Enum types to drop : ${enums.length}`)
console.log(
  `Columns to drop    : payload_locked_documents_rels.{${presentRelColumns
    .map((r) => r.column_name)
    .join(', ')}}`,
)

if (!EXECUTE) {
  console.log('\nDRY RUN — nothing changed. Re-run with --execute to apply.')
  console.log('\nTables:')
  tables.forEach((t) => console.log('  ' + t.table_name))
  await client.end()
  process.exit(0)
}

try {
  await client.query('BEGIN')

  for (const { column_name } of presentRelColumns) {
    await client.query(
      `ALTER TABLE payload_locked_documents_rels DROP COLUMN IF EXISTS "${column_name}"`,
    )
  }

  for (const { table_name } of tables) {
    await client.query(`DROP TABLE IF EXISTS public."${table_name}" CASCADE`)
  }

  for (const { typname } of enums) {
    await client.query(`DROP TYPE IF EXISTS public."${typname}" CASCADE`)
  }

  await client.query('COMMIT')
  console.log(
    `\nDone. Dropped ${tables.length} tables, ${enums.length} enum types, ` +
      `${presentRelColumns.length} rel columns.`,
  )
} catch (err) {
  await client.query('ROLLBACK')
  console.error('\nFailed — rolled back, database unchanged.')
  console.error(err)
  process.exitCode = 1
} finally {
  await client.end()
}
