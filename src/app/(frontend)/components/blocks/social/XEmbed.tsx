'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ExternalLink, Info, RotateCw } from 'lucide-react'
import { tweetId, xHandle } from '@/lib/socialFeeds'

const WIDGET_SRC = 'https://platform.twitter.com/widgets.js'

/** X will not lay an embed out below this width, and caps it at the upper one. */
const X_MIN_WIDTH = 250
const X_MAX_WIDTH = 550

/**
 * How long to wait on a widget factory call before moving on.
 *
 * Needed because `createTimeline` / `createTweet` do not always settle: when X
 * declines to serve a timeline it can leave the promise pending indefinitely.
 * A timeout is NOT treated as "this post failed" — X's syndication CDN is often
 * just slow — so the slot is kept and a late render still shows (see the
 * MutationObserver below).
 */
const WIDGET_DEADLINE_MS = 12000

/** X's embed service fails transiently (rate limits, cold CDN); one retry clears most of it. */
const MAX_ATTEMPTS = 2
const RETRY_DELAY_MS = 2500

/** How long to wait for `window.twttr.widgets` when the script tag already exists. */
const SCRIPT_READY_TIMEOUT_MS = 10000

/** Marker for "the call did not settle in time", as distinct from X answering with nothing. */
const TIMED_OUT = Symbol('timed-out')

/**
 * How long to wait for the profile timeline to become visible before showing
 * the curated posts. A timeline that X actually serves (signed-in visitor)
 * draws well inside this.
 */
const TIMELINE_WAIT_MS = 6000

/** Below this an X iframe is a placeholder, not a drawn embed. */
const MIN_VISIBLE_HEIGHT = 20

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: (el?: HTMLElement | null) => void
        createTimeline?: (
          source: Record<string, unknown>,
          target: HTMLElement,
          options?: Record<string, unknown>,
        ) => Promise<HTMLElement | undefined>
        createTweet?: (
          id: string,
          target: HTMLElement,
          options?: Record<string, unknown>,
        ) => Promise<HTMLElement | undefined>
      }
    }
  }
}

/** Resolves TIMED_OUT if the wrapped promise has not settled in time; never rejects. */
function withDeadline<T>(
  promise: Promise<T> | undefined,
  ms: number,
): Promise<T | undefined | typeof TIMED_OUT> {
  if (!promise) return Promise.resolve(undefined)
  return Promise.race([
    promise.catch(() => undefined),
    new Promise<typeof TIMED_OUT>((resolve) => setTimeout(() => resolve(TIMED_OUT), ms)),
  ])
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * True only when X has really drawn something.
 *
 * Class names cannot be trusted: when X refuses a timeline (HTTP 429 for
 * logged-out visitors) widgets.js still tags the wrapper
 * `twitter-timeline-rendered` and leaves a hidden, 0px iframe behind. So check
 * the iframe itself: visible, with a real height.
 */
function hasRenderedEmbed(host: HTMLElement): boolean {
  return Array.from(host.querySelectorAll('iframe')).some(
    (frame) =>
      frame.style.visibility !== 'hidden' &&
      frame.getBoundingClientRect().height > MIN_VISIBLE_HEIGHT,
  )
}

/** Polls until an embed is visible, the time runs out, or the run is cancelled. */
async function waitForRendered(
  host: HTMLElement,
  ms: number,
  isCancelled: () => boolean,
): Promise<boolean> {
  const until = Date.now() + ms
  while (Date.now() < until) {
    if (isCancelled()) return false
    if (hasRenderedEmbed(host)) return true
    await sleep(250)
  }
  return hasRenderedEmbed(host)
}

/** Loads widgets.js once per page, no matter how many embeds are on it. */
let scriptPromise: Promise<void> | null = null

/** Resolves once `window.twttr.widgets` exists, polling because `load` may already have fired. */
function waitForWidgets(timeoutMs: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const started = Date.now()
    const tick = () => {
      if (window.twttr?.widgets) return resolve()
      if (Date.now() - started > timeoutMs) return reject(new Error('widgets unavailable'))
      setTimeout(tick, 100)
    }
    tick()
  })
}

function loadWidgetScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.twttr?.widgets) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_SRC}"]`)
    if (existing) {
      // The tag may have finished loading before we got here, in which case its
      // `load` event will never fire again — so poll for the global instead.
      existing.addEventListener('error', () => reject(new Error('blocked')))
      waitForWidgets(SCRIPT_READY_TIMEOUT_MS).then(resolve, reject)
      return
    }
    const s = document.createElement('script')
    s.src = WIDGET_SRC
    s.async = true
    s.charset = 'utf-8'
    s.onload = () => waitForWidgets(SCRIPT_READY_TIMEOUT_MS).then(resolve, reject)
    s.onerror = () => reject(new Error('blocked'))
    document.head.appendChild(s)
  }).catch((err) => {
    // Never cache a failure: drop the dead tag so the next attempt (a retry, or
    // another X card on the page) can request the script again.
    scriptPromise = null
    document.querySelector(`script[src="${WIDGET_SRC}"]`)?.remove()
    throw err
  })

  return scriptPromise
}

interface XEmbedProps {
  /** 'timeline' asks X for the account feed; 'post' renders chosen posts. */
  mode: 'post' | 'timeline'
  handle: string
  /** Curated post URLs, rendered in order as a scrollable column. */
  posts?: { url?: string | null }[] | null
  /** Older single-post field, used when no curated posts are set. */
  postUrl?: string | null
  height: number
  theme?: 'light' | 'dark' | null
}

function Notice({
  handle,
  children,
  onRetry,
}: {
  handle: string
  children: React.ReactNode
  onRetry?: () => void
}) {
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
      {handle && (
        <a
          href={`https://x.com/${handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold hover:underline"
          style={{ fontSize: '0.8125rem', color: 'var(--cms-primary, #04415f)' }}
        >
          Open @{handle} on X
          <ExternalLink size={13} />
        </a>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 font-semibold hover:underline"
          style={{ fontSize: '0.8125rem', color: 'var(--cms-primary, #04415f)' }}
        >
          <RotateCw size={13} />
          Try again
        </button>
      )}
    </div>
  )
}

/**
 * X embeds.
 *
 * X has no read API callable without paid credentials, and unlike Facebook it
 * does not offer a working page-feed embed either. Two things were verified
 * rather than assumed:
 *
 *  - Timelines. X requires a signed-in session to view posts, so an embedded
 *    profile timeline renders empty for a visitor without x.com cookies. It is
 *    still offered, because it does work for signed-in visitors, but it cannot
 *    be relied on the way the Facebook Page Plugin can.
 *  - Server-side reads. The syndication endpoints that widgets.js once used are
 *    gone: `timeline/profile` answers 200 with an empty body and `tweet-result`
 *    answers `{}` without a token. So there is no way to fetch posts on the
 *    server and render our own list, as the YouTube and RSS cards do.
 *
 * Curated post mode is therefore the reliable option: single-post embeds still
 * render for logged-out visitors, and several of them stacked read as a feed.
 */
export default function XEmbed({
  mode,
  handle,
  posts,
  postUrl,
  height,
  theme = 'light',
}: XEmbedProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading')
  /** Why the last run failed: the script never loaded, or X answered with nothing. */
  const [failure, setFailure] = useState<'blocked' | 'unavailable'>('unavailable')
  /** Bumped by "Try again" to rebuild from scratch. */
  const [reloadKey, setReloadKey] = useState(0)
  const [width, setWidth] = useState<number | null>(null)

  const clean = xHandle(handle)
  const usePost = mode === 'post'

  /** Curated URLs first, then the legacy single field. Deduplicated. */
  const idsKey = useMemo(() => {
    const raw = [...(posts || []).map((p) => p?.url), postUrl]
    const ids = raw.map((u) => tweetId(u)).filter((id): id is string => Boolean(id))
    return [...new Set(ids)].join(',')
  }, [posts, postUrl])

  /**
   * Measured before the widget is built, because X sizes an embed once at
   * creation and will not render below 250px. Handing it the real width keeps
   * the embed inside the card instead of overflowing and being clipped.
   */
  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    setWidth(Math.max(1, Math.round(el.clientWidth)))
  }, [])

  const scale = width !== null && width < X_MIN_WIDTH ? width / X_MIN_WIDTH : 1
  const frameWidth =
    width === null ? null : Math.min(scale < 1 ? X_MIN_WIDTH : width, X_MAX_WIDTH)

  useEffect(() => {
    const host = hostRef.current
    if (!host || frameWidth === null) return
    if (!clean && !idsKey) return

    let cancelled = false
    setState('loading')
    // A widget cannot be resized, so any change rebuilds from scratch.
    host.replaceChildren()

    /*
     * The DOM is the source of truth, not the widget promises. X regularly
     * draws an embed after its promise has timed out (or never resolves it at
     * all), so whenever a rendered embed appears the card flips to ready —
     * even if this run had already given up and shown the failure notice.
     */
    const observer = new MutationObserver(() => {
      if (!cancelled && hasRenderedEmbed(host)) setState('ready')
    })
    // `style` matters: X reveals a drawn frame by changing its inline style.
    observer.observe(host, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    })

    const tweetOptions = {
      theme: theme || 'light',
      width: frameWidth,
      dnt: true,
      align: 'center',
      conversation: 'none',
    }

    /**
     * Renders the curated posts in parallel, keeping their order. Returns true
     * if at least one post drew. Timed-out slots are kept, and the observer
     * picks them up if X draws them late.
     */
    const renderPosts = async (widgets: NonNullable<NonNullable<Window['twttr']>['widgets']>) => {
      const ids = idsKey.split(',').filter(Boolean)
      // Slots are created up front so the stack keeps the editor's order
      // regardless of which post X returns first.
      const slots = ids.map(() => {
        const slot = document.createElement('div')
        host.appendChild(slot)
        return slot
      })
      const results = await Promise.all(
        ids.map((id, i) =>
          withDeadline(widgets.createTweet?.(id, slots[i], tweetOptions), WIDGET_DEADLINE_MS),
        ),
      )
      results.forEach((result, i) => {
        // X answered "no such post" (deleted, private, blocked): drop the empty slot.
        // A timed-out slot stays, since slow is not the same as failed.
        if (result === undefined) slots[i].remove()
      })
      return results.some((r) => r && r !== TIMED_OUT)
    }

    const attempt = async (): Promise<'ready' | 'blocked' | 'unavailable'> => {
      try {
        await loadWidgetScript()
      } catch {
        return 'blocked'
      }
      const widgets = window.twttr?.widgets
      if (!widgets) return 'blocked'
      if (cancelled) return 'unavailable'

      if (!usePost && clean) {
        /*
         * The promise is ignored on purpose. When X refuses the timeline (HTTP
         * 429 for visitors not signed in to x.com) it either never settles or
         * resolves with a hidden empty frame, so waiting on it only delays the
         * fallback. Watch for a visible frame instead.
         */
        widgets
          .createTimeline?.({ sourceType: 'profile', screenName: clean }, host, {
            theme: theme || 'light',
            width: frameWidth,
            height: scale < 1 ? Math.round(height / scale) : height,
            chrome: 'noheader noborders transparent',
            dnt: true,
          })
          ?.catch(() => undefined)
        if (await waitForRendered(host, TIMELINE_WAIT_MS, () => cancelled)) return 'ready'
        if (cancelled) return 'unavailable'

        /*
         * X answered with nothing, or never answered. Whether it serves a
         * timeline depends on the visitor's x.com session, so fall through to
         * any curated posts — those render regardless of session.
         */
        host.replaceChildren()
        if (!idsKey) return 'unavailable'
      }

      const ok = await renderPosts(widgets)
      if (cancelled) return 'unavailable'
      return ok || hasRenderedEmbed(host) ? 'ready' : 'unavailable'
    }

    void (async () => {
      let outcome: 'ready' | 'blocked' | 'unavailable' = 'unavailable'
      for (let n = 1; n <= MAX_ATTEMPTS && !cancelled; n++) {
        outcome = await attempt()
        if (cancelled || outcome === 'ready' || hasRenderedEmbed(host)) break
        if (n < MAX_ATTEMPTS) {
          await sleep(RETRY_DELAY_MS)
          if (cancelled || hasRenderedEmbed(host)) break
          host.replaceChildren()
        }
      }
      if (cancelled) return
      if (outcome === 'ready' || hasRenderedEmbed(host)) {
        setState('ready')
      } else {
        setFailure(outcome === 'blocked' ? 'blocked' : 'unavailable')
        setState('failed')
      }
    })()

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [clean, idsKey, usePost, theme, height, frameWidth, scale, reloadKey])

  if (!clean && !idsKey) {
    return <Notice handle="">Set an X handle or profile URL, e.g. x.com/CyberDost</Notice>
  }

  if (usePost && !idsKey) {
    return (
      <Notice handle={clean}>
        Add one or more post URLs, e.g. https://x.com/{clean || 'handle'}/status/1234567890
      </Notice>
    )
  }

  // Only claim a blocker when the script itself could not load. When the script
  // loaded but X sent nothing back, it is X being slow or rate limiting.
  const failureMessage =
    failure === 'blocked'
      ? 'Posts from X could not load. A browser privacy setting or extension may be blocking x.com.'
      : idsKey
        ? 'X did not respond in time. This is usually temporary on X\u2019s side.'
        : 'X did not return this account\u2019s feed. It only serves feeds to visitors signed in to x.com \u2014 add a few post URLs under Posts and they will show for everyone.'

  return (
    <div ref={outerRef} className="relative h-full w-full overflow-hidden">
      {/* Overlay rather than replacement: the host stays mounted, so a post
          that X draws late still appears and clears this notice. */}
      {state === 'failed' && (
        <div className="absolute inset-0 z-10" style={{ background: 'var(--cms-surface, #ffffff)' }}>
          <Notice handle={clean} onRetry={() => setReloadKey((k) => k + 1)}>
            {failureMessage}
          </Notice>
        </div>
      )}

      {state === 'loading' && (
        <div className="absolute inset-0 py-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-black/[0.07] animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5 pt-1">
                <div className="h-3 w-1/3 rounded bg-black/[0.07] animate-pulse" />
                <div className="h-3 w-full rounded bg-black/[0.07] animate-pulse" />
                <div className="h-3 w-4/5 rounded bg-black/[0.07] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        ref={hostRef}
        className="social-feed-scroll h-full overflow-y-auto overflow-x-hidden transition-opacity duration-300"
        style={{
          opacity: state === 'ready' ? 1 : 0,
          width: frameWidth ?? undefined,
          // Below X's floor the embed is drawn wide and scaled down, so it stays
          // whole rather than being cut off. The box is grown by the inverse so
          // that after scaling it still covers the full card height.
          height: scale < 1 ? `${100 / scale}%` : undefined,
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top left',
        }}
      />
    </div>
  )
}
