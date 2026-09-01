/**
 * Route and content smoke check against a running dev server.
 *
 * Exists because a change confined to one page can break another through a
 * shared hook: the nav sync hook runs on every `pages` save and once silently
 * deleted header links while a page migration ran. Type checking cannot catch
 * that, so the invariants are asserted here instead.
 *
 *   node scripts/smoke-check.mjs
 *   node scripts/smoke-check.mjs --base=http://localhost:3666
 *
 * Exits non-zero if any check fails.
 */
const baseArg = process.argv.find((a) => a.startsWith('--base='))
const BASE = (baseArg ? baseArg.split('=')[1] : 'http://localhost:3666').replace(/\/$/, '')

/** Every nav link that must be present in the header on every page. */
const NAV = ['>Home<', '>About<', '>Publications<', '>News<', '>Team<']

const CHECKS = [
  {
    path: '/',
    label: 'home',
    // The social feeds block and its four channel cards.
    contains: [...NAV, 'Follow Our Channels', 'height:340px'],
    // Facebook must be handed a real width, not left to default to 340px.
    matches: [/width=__W__/],
    counts: {
      // A real height, not a min-height: a floor leaves the box without a
      // definite height, so a long feed grows the card instead of scrolling.
      'height:340px': 4,
      'min-height:340px': 0,
      // flex-1 forces flex-basis:0, which would override that height.
      'flex-1 overflow-hidden': 0,
    },
  },
  {
    path: '/about',
    label: 'about',
    contains: [
      ...NAV,
      'Empowering Future Leaders',
      'Our Mission',
      'Our Vision',
      'Our Values',
      'Why Choose Us',
      'Our Campus',
      // Alternating section backgrounds, the point of the About rebuild.
      'background-color:#e6edf0',
      'background-color:#FFFFFF',
    ],
  },
  {
    path: '/publications',
    label: 'publications',
    contains: [
      ...NAV,
      'Clear All Filters',
      'Journal Article',
      'Conference Paper',
      'Book Chapter',
      'Technical Report',
      'Thesis',
      // Export control, and that it reports a count rather than a bare label.
      'aria-haspopup="menu"',
      '>Export<',
    ],
    matches: [/title="Export (all|the) \d+/],
  },
  { path: '/news', label: 'news', contains: [...NAV] },
  { path: '/team', label: 'team', contains: [...NAV] },
]

/*
 * Brand names are deliberately *not* asserted against rendered HTML.
 *
 * Every such string is CMS-driven now, so an occurrence in the output means an
 * editor typed it — footer contact details and article text legitimately name
 * whatever the site wants. Source code is the thing that must stay generic, and
 * `node scripts/check-generic.mjs` covers that.
 */

let failures = 0
const line = (s) => process.stdout.write(`${s}\n`)

for (const check of CHECKS) {
  const url = `${BASE}${check.path}`
  let html = ''
  let status = 0

  try {
    const res = await fetch(url, { headers: { 'user-agent': 'smoke-check' } })
    status = res.status
    html = await res.text()
  } catch (err) {
    line(`FAIL  ${check.label.padEnd(14)} ${url} — ${err.message}`)
    failures++
    continue
  }

  const problems = []
  if (status !== 200) problems.push(`status ${status}`)

  for (const needle of check.contains || []) {
    if (!html.includes(needle)) problems.push(`missing ${JSON.stringify(needle)}`)
  }

  for (const re of check.matches || []) {
    if (!re.test(html)) problems.push(`no match for ${re}`)
  }

  for (const [needle, want] of Object.entries(check.counts || {})) {
    const got = html.split(needle).length - 1
    if (got !== want) problems.push(`${JSON.stringify(needle)} appeared ${got}x, want ${want}`)
  }

  if (problems.length) {
    failures++
    line(`FAIL  ${check.label.padEnd(14)} ${url}`)
    for (const p of problems) line(`        - ${p}`)
  } else {
    line(`ok    ${check.label.padEnd(14)} ${status}  ${(html.length / 1024).toFixed(0)} KB`)
  }
}

line('')
line(failures === 0 ? `all ${CHECKS.length} routes passed` : `${failures} route(s) failed`)
process.exit(failures === 0 ? 0 : 1)
