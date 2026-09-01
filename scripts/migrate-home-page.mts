/**
 * Stage 2: rebuild the CyPSi home page as a DUCC `pages` document made of
 * existing blocks.
 *
 * Only the sections CyPSi actually renders are migrated. Its home-page docs
 * carry leftover data for every other section type (two-media, multi-media,
 * 3D, audio) but `layoutType` is `text-slider`, so none of that is live.
 *
 * Writes to slug `cypsi-home` so DUCC's existing `home` page is untouched.
 * Re-running replaces that page.
 *
 *   npx tsx scripts/migrate-home-page.mts            # dry run, prints plan
 *   npx tsx scripts/migrate-home-page.mts --execute
 */
import fs from 'fs'
import path from 'path'
import {
  loadEnv,
  readExport,
  MIGRATION_DIR,
  richText,
  richTextHeading,
  richTextSection,
  normalizeUrl,
  mapIcon,
  youtubeEmbedUrl,
} from './migrate-lib.mts'

const EXECUTE = process.argv.includes('--execute')

const slugArg = process.argv.find((a) => a.startsWith('--slug='))
/** Defaults to the live front page; override with --slug=cypsi-home to stage. */
const TARGET_SLUG = slugArg ? slugArg.split('=')[1] : 'home'

loadEnv()

const { default: config } = await import('../src/payload.config.js')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const docs = readExport<any[]>('home-pages')
const mediaIdMap: Record<string, number> = JSON.parse(
  fs.readFileSync(path.join(MIGRATION_DIR, '_media-id-map.json'), 'utf8'),
)

const log: string[] = []
const say = (m: string) => {
  console.log(m)
  log.push(m)
}

/** Resolves a CyPSi media reference to a DUCC media id. */
function mediaId(ref: unknown): number | undefined {
  if (!ref) return undefined
  const key = typeof ref === 'string' ? ref : String((ref as any)?.$oid || (ref as any)?._id || ref)
  return mediaIdMap[key]
}

const active = docs
  .filter((d) => d.status === 'active')
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

/**
 * CyPSi's home page cards link to /research-domains/<slug>, but some of those
 * slugs do not exist in its research-domains collection. Rather than migrate
 * dead links, validate against the real slugs and drop the ones that miss.
 */
let validDomainSlugs = new Set<string>()
try {
  validDomainSlugs = new Set(
    readExport<any[]>('research-domains').map((d) => String(d.slug)),
  )
} catch {
  // export not present; links pass through unchanged
}

function validateDomainLink(url?: string): string | undefined {
  const normalized = normalizeUrl(url)
  if (!normalized || validDomainSlugs.size === 0) return normalized
  const m = normalized.match(/^\/research-domains\/(.+)$/)
  if (!m) return normalized
  if (validDomainSlugs.has(m[1])) return normalized
  say(`  ! dropped dead link ${normalized} (no such research domain)`)
  return undefined
}

const byType = (type: string) => active.find((d) => d.sectionType === type)

const layout: Record<string, unknown>[] = []

/* ── 1. Hero ───────────────────────────────────────────────────────────── */
const heroDoc = byType('hero')
if (heroDoc?.hero) {
  const h = heroDoc.hero
  const slideImages: number[] = (h.heroImages || [])
    .map((s: any) => mediaId(s.image))
    .filter((v: unknown): v is number => typeof v === 'number')

  const buttons = [
    h.primaryButton?.text && {
      label: h.primaryButton.text,
      url: normalizeUrl(h.primaryButton.link) || '#',
      variant: 'primary',
    },
    h.secondaryButton?.text && {
      label: h.secondaryButton.text,
      url: normalizeUrl(h.secondaryButton.link) || '#',
      variant: 'outline',
    },
  ].filter(Boolean)

  // The 50/50 layout keeps text static while media rotates, so the same text
  // is written to every slide.
  const slideText = {
    showText: true,
    heading: h.title,
    subtitle: h.description,
    buttons,
  }

  layout.push({
    blockType: 'hero',
    mode: slideImages.length > 1 ? 'carousel' : 'single',
    layout: 'split',
    splitDirection: 'textLeft',
    splitTheme: 'light',
    splitTextBehavior: 'static',
    splitFeatures: (h.features || [])
      .filter((f: any) => f?.text)
      .map((f: any) => ({ icon: mapIcon(f.icon), text: f.text })),
    ...(slideImages.length > 1
      ? { slides: slideImages.map((id) => ({ mediaType: 'image', image: id, ...slideText })) }
      : { singleSlide: { mediaType: 'image', image: slideImages[0], ...slideText } }),
  })
  say(`hero            : ${slideImages.length} slides, ${buttons.length} buttons, ${(h.features || []).length} features`)
}

/* ── 2. Research Domains ───────────────────────────────────────────────── */
const domainsDoc = byType('featured-instructors')
if (domainsDoc?.featuredInstructors?.instructors?.length) {
  const d = domainsDoc.featuredInstructors
  const cards = d.instructors
    .filter((i: any) => i?.name && mediaId(i.image))
    .map((i: any) => ({
      title: i.name,
      image: mediaId(i.image),
      description: i.description,
      url: validateDomainLink(i.profileLink),
    }))

  layout.push({
    blockType: 'showcaseCards',
    sectionHeading: d.title,
    sectionDescription: d.description,
    headingAlignment: 'center',
    cardStyle: 'clean',
    columns: '4',
    cards,
    backgroundColor: '#F9FAFB',
  })
  say(`researchDomains : ${cards.length} cards`)
}

/* ── 3. About Us ───────────────────────────────────────────────────────── */
const storyDoc = byType('our-story')
if (storyDoc?.ourStory?.title) {
  const s = storyDoc.ourStory

  // One storyTimeline block covers what previously needed four: the narrative,
  // the milestone timeline, the CTA as the timeline's final node, the image and
  // the mission/vision cards — all in a single two-column section.
  layout.push({
    blockType: 'storyTimeline',
    eyebrow: s.subtitle,
    heading: s.title,
    body: s.description,
    imagePosition: 'right',
    image: mediaId(s.campusImage),
    timeline: (s.timelinePoints || [])
      .filter((t: any) => t?.title)
      .map((t: any) => ({ title: t.title, description: t.description })),
    ctaLabel: s.buttonText || undefined,
    ctaUrl: normalizeUrl(s.buttonLink),
    highlightCards: (s.missionVisionCards || [])
      .filter((c: any) => c?.title)
      .map((c: any) => ({ title: c.title, description: c.description })),
    backgroundColor: '#e6edf0',
  })
  say(
    `aboutUs         : storyTimeline — ${(s.timelinePoints || []).length} milestones, ` +
      `${(s.missionVisionCards || []).length} cards, image ${mediaId(s.campusImage) ?? 'none'}`,
  )
}

/* ── 4. Featured News (collection-driven) ──────────────────────────────── */
const newsDoc = byType('featured-news')
if (newsDoc?.featuredNews) {
  layout.push({
    blockType: 'newsUpdates',
    sectionHeading: newsDoc.featuredNews.title || 'Featured News',
    sectionDescription: newsDoc.featuredNews.description,
    headingAlignment: 'center',
    layout: 'spotlight',
    entryType: 'collection',
    collectionSource: { limit: 5, sortBy: 'latest' },
  })
  say(`featuredNews    : spotlight, fetches from the news collection`)
}

/* ── 5/7. Videos from custom blocks ────────────────────────────────────── */
/** CyPSi's video block width -> the embed block's width option. */
const WIDTH_MAP: Record<string, string> = {
  full: 'fullBleed',
  wide: 'wide',
  contained: 'full',
}

function pushVideoBlocks(blocks: any[] | undefined, label: string) {
  for (const b of blocks || []) {
    if (b.blockType !== 'video') continue
    const url = youtubeEmbedUrl(b.videoUrl)
    if (!url) continue
    const width = WIDTH_MAP[b.width as string] || 'full'
    layout.push({
      blockType: 'embed',
      sectionHeading: b.title,
      sectionDescription: b.description,
      headingAlignment: 'center',
      embedType: 'iframe',
      iframeUrl: url,
      width,
      // Height intentionally omitted so the frame stays a responsive 16:9.
    })
    say(`${label.padEnd(16)}: embed ${b.title ? `"${b.title}"` : url} (width=${width})`)
  }
}

pushVideoBlocks(byType('custom-block')?.customBlock, 'pastActivities')

/* ── 6. Work With Us ───────────────────────────────────────────────────── */
const workDoc = byType('featured-courses')
if (workDoc?.featuredCourses?.courses?.length) {
  const w = workDoc.featuredCourses
  // featureCards rather than showcaseCards, because CyPSi gives each programme
  // its own call to action ("Read More", "Apply For Internship") and
  // showcaseCards only supports a card-wide link.
  const cards = w.courses
    .filter((c: any) => c?.title && mediaId(c.image))
    .map((c: any) => ({
      image: mediaId(c.image),
      title: richTextHeading(c.title),
      description: richText(c.description),
      buttonLabel: c.buttonText || 'Read More',
      buttonUrl: normalizeUrl(c.buttonLink),
      link: normalizeUrl(c.buttonLink),
    }))

  layout.push({
    blockType: 'featureCards',
    sectionHeading: w.title,
    sectionDescription: w.description,
    headingAlignment: 'center',
    cardLayout: 'classic',
    cardTheme: 'light',
    columns: '3',
    showCardButton: true,
    cards,
  })
  say(`workWithUs      : ${cards.length} cards with buttons`)

  // "VC's Speech" lives in this section's contentBlocks
  pushVideoBlocks(workDoc.contentBlocks, 'vcSpeech')
}

/* ── Assemble the page ─────────────────────────────────────────────────── */
say('')
say(`total blocks: ${layout.length}`)
say(`blocks in order: ${layout.map((b) => b.blockType).join(' → ')}`)

if (!EXECUTE) {
  fs.writeFileSync(
    path.join(MIGRATION_DIR, '_home-page-plan.json'),
    JSON.stringify(layout, null, 2),
  )
  say('')
  say('DRY RUN — plan written to migration-data/_home-page-plan.json')
  say('Re-run with --execute to create the page.')
  fs.writeFileSync(path.join(MIGRATION_DIR, '_home-page-migration.log'), log.join('\n'))
  process.exit(0)
}

const existing = await payload.find({
  collection: 'pages',
  where: { slug: { equals: TARGET_SLUG } },
  limit: 1,
  overrideAccess: true,
})

// Update in place when the page exists, so a validation failure can never
// leave the site without its page, and manual admin edits to the title, nav
// placement and status are preserved.
const prior = existing.docs[0] as Record<string, any> | undefined

let page
if (prior) {
  page = await payload.update({
    collection: 'pages',
    id: prior.id,
    overrideAccess: true,
    data: { layout } as never,
  })
  say('')
  say(`updated page id ${page.id} ("${prior.title}") at /${TARGET_SLUG} — layout replaced`)
} else {
  page = await payload.create({
    collection: 'pages',
    overrideAccess: true,
    data: {
      title: 'Home',
      slug: TARGET_SLUG,
      status: 'published',
      // Must be true, or the nav sync hook treats the page as unmanaged and any
      // hand-written "Home" link in the header gets stripped on the next save.
      showInNav: true,
      navOrder: 0,
      layout,
    } as never,
  })
  say('')
  say(`created page id ${page.id} at /${TARGET_SLUG}`)
}

fs.writeFileSync(path.join(MIGRATION_DIR, '_home-page-migration.log'), log.join('\n'))
process.exit(0)
