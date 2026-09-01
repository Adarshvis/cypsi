import React, { Suspense } from 'react'
import { Facebook, Instagram, Linkedin, Rss, Youtube, ArrowUpRight, Info, Play } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import XEmbed from './social/XEmbed'
import EmbedFrame from './social/EmbedFrame'
import {
  fetchFeedItems,
  formatFeedDate,
  isSafeFeedUrl,
  youtubeFeedUrl,
  xHandle,
  linkedinEmbedSrc,
  type FeedItem,
} from '@/lib/socialFeeds'

type Platform = 'x' | 'facebook' | 'youtube' | 'instagram' | 'linkedin' | 'rss'

interface Feed {
  id?: string | null
  platform: Platform
  label?: string | null
  handle?: string | null
  xMode?: 'post' | 'timeline' | null
  xPosts?: { url?: string | null; id?: string | null }[] | null
  xPostUrl?: string | null
  xTheme?: 'light' | 'dark' | null
  facebookPageUrl?: string | null
  facebookTab?: 'timeline' | 'events' | 'messages' | null
  youtubeId?: string | null
  instagramPostUrl?: string | null
  linkedinEmbedUrl?: string | null
  feedUrl?: string | null
  maxItems?: number | null
  showDates?: boolean | null
  showThumbnails?: boolean | null
  profileUrl?: string | null
}

interface SocialFeedsBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  backgroundColor?: string | null
  columns?: '2' | '3' | '4' | null
  cardHeight?: number | null
  refreshMinutes?: number | null
  feeds?: Feed[] | null
}

const gridClasses: Record<string, string> = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

/** Lucide dropped its Twitter bird and never added an X glyph, so draw it. */
function XGlyph({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

/**
 * The brand colour drives the card's top edge, icon chip and link colour, so a
 * row of cards is scannable by platform without the whole card being tinted.
 */
const PLATFORM: Record<Platform, { name: string; color: string; Icon: React.ElementType }> = {
  x: { name: 'X', color: '#0f1419', Icon: XGlyph },
  facebook: { name: 'Facebook', color: '#1877F2', Icon: Facebook },
  youtube: { name: 'YouTube', color: '#FF0000', Icon: Youtube },
  instagram: { name: 'Instagram', color: '#E4405F', Icon: Instagram },
  linkedin: { name: 'LinkedIn', color: '#0A66C2', Icon: Linkedin },
  rss: { name: 'Latest Posts', color: '#F26522', Icon: Rss },
}

function defaultLabel(feed: Feed): string {
  if (feed.label?.trim()) return feed.label.trim()
  if (feed.platform === 'x') {
    // Parsed, because the field accepts a full profile URL — printing that raw
    // would put "https://x.com/Foo?s=20" in the card header.
    const handle = xHandle(feed.handle)
    if (handle) return `Posts from ${handle}`
  }
  return PLATFORM[feed.platform]?.name || 'Social'
}

/* ── Card chrome ─────────────────────────────────────────────────────── */

function Card({
  feed,
  height,
  children,
}: {
  feed: Feed
  height: number
  children: React.ReactNode
}) {
  const meta = PLATFORM[feed.platform] || PLATFORM.rss
  const { Icon, color } = meta
  const title = defaultLabel(feed)

  // The platform name is a sub-label, so it is dropped when the editor's label
  // already says the same thing — "Facebook / FACEBOOK" reads as a mistake.
  const subLabel =
    title.trim().toLowerCase() === meta.name.toLowerCase() ? null : meta.name

  return (
    <div
      className="group h-full flex flex-col bg-white overflow-hidden transition-all duration-300
                 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_28px_-10px_rgba(16,24,40,0.16)]
                 hover:-translate-y-1
                 hover:shadow-[0_2px_4px_rgba(16,24,40,0.05),0_22px_44px_-12px_rgba(16,24,40,0.26)]"
      style={{ borderRadius: 16, border: '1px solid rgba(16,24,40,0.07)' }}
    >
      {/* Platform stripe — the only place the brand colour is used at full strength */}
      <span aria-hidden className="h-[3px] shrink-0" style={{ background: color }} />

      <div className="flex items-center gap-2.5 px-4 py-3 shrink-0">
        <span
          className="grid place-items-center shrink-0"
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: `color-mix(in srgb, ${color} 12%, #ffffff)`,
          }}
        >
          <Icon size={15} color={color} />
        </span>

        <span className="min-w-0 flex-1">
          <span
            className="block font-semibold truncate"
            style={{ fontSize: '0.875rem', color: 'var(--cms-secondary, #011e2c)' }}
          >
            {title}
          </span>
          {subLabel && (
            <span
              className="block truncate"
              style={{
                fontSize: '0.6875rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--cms-text, #334155)',
                opacity: 0.45,
              }}
            >
              {subLabel}
            </span>
          )}
        </span>
      </div>

      {/*
        `grow shrink` rather than `flex-1`, and a real height rather than a
        min-height. Both details matter:

        `flex-1` is shorthand for `flex: 1 1 0%`, and that zero basis overrides
        `height` outright — the card then collapses to whatever intrinsic size
        the content has, which for an iframe is 150px.

        `min-height` avoids that but only sets a floor, leaving the box with no
        definite height. A child's `h-full` then resolves against an auto-height
        parent, so it behaves as `auto`, and a long feed grows the card without
        limit instead of scrolling inside it.

        Keeping the default `flex-basis: auto` means `height` is the flex base
        size: the card is exactly cardHeight tall, children can resolve `h-full`
        against it and scroll, and `grow` still lets it stretch to match a taller
        neighbour in the row.
      */}
      <div
        className="grow shrink min-h-0 overflow-hidden"
        style={{ height, borderTop: '1px solid rgba(16,24,40,0.07)' }}
      >
        {children}
      </div>

      {feed.profileUrl && (
        <a
          href={feed.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-1.5 px-4 py-3 shrink-0 font-semibold transition-colors"
          style={{
            fontSize: '0.8125rem',
            borderTop: '1px solid rgba(16,24,40,0.07)',
            background: 'color-mix(in srgb, var(--cms-primary, #04415f) 3%, #ffffff)',
            color: 'var(--cms-primary, #04415f)',
          }}
        >
          View all posts
          <ArrowUpRight
            size={15}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>
      )}
    </div>
  )
}

/**
 * Shown when a channel cannot be read — usually a missing or wrong ID. Framed
 * as guidance with an icon rather than a wall of grey text, since every one of
 * these messages is something an editor can act on.
 */
function CardNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2.5 px-6 py-5 text-center">
      <span
        className="grid place-items-center shrink-0"
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: 'color-mix(in srgb, var(--cms-primary, #04415f) 9%, #ffffff)',
        }}
      >
        <Info size={17} color="var(--cms-primary, #04415f)" />
      </span>
      <p
        style={{
          fontSize: '0.8125rem',
          lineHeight: 1.6,
          color: 'var(--cms-text, #334155)',
          opacity: 0.7,
        }}
      >
        {children}
      </p>
    </div>
  )
}

/**
 * Platform width floors, used to decide when an embed has to be scaled down.
 * Facebook accepts a width parameter so it only needs its documented range;
 * Instagram and LinkedIn ignore ours and refuse to render narrow.
 */
const FACEBOOK_MIN_WIDTH = 180
const FACEBOOK_MAX_WIDTH = 500
const INSTAGRAM_MIN_WIDTH = 326
const LINKEDIN_MIN_WIDTH = 400

/* ── Fetched list, shared by YouTube and RSS ──────────────────────────── */

function FeedList({ items, feed }: { items: FeedItem[]; feed: Feed }) {
  const color = (PLATFORM[feed.platform] || PLATFORM.rss).color
  const withThumbs = Boolean(feed.showThumbnails)

  return (
    <ul className="social-feed-scroll h-full overflow-y-auto py-1.5 list-none m-0 p-0">
      {items.map((item, i) => {
        const date = feed.showDates !== false ? formatFeedDate(item.published) : undefined
        const Row = item.link ? 'a' : 'div'

        return (
          <li key={item.link || i} style={i > 0 ? { borderTop: '1px solid rgba(16,24,40,0.05)' } : undefined}>
            <Row
              {...(item.link
                ? { href: item.link, target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="flex gap-3 px-4 py-3 transition-colors hover:bg-[color-mix(in_srgb,var(--cms-primary,#04415f)_4%,transparent)]"
            >
              {withThumbs && item.thumbnail ? (
                /* Feed thumbnails are remote hosts we do not control, so a plain
                   img avoids adding every CDN to the Next image config. */
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnail}
                  alt=""
                  className="w-[68px] h-[42px] object-cover shrink-0"
                  style={{ borderRadius: 6 }}
                  loading="lazy"
                />
              ) : (
                <span
                  aria-hidden
                  className="grid place-items-center shrink-0"
                  style={{
                    width: 20,
                    height: 20,
                    marginTop: 2,
                    borderRadius: '50%',
                    background: `color-mix(in srgb, ${color} 12%, #ffffff)`,
                  }}
                >
                  {feed.platform === 'youtube' ? (
                    <Play size={9} color={color} fill={color} />
                  ) : (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                  )}
                </span>
              )}

              <span className="min-w-0 flex-1">
                <span
                  className="block line-clamp-3"
                  style={{
                    fontSize: '0.8125rem',
                    lineHeight: 1.5,
                    fontWeight: 500,
                    color: 'var(--cms-secondary, #011e2c)',
                  }}
                >
                  {item.title}
                </span>
                {date && (
                  <span
                    className="block mt-1"
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--cms-text, #334155)',
                      opacity: 0.55,
                    }}
                  >
                    {date}
                  </span>
                )}
              </span>
            </Row>
          </li>
        )
      })}
    </ul>
  )
}

/** Async because YouTube and RSS are read on the server. */
async function FetchedFeedBody({ feed, revalidate }: { feed: Feed; revalidate: number }) {
  let url: string | undefined
  let reason: string | undefined

  if (feed.platform === 'youtube') {
    const resolved = youtubeFeedUrl(feed.youtubeId)
    url = resolved.url
    reason = resolved.reason
  } else {
    url = feed.feedUrl?.trim() || undefined
    if (!url) reason = 'No feed URL set'
    else if (!isSafeFeedUrl(url)) reason = 'Feed URL must be an https address on a public host'
  }

  if (!url) return <CardNotice>{reason}</CardNotice>

  const { items, error } = await fetchFeedItems(url, feed.maxItems || 4, revalidate)
  if (error) return <CardNotice>{error}</CardNotice>
  if (!items.length) return <CardNotice>This feed has no recent posts.</CardNotice>

  return <FeedList items={items} feed={feed} />
}

function BodySkeleton() {
  return (
    <div className="py-1.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-3 px-4 py-3">
          <div className="w-5 h-5 rounded-full bg-black/[0.07] animate-pulse shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-full rounded bg-black/[0.07] animate-pulse" />
            <div className="h-3 w-2/3 rounded bg-black/[0.07] animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Block ───────────────────────────────────────────────────────────── */

export default function SocialFeedsBlock({
  sectionHeading,
  sectionDescription,
  headingAlignment,
  backgroundColor,
  columns = '4',
  cardHeight = 340,
  refreshMinutes = 15,
  feeds,
}: SocialFeedsBlockProps) {
  const list = (feeds || []).filter((f) => f?.platform)
  if (!list.length) return null

  const height = cardHeight || 340
  const revalidate = Math.max(1, refreshMinutes || 15) * 60
  const cols = columns || '4'

  return (
    <section className="py-16 px-6" style={{ backgroundColor: backgroundColor || '#F6F7FB' }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          heading={sectionHeading}
          description={sectionDescription}
          alignment={headingAlignment}
        />

        <div className={`grid gap-6 items-stretch ${gridClasses[cols] || gridClasses['4']}`}>
          {list.map((feed, i) => {
            let body: React.ReactNode

            switch (feed.platform) {
              case 'x':
                body = (
                  <XEmbed
                    mode={feed.xMode || 'timeline'}
                    handle={feed.handle || ''}
                    posts={feed.xPosts}
                    postUrl={feed.xPostUrl}
                    height={height}
                    theme={feed.xTheme}
                  />
                )
                break

              case 'facebook': {
                const page = feed.facebookPageUrl?.trim()
                body = isSafeFeedUrl(page) ? (
                  <EmbedFrame
                    title={defaultLabel(feed)}
                    minWidth={FACEBOOK_MIN_WIDTH}
                    maxWidth={FACEBOOK_MAX_WIDTH}
                    // width and height are the measured card, so the plugin
                    // lays out to fit instead of defaulting to 340px wide.
                    template={
                      `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(page!)}` +
                      `&tabs=${feed.facebookTab || 'timeline'}&width=__W__&height=__H__` +
                      `&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true`
                    }
                  />
                ) : (
                  <CardNotice>Set a valid https Facebook page URL</CardNotice>
                )
                break
              }

              case 'instagram': {
                const post = feed.instagramPostUrl?.trim().replace(/\/+$/, '')
                body = isSafeFeedUrl(post) ? (
                  <EmbedFrame
                    title={defaultLabel(feed)}
                    minWidth={INSTAGRAM_MIN_WIDTH}
                    template={`${post}/embed`}
                  />
                ) : (
                  <CardNotice>Set a valid https Instagram post URL</CardNotice>
                )
                break
              }

              case 'linkedin': {
                // Accepts a normal post link and derives the embeddable URL,
                // since only /embed/ URLs can be framed.
                const embed = linkedinEmbedSrc(feed.linkedinEmbedUrl)
                body = isSafeFeedUrl(embed) ? (
                  <EmbedFrame
                    title={defaultLabel(feed)}
                    minWidth={LINKEDIN_MIN_WIDTH}
                    template={embed!}
                  />
                ) : (
                  <CardNotice>
                    {feed.linkedinEmbedUrl?.trim()
                      ? 'No post id found in that LinkedIn URL. Use the post\u2019s own link, which ends in something like -activity-7123456789012345678-AbCd.'
                      : 'Set a LinkedIn post URL'}
                  </CardNotice>
                )
                break
              }

              default:
                body = (
                  <Suspense fallback={<BodySkeleton />}>
                    <FetchedFeedBody feed={feed} revalidate={revalidate} />
                  </Suspense>
                )
            }

            return (
              <Card key={feed.id || i} feed={feed} height={height}>
                {body}
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
