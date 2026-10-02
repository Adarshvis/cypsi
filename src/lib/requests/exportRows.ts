/**
 * CSV / "Excel" (TSV) builders for the Requests Dashboard exports.
 *
 * The rows hold public form input, so every cell is guarded against formula
 * injection: a value starting with `=`, `+`, `-`, `@`, tab or CR gets a leading
 * apostrophe, which spreadsheet apps show as text instead of evaluating.
 */

const FORMULA_START = /^[=+\-@\t\r]/

function guardFormula(value: string): string {
  return FORMULA_START.test(value) ? `'${value}` : value
}

/** One CSV cell: formula-guarded, quoted when it holds a comma, quote or newline. */
export function csvCell(value: unknown): string {
  const text = guardFormula(value === null || value === undefined ? '' : String(value))
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** One TSV cell: formula-guarded, with tabs and newlines flattened to spaces. */
export function tsvCell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value)
  return guardFormula(text).replace(/[\t\r\n]+/g, ' ')
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
}

export function toTsv(headers: string[], rows: unknown[][]): string {
  return [headers, ...rows].map((row) => row.map(tsvCell).join('\t')).join('\r\n')
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** `DD Mon YYYY` in UTC, as in DUCC's dashboard. `—` when missing or invalid. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return `${String(d.getUTCDate()).padStart(2, '0')} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** Filename-safe timestamp, e.g. 20261001-143005. */
export function exportStamp(date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}-` +
    `${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}`
  )
}
