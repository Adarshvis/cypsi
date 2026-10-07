'use client'

import React, { useId, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { AuthorOption } from './types'

/** Authors shown before "Show all": the ones with the most publications. */
const TOP_COUNT = 6

interface Props {
  authors: AuthorOption[]
  selected: string[]
  onToggle: (name: string) => void
}

/**
 * Author filter for a long, growing list: selected authors as removable chips,
 * a search box, the most-published authors by default and the full A–Z list
 * behind "Show all". Lives outside PublicationsList's render so the search box
 * keeps focus while typing.
 */
export default function AuthorFilter({ authors, selected, onToggle }: Props) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(false)
  const listId = useId()

  const q = search.trim().toLowerCase()
  const hasMore = authors.length > TOP_COUNT

  const visible = useMemo(() => {
    if (q) return authors.filter((a) => a.name.toLowerCase().includes(q))
    if (expanded || !hasMore) return authors
    return [...authors]
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, TOP_COUNT)
  }, [authors, q, expanded, hasMore])

  if (!authors.length) return null

  return (
    <div className="pb-5 mb-5 border-b last:border-b-0 last:mb-0 last:pb-0 border-black/10">
      <h3 className="text-sm font-bold mb-3 ducc-heading" style={{ color: 'var(--cms-primary, #4B2E83)' }}>
        Author
      </h3>

      {selected.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-1.5 list-none p-0 m-0" aria-label="Selected authors">
          {selected.map((name) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => onToggle(name)}
                className="inline-flex items-center gap-1 rounded-full py-1 pl-2.5 pr-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--cms-primary, #4B2E83)' }}
              >
                {name}
                <X size={13} aria-hidden />
                <span className="sr-only">Remove author filter</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="relative mb-2">
          <Search
            size={14}
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search authors…"
            aria-label="Search authors"
            aria-controls={listId}
            className="w-full rounded-md border border-black/15 py-1.5 pl-8 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cms-primary,#4B2E83)]/30"
          />
        </div>
      )}

      <div
        id={listId}
        className={expanded || q ? 'max-h-60 overflow-y-auto pr-1' : undefined}
      >
        {visible.map((author) => (
          <label
            key={author.name}
            className="flex items-center gap-2.5 py-1 text-sm cursor-pointer select-none hover:opacity-80 transition-opacity"
          >
            <input
              type="checkbox"
              className="accent-[var(--cms-primary,#4B2E83)] w-4 h-4 shrink-0"
              checked={selected.includes(author.name)}
              onChange={() => onToggle(author.name)}
            />
            <span className="min-w-0 flex-1">{author.name}</span>
            <span className="text-xs tabular-nums opacity-50" aria-label={`${author.count} publications`}>
              {author.count}
            </span>
          </label>
        ))}
        {q && visible.length === 0 && <p className="py-1 text-sm opacity-60">No authors match.</p>}
      </div>

      {hasMore && !q && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={listId}
          className="mt-2 text-sm font-semibold underline-offset-2 hover:underline"
          style={{ color: 'var(--cms-primary, #4B2E83)' }}
        >
          {expanded ? 'Show fewer' : 'Show all'}
        </button>
      )}
    </div>
  )
}
