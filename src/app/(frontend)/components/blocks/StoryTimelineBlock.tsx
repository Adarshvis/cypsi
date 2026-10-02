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

type LayoutStyle = 'timeline' | 'cards' | 'checklist'

interface StoryTimelineBlockProps {
  eyebrow?: string | null
  heading: string
  body?: string | null
  imagePosition?: 'left' | 'right' | null
  image?: MediaType | string | null
  layoutStyle?: LayoutStyle | null
  timeline?: TimelineItem[] | null
  ctaLabel?: string | null
  ctaUrl?: string | null
  highlightCards?: HighlightCard[] | null
  backgroundColor?: string | null
}

const PRIMARY = 'var(--cms-primary, #04415f)'
const SECONDARY = 'var(--cms-secondary, #011e2c)'
const ACCENT = 'var(--cms-accent, #f59e0b)'
const TEXT = 'var(--cms-text, #010608)'
const tint = (pct: number, color = PRIMARY) => `color-mix(in srgb, ${color} ${pct}%, transparent)`

/** Written out in full so Tailwind can see every class. */
const cardColumnClasses: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

/* ───────────────────────── Shared pieces ───────────────────────── */

function Intro({
  eyebrow,
  heading,
  body,
}: Pick<StoryTimelineBlockProps, 'eyebrow' | 'heading' | 'body'>) {
  return (
    <>
      {eyebrow && (
        <p
          className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] mb-3"
          style={{ color: PRIMARY }}
        >
          <span aria-hidden className="inline-block h-0.5 w-8 rounded-full" style={{ background: ACCENT }} />
          {eyebrow}
        </p>
      )}

      <h2
        className="ducc-heading font-bold tracking-tight"
        style={{
          fontSize: 'clamp(1.6rem, 2.6vw, 2.25rem)',
          lineHeight: 1.2,
          color: SECONDARY,
        }}
      >
        {heading}
      </h2>

      {body && (
        <p
          className="mt-5 whitespace-pre-line"
          style={{ fontSize: '1.0625rem', lineHeight: 1.75, color: TEXT, opacity: 0.78 }}
        >
          {body}
        </p>
      )}
    </>
  )
}

function CtaButton({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      className="inline-flex items-center gap-2 font-semibold transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        padding: '12px 28px',
        borderRadius: 10,
        fontSize: '0.9375rem',
        background: SECONDARY,
        color: '#fff',
      }}
    >
      {label}
      <DynamicIcon name="ArrowRight" size={16} />
    </a>
  )
}

/** Image with a soft offset frame behind it, so it reads as a composed element. */
function FramedImage({
  url,
  alt,
  frameSide,
  aspect = '4 / 3',
}: {
  url: string
  alt: string
  frameSide: 'left' | 'right'
  aspect?: string
}) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className={`absolute hidden sm:block -bottom-4 w-full h-full rounded-2xl ${
          frameSide === 'right' ? '-right-4' : '-left-4'
        }`}
        style={{ background: tint(12) }}
      />
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{ aspectRatio: aspect, boxShadow: '0 20px 50px rgba(0, 0, 0, 0.14)' }}
      >
        <Image
          src={url}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  )
}

function HighlightCards({ cards }: { cards: HighlightCard[] }) {
  if (!cards.length) return null
  return (
    <div className={`mt-8 grid gap-5 ${cards.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
      {cards.map((card, i) => (
        <div
          key={card.id || i}
          className="bg-white p-5"
          style={{
            borderRadius: 10,
            borderLeft: `3px solid ${PRIMARY}`,
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.06)',
          }}
        >
          <h3 className="font-semibold" style={{ fontSize: '1rem', color: SECONDARY }}>
            {card.title}
          </h3>
          {card.description && (
            <p
              className="mt-2"
              style={{ fontSize: '0.9375rem', lineHeight: 1.65, color: TEXT, opacity: 0.72 }}
            >
              {card.description}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

/* ───────────────────────── Milestone renderers ───────────────────────── */

function Timeline({
  items,
  cta,
}: {
  items: TimelineItem[]
  cta: { label: string; url: string } | null
}) {
  if (!items.length && !cta) return null
  return (
    <ol className="mt-9 relative list-none pl-0">
      <span
        aria-hidden
        className="absolute top-1.5 bottom-1.5 w-px"
        style={{ left: 7, background: tint(28) }}
      />

      {items.map((item, i) => (
        <li key={item.id || i} className="relative pl-9 pb-8 last:pb-0">
          <span
            aria-hidden
            className="absolute top-1 rounded-full"
            style={{
              left: 0,
              width: 15,
              height: 15,
              background: PRIMARY,
              boxShadow: `0 0 0 4px ${tint(14)}`,
            }}
          />
          <h3
            className="font-semibold flex items-center gap-2"
            style={{ fontSize: '1rem', color: SECONDARY }}
          >
            {item.icon && <DynamicIcon name={item.icon} size={16} color={PRIMARY} />}
            {item.title}
          </h3>
          {item.description && (
            <p
              className="mt-1.5"
              style={{ fontSize: '0.9375rem', lineHeight: 1.65, color: TEXT, opacity: 0.72 }}
            >
              {item.description}
            </p>
          )}
        </li>
      ))}

      {/* The call to action reads as the final node of the timeline */}
      {cta && (
        <li className="relative pl-9">
          <span
            aria-hidden
            className="absolute top-1.5 rounded-full"
            style={{
              left: 0,
              width: 15,
              height: 15,
              background: ACCENT,
              boxShadow: `0 0 0 4px ${tint(18, ACCENT)}`,
            }}
          />
          <CtaButton label={cta.label} url={cta.url} />
        </li>
      )}
    </ol>
  )
}

function FeatureCards({ items }: { items: TimelineItem[] }) {
  if (!items.length) return null
  const cols = cardColumnClasses[Math.min(items.length, 4)] || cardColumnClasses[4]

  return (
    <ul className={`mt-12 grid gap-6 list-none pl-0 ${cols}`}>
      {items.map((item, i) => (
        <li
          key={item.id || i}
          className="group relative flex flex-col overflow-hidden rounded-2xl bg-white p-7 transition duration-300 hover:-translate-y-1"
          style={{
            border: `1px solid ${tint(14)}`,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Accent bar that grows on hover */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
            style={{ background: PRIMARY }}
          />

          <div className="flex items-start justify-between gap-4">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: tint(10) }}
            >
              <DynamicIcon name={item.icon || 'Sparkles'} size={22} color={PRIMARY} />
            </span>
            <span
              aria-hidden
              className="ducc-heading text-3xl font-bold leading-none"
              style={{ color: tint(14) }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
          </div>

          <h3
            className="ducc-heading mt-6 font-bold"
            style={{ fontSize: '1.2rem', color: SECONDARY }}
          >
            {item.title}
          </h3>
          {item.description && (
            <p
              className="mt-3"
              style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: TEXT, opacity: 0.72 }}
            >
              {item.description}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

function Checklist({ items }: { items: TimelineItem[] }) {
  if (!items.length) return null
  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-2 list-none pl-0">
      {items.map((item, i) => (
        <li
          key={item.id || i}
          className="flex items-start gap-3 rounded-xl bg-white px-4 py-3.5"
          style={{
            border: `1px solid ${tint(12)}`,
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
          }}
        >
          <span
            aria-hidden
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            style={{ background: PRIMARY }}
          >
            <DynamicIcon name="Check" size={14} color="#fff" />
          </span>
          <span>
            <span
              className="block font-semibold"
              style={{ fontSize: '0.9375rem', lineHeight: 1.45, color: SECONDARY }}
            >
              {item.title}
            </span>
            {item.description && (
              <span
                className="mt-1 block"
                style={{ fontSize: '0.875rem', lineHeight: 1.6, color: TEXT, opacity: 0.7 }}
              >
                {item.description}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}

/* ───────────────────────── Block ───────────────────────── */

export default function StoryTimelineBlock({
  eyebrow,
  heading,
  body,
  imagePosition = 'right',
  image,
  layoutStyle,
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
  const cta = ctaLabel && ctaUrl ? { label: ctaLabel, url: ctaUrl } : null
  const style: LayoutStyle = layoutStyle || 'timeline'

  // With the image on the left, the text column moves second on large screens.
  const orderClass = imageFirst ? 'lg:[&>*:first-child]:order-2' : ''
  // The decorative frame sits on the outer edge of the page.
  const frameSide = imageFirst ? 'left' : 'right'

  if (style === 'timeline') {
    return (
      <section className="py-12 lg:py-14 px-6" style={{ backgroundColor: backgroundColor || '#e6edf0' }}>
        <div className={`max-w-7xl mx-auto grid gap-12 lg:gap-16 lg:grid-cols-2 items-start ${orderClass}`}>
          <div>
            <Intro eyebrow={eyebrow} heading={heading} body={body} />
            <Timeline items={milestones} cta={cta} />
          </div>

          {/* Sticky so a long timeline never leaves an empty column beside it */}
          {(imageUrl || cards.length > 0) && (
            <div className="lg:sticky lg:top-28">
              {imageUrl && (
                <FramedImage url={imageUrl} alt={imageAlt} frameSide={frameSide} aspect="16 / 10" />
              )}
              <HighlightCards cards={cards} />
            </div>
          )}
        </div>
      </section>
    )
  }

  const introColumn = (
    <div>
      <Intro eyebrow={eyebrow} heading={heading} body={body} />
      {style === 'checklist' && <Checklist items={milestones} />}
      {cta && (
        <div className="mt-8">
          <CtaButton label={cta.label} url={cta.url} />
        </div>
      )}
    </div>
  )

  return (
    <section className="py-12 lg:py-14 px-6" style={{ backgroundColor: backgroundColor || '#e6edf0' }}>
      <div className="max-w-7xl mx-auto">
        <div className={`grid gap-12 lg:gap-16 lg:grid-cols-2 items-center ${orderClass}`}>
          {introColumn}
          {(imageUrl || cards.length > 0) && (
            <div>
              {imageUrl && (
                <FramedImage url={imageUrl} alt={imageAlt} frameSide={frameSide} aspect="3 / 2" />
              )}
              <HighlightCards cards={cards} />
            </div>
          )}
        </div>

        {style === 'cards' && <FeatureCards items={milestones} />}
      </div>
    </section>
  )
}
