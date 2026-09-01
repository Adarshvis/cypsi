/**
 * Shared helpers for the CyPSi → DUCC content migration.
 */
import fs from 'fs'
import path from 'path'

export const MIGRATION_DIR = path.resolve(process.cwd(), 'migration-data')
export const CYPSI_MEDIA_DIR = path.resolve(process.cwd(), '..', 'learner', 'media')

/** Loads .env into process.env without overwriting anything already set. */
export function loadEnv() {
  for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '')
    }
  }
  process.env.CMS_DB_PUSH = 'false'
}

export function readExport<T = any>(name: string): T {
  return JSON.parse(fs.readFileSync(path.join(MIGRATION_DIR, `${name}.json`), 'utf8'))
}

/** Maps a Mongo ObjectId string to its CyPSi media filename. */
export function buildMediaFilenameMap(): Map<string, { filename: string; alt?: string }> {
  const docs = readExport<any[]>('media-referenced')
  const map = new Map<string, { filename: string; alt?: string }>()
  for (const d of docs) {
    const id = String(d._id?.$oid || d._id)
    if (d.filename) map.set(id, { filename: d.filename, alt: d.alt })
  }
  return map
}

/* ── Lexical helpers ───────────────────────────────────────────────────── */

type LexicalNode = Record<string, unknown>

function textNode(text: string, bold = false): LexicalNode {
  return {
    type: 'text',
    detail: 0,
    format: bold ? 1 : 0,
    mode: 'normal',
    style: '',
    text,
    version: 1,
  }
}

function paragraph(text: string): LexicalNode {
  return {
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    textFormat: 0,
    children: [textNode(text)],
  }
}

function heading(text: string, tag: 'h2' | 'h3' | 'h4' = 'h2'): LexicalNode {
  return {
    type: 'heading',
    tag,
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [textNode(text)],
  }
}

export function lexicalRoot(children: LexicalNode[]) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: children.length ? children : [paragraph('')],
    },
  }
}

/** Rich text from plain paragraphs. */
export function richText(...paragraphs: (string | undefined | null)[]) {
  return lexicalRoot(
    paragraphs.filter((p): p is string => Boolean(p && p.trim())).map((p) => paragraph(p)),
  )
}

/**
 * Rich text containing a single heading node.
 *
 * Card titles in DUCC's block set are rich text fields. Written as a paragraph
 * they inherit body styling and look weaker than the source design, so titles
 * are emitted as headings instead.
 */
export function richTextHeading(text?: string | null, tag: 'h2' | 'h3' | 'h4' = 'h4') {
  if (!text?.trim()) return lexicalRoot([])
  return lexicalRoot([heading(text.trim(), tag)])
}

/** Rich text with an optional eyebrow line, a heading, then body paragraphs. */
export function richTextSection(opts: {
  eyebrow?: string
  heading?: string
  headingTag?: 'h2' | 'h3' | 'h4'
  body?: (string | undefined | null)[]
}) {
  const nodes: LexicalNode[] = []
  if (opts.eyebrow?.trim()) nodes.push(paragraph(opts.eyebrow.trim()))
  if (opts.heading?.trim()) nodes.push(heading(opts.heading.trim(), opts.headingTag || 'h2'))
  for (const b of opts.body || []) {
    if (b && b.trim()) nodes.push(paragraph(b.trim()))
  }
  return lexicalRoot(nodes)
}

/* ── Misc ──────────────────────────────────────────────────────────────── */

/**
 * CyPSi content contains absolute links to a dev machine
 * (http://172.16.0.108:3002/...). Rewrite those to site-relative paths.
 */
export function normalizeUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  const trimmed = url.trim()
  if (!trimmed) return undefined
  const devHost = /^https?:\/\/172\.16\.\d+\.\d+(:\d+)?/i
  if (devHost.test(trimmed)) return trimmed.replace(devHost, '') || '/'
  return trimmed
}

/**
 * Bootstrap Icons → Lucide.
 *
 * Names must be the exact PascalCase Lucide export, because both DynamicIcon
 * and IconPickerField resolve them with `icons[name]` — a kebab-case value
 * silently renders nothing.
 */
const ICON_MAP: Record<string, string> = {
  'bi-shield-check': 'ShieldCheck',
  'bi-award': 'Award',
  'bi-award-fill': 'Award',
  'bi-people': 'Users',
  'bi-people-fill': 'Users',
  'bi-person-check-fill': 'UserCheck',
  'bi-clock': 'Clock',
  'bi-book': 'BookOpen',
  'bi-star': 'Star',
  'bi-lightbulb': 'Lightbulb',
  'bi-globe': 'Globe',
  'bi-heart': 'Heart',
  'bi-shield': 'Shield',
  'bi-geo-alt': 'MapPin',
  'bi-envelope': 'Mail',
  'bi-telephone': 'Phone',
  'bi-calendar': 'Calendar',
  'bi-chat-dots': 'MessageCircle',
  'bi-bullseye': 'Target',
  'bi-eye': 'Eye',
  'bi-laptop': 'Laptop',
  'bi-briefcase': 'Briefcase',
  'bi-code-slash': 'Code',
  'bi-palette': 'Palette',
  'bi-graph-up': 'TrendingUp',
  'bi-graph-up-arrow': 'TrendingUp',
  'bi-camera': 'Camera',
  'bi-play-circle-fill': 'PlayCircle',
  'bi-check-circle-fill': 'CircleCheck',
  'bi-heart-pulse': 'HeartPulse',
  'bi-diagram-3': 'Network',
  'bi-megaphone': 'Megaphone',
  'bi-music-note-beamed': 'Music',
  'bi-gear': 'Settings',
  'bi-journal-text': 'BookText',
  'bi-cup-hot': 'Coffee',
  'bi-trophy': 'Trophy',
  'bi-pen': 'Pen',
  'bi-tree': 'Trees',
}

export function mapIcon(bootstrapIcon?: string | null): string | undefined {
  if (!bootstrapIcon) return undefined
  return ICON_MAP[bootstrapIcon] || undefined
}

/** Turns a YouTube URL of any shape into an embeddable one. */
export function youtubeEmbedUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  const patterns = [
    /youtube\.com\/embed\/([\w-]{11})/,
    /youtube\.com\/watch\?v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return `https://www.youtube.com/embed/${m[1]}`
  }
  return url
}

export function fileExists(filename: string): boolean {
  return fs.existsSync(path.join(CYPSI_MEDIA_DIR, filename))
}
