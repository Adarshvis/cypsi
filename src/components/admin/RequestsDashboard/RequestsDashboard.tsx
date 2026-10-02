'use client'

/**
 * Requests Dashboard on the admin home page (`admin.components.afterDashboard`),
 * ported from DUCC's: a "Request Management" section whose toggle opens two
 * tabs, Internship Applications and Contact Enquiries.
 *
 * Renders nothing unless the user is a Super Admin or Admin. That is only
 * presentation: the data comes from Payload's REST API with the user's own
 * session, so the collections' access rules (site admins only) still decide
 * what is returned or changed.
 */
import React, { useCallback, useId, useMemo, useRef, useState } from 'react'
import { useAuth } from '@payloadcms/ui'
import type { Form, FormSubmission, InternshipApplication } from '@/payload-types'
import { isSiteAdmin } from '@/access/roles'
import { InternshipApplicationsTab } from './InternshipApplicationsTab'
import { ContactEnquiriesTab, toEnquiryRow } from './ContactEnquiriesTab'
import { ErrorNote, srOnly } from './ui'

type TabKey = 'internships' | 'enquiries'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'internships', label: 'Internship Applications' },
  { key: 'enquiries', label: 'Contact Enquiries' },
]

/** Rows per tab; no pagination, as in DUCC. */
const LIMIT = 500

type ListResponse<T> = { docs?: T[]; totalDocs?: number }

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return (await res.json()) as T
}

export function RequestsDashboard() {
  const { user } = useAuth()
  const baseId = useId()

  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('internships')
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const [applications, setApplications] = useState<InternshipApplication[]>([])
  const [applicationsTotal, setApplicationsTotal] = useState(0)
  const [enquiryForms, setEnquiryForms] = useState<Form[]>([])
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [submissionsTotal, setSubmissionsTotal] = useState(0)

  const tabRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({ internships: null, enquiries: null })

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    const problems: string[] = []

    const loadApplications = async () => {
      try {
        const data = await getJson<ListResponse<InternshipApplication>>(
          `/api/internship-applications?limit=${LIMIT}&sort=-submittedAt&depth=1`,
        )
        setApplications(data.docs || [])
        setApplicationsTotal(data.totalDocs ?? data.docs?.length ?? 0)
      } catch {
        setApplications([])
        setApplicationsTotal(0)
        problems.push('internship applications')
      }
    }

    const loadEnquiries = async () => {
      try {
        // Two steps, so this does not depend on nested-relationship queries:
        // the forms flagged for the tab, then their submissions.
        const forms = await getJson<ListResponse<Form>>(
          '/api/forms?where[showInContactEnquiries][equals]=true&depth=0&limit=100',
        )
        const formDocs = forms.docs || []
        setEnquiryForms(formDocs)
        if (!formDocs.length) {
          setSubmissions([])
          setSubmissionsTotal(0)
          return
        }
        const ids = formDocs.map((f) => encodeURIComponent(String(f.id))).join(',')
        const subs = await getJson<ListResponse<FormSubmission>>(
          `/api/form-submissions?where[form][in]=${ids}&depth=0&limit=${LIMIT}&sort=-createdAt`,
        )
        setSubmissions(subs.docs || [])
        setSubmissionsTotal(subs.totalDocs ?? subs.docs?.length ?? 0)
      } catch {
        setSubmissions([])
        setSubmissionsTotal(0)
        problems.push('contact enquiries')
      }
    }

    await Promise.all([loadApplications(), loadEnquiries()])
    if (problems.length) setError(`Could not load ${problems.join(' and ')}. Try Refresh.`)
    setLoaded(true)
    setLoading(false)
  }, [])

  const enquiryRows = useMemo(() => {
    const formsById = new Map(enquiryForms.map((f) => [String(f.id), f]))
    return submissions.map((s) => toEnquiryRow(s, formsById))
  }, [enquiryForms, submissions])

  async function updateStatus(
    collection: 'internship-applications' | 'form-submissions',
    id: string | number,
    status: string,
  ) {
    setUpdatingId(String(id))
    setError(null)
    try {
      const res = await fetch(`/api/${collection}/${encodeURIComponent(String(id))}?depth=0`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error(String(res.status))
      // The select is controlled by this state, so it only moves on success.
      if (collection === 'internship-applications') {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: status as InternshipApplication['status'] } : a)),
        )
      } else {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: status as FormSubmission['status'] } : s)),
        )
      }
    } catch {
      setError('Could not update the status. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  function handleToggle() {
    if (!open && !loaded) void fetchAll()
    setOpen((v) => !v)
  }

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    event.preventDefault()
    const next = TABS[(index + delta + TABS.length) % TABS.length].key
    setActiveTab(next)
    tabRefs.current[next]?.focus()
  }

  if (!isSiteAdmin(user)) return null

  const headingId = `${baseId}-heading`
  const panelRegionId = `${baseId}-region`
  const tabId = (key: TabKey) => `${baseId}-tab-${key}`
  const panelId = (key: TabKey) => `${baseId}-panel-${key}`
  const counts: Record<TabKey, number> = {
    internships: applicationsTotal,
    enquiries: submissionsTotal,
  }

  return (
    <section aria-labelledby={headingId} style={{ marginTop: '1.5rem' }}>
      <h2
        id={headingId}
        style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          marginBottom: '1rem',
          color: 'var(--theme-text, #1f2937)',
        }}
      >
        Request Management
      </h2>

      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls={panelRegionId}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          width: '220px',
          background: open ? 'var(--theme-elevation-100, #f3f4f6)' : 'var(--theme-elevation-50, #f9fafb)',
          border: `1px solid ${open ? 'var(--theme-elevation-300, #d1d5db)' : 'var(--theme-elevation-150, #e5e7eb)'}`,
          borderRadius: '0.5rem',
          color: 'var(--theme-text, #111827)',
          fontWeight: 500,
          fontSize: '0.95rem',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'background 0.15s',
          textAlign: 'left',
        }}
      >
        <span>Requests Dashboard</span>
        <span
          aria-hidden="true"
          style={{
            fontSize: '1.1rem',
            color: 'var(--theme-elevation-400, #9ca3af)',
            transform: open ? 'rotate(45deg)' : 'none',
            transition: 'transform 0.2s',
            display: 'inline-block',
          }}
        >
          +
        </span>
      </button>

      <div id={panelRegionId} hidden={!open}>
        {open ? (
          <div
            style={{
              marginTop: '1.5rem',
              border: '1px solid var(--theme-elevation-150, #e5e7eb)',
              borderRadius: '0.75rem',
              background: 'var(--theme-bg, #fff)',
              overflow: 'hidden',
            }}
          >
            <div
              role="tablist"
              aria-label="Request types"
              style={{ display: 'flex', borderBottom: '2px solid var(--theme-elevation-100, #f3f4f6)' }}
            >
              {TABS.map((tab, index) => {
                const active = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    ref={(el) => {
                      tabRefs.current[tab.key] = el
                    }}
                    type="button"
                    role="tab"
                    id={tabId(tab.key)}
                    aria-selected={active}
                    aria-controls={panelId(tab.key)}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setActiveTab(tab.key)}
                    onKeyDown={(e) => handleTabKeyDown(e, index)}
                    style={{
                      flex: 1,
                      padding: '0.85rem 1rem',
                      fontSize: '0.88rem',
                      fontWeight: active ? 700 : 500,
                      color: active ? '#1e3a5f' : '#6b7280',
                      background: active ? '#fff' : 'var(--theme-elevation-50, #f9fafb)',
                      border: 'none',
                      borderBottom: active ? '3px solid #1e3a5f' : '3px solid transparent',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                  >
                    {tab.label}
                    <span
                      style={{
                        marginLeft: '0.5rem',
                        fontSize: '0.72rem',
                        background: active ? '#1e3a5f' : '#e5e7eb',
                        color: active ? '#fff' : '#6b7280',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        fontWeight: 700,
                      }}
                    >
                      <span style={srOnly}>(</span>
                      {loaded ? counts[tab.key] : '…'}
                      <span style={srOnly}>)</span>
                    </span>
                  </button>
                )
              })}
            </div>

            <ErrorNote message={error} />

            <div role="tabpanel" id={panelId(activeTab)} aria-labelledby={tabId(activeTab)}>
              {activeTab === 'internships' ? (
                <InternshipApplicationsTab
                  docs={applications}
                  totalDocs={applicationsTotal}
                  loading={loading}
                  updatingId={updatingId}
                  onRefresh={() => void fetchAll()}
                  onStatusChange={(id, status) => void updateStatus('internship-applications', id, status)}
                />
              ) : (
                <ContactEnquiriesTab
                  rows={enquiryRows}
                  totalDocs={submissionsTotal}
                  hasForms={enquiryForms.length > 0}
                  loading={loading}
                  updatingId={updatingId}
                  onRefresh={() => void fetchAll()}
                  onStatusChange={(id, status) => void updateStatus('form-submissions', id, status)}
                />
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
