/**
 * Requests Dashboard pure modules: field hints, the public apply validation and
 * the export builders. These run without a database: `/api/apply` relies on
 * `validateInternshipApplication` for every rule, so a regression that lets a
 * client set its own status, or slips a non-PDF through, fails here.
 */
import { describe, expect, it } from 'vitest'
import {
  ENQUIRY_HINT_KEYS,
  INTERNSHIP_HINT_KEYS,
  classifyField,
  isDomainField,
  mapFieldsByHint,
} from '@/lib/requests/fieldHints'
import {
  isPdfMagic,
  MAX_RESUME_BYTES,
  validateInternshipApplication,
  type ApplicationFormField,
} from '@/lib/requests/validateApplication'
import { csvCell, formatDate, toCsv, toTsv } from '@/lib/requests/exportRows'

const FIELDS: ApplicationFormField[] = [
  { blockType: 'message' },
  { name: 'fullName', label: 'Full Name ', blockType: 'text', required: true },
  { name: 'email', label: 'Email', blockType: 'email', required: true },
  { name: 'phone', label: 'Phone', blockType: 'text' },
  { name: 'domain', label: 'Domain', blockType: 'select' },
  { name: 'college', label: 'College Name', blockType: 'text' },
  { name: 'year', label: 'Year / Semester', blockType: 'text' },
  { name: 'why', label: 'Why this domain?', blockType: 'textarea' },
  { name: 'portfolio', label: 'Portfolio link', blockType: 'text' },
  { name: 'resume', label: 'Resume', blockType: 'resumeUpload', required: true },
]

const pdf = (size = 32, type = 'application/pdf') =>
  new File([new Uint8Array(size).fill(0x20)], 'cv.pdf', { type })

function form(overrides: Record<string, string | File | null> = {}) {
  const fd = new FormData()
  const base: Record<string, string | File | null> = {
    fullName: 'Asha Rao',
    email: 'asha@example.com',
    phone: '+91 98765 43210',
    domain: 'Robotics',
    college: 'Goa University',
    year: '3rd year',
    why: 'I like robots.',
    portfolio: 'https://example.com/asha',
    resume: pdf(),
    ...overrides,
  }
  for (const [key, value] of Object.entries(base)) {
    if (value !== null) fd.append(key, value)
  }
  return fd
}

const validate = (fd: FormData, fields: ApplicationFormField[] = FIELDS) =>
  validateInternshipApplication({ fields, get: (n) => fd.get(n) })

describe('field hints', () => {
  it('applies the priority order', () => {
    expect(classifyField({ name: 'college', label: 'College Name', blockType: 'text' })).toBe(
      'institution',
    )
    expect(classifyField({ name: 'x', label: 'Full Name ', blockType: 'text' })).toBe('name')
    expect(classifyField({ name: 'contact', label: 'Reach me at', blockType: 'email' })).toBe('email')
    expect(classifyField({ name: 'sem', label: 'Semester', blockType: 'text' })).toBe('yearOrSemester')
    expect(isDomainField({ name: 'area', label: 'Area of interest', blockType: 'select' })).toBe(true)
    expect(isDomainField({ name: 'fullName', label: 'Full Name', blockType: 'text' })).toBe(false)
  })

  it('falls back to a plain textarea for the message', () => {
    const { mapped, rest } = mapFieldsByHint(
      [
        { name: 'name', label: 'Name', blockType: 'text', value: 'Ravi' },
        { name: 'note', label: 'Your note', blockType: 'textarea', value: 'Hello there' },
      ],
      ENQUIRY_HINT_KEYS,
    )
    expect(mapped).toEqual({ name: 'Ravi', message: 'Hello there' })
    expect(rest).toEqual([])
  })

  it('sends second matches and unrequested keys to rest, skipping empty values', () => {
    const { mapped, rest } = mapFieldsByHint(
      [
        { name: 'email', label: 'Email', blockType: 'email', value: 'a@example.com' },
        { name: 'altEmail', label: 'Alternate email', blockType: 'email', value: 'b@example.com' },
        { name: 'subject', label: 'Subject', blockType: 'text', value: 'Hi' },
        { name: 'blank', label: 'Blank', blockType: 'text', value: '  ' },
      ],
      INTERNSHIP_HINT_KEYS,
    )
    expect(mapped).toEqual({ email: 'a@example.com' })
    expect(rest).toEqual([
      { key: 'Alternate email', value: 'b@example.com' },
      { key: 'Subject', value: 'Hi' },
    ])
  })
})

describe('validateInternshipApplication', () => {
  it('accepts a valid application and keeps other answers by label', () => {
    const result = validate(form())
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data).toEqual({
      name: 'Asha Rao',
      email: 'asha@example.com',
      phone: '+91 98765 43210',
      domain: 'Robotics',
      institution: 'Goa University',
      yearOrSemester: '3rd year',
    })
    expect(result.extraFields).toEqual({
      'Why this domain?': 'I like robots.',
      'Portfolio link': 'https://example.com/asha',
    })
    expect(result.file.type).toBe('application/pdf')
  })

  it('takes the domain from the URL entry when the form has no domain field', () => {
    const fields = FIELDS.filter((f) => f.name !== 'domain')
    const ok = validate(form({ domain: 'Embedded Systems' }), fields)
    expect(ok.ok && ok.data.domain).toBe('Embedded Systems')

    const missing = validate(form({ domain: null }), fields)
    expect(missing).toMatchObject({ ok: false, status: 400 })
    if (!missing.ok) expect(missing.error).toMatch(/domain/i)
  })

  it('rejects missing name, email, required custom fields and resume', () => {
    expect(validate(form({ fullName: null }))).toMatchObject({ ok: false, status: 400 })
    expect(validate(form({ email: null }))).toMatchObject({ ok: false, status: 400 })
    expect(validate(form({ resume: null }))).toMatchObject({ ok: false, status: 400 })

    const fields = [...FIELDS, { name: 'consent', label: 'I agree', blockType: 'checkbox', required: true }]
    const result = validate(form(), fields)
    expect(result).toMatchObject({ ok: false, status: 400, error: 'Please fill in "I agree".' })
    const checked = validate(form({ consent: 'true' }), fields)
    expect(checked.ok && checked.extraFields['I agree']).toBe('Yes')
  })

  it('rejects a bad email and a bad phone', () => {
    for (const email of ['not-an-email', 'a@b', 'a b@example.com']) {
      expect(validate(form({ email })).ok).toBe(false)
    }
    expect(validate(form({ phone: 'call me' })).ok).toBe(false)
  })

  it('rejects over-long values', () => {
    expect(validate(form({ fullName: 'x'.repeat(121) })).ok).toBe(false)
    expect(validate(form({ college: 'x'.repeat(201) })).ok).toBe(false)
    expect(validate(form({ year: 'x'.repeat(51) })).ok).toBe(false)
    expect(validate(form({ why: 'x'.repeat(2001) })).ok).toBe(false)
  })

  it('rejects a non-PDF type', () => {
    expect(validate(form({ resume: pdf(32, 'text/plain') }))).toMatchObject({ ok: false, status: 400 })
  })

  it('rejects a file over 5 MB and accepts exactly 5 MB', () => {
    expect(validate(form({ resume: pdf(MAX_RESUME_BYTES + 1) }))).toMatchObject({
      ok: false,
      status: 413,
    })
    expect(validate(form({ resume: pdf(MAX_RESUME_BYTES) })).ok).toBe(true)
  })

  it('ignores client-sent status and keys the form does not define', () => {
    const fd = form()
    fd.append('status', 'approved')
    fd.append('submittedAt', '2000-01-01T00:00:00.000Z')
    fd.append('extraFields', '{"x":"y"}')
    fd.append('hacker', 'value')
    const result = validate(fd)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data).not.toHaveProperty('status')
    expect(result.data).not.toHaveProperty('submittedAt')
    expect(Object.keys(result.extraFields)).toEqual(['Why this domain?', 'Portfolio link'])
  })
})

describe('isPdfMagic', () => {
  it('recognises the PDF signature', () => {
    expect(isPdfMagic(new TextEncoder().encode('%PDF-1.4\n'))).toBe(true)
    expect(isPdfMagic(new TextEncoder().encode('hello world'))).toBe(false)
    expect(isPdfMagic(new Uint8Array(0))).toBe(false)
  })
})

describe('export builders', () => {
  it('guards formulas and quotes special characters', () => {
    expect(csvCell('=SUM(A1)')).toBe("'=SUM(A1)")
    expect(csvCell('+1')).toBe("'+1")
    expect(csvCell('@cmd')).toBe("'@cmd")
    expect(csvCell('a,b')).toBe('"a,b"')
    expect(csvCell('say "hi"')).toBe('"say ""hi"""')
    expect(csvCell('line\nbreak')).toBe('"line\nbreak"')
    expect(csvCell(null)).toBe('')
  })

  it('builds CSV and TSV', () => {
    expect(toCsv(['A', 'B'], [['1', 'x,y']])).toBe('A,B\r\n1,"x,y"')
    expect(toTsv(['A', 'B'], [['-1', 'a\tb\nc']])).toBe("A\tB\r\n'-1\ta b c")
  })

  it('formats dates as DD Mon YYYY in UTC', () => {
    expect(formatDate('2026-10-01T23:30:00.000Z')).toBe('01 Oct 2026')
    expect(formatDate(null)).toBe('—')
    expect(formatDate('nope')).toBe('—')
  })
})
