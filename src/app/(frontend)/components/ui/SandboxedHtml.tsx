'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Renders CMS-authored HTML (chart embeds, widgets, custom snippets) inside a
 * sandboxed iframe instead of injecting it into the page.
 *
 * Why not dangerouslySetInnerHTML: that runs the HTML with the site's own
 * origin, so any <script> in it can call the Payload API with the viewer's
 * session cookie (e.g. create a user or change roles while a Super Admin is
 * browsing), phish with a fake login form, or rewrite the page. Anyone who can
 * edit a page could therefore act as any admin who views it.
 *
 * Why not a sanitiser: the whole point of these fields is third-party embeds
 * (Flourish, Datawrapper, Power BI, Google Forms, maps) and most of them need
 * <script>. Stripping scripts would break every legitimate use.
 *
 * The sandbox deliberately omits `allow-same-origin`. Scripts still run, but
 * in an opaque origin: no access to the parent DOM, cookies, localStorage or
 * same-origin API calls. Never add `allow-same-origin` together with
 * `allow-scripts` — for a srcdoc frame that removes the sandbox entirely.
 */

const SANDBOX = [
  'allow-scripts',
  'allow-popups',
  'allow-popups-to-escape-sandbox',
  'allow-forms',
  'allow-presentation',
  // No allow-top-navigation: the embed must not be able to redirect the site
  // tab. Links open in a new tab via <base target="_blank"> instead.
].join(' ')

const ALLOW = 'accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture'

/** Upper bound for auto-height so a hostile or buggy embed cannot grow the page forever. */
const MAX_AUTO_HEIGHT = 4000
const MIN_AUTO_HEIGHT = 50
const MESSAGE_KEY = '__cmsEmbedHeight'

type Sizing =
  /** Fills a positioned parent (e.g. a hero slide). */
  | { mode: 'fill' }
  /** Fixed pixel height. */
  | { mode: 'fixed'; height: number }
  /** Grows to fit its content, reported by the frame itself. */
  | { mode: 'auto'; initialHeight?: number }

interface SandboxedHtmlProps {
  html: string
  title: string
  sizing: Sizing
  className?: string
  style?: React.CSSProperties
}

function buildDocument(html: string, reportHeight: boolean): string {
  // The height reporter runs inside the sandbox. It only posts a number to the
  // parent; the parent verifies the message came from this exact frame.
  const reporter = reportHeight
    ? `<script>(function(){var last=0;function send(){var h=Math.ceil(document.documentElement.scrollHeight);if(h!==last){last=h;parent.postMessage({${MESSAGE_KEY}:h},'*');}}if(window.ResizeObserver){new ResizeObserver(send).observe(document.documentElement);}window.addEventListener('load',send);setTimeout(send,300);setTimeout(send,1500);send();})();</script>`
    : ''

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_blank"><style>html,body{margin:0;padding:0;background:transparent;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;}${
    reportHeight ? '' : 'html,body{height:100%;}'
  }img,iframe,video,svg,canvas{max-width:100%;}</style></head><body>${html}${reporter}</body></html>`
}

export default function SandboxedHtml({ html, title, sizing, className, style }: SandboxedHtmlProps) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const isAuto = sizing.mode === 'auto'
  const initialAutoHeight = sizing.mode === 'auto' ? sizing.initialHeight ?? 300 : 0
  const [autoHeight, setAutoHeight] = useState(initialAutoHeight)

  const srcDoc = useMemo(() => buildDocument(html, isAuto), [html, isAuto])

  useEffect(() => {
    if (!isAuto) return
    const onMessage = (event: MessageEvent) => {
      // Sandboxed frames have an opaque ("null") origin, so identify the sender
      // by window reference rather than origin.
      if (event.source !== frameRef.current?.contentWindow) return
      const raw = (event.data as Record<string, unknown> | null)?.[MESSAGE_KEY]
      if (typeof raw !== 'number' || !Number.isFinite(raw)) return
      setAutoHeight(Math.min(Math.max(Math.round(raw), MIN_AUTO_HEIGHT), MAX_AUTO_HEIGHT))
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [isAuto])

  const sizeStyle: React.CSSProperties =
    sizing.mode === 'fill'
      ? { position: 'absolute', inset: 0, width: '100%', height: '100%' }
      : sizing.mode === 'fixed'
        ? { width: '100%', height: sizing.height }
        : { width: '100%', height: autoHeight }

  return (
    <iframe
      ref={frameRef}
      title={title}
      srcDoc={srcDoc}
      sandbox={SANDBOX}
      allow={ALLOW}
      referrerPolicy="strict-origin-when-cross-origin"
      loading="lazy"
      className={`block border-0 ${className || ''}`}
      style={{ ...sizeStyle, ...style }}
    />
  )
}
