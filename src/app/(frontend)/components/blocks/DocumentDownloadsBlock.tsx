import React from 'react'
import {
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Presentation,
  type LucideIcon,
} from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'

interface DocumentFile {
  id?: number | string
  title?: string | null
  description?: string | null
  filename?: string | null
  url?: string | null
  mimeType?: string | null
  filesize?: number | null
}

interface DocumentItem {
  id?: string | null
  file: DocumentFile | number | string
  label?: string | null
  description?: string | null
}

interface DocumentDownloadsBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  backgroundColor?: string | null
  layout?: 'rows' | 'twoColumn' | null
  showFileMeta?: boolean | null
  items?: DocumentItem[] | null
}

/**
 * File type presentation, resolved from the MIME type with the extension as a
 * fallback — a .docx uploaded from some clients arrives as a generic
 * octet-stream, and the row should still read correctly.
 */
const FILE_TYPES: {
  test: RegExp
  label: string
  Icon: LucideIcon
  tint: string
}[] = [
  { test: /pdf/i, label: 'PDF', Icon: FileText, tint: '#dc2626' },
  { test: /word|msword|wordprocessing|\.docx?$/i, label: 'Word', Icon: FileText, tint: '#2563eb' },
  {
    test: /excel|spreadsheet|csv|\.xlsx?$|\.csv$/i,
    label: 'Spreadsheet',
    Icon: FileSpreadsheet,
    tint: '#15803d',
  },
  {
    test: /powerpoint|presentation|\.pptx?$/i,
    label: 'Slides',
    Icon: Presentation,
    tint: '#c2410c',
  },
]

function describeFile(file: DocumentFile) {
  const probe = `${file.mimeType || ''} ${file.filename || ''}`
  const match = FILE_TYPES.find((t) => t.test.test(probe))
  return {
    label: match?.label || extensionOf(file.filename) || 'File',
    Icon: match?.Icon || FileText,
    tint: match?.tint || 'var(--cms-primary, #04415f)',
  }
}

function extensionOf(filename?: string | null): string | null {
  const m = filename?.match(/\.([A-Za-z0-9]{1,6})$/)
  return m ? m[1].toUpperCase() : null
}

/** Binary units, matching what an operating system reports for a download. */
function formatSize(bytes?: number | null): string | null {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes <= 0) return null
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value < 10 && unit > 0 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`
}

function ActionButton({
  href,
  icon: Icon,
  children,
  download,
  ariaLabel,
}: {
  href: string
  icon: LucideIcon
  children: React.ReactNode
  download?: boolean
  ariaLabel: string
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      {...(download
        ? { download: true }
        : // Opened in a new tab so the reader does not lose the page they were on.
          { target: '_blank', rel: 'noopener noreferrer' })}
      className="inline-flex shrink-0 items-center gap-1.5 font-semibold transition-colors"
      style={{
        fontSize: '0.8125rem',
        padding: '8px 14px',
        borderRadius: 8,
        color: 'var(--cms-primary, #04415f)',
        background: 'color-mix(in srgb, var(--cms-primary, #04415f) 8%, #ffffff)',
      }}
    >
      <Icon size={15} />
      <span className="hidden sm:inline">{children}</span>
    </a>
  )
}

export default function DocumentDownloadsBlock({
  sectionHeading,
  sectionDescription,
  headingAlignment,
  backgroundColor,
  layout = 'rows',
  showFileMeta = true,
  items,
}: DocumentDownloadsBlockProps) {
  // A document deleted after being added to a page leaves an id behind, so rows
  // without a resolved file are dropped rather than rendered as dead links.
  const rows = (items || []).filter(
    (item): item is DocumentItem & { file: DocumentFile } =>
      typeof item?.file === 'object' && Boolean((item.file as DocumentFile)?.url),
  )

  if (rows.length === 0) return null

  return (
    <section className="py-16 px-6" style={{ backgroundColor: backgroundColor || '#FFFFFF' }}>
      <div className="max-w-5xl mx-auto">
        <SectionHeading
          heading={sectionHeading}
          description={sectionDescription}
          alignment={headingAlignment}
        />

        <ul
          className={`list-none m-0 p-0 grid gap-3 ${
            layout === 'twoColumn' ? 'sm:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {rows.map((item, i) => {
            const file = item.file
            const title = item.label?.trim() || file.title?.trim() || file.filename || 'Document'
            const description = item.description?.trim() || file.description?.trim()
            const { label: typeLabel, Icon, tint } = describeFile(file)
            const size = formatSize(file.filesize)
            const meta = [typeLabel, size].filter(Boolean).join(' · ')

            return (
              <li
                key={item.id || file.id || i}
                className="flex items-center gap-4 bg-white transition-shadow
                           shadow-[0_1px_2px_rgba(16,24,40,0.04)]
                           hover:shadow-[0_6px_20px_-6px_rgba(16,24,40,0.18)]"
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: '1px solid rgba(16,24,40,0.08)',
                }}
              >
                <span
                  aria-hidden
                  className="grid place-items-center shrink-0"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 9,
                    background: `color-mix(in srgb, ${tint} 12%, #ffffff)`,
                  }}
                >
                  <Icon size={18} color={tint} />
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className="block font-semibold"
                    style={{
                      fontSize: '0.9375rem',
                      lineHeight: 1.45,
                      color: 'var(--cms-secondary, #011e2c)',
                    }}
                  >
                    {title}
                  </span>
                  {description && (
                    <span
                      className="block mt-0.5"
                      style={{
                        fontSize: '0.8125rem',
                        lineHeight: 1.5,
                        color: 'var(--cms-text, #334155)',
                        opacity: 0.7,
                      }}
                    >
                      {description}
                    </span>
                  )}
                  {showFileMeta !== false && meta && (
                    <span
                      className="block mt-1"
                      style={{
                        fontSize: '0.6875rem',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: 'var(--cms-text, #334155)',
                        opacity: 0.5,
                      }}
                    >
                      {meta}
                    </span>
                  )}
                </span>

                <span className="flex shrink-0 items-center gap-2">
                  {/* Labels are hidden on narrow screens; aria-label keeps each
                      action distinguishable to a screen reader, which would
                      otherwise hear several identical "View" links. */}
                  <ActionButton href={file.url!} icon={Eye} ariaLabel={`View ${title}`}>
                    View
                  </ActionButton>
                  <ActionButton
                    href={file.url!}
                    icon={Download}
                    download
                    ariaLabel={`Download ${title}`}
                  >
                    Download
                  </ActionButton>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
