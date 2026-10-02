/**
 * Migrates the CyPSi About page into DUCC blocks.
 *
 * The source is four Mongo documents that each map to a Bootstrap section. A
 * one-to-one port produced six stacked bands on a single background colour,
 * two of which were card grids that left a hole in the last row (three cards
 * across five items). This build restructures instead:
 *
 *   1. storyTimeline  About Us narrative + Mission/Vision/Values as an icon
 *                     timeline, image right                          (white)
 *   2. statistics     Horizontal Strip — a dark band that breaks the
 *                     rhythm, replacing three thin outlined boxes     (dark)
 *   3. storyTimeline  Why Choose Us narrative + the five features as a
 *                     check-icon timeline, image left                 (grey)
 *   4. imageGallery   the campus set, three across                   (white)
 *
 * Bootstrap icon classes are mapped to Lucide names so the rendered page uses
 * DUCC's React icon components — no Bootstrap markup or icon fonts are carried
 * across.
 *
 *   npx tsx scripts/migrate-about-page.mts            # dry run
 *   npx tsx scripts/migrate-about-page.mts --execute
 */
import fs from 'fs'
import path from 'path'
import { loadEnv, readExport, MIGRATION_DIR, normalizeUrl, mapIcon } from './migrate-lib.mts'

const EXECUTE = process.argv.includes('--execute')
const slugArg = process.argv.find((a) => a.startsWith('--slug='))
const TARGET_SLUG = slugArg ? slugArg.split('=')[1] : 'about'

/** Section background colours, alternated to give the page vertical rhythm. */
const BG_SURFACE = '#FFFFFF'
const BG_MUTED = '#e6edf0'

loadEnv()

const { default: config } = await import('../src/payload.config.js')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const docs = readExport<any[]>('about-pages')
const mediaIdMap: Record<string, number> = JSON.parse(
  fs.readFileSync(path.join(MIGRATION_DIR, '_media-id-map.json'), 'utf8'),
)

const log: string[] = []
const say = (m: string) => {
  console.log(m)
  log.push(m)
}

function mediaId(ref: unknown): number | undefined {
  if (!ref) return undefined
  const key = typeof ref === 'string' ? ref : String((ref as any)?.$oid || (ref as any)?._id || ref)
  return mediaIdMap[key]
}

/** "50k+" -> { numericValue: 50, suffix: 'k+' };  "15" -> { numericValue: 15 } */
function parseStat(raw: unknown): { numericValue: number; suffix?: string } {
  const text = String(raw ?? '').trim()
  const m = text.match(/^(\d+(?:\.\d+)?)(.*)$/)
  if (!m) return { numericValue: 0, suffix: text || undefined }
  return {
    numericValue: Number(m[1]),
    suffix: m[2].trim() || undefined,
  }
}

const active = docs.filter((d) => d.status === 'active')
const byType = (type: string) => active.find((d) => d.sectionType === type)

const layout: Record<string, unknown>[] = []

/* ── 1. About Us + Mission / Vision / Values ────────────────────────────
   Two source sections become one. The narrative sits left with the three
   MVV cards below it as a vertical timeline — their icons become the
   timeline markers — and the about image sits right. That removes a flat
   band and a three-across card grid without losing any content.        */
const mainDoc = byType('about-main')
const mvv = byType('mission-vision-values')?.missionVisionValues?.cards?.filter((c: any) => c?.title) || []

if (mainDoc?.aboutMain?.title) {
  const a = mainDoc.aboutMain

  layout.push({
    blockType: 'storyTimeline',
    eyebrow: a.subtitle,
    heading: a.title,
    body: a.description,
    imagePosition: 'right',
    image: mediaId(a.image),
    layoutStyle: 'cards',
    timeline: mvv.map((c: any) => ({
      title: c.title,
      description: c.description,
      icon: mapIcon(c.icon),
    })),
    backgroundColor: BG_SURFACE,
  })
  say(`aboutMain + MVV : storyTimeline (image ${mediaId(a.image) ?? 'none'}, ${mvv.length} timeline nodes)`)
  say(`  icons         : ${mvv.map((c: any) => `${c.icon}→${mapIcon(c.icon) || '?'}`).join(', ')}`)

  /* ── 2. Stats as a dark horizontal strip ── */
  const stats = (a.stats || []).filter((s: any) => s?.label)
  if (stats.length) {
    layout.push({
      blockType: 'statistics',
      layout: 'duccStrip',
      enableCountUp: true,
      stats: stats.map((s: any) => ({
        label: s.label,
        ...parseStat(s.count),
      })),
    })
    say(`stats           : statistics / duccStrip, ${stats.length} stats (dark band)`)
  }
}

/* ── 3. Why Choose Us ───────────────────────────────────────────────────
   CyPSi renders the five points as a check-icon list, not as cards. As a
   timeline they keep that reading and the odd count stops mattering. The
   image flips to the left so the page alternates.                      */
const whyDoc = byType('why-choose-us')
if (whyDoc?.whyChooseUs?.title) {
  const w = whyDoc.whyChooseUs
  const gallery = (w.galleryImages || [])
    .map((g: any) => ({ id: mediaId(g.image), alt: g.alt }))
    .filter((g: any) => typeof g.id === 'number')

  const ctaLink = normalizeUrl(w.buttonLink)
  const ctaUsable = Boolean(w.buttonText && ctaLink && ctaLink !== '#')

  layout.push({
    blockType: 'storyTimeline',
    eyebrow: w.subtitle,
    heading: w.title,
    body: w.description,
    imagePosition: 'left',
    image: gallery[0]?.id,
    layoutStyle: 'checklist',
    timeline: (w.features || [])
      .filter((f: any) => f?.text)
      .map((f: any) => ({ title: f.text, icon: 'CircleCheck' })),
    ...(ctaUsable ? { ctaLabel: w.buttonText, ctaUrl: ctaLink } : {}),
    backgroundColor: BG_MUTED,
  })
  say(
    `whyChooseUs     : storyTimeline (image ${gallery[0]?.id ?? 'none'}, ${
      (w.features || []).length
    } check nodes)${ctaUsable ? '' : ' — CTA dropped, CyPSi link is "#"'}`,
  )

  /* ── 4. Campus gallery ── */
  if (gallery.length) {
    layout.push({
      blockType: 'imageGallery',
      sectionHeading: 'Our Campus',
      headingAlignment: 'center',
      columns: gallery.length === 3 ? '3' : gallery.length === 2 ? '2' : '3',
      images: gallery.map((g: any) => ({ image: g.id, caption: g.alt })),
      backgroundColor: BG_SURFACE,
    })
    say(`gallery         : imageGallery, ${gallery.length} images`)
  }
}

/* ── Assemble ──────────────────────────────────────────────────────────── */
const pageTitle = byType('page-title')?.pageTitle?.title || 'About'

say('')
say(`page title  : ${pageTitle}`)
say(`total blocks: ${layout.length} (was 6)`)
say(`blocks      : ${layout.map((b) => b.blockType).join(' → ')}`)

if (!EXECUTE) {
  fs.writeFileSync(
    path.join(MIGRATION_DIR, '_about-page-plan.json'),
    JSON.stringify(layout, null, 2),
  )
  say('')
  say('DRY RUN — plan written to migration-data/_about-page-plan.json')
  fs.writeFileSync(path.join(MIGRATION_DIR, '_about-page-migration.log'), log.join('\n'))
  process.exit(0)
}

const existing = await payload.find({
  collection: 'pages',
  where: { slug: { equals: TARGET_SLUG } },
  limit: 1,
  overrideAccess: true,
})
const prior = existing.docs[0] as Record<string, any> | undefined

let page
if (prior) {
  page = await payload.update({
    collection: 'pages',
    id: prior.id,
    overrideAccess: true,
    data: { title: pageTitle, layout } as never,
  })
  say('')
  say(`updated page id ${page.id} at /${TARGET_SLUG} (was "${prior.title}")`)
} else {
  page = await payload.create({
    collection: 'pages',
    overrideAccess: true,
    data: {
      title: pageTitle,
      slug: TARGET_SLUG,
      status: 'published',
      showInNav: true,
      navOrder: 1,
      layout,
    } as never,
  })
  say('')
  say(`created page id ${page.id} at /${TARGET_SLUG}`)
}

fs.writeFileSync(path.join(MIGRATION_DIR, '_about-page-migration.log'), log.join('\n'))
process.exit(0)
