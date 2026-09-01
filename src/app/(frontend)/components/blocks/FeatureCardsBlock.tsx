import React from 'react'
import Link from 'next/link'
import * as LucideIcons from 'lucide-react'
import { ArrowRight, CheckCircle2, Clock, Users as UsersIcon, Calendar } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import RichText from '../ui/RichText'

interface FeatureCardsBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  eyebrow?: string | null
  ctaLabel?: string | null
  ctaLink?: string | null
  cardLayout?: 'classic' | 'minimal' | 'split' | 'accentTop' | 'duccService' | 'duccServiceDetail' | 'duccProject' | 'duccTraining' | null
  columns?: '2' | '3' | '4' | null
  cardTheme?: 'dark' | 'light' | null
  showCardNumbers?: boolean | null
  showCardButton?: boolean | null
  backgroundColor?: string | null
  cards: {
    icon?: string | null
    image?: any
    title?: any
    description?: any
    link?: string | null
    tag?: string | null
    external?: boolean | null
    features?: { text: string; id?: string }[] | null
    buttonLabel?: string | null
    buttonUrl?: string | null
    status?: string | null
    progress?: number | null
    level?: string | null
    duration?: string | null
    mode?: string | null
    audience?: string | null
    date?: string | null
    id?: string | null
  }[]
}

const gridClasses = {
  '2': 'grid-cols-1 md:grid-cols-2',
  '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function getIcon(name: string, size = 32) {
  const Icon = (LucideIcons as any)[name]
  return Icon ? <Icon size={size} /> : null
}

function renderCardBody(card: FeatureCardsBlockProps['cards'][number]) {
  return (
    <>
      {card.title ? (
        /* Tailwind preflight strips heading size and weight, so every level the
           editor might use has to be restored explicitly — h4 included. */
        <div className="mb-2 text-inherit [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h4]:text-lg [&_h5]:text-base [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-semibold [&_h4]:font-semibold [&_h5]:font-semibold [&_h1]:leading-snug [&_h2]:leading-snug [&_h3]:leading-snug [&_h4]:leading-snug [&_p]:my-0 [&_p]:leading-snug [&_p]:font-semibold">
          <RichText data={card.title} />
        </div>
      ) : null}
      {card.description ? (
        <div className="text-inherit/80 [&_p]:my-0 [&_p]:leading-relaxed">
          <RichText data={card.description} />
        </div>
      ) : null}
    </>
  )
}

export default function FeatureCardsBlock({
  sectionHeading,
  sectionDescription,
  headingAlignment,
  eyebrow,
  ctaLabel,
  ctaLink,
  cardLayout = 'classic',
  columns = '3',
  cardTheme = 'dark',
  showCardNumbers = false,
  showCardButton = false,
  backgroundColor,
  cards,
}: FeatureCardsBlockProps) {
  const cols = columns || '3'
  const layout = cardLayout || 'classic'

  if (!cards || cards.length === 0) return null

  /* ── Service cards layout ── */
  if (layout === 'duccService') {
    return (
      <section className="py-24 px-6" style={{ background: 'var(--cms-muted-bg, #F8F4FF)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              {eyebrow && (
                <span
                  className="text-xs font-bold tracking-[0.2em] uppercase"
                  style={{ color: 'var(--cms-primary, #4B2E83)' }}
                >
                  {eyebrow}
                </span>
              )}
              {sectionHeading && (
                <h2
                  className="mt-3 text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] ducc-heading"
                  style={{ color: 'var(--cms-secondary, #1A103D)' }}
                >
                  {sectionHeading}
                </h2>
              )}
            </div>
            {ctaLink && ctaLabel && (
              <Link
                href={ctaLink}
                className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
                style={{ color: 'var(--cms-primary, #4B2E83)' }}
              >
                {ctaLabel} <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          <div className={`grid md:grid-cols-2 ${cols === '4' ? 'lg:grid-cols-4' : cols === '2' ? '' : 'lg:grid-cols-3'} gap-5`}>
            {cards.map((card, index) => {
              const key = card.id || `ducc-service-${index}`
              const iconNode = card.icon ? getIcon(card.icon) : null
              const cardImgUrl = typeof card.image === 'object' && card.image?.url ? card.image.url : null
              const titleText =
                typeof card.title === 'string'
                  ? card.title
                  : card.title?.root?.children?.[0]?.children?.[0]?.text || ''

              const descText =
                typeof card.description === 'string'
                  ? card.description
                  : card.description?.root?.children?.[0]?.children?.[0]?.text || ''

              const Wrapper = card.link ? (card.external ? 'a' : Link) : 'div'
              const wrapperProps = card.link
                ? card.external
                  ? { href: card.link, target: '_blank', rel: 'noreferrer' }
                  : { href: card.link }
                : {}

              return (
                <Wrapper
                  key={key}
                  {...(wrapperProps as any)}
                  className="card-hover group relative bg-white rounded-2xl p-6 border overflow-hidden cursor-pointer"
                  style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)' }}
                >
                  <div className="relative">
                    <div
                      className="absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity"
                      style={{ background: 'var(--cms-accent, #EAB308)' }}
                    />
                    {/* Icon row — duccService always shows icon, never image */}
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform"
                        style={{
                          background: `linear-gradient(135deg, var(--cms-primary, #4B2E83) 0%, var(--cms-secondary, #1A103D) 100%)`,
                        }}
                      >
                        {card.icon ? (
                          <span style={{ color: 'var(--cms-accent, #EAB308)' }}>
                            {getIcon(card.icon, 20)}
                          </span>
                        ) : null}
                      </div>
                      {card.tag && (
                        <span
                          className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full"
                          style={{
                            background: 'var(--cms-muted-bg, #F8F4FF)',
                            color: 'var(--cms-primary, #4B2E83)',
                          }}
                        >
                          {card.tag}
                        </span>
                      )}
                    </div>
                    <h3
                      className="text-lg font-bold leading-tight"
                      style={{ color: 'var(--cms-secondary, #1A103D)' }}
                    >
                      {titleText || <RichText data={card.title} />}
                    </h3>
                    {descText ? (
                      <p className="mt-2.5 text-sm text-gray-600 leading-relaxed">{descText}</p>
                    ) : card.description ? (
                      <div className="mt-2.5 text-sm text-gray-600 leading-relaxed">
                        <RichText data={card.description} />
                      </div>
                    ) : null}
                    <div
                      className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold group-hover:gap-2.5 transition-all"
                      style={{ color: 'var(--cms-primary, #4B2E83)' }}
                    >
                      Learn more <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Wrapper>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  /* ── Service detail (alternating) layout ── */
  if (layout === 'duccServiceDetail') {
    return (
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
          <div className="space-y-16">
            {cards.map((card, index) => {
              const key = card.id || `service-detail-${index}`
              const isReversed = index % 2 === 1
              const titleText =
                typeof card.title === 'string'
                  ? card.title
                  : card.title?.root?.children?.[0]?.children?.[0]?.text || ''
              const num = String(index + 1).padStart(2, '0')

              return (
                <div
                  key={key}
                  className={`grid lg:grid-cols-2 gap-10 items-center ${isReversed ? 'lg:[&>*:first-child]:order-2' : ''}`}
                >
                  {/* Decorative panel with number + icon */}
                  <div
                    className="rounded-2xl p-10 relative overflow-hidden"
                    style={{ background: 'var(--cms-muted-bg, #F8F4FF)' }}
                  >
                    <div
                      className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-30"
                      style={{ background: 'var(--cms-accent, #EAB308)' }}
                    />
                    <div className="relative">
                      <div
                        className="text-7xl font-bold opacity-20"
                        style={{ color: 'var(--cms-primary, #4B2E83)' }}
                      >
                        {num}
                      </div>
                      {card.icon && (
                        <div className="mt-6" style={{ color: 'var(--cms-primary, #4B2E83)' }}>
                          {getIcon(card.icon, 64)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <span
                      className="text-xs font-bold tracking-[0.2em] uppercase"
                      style={{ color: 'var(--cms-accent, #EAB308)' }}
                    >
                      Service {num}
                    </span>
                    <h3
                      className="mt-3 text-3xl md:text-4xl font-bold ducc-heading"
                      style={{ color: 'var(--cms-secondary, #1A103D)' }}
                    >
                      {titleText || <RichText data={card.title} />}
                    </h3>

                    {/* Feature points */}
                    {card.features && card.features.length > 0 && (
                      <ul className="mt-6 space-y-3">
                        {card.features.map((f, fi) => (
                          <li key={f.id || fi} className="flex items-start gap-3 text-gray-700">
                            <CheckCircle2
                              className="w-5 h-5 shrink-0 mt-0.5"
                              style={{ color: 'var(--cms-primary, #4B2E83)' }}
                            />
                            <span>{f.text}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Fallback to description if no features */}
                    {(!card.features || card.features.length === 0) && card.description && (
                      <div className="mt-4 text-gray-600 leading-relaxed">
                        <RichText data={card.description} />
                      </div>
                    )}

                    {/* CTA button */}
                    {card.buttonLabel && card.buttonUrl && (
                      <a
                        href={card.buttonUrl}
                        className="btn-shine mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-md hover:shadow-lg transition"
                        style={{ background: 'var(--cms-primary, #4B2E83)' }}
                        target={card.external ? '_blank' : undefined}
                        rel={card.external ? 'noreferrer' : undefined}
                      >
                        {card.buttonLabel} <ArrowRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  /* ── Project cards layout ── */
  if (layout === 'duccProject') {
    const statusColors: Record<string, { bg: string; text: string }> = {
      ongoing: { bg: 'color-mix(in srgb, var(--cms-accent, #EAB308) 15%, transparent)', text: 'var(--cms-secondary, #1A103D)' },
      active: { bg: 'color-mix(in srgb, #22c55e 15%, transparent)', text: '#166534' },
      live: { bg: 'color-mix(in srgb, #22c55e 15%, transparent)', text: '#166534' },
      completed: { bg: 'color-mix(in srgb, var(--cms-primary, #4B2E83) 15%, transparent)', text: 'var(--cms-primary, #4B2E83)' },
      planned: { bg: 'color-mix(in srgb, #3b82f6 15%, transparent)', text: '#1e40af' },
    }

    return (
      <section className="py-16 px-6" style={{ backgroundColor: backgroundColor || undefined }}>
        <div className="max-w-7xl mx-auto">
          <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
          <div className={`grid gap-6 ${gridClasses[cols]}`}>
            {cards.map((card, index) => {
              const key = card.id || `project-${index}`
              const colors = statusColors[card.status || 'ongoing'] || statusColors.ongoing
              const titleText = typeof card.title === 'string' ? card.title : card.title?.root?.children?.[0]?.children?.[0]?.text || ''
              const descText = typeof card.description === 'string' ? card.description : card.description?.root?.children?.[0]?.children?.[0]?.text || ''

              return (
                <div
                  key={key}
                  className="card-hover bg-white rounded-2xl p-8 border"
                  style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)' }}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-xl font-bold ducc-heading" style={{ color: 'var(--cms-secondary, #1A103D)' }}>
                      {titleText}
                    </h3>
                    {card.status && (
                      <span
                        className="text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full shrink-0"
                        style={{ background: colors.bg, color: colors.text }}
                      >
                        {card.status}
                      </span>
                    )}
                  </div>
                  {descText && <p className="text-sm text-gray-600 leading-relaxed mb-6">{descText}</p>}
                  {card.progress != null && (
                    <div className="mb-5">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium" style={{ color: 'var(--cms-secondary, #1A103D)' }}>Progress</span>
                        <span className="font-bold" style={{ color: 'var(--cms-secondary, #1A103D)' }}>{card.progress}%</span>
                      </div>
                      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--cms-muted-bg, #F8F4FF)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${card.progress}%`, background: `linear-gradient(90deg, var(--cms-primary, #4B2E83), var(--cms-secondary, #1A103D))` }}
                        />
                      </div>
                    </div>
                  )}
                  {card.features && card.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {card.features.map((f, fi) => (
                        <span
                          key={f.id || fi}
                          className="text-xs px-3 py-1.5 rounded-full border"
                          style={{ background: 'var(--cms-muted-bg, #F8F4FF)', borderColor: 'color-mix(in srgb, var(--cms-primary, #4B2E83) 15%, transparent)', color: 'var(--cms-text, #1A103D)' }}
                        >
                          {f.text}
                        </span>
                      ))}
                    </div>
                  )}
                  {card.link && (
                    <a href={card.link} className="inline-flex items-center gap-1.5 text-sm font-semibold hover:gap-2.5 transition-all" style={{ color: 'var(--cms-primary, #4B2E83)' }}>
                      View details <ArrowRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  /* ── Training cards layout ── */
  if (layout === 'duccTraining') {
    const levelColors: Record<string, { bg: string; text: string }> = {
      Beginner: { bg: 'color-mix(in srgb, #22c55e 15%, transparent)', text: '#166534' },
      Intermediate: { bg: 'color-mix(in srgb, var(--cms-accent, #EAB308) 15%, transparent)', text: 'var(--cms-secondary, #1A103D)' },
      Advanced: { bg: 'color-mix(in srgb, #ef4444 15%, transparent)', text: '#991b1b' },
    }

    return (
      <section className="py-16 px-6" style={{ backgroundColor: backgroundColor || undefined }}>
        <div className="max-w-7xl mx-auto">
          <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
          <div className={`grid gap-6 ${gridClasses[cols]}`}>
            {cards.map((card, index) => {
              const key = card.id || `training-${index}`
              const colors = levelColors[card.level || 'Intermediate'] || levelColors.Intermediate
              const titleText = typeof card.title === 'string' ? card.title : card.title?.root?.children?.[0]?.children?.[0]?.text || ''

              return (
                <div
                  key={key}
                  className="card-hover bg-white rounded-2xl border overflow-hidden flex flex-col"
                  style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)' }}
                >
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between mb-4">
                      {card.level && (
                        <span className="text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full" style={{ background: colors.bg, color: colors.text }}>
                          {card.level}
                        </span>
                      )}
                      {card.date && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(card.date)}
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold leading-tight ducc-heading mb-4" style={{ color: 'var(--cms-secondary, #1A103D)' }}>
                      {titleText}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-5 flex-wrap">
                      {card.duration && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {card.duration}</span>}
                      {card.audience && <span className="flex items-center gap-1.5"><UsersIcon className="w-4 h-4" /> {card.audience}</span>}
                      {card.mode && (
                        <span className="text-xs px-2.5 py-1 rounded-full border" style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)' }}>
                          {card.mode}
                        </span>
                      )}
                    </div>
                    {card.features && card.features.length > 0 && (
                      <div className="mb-4">
                        <div className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--cms-primary, #4B2E83)' }}>
                          Topics
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {card.features.map((f, fi) => (
                            <span key={f.id || fi} className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'var(--cms-muted-bg, #F8F4FF)', color: 'var(--cms-text, #1A103D)' }}>
                              {f.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {card.buttonLabel && (
                    <div className="px-6 pb-6">
                      <a
                        href={card.buttonUrl || '#'}
                        className="btn-shine w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white py-3.5 rounded-lg transition hover:brightness-110"
                        style={{ background: 'var(--cms-primary, #4B2E83)' }}
                      >
                        {card.buttonLabel} <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  const isLight = cardTheme === 'light'

  return (
    <section className="py-16 px-6" style={{ backgroundColor: backgroundColor || undefined }}>
      <div className="max-w-6xl mx-auto">
        <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
        <div className={`grid gap-8 items-stretch ${gridClasses[cols]}`}>
          {cards.map((card, index) => {
            const key = card.id || `feature-card-${index}`
            const iconNode = card.icon ? getIcon(card.icon) : null
            const cardImgUrl = typeof card.image === 'object' && card.image?.url ? card.image.url : null

            const content = (
              <div
                key={key}
                className={
                  layout === 'minimal'
                    ? 'bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all'
                    : layout === 'split'
                      ? 'bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-all'
                      : layout === 'accentTop'
                        ? 'bg-white rounded-xl p-6 border border-gray-200 relative hover:shadow-md transition-all'
                        : isLight
                          ? 'card-hover bg-white rounded-2xl border transition-all overflow-hidden h-full flex flex-col'
                          : 'bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors'
                }
                style={
                  layout === 'classic' && isLight
                    ? { borderColor: 'var(--cms-muted-bg, #F8F4FF)' }
                    : undefined
                }
              >
                {layout === 'accentTop' ? (
                  <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl" style={{ background: 'var(--cms-primary, #3B82F6)' }} />
                ) : null}

                {/* Card image — classic light only */}
                {layout === 'classic' && isLight && cardImgUrl && (
                  <div className="relative overflow-hidden shrink-0" style={{ aspectRatio: '16 / 10' }}>
                    <img
                      src={cardImgUrl}
                      alt={typeof card.image === 'object' ? card.image.alt || '' : ''}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      className="group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                )}

                {layout === 'split' ? (
                  <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 items-start p-6">
                    {iconNode ? <div style={{ color: 'var(--cms-primary, #3B82F6)' }}>{iconNode}</div> : null}
                    <div className="text-gray-900">{renderCardBody(card)}</div>
                  </div>
                ) : (
                  <div className={layout === 'classic' && isLight ? 'p-6 flex flex-col flex-1' : ''}>
                    {!cardImgUrl && iconNode ? (
                      layout === 'classic' && isLight ? (
                        <div className="flex items-center gap-4 mb-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, var(--cms-primary, #4B2E83) 0%, var(--cms-secondary, #1A103D) 100%)`,
                              color: 'var(--cms-accent, #EAB308)',
                            }}
                          >
                            {getIcon(card.icon!, 20)}
                          </div>
                          {showCardNumbers && (
                            <div
                              className="text-4xl font-bold opacity-10"
                              style={{ color: 'var(--cms-primary, #4B2E83)' }}
                            >
                              {String(index + 1).padStart(2, '0')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={layout === 'classic' ? 'text-blue-400 mb-4' : 'text-blue-500 mb-4'}>
                          {iconNode}
                        </div>
                      )
                    ) : null}
                    <div
                      className={layout === 'classic' && !isLight ? 'text-white' : 'text-gray-900'}
                      style={
                        layout === 'classic' && isLight
                          ? { color: 'var(--cms-secondary, #1A103D)' }
                          : undefined
                      }
                    >
                      {renderCardBody(card)}
                    </div>
                    {/* Full-width button for Classic Light */}
                    {/* mt-auto on the wrapper pins the button to the card floor,
                        so buttons line up across the row despite uneven copy. */}
                    {isLight && showCardButton && card.buttonLabel && (
                      <div className="mt-auto pt-5">
                        <a
                          href={card.buttonUrl || card.link || '#'}
                          className="btn-shine w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white py-3 rounded-lg transition hover:brightness-110"
                          style={{ background: 'var(--cms-secondary, #1A103D)' }}
                          target={card.external ? '_blank' : undefined}
                          rel={card.external ? 'noreferrer' : undefined}
                        >
                          {card.buttonLabel} <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )

            if (card.link && !(isLight && showCardButton)) {
              return <a key={key} href={card.link} className="no-underline">{content}</a>
            }
            return content
          })}
        </div>
      </div>
    </section>
  )
}
