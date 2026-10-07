/**
 * Turns a list of publications into the file formats a reader is likely to
 * want: a spreadsheet, or something a reference manager can import.
 *
 * These are pure functions over the array the page has already filtered, so an
 * export always matches exactly what is on screen. Nothing is refetched, which
 * also means the export cannot quietly disagree with the visible result count.
 */
import { typeLabel, type PublicationItem } from './types'

export type ExportFormat = 'csv' | 'bibtex' | 'ris'

/* ── CSV ──────────────────────────────────────────────────────────────── */

/**
 * Escapes one CSV field.
 *
 * Two separate concerns. RFC 4180 quoting handles commas, quotes and newlines.
 * Separately, a leading =, +, - or @ makes Excel and Sheets treat the cell as a
 * formula; publication titles come from third-party APIs (ORCID, Semantic
 * Scholar, CrossRef), so they are not trusted input and are prefixed with an
 * apostrophe to keep them inert.
 */
function csvField(value: unknown): string {
  let text = value == null ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

const CSV_COLUMNS = [
  'Title',
  'Authors',
  'Lab Members',
  'Publisher',
  'Type',
  'Year',
  'DOI',
  'Link',
  'Citations',
  'Keywords',
] as const

function toCsv(items: PublicationItem[]): string {
  const rows = [CSV_COLUMNS.map(csvField).join(',')]

  for (const p of items) {
    rows.push(
      [
        p.title,
        p.authors.map((a) => a.name).join('; '),
        // Same people as the Author filter.
        p.labAuthors.join('; '),
        p.publisher,
        typeLabel(p.type),
        p.year,
        p.doi || '',
        p.link || (p.doi ? `https://doi.org/${p.doi}` : ''),
        p.citationCount,
        p.keywords.join('; '),
      ]
        .map(csvField)
        .join(','),
    )
  }

  // The BOM makes Excel read the file as UTF-8 rather than the local codepage,
  // which otherwise mangles accented author names.
  return `\uFEFF${rows.join('\r\n')}\r\n`
}

/* ── BibTeX ───────────────────────────────────────────────────────────── */

const BIBTEX_ENTRY: Record<string, string> = {
  journal: 'article',
  conference: 'inproceedings',
  'book-chapter': 'incollection',
  'technical-report': 'techreport',
  thesis: 'phdthesis',
}

/** Where the venue goes differs per entry type. */
const BIBTEX_VENUE_FIELD: Record<string, string> = {
  article: 'journal',
  inproceedings: 'booktitle',
  incollection: 'booktitle',
  techreport: 'institution',
  phdthesis: 'school',
}

/** Strips accents and punctuation so the key is plain ASCII, as BibTeX expects. */
function asciiSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]/g, '')
}

/**
 * Collapses all whitespace onto one line.
 *
 * Imported records really do carry newlines and tabs in titles and venue names.
 * BibTeX tolerates them inside braces, but RIS is line-oriented: anything after
 * a newline is read as a new tag, so a wrapped title silently truncates the
 * record or breaks the import.
 */
function singleLine(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function bibtexValue(text: string): string {
  // Braces would open or close a group, and a stray backslash starts a command.
  return singleLine(text).replace(/\\/g, '\\textbackslash{}').replace(/[{}]/g, '')
}

/** surname + year + first meaningful title word, e.g. sharma2024privacy */
function citeKey(p: PublicationItem, taken: Set<string>): string {
  const first = p.authors[0]?.name?.trim() || ''
  const surname = asciiSlug(first.split(/\s+/).pop() || 'anon').toLowerCase() || 'anon'

  const stop = new Set(['a', 'an', 'the', 'on', 'of', 'for', 'in', 'and', 'to', 'with'])
  const word =
    p.title
      .split(/\s+/)
      .map((w) => asciiSlug(w).toLowerCase())
      .find((w) => w.length > 2 && !stop.has(w)) || 'untitled'

  const base = `${surname}${p.year}${word}`
  if (!taken.has(base)) {
    taken.add(base)
    return base
  }

  // Collisions are real: the same author can publish twice in a year on the
  // same topic. Suffix a, b, c… as BibTeX conventionally does.
  for (let i = 0; i < 26; i++) {
    const candidate = `${base}${String.fromCharCode(97 + i)}`
    if (!taken.has(candidate)) {
      taken.add(candidate)
      return candidate
    }
  }

  const fallback = `${base}${taken.size}`
  taken.add(fallback)
  return fallback
}

function toBibtex(items: PublicationItem[]): string {
  const taken = new Set<string>()

  return `${items
    .map((p) => {
      const entry = BIBTEX_ENTRY[p.type] || 'misc'
      const fields: [string, string][] = []

      // Double braces stop BibTeX styles lowercasing acronyms in titles.
      fields.push(['title', `{${bibtexValue(p.title)}}`])

      if (p.authors.length) {
        fields.push(['author', p.authors.map((a) => bibtexValue(a.name)).join(' and ')])
      }
      if (p.publisher) {
        fields.push([BIBTEX_VENUE_FIELD[entry] || 'publisher', bibtexValue(p.publisher)])
      }

      fields.push(['year', String(p.year)])

      if (p.doi) fields.push(['doi', bibtexValue(p.doi)])

      const url = p.link || (p.doi ? `https://doi.org/${p.doi}` : '')
      if (url) fields.push(['url', bibtexValue(url)])

      if (p.keywords.length) {
        fields.push(['keywords', p.keywords.map(bibtexValue).join(', ')])
      }

      const body = fields.map(([k, v]) => `  ${k} = {${v}}`).join(',\n')
      return `@${entry}{${citeKey(p, taken)},\n${body}\n}`
    })
    .join('\n\n')}\n`
}

/* ── RIS ──────────────────────────────────────────────────────────────── */

const RIS_TYPE: Record<string, string> = {
  journal: 'JOUR',
  conference: 'CPAPER',
  'book-chapter': 'CHAP',
  'technical-report': 'RPRT',
  thesis: 'THES',
}

function toRis(items: PublicationItem[]): string {
  return items
    .map((p) => {
      const lines = [`TY  - ${RIS_TYPE[p.type] || 'GEN'}`, `TI  - ${singleLine(p.title)}`]

      for (const a of p.authors) lines.push(`AU  - ${singleLine(a.name)}`)
      if (p.publisher) lines.push(`T2  - ${singleLine(p.publisher)}`)
      lines.push(`PY  - ${p.year}`)
      if (p.doi) lines.push(`DO  - ${singleLine(p.doi)}`)

      const url = p.link || (p.doi ? `https://doi.org/${p.doi}` : '')
      if (url) lines.push(`UR  - ${singleLine(url)}`)

      for (const k of p.keywords) lines.push(`KW  - ${singleLine(k)}`)

      lines.push('ER  - ')
      // RIS is a line-oriented format and readers expect CRLF.
      return lines.join('\r\n')
    })
    .join('\r\n\r\n')
    .concat('\r\n')
}

/* ── Public API ───────────────────────────────────────────────────────── */

export const FORMAT_META: Record<
  ExportFormat,
  { label: string; hint: string; extension: string; mime: string }
> = {
  csv: {
    label: 'CSV (Excel, Sheets)',
    hint: 'One row per publication',
    extension: 'csv',
    mime: 'text/csv;charset=utf-8',
  },
  bibtex: {
    label: 'BibTeX (.bib)',
    hint: 'For LaTeX bibliographies',
    extension: 'bib',
    mime: 'application/x-bibtex;charset=utf-8',
  },
  ris: {
    label: 'RIS (.ris)',
    hint: 'For Zotero, Mendeley, EndNote',
    extension: 'ris',
    mime: 'application/x-research-info-systems;charset=utf-8',
  },
}

export function serializePublications(items: PublicationItem[], format: ExportFormat): string {
  if (format === 'bibtex') return toBibtex(items)
  if (format === 'ris') return toRis(items)
  return toCsv(items)
}

/**
 * Builds a filename that says what is inside, so a reader who exports a few
 * different filters does not end up with publications(1).csv, publications(2).csv.
 * `descriptor` comes from the active filters, e.g. "since-2024-journal".
 */
export function exportFilename(
  format: ExportFormat,
  count: number,
  descriptor?: string | null,
): string {
  const date = new Date().toISOString().slice(0, 10)
  const middle = descriptor ? `-${descriptor}` : '-all'
  return `publications${middle}-${count}-${date}.${FORMAT_META[format].extension}`
}

/** Triggers a browser download without a server round trip. */
export function downloadPublications(
  items: PublicationItem[],
  format: ExportFormat,
  descriptor?: string | null,
): void {
  const blob = new Blob([serializePublications(items, format)], {
    type: FORMAT_META[format].mime,
  })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = exportFilename(format, items.length, descriptor)
  document.body.appendChild(a)
  a.click()
  a.remove()

  // Revoking immediately can cancel the download in Safari, so give it a tick.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
