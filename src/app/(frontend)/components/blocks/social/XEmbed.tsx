'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ExternalLink, Info } from 'lucide-react'
import { tweetId, xHandle } from '@/lib/socialFeeds'

const WIDGET_SRC = 'https://platform.twitter.com/widgets.js'

/** X will not lay an embed out below this width, and caps it at the upper one. */
const X_MIN_WIDTH = 250
const X_MAX_WIDTH = 550

/**
 * How long to give the widget factory before treating it as failed.
 *
 * Needed because `createTimeline` does not always settle: when X declines to
 * serve a timeline it can leave the promise pending indefinitely, which left the
 * card showing its loading skeleton forever.
 */
const WIDGET_DEADLINE_MS = 8000

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

/** Resolves undefined if the wrapped promise has not settled in time. */
function withDeadline<T>(promise: Promise<T> | undefined, ms: number): Promise<T | undefined> {
  if (!promise) return Promise.resolve(undefined)
  return Promise.race([
    promise,
    new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), ms)),
  ])
}

/** Loads widgets.js once per page, no matter how many embeds are on it. */
let scriptPromise: Promise<void> | null = null

function loadWidgetScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.twttr?.widgets) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('blocked')))
      return
    }
    const s = document.createElement('script')
    s.src = WIDGET_SRC
    s.async = true
    s.charset = 'utf-8'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('blocked'))
    document.head.appendChild(s)
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
}: {
  handle: string
  children: React.ReactNode
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

    /** Renders the curated posts, returning how many X actually built. */
    const renderPosts = async (widgets: NonNullable<Window['twttr']>['widgets']) => {
      let rendered = 0
      for (const id of idsKey.split(',').filter(Boolean)) {
        if (cancelled) return rendered
        // Each post gets its own slot, so one failure does not lose the rest.
        const slot = document.createElement('div')
        host.appendChild(slot)
        const el = await withDeadline(
          widgets?.createTweet?.(id, slot, {
            theme: theme || 'light',
            width: frameWidth,
            dnt: true,
            align: 'center',
            conversation: 'none',
          }),
          WIDGET_DEADLINE_MS,
        )
        if (el) rendered++
        else slot.remove()
      }
      return rendered
    }

    loadWidgetScript()
      .then(async () => {
        if (cancelled) return
        const widgets = window.twttr?.widgets
        if (!widgets) throw new Error('widgets unavailable')

        if (!usePost && clean) {
          const el = await withDeadline(
            widgets.createTimeline?.(
              { sourceType: 'profile', screenName: clean },
              host,
              {
                theme: theme || 'light',
                width: frameWidth,
                height: scale < 1 ? Math.round(height / scale) : height,
                chrome: 'noheader noborders transparent',
                dnt: true,
              },
            ),
            WIDGET_DEADLINE_MS,
          )
          if (cancelled) return

          if (el) {
            setState('ready')
            return
          }

          /*
           * X answered with nothing, or never answered. Whether it serves a
           * timeline depends on the visitor's x.com session, so rather than
           * deciding up front which mode is correct, fall through to any curated
           * posts — those render regardless of session. The card shows the live
           * feed when X allows it and the chosen posts when it does not, with no
           * configuration change needed either way.
           */
          host.replaceChildren()
          if (idsKey) {
            const rendered = await renderPosts(widgets)
            if (!cancelled) setState(rendered > 0 ? 'ready' : 'failed')
            return
          }

          setState('failed')
          return
        }

        const rendered = await renderPosts(widgets)
        if (!cancelled) setState(rendered > 0 ? 'ready' : 'failed')
      })
      .catch(() => {
        if (!cancelled) setState('failed')
      })

    return () => {
      cancelled = true
    }
  }, [clean, idsKey, usePost, theme, height, frameWidth, scale])

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

  if (state === 'failed') {
    return (
      <Notice handle={clean}>
        {idsKey
          ? 'These posts could not load. A browser privacy setting or extension is usually blocking x.com.'
          : 'X did not return this account\u2019s feed. It only serves feeds to visitors signed in to x.com \u2014 add a few post URLs under Posts and they will show for everyone.'}
      </Notice>
    )
  }

  return (
    <div ref={outerRef} className="relative h-full w-full overflow-hidden">
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
