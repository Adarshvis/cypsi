'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, Download, Filter } from 'lucide-react'
import {
  FORMAT_META,
  downloadPublications,
  type ExportFormat,
} from './exportPublications'
import type { PublicationItem } from './types'

interface ExportMenuProps {
  /** Already filtered and sorted — exactly what the table is showing. */
  items: PublicationItem[]
  /** Total before filtering, used to say how much is being left out. */
  totalCount: number
  /** Short slug describing the active filters, or null when none are active. */
  descriptor: string | null
  /** Human-readable filter summary for the tooltip and helper line. */
  summary: string | null
}

const FORMATS: ExportFormat[] = ['csv', 'bibtex', 'ris']

/**
 * Export control for the publications table.
 *
 * The behaviour readers expect, and the reason the count is on the button: an
 * export covers the whole filtered result set, not just the visible page, and
 * falls back to everything when no filter is set. Making the number visible
 * means there is no doubt about which of those two is happening.
 */
export default function ExportMenu({ items, totalCount, descriptor, summary }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const [justSaved, setJustSaved] = useState<ExportFormat | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  const isFiltered = descriptor !== null
  const disabled = items.length === 0

  useEffect(() => {
    if (!open) return

    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function handleExport(format: ExportFormat) {
    downloadPublications(items, format, descriptor)
    setOpen(false)
    setJustSaved(format)
    window.setTimeout(() => setJustSaved(null), 2600)
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        title={
          disabled
            ? 'Nothing to export'
            : isFiltered
              ? `Export the ${items.length} filtered publications (${summary})`
              : `Export all ${items.length} publications`
        }
        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        style={{ background: 'var(--cms-primary, #4B2E83)' }}
      >
        {justSaved ? <Check size={16} /> : <Download size={16} />}
        <span>{justSaved ? 'Downloaded' : 'Export'}</span>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-bold tabular-nums"
          style={{ background: 'rgba(255,255,255,0.22)' }}
        >
          {items.length}
        </span>
        <ChevronDown
          size={15}
          className="transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : undefined }}
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-30 mt-2 w-[19rem] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_18px_44px_-12px_rgba(16,24,40,0.28)]"
        >
          <div className="border-b border-black/10 px-4 py-3">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--cms-primary, #4B2E83)' }}>
              {isFiltered && <Filter size={12} />}
              {isFiltered ? 'Filtered selection' : 'Full list'}
            </p>
            <p className="mt-1 text-sm">
              <span className="font-semibold tabular-nums">{items.length}</span>
              {isFiltered ? (
                <>
                  {' '}
                  of {totalCount} publications
                  <span className="block text-xs opacity-60">{summary}</span>
                </>
              ) : (
                <> publications, no filters applied</>
              )}
            </p>
          </div>

          <ul className="list-none p-1.5">
            {FORMATS.map((format) => {
              const meta = FORMAT_META[format]
              return (
                <li key={format}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleExport(format)}
                    className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-black/[0.04]"
                  >
                    <Download size={15} className="mt-0.5 shrink-0 opacity-50" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{meta.label}</span>
                      <span className="block text-xs opacity-60">{meta.hint}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
