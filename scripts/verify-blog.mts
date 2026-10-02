// Verifies blog slug rules, createdBy, the /blog pages, the Blog Posts block and saving from the admin.
// Run with the dev server up (pnpm dev):  npx tsx scripts/verify-blog.mts
// Creates throwaway posts/pages/users and deletes them afterwards.
import fs from 'fs'
import path from 'path'
import { chromium } from 'playwright-core'

for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '')
}
const { default: config } = await import('../src/payload.config.js')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const BASE = 'http://localhost:3666'
const tag = `bv${Date.now().toString(36)}`
const res: string[] = []
let pass = 0
const check = (n: string, ok: boolean, d = '') => { if (ok) pass++; res.push(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? `  — ${d}` : ''}`) }
const posts: any[] = []
const users: any[] = []
const pages: any[] = []

const media = (await payload.find({ collection: 'media', where: { mimeType: { contains: 'image' } }, limit: 2, depth: 0, overrideAccess: true })).docs as any[]
const superUser = { ...(await payload.find({ collection: 'users', where: { roles: { equals: 'super_admin' } }, limit: 1, depth: 0, overrideAccess: true })).docs[0], collection: 'users' } as any
const para = (text: string) => ({ type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, textFormat: 0, children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }] })
const content = { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [para('First paragraph of the test article.'), para('Second paragraph.')] } }
const base = (title: string, extra: Record<string, unknown> = {}) => ({
  title, shortDescription: `Summary for ${title}`, featuredImage: media[0]?.id, content, authorName: 'Asha Verma', authorRole: 'Research Scholar',
  authorBio: 'Works on network security.', category: 'Cyber Security', readTime: '4 min read', status: 'published',
  publishedDate: new Date().toISOString(), tags: [{ tag: 'security' }], ...extra,
})
const create = async (data: Record<string, unknown>) => {
  const d: any = await payload.create({ collection: 'blog-posts', user: superUser, overrideAccess: false, data: data as never })
  posts.push(d)
  return d
}
const err = async (fn: () => Promise<unknown>) => { try { await fn(); return null } catch (e) { return (e as any)?.data?.errors?.[0]?.message || (e as Error).message } }

try {
  /* Slug rules */
  const a = await create(base(`${tag} Hello World: IoT & Security!`, { isFeatured: true }))
  check('empty slug → generated from title', a.slug === `${tag}-hello-world-iot-security`, a.slug)
  const b = await create(base(`${tag} Hello World: IoT & Security!`))
  check('duplicate title → -2', b.slug === `${a.slug}-2`, b.slug)
  const hindi = await err(() => create(base('साइबर सुरक्षा')))
  check('Hindi title, no slug → clear error', Boolean(hindi && /type a slug/i.test(hindi)), hindi || 'saved!')
  const c = await create(base(`${tag} third`, { slug: `${tag} My Post!!`, category: 'Research' }))
  check('typed slug normalised', c.slug === `${tag}-my-post`, c.slug)
  const typedDup = await create(base(`${tag} fourth`, { slug: c.slug, category: 'Research' }))
  check('typed slug that is taken → -2', typedDup.slug === `${c.slug}-2`, typedDup.slug)
  const renamed: any = await payload.update({ collection: 'blog-posts', id: a.id, user: superUser, overrideAccess: false, data: { title: `${tag} Renamed` } as never })
  check('rename keeps the slug', renamed.slug === a.slug, renamed.slug)
  const resaved: any = await payload.update({ collection: 'blog-posts', id: b.id, user: superUser, overrideAccess: false, data: { shortDescription: 'edited' } as never })
  check('re-saving does not bump its own slug', resaved.slug === b.slug, resaved.slug)
  const spoof = await create(base(`${tag} spoof`, { createdBy: 999999 }))
  const spoofDb: any = await payload.findByID({ collection: 'blog-posts', id: spoof.id, depth: 0, overrideAccess: true })
  check('spoofed createdBy ignored (no crash)', spoofDb.createdBy === superUser.id, String(spoofDb.createdBy))
  const draft = await create(base(`${tag} draft post`, { status: 'draft' }))

  const up = await fetch(BASE + '/blog').then(() => true, () => false)
  if (!up) { res.push('  SKIP  page and admin-UI checks — dev server on :3666 is not running') }
  if (up) {
  /* Pages over HTTP */
  const get = (u: string) => fetch(BASE + u).then(async (r) => ({ status: r.status, html: await r.text() }))
  const list = await get('/blog')
  check('/blog 200 and lists published posts', list.status === 200 && list.html.includes(`${tag} Renamed`) && list.html.includes(`${tag} third`), String(list.status))
  check('/blog does not list the draft', !list.html.includes(`${tag} draft post`))
  const cat = await get('/blog?category=Research')
  check('/blog?category= filters', cat.html.includes(`${tag} third`) && !cat.html.includes(`${tag} Renamed`))
  const art = await get(`/blog/${c.slug}`)
  check('/blog/<slug> 200 with author, content, tags', art.status === 200 && art.html.includes('Asha Verma') && art.html.includes('First paragraph of the test article') && art.html.includes('#security'), String(art.status))
  check('article has og:type article', /property="og:type" content="article"/.test(art.html))
  check('draft slug → 404', (await get(`/blog/${draft.slug}`)).status === 404)
  check('unknown slug → 404', (await get(`/blog/${tag}-nope`)).status === 404)

  const page = await payload.create({
    collection: 'pages', overrideAccess: true,
    data: { title: 'Blog block check', slug: `zz-${tag}`, status: 'published', showInNav: false, layout: [{ blockType: 'blogFeed', sectionHeading: 'Latest posts', limit: 2, category: 'Research', linkLabel: 'View all posts', linkUrl: '/blog' }] } as never,
  })
  pages.push(page)
  const blk = await get(`/zz-${tag}`)
  check('Blog Posts block renders (category + limit)', blk.status === 200 && blk.html.includes('Latest posts') && blk.html.includes(`${tag} third`) && !blk.html.includes(`${tag} Renamed`) && blk.html.includes('View all posts'), String(blk.status))

  /* Browser: admin save with empty slug + screenshots */
  const email = `${tag}@example.invalid`
  const password = `Tmp-${crypto.randomUUID()}`
  users.push(await payload.create({ collection: 'users', overrideAccess: true, data: { email, password, roles: ['admin'] } as never }))
  const bdir = path.join(process.env.LOCALAPPDATA!, 'ms-playwright')
  const cdir = fs.readdirSync(bdir).find((d) => d.startsWith('chromium-'))!
  const browser = await chromium.launch({ executablePath: path.join(bdir, cdir, 'chrome-win', 'chrome.exe'), headless: true })
  const shots = path.join(process.env.TEMP!, `blog-shots-${tag}`)
  fs.mkdirSync(shots, { recursive: true })
  try {
    const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    await p.addInitScript('window.__name = (f) => f')
    await p.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 240000 })
    await p.fill('input[name="email"]', email)
    await p.fill('input[name="password"]', password)
    await p.click('button[type="submit"]')
    await p.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 120000 })
    await p.goto(`${BASE}/admin/collections/blog-posts/create`, { waitUntil: 'networkidle', timeout: 240000 })
    await p.fill('input[name="title"]', `${tag} Saved From Admin`)
    await p.fill('textarea[name="shortDescription"]', 'Saved through the admin form')
    await p.fill('input[name="authorName"]', 'Admin Tester').catch(async () => {
      await p.getByText('Author', { exact: true }).first().click()
      await p.fill('input[name="authorName"]', 'Admin Tester')
    })
    // Rich text: type into the Lexical editor.
    await p.locator('[data-lexical-editor="true"]').first().click()
    await p.keyboard.type('Body from the admin.')
    // Featured image: pick the first existing upload.
    await p.locator('#field-featuredImage').getByRole('button', { name: /choose from existing/i }).click()
    await p.locator('.list-drawer .cell-filename button, .list-drawer table tbody tr button, .list-drawer table tbody tr a').first().click()
    await p.waitForTimeout(800)
    await p.keyboard.press('Control+s')
    await p.waitForTimeout(4000)
    const saved: any = (await payload.find({ collection: 'blog-posts', where: { title: { equals: `${tag} Saved From Admin` } }, overrideAccess: true, depth: 0 })).docs[0]
    if (saved) posts.push(saved)
    const errText = saved ? '' : ((await p.locator('.toast, [class*="toast"], .field-error').allInnerTexts()).join(' | ') || 'no toast')
    check('ADMIN UI: saves with slug empty, slug generated', saved?.slug === `${tag}-saved-from-admin`, saved ? saved.slug : errText)
    await p.screenshot({ path: path.join(shots, 'admin.png') })

    for (const [name, vp] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]] as const) {
      const q = await browser.newPage({ viewport: vp })
      await q.goto(`${BASE}/blog`, { waitUntil: 'networkidle', timeout: 240000 })
      await q.screenshot({ path: path.join(shots, `list-${name}.png`), fullPage: false })
      const over1 = await q.evaluate(() => document.documentElement.scrollWidth > innerWidth)
      await q.goto(`${BASE}/blog/${c.slug}`, { waitUntil: 'networkidle', timeout: 240000 })
      await q.screenshot({ path: path.join(shots, `post-${name}.png`), fullPage: true })
      const over2 = await q.evaluate(() => document.documentElement.scrollWidth > innerWidth)
      check(`${name}: no horizontal overflow on /blog and article`, !over1 && !over2)
      await q.close()
    }
  } finally {
    await browser.close()
  }
  console.log('SHOTS', shots)
  }
} finally {
  for (const d of posts) await payload.delete({ collection: 'blog-posts', id: d.id, overrideAccess: true }).catch(() => {})
  for (const d of pages) await payload.delete({ collection: 'pages', id: d.id, overrideAccess: true }).catch(() => {})
  for (const u of users) await payload.delete({ collection: 'users', id: u.id, overrideAccess: true }).catch(() => {})
  const left = (await payload.count({ collection: 'blog-posts', overrideAccess: true, where: { title: { like: tag } } })).totalDocs
  res.push(`cleanup: ${left} test posts left`)
}
console.log('RESULTS\n' + res.join('\n') + `\n${pass} passed`)
process.exit(0)
