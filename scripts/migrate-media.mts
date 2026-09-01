/**
 * Stage 1 of the content migration: copy CyPSi images into DUCC's media
 * collection through the Payload Local API, so imageOptimizer generates webp
 * derivatives and thumbhashes exactly as it would for a manual upload.
 *
 * Idempotent — an image whose filename already exists in DUCC is reused, not
 * duplicated. Writes migration-data/_media-id-map.json mapping the CyPSi
 * ObjectId to the new Postgres integer id.
 *
 *   npx tsx scripts/migrate-media.mts            # dry run
 *   npx tsx scripts/migrate-media.mts --execute
 */
import fs from 'fs'
import path from 'path'
import {
  loadEnv,
  MIGRATION_DIR,
  CYPSI_MEDIA_DIR,
  buildMediaFilenameMap,
} from './migrate-lib.mts'

const EXECUTE = process.argv.includes('--execute')
loadEnv()

const { default: config } = await import('../src/payload.config.js')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const wanted = buildMediaFilenameMap()
const log: string[] = []
const say = (m: string) => {
  console.log(m)
  log.push(m)
}

say(`CyPSi media referenced by the export: ${wanted.size}`)
say(`source directory: ${CYPSI_MEDIA_DIR}`)
say(EXECUTE ? 'mode: EXECUTE' : 'mode: DRY RUN')
say('')

const idMap: Record<string, number> = {}
let created = 0
let reused = 0
let missing = 0

for (const [objectId, { filename, alt }] of wanted) {
  const sourcePath = path.join(CYPSI_MEDIA_DIR, filename)

  if (!fs.existsSync(sourcePath)) {
    say(`  MISSING  ${filename}`)
    missing++
    continue
  }

  // Already in DUCC? Match on the original filename, and on the webp the
  // optimizer would have produced from it.
  const base = filename.replace(/\.[^.]+$/, '')
  const existing = await payload.find({
    collection: 'media',
    where: { or: [{ filename: { equals: filename } }, { filename: { equals: `${base}.webp` } }] },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs.length) {
    idMap[objectId] = existing.docs[0].id as number
    say(`  REUSE    ${filename}  -> media id ${existing.docs[0].id}`)
    reused++
    continue
  }

  if (!EXECUTE) {
    say(`  UPLOAD   ${filename}`)
    created++
    continue
  }

  try {
    const doc = await payload.create({
      collection: 'media',
      filePath: sourcePath,
      data: { alt: alt || base.replace(/[-_]+/g, ' ') } as never,
      overrideAccess: true,
    })
    idMap[objectId] = doc.id as number
    say(`  CREATED  ${filename}  -> media id ${doc.id}`)
    created++
  } catch (err) {
    say(`  FAILED   ${filename}: ${err instanceof Error ? err.message : 'unknown error'}`)
  }
}

say('')
say(`created: ${created}   reused: ${reused}   missing: ${missing}`)

if (EXECUTE) {
  // Merge, so migrating one page never discards another page's id mappings.
  const mapPath = path.join(MIGRATION_DIR, '_media-id-map.json')
  const previous: Record<string, number> = fs.existsSync(mapPath)
    ? JSON.parse(fs.readFileSync(mapPath, 'utf8'))
    : {}
  const merged = { ...previous, ...idMap }
  fs.writeFileSync(mapPath, JSON.stringify(merged, null, 2))
  say(`id map written to migration-data/_media-id-map.json (${Object.keys(merged).length} entries)`)
} else {
  say('DRY RUN — nothing uploaded. Re-run with --execute.')
}

fs.writeFileSync(path.join(MIGRATION_DIR, '_media-migration.log'), log.join('\n'))
process.exit(0)
