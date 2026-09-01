/**
 * Step 2 of the additive-schema workflow.
 *
 * Boots Payload with schema push enabled, pointed at `cps_scratch` only.
 * Because the scratch DB starts as an exact copy of live, whatever push does
 * here is exactly the delta introduced by the new collections.
 *
 *   npx tsx scripts/push-scratch.mts
 */
import fs from 'fs'

const SCRATCH_DB = 'cps_scratch'

// Load .env manually — tsx does not do it for us.
for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
  if (m && process.env[m[1]] === undefined) {
    process.env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '')
  }
}

const liveUrl = process.env.CMS_DATABASE_URL
if (!liveUrl) throw new Error('CMS_DATABASE_URL missing')

const parsed = new URL(liveUrl)
if (parsed.pathname.slice(1) === SCRATCH_DB) {
  throw new Error('refusing to run: CMS_DATABASE_URL already points at the scratch DB')
}
parsed.pathname = `/${SCRATCH_DB}`

// Must be set before the config module is evaluated.
process.env.CMS_DATABASE_URL = parsed.toString()
process.env.CMS_DB_PUSH = 'true'

console.log(`pushing schema into "${SCRATCH_DB}" (live DB untouched)`)

const { default: config } = await import('../src/payload.config.js')
const { getPayload } = await import('payload')

await getPayload({ config })

console.log('push finished')
process.exit(0)
