'use client'

import React, { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import type { Media as MediaType } from '@/payload-types'
import DynamicIcon from '../ui/DynamicIcon'
import { safeHref } from '@/lib/safeEmbedUrl'

interface Project {
  id?: string | null
  category: string
  categoryIcon?: string | null
  client?: string | null
  title: string
  image?: MediaType | string | number | null
  imageFrame?: 'browser' | 'plain' | null
  cardColor?: string | null
  description?: string | null
  tags?: { id?: string | null; label: string }[] | null
  deliverables?: { id?: string | null; item: string }[] | null
  link?: string | null
  displayUrl?: string | null
}

interface ProjectShowcaseBlockProps {
  eyebrow?: string | null
  heading: string
  headingHighlight?: string | null
  description?: string | null
  filterLabel?: string | null
  allLabel?: string | null
  scrollHint?: string | null
  clientLabel?: string | null
  deliverablesHeading?: string | null
  linkLabel?: string | null
  projects?: Project[] | null
  backgroundColor?: string | null
}

const PRIMARY = 'var(--cms-primary, #04415f)'
const SECONDARY = 'var(--cms-secondary, #011e2c)'
const ACCENT = 'var(--cms-accent, #f59e0b)'
const TEXT = 'var(--cms-text, #010608)'
const SURFACE = 'var(--cms-surface, #ffffff)'
const tint = (pct: number, color = PRIMARY) => `color-mix(in srgb, ${color} ${pct}%, transparent)`

const ALL = '__all__'
const keyOf = (category: string) => category.trim().toLowerCase()
const pad = (n: number) => String(n).padStart(2, '0')

function hostOf(url: string | null): string | null {
  if (!url || url.startsWith('/') || url.startsWith('#')) return null
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

/** Renders the heading with the highlight phrase in italic accent type. */
function Heading({ text, highlight }: { text: string; highlight?: string | null }) {
  const phrase = highlight?.trim()
  const at = phrase ? text.indexOf(phrase) : -1
  if (!phrase || at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <em
        className="font-normal"
        style={{ fontFamily: 'var(--font-playfair, serif)', color: PRIMARY }}
      >
        {phrase}
      </em>
      {text.slice(at + phrase.length)}
    </>
  )
}

function ProjectVisual({ project, index }: { project: Project; index: number }) {
  const media = typeof project.image === 'object' ? project.image : null
  const url = media?.url || null
  if (!url) return null

  const href = safeHref(project.link)
  const address = project.displayUrl?.trim() || hostOf(href)
  const framed = project.imageFrame !== 'plain'
  const base = project.cardColor?.trim() || PRIMARY

  return (
    <div
      className="relative overflow-hidden rounded-[28px] p-4 sm:p-8 lg:p-10"
      style={{
        background: `linear-gradient(135deg, ${tint(22, base)}, ${tint(8, base)})`,
        border: `1px solid ${tint(14, base)}`,
      }}
    >
      <div
        className="overflow-hidden rounded-xl sm:rounded-2xl"
        style={{ background: SURFACE, boxShadow: '0 24px 60px rgba(0, 0, 0, 0.14)' }}
      >
        {framed && (
          <div className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: `1px solid ${tint(10, TEXT)}` }}>
            <span aria-hidden className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: tint(18, TEXT) }} />
              ))}
            </span>
            {address && (
              <span
                className="flex-1 truncate rounded-full px-3 py-1 text-center font-mono text-[11px]"
                style={{ background: tint(6, TEXT), color: TEXT, opacity: 0.7 }}
              >
                {address}
              </span>
            )}
          </div>
        )}
        <div className="relative aspect-[16/10]">
          <Image
            src={url}
            alt={media?.alt || project.title}
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover object-top"
            priority={index === 0}
          />
        </div>
      </div>
    </div>
  )
}

function ProjectEntry({
  project,
  index,
  total,
  labels,
}: {
  project: Project
  index: number
  total: number
  labels: { client: string; deliverables: string; link: string }
}) {
  const href = safeHref(project.link)
  const external = Boolean(href && /^https?:/i.test(href))
  const tags = project.tags || []
  const deliverables = project.deliverables || []
  const titleId = `project-${project.id || index}`
  const hasDetails = Boolean(project.description || tags.length)
  const hasCard = deliverables.length > 0 || Boolean(href)

  return (
    <article aria-labelledby={titleId} className="py-14 lg:py-20">
      {/* Category row */}
      <div className="flex items-center justify-between gap-4 pb-5" style={{ borderBottom: `1px solid ${tint(12, TEXT)}` }}>
        <span className="flex min-w-0 items-center gap-3">
          {project.categoryIcon && (
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ background: tint(10) }}
            >
              <DynamicIcon name={project.categoryIcon} size={16} color={PRIMARY} />
            </span>
          )}
          <span className="truncate font-mono text-xs uppercase tracking-[0.14em]" style={{ color: TEXT }}>
            {project.category}
          </span>
        </span>
        <span className="shrink-0 font-mono text-sm" style={{ color: TEXT, opacity: 0.45 }}>
          {pad(index + 1)} / {pad(total)}
        </span>
      </div>

      {project.client && (
        <p className="mt-8 font-mono text-sm" style={{ color: PRIMARY }}>
          {labels.client ? `${labels.client}: ` : ''}
          {project.client}
        </p>
      )}
      <h3
        id={titleId}
        className="ducc-heading mt-3 font-bold tracking-tight"
        style={{ fontSize: 'clamp(1.9rem, 3.4vw, 3.25rem)', lineHeight: 1.08, color: SECONDARY }}
      >
        {project.title}
      </h3>

      <div className="mt-10">
        <ProjectVisual project={project} index={index} />
      </div>

      {(hasDetails || hasCard) && (
        <div className={`mt-10 grid gap-8 ${hasDetails && hasCard ? 'md:grid-cols-2 md:gap-10' : ''}`}>
          {hasDetails && (
            <div>
              {project.description && (
                <p className="whitespace-pre-line" style={{ fontSize: '1.0625rem', lineHeight: 1.7, color: TEXT, opacity: 0.8 }}>
                  {project.description}
                </p>
              )}
              {tags.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2 list-none p-0">
                  {tags.map((t, i) => (
                    <li
                      key={t.id || i}
                      className="rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em]"
                      style={{ border: `1px solid ${tint(22, TEXT)}`, color: TEXT, opacity: 0.8 }}
                    >
                      {t.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {hasCard && (
            <div className="self-start rounded-3xl p-7" style={{ background: tint(6, TEXT) }}>
              {deliverables.length > 0 && (
                <>
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.14em]" style={{ color: PRIMARY }}>
                    {labels.deliverables}
                  </p>
                  <ul className="mt-4 space-y-2.5 list-none p-0">
                    {deliverables.map((d, i) => (
                      <li key={d.id || i} className="flex items-start gap-3" style={{ color: TEXT, fontSize: '0.95rem' }}>
                        <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: ACCENT }} />
                        {d.item}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {href && (
                <a
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={`group inline-flex items-center gap-3 font-mono text-sm uppercase tracking-[0.14em] focus-visible:outline-2 focus-visible:outline-offset-4 ${
                    deliverables.length ? 'mt-8' : ''
                  }`}
                  style={{ color: SECONDARY }}
                >
                  {labels.link}
                  <span
                    aria-hidden
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:rotate-45"
                    style={{ background: SECONDARY }}
                  >
                    <ArrowUpRight size={15} />
                  </span>
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  )
}

export default function ProjectShowcaseBlock({
  eyebrow,
  heading,
  headingHighlight,
  description,
  filterLabel,
  allLabel,
  scrollHint,
  clientLabel,
  deliverablesHeading,
  linkLabel,
  projects,
  backgroundColor,
}: ProjectShowcaseBlockProps) {
  const items = useMemo(() => (projects || []).filter((p) => p?.title && p?.category), [projects])
  const [active, setActive] = useState<string>(ALL)
  const listRef = useRef<HTMLDivElement>(null)

  /** One filter per distinct category, labelled as the editor first wrote it. */
  const categories = useMemo(() => {
    const seen = new Map<string, string>()
    for (const p of items) if (!seen.has(keyOf(p.category))) seen.set(keyOf(p.category), p.category.trim())
    return [...seen.entries()].map(([key, label]) => ({ key, label }))
  }, [items])

  const visible = active === ALL ? items : items.filter((p) => keyOf(p.category) === active)

  if (!items.length) return null

  const choose = (key: string) => {
    setActive(key)
    // If the list has scrolled past, bring the first result back into view.
    const el = listRef.current
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const filterButton = (key: string, label: string) => {
    const on = active === key
    return (
      <button
        key={key}
        type="button"
        onClick={() => choose(key)}
        aria-pressed={on}
        className="shrink-0 rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        style={
          on
            ? { background: SECONDARY, color: '#fff', border: `1px solid ${SECONDARY}` }
            : { background: 'transparent', color: TEXT, border: `1px solid ${tint(22, TEXT)}` }
        }
      >
        {label}
      </button>
    )
  }

  const labels = {
    client: clientLabel ?? '',
    deliverables: deliverablesHeading || '',
    link: linkLabel || '',
  }

  return (
    <section className="px-6" style={{ backgroundColor: backgroundColor || 'var(--cms-bg, #ffffff)' }}>
      {/* grid-cols-1 (minmax(0,1fr)) keeps the scrollable filter row from stretching the column on mobile */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Intro panel: sticky on large screens so filters stay in reach */}
        {/* On large screens the panel sits inside the centred container, so its
            tint would stop short of the screen edge. A large spread shadow in
            the same tint fills the space, and clip-path lets it show only to
            the left (not over the project list, nor above/below the section).
            Shadows do not add scroll width. Mobile already bleeds via -mx-6. */}
        <aside
          className="-mx-6 px-6 pb-6 pt-14 lg:mx-0 lg:pr-12 lg:pt-20 lg:shadow-[0_0_0_100vmax_var(--showcase-panel)] lg:[clip-path:inset(0_0_0_-100vmax)]"
          style={{ background: tint(4, TEXT), ['--showcase-panel' as string]: tint(4, TEXT) }}
        >
          <div className="lg:sticky lg:top-24 lg:flex lg:min-h-[calc(100vh-8rem)] lg:flex-col">
            {eyebrow && (
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em]" style={{ color: PRIMARY }}>
                {eyebrow}
              </p>
            )}
            <h2
              className="ducc-heading font-bold tracking-tight"
              style={{ fontSize: 'clamp(2.25rem, 4.4vw, 4rem)', lineHeight: 1.05, color: SECONDARY }}
            >
              <Heading text={heading} highlight={headingHighlight} />
            </h2>
            {description && (
              <p className="mt-7 max-w-md whitespace-pre-line" style={{ fontSize: '1.0625rem', lineHeight: 1.7, color: TEXT, opacity: 0.8 }}>
                {description}
              </p>
            )}

            {categories.length > 1 && (
              <div className="mt-10">
                {filterLabel && (
                  <p id="project-filter-label" className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: TEXT, opacity: 0.55 }}>
                    {filterLabel}
                  </p>
                )}
                <div
                  role="group"
                  aria-labelledby={filterLabel ? 'project-filter-label' : undefined}
                  className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0"
                >
                  {filterButton(ALL, allLabel || 'All')}
                  {categories.map((c) => filterButton(c.key, c.label))}
                </div>
              </div>
            )}

            {scrollHint && (
              <p
                className="mt-auto hidden items-center gap-2 pt-10 font-mono text-[11px] uppercase tracking-[0.14em] lg:flex"
                style={{ color: TEXT, opacity: 0.5 }}
              >
                {scrollHint}
                <ArrowDown size={12} aria-hidden />
              </p>
            )}
          </div>
        </aside>

        {/* Project list */}
        <div
          ref={listRef}
          className="scroll-mt-24 lg:border-l lg:pl-12"
          style={{ borderColor: tint(10, TEXT) }}
        >
          {visible.map((p, i) => (
            <div key={p.id || `${p.title}-${i}`} style={i > 0 ? { borderTop: `1px solid ${tint(10, TEXT)}` } : undefined}>
              <ProjectEntry project={p} index={i} total={visible.length} labels={labels} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
