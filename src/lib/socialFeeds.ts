/**
 * Feed fetching for the Social Feeds block.
 *
 * Two of the platforms we support publish a public feed that can be read
 * server-side without an API key or app review:
 *
 *   YouTube  https://www.youtube.com/feeds/videos.xml?channel_id=UC...
 *   any blog RSS 2.0 or Atom
 *
 * Those are fetched here and rendered as a list. The rest (Facebook, X,
 * Instagram, LinkedIn) have no key-free read API, so they are rendered as the
 * platform's own embed in the browser instead — see SocialFeedsBlock.
 *
 * Parsing is done by hand rather than with an XML library. The shapes we need
 * are shallow and well known, and it keeps the dependency list unchanged.
 */

export interface FeedItem {
  title: string
  link?: string
  published?: string
  thumbnail?: string
}

/* ── X helpers ───────────────────────────────────────────────────────────
   Kept here rather than in the embed component because the card header also
   needs them, and that renders on the server. A function exported from a
   'use client' module is a client reference and cannot be called server-side. */

/**
 * Normalises whatever an editor pasted into a bare screen name.
 *
 * The Facebook card takes a full page URL, so the X card accepts a full profile
 * URL too instead of insisting on a bare handle. Trailing query strings are
 * dropped, since X's own share links carry things like `?s=20`.
 */
export function xHandle(input?: string | null): string {
  if (!input) return ''
  const trimmed = input.trim()
  const fromUrl = trimmed.match(/(?:twitter\.com|x\.com)\/(?:#!\/)?@?([A-Za-z0-9_]{1,15})/i)
  if (fromUrl) return fromUrl[1]
  return trimmed.replace(/^@/, '').replace(/[/?#].*$/, '')
}

/** Pulls the status id out of any shape of tweet URL. */
export function tweetId(url?: string | null): string | undefined {
  if (!url) return undefined
  const m = url.match(/(?:twitter\.com|x\.com)\/[^/]+\/status(?:es)?\/(\d+)/i)
  return m?.[1]
}

/* ── LinkedIn ────────────────────────────────────────────────────────── */

/** LinkedIn's URN types, keyed by their lowercased form for lookup. */
const LINKEDIN_URN_TYPES: Record<string, string> = {
  activity: 'activity',
  share: 'share',
  ugcpost: 'ugcPost',
}

/**
 * Resolves a LinkedIn embed URL from whatever an editor pasted.
 *
 * Only /embed/ URLs can be framed, and those are buried in a post's "…" menu.
 * Every public post URL already carries the activity id though, so the embed URL
 * is derived instead:
 *
 *   .../posts/name_slug-activity-7123456789012345678-AbCd
 *   .../feed/update/urn:li:activity:7123456789012345678/
 *   .../embed/feed/update/urn:li:share:7123456789012345678   (passed through)
 *
 * Returns undefined when no id can be found, so the card can explain itself
 * rather than framing a URL that will never render.
 */
export function linkedinEmbedSrc(input?: string | null): string | undefined {
  const raw = input?.trim()
  if (!raw) return undefined

  // Already an embed URL.
  if (/^https:\/\/(?:www\.)?linkedin\.com\/embed\//i.test(raw)) return raw

  const build = (kind: string, id: string) =>
    `https://www.linkedin.com/embed/feed/update/urn:li:${kind}:${id}`

  // A URN, either bare or inside /feed/update/.
  const urn = raw.match(/urn:li:(activity|share|ugcPost):(\d+)/i)
  if (urn) return build(LINKEDIN_URN_TYPES[urn[1].toLowerCase()] || urn[1], urn[2])

  // Public post permalink, where the id trails an "-activity-" segment.
  const activity = raw.match(/-activity-(\d+)/i)
  if (activity) return build('activity', activity[1])

  return undefined
}

/* ── URL safety ──────────────────────────────────────────────────────────
   The feed URL is editor-supplied, and this code runs on the server, so a
   value like http://169.254.169.254/ or http://localhost:5432 would turn the
   block into a request forwarder aimed at our own network. Only allow https
   to a public host. */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
])

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (BLOCKED_HOSTNAMES.has(h)) return true
  if (h.endsWith('.localhost') || h.endsWith('.internal') || h.endsWith('.local')) return true

  // IPv4 private / loopback / link-local / carrier-grade NAT
  const v4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])]
    if (a === 10 || a === 127 || a === 0) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 169 && b === 254) return true
    if (a === 100 && b >= 64 && b <= 127) return true
  }

  // IPv6 loopback / unique-local / link-local
  if (h === '::' || h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80')) return true

  return false
}

export function isSafeFeedUrl(raw?: string | null): boolean {
  if (!raw?.trim()) return false
  let u: URL
  try {
    u = new URL(raw.trim())
  } catch {
    return false
  }
  if (u.protocol !== 'https:') return false
  return !isPrivateHost(u.hostname)
}

/* ── YouTube ─────────────────────────────────────────────────────────────
   Accepts a bare channel id, a bare playlist id, or a pasted URL of most
   shapes. Handle-style URLs (/@name) cannot be turned into a feed without an
   extra lookup, so those are rejected with a clear reason. */

export function youtubeFeedUrl(input?: string | null): { url?: string; reason?: string } {
  const v = input?.trim()
  if (!v) return { reason: 'No channel or playlist ID set' }

  if (/^UC[\w-]{20,}$/.test(v)) {
    return { url: `https://www.youtube.com/feeds/videos.xml?channel_id=${v}` }
  }
  if (/^(PL|UU|LL|FL|OL)[\w-]{10,}$/.test(v)) {
    return { url: `https://www.youtube.com/feeds/videos.xml?playlist_id=${v}` }
  }

  if (/^https?:\/\//i.test(v)) {
    try {
      const u = new URL(v)
      const list = u.searchParams.get('list')
      if (list) return { url: `https://www.youtube.com/feeds/videos.xml?playlist_id=${list}` }

      const chan = u.pathname.match(/\/channel\/(UC[\w-]{20,})/)
      if (chan) return { url: `https://www.youtube.com/feeds/videos.xml?channel_id=${chan[1]}` }

      if (/\/(@|c\/|user\/)/.test(u.pathname)) {
        return {
          reason:
            'Handle URLs (youtube.com/@name) have no feed. Open the channel, copy its "UC..." ID from the page source or a channel-ID lookup, and paste that instead.',
        }
      }
    } catch {
      /* fall through */
    }
  }

  return { reason: `"${v}" is not a recognised YouTube channel ID, playlist ID or URL` }
}

/* ── XML helpers ─────────────────────────────────────────────────────── */

/**
 * Unwraps CDATA and drops any markup inside it.
 *
 * Must run before entity decoding, not after: a title containing
 * "&lt;world&gt;" decodes to "<world>", and stripping tags at that point would
 * delete the very text we just decoded.
 */
function stripMarkup(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '')
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
}

/** Text content of the first <tag>…</tag>, namespace prefix optional. */
function tagText(xml: string, tag: string): string | undefined {
  const re = new RegExp(`<(?:\\w+:)?${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:\\w+:)?${tag}>`, 'i')
  const m = xml.match(re)
  if (!m) return undefined
  const text = decodeEntities(stripMarkup(m[1])).replace(/\s+/g, ' ').trim()
  return text || undefined
}

/** Value of an attribute on the first matching self-closing-ish tag. */
function tagAttr(xml: string, tag: string, attr: string): string | undefined {
  const re = new RegExp(`<(?:\\w+:)?${tag}\\b[^>]*?\\b${attr}=["']([^"']+)["']`, 'i')
  const m = xml.match(re)
  return m ? decodeEntities(m[1]) : undefined
}

/**
 * Parses RSS 2.0 <item> and Atom <entry> elements.
 * Unknown or malformed entries are skipped rather than thrown.
 */
export function parseFeed(xml: string, max = 5): FeedItem[] {
  const blocks: string[] = []
  const re = /<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null && blocks.length < max * 3) blocks.push(m[2])

  const items: FeedItem[] = []
  for (const b of blocks) {
    const title = tagText(b, 'title')
    if (!title) continue

    // Atom puts the URL on link/@href; RSS puts it in the element body.
    const link = tagAttr(b, 'link', 'href') || tagText(b, 'link') || tagText(b, 'guid')

    items.push({
      title,
      link: link && /^https?:\/\//i.test(link) ? link : undefined,
      published: tagText(b, 'published') || tagText(b, 'pubDate') || tagText(b, 'updated'),
      thumbnail: tagAttr(b, 'thumbnail', 'url'),
    })
    if (items.length >= max) break
  }
  return items
}

/* ── Fetch ───────────────────────────────────────────────────────────── */

export interface FeedResult {
  items: FeedItem[]
  error?: string
}

/**
 * Fetches and parses a feed. Never throws — a dead feed should leave one card
 * showing a quiet message, not take the whole page down.
 */
export async function fetchFeedItems(
  url: string,
  max = 5,
  revalidateSeconds = 900,
): Promise<FeedResult> {
  if (!isSafeFeedUrl(url)) {
    return { items: [], error: 'Feed URL must be an https address on a public host' }
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'CyPSi-Site/1.0 (+feed reader)', Accept: 'application/atom+xml, application/rss+xml, application/xml, text/xml' },
      next: { revalidate: revalidateSeconds },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) return { items: [], error: `Feed returned HTTP ${res.status}` }

    const xml = await res.text()
    const items = parseFeed(xml, max)
    if (!items.length) return { items: [], error: 'No entries found in feed' }
    return { items }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { items: [], error: msg.includes('timeout') ? 'Feed request timed out' : `Could not reach feed (${msg})` }
  }
}

/** "August 19, 2026" — matches how the source site labels video entries. */
export function formatFeedDate(raw?: string): string | undefined {
  if (!raw) return undefined
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
