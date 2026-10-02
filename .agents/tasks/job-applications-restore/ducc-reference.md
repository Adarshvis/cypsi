# DUCC reference (verbatim)

## src/collections/JobApplications.ts
```tsx
import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'
import { adminAccess } from '../access/roles'

const autoDeleteWhenMarkedDeleted: CollectionAfterChangeHook = async ({
  doc,
  operation,
  previousDoc,
  req,
}) => {
  if (operation !== 'update') return
  if (doc?.status !== 'deleted') return
  if (previousDoc?.status === 'deleted') return

  try {
    const resumeValue = doc?.resume as unknown
    let resumeId: number | string | null = null

    if (typeof resumeValue === 'number' || typeof resumeValue === 'string') {
      resumeId = resumeValue
    } else if (
      resumeValue &&
      typeof resumeValue === 'object' &&
      'id' in (resumeValue as Record<string, unknown>)
    ) {
      const maybeId = (resumeValue as { id?: number | string }).id
      if (typeof maybeId === 'number' || typeof maybeId === 'string') {
        resumeId = maybeId
      }
    }

    // Delete linked resume first so there is no orphan file on disk.
    if (resumeId !== null) {
      await req.payload.delete({
        collection: 'resumes',
        id: resumeId,
        overrideAccess: true,
      })
    }

    await req.payload.delete({
      collection: 'job-applications',
      id: doc.id,
      overrideAccess: true,
    })
  } catch (err) {
    req.payload.logger.error(`Failed auto-delete for job application ${String(doc?.id)}: ${String(err)}`)
  }
}

export const JobApplications: CollectionConfig = {
  slug: 'job-applications',
  labels: {
    singular: 'Software Request',
    plural: 'Software Requests',
  },
  admin: {
    useAsTitle: 'applicantName',
    group: 'Software Requests',
    defaultColumns: ['applicantName', 'email', 'jobTitle', 'status', 'createdAt'],
    description: 'Software access requests from users',
    hidden: true,
  },
  access: {
    // Anyone can submit an application
    create: () => true,
    // Only admins can view, update, delete
    read: adminAccess,
    update: adminAccess,
    delete: adminAccess,
  },
  hooks: {
    afterChange: [autoDeleteWhenMarkedDeleted],
  },
  fields: [
    {
      name: 'applicantName',
      type: 'text',
      label: 'Full Name',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Mobile',
    },
    {
      name: 'jobTitle',
      type: 'text',
      label: 'Software / Service Requested',
      required: true,
      admin: {
        description: 'The software or IT service the user is requesting access to',
      },
    },
    {
      name: 'requestType',
      type: 'select',
      label: 'Request Type',
      defaultValue: 'software',
      required: true,
      options: [
        { label: 'Software Access', value: 'software' },
        { label: 'IT Service', value: 'it-service' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Whether this is a software access request or an IT service request',
      },
    },
    {
      name: 'currentAddress',
      type: 'text',
      label: 'Department / College',
      admin: {
        description: 'Department or college of the requester',
      },
    },
    {
      name: 'permanentAddress',
      type: 'text',
      label: 'Designation',
      admin: {
        description: 'e.g. Professor, Research Scholar, Lab Assistant',
      },
    },
    {
      name: 'highestQualification',
      type: 'text',
      label: 'Purpose',
      admin: {
        description: 'Why they need access to this software',
      },
    },
    {
      name: 'workStatus',
      type: 'select',
      label: 'I am',
      options: [
        { label: 'Student', value: 'student' },
        { label: 'PhD Scholar', value: 'phd_scholar' },
        { label: 'Faculty Members', value: 'faculty' },
        { label: 'Non Teaching Staff', value: 'admin_staff' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'yearOfExperience',
      type: 'text',
      label: 'Additional Notes',
      admin: {
        description: 'Any additional information',
      },
    },
    {
      name: 'resume',
      type: 'relationship',
      label: 'Attachment',
      relationTo: 'resumes',
      admin: {
        description: 'Optional document upload',
        condition: () => false,
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Request Status',
      defaultValue: 'new',
      required: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Reviewed', value: 'reviewed' },
        { label: 'Approved', value: 'shortlisted' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Delete', value: 'deleted' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      label: 'Submitted At',
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
}

```

## src/collections/Resumes.ts
```tsx
import type { CollectionConfig } from 'payload'
import { adminAccess } from '../access/roles'

const resumesUploadDir = process.env.CMS_RESUMES_UPLOAD_DIR || 'resumes'

export const Resumes: CollectionConfig = {
  slug: 'resumes',
  labels: {
    singular: 'Resume',
    plural: 'Resumes',
  },
  admin: {
    group: 'Job Applications',
    description: 'Uploaded resume/CV files from job applicants',
    defaultColumns: ['filename', 'mimeType', 'filesize', 'createdAt'],
    hidden: true,
  },
  access: {
    // Anyone can upload (needed for public form submission)
    create: () => true,
    // Only admins can view, update, delete
    read: adminAccess,
    update: adminAccess,
    delete: adminAccess,
  },
  upload: {
    staticDir: resumesUploadDir,
    mimeTypes: ['application/pdf'],
  },
  fields: [
    {
      name: 'applicantName',
      type: 'text',
      admin: {
        description: 'Name of the applicant who uploaded this resume',
      },
    },
  ],
}

```

## src/components/admin/ApplicationsDashboard/index.tsx
```tsx
import { getPayload } from 'payload'
import config from '@/payload.config'
import ApplicationsDashboardClient from './ApplicationsDashboardClient'

export default async function ApplicationsDashboardView() {
  const payload = await getPayload({ config })

  const applications = await payload.find({
    collection: 'job-applications' as any,
    overrideAccess: true,
    depth: 1,
    limit: 200,
    sort: '-createdAt',
  })

  const docs = applications.docs as any[]

  // Compute stats
  const total = docs.length
  const statusCounts = docs.reduce(
    (acc: Record<string, number>, doc: any) => {
      const s = doc.status || 'new'
      acc[s] = (acc[s] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <ApplicationsDashboardClient
      applications={docs}
      stats={{
        total,
        new: statusCounts['new'] || 0,
        reviewed: statusCounts['reviewed'] || 0,
        shortlisted: statusCounts['shortlisted'] || 0,
        rejected: statusCounts['rejected'] || 0,
      }}
    />
  )
}

```

## src/components/admin/ApplicationsDashboard/ApplicationsDashboardClient.tsx
```tsx
'use client'

import React, { useState, useTransition } from 'react'

interface Application {
  id: string
  applicantName?: string | null
  email?: string | null
  phone?: string | null
  jobTitle?: string | null
  highestQualification?: string | null
  workStatus?: string | null
  status?: string | null
  createdAt?: string | null
  resume?: { id: string; filename?: string | null; url?: string | null } | null
  extraData?: Record<string, unknown> | null
}

const ROLE_LABELS: Record<string, string> = {
  student: 'Student',
  phd_scholar: 'PhD Scholar',
  faculty: 'Faculty Members',
  admin_staff: 'Non Teaching Staff',
  researcher: 'Researcher',
  other: 'Other',
  fresher: 'Fresher',
  experienced: 'Experienced',
}

function getRoleLabel(app: Application): string {
  if (app.workStatus) return ROLE_LABELS[app.workStatus] || app.workStatus
  return getHighestQualification(app)
}

interface Stats {
  total: number
  new: number
  reviewed: number
  shortlisted: number
  rejected: number
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: '#3b82f6', bg: '#eff6ff' },
  { value: 'reviewed', label: 'Reviewed', color: '#f59e0b', bg: '#fffbeb' },
  { value: 'shortlisted', label: 'Shortlisted', color: '#10b981', bg: '#f0fdf4' },
  { value: 'rejected', label: 'Rejected', color: '#ef4444', bg: '#fef2f2' },
  { value: 'deleted', label: 'Delete', color: '#7f1d1d', bg: '#fee2e2' },
]

function getStatusStyle(status: string | null | undefined) {
  return (
    STATUS_OPTIONS.find((s) => s.value === status) || {
      color: '#6b7280',
      bg: '#f9fafb',
      label: status || 'Unknown',
    }
  )
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  const d = new Date(iso)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${String(d.getUTCDate()).padStart(2, '0')} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

function getHighestQualification(app: Application): string {
  const direct = app.highestQualification
  if (typeof direct === 'string' && direct.trim()) return direct.trim()

  const extra = app.extraData
  if (!extra || typeof extra !== 'object') return '—'

  const candidates = [
    'highestQualification',
    'highest_qualification',
    'highest qualification',
    'highestEducation',
    'qualification',
  ]

  for (const key of candidates) {
    const value = (extra as Record<string, unknown>)[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return '—'
}

function flattenExportRecord(value: unknown, prefix = '', out: Record<string, string> = {}) {
  if (value === null || value === undefined) {
    if (prefix) out[prefix] = ''
    return out
  }

  if (Array.isArray(value)) {
    out[prefix] = value
      .map((item) => (typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item)))
      .join(' | ')
    return out
  }

  if (typeof value === 'object') {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      const nextPrefix = prefix ? `${prefix}.${key}` : key
      flattenExportRecord(nested, nextPrefix, out)
    }
    return out
  }

  out[prefix] = String(value)
  return out
}

function csvEscape(value: string) {
  const needsQuotes = /[",\n]/.test(value)
  if (!needsQuotes) return value
  return `"${value.replace(/"/g, '""')}"`
}


export default function ApplicationsDashboardClient({
  applications: initialApplications,
  stats,
}: {
  applications: Application[]
  stats: Stats
}) {
  const [applications, setApplications] = useState<Application[]>(initialApplications)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = applications.filter((app) => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      app.applicantName?.toLowerCase().includes(q) ||
      app.email?.toLowerCase().includes(q) ||
      app.jobTitle?.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  function handleStatusChange(id: string, newStatus: string) {
    startTransition(async () => {
      const endpoint = `/api/job-applications/${id}`
      const res =
        newStatus === 'deleted'
          ? await fetch(endpoint, {
              method: 'DELETE',
              credentials: 'include',
            })
          : await fetch(endpoint, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus }),
              credentials: 'include',
            })

      if (!res.ok) {
        throw new Error(`Status update failed: ${res.status}`)
      }

      setApplications((prev) => {
        if (newStatus === 'deleted') {
          return prev.filter((app) => app.id !== id)
        }
        return prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      })
    })
  }

  const statCards = [
    { label: 'Total Requests', value: stats.total, color: '#1e3a5f', icon: '📋' },
    { label: 'New', value: stats.new, color: '#3b82f6', icon: '🆕' },
    { label: 'Approved', value: stats.shortlisted, color: '#10b981', icon: '✅' },
    { label: 'Reviewed', value: stats.reviewed, color: '#f59e0b', icon: '👀' },
    { label: 'Rejected', value: stats.rejected, color: '#ef4444', icon: '❌' },
  ]

  function downloadFile(content: string, fileName: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function handleExport(format: 'csv' | 'excel') {
    if (!applications.length) return

    const flattenedRows = applications.map((app) => {
      const record = flattenExportRecord(app)
      record.role = getRoleLabel(app)
      record.software = app.jobTitle || ''
      record.requesterName = app.applicantName || ''
      if (app.createdAt) record.submittedDate = formatDate(app.createdAt)
      delete record.createdAt
      delete record.highestQualification
      delete record.applicantName
      delete record.jobTitle
      delete record.workStatus
      delete record.currentAddress
      delete record.permanentAddress
      delete record.yearOfExperience
      delete record.updatedAt
      delete record.submittedAt
      for (const key of Object.keys(record)) {
        if (key === 'resume' || key.startsWith('resume.')) {
          delete record[key]
        }
      }
      return record
    })

    const preferredHeaders = [
      'id',
      'requesterName',
      'software',
      'role',
      'email',
      'phone',
      'status',
      'submittedDate',
    ]

    const allHeaders = Array.from(
      new Set(flattenedRows.flatMap((row) => Object.keys(row))),
    ).filter((h) => h !== 'resume' && !h.startsWith('resume.'))

    const orderedHeaders = [
      ...preferredHeaders.filter((h) => allHeaders.includes(h)),
      ...allHeaders.filter((h) => !preferredHeaders.includes(h)).sort(),
    ]

    if (format === 'csv') {
      const lines = [orderedHeaders.join(',')]
      for (const row of flattenedRows) {
        const values = orderedHeaders.map((header) => csvEscape(row[header] || ''))
        lines.push(values.join(','))
      }

      downloadFile(lines.join('\n'), `applications-${Date.now()}.csv`, 'text/csv;charset=utf-8')
      return
    }

    const tsvLines = [orderedHeaders.join('\t')]
    for (const row of flattenedRows) {
      const values = orderedHeaders.map((header) => (row[header] || '').replace(/\t/g, ' '))
      tsvLines.push(values.join('\t'))
    }

    downloadFile(
      tsvLines.join('\n'),
      `applications-${Date.now()}.xls`,
      'application/vnd.ms-excel;charset=utf-8',
    )
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'inherit' }}>
      {/* Header */}
      <div
        style={{
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#111827' }}>
            Applications Dashboard
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
            Review and manage all software access requests
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleExport('csv')}
            style={{
              background: '#f8fafc',
              color: '#1e3a5f',
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #dce4ef',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Export CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            style={{
              background: '#f8fafc',
              color: '#1e3a5f',
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #dce4ef',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Export Excel
          </button>
          <button
            onClick={() => window.open('/admin/collections/job-applications/create', '_self')}
            style={{
              background: '#1e3a5f',
              color: '#fff',
              padding: '0.6rem 1.25rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            + New Application
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              padding: '1.25rem 1rem',
              textAlign: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{card.icon}</div>
            <div
              style={{ fontSize: '2rem', fontWeight: 800, color: card.color, lineHeight: 1 }}
            >
              {card.value}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.3rem' }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, email or software..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            padding: '0.55rem 0.875rem',
            fontSize: '0.875rem',
            outline: 'none',
            color: '#111827',
          }}
        />

        {/* Status filter */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'new', 'reviewed', 'shortlisted', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: filterStatus === s ? '#1e3a5f' : '#d1d5db',
                background: filterStatus === s ? '#1e3a5f' : '#f9fafb',
                color: filterStatus === s ? '#fff' : '#374151',
                fontWeight: filterStatus === s ? 600 : 400,
                fontSize: '0.8rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {s === 'all' ? 'All' : s === 'shortlisted' ? 'Approved' : s}
            </button>
          ))}
        </div>

        <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '1rem',
            }}
          >
            No applications found.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Requester', 'Software', 'Contact', 'Role', 'Status', 'Attachment'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((app, idx) => {
                const statusStyle = getStatusStyle(app.status)
                return (
                  <tr
                    key={app.id}
                    style={{
                      borderBottom: idx < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.background = '#f9fafb')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.background = '#fff')
                    }
                  >
                    {/* Applicant */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: '#111827',
                          fontSize: '0.9rem',
                        }}
                      >
                        {app.applicantName || '—'}
                      </div>
                    </td>

                    {/* Position */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          color: '#374151',
                        }}
                      >
                        {app.jobTitle || '—'}
                      </span>
                    </td>

                    {/* Contact */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#374151' }}>{app.email}</div>
                      {app.phone && (
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{app.phone}</div>
                      )}
                    </td>

                    {/* Highest Qualification */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        {getRoleLabel(app)}
                      </span>
                    </td>

                    {/* Status dropdown */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <select
                        value={app.status || 'new'}
                        disabled={isPending}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        style={{
                          border: `1px solid ${statusStyle.color}`,
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          fontWeight: 600,
                          fontSize: '0.78rem',
                          padding: '0.3rem 0.6rem',
                          borderRadius: '999px',
                          cursor: 'pointer',
                          outline: 'none',
                          textTransform: 'capitalize',
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Resume */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {app.resume?.url ? (
                        <a
                          href={app.resume.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            background: '#f0f4f8',
                            color: '#1e3a5f',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            border: '1px solid #dce4ef',
                          }}
                        >
                          ↓ Download
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>No file</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

```

## src/components/admin/ApplicationsDashboardCard.tsx
```tsx
'use client'

import React, { useState, useCallback } from 'react'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: '#3b82f6', bg: '#eff6ff' },
  { value: 'reviewed', label: 'Reviewed', color: '#f59e0b', bg: '#fffbeb' },
  { value: 'shortlisted', label: 'Approved', color: '#10b981', bg: '#f0fdf4' },
  { value: 'rejected', label: 'Rejected', color: '#ef4444', bg: '#fef2f2' },
  { value: 'deleted', label: 'Delete', color: '#7f1d1d', bg: '#fee2e2' },
]

function getStatusStyle(status: string | null | undefined) {
  return (
    STATUS_OPTIONS.find((s) => s.value === status) || {
      color: '#6b7280',
      bg: '#f9fafb',
      label: status || 'Unknown',
    }
  )
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  const d = new Date(iso)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${String(d.getUTCDate()).padStart(2, '0')} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

interface Application {
  id: string
  applicantName?: string | null
  email?: string | null
  phone?: string | null
  jobTitle?: string | null
  highestQualification?: string | null
  workStatus?: string | null
  requestType?: string | null
  status?: string | null
  createdAt?: string | null
  resume?: { id: string; filename?: string | null; url?: string | null } | null
  extraData?: Record<string, unknown> | null
}

const ROLE_LABELS: Record<string, string> = {
  student: 'Student',
  phd_scholar: 'PhD Scholar',
  faculty: 'Faculty Members',
  admin_staff: 'Non Teaching Staff',
  researcher: 'Researcher',
  other: 'Other',
  fresher: 'Fresher',
  experienced: 'Experienced',
}

function getRoleLabel(app: Application): string {
  if (app.workStatus) return ROLE_LABELS[app.workStatus] || app.workStatus
  return getHighestQualification(app)
}

function getHighestQualification(app: Application): string {
  const direct = app.highestQualification
  if (typeof direct === 'string' && direct.trim()) return direct.trim()
  const extra = app.extraData
  if (!extra || typeof extra !== 'object') return '—'
  const candidates = ['highestQualification', 'highest_qualification', 'qualification']
  for (const key of candidates) {
    const value = (extra as Record<string, unknown>)[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return '—'
}

function flattenExportRecord(value: unknown, prefix = '', out: Record<string, string> = {}) {
  if (value === null || value === undefined) { if (prefix) out[prefix] = ''; return out }
  if (Array.isArray(value)) { out[prefix] = value.map((item) => (typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item))).join(' | '); return out }
  if (typeof value === 'object') { for (const [key, nested] of Object.entries(value as Record<string, unknown>)) { flattenExportRecord(nested, prefix ? `${prefix}.${key}` : key, out) } return out }
  out[prefix] = String(value); return out
}

function csvEscape(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

type TabType = 'software' | 'it-service'

const TAB_CONFIG: Record<TabType, { label: string; itemLabel: string; description: string }> = {
  'software': { label: 'Software Requests', itemLabel: 'Software', description: 'Review and manage software access requests' },
  'it-service': { label: 'IT Service Requests', itemLabel: 'Service', description: 'Review and manage IT service requests' },
}

export default function ApplicationsWidget() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('software')
  const [loading, setLoading] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/job-applications?limit=500&sort=-createdAt&depth=1', { credentials: 'include' })
      const data = await res.json()
      setApplications(data.docs || [])
    } catch { setApplications([]) }
    finally { setLoading(false) }
  }, [])

  function handleToggle() {
    if (!open) fetchApplications()
    setOpen((v) => !v)
  }

  function handleTabChange(tab: TabType) {
    setActiveTab(tab)
    setSearch('')
    setFilterStatus('all')
  }

  async function handleStatusChange(id: string, status: string) {
    setUpdating(id)
    try {
      const endpoint = `/api/job-applications/${id}`
      const res = status === 'deleted'
        ? await fetch(endpoint, { method: 'DELETE', credentials: 'include' })
        : await fetch(endpoint, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status }) })
      if (!res.ok) throw new Error(`Status update failed: ${res.status}`)
      setApplications((prev) => status === 'deleted' ? prev.filter((app) => app.id !== id) : prev.map((app) => (app.id === id ? { ...app, status } : app)))
    } finally { setUpdating(null) }
  }

  // Filter by tab (requestType) — existing records without requestType default to 'software'
  const tabApps = applications.filter((app) => {
    const type = app.requestType || 'software'
    return type === activeTab
  })

  const filtered = tabApps.filter((app) => {
    const matchStatus = filterStatus === 'all' || app.status === filterStatus
    const q = search.toLowerCase()
    const matchSearch = !q || app.applicantName?.toLowerCase().includes(q) || app.email?.toLowerCase().includes(q) || app.jobTitle?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const stats = {
    total: tabApps.length,
    new: tabApps.filter((a) => a.status === 'new').length,
    reviewed: tabApps.filter((a) => a.status === 'reviewed').length,
    shortlisted: tabApps.filter((a) => a.status === 'shortlisted').length,
    rejected: tabApps.filter((a) => a.status === 'rejected').length,
  }

  const tabConfig = TAB_CONFIG[activeTab]

  function downloadFile(content: string, fileName: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }

  function handleExport(format: 'csv' | 'excel') {
    if (!tabApps.length) return
    const flattenedRows = tabApps.map((app) => {
      const record = flattenExportRecord(app)
      record.role = getRoleLabel(app)
      record[activeTab === 'it-service' ? 'service' : 'software'] = app.jobTitle || ''
      record.requesterName = app.applicantName || ''
      if (app.createdAt) record.submittedDate = formatDate(app.createdAt)
      for (const key of ['createdAt','highestQualification','applicantName','jobTitle','workStatus','currentAddress','permanentAddress','yearOfExperience','updatedAt','submittedAt','requestType']) delete record[key]
      for (const key of Object.keys(record)) { if (key === 'resume' || key.startsWith('resume.')) delete record[key] }
      return record
    })
    const itemCol = activeTab === 'it-service' ? 'service' : 'software'
    const preferredHeaders = ['id', 'requesterName', itemCol, 'role', 'email', 'phone', 'status', 'submittedDate']
    const allHeaders = Array.from(new Set(flattenedRows.flatMap((row) => Object.keys(row)))).filter((h) => h !== 'resume' && !h.startsWith('resume.'))
    const orderedHeaders = [...preferredHeaders.filter((h) => allHeaders.includes(h)), ...allHeaders.filter((h) => !preferredHeaders.includes(h)).sort()]

    if (format === 'csv') {
      const lines = [orderedHeaders.join(',')]
      for (const row of flattenedRows) lines.push(orderedHeaders.map((h) => csvEscape(row[h] || '')).join(','))
      downloadFile(lines.join('\n'), `${activeTab}-requests-${Date.now()}.csv`, 'text/csv;charset=utf-8')
    } else {
      const lines = [orderedHeaders.join('\t')]
      for (const row of flattenedRows) lines.push(orderedHeaders.map((h) => (row[h] || '').replace(/\t/g, ' ')).join('\t'))
      downloadFile(lines.join('\n'), `${activeTab}-requests-${Date.now()}.xls`, 'application/vnd.ms-excel;charset=utf-8')
    }
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--theme-text, #1f2937)' }}>
        Request Management
      </h2>

      <button
        onClick={handleToggle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem', width: '220px',
          background: open ? 'var(--theme-elevation-100, #f3f4f6)' : 'var(--theme-elevation-50, #f9fafb)',
          border: `1px solid ${open ? 'var(--theme-elevation-300, #d1d5db)' : 'var(--theme-elevation-150, #e5e7eb)'}`,
          borderRadius: '0.5rem', color: 'var(--theme-text, #111827)', fontWeight: 500, fontSize: '0.95rem',
          cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s', textAlign: 'left',
        }}
      >
        <span>Requests Dashboard</span>
        <span style={{ fontSize: '1.1rem', color: 'var(--theme-elevation-400, #9ca3af)', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>+</span>
      </button>

      {open && (
        <div style={{ marginTop: '1.5rem', border: '1px solid var(--theme-elevation-150, #e5e7eb)', borderRadius: '0.75rem', background: 'var(--theme-bg, #fff)', overflow: 'hidden' }}>

          {/* ── Tabs ── */}
          <div style={{ display: 'flex', borderBottom: '2px solid var(--theme-elevation-100, #f3f4f6)' }}>
            {(Object.keys(TAB_CONFIG) as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                style={{
                  flex: 1, padding: '0.85rem 1rem', fontSize: '0.88rem', fontWeight: activeTab === tab ? 700 : 500,
                  color: activeTab === tab ? '#1e3a5f' : '#6b7280',
                  background: activeTab === tab ? '#fff' : 'var(--theme-elevation-50, #f9fafb)',
                  border: 'none', borderBottom: activeTab === tab ? '3px solid #1e3a5f' : '3px solid transparent',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                }}
              >
                {TAB_CONFIG[tab].label}
                <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', background: activeTab === tab ? '#1e3a5f' : '#e5e7eb', color: activeTab === tab ? '#fff' : '#6b7280', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>
                  {applications.filter((a) => (a.requestType || 'software') === tab).length}
                </span>
              </button>
            ))}
          </div>

          {/* ── Dashboard header ── */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--theme-elevation-100, #f3f4f6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{tabConfig.label}</h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#6b7280' }}>{tabConfig.description}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => handleExport('csv')} style={{ background: '#f8fafc', color: '#1e3a5f', border: '1px solid #dce4ef', borderRadius: '0.375rem', padding: '0.45rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Export CSV</button>
              <button onClick={() => handleExport('excel')} style={{ background: '#f8fafc', color: '#1e3a5f', border: '1px solid #dce4ef', borderRadius: '0.375rem', padding: '0.45rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Export Excel</button>
              <button onClick={() => fetchApplications()} style={{ background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '0.375rem', padding: '0.45rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>↻ Refresh</button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading requests...</div>
          ) : (
            <>
              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0', borderBottom: '1px solid var(--theme-elevation-100, #f3f4f6)' }}>
                {[
                  { label: 'Total', value: stats.total, color: '#1e3a5f' },
                  { label: 'New', value: stats.new, color: '#3b82f6' },
                  { label: 'Approved', value: stats.shortlisted, color: '#10b981' },
                  { label: 'Reviewed', value: stats.reviewed, color: '#f59e0b' },
                  { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
                ].map((s, i, arr) => (
                  <div key={s.label} style={{ padding: '1rem', textAlign: 'center', borderRight: i < arr.length - 1 ? '1px solid var(--theme-elevation-100, #f3f4f6)' : 'none' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '0.73rem', color: '#6b7280', marginTop: '0.2rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--theme-elevation-100, #f3f4f6)', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder={`Search by name, email or ${tabConfig.itemLabel.toLowerCase()}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ flex: 1, minWidth: '180px', border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.45rem 0.75rem', fontSize: '0.82rem', outline: 'none', fontFamily: 'inherit' }}
                />
                {['all', 'new', 'reviewed', 'shortlisted', 'rejected'].map((s) => (
                  <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '0.35rem 0.75rem', borderRadius: '999px', border: '1px solid', borderColor: filterStatus === s ? '#1e3a5f' : '#d1d5db', background: filterStatus === s ? '#1e3a5f' : 'transparent', color: filterStatus === s ? '#fff' : '#374151', fontWeight: filterStatus === s ? 600 : 400, fontSize: '0.75rem', cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'inherit' }}>
                    {s === 'all' ? 'All' : s === 'shortlisted' ? 'Approved' : s}
                  </button>
                ))}
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Table */}
              {filtered.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>No {tabConfig.itemLabel.toLowerCase()} requests found.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Requester', tabConfig.itemLabel, 'Contact', 'Role', 'Status', 'Attachment'].map((h) => (
                          <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((app, idx) => {
                        const statusStyle = getStatusStyle(app.status)
                        return (
                          <tr key={app.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.875rem' }}>{app.applicantName || '—'}</td>
                            <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#374151' }}>{app.jobTitle || '—'}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <div style={{ fontSize: '0.78rem', color: '#374151' }}>{app.email}</div>
                              {app.phone && <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{app.phone}</div>}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#6b7280' }}>{getRoleLabel(app)}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <select
                                value={app.status || 'new'}
                                disabled={updating === app.id}
                                onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                style={{ border: `1px solid ${statusStyle.color}`, background: statusStyle.bg, color: statusStyle.color, fontWeight: 600, fontSize: '0.72rem', padding: '0.28rem 0.55rem', borderRadius: '999px', cursor: 'pointer', outline: 'none', textTransform: 'capitalize', fontFamily: 'inherit' }}
                              >
                                {STATUS_OPTIONS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                              </select>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              {app.resume?.url ? (
                                <a href={app.resume.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#f0f4f8', color: '#1e3a5f', padding: '0.3rem 0.65rem', borderRadius: '0.375rem', fontSize: '0.72rem', fontWeight: 600, textDecoration: 'none', border: '1px solid #dce4ef' }}>↓ Download</a>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>No file</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

```

## src/app/api/apply/route.ts
```tsx
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const getValue = (keys: string[]): string => {
      for (const key of keys) {
        const value = formData.get(key)
        if (typeof value === 'string' && value.trim()) return value.trim()
      }
      return ''
    }

    const applicantName = getValue(['applicantName', 'fullName', 'name'])
    const email = getValue(['email'])
    const phone = getValue(['phone', 'phoneNumber', 'mobile', 'mobileNumber'])
    const jobTitle = getValue(['jobTitle', 'applyingFor', 'positionApplyingFor', 'position', 'role'])
    const currentAddress = getValue(['currentAddress', 'current_address', 'current-address'])
    const permanentAddress = getValue(['permanentAddress', 'permanent_address', 'permanent-address'])
    const highestQualification = getValue(['highestQualification', 'highest_qualification', 'qualification'])
    const workStatus = getValue(['workStatus', 'work_status', 'work-status'])
    const yearOfExperience = getValue(['yearOfExperience', 'year_of_experience', 'yearsOfExperience'])
    const file = formData.get('resume') as File | null

    // Basic validation
    if (!applicantName || !email || !jobTitle || !file) {
      return NextResponse.json(
        { error: 'Name, email, position, and resume are required.' },
        { status: 400 },
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are accepted.' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 5 MB.' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Convert File to Buffer for Payload upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload the resume file to the Resumes collection
    const resumeDoc = await payload.create({
      collection: 'resumes' as any,
      data: {
        applicantName,
        alt: `Resume - ${applicantName}`,
      },
      file: {
        data: buffer,
        mimetype: 'application/pdf',
        name: `${applicantName.replace(/\s+/g, '_')}_resume.pdf`,
        size: file.size,
      },
      overrideAccess: true,
    })

    // Create the job application record with all fields
    await payload.create({
      collection: 'job-applications' as any,
      data: {
        applicantName,
        email,
        phone: phone || undefined,
        jobTitle,
        currentAddress: currentAddress || undefined,
        permanentAddress: permanentAddress || undefined,
        highestQualification: highestQualification || undefined,
        workStatus: workStatus ? workStatus.toLowerCase() : undefined,
        yearOfExperience: yearOfExperience || undefined,
        resume: resumeDoc.id,
        status: 'new',
        submittedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Apply API error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

```

## src/app/api/request-access/route.ts
```tsx
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

// Valid values for the workStatus select field
const VALID_WORK_STATUS = ['student', 'phd_scholar', 'faculty', 'admin_staff', 'researcher', 'other']

// Map display labels to values
const ROLE_LABEL_MAP: Record<string, string> = {
  'student': 'student',
  'phd scholar': 'phd_scholar',
  'phd_scholar': 'phd_scholar',
  'faculty': 'faculty',
  'faculty members': 'faculty',
  'non teaching staff': 'admin_staff',
  'non-teaching staff': 'admin_staff',
  'administrative staff': 'admin_staff',
  'admin staff': 'admin_staff',
  'admin_staff': 'admin_staff',
  'researcher': 'researcher',
  'other': 'other',
}

function normalizeRole(value: string): string | undefined {
  if (!value) return undefined
  const lower = value.toLowerCase().trim()
  if (VALID_WORK_STATUS.includes(lower)) return lower
  return ROLE_LABEL_MAP[lower] || undefined
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { fullName, email, mobile, role, software, service, requestType: reqType, ...extraFields } = body

    const isServiceRequest = reqType === 'it-service' || !!service
    const itemName = isServiceRequest ? (service || software) : software

    if (!itemName) {
      return NextResponse.json(
        { error: 'Software or service name is required.' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Build the data object with known fields
    const data: Record<string, unknown> = {
      applicantName: fullName || '',
      email: email || '',
      phone: mobile || '',
      jobTitle: itemName,
      requestType: isServiceRequest ? 'it-service' : 'software',
      status: 'new',
    }

    // Only set workStatus if it's a valid option
    const normalizedRole = normalizeRole(role || '')
    if (normalizedRole) {
      data.workStatus = normalizedRole
    }

    // Store any extra form fields in available collection fields
    // This allows admin to add new fields in the form builder
    // and they'll be stored in the matching collection field if it exists
    if (extraFields && typeof extraFields === 'object') {
      const fieldMap: Record<string, string> = {
        department: 'currentAddress',
        college: 'currentAddress',
        designation: 'permanentAddress',
        purpose: 'highestQualification',
        notes: 'yearOfExperience',
        additionalNotes: 'yearOfExperience',
      }

      for (const [key, value] of Object.entries(extraFields)) {
        if (typeof value !== 'string' || !value.trim()) continue
        const mappedField = fieldMap[key]
        if (mappedField && !data[mappedField]) {
          data[mappedField] = value.trim()
        }
      }
    }

    await payload.create({
      collection: 'job-applications',
      data: data as any,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, message: 'Request submitted successfully.' })
  } catch (err) {
    console.error('Request access error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}

```

## payload.config.ts (relevant lines)
```ts

  payload.config.ts:18:import { Pages } from './collections/Pages'
  payload.config.ts:19:import { News } from './collections/News'
> payload.config.ts:20:import { Resumes } from './collections/Resumes'
> payload.config.ts:21:import { JobApplications } from './collections/JobApplications'
  payload.config.ts:22:import { Software } from './collections/Software'
  payload.config.ts:23:import { Projects } from './collections/Projects'
  payload.config.ts:24:import { Trainings } from './collections/Trainings'
  payload.config.ts:25:import { TeamPage } from './collections/TeamPage'
  payload.config.ts:52:    payload.logger.info(`[DB] CMS_DATABASE_URL=${maskDatabaseUrl(databaseUrl)}`)
  payload.config.ts:53:  },
> payload.config.ts:54:  admin: {
  payload.config.ts:55:    user: Users.slug,
  payload.config.ts:56:    importMap: {
  payload.config.ts:57:      baseDir: path.resolve(dirname),
  payload.config.ts:58:    },
> payload.config.ts:59:    components: {
> payload.config.ts:60:      afterDashboard: ['@/components/admin/ApplicationsDashboardCard#default'],
  payload.config.ts:61:    },
  payload.config.ts:62:  },
> payload.config.ts:63:  collections: [Users, Media, Pages, News, Resumes, JobApplications, Software, Projects, Trainings, TeamPage],
  payload.config.ts:64:  globals: [SiteSettings, Header, Footer],
  payload.config.ts:65:  editor: lexicalEditor({
  payload.config.ts:66:    features: ({ defaultFeatures }) => [
  payload.config.ts:67:      ...defaultFeatures,
  payload.config.ts:98:      redirectRelationships: ['pages'],
  payload.config.ts:99:      fields: {
> payload.config.ts:100:        resumeUpload: {
> payload.config.ts:101:          slug: 'resumeUpload',
  payload.config.ts:102:          labels: {
> payload.config.ts:103:            singular: 'Resume Upload',
> payload.config.ts:104:            plural: 'Resume Upload Fields',
  payload.config.ts:105:          },
  payload.config.ts:106:          fields: [
  payload.config.ts:107:            {
  payload.config.ts:108:              type: 'row',
  payload.config.ts:113:                  label: 'Name (lowercase, no special characters)',
  payload.config.ts:114:                  required: true,
> payload.config.ts:115:                  admin: {
  payload.config.ts:116:                    width: '50%',
  payload.config.ts:117:                  },
  payload.config.ts:118:                },
  payload.config.ts:119:                {
  payload.config.ts:122:                  label: 'Label',
  payload.config.ts:123:                  localized: true,
> payload.config.ts:124:                  admin: {
  payload.config.ts:125:                    width: '50%',
  payload.config.ts:126:                  },
  payload.config.ts:127:                },
  payload.config.ts:128:              ],
  payload.config.ts:136:                  label: 'Accepted MIME Types',
  payload.config.ts:137:                  defaultValue: 'application/pdf',
> payload.config.ts:138:                  admin: {
  payload.config.ts:139:                    width: '50%',
  payload.config.ts:140:                    description: 'Comma-separated list, e.g. application/pdf,image/*',
  payload.config.ts:141:                  },
  payload.config.ts:142:                },
  payload.config.ts:148:                  min: 1,
  payload.config.ts:149:                  max: 20,
> payload.config.ts:150:                  admin: {
  payload.config.ts:151:                    width: '50%',
  payload.config.ts:152:                  },
  payload.config.ts:153:                },
  payload.config.ts:154:              ],
  payload.config.ts:183:          })
  payload.config.ts:184:        },
> payload.config.ts:185:        admin: {
  payload.config.ts:186:          hidden: true,
  payload.config.ts:187:        },
  payload.config.ts:188:      },
  payload.config.ts:189:      formSubmissionOverrides: {
> payload.config.ts:190:        admin: {
  payload.config.ts:191:          hidden: true,
  payload.config.ts:192:        },
  payload.config.ts:193:      },
  payload.config.ts:194:    }),
  payload.config.ts:195:    imageOptimizer({
> payload.config.ts:196:      collections: {
  payload.config.ts:197:        media: true,
  payload.config.ts:198:      },
  payload.config.ts:199:      format: { format: 'webp', quality: 85 },
  payload.config.ts:200:      maxDimensions: { width: 2560, height: 2560 },



```

## Frontend usages of /api/apply
```n
app\(frontend)\components\blocks\FormBuilderEmbed.tsx:422:        res = await fetch('/api/apply', {
app\api\apply\route.ts:68:      collection: 'job-applications' as any,
app\api\request-access\route.ts:88:      collection: 'job-applications',
components\admin\ApplicationsDashboard\ApplicationsDashboardClient.tsx:148:      const endpoint = `/api/job-applications/${id}`
components\admin\ApplicationsDashboard\ApplicationsDashboardClient.tsx:321:            onClick={() => window.open('/admin/collections/job-applications/create', '_self')}
components\admin\ApplicationsDashboard\index.tsx:9:    collection: 'job-applications' as any,
components\admin\ApplicationsDashboardCard.tsx:104:      const res = await fetch('/api/job-applications?limit=500&sort=-createdAt&depth=1', { credentials: 'include' })
components\admin\ApplicationsDashboardCard.tsx:125:      const endpoint = `/api/job-applications/${id}`



```


## payload.config.ts lines 53-180 (admin.components.afterDashboard registration + formBuilder resumeUpload custom field)
```ts
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      afterDashboard: ['@/components/admin/ApplicationsDashboardCard#default'],
    },
  },
  collections: [Users, Media, Pages, News, Resumes, JobApplications, Software, Projects, Trainings, TeamPage],
  globals: [SiteSettings, Header, Footer],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      AlignFeature(),
      TextStateFeature({
        state: {
          fontSize: {
            sm: { label: 'Small', css: { 'font-size': '0.875rem' } },
            base: { label: 'Normal', css: { 'font-size': '1rem' } },
            lg: { label: 'Large', css: { 'font-size': '1.125rem' } },
            xl: { label: 'XL', css: { 'font-size': '1.25rem' } },
            '2xl': { label: '2XL', css: { 'font-size': '1.5rem' } },
          },
        },
      }),
      TextColorFeature(),
      HighlightColorFeature(),
      EXPERIMENTAL_TableFeature(),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl,
    },
    push: false,
  }),
  sharp,
  plugins: [
    formBuilderPlugin({
      redirectRelationships: ['pages'],
      fields: {
        resumeUpload: {
          slug: 'resumeUpload',
          labels: {
            singular: 'Resume Upload',
            plural: 'Resume Upload Fields',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  label: 'Name (lowercase, no special characters)',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'label',
                  type: 'text',
                  label: 'Label',
                  localized: true,
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'accept',
                  type: 'text',
                  label: 'Accepted MIME Types',
                  defaultValue: 'application/pdf',
                  admin: {
                    width: '50%',
                    description: 'Comma-separated list, e.g. application/pdf,image/*',
                  },
                },
                {
                  name: 'maxSizeMB',
                  type: 'number',
                  label: 'Max File Size (MB)',
                  defaultValue: 5,
                  min: 1,
                  max: 20,
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'helperText',
              type: 'text',
              label: 'Helper Text',
              defaultValue: 'Only PDF files accepted. Maximum size: 5 MB.',
            },
            {
              name: 'required',
              type: 'checkbox',
              label: 'Required',
              defaultValue: true,
            },
          ],
        } as any,
        payment: false,
      },
      formOverrides: {
        fields: ({ defaultFields }) => {
          return defaultFields.map((field) => {
            if ('name' in field && field.name === 'title') {
              return {
                ...field,
                required: false,
              }
            }
```

## DUCC src/app/(frontend)/components/blocks/FormBuilderEmbed.tsx (full; POSTs multipart to /api/apply ~line 422)
```tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import RichText from '../ui/RichText'
import { AlertCircle, ChevronDown, FileText, Upload, X } from 'lucide-react'

type FormField = {
  id?: string
  blockType: string
  name?: string
  label?: string
  required?: boolean
  width?: number
  defaultValue?: string | boolean | number
  options?: Array<{ label: string; value: string }>
  placeholder?: string
  message?: unknown
  helperText?: string
  accept?: string
  maxSizeMB?: number
}

type FormDoc = {
  id: string | number
  title?: string
  fields?: FormField[]
  submitButtonLabel?: string
  confirmationType?: 'message' | 'redirect'
  confirmationMessage?: unknown
  redirect?: {
    url?: string
  }
}

type SubmissionItem = {
  field: string
  value: string
}

function getFormId(form: unknown): string | null {
  if (!form) return null
  if (typeof form === 'string' || typeof form === 'number') return String(form)
  if (typeof form === 'object' && form !== null && 'id' in form) {
    const id = (form as { id?: string | number }).id
    return typeof id === 'string' || typeof id === 'number' ? String(id) : null
  }
  return null
}

function normalizeSubmissionData(values: Record<string, FormDataEntryValue>): SubmissionItem[] {
  return Object.entries(values)
    .filter(([field]) => field !== '')
    .map(([field, value]) => ({
      field,
      value: typeof value === 'string' ? value : String(value),
    }))
}

function isLexicalData(value: unknown): value is { root: unknown } {
  return typeof value === 'object' && value !== null && 'root' in value
}

function matchesAcceptedType(file: File, accept?: string): boolean {
  if (!accept || accept.trim().length === 0) return true
  const accepted = accept
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  if (accepted.length === 0) return true

  return accepted.some((rule) => {
    if (rule.endsWith('/*')) {
      const prefix = rule.slice(0, -1)
      return file.type.startsWith(prefix)
    }
    return file.type === rule
  })
}

function getSubmissionValue(values: Record<string, FormDataEntryValue>, keys: string[]): string {
  for (const key of keys) {
    const value = values[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

export default function FormBuilderEmbed({ form }: { form: unknown }) {
  const formId = getFormId(form)
  const initialFormDoc =
    typeof form === 'object' && form !== null && 'fields' in (form as object)
      ? (form as FormDoc)
      : null

  const [formDoc, setFormDoc] = useState<FormDoc | null>(initialFormDoc)
  const [loading, setLoading] = useState<boolean>(!initialFormDoc && !!formId)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [selectValues, setSelectValues] = useState<Record<string, string>>({})
  const [selectSearch, setSelectSearch] = useState<Record<string, string>>({})
  const [openSelect, setOpenSelect] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({})
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialFormDoc || !formId) return

    let active = true

    async function loadForm() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/forms/${formId}`, {
          credentials: 'same-origin',
        })

        if (!res.ok) {
          throw new Error('Failed to load form')
        }

        const data = await res.json()
        if (active) {
          setFormDoc(data)
        }
      } catch (_err) {
        if (active) {
          setError('Unable to load form right now.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadForm()

    return () => {
      active = false
    }
  }, [formId, initialFormDoc])

  const fields = useMemo(() => formDoc?.fields || [], [formDoc])
  const hasResumeUpload = useMemo(
    () => fields.some((field) => field.blockType === 'resumeUpload'),
    [fields],
  )

  useEffect(() => {
    setSelectValues((prev) => {
      const next = { ...prev }
      for (const field of fields) {
        if (field.blockType !== 'select' || !field.name) continue
        if (next[field.name] !== undefined) continue
        next[field.name] = typeof field.defaultValue === 'string' ? field.defaultValue : ''
      }
      return next
    })
  }, [fields])

  function setFileError(fieldName: string, message: string) {
    setFileErrors((prev) => ({ ...prev, [fieldName]: message }))
  }

  function clearFileError(fieldName: string) {
    setFileErrors((prev) => ({ ...prev, [fieldName]: '' }))
  }

  function handleFileChange(field: FormField, file: File | null) {
    const name = field.name || ''
    if (!name) return

    clearFileError(name)

    if (!file) {
      setSelectedFiles((prev) => ({ ...prev, [name]: null }))
      return
    }

    const maxSizeMB = typeof field.maxSizeMB === 'number' && field.maxSizeMB > 0 ? field.maxSizeMB : 5
    const maxSizeBytes = maxSizeMB * 1024 * 1024

    if (!matchesAcceptedType(file, field.accept || 'application/pdf')) {
      setFileError(name, 'Selected file type is not allowed.')
      setSelectedFiles((prev) => ({ ...prev, [name]: null }))
      return
    }

    if (file.size > maxSizeBytes) {
      setFileError(name, `File size must be under ${maxSizeMB} MB.`)
      setSelectedFiles((prev) => ({ ...prev, [name]: null }))
      return
    }

    setSelectedFiles((prev) => ({ ...prev, [name]: file }))
  }

  function removeSelectedFile(fieldName: string) {
    clearFileError(fieldName)
    setSelectedFiles((prev) => ({ ...prev, [fieldName]: null }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formDoc?.id) return

    const formElement = event.currentTarget
    const fd = new FormData(formElement)
    const values: Record<string, FormDataEntryValue> = {}

    for (const [key, value] of fd.entries()) {
      if (key) values[key] = value
    }

    const submissionData = normalizeSubmissionData(values)

    try {
      setSubmitting(true)
      setError(null)

      let res: Response

      // Software access request — route to /api/request-access
      const urlParams = new URLSearchParams(window.location.search)
      const softwareFromUrl = urlParams.get('software')
      const serviceFromUrl = urlParams.get('service')
      const isAccessRequest = softwareFromUrl || serviceFromUrl

      if (isAccessRequest) {
        const itemName = softwareFromUrl || serviceFromUrl || ''
        const requestType = serviceFromUrl ? 'it-service' : 'software'

        const getFieldValue = (field: FormField): string => {
          const fieldName = field.name || ''
          if (!fieldName) return ''
          const value = values[fieldName]
          return typeof value === 'string' ? value.trim() : ''
        }

        const matchesHint = (field: FormField, pattern: RegExp): boolean => {
          const text = `${field.name || ''} ${field.label || ''}`.toLowerCase()
          return pattern.test(text)
        }

        const fullName = (() => {
          for (const field of fields) {
            if (!matchesHint(field, /full\s*name|^name$/i)) continue
            const v = getFieldValue(field)
            if (v) return v
          }
          for (const field of fields) {
            if (field.blockType === 'text') { const v = getFieldValue(field); if (v) return v }
          }
          return ''
        })()

        const email = (() => {
          for (const field of fields) {
            if (field.blockType === 'email' || matchesHint(field, /email/i)) {
              const v = getFieldValue(field); if (v) return v
            }
          }
          return ''
        })()

        const mobile = (() => {
          for (const field of fields) {
            if (matchesHint(field, /phone|mobile/i)) { const v = getFieldValue(field); if (v) return v }
          }
          return ''
        })()

        const role = (() => {
          for (const field of fields) {
            if (matchesHint(field, /i\s*am|role|designation|i_am|iam/i)) {
              const v = getFieldValue(field); if (v) return v
            }
          }
          // Fallback: check any select field that hasn't been matched yet
          for (const field of fields) {
            if (field.blockType === 'select') {
              const v = getFieldValue(field); if (v) return v
            }
          }
          return ''
        })()

        if (!fullName) {
          setError('Full name is required.')
          return
        }

        res = await fetch('/api/request-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName,
            email,
            mobile,
            role,
            software: softwareFromUrl || undefined,
            service: serviceFromUrl || undefined,
            requestType,
            ...values,
          }),
        })
      } else if (hasResumeUpload) {
        const resumeField = fields.find((field) => field.blockType === 'resumeUpload' && field.name)
        if (!resumeField?.name) {
          setError('Resume upload field is misconfigured.')
          return
        }

        const resumeFile = selectedFiles[resumeField.name] || null
        if (resumeField.required && !resumeFile) {
          setFileError(resumeField.name, 'Please upload your resume.')
          return
        }

        const getFieldValue = (field: FormField): string => {
          const fieldName = field.name || ''
          if (!fieldName) return ''
          const value = values[fieldName]
          return typeof value === 'string' ? value.trim() : ''
        }

        const matchesHint = (field: FormField, pattern: RegExp): boolean => {
          const text = `${field.name || ''} ${field.label || ''}`.toLowerCase()
          return pattern.test(text)
        }

        const applicantName = (() => {
          for (const field of fields) {
            if (!matchesHint(field, /applicant\s*name|full\s*name|^name$/i)) continue
            const value = getFieldValue(field)
            if (value) return value
          }

          for (const field of fields) {
            if (field.blockType !== 'text') continue
            const value = getFieldValue(field)
            if (value) return value
          }

          return ''
        })()

        const email = (() => {
          for (const field of fields) {
            if (field.blockType !== 'email' && !matchesHint(field, /email/i)) continue
            const value = getFieldValue(field)
            if (value) return value
          }

          return ''
        })()

        const phone = (() => {
          for (const field of fields) {
            if (!matchesHint(field, /phone|mobile|contact\s*number/i)) continue
            const value = getFieldValue(field)
            if (value) return value
          }

          return ''
        })()

        const jobTitle = (() => {
          for (const field of fields) {
            if (field.blockType !== 'select' && field.blockType !== 'radio') continue
            const value = getFieldValue(field)
            if (value) return value
          }

          for (const field of fields) {
            if (!matchesHint(field, /job\s*title|position|role|select/i)) continue
            const value = getFieldValue(field)
            if (value) return value
          }

          return getSubmissionValue(values, ['jobTitle', 'positionApplyingFor', 'position'])
        })()

        // Extract additional fields by name/label matching
        const getFieldByHint = (pattern: RegExp): string => {
          for (const field of fields) {
            if (!matchesHint(field, pattern)) continue
            const value = getFieldValue(field)
            if (value) return value
          }
          return ''
        }

        const currentAddress = getFieldByHint(/current.?address/i)
        const permanentAddress = getFieldByHint(/permanent.?address/i)
        const highestQualification = getFieldByHint(/highest.?qualification|qualification/i)
        // Work status comes from select field; yearOfExperience from the conditional input
        const workStatus = getFieldByHint(/work.?status/i) || (values['work-status'] as string || values['workStatus'] as string || '')
        const yearOfExperience = typeof values['yearOfExperience'] === 'string' ? values['yearOfExperience'] : ''

        if (!applicantName || !email || !jobTitle || !resumeFile) {
          setError('Name, email, position, and resume are required.')
          return
        }

        const applyFormData = new FormData()
        applyFormData.append('applicantName', applicantName)
        applyFormData.append('email', email)
        applyFormData.append('phone', phone)
        applyFormData.append('jobTitle', jobTitle)
        if (currentAddress) applyFormData.append('currentAddress', currentAddress)
        if (permanentAddress) applyFormData.append('permanentAddress', permanentAddress)
        if (highestQualification) applyFormData.append('highestQualification', highestQualification)
        if (workStatus) applyFormData.append('workStatus', workStatus)
        if (yearOfExperience) applyFormData.append('yearOfExperience', yearOfExperience)
        applyFormData.append('resume', resumeFile)

        res = await fetch('/api/apply', {
          method: 'POST',
          body: applyFormData,
        })
      } else {
        res = await fetch('/api/form-submissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            form: String(formDoc.id),
            submissionData,
          }),
        })
      }

      if (!res.ok) {
        const response = await res.json().catch(() => null)
        throw new Error(response?.error || 'Submission failed')
      }

      if (formDoc.confirmationType === 'redirect' && formDoc.redirect?.url) {
        window.location.href = formDoc.redirect.url
        return
      }

      setSuccess(true)
      formElement.reset()
      setSelectedFiles({})
      setFileErrors({})
    } catch (_err) {
      const message =
        _err instanceof Error ? _err.message : 'Could not submit the form. Please try again.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!formId) return null

  if (loading) {
    return <div className="apply-form">Loading form...</div>
  }

  if (error && !formDoc) {
    return (
      <div className="apply-form">
        <div className="apply-form__error-banner">{error}</div>
      </div>
    )
  }

  if (!formDoc) return null

  return (
    <div className="apply-form">
      {formDoc.title ? (
        <h3 className="apply-page__title" style={{ marginBottom: '0' }}>
          {formDoc.title}
        </h3>
      ) : null}

      {success && formDoc.confirmationType === 'message' && formDoc.confirmationMessage ? (
        <div className="apply-success__message" style={{ margin: 0 }}>
          {isLexicalData(formDoc.confirmationMessage) ? (
            <RichText data={formDoc.confirmationMessage as any} />
          ) : null}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error ? <div className="apply-form__error-banner">{error}</div> : null}

          <div className="apply-form__grid" style={{ marginTop: error ? '1.25rem' : 0 }}>
            {fields.map((field, index) => {
              const key = field.id || `${field.blockType}-${field.name || index}`
              const isAlwaysFullWidth =
                field.blockType === 'message' || field.blockType === 'resumeUpload' || field.blockType === 'checkbox'
              const isHalfWidth =
                !isAlwaysFullWidth &&
                (field.width === 50 || field.width === undefined || field.width === null)
              const fieldClass = `apply-form__field${isHalfWidth ? '' : ' apply-form__field--full'}`

              if (field.blockType === 'message') {
                return (
                  <div key={key} className="apply-form__field apply-form__field--full">
                    {isLexicalData(field.message) ? <RichText data={field.message as any} /> : null}
                  </div>
                )
              }

              const name = field.name || ''
              if (!name) return null

              if (field.blockType === 'resumeUpload') {
                const selectedFile = selectedFiles[name]
                const helperText = field.helperText || 'Only PDF files accepted. Maximum size: 5 MB.'
                const maxSizeMB =
                  typeof field.maxSizeMB === 'number' && field.maxSizeMB > 0 ? field.maxSizeMB : 5
                const acceptedText =
                  (field.accept || 'application/pdf') === 'application/pdf'
                    ? 'PDF only'
                    : field.accept || 'Allowed file types'

                return (
                  <div key={key} className="apply-form__field apply-form__field--full">
                    <label className="apply-form__label" htmlFor={`${name}-upload`}>
                      {field.label || name}
                      {field.required ? <span className="apply-form__required">*</span> : null}
                    </label>
                    <p className="apply-form__hint">{helperText}</p>

                    {!selectedFile ? (
                      <label className="apply-form__dropzone" htmlFor={`${name}-upload`}>
                        <Upload size={32} className="apply-form__dropzone-icon" />
                        <span className="apply-form__dropzone-text">Click to select your PDF resume</span>
                        <span className="apply-form__dropzone-sub">
                          {acceptedText}, max {maxSizeMB} MB
                        </span>
                        <input
                          id={`${name}-upload`}
                          type="file"
                          accept={field.accept || 'application/pdf'}
                          className="apply-form__file-input"
                          onChange={(event) => {
                            const file = event.target.files?.[0] || null
                            handleFileChange(field, file)
                          }}
                        />
                      </label>
                    ) : (
                      <div className="apply-form__file-selected">
                        <FileText size={20} className="apply-form__file-icon" />
                        <span className="apply-form__file-name">{selectedFile.name}</span>
                        <span className="apply-form__file-size">
                          ({(selectedFile.size / 1024).toFixed(0)} KB)
                        </span>
                        <button
                          type="button"
                          className="apply-form__file-remove"
                          onClick={() => removeSelectedFile(name)}
                          aria-label="Remove file"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}

                    {fileErrors[name] ? (
                      <p className="apply-form__field-error">
                        <AlertCircle size={14} /> {fileErrors[name]}
                      </p>
                    ) : null}
                  </div>
                )
              }

              if (field.blockType === 'select') {
                const isWorkStatus = /work.?status/i.test(name) || /work.?status/i.test(field.label || '')
                const currentSelectVal = selectValues[name] || ''
                const searchValue = selectSearch[name] || ''
                const options = field.options || []
                const filteredOptions = options.filter((option) => {
                  const keyword = searchValue.trim().toLowerCase()
                  if (!keyword) return true
                  return (
                    option.label.toLowerCase().includes(keyword) ||
                    option.value.toLowerCase().includes(keyword)
                  )
                })
                const selectedLabel =
                  options.find((option) => option.value === currentSelectVal)?.label ||
                  field.placeholder ||
                  'Select an option'
                return (
                  <React.Fragment key={key}>
                    <label className={fieldClass}>
                      <span className="apply-form__label">
                        {field.label || name}
                        {field.required ? <span className="apply-form__required">*</span> : null}
                      </span>
                      <select
                        name={name}
                        required={Boolean(field.required)}
                        value={currentSelectVal}
                        onChange={(e) => setSelectValues((prev) => ({ ...prev, [name]: e.target.value }))}
                        className="apply-form__native-select-proxy"
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        <option value="">{field.placeholder || 'Select an option'}</option>
                        {options.map((option) => (
                          <option key={`${name}-${option.value}`} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <div
                        className="apply-form__custom-select"
                        tabIndex={0}
                        onBlur={(event) => {
                          const nextTarget = event.relatedTarget as Node | null
                          if (!event.currentTarget.contains(nextTarget)) {
                            setOpenSelect((prev) => (prev === name ? null : prev))
                          }
                        }}
                      >
                        <button
                          type="button"
                          className="apply-form__custom-select-trigger"
                          onClick={() => setOpenSelect((prev) => (prev === name ? null : name))}
                        >
                          <span className="apply-form__custom-select-label">{selectedLabel}</span>
                          <ChevronDown size={16} className="apply-form__custom-select-icon" />
                        </button>

                        {openSelect === name ? (
                          <div className="apply-form__custom-select-panel">
                            <input
                              type="text"
                              value={searchValue}
                              onChange={(event) =>
                                setSelectSearch((prev) => ({ ...prev, [name]: event.target.value }))
                              }
                              placeholder="Search options..."
                              className="apply-form__custom-select-search"
                            />
                            <div className="apply-form__custom-select-options">
                              {filteredOptions.map((option) => (
                                <button
                                  type="button"
                                  key={`${name}-${option.value}`}
                                  className={`apply-form__custom-select-option${
                                    currentSelectVal === option.value
                                      ? ' apply-form__custom-select-option--active'
                                      : ''
                                  }`}
                                  onClick={() => {
                                    setSelectValues((prev) => ({ ...prev, [name]: option.value }))
                                    setOpenSelect(null)
                                  }}
                                >
                                  {option.label}
                                </button>
                              ))}
                              {filteredOptions.length === 0 ? (
                                <div className="apply-form__custom-select-empty">No options found</div>
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </label>
                    {isWorkStatus && currentSelectVal.toLowerCase() === 'experienced' && (
                      <label className={fieldClass}>
                        <span className="apply-form__label">
                          Year of Experience
                          <span className="apply-form__required">*</span>
                        </span>
                        <input
                          type="number"
                          name="yearOfExperience"
                          required
                          min="1"
                          max="50"
                          placeholder="Enter Year of Experience"
                          className="apply-form__input"
                        />
                      </label>
                    )}
                  </React.Fragment>
                )
              }

              if (field.blockType === 'radio') {
                return (
                  <fieldset key={key} className={fieldClass}>
                    <legend className="apply-form__label">
                      {field.label || name}
                      {field.required ? <span className="apply-form__required">*</span> : null}
                    </legend>
                    {(field.options || []).map((option) => (
                      <label
                        key={`${name}-${option.value}`}
                        className="apply-form__hint"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <input
                          type="radio"
                          name={name}
                          value={option.value}
                          required={Boolean(field.required)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </fieldset>
                )
              }

              if (field.blockType === 'checkbox') {
                return (
                  <label key={key} className={fieldClass}>
                    <span
                      className="apply-form__hint"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <input
                        type="checkbox"
                        name={name}
                        value="true"
                        defaultChecked={Boolean(field.defaultValue)}
                        required={Boolean(field.required)}
                      />
                      <span className="apply-form__label" style={{ margin: 0 }}>
                        {field.label || name}
                        {field.required ? <span className="apply-form__required">*</span> : null}
                      </span>
                    </span>
                  </label>
                )
              }

              const inputType =
                field.blockType === 'email'
                  ? 'email'
                  : field.blockType === 'number'
                    ? 'number'
                    : field.blockType === 'date'
                      ? 'date'
                      : 'text'

              if (field.blockType === 'textarea') {
                return (
                  <label key={key} className={fieldClass}>
                    <span className="apply-form__label">
                      {field.label || name}
                      {field.required ? <span className="apply-form__required">*</span> : null}
                    </span>
                    <textarea
                      name={name}
                      required={Boolean(field.required)}
                      defaultValue={typeof field.defaultValue === 'string' ? field.defaultValue : ''}
                      placeholder={field.placeholder || ''}
                      className="apply-form__input"
                      style={{ minHeight: '7rem', resize: 'vertical' }}
                    />
                  </label>
                )
              }

              return (
                <label key={key} className={fieldClass}>
                  <span className="apply-form__label">
                    {field.label || name}
                    {field.required ? <span className="apply-form__required">*</span> : null}
                  </span>
                  <input
                    type={inputType}
                    name={name}
                    required={Boolean(field.required)}
                    defaultValue={
                      typeof field.defaultValue === 'string' || typeof field.defaultValue === 'number'
                        ? String(field.defaultValue)
                        : ''
                    }
                    placeholder={field.placeholder || ''}
                    className="apply-form__input"
                  />
                </label>
              )
            })}
          </div>

          <div className="apply-form__actions" style={{ marginTop: '1.5rem' }}>
            <button type="submit" disabled={submitting} className="apply-form__submit">
              {submitting ? 'Submitting...' : formDoc.submitButtonLabel || 'Submit Application'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

```

