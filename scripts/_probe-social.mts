/**
 * Temporary: attaches a Social Feeds block to the home page so the rendered
 * output can be checked, then restores the original layout.
 *
 *   npx tsx scripts/_probe-social.mts add
 *   npx tsx scripts/_probe-social.mts restore
 */
import fs from 'fs'
import { loadEnv } from './migrate-lib.mts'

const MODE = process.argv[2]
const SNAP = 'home-layout-snapshot.json'

loadEnv()
const { default: config } = await import('../src/payload.config.js')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const found = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'home' } },
  limit: 1,
  overrideAccess: true,
  depth: 0,
})
const page = found.docs[0] as any
if (!page) throw new Error('home page not found')

if (MODE === 'add') {
  fs.writeFileSync(SNAP, JSON.stringify(page.layout, null, 2))

  const block = {
    blockType: 'socialFeeds',
    sectionHeading: 'Follow Our Channels',
    headingAlignment: 'center',
    backgroundColor: '#F6F7FB',
    columns: '4',
    cardHeight: 340,
    refreshMinutes: 15,
    feeds: [
      {
        platform: 'facebook',
        label: 'Facebook',
        facebookPageUrl: 'https://www.facebook.com/UniversityofDelhi',
        facebookTab: 'timeline',
        profileUrl: 'https://www.facebook.com/UniversityofDelhi',
      },
      { platform: 'x', handle: 'UnivofDelhi', xTheme: 'light', profileUrl: 'https://x.com/UnivofDelhi' },
      {
        platform: 'youtube',
        label: 'YouTube',
        youtubeId: 'UCBR8-60-B28hp2BmDPdntcQ',
        maxItems: 3,
        showDates: true,
        showThumbnails: false,
      },
      // Deliberately invalid, to prove a bad config degrades to a notice.
      { platform: 'youtube', label: 'Bad Config', youtubeId: 'https://www.youtube.com/@someone' },
    ],
  }

  await payload.update({
    collection: 'pages',
    id: page.id,
    overrideAccess: true,
    data: { layout: [...(page.layout || []), block] } as never,
  })
  console.log(`added socialFeeds to page ${page.id}; snapshot in ${SNAP}`)
} else if (MODE === 'restore') {
  const prior = JSON.parse(fs.readFileSync(SNAP, 'utf8'))
  await payload.update({
    collection: 'pages',
    id: page.id,
    overrideAccess: true,
    data: { layout: prior } as never,
  })
  console.log(`restored ${prior.length} blocks on page ${page.id}`)
} else {
  throw new Error('pass "add" or "restore"')
}

process.exit(0)
