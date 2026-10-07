export interface PublicationItem {
  id: string
  title: string
  publisher: string
  year: number
  type: string
  doi?: string | null
  link?: string | null
  citationCount: number
  authors: { name: string; isLabMember: boolean }[]
  /** Display names of the lab authors on this paper (see labAuthors.ts). */
  labAuthors: string[]
  keywords: string[]
}

/** One Author filter entry and how many listed publications it matches. */
export interface AuthorOption {
  name: string
  count: number
}

export const TYPE_OPTIONS = [
  { label: 'Journal Article', value: 'journal' },
  { label: 'Conference Paper', value: 'conference' },
  { label: 'Book Chapter', value: 'book-chapter' },
  { label: 'Technical Report', value: 'technical-report' },
  { label: 'Thesis', value: 'thesis' },
]

export function typeLabel(value: string): string {
  return TYPE_OPTIONS.find((t) => t.value === value)?.label || value
}
