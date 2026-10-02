'use client'

/**
 * Presentational pieces shared by both Requests Dashboard tabs. Inline styles
 * and colours are ported from DUCC's Requests Dashboard so the two look alike.
 */
import React from 'react'
import { STATUS_STYLES, TOTAL_COLOR } from '@/lib/requests/statuses'

export type StatusOption = { readonly label: string; readonly value: string }

const ACCENT = '#1e3a5f'

const secondaryButton: React.CSSProperties = {
  background: '#f8fafc',
  color: ACCENT,
  border: '1px solid #dce4ef',
  borderRadius: '0.375rem',
  padding: '0.45rem 0.8rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
}

export const thStyle: React.CSSProperties = {
  padding: '0.65rem 1rem',
  textAlign: 'left',
  fontSize: '0.7rem',
  fontWeight: 700,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: '1px solid #f3f4f6',
}

export const tdStyle: React.CSSProperties = { padding: '0.75rem 1rem', verticalAlign: 'top' }

export const mutedText: React.CSSProperties = { fontSize: '0.72rem', color: '#9ca3af' }

/** Visually hidden, still read by screen readers (Tailwind is not loaded in the admin). */
export const srOnly: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

export function TabHeader({
  title,
  description,
  onExport,
  onRefresh,
  exportDisabled,
}: {
  title: string
  description: string
  onExport: (format: 'csv' | 'excel') => void
  onRefresh: () => void
  exportDisabled: boolean
}) {
  return (
    <div
      style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--theme-elevation-100, #f3f4f6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}
    >
      <div>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{title}</h3>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#6b7280' }}>{description}</p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => onExport('csv')}
          disabled={exportDisabled}
          style={{ ...secondaryButton, opacity: exportDisabled ? 0.6 : 1 }}
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={() => onExport('excel')}
          disabled={exportDisabled}
          style={{ ...secondaryButton, opacity: exportDisabled ? 0.6 : 1 }}
        >
          Export Excel
        </button>
        <button
          type="button"
          onClick={onRefresh}
          style={{
            background: ACCENT,
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            padding: '0.45rem 1rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <span aria-hidden="true">↻ </span>Refresh
        </button>
      </div>
    </div>
  )
}

/** Total, then one counter per status in the given order. */
export function StatRow({
  total,
  statuses,
  counts,
}: {
  total: number
  statuses: readonly StatusOption[]
  counts: Record<string, number>
}) {
  const items = [
    { label: 'Total', value: total, color: TOTAL_COLOR },
    ...statuses.map((s) => ({
      label: s.label,
      value: counts[s.value] || 0,
      color: STATUS_STYLES[s.value]?.color || '#6b7280',
    })),
  ]
  return (
    <ul
      aria-label="Totals by status"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        gap: 0,
        margin: 0,
        padding: 0,
        listStyle: 'none',
        borderBottom: '1px solid var(--theme-elevation-100, #f3f4f6)',
      }}
    >
      {items.map((s, i) => (
        <li
          key={s.label}
          style={{
            padding: '1rem',
            textAlign: 'center',
            borderRight: i < items.length - 1 ? '1px solid var(--theme-elevation-100, #f3f4f6)' : 'none',
          }}
        >
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          <div style={{ fontSize: '0.73rem', color: '#6b7280', marginTop: '0.2rem' }}>{s.label}</div>
        </li>
      ))}
    </ul>
  )
}

export function FilterBar({
  search,
  onSearch,
  placeholder,
  statuses,
  filter,
  onFilter,
  resultCount,
}: {
  search: string
  onSearch: (value: string) => void
  placeholder: string
  statuses: readonly StatusOption[]
  filter: string
  onFilter: (value: string) => void
  resultCount: number
}) {
  const pills = [{ label: 'All', value: 'all' }, ...statuses]
  return (
    <div
      style={{
        padding: '0.875rem 1.25rem',
        borderBottom: '1px solid var(--theme-elevation-100, #f3f4f6)',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <input
        type="search"
        aria-label={placeholder.replace(/\.+$/, '')}
        placeholder={placeholder}
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        style={{
          flex: 1,
          minWidth: '180px',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          padding: '0.45rem 0.75rem',
          fontSize: '0.82rem',
          fontFamily: 'inherit',
        }}
      />
      <div role="group" aria-label="Filter by status" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {pills.map((s) => {
          const active = filter === s.value
          return (
            <button
              type="button"
              key={s.value}
              aria-pressed={active}
              onClick={() => onFilter(s.value)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: active ? ACCENT : '#d1d5db',
                background: active ? ACCENT : 'transparent',
                color: active ? '#fff' : '#374151',
                fontWeight: active ? 600 : 400,
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {s.label}
            </button>
          )
        })}
      </div>
      <span aria-live="polite" style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
        {resultCount} result{resultCount !== 1 ? 's' : ''}
      </span>
    </div>
  )
}

/** DUCC's inline status pill. Disabled while its update is in flight. */
export function StatusSelect({
  value,
  statuses,
  onChange,
  disabled,
  label,
}: {
  value: string
  statuses: readonly StatusOption[]
  onChange: (value: string) => void
  disabled: boolean
  label: string
}) {
  const style = STATUS_STYLES[value] || { color: '#6b7280', bg: '#f9fafb' }
  return (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      style={{
        border: `1px solid ${style.color}`,
        background: style.bg,
        color: style.color,
        fontWeight: 600,
        fontSize: '0.72rem',
        padding: '0.28rem 0.55rem',
        borderRadius: '999px',
        cursor: disabled ? 'wait' : 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {statuses.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  )
}

export function ErrorNote({ message }: { message: string | null }) {
  // The container stays mounted so screen readers announce a new message.
  return (
    <div role="alert" style={message ? { padding: '0.75rem 1.25rem', background: '#fef2f2', color: '#b91c1c', fontSize: '0.82rem', borderBottom: '1px solid #fecaca' } : undefined}>
      {message}
    </div>
  )
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '2.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
      {children}
    </div>
  )
}

export function LoadingState() {
  return (
    <div role="status" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
      Loading requests...
    </div>
  )
}

export function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            {headers.map((h) => (
              <th key={h} scope="col" style={thStyle}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function rowStyle(index: number, count: number): React.CSSProperties {
  return { borderBottom: index < count - 1 ? '1px solid #f3f4f6' : 'none' }
}

/** Counts per status value. */
export function countByStatus(rows: { status?: string | null }[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const row of rows) {
    const key = row.status || 'new'
    counts[key] = (counts[key] || 0) + 1
  }
  return counts
}

/** Saves a generated export in the browser. */
export function downloadFile(content: string, fileName: string, mimeType: string) {
  // The BOM makes Excel read the file as UTF-8 (names with accents, ₹, etc.).
  const blob = new Blob(['\uFEFF', content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
