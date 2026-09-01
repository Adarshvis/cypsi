/**
 * Fails if a previous project's name appears in runtime source.
 *
 * Everything user-facing should come from the CMS, so a literal brand name in
 * code is a bug. Migration files are excluded: they are a historical record of
 * statements already applied and rewriting them would misrepresent what ran.
 *
 *   node scripts/check-generic.mjs
 */
import { readFileSync, readdirSync, statSync } from 'fs'
import path from 'path'

const ROOTS = ['src']

/** Historical or internal: not user-facing text. */
const EXCLUDED_PATHS = [
  'src/migrations', // record of applied SQL
  'src/payload-types.ts', // generated
]

/**
 * Terms that must not appear as user-facing copy.
 *
 * `ducc` is matched only as a whole word or brand phrase, because it is also a
 * legitimate prefix on internal layout identifiers such as `duccService`, which
 * are enum values in the database and not shown to anyone.
 */
const BANNED = [
  { pattern: /SamarthX/i, label: 'SamarthX' },
  { pattern: /\bDUCC\b(?!Service|Project|Training|Banner|Accordion)/, label: 'DUCC' },
  { pattern: /Delhi University/i, label: 'Delhi University' },
  { pattern: /UDISE/i, label: 'UDISE' },
  { pattern: /\bGoa (Live|School)/i, label: 'Goa Live / Goa School' },
  { pattern: /schools of India/i, label: 'schools of India' },
]

const files = []
function walk(dir) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return
  }
  for (const e of entries) {
    const p = path.join(dir, e)
    const rel = p.replace(/\\/g, '/')
    if (EXCLUDED_PATHS.some((x) => rel.startsWith(x))) continue
    if (statSync(p).isDirectory()) walk(p)
    else if (/\.(tsx?|mts|mjs)$/.test(p)) files.push(rel)
  }
}
for (const r of ROOTS) walk(r)

const hits = []
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/)
  lines.forEach((line, i) => {
    for (const { pattern, label } of BANNED) {
      if (pattern.test(line)) {
        hits.push(`${file}:${i + 1}  [${label}]  ${line.trim().slice(0, 110)}`)
      }
    }
  })
}

if (hits.length === 0) {
  console.log(`clean — ${files.length} files scanned, no legacy brand text`)
  process.exit(0)
}

console.log(`${hits.length} occurrence(s) of legacy brand text:`)
for (const h of hits) console.log(`  ${h}`)
process.exit(1)
