/**
 * Confirms hiding themePreset kept the value, the API field and the rendered
 * theme intact — i.e. it is hidden, not removed.
 */
import { readFileSync, writeFileSync } from 'fs'
import pg from 'pg'

for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
  if (m && process.env[m[1]] === undefined)
    process.env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '')
}

const out = []
let failures = 0
const check = (label, ok, detail = '') => {
  if (ok) out.push(`ok    ${label}`)
  else {
    failures++
    out.push(`FAIL  ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

/* Column and stored value still present */
const client = new pg.Client({ connectionString: process.env.CMS_DATABASE_URL })
await client.connect()
const col = await client.query(
  `select column_name from information_schema.columns
   where table_name = 'site_settings' and column_name = 'theme_preset'`,
)
check('theme_preset column still exists', col.rows.length === 1)

const val = await client.query(`select theme_preset from site_settings limit 1`)
const stored = val.rows[0]?.theme_preset
check('stored value preserved', Boolean(stored), `value is ${JSON.stringify(stored)}`)
out.push(`      stored preset: ${stored}`)
await client.end()

/* Still exposed over the API, so the frontend can read it */
const api = await fetch('http://localhost:3666/api/globals/site-settings?depth=0')
const body = await api.json()
check('still returned by the REST API', body?.themePreset === stored, JSON.stringify(body?.themePreset))

/* Theme still applied to the rendered page */
const page = await fetch('http://localhost:3666/')
const html = await page.text()
check(`page still renders data-theme="${stored}"`, html.includes(`data-theme="${stored}"`))
check('theme CSS variable still set', /--cms-theme:\s*learner|--cms-theme:\s*ducc/.test(html))

out.push('')
out.push(failures === 0 ? 'all checks passed' : `${failures} check(s) failed`)
writeFileSync('theme-check.txt', out.join('\n'))
process.exit(failures === 0 ? 0 : 1)
