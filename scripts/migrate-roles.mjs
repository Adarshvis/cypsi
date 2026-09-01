/**
 * Aligns the users.roles enum with the new role model.
 *
 *   1. adds 'admin' and 'author' to the enum
 *   2. rewrites existing 'school_admin' rows to 'admin'
 *
 * ALTER TYPE ... ADD VALUE is used rather than recreating the enum, because the
 * type is in use by a column and recreating it would require rewriting the table
 * under an exclusive lock. 'school_admin' is left in the enum afterwards as an
 * unused value: Postgres cannot drop an enum label, and no code offers it any
 * more, so it is harmless.
 *
 *   node scripts/migrate-roles.mjs             # report only
 *   node scripts/migrate-roles.mjs --execute
 */
import { readFileSync, writeFileSync } from 'fs'
import pg from 'pg'

for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
  if (m && process.env[m[1]] === undefined)
    process.env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '')
}

const EXECUTE = process.argv.includes('--execute')
const ENUM = 'enum_users_roles'
const NEW_VALUES = ['admin', 'author']

const client = new pg.Client({ connectionString: process.env.CMS_DATABASE_URL })
await client.connect()

const log = []
const say = (m) => {
  console.log(m)
  log.push(m)
}

const { rows: enumRows } = await client.query(
  `select e.enumlabel from pg_enum e join pg_type t on t.oid = e.enumtypid
   where t.typname = $1 order by e.enumsortorder`,
  [ENUM],
)

if (enumRows.length === 0) {
  say(`enum ${ENUM} not found — is users.roles a hasMany select?`)
  await client.end()
  process.exit(1)
}

const existing = enumRows.map((r) => r.enumlabel)
say(`enum ${ENUM} currently: ${existing.join(', ')}`)

const toAdd = NEW_VALUES.filter((v) => !existing.includes(v))
say(`values to add          : ${toAdd.length ? toAdd.join(', ') : 'none'}`)

const { rows: counts } = await client.query(
  `select value::text as role, count(*)::int as n from users_roles group by value order by value`,
)
say(`current role rows      : ${JSON.stringify(counts)}`)

const schoolAdmins = counts.find((c) => c.role === 'school_admin')?.n || 0
say(`school_admin rows      : ${schoolAdmins}`)

if (!EXECUTE) {
  say('')
  say('report only — pass --execute to apply')
  writeFileSync('roles-migration.txt', log.join('\n'))
  await client.end()
  process.exit(0)
}

/*
 * ADD VALUE cannot run inside a transaction block that later uses the new value,
 * so the labels are added first and committed, then the data is updated.
 */
for (const value of toAdd) {
  await client.query(`ALTER TYPE public."${ENUM}" ADD VALUE IF NOT EXISTS '${value}'`)
  say(`added enum value       : ${value}`)
}

if (schoolAdmins > 0) {
  // Any user who already has both loses the duplicate rather than colliding.
  const { rowCount: deduped } = await client.query(
    `delete from users_roles a
     where a.value = 'school_admin'
       and exists (select 1 from users_roles b
                   where b.parent_id = a.parent_id and b.value = 'admin')`,
  )
  if (deduped) say(`removed duplicates     : ${deduped}`)

  const { rowCount } = await client.query(
    `update users_roles set value = 'admin' where value = 'school_admin'`,
  )
  say(`school_admin -> admin  : ${rowCount} row(s)`)
}

const { rows: after } = await client.query(
  `select value::text as role, count(*)::int as n from users_roles group by value order by value`,
)
say(`final role rows        : ${JSON.stringify(after)}`)

writeFileSync('roles-migration.txt', log.join('\n'))
writeFileSync(
  'schema-history/20260828_role_model_admin_author.sql',
  [
    '-- Adds the new role labels and retires school_admin.',
    ...toAdd.map((v) => `ALTER TYPE public."${ENUM}" ADD VALUE IF NOT EXISTS '${v}';`),
    `UPDATE users_roles set value = 'admin' where value = 'school_admin';`,
    '-- school_admin remains an unused enum label; Postgres cannot drop one.',
  ].join('\n'),
)

await client.end()
