import React from 'react'
import type { SnapshotDataRow } from './types'

interface SnapshotTableProps {
  title: string
  rows: SnapshotDataRow[]
  selectedName: string | null
  hoveredName: string | null
  onSelect: (name: string) => void
  onHover: (name: string | null) => void
  headerBackground: string
}

export default function SnapshotTable({
  title,
  rows,
  selectedName,
  hoveredName,
  onSelect,
  onHover,
  headerBackground,
}: SnapshotTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div
        className="grid grid-cols-[1fr_auto] gap-2 px-5 py-4 text-sm font-bold uppercase tracking-wider text-white"
        style={{ backgroundColor: headerBackground }}
      >
        <span>{title}</span>
        <span>Schools</span>
      </div>
      <div>
        {rows.map((row) => {
          const isSelected = selectedName === row.name
          const isHovered = hoveredName === row.name
          const schools = row.totalSchools ?? 0
          return (
            <button
              key={row.id || row.name}
              type="button"
              onClick={() => onSelect(row.name)}
              onMouseEnter={() => onHover(row.name)}
              onMouseLeave={() => onHover(null)}
              className="grid w-full grid-cols-[1fr_auto] gap-2 border-b border-slate-100 px-5 py-3 text-left transition-colors hover:bg-slate-50"
              style={{
                backgroundColor: isSelected ? '#d1fae5' : isHovered ? '#f8fafc' : 'transparent',
              }}
            >
              <span className="font-semibold text-slate-700">{row.name}</span>
              <span className="font-bold text-slate-900">{schools.toLocaleString('en-IN')}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
