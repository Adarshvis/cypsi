import React from 'react'
import Image from 'next/image'
import type { Media as MediaType } from '@/payload-types'
import DynamicIcon from '../ui/DynamicIcon'

interface TimelineItem {
  id?: string | null
  title: string
  description?: string | null
  icon?: string | null
}

interface HighlightCard {
  id?: string | null
  title: string
  description?: string | null
}

interface StoryTimelineBlockProps {
  eyebrow?: string | null
  heading: string
  body?: string | null
  imagePosition?: 'left' | 'right' | null
  image?: MediaType | string | null
  timeline?: TimelineItem[] | null
  ctaLabel?: string | null
  ctaUrl?: string | null
  highlightCards?: HighlightCard[] | null
  backgroundColor?: string | null
}

export default function StoryTimelineBlock({
  eyebrow,
  heading,
  body,
  imagePosition = 'right',
  image,
  timeline,
  ctaLabel,
  ctaUrl,
  highlightCards,
  backgroundColor,
}: StoryTimelineBlockProps) {
  const imageUrl = typeof image === 'object' && image?.url ? image.url : null
  const imageAlt = typeof image === 'object' ? image?.alt || '' : ''
  const imageFirst = imagePosition === 'left'
  const milestones = timeline || []
  const cards = highlightCards || []
  const hasCta = Boolean(ctaLabel && ctaUrl)

  return (
    <section className="py-16 px-6" style={{ backgroundColor: backgroundColor || '#e6edf0' }}>
      <div
        className={`max-w-7xl mx-auto grid gap-12 lg:gap-16 lg:grid-cols-2 items-start ${
          imageFirst ? 'lg:[&>*:first-child]:order-2' : ''
        }`}
      >
        {/* ── Narrative + timeline ── */}
        <div>
          {eyebrow && (
            <p
              className="text-xs font-bold uppercase tracking-[0.18em] mb-3"
              style={{ color: 'var(--cms-primary, #04415f)' }}
            >
              {eyebrow}
            </p>
          )}

          <h2
            className="ducc-heading font-bold tracking-tight"
            style={{
              fontSize: 'clamp(1.5rem, 2.4vw, 1.95rem)',
              lineHeight: 1.25,
              color: 'var(--cms-secondary, #011e2c)',
            }}
          >
            {heading}
          </h2>

          {body && (
            <p
              className="mt-4 whitespace-pre-line"
              style={{
                fontSize: '1.0625rem',
                lineHeight: 1.7,
                color: 'var(--cms-text, #010608)',
                opacity: 0.78,
              }}
            >
              {body}
            </p>
          )}

          {(milestones.length > 0 || hasCta) && (
            <ol className="mt-9 relative list-none pl-0">
              {/* Connecting rail */}
              <span
                aria-hidden
                className="absolute top-1.5 bottom-1.5 w-px"
                style={{
                  left: 7,
                  background:
                    'color-mix(in srgb, var(--cms-primary, #04415f) 28%, transparent)',
                }}
              />

              {milestones.map((item, i) => (
                <li key={item.id || i} className="relative pl-9 pb-8 last:pb-0">
                  <span
                    aria-hidden
                    className="absolute top-1 flex items-center justify-center rounded-full"
                    style={{
                      left: 0,
                      width: 15,
                      height: 15,
                      background: 'var(--cms-primary, #04415f)',
                      boxShadow: '0 0 0 4px color-mix(in srgb, var(--cms-primary, #04415f) 14%, transparent)',
                    }}
                  />
                  <h3
                    className="font-semibold flex items-center gap-2"
                    style={{ fontSize: '1rem', color: 'var(--cms-secondary, #011e2c)' }}
                  >
                    {item.icon && (
                      <DynamicIcon name={item.icon} size={16} color="var(--cms-primary, #04415f)" />
                    )}
                    {item.title}
                  </h3>
                  {item.description && (
                    <p
                      className="mt-1.5"
                      style={{
                        fontSize: '0.9375rem',
                        lineHeight: 1.65,
                        color: 'var(--cms-text, #010608)',
                        opacity: 0.72,
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                </li>
              ))}

              {/* The call to action reads as the final node of the timeline */}
              {hasCta && (
                <li className="relative pl-9">
                  <span
                    aria-hidden
                    className="absolute top-1.5 rounded-full"
                    style={{
                      left: 0,
                      width: 15,
                      height: 15,
                      background: 'var(--cms-accent, #f59e0b)',
                      boxShadow: '0 0 0 4px color-mix(in srgb, var(--cms-accent, #f59e0b) 18%, transparent)',
                    }}
                  />
                  <a
                    href={ctaUrl!}
                    className="inline-flex items-center gap-2 font-semibold transition hover:opacity-90"
                    style={{
                      padding: '11px 27px',
                      borderRadius: 10,
                      fontSize: '0.9375rem',
                      background: 'var(--cms-secondary, #011e2c)',
                      color: '#fff',
                    }}
                  >
                    {ctaLabel}
                  </a>
                </li>
              )}
            </ol>
          )}
        </div>

        {/* ── Image + highlight cards ── */}
        <div>
          {imageUrl && (
            <div
              className="relative w-full overflow-hidden"
              style={{
                aspectRatio: '16 / 10',
                borderRadius: 10,
                boxShadow: '0 18px 50px rgba(0, 0, 0, 0.12)',
              }}
            >
              <Image src={imageUrl} alt={imageAlt} fill className="object-cover" />
            </div>
          )}

          {cards.length > 0 && (
            <div
              className={`mt-6 grid gap-5 ${cards.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}
            >
              {cards.map((card, i) => (
                <div
                  key={card.id || i}
                  className="bg-white p-5"
                  style={{
                    borderRadius: 10,
                    borderLeft: '3px solid var(--cms-primary, #04415f)',
                    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <h3
                    className="font-semibold"
                    style={{ fontSize: '1rem', color: 'var(--cms-secondary, #011e2c)' }}
                  >
                    {card.title}
                  </h3>
                  {card.description && (
                    <p
                      className="mt-2"
                      style={{
                        fontSize: '0.9375rem',
                        lineHeight: 1.65,
                        color: 'var(--cms-text, #010608)',
                        opacity: 0.72,
                      }}
                    >
                      {card.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
