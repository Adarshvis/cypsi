'use client'

import React, { useEffect, useRef, useState } from 'react'

interface EmbedFrameProps {
  title: string
  /**
   * URL with `__W__` and `__H__` tokens, replaced by the measured box once the
   * card has been laid out. A plain string rather than a builder function
   * because props cross the server/client boundary and must be serializable.
   */
  template: string
  /**
   * Narrowest width the platform will render at. Below this the embed is drawn
   * at minWidth and scaled down, since it cannot be made to reflow.
   */
  minWidth?: number
  /** Widest width the platform accepts for its width parameter. */
  maxWidth?: number
  /** Rounding step, so a one-pixel resize does not reload the iframe. */
  step?: number
}

/**
 * An iframe embed sized to the card it sits in.
 *
 * Social embeds do not reflow to their iframe. Facebook's Page Plugin defaults
 * to 340px wide when no width is passed, Instagram's post embed will not go
 * below 326px, and LinkedIn is similar — all wider than a card in a
 * four-column grid, so the widget renders past the iframe viewport and the
 * right-hand side is simply cut off.
 *
 * The container is therefore measured first and the real width handed to the
 * platform. Where a platform has a hard floor we cannot satisfy, the embed is
 * rendered at that floor and scaled down instead, which keeps it whole and
 * legible rather than clipped.
 */
export default function EmbedFrame({
  title,
  template,
  minWidth = 0,
  maxWidth,
  step = 10,
}: EmbedFrameProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const round = (n: number, to: number) => Math.max(to, Math.round(n / to) * to)

    const measure = () => {
      const w = round(el.clientWidth, step)
      const h = round(el.clientHeight, 20)
      setBox((prev) => (prev && prev.w === w && prev.h === h ? prev : { w, h }))
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [step])

  let content: React.ReactNode = (
    <div className="h-full w-full animate-pulse bg-black/[0.04]" aria-hidden />
  )

  if (box) {
    // Below the platform's floor the embed cannot reflow, so draw it at the
    // floor and scale the whole frame down to fit.
    const scale = box.w < minWidth ? box.w / minWidth : 1
    const frameW = scale < 1 ? minWidth : maxWidth ? Math.min(box.w, maxWidth) : box.w
    const frameH = scale < 1 ? box.h / scale : box.h

    const src = template
      .replace(/__W__/g, String(Math.round(frameW)))
      .replace(/__H__/g, String(Math.round(frameH)))

    content = (
      <iframe
        src={src}
        title={title}
        className="border-0 block"
        loading="lazy"
        allow="encrypted-media; picture-in-picture; clipboard-write"
        // Facebook and Instagram embeds need scripting and same-origin against
        // their own domain; the sandbox still keeps them out of our page.
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
        style={{
          width: frameW,
          height: frameH,
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top left',
          // Centre the frame when the platform capped it narrower than the card.
          marginLeft: Math.max(0, (box.w - frameW * scale) / 2),
        }}
      />
    )
  }

  return (
    <div ref={ref} className="h-full w-full overflow-hidden">
      {content}
    </div>
  )
}
