/**
 * Step 5: proves the live schema works by creating, reading and deleting one
 * document in each new collection through Payload's Local API. Exercises the
 * nested arrays too, which is where a hand-applied schema would break.
 *
 *   npx tsx scripts/verify-new-collections.mts
 */
import fs from 'fs'

for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
  if (m && process.env[m[1]] === undefined) {
    process.env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '')
  }
}
process.env.CMS_DB_PUSH = 'false'

const { default: config } = await import('../src/payload.config.js')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const results: string[] = []
const richText = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        children: [{ type: 'text', text: 'Smoke test body.', format: 0, version: 1 }],
      },
    ],
  },
}

async function check(label: string, fn: () => Promise<void>) {
  try {
    await fn()
    results.push(`  PASS  ${label}`)
  } catch (err) {
    results.push(`  FAIL  ${label}: ${(err as Error).message}`)
  }
}

await check('publications (nested authors + keywords)', async () => {
  const doc = await payload.create({
    collection: 'publications' as never,
    data: {
      title: 'Smoke Test Publication',
      publisher: 'Journal of Verification',
      year: 2026,
      type: 'journal',
      status: 'draft',
      authors: [
        { name: 'A. Researcher', isLabMember: true },
        { name: 'B. Collaborator', isLabMember: false },
      ],
      keywords: [{ keyword: 'cyber physical systems' }, { keyword: 'testing' }],
    } as never,
  })
  const read = await payload.findByID({ collection: 'publications' as never, id: doc.id })
  const authors = (read as never as { authors: unknown[] }).authors
  if (authors.length !== 2) throw new Error(`expected 2 authors, got ${authors.length}`)
  await payload.delete({ collection: 'publications' as never, id: doc.id })
})

await check('research-domains (slug auto-generation)', async () => {
  const doc = await payload.create({
    collection: 'research-domains' as never,
    data: { title: 'Smoke Test Domain', content: richText, status: 'draft' } as never,
  })
  const slug = (doc as never as { slug: string }).slug
  if (slug !== 'smoke-test-domain') throw new Error(`slug was "${slug}"`)
  await payload.delete({ collection: 'research-domains' as never, id: doc.id })
})

await check('work-with-us (3-level nested arrays)', async () => {
  const doc = await payload.create({
    collection: 'work-with-us' as never,
    data: {
      title: 'Smoke Test Programme',
      content: richText,
      status: 'draft',
      problemDomains: [
        {
          title: 'Domain One',
          description: 'A problem domain.',
          challenges: [{ challenge: 'Challenge A' }, { challenge: 'Challenge B' }],
          technicalSkills: [{ skill: 'Python' }],
          nonTechnicalSkills: [{ skill: 'Writing' }],
        },
      ],
    } as never,
  })
  const read = await payload.findByID({
    collection: 'work-with-us' as never,
    id: doc.id,
    depth: 0,
  })
  const pd = (read as never as { problemDomains: { challenges: unknown[] }[] }).problemDomains
  if (pd[0].challenges.length !== 2) throw new Error('nested challenges did not round-trip')
  await payload.delete({ collection: 'work-with-us' as never, id: doc.id })
})

await check('blog-posts (author group + tags)', async () => {
  const media = await payload.find({ collection: 'media', limit: 1 })
  if (!media.docs.length) throw new Error('no media available for required featuredImage')
  const doc = await payload.create({
    collection: 'blog-posts' as never,
    data: {
      title: 'Smoke Test Post',
      shortDescription: 'Excerpt.',
      featuredImage: media.docs[0].id,
      content: richText,
      authorName: 'A. Author',
      authorRole: 'Research Scholar',
      status: 'draft',
      tags: [{ tag: 'testing' }],
    } as never,
  })
  const read = await payload.findByID({ collection: 'blog-posts' as never, id: doc.id })
  if ((read as never as { authorName: string }).authorName !== 'A. Author') {
    throw new Error('author did not round-trip')
  }
  await payload.delete({ collection: 'blog-posts' as never, id: doc.id })
})

await check('existing content still readable', async () => {
  const pages = await payload.find({ collection: 'pages', limit: 100 })
  const news = await payload.find({ collection: 'news', limit: 100 })
  results.push(`        pages=${pages.totalDocs} news=${news.totalDocs}`)
})

const report = ['new collection smoke test', ...results].join('\n')
console.log(report)
fs.writeFileSync('verify-collections.txt', report)
process.exit(0)
