'use client'

import React, { useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import ExportMenu from './ExportMenu'
import { TYPE_OPTIONS, typeLabel, type PublicationItem } from './types'

export type { PublicationItem } from './types'

interface Props {
  publications: PublicationItem[]
  authors: string[]
  keywords: string[]
}

const ITEMS_PER_PAGE = 20

const currentYear = new Date().getFullYear()

const TIME_OPTIONS = [
  { label: 'Any time', value: 'any' },
  { label: `Since ${currentYear}`, value: String(currentYear) },
  { label: `Since ${currentYear - 1}`, value: String(currentYear - 1) },
  { label: `Since ${currentYear - 2}`, value: String(currentYear - 2) },
  { label: `Since ${currentYear - 4}`, value: String(currentYear - 4) },
  { label: 'Custom range…', value: 'custom' },
]

function publicationUrl(p: PublicationItem): string | null {
  if (p.link) return p.link
  if (p.doi) return `https://doi.org/${p.doi}`
  return null
}

/** Reduces a filter value to something safe to put in a download filename. */
function fileSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

export default function PublicationsList({ publications, authors, keywords }: Props) {
  const [timeFilter, setTimeFilter] = useState('any')
  const [customStart, setCustomStart] = useState(currentYear - 5)
  const [customEnd, setCustomEnd] = useState(currentYear)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([])
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'relevance'>('date')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const activeFilterCount =
    (timeFilter !== 'any' ? 1 : 0) +
    selectedTypes.length +
    selectedAuthors.length +
    selectedKeywords.length

  function toggle(value: string, list: string[], set: (v: string[]) => void) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
    setPage(1)
  }

  function clearAll() {
    setTimeFilter('any')
    setSelectedTypes([])
    setSelectedAuthors([])
    setSelectedKeywords([])
    setQuery('')
    setSortBy('date')
    setPage(1)
    setFiltersOpen(false)
  }

  const filtered = useMemo(() => {
    let result = [...publications]

    if (timeFilter === 'custom') {
      result = result.filter((p) => p.year >= customStart && p.year <= customEnd)
    } else if (timeFilter !== 'any') {
      const since = Number(timeFilter)
      result = result.filter((p) => p.year >= since)
    }

    if (selectedTypes.length) result = result.filter((p) => selectedTypes.includes(p.type))

    if (selectedAuthors.length) {
      result = result.filter((p) => p.authors.some((a) => selectedAuthors.includes(a.name)))
    }

    if (selectedKeywords.length) {
      result = result.filter((p) => p.keywords.some((k) => selectedKeywords.includes(k)))
    }

    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.publisher.toLowerCase().includes(q) ||
          p.authors.some((a) => a.name.toLowerCase().includes(q)) ||
          p.keywords.some((k) => k.toLowerCase().includes(q)),
      )
    }

    result.sort((a, b) =>
      sortBy === 'relevance' ? b.citationCount - a.citationCount : b.year - a.year,
    )

    return result
  }, [
    publications,
    timeFilter,
    customStart,
    customEnd,
    selectedTypes,
    selectedAuthors,
    selectedKeywords,
    query,
    sortBy,
  ])

  /**
   * Describes the active filters twice over: a slug for the download filename
   * and a sentence for the export menu.
   *
   * The search box counts as a filter here even though it is left out of
   * `activeFilterCount` (which drives the mobile badge for the sidebar only).
   * An export has to reflect the rows actually on screen, and the query is part
   * of what produced them. A null descriptor means nothing is filtered, so the
   * export covers everything.
   */
  const { exportDescriptor, exportSummary } = useMemo(() => {
    const summary: string[] = []
    const slug: string[] = []

    if (timeFilter === 'custom') {
      summary.push(`${customStart}\u2013${customEnd}`)
      slug.push(`${customStart}-${customEnd}`)
    } else if (timeFilter !== 'any') {
      summary.push(`since ${timeFilter}`)
      slug.push(`since-${timeFilter}`)
    }

    if (selectedTypes.length) {
      summary.push(selectedTypes.map(typeLabel).join(', '))
      slug.push(selectedTypes.join('-'))
    }

    if (selectedAuthors.length) {
      summary.push(selectedAuthors.join(', '))
      slug.push(fileSlug(selectedAuthors.join('-')))
    }

    if (selectedKeywords.length) {
      summary.push(selectedKeywords.join(', '))
      slug.push(fileSlug(selectedKeywords.join('-')))
    }

    const q = query.trim()
    if (q) {
      summary.push(`matching \u201c${q}\u201d`)
      slug.push(`search-${fileSlug(q)}`)
    }

    if (!summary.length) return { exportDescriptor: null, exportSummary: null }

    return {
      exportDescriptor: slug.filter(Boolean).join('-').slice(0, 70).replace(/-+$/, ''),
      exportSummary: summary.join(' \u00b7 '),
    }
  }, [
    timeFilter,
    customStart,
    customEnd,
    selectedTypes,
    selectedAuthors,
    selectedKeywords,
    query,
  ])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  const pageNumbers = useMemo(() => {
    const span = Math.min(5, totalPages)
    let start = 1
    if (totalPages > 5) {
      if (safePage >= totalPages - 2) start = totalPages - 4
      else if (safePage > 3) start = safePage - 2
    }
    return Array.from({ length: span }, (_, i) => start + i)
  }, [safePage, totalPages])

  /* ── shared bits ─────────────────────────────────────────────────────── */

  const groupHeading = 'text-sm font-bold mb-3 ducc-heading'
  const groupHeadingStyle = { color: 'var(--cms-primary, #4B2E83)' }

  const optionRow =
    'flex items-center gap-2.5 py-1 text-sm cursor-pointer select-none hover:opacity-80 transition-opacity'

  function FilterGroup({
    title,
    children,
    scroll,
  }: {
    title: string
    children: React.ReactNode
    scroll?: boolean
  }) {
    return (
      <div className="pb-5 mb-5 border-b last:border-b-0 last:mb-0 last:pb-0 border-black/10">
        <h3 className={groupHeading} style={groupHeadingStyle}>
          {title}
        </h3>
        <div className={scroll ? 'max-h-52 overflow-y-auto pr-1' : undefined}>{children}</div>
      </div>
    )
  }

  const filterPanel = (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-black/5 lg:sticky lg:top-24">
      <FilterGroup title="Time">
        {TIME_OPTIONS.map((option) => (
          <label key={option.value} className={optionRow}>
            <input
              type="radio"
              name="timeFilter"
              className="accent-[var(--cms-primary,#4B2E83)] w-4 h-4"
              checked={timeFilter === option.value}
              onChange={() => {
                setTimeFilter(option.value)
                setPage(1)
              }}
            />
            <span>{option.label}</span>
          </label>
        ))}

        {timeFilter === 'custom' && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-black/[0.03] p-2.5">
            <input
              type="number"
              min={1990}
              max={currentYear}
              value={customStart}
              onChange={(e) => {
                setCustomStart(Number(e.target.value))
                setPage(1)
              }}
              className="w-20 rounded-md border border-black/15 px-2 py-1 text-sm"
              aria-label="From year"
            />
            <span className="text-sm opacity-60">to</span>
            <input
              type="number"
              min={1990}
              max={currentYear}
              value={customEnd}
              onChange={(e) => {
                setCustomEnd(Number(e.target.value))
                setPage(1)
              }}
              className="w-20 rounded-md border border-black/15 px-2 py-1 text-sm"
              aria-label="To year"
            />
          </div>
        )}
      </FilterGroup>

      <FilterGroup title="Publication Type">
        {TYPE_OPTIONS.map((option) => (
          <label key={option.value} className={optionRow}>
            <input
              type="checkbox"
              className="accent-[var(--cms-primary,#4B2E83)] w-4 h-4"
              checked={selectedTypes.includes(option.value)}
              onChange={() => toggle(option.value, selectedTypes, setSelectedTypes)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </FilterGroup>

      {authors.length > 0 && (
        <FilterGroup title="Author" scroll>
          {authors.map((author) => (
            <label key={author} className={optionRow}>
              <input
                type="checkbox"
                className="accent-[var(--cms-primary,#4B2E83)] w-4 h-4"
                checked={selectedAuthors.includes(author)}
                onChange={() => toggle(author, selectedAuthors, setSelectedAuthors)}
              />
              <span>{author}</span>
            </label>
          ))}
        </FilterGroup>
      )}

      {keywords.length > 0 && (
        <FilterGroup title="Keywords / Research Area" scroll>
          {keywords.map((keyword) => (
            <label key={keyword} className={optionRow}>
              <input
                type="checkbox"
                className="accent-[var(--cms-primary,#4B2E83)] w-4 h-4"
                checked={selectedKeywords.includes(keyword)}
                onChange={() => toggle(keyword, selectedKeywords, setSelectedKeywords)}
              />
              <span>{keyword}</span>
            </label>
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Sort By">
        {[
          { label: 'Sort by date', value: 'date' as const },
          { label: 'Sort by relevance', value: 'relevance' as const },
        ].map((option) => (
          <label key={option.value} className={optionRow}>
            <input
              type="radio"
              name="sortBy"
              className="accent-[var(--cms-primary,#4B2E83)] w-4 h-4"
              checked={sortBy === option.value}
              onChange={() => {
                setSortBy(option.value)
                setPage(1)
              }}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </FilterGroup>

      <button
        type="button"
        onClick={clearAll}
        className="mt-4 w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: 'var(--cms-primary, #4B2E83)' }}
      >
        Clear All Filters
      </button>
    </div>
  )

  /* ── render ──────────────────────────────────────────────────────────── */

  return (
    <section className="py-12 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Mobile filter toggle */}
        <button
          type="button"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="mb-4 flex w-full items-center justify-between rounded-xl px-4 py-3 text-white lg:hidden"
          style={{ background: 'var(--cms-primary, #4B2E83)' }}
          aria-expanded={filtersOpen}
        >
          <span className="flex items-center gap-2 font-semibold">
            <SlidersHorizontal size={18} />
            Filters
            {activeFilterCount > 0 && (
              <span
                className="ml-1 rounded-full px-2 py-0.5 text-xs font-bold"
                style={{ background: 'var(--cms-accent, #EAB308)', color: '#1A103D' }}
              >
                {activeFilterCount}
              </span>
            )}
          </span>
          {filtersOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className={filtersOpen ? 'block' : 'hidden lg:block'}>{filterPanel}</div>

          <div className="min-w-0">
            {/* Search + count */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div className="relative w-full max-w-md">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Search publications…"
                  aria-label="Search publications"
                  className="w-full rounded-xl border border-black/15 bg-white py-2.5 pl-10 pr-4 text-sm transition focus:border-[var(--cms-primary,#4B2E83)]"
                />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-sm opacity-60">
                  Showing {pageItems.length} of {filtered.length} publications
                </p>
                <ExportMenu
                  items={filtered}
                  totalCount={publications.length}
                  descriptor={exportDescriptor}
                  summary={exportSummary}
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead>
                  <tr style={{ background: 'var(--cms-primary, #4B2E83)', color: '#fff' }}>
                    <th scope="col" className="px-4 py-3.5 text-sm font-semibold">
                      Publication
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-sm font-semibold">
                      Publisher
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-sm font-semibold">
                      Author(s)
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-sm font-semibold">
                      Type
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-sm font-semibold">
                      Year
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-14 text-center text-sm opacity-60">
                        No publications found matching your criteria.
                      </td>
                    </tr>
                  )}

                  {pageItems.map((p, i) => {
                    const url = publicationUrl(p)
                    return (
                      <tr
                        key={p.id}
                        className="border-t border-black/5 transition-colors hover:bg-black/[0.03]"
                        style={{ background: i % 2 === 1 ? 'rgba(0,0,0,0.015)' : undefined }}
                      >
                        <td className="px-4 py-3.5 text-sm font-semibold">
                          {url ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-start gap-1.5 hover:underline"
                              style={{ color: 'var(--cms-primary, #4B2E83)' }}
                            >
                              <span>{p.title}</span>
                              <ExternalLink size={13} className="mt-1 shrink-0 opacity-60" />
                            </a>
                          ) : (
                            p.title
                          )}
                          {p.keywords.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {p.keywords.map((k) => (
                                <span
                                  key={k}
                                  className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                                  style={{
                                    background:
                                      'color-mix(in srgb, var(--cms-primary, #4B2E83) 10%, transparent)',
                                    color: 'var(--cms-primary, #4B2E83)',
                                  }}
                                >
                                  {k}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-sm opacity-75">{p.publisher}</td>
                        <td className="px-4 py-3.5 text-sm opacity-75">
                          {p.authors.map((a) => a.name).join(', ')}
                        </td>
                        <td className="px-4 py-3.5 text-sm opacity-75">{typeLabel(p.type)}</td>
                        <td className="px-4 py-3.5 text-sm opacity-75">{p.year}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-6 flex items-center justify-center gap-1.5" aria-label="Pagination">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, safePage - 1))}
                  disabled={safePage === 1}
                  className="flex items-center gap-1 rounded-lg border border-black/15 px-3 py-2 text-sm disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    aria-current={n === safePage ? 'page' : undefined}
                    className="min-w-10 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
                    style={
                      n === safePage
                        ? {
                            background: 'var(--cms-primary, #4B2E83)',
                            borderColor: 'var(--cms-primary, #4B2E83)',
                            color: '#fff',
                          }
                        : { borderColor: 'rgba(0,0,0,0.15)' }
                    }
                  >
                    {n}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                  disabled={safePage === totalPages}
                  className="flex items-center gap-1 rounded-lg border border-black/15 px-3 py-2 text-sm disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
