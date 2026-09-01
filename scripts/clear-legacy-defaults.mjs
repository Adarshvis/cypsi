/**
 * Removes another project's wording from column defaults.
 *
 * The block configs were updated at some point but the database defaults never
 * were, so several columns still default to text naming an earlier project. A
 * default is what an editor gets when they add a block and leave a field alone,
 * so these are user-visible.
 *
 * Only DEFAULT clauses are touched. Existing row values are reported but not
 * rewritten, because a value an editor typed is content and not ours to change.
 *
 *   node scripts/clear-legacy-defaults.mjs             # report
 *   node scripts/clear-legacy-defaults.mjs --execute
 */
import { readFileSync, writeFileSync } from 'fs'
import pg from 'pg'

for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
  if (m && process.env[m[1]] === undefined)
    process.env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '')
}

const EXECUTE = process.argv.includes('--execute')

/** [table, column, new default] — null means drop the default entirely. */
const CHANGES = [
  ['pages_blocks_states_onboarded', 'heading', 'States Powered by Our Platform'],
  ['news_blocks_states_onboarded', 'heading', 'States Powered by Our Platform'],
  ['team_page_blocks_states_onboarded', 'heading', 'States Powered by Our Platform'],
  ['pages_blocks_goa_snapshot', 'section_title', 'Data Snapshots'],
  ['flex_dash_mock', 'top_badge_label', ''],
  ['flex_dash_mock', 'top_badge_value', ''],
  ['flex_dash_mock', 'bottom_chip_primary', ''],
  ['flex_dash_mock', 'bottom_chip_secondary', ''],
  ['flex_dash_mock', 'bottom_summary', ''],
  ['flex_dash_mock', 'sync_footer_text', ''],
]

/**
 * Strips the type cast Postgres reports on a default, so a stored
 * `'x'::character varying` can be compared with the plain string we want.
 */
function currentDefaultText(raw) {
  if (raw == null) return null
  const m = String(raw).match(/^'([\s\S]*)'::/)
  return m ? m[1].replace(/''/g, "'") : String(raw)
}

const client = new pg.Client({ connectionString: process.env.CMS_DATABASE_URL })
await client.connect()

const log = []
const say = (m) => {
  console.log(m)
  log.push(m)
}

const statements = []

for (const [table, column, next] of CHANGES) {
  const { rows } = await client.query(
    `select column_default from information_schema.columns
     where table_name = $1 and column_name = $2`,
    [table, column],
  )
  if (rows.length === 0) {
    say(`skip   ${table}.${column} — column not present`)
    continue
  }

  // Compared against the value the block config now declares, rather than
  // pattern-matched: the config is the source of truth, and a pattern misses
  // wording it was not told about.
  const current = currentDefaultText(rows[0].column_default)
  const differs = current !== next
  say(`${differs ? 'change' : 'ok    '} ${table}.${column} = ${JSON.stringify(current)}`)

  if (differs) {
    statements.push(
      `ALTER TABLE public."${table}" ALTER COLUMN "${column}" SET DEFAULT ${literal(next)};`,
    )
  }

  // Report any stored row that still carries the old wording, without altering it.
  const stored = await client.query(
    `select count(*)::int as n from public."${table}" where "${column}" ~* $1`,
    ['SamarthX|DUCC|Goa Live|UDISE|schools of India'],
  )
  if (stored.rows[0].n > 0) {
    say(`       ${stored.rows[0].n} existing row(s) still contain that text — edit in the admin`)
  }
}

/* ── site_settings.site_name NOT NULL ── */
const nameCheck = await client.query(
  `select count(*)::int as nulls from site_settings where site_name is null or trim(site_name) = ''`,
)
const nulls = nameCheck.rows[0].nulls
say('')
say(`site_settings rows with no site name: ${nulls}`)

if (nulls === 0) {
  const notNull = await client.query(
    `select is_nullable from information_schema.columns
     where table_name = 'site_settings' and column_name = 'site_name'`,
  )
  if (notNull.rows[0]?.is_nullable === 'YES') {
    statements.push(`ALTER TABLE public."site_settings" ALTER COLUMN "site_name" SET NOT NULL;`)
    say('site_name will be made NOT NULL (it is now required in the CMS)')
  }
} else {
  say('site_name left nullable — set a site name in Site Settings first')
}

function literal(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

say('')
say(`statements: ${statements.length}`)
for (const s of statements) say(`  ${s}`)

if (!EXECUTE) {
  say('')
  say('report only — pass --execute to apply')
  writeFileSync('legacy-defaults.txt', log.join('\n'))
  await client.end()
  process.exit(0)
}

if (statements.length > 0) {
  try {
    await client.query('BEGIN')
    for (const s of statements) await client.query(s)
    await client.query('COMMIT')
    say('')
    say(`applied ${statements.length} statement(s)`)
    writeFileSync(
      'schema-history/20260829_clear_legacy_defaults.sql',
      ['-- Removes an earlier project\'s wording from column defaults.', ...statements].join('\n'),
    )
  } catch (e) {
    await client.query('ROLLBACK')
    say(`rolled back: ${e.message}`)
    writeFileSync('legacy-defaults.txt', log.join('\n'))
    await client.end()
    process.exit(1)
  }
}

writeFileSync('legacy-defaults.txt', log.join('\n'))
await client.end()
