'use client'

import React, { useMemo, useState } from 'react'
import type { Form, FormSubmission } from '@/payload-types'
import { ENQUIRY_STATUSES } from '@/lib/requests/statuses'
import { ENQUIRY_HINT_KEYS, mapFieldsByHint, type HintEntry } from '@/lib/requests/fieldHints'
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
const HEADERS = ['Name', 'Contact', 'Subject', 'Message', 'Received', 'Status']

const EXPORT_BASE_HEADERS = [
  'ID',
  'Received',
  'Status',
  'Form',
  'Name',
  'Email',
  'Phone',
  'Subject',
  'Message',
]

const MESSAGE_PREVIEW = 80

const statusLabel = (value?: string | null) =>
  ENQUIRY_STATUSES.find((s) => s.value === value)?.label || value || ''

type FieldDef = { name?: string | null; label?: string | null; blockType: string }

export interface EnquiryRow {
  id: FormSubmission['id']
  status: FormSubmission['status']
  createdAt: string
  formTitle: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  /** Every other answer, keyed by field label (or name). Export only. */
  rest: { key: string; value: string }[]
}

/** Maps one submission onto the columns using its form's field labels. */
export function toEnquiryRow(submission: FormSubmission, formsById: Map<string, Form>): EnquiryRow {
  const formId = typeof submission.form === 'object' ? submission.form?.id : submission.form
  const form = formsById.get(String(formId))
  const defs = ((form?.fields || []) as FieldDef[]).filter((f) => f.name)

  const entries: HintEntry[] = (submission.submissionData || []).map((item) => {
    const def = defs.find((f) => f.name === item.field)
    return {
      name: item.field,
      label: def?.label,
      blockType: def?.blockType || 'text',
      value: item.value ?? '',
    }
  })
  const { mapped, rest } = mapFieldsByHint(entries, ENQUIRY_HINT_KEYS)

  return {
    id: submission.id,
    status: submission.status || 'new',
    createdAt: submission.createdAt,
    formTitle: form?.title || '',
    name: mapped.name || '',
    email: mapped.email || '',
    phone: mapped.phone || '',
    subject: mapped.subject || '',
    message: mapped.message || '',
    rest,
  }
}

function preview(text: string): string {
  return text.length > MESSAGE_PREVIEW ? `${text.slice(0, MESSAGE_PREVIEW).trimEnd()}…` : text
}

export function ContactEnquiriesTab({
  rows,
  loading,
  totalDocs,
  hasForms,
  updatingId,
  onRefresh,
  onStatusChange,
}: {
  rows: EnquiryRow[]
  loading: boolean
  totalDocs: number
  /** False when no form has "Show submissions in Contact Enquiries" ticked. */
  hasForms: boolean
  updatingId: string | null
  onRefresh: () => void
  onStatusChange: (id: FormSubmission['id'], status: string) => void
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (filter !== 'all' && row.status !== filter) return false
      if (!q) return true
      return [row.name, row.email, row.subject, row.message].some((v) => v.toLowerCase().includes(q))
    })
  }, [rows, search, filter])

  function handleExport(format: 'csv' | 'excel') {
    if (!filtered.length) return
    const extraHeaders: string[] = []
    for (const row of filtered) {
      for (const { key } of row.rest) {
        if (!extraHeaders.includes(key)) extraHeaders.push(key)
      }
    }
    const headers = [...EXPORT_BASE_HEADERS, ...extraHeaders]
    const data = filtered.map((row) => {
      const extra = new Map<string, string>()
      for (const { key, value } of row.rest) {
        // Same label twice in one submission: keep both values in the one column.
        extra.set(key, extra.has(key) ? `${extra.get(key)} | ${value}` : value)
      }
      return [
        row.id,
        formatDate(row.createdAt),
        statusLabel(row.status),
        row.formTitle,
        row.name,
        row.email,
        row.phone,
        row.subject,
        row.message,
        ...extraHeaders.map((h) => extra.get(h) || ''),
      ]
    })
    const name = `contact-enquiries-${exportStamp()}`
    if (format === 'csv') {
      downloadFile(toCsv(headers, data), `${name}.csv`, 'text/csv;charset=utf-8')
    } else {
      downloadFile(toTsv(headers, data), `${name}.xls`, 'application/vnd.ms-excel;charset=utf-8')
    }
  }

  return (
    <>
      <TabHeader
        title="Contact Enquiries"
        description="Messages sent through contact forms"
        onExport={handleExport}
        onRefresh={onRefresh}
        exportDisabled={loading || filtered.length === 0}
      />

      {loading ? (
        <LoadingState />
      ) : (
        <>
          <StatRow total={rows.length} statuses={ENQUIRY_STATUSES} counts={countByStatus(rows)} />
          <FilterBar
            search={search}
            onSearch={setSearch}
            placeholder="Search by name, email, subject or message..."
            statuses={ENQUIRY_STATUSES}
            filter={filter}
            onFilter={setFilter}
            resultCount={filtered.length}
          />
          {totalDocs > rows.length ? (
            <p style={{ ...mutedText, margin: 0, padding: '0.5rem 1.25rem' }}>
              Showing the latest {rows.length} of {totalDocs} enquiries.
            </p>
          ) : null}

          {!hasForms ? (
            <EmptyState>
              No contact forms selected. Tick “Show submissions in Contact Enquiries” on a form.
            </EmptyState>
          ) : filtered.length === 0 ? (
            <EmptyState>No contact enquiries found.</EmptyState>
          ) : (
            <Table headers={HEADERS}>
              {filtered.map((row, idx) => (
                <tr key={row.id} style={rowStyle(idx, filtered.length)}>
                  <td style={{ ...tdStyle, fontWeight: 600, fontSize: '0.875rem' }}>{row.name || '—'}</td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '0.78rem', color: '#374151' }}>{row.email || '—'}</div>
                    {row.phone ? <div style={mutedText}>{row.phone}</div> : null}
                  </td>
                  <td style={{ ...tdStyle, fontSize: '0.82rem', color: '#374151' }}>{row.subject || '—'}</td>
                  <td
                    style={{ ...tdStyle, fontSize: '0.78rem', color: '#6b7280', maxWidth: '22rem' }}
                    title={row.message || undefined}
                  >
                    {row.message ? preview(row.message) : '—'}
                  </td>
                  <td style={{ ...tdStyle, fontSize: '0.78rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {formatDate(row.createdAt)}
                  </td>
                  <td style={tdStyle}>
                    <StatusSelect
                      label={`Status for ${row.name || 'enquiry'}`}
                      value={row.status}
                      statuses={ENQUIRY_STATUSES}
                      disabled={updatingId === String(row.id)}
                      onChange={(status) => onStatusChange(row.id, status)}
                    />
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </>
      )}
    </>
  )
}
