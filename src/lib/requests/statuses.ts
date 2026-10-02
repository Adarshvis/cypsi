/**
 * Statuses for the two Requests Dashboard tabs. Shared by the collection
 * configs (select options) and the admin dashboard (labels, colours, filters).
 */

export const INTERNSHIP_STATUSES = [
  { label: 'New', value: 'new' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
] as const

export const ENQUIRY_STATUSES = [
  { label: 'New', value: 'new' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Replied', value: 'replied' },
  { label: 'Closed', value: 'closed' },
] as const

export type InternshipStatus = (typeof INTERNSHIP_STATUSES)[number]['value']
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number]['value']

/** Pill colours, as in DUCC's Requests Dashboard. */
export const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  new: { color: '#3b82f6', bg: '#eff6ff' },
  reviewed: { color: '#f59e0b', bg: '#fffbeb' },
  approved: { color: '#10b981', bg: '#f0fdf4' },
  rejected: { color: '#ef4444', bg: '#fef2f2' },
  replied: { color: '#10b981', bg: '#f0fdf4' },
  closed: { color: '#6b7280', bg: '#f3f4f6' },
}

/** Colour of the "Total" stat. */
export const TOTAL_COLOR = '#1e3a5f'
