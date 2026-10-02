/**
 * Creates the /help page with the Accessibility Statement block, which the
 * header's accessibility button links to (/help#accessibility). Also fills the
 * Site Settings accessibility labels if they are empty.
 *
 * Safe to re-run: an existing /help page is left alone unless it lacks the
 * block, in which case the block is appended.
 *
 *   npx tsx scripts/seed-help-page.mts            # dry run
 *   npx tsx scripts/seed-help-page.mts --execute
 */
import fs from 'fs'

for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '')
}

const EXECUTE = process.argv.includes('--execute')
const { default: config } = await import('../src/payload.config.js')
const { getPayload } = await import('payload')
const { AccessibilityStatement } = await import('../src/blocks/AccessibilityStatement.js')
const payload = await getPayload({ config })

// The block's own defaults are the single source of the statement text.
const defaults = Object.fromEntries(
  AccessibilityStatement.fields
    .filter((f: any) => 'name' in f && f.defaultValue !== undefined)
    .map((f: any) => [f.name, f.defaultValue]),
)
const block = { blockType: 'accessibilityStatement', ...defaults }

const existing = (
  await payload.find({ collection: 'pages', where: { slug: { equals: 'help' } }, limit: 1, overrideAccess: true, depth: 0 })
).docs[0] as any

if (!existing) {
  console.log('help page   : will create /help (published, not in nav)')
  if (EXECUTE) {
    const page = await payload.create({
      collection: 'pages',
      overrideAccess: true,
      data: { title: 'Help', slug: 'help', status: 'published', showInNav: false, layout: [block] } as never,
    })
    console.log(`              created page ${page.id}`)
  }
} else if (!(existing.layout || []).some((b: any) => b.blockType === 'accessibilityStatement')) {
  console.log(`help page   : /help exists (id ${existing.id}); will append the accessibility block`)
  if (EXECUTE) {
    await payload.update({
      collection: 'pages',
      id: existing.id,
      overrideAccess: true,
      data: { layout: [...(existing.layout || []), block] } as never,
    })
  }
} else {
  console.log('help page   : already has the accessibility block, nothing to do')
}

const settings: any = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
const a11y = settings?.accessibility || {}
const fill = {
  skipLinkLabel: a11y.skipLinkLabel || 'Skip to main content',
  showHeaderLink: a11y.showHeaderLink ?? true,
  headerLinkLabel: a11y.headerLinkLabel || 'Accessibility options',
  headerLinkUrl: a11y.headerLinkUrl || '/help#accessibility',
}
const needsFill = JSON.stringify(fill) !== JSON.stringify({
  skipLinkLabel: a11y.skipLinkLabel, showHeaderLink: a11y.showHeaderLink, headerLinkLabel: a11y.headerLinkLabel, headerLinkUrl: a11y.headerLinkUrl,
})
console.log(`settings    : ${needsFill ? 'will fill empty accessibility labels' : 'already set'}`)
if (EXECUTE && needsFill) {
  await payload.updateGlobal({ slug: 'site-settings', overrideAccess: true, data: { accessibility: fill } as never })
}

if (!EXECUTE) console.log('\nDRY RUN — re-run with --execute to apply.')
process.exit(0)
