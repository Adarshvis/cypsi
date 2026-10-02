'use client'

import React, { useMemo, useState } from 'react'
import type { InternshipApplication, Resume } from '@/payload-types'
import { INTERNSHIP_STATUSES } from '@/lib/requests/statuses'
import { exportStamp, formatDate, toCsv, toTsv } from '@/lib/requests/exportRows'
import {
  EmptyState,
  FilterBar,
  LoadingState,
  StatRow,
  StatusSelect,
  TabHeader,
  Table,
  countByStatus,
  downloadFile,
  mutedText,
  rowStyle,
  tdStyle,
} from './ui'

/** Table columns, in order. Every other submitted field is export-only. */
const HEADERS = [
  'Name',
  'Domain',
  'College / University',
  'Year / Semester',
  'Contact',
  'Status',
  'Resume',
]

const EXPORT_BASE_HEADERS = [
  'ID',
  'Submitted',
  'Status',
  'Name',
  'Email',
  'Phone',
  'Domain',
  'College / University',
  'Year / Semester',
  'Resume File',
]

/** DUCC's stat order: Total, New, Approved, Reviewed, Rejected. */
const STAT_ORDER = ['new', 'approved', 'reviewed', 'rejected'].map(
  (value) => INTERNSHIP_STATUSES.find((s) => s.value === value)!,
)

const statusLabel = (value?: string | null) =>
  INTERNSHIP_STATUSES.find((s) => s.value === value)?.label || value || ''

function resumeOf(app: InternshipApplication): Resume | null {
  return app.resume && typeof app.resume === 'object' ? app.resume : null
}

/** `extraFields` as label → text; anything non-string is shown as JSON. */
function extraFieldsOf(app: InternshipApplication): Record<string, string> {
  const raw = app.extraFields
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    out[key] =
      value === null || value === undefined
        ? ''
        : typeof value === 'string'
          ? value
          : JSON.stringify(value)
  }
  return out
}

export function InternshipApplicationsTab({
  docs,
  loading,
  totalDocs,
  updatingId,
  onRefresh,
  onStatusChange,
}: {
  docs: InternshipApplication[]
  loading: boolean
  totalDocs: number
  updatingId: string | null
  onRefresh: () => void
  onStatusChange: (id: InternshipApplication['id'], status: string) => void
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return docs.filter((app) => {
      if (filter !== 'all' && app.status !== filter) return false
      if (!q) return true
      return [app.name, app.email, app.domain, app.institution].some((v) =>
        v?.toLowerCase().includes(q),
      )
    })
  }, [docs, search, filter])

  function handleExport(format: 'csv' | 'excel') {
    if (!filtered.length) return
    const extras = filtered.map(extraFieldsOf)
    const extraHeaders: string[] = []
    for (const record of extras) {
      for (const key of Object.keys(record)) {
        if (!extraHeaders.includes(key)) extraHeaders.push(key)
      }
    }
    const headers = [...EXPORT_BASE_HEADERS, ...extraHeaders]
    const rows = filtered.map((app, i) => [
      app.id,
      formatDate(app.submittedAt || app.createdAt),
      statusLabel(app.status),
      app.name,
      app.email,
      app.phone || '',
      app.domain,
      app.institution || '',
      app.yearOrSemester || '',
      resumeOf(app)?.filename || '',
      ...extraHeaders.map((h) => extras[i][h] || ''),
    ])
    const name = `internship-applications-${exportStamp()}`
    if (format === 'csv') {
      downloadFile(toCsv(headers, rows), `${name}.csv`, 'text/csv;charset=utf-8')
    } else {
      downloadFile(toTsv(headers, rows), `${name}.xls`, 'application/vnd.ms-excel;charset=utf-8')
    }
  }

  return (
    <>
      <TabHeader
        title="Internship Applications"
        description="Review and manage internship applications"
        onExport={handleExport}
        onRefresh={onRefresh}
        exportDisabled={loading || filtered.length === 0}
      />

      {loading ? (
        <LoadingState />
      ) : (
        <>
          <StatRow total={docs.length} statuses={STAT_ORDER} counts={countByStatus(docs)} />
          <FilterBar
            search={search}
            onSearch={setSearch}
            placeholder="Search by name, email, domain or college..."
            statuses={INTERNSHIP_STATUSES}
            filter={filter}
            onFilter={setFilter}
            resultCount={filtered.length}
          />
          {totalDocs > docs.length ? (
            <p style={{ ...mutedText, margin: 0, padding: '0.5rem 1.25rem' }}>
              Showing the latest {docs.length} of {totalDocs} applications.
            </p>
          ) : null}

          {filtered.length === 0 ? (
            <EmptyState>No internship applications found.</EmptyState>
          ) : (
            <Table headers={HEADERS}>
              {filtered.map((app, idx) => {
                const resume = resumeOf(app)
                return (
                  <tr key={app.id} style={rowStyle(idx, filtered.length)}>
                    <td style={{ ...tdStyle, fontWeight: 600, fontSize: '0.875rem' }}>{app.name || '—'}</td>
                    <td style={{ ...tdStyle, fontSize: '0.82rem', color: '#374151' }}>{app.domain || '—'}</td>
                    <td style={{ ...tdStyle, fontSize: '0.82rem', color: '#374151' }}>
                      {app.institution || '—'}
                    </td>
                    <td style={{ ...tdStyle, fontSize: '0.78rem', color: '#6b7280' }}>
                      {app.yearOrSemester || '—'}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: '0.78rem', color: '#374151' }}>{app.email}</div>
                      {app.phone ? <div style={mutedText}>{app.phone}</div> : null}
                    </td>
                    <td style={tdStyle}>
                      <StatusSelect
                        label={`Status for ${app.name}`}
                        value={app.status || 'new'}
                        statuses={INTERNSHIP_STATUSES}
                        disabled={updatingId === String(app.id)}
                        onChange={(status) => onStatusChange(app.id, status)}
                      />
                    </td>
                    <td style={tdStyle}>
                      {resume?.url ? (
                        <a
                          href={resume.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Download resume of ${app.name} (opens in a new tab)`}
                          style={{
                            display: 'inline-block',
                            background: '#f0f4f8',
                            color: '#1e3a5f',
                            padding: '0.3rem 0.65rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            border: '1px solid #dce4ef',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span aria-hidden="true">↓ </span>Download
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>No file</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </Table>
          )}
        </>
      )}
    </>
  )
}
