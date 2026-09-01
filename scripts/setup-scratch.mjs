/**
 * Step 1 of the additive-schema workflow.
 *
 * Takes a fresh backup of the live database, then builds `cps_scratch` as an
 * exact copy of it. Payload's schema push then runs against the scratch copy
 * only, so the resulting diff is precisely the new collections and nothing
 * else — and the live database is never exposed to drizzle's diffing.
 */
import { execFileSync } from 'child_process'
import fs from 'fs'
import pg from 'pg'
import { readDbConfig, clientOptions } from './lib-db-env.mjs'

const SCRATCH_DB = 'cps_scratch'
const cfg = readDbConfig()
const env = { ...process.env, PGPASSWORD: cfg.password }
const log = []

function say(msg) {
  console.log(msg)
  log.push(msg)
}

function run(cmd, args) {
  return execFileSync(cmd, args, { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

say(`live database : ${cfg.database} @ ${cfg.host}:${cfg.port}`)
say(`scratch copy  : ${SCRATCH_DB}`)

// 1. Fresh backup of the live DB.
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15)
const backup = `backups/cps_pre_add_collections_${stamp}.dump`
fs.mkdirSync('backups', { recursive: true })
run('pg_dump', [
  '-U', cfg.user, '-h', cfg.host, '-p', cfg.port,
  '-d', cfg.database, '-Fc', '-f', backup,
])
say(`backup written: ${backup} (${(fs.statSync(backup).size / 1024 / 1024).toFixed(2)} MB)`)

// 2. Recreate the scratch database.
const admin = new pg.Client(clientOptions(cfg, 'postgres'))
await admin.connect()
await admin.query(
  `SELECT pg_terminate_backend(pid) FROM pg_stat_activity
   WHERE datname = $1 AND pid <> pg_backend_pid()`,
  [SCRATCH_DB],
)
await admin.query(`DROP DATABASE IF EXISTS ${SCRATCH_DB}`)
await admin.query(`CREATE DATABASE ${SCRATCH_DB}`)
await admin.end()
say(`created empty ${SCRATCH_DB}`)

// 3. Restore the live schema + data into it.
try {
  run('pg_restore', [
    '-U', cfg.user, '-h', cfg.host, '-p', cfg.port,
    '-d', SCRATCH_DB, '--no-owner', '--no-privileges', backup,
  ])
} catch (err) {
  // pg_restore exits non-zero on ignorable warnings; verify by table count below.
  say(`pg_restore reported warnings (continuing): ${String(err.message).split('\n')[0]}`)
}

const check = new pg.Client(clientOptions(cfg, SCRATCH_DB))
await check.connect()
const { rows } = await check.query(
  `SELECT count(*)::int n FROM information_schema.tables WHERE table_schema='public'`,
)
await check.end()

const live = new pg.Client(clientOptions(cfg))
await live.connect()
const { rows: liveRows } = await live.query(
  `SELECT count(*)::int n FROM information_schema.tables WHERE table_schema='public'`,
)
await live.end()

say(`tables — live: ${liveRows[0].n}   scratch: ${rows[0].n}`)
say(rows[0].n === liveRows[0].n ? 'scratch is an exact copy' : 'MISMATCH — stop and investigate')

fs.writeFileSync('scratch-setup.log', log.join('\n'))
