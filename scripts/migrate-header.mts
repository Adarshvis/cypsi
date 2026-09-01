/**
 * Header fixes for the CyPSi site.
 *
 * The header renders only a logo because `header_nav_items` is empty — the nav
 * links went away with DUCC's original pages. This uploads the CyPSi logo and
 * writes the nav, mirroring the source site's menu but pointing only at routes
 * that exist here.
 *
 *   npx tsx scripts/migrate-header.mts            # dry run
 *   npx tsx scripts/migrate-header.mts --execute
 */
import fs from 'fs'
import path from 'path'
import { loadEnv, CYPSI_MEDIA_DIR } from './migrate-lib.mts'

const EXECUTE = process.argv.includes('--execute')
loadEnv()

const { default: config } = await import('../src/payload.config.js')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const LOGO_FILE = 'cypsi_lab_logo-1.png'

/** CyPSi's menu, limited to destinations that resolve in this codebase. */
const NAV_ITEMS = [
  { label: 'Home', url: '/' },
  { label: 'About', url: '/about' },
  { label: 'Publications', url: '/publications' },
  { label: 'News', url: '/news' },
  { label: 'Team', url: '/team' },
]

const log: string[] = []
const say = (m: string) => {
  console.log(m)
  log.push(m)
}

/* ── Logo ──────────────────────────────────────────────────────────────── */
const logoPath = path.join(CYPSI_MEDIA_DIR, LOGO_FILE)
let logoId: number | undefined

if (!fs.existsSync(logoPath)) {
  say(`logo missing on disk: ${logoPath}`)
} else {
  const base = LOGO_FILE.replace(/\.[^.]+$/, '')
  const found = await payload.find({
    collection: 'media',
    where: { or: [{ filename: { equals: LOGO_FILE } }, { filename: { equals: `${base}.webp` } }] },
    limit: 1,
    overrideAccess: true,
  })

  if (found.docs.length) {
    logoId = found.docs[0].id as number
    say(`logo already present -> media id ${logoId}`)
  } else if (EXECUTE) {
    const doc = await payload.create({
      collection: 'media',
      filePath: logoPath,
      data: { alt: 'CyPSi Laboratory' } as never,
      overrideAccess: true,
    })
    logoId = doc.id as number
    say(`logo uploaded -> media id ${logoId}`)
  } else {
    say(`would upload ${LOGO_FILE}`)
  }
}

/* ── Header global ─────────────────────────────────────────────────────── */
const current = (await payload.findGlobal({ slug: 'header', overrideAccess: true })) as any

say('')
say(`existing nav items : ${(current.navItems || []).length}`)
say(`existing logo id   : ${current.leftLogo?.image?.id ?? current.leftLogo?.image ?? 'none'}`)
say(`cta enabled        : ${current.ctaButton?.enabled}`)
say('')
say('nav to write:')
NAV_ITEMS.forEach((n) => say(`  ${n.label} -> ${n.url}`))

if (!EXECUTE) {
  say('')
  say('DRY RUN — nothing written. Re-run with --execute.')
  process.exit(0)
}

await payload.updateGlobal({
  slug: 'header',
  overrideAccess: true,
  data: {
    ...current,
    leftLogo: {
      ...(current.leftLogo || {}),
      ...(logoId ? { image: logoId } : {}),
      url: '/',
      height: 52,
      maxWidth: 170,
    },
    navAlignment: 'center',
    navItems: NAV_ITEMS.map((n) => ({ label: n.label, url: n.url })),
    ctaButton: {
      enabled: true,
      label: 'Enroll Now',
      url: '/publications',
    },
  } as never,
})

say('')
say('header updated: logo, nav items, centred alignment, CTA enabled')
say('CTA points at /publications for now — change it in the Header global once')
say('the enrolment destination exists.')

fs.writeFileSync('migration-data/_header-migration.log', log.join('\n'))
process.exit(0)
