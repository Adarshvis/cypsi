import React from 'react'
import { Accessibility } from '../ui/AccessibilityIcon'

interface AccessibilityStatementBlockProps {
  anchorId?: string | null
  heading: string
  intro?: string | null
  items?: { id?: string | null; text: string }[] | null
}

/** Renders [[Key]] as a <kbd>; everything else as plain text. */
function withKeys(text: string): React.ReactNode[] {
  return text.split(/(\[\[[^\]]+\]\])/g).map((part, i) => {
    const key = part.match(/^\[\[([^\]]+)\]\]$/)
    if (!key) return part
    return (
      <kbd
        key={i}
        className="rounded border border-line-warm bg-sand px-1.5 py-0.5 font-sans text-xs"
      >
        {key[1]}
      </kbd>
    )
  })
}

/** Anchors must be valid ids; anything else falls back to the default. */
const cleanAnchor = (raw?: string | null) => {
  const v = raw?.trim().replace(/^#/, '')
  return v && /^[A-Za-z][\w-]*$/.test(v) ? v : 'accessibility'
}

export default function AccessibilityStatementBlock({
  anchorId,
  heading,
  intro,
  items,
}: AccessibilityStatementBlockProps) {
  const points = (items || []).filter((p) => p?.text?.trim())

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 lg:py-14">
      {/* scroll-mt-40 (10rem) clears the fixed header when arriving via #anchor */}
      <section
        id={cleanAnchor(anchorId)}
        aria-labelledby={`${cleanAnchor(anchorId)}-heading`}
        className="scroll-mt-40 rounded-2xl border border-line-warm bg-white p-6 shadow-card lg:p-8"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-maroon-50">
          <Accessibility className="h-5 w-5 text-maroon" />
        </span>

        <h2 id={`${cleanAnchor(anchorId)}-heading`} className="mt-4 text-lg font-bold text-ink">
          {heading}
        </h2>

        {intro && <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{withKeys(intro)}</p>}

        {points.length > 0 && (
          <ul className="mt-4 list-none space-y-2.5 p-0 text-[15px] leading-relaxed text-ink-soft">
            {points.map((p, i) => (
              <li key={p.id || i} className="flex gap-3">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-maroon" />
                <span>{withKeys(p.text)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
