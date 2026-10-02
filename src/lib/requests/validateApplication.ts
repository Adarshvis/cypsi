/**
 * Validation for public internship applications submitted to `POST /api/apply`.
 *
 * Kept free of Payload and Next imports so it can be unit tested without a
 * database. The route trusts nothing from the request beyond what this returns.
 * Only the names defined on the form (plus `domain` and `resume`) are read:
 * `status`, `submittedAt`, `extraFields` or a resume id sent by the client are
 * never looked at, and the server sets those itself.
 */
import {
  INTERNSHIP_HINT_KEYS,
  mapFieldsByHint,
  type FormFieldDef,
  type HintEntry,
} from './fieldHints'

export const MAX_RESUME_BYTES = 5 * 1024 * 1024

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const PHONE_RE = /^[0-9+()\-\s]{6,30}$/

const MAX_EXTRA_FIELDS = 50
const MAX_EXTRA_VALUE = 2000
const MAX_EXTRA_KEY = 200

export interface InternshipApplicationData {
  name: string
  email: string
  phone?: string
  domain: string
  institution?: string
  yearOrSemester?: string
}

export type InternshipValidationResult =
  | {
      ok: true
      data: InternshipApplicationData
      extraFields: Record<string, string>
      file: File
    }
  | { ok: false; status: 400 | 413; error: string }

export type ApplicationFormField = FormFieldDef & { required?: boolean | null }

interface ValidateInput {
  /** The form definition loaded on the server, never the client's copy. */
  fields: ApplicationFormField[] | null | undefined
  get: (name: string) => FormDataEntryValue | null
}

const fail = (error: string, status: 400 | 413 = 400): InternshipValidationResult => ({
  ok: false,
  status,
  error,
})

/** True when the bytes start with the PDF signature `%PDF-`. */
export function isPdfMagic(buf: Uint8Array): boolean {
  const sig = [0x25, 0x50, 0x44, 0x46, 0x2d]
  if (!buf || buf.length < sig.length) return false
  return sig.every((byte, i) => buf[i] === byte)
}

function stringValue(entry: FormDataEntryValue | null): string {
  return typeof entry === 'string' ? entry.trim() : ''
}

export function validateInternshipApplication({
  fields,
  get,
}: ValidateInput): InternshipValidationResult {
  const entries: HintEntry[] = []

  for (const field of fields || []) {
    if (field.blockType === 'message' || field.blockType === 'resumeUpload') continue
    const name = typeof field.name === 'string' ? field.name : ''
    if (!name) continue

    let value = stringValue(get(name))
    if (field.blockType === 'checkbox') value = value === 'true' ? 'Yes' : ''

    if (field.required && !value) {
      return fail(`Please fill in "${field.label?.trim() || name}".`)
    }
    entries.push({ name, label: field.label, blockType: field.blockType, value })
  }

  const { mapped, rest } = mapFieldsByHint(entries, INTERNSHIP_HINT_KEYS)

  const name = mapped.name || ''
  const email = mapped.email || ''
  const phone = mapped.phone || ''
  const domain = mapped.domain || stringValue(get('domain'))
  const institution = mapped.institution || ''
  const yearOrSemester = mapped.yearOrSemester || ''

  if (!name) return fail('Please enter your full name.')
  if (name.length < 2 || name.length > 120) {
    return fail('Name must be between 2 and 120 characters.')
  }

  if (!email) return fail('Please enter your email address.')
  if (email.length > 254 || !EMAIL_RE.test(email)) return fail('Please enter a valid email address.')

  if (phone && !PHONE_RE.test(phone)) return fail('Please enter a valid phone number.')

  if (!domain) return fail('Please choose the internship domain you are applying for.')
  if (domain.length > 200) return fail('Domain must be 200 characters or fewer.')
  if (institution.length > 200) return fail('College / University must be 200 characters or fewer.')
  if (yearOrSemester.length > 50) return fail('Year / Semester must be 50 characters or fewer.')

  if (rest.length > MAX_EXTRA_FIELDS) return fail('Too many fields in this form.')
  const extraFields: Record<string, string> = {}
  for (const { key, value } of rest) {
    if (key.length > MAX_EXTRA_KEY) return fail('A field label is too long.')
    if (value.length > MAX_EXTRA_VALUE) {
      return fail(`"${key}" must be ${MAX_EXTRA_VALUE} characters or fewer.`)
    }
    // Two fields with the same label must not overwrite each other.
    let unique = key
    for (let n = 2; unique in extraFields; n++) unique = `${key} (${n})`
    extraFields[unique] = value
  }

  const resume = get('resume')
  if (!resume || typeof resume === 'string' || typeof (resume as Blob).size !== 'number') {
    return fail('Please attach your resume as a PDF.')
  }
  const file = resume as File
  if (file.size <= 0) return fail('The resume file is empty.')
  if (file.size > MAX_RESUME_BYTES) return fail('Resume must be 5 MB or smaller.', 413)
  if (file.type !== 'application/pdf') return fail('Only PDF resumes are accepted.')

  const data: InternshipApplicationData = { name, email, domain }
  if (phone) data.phone = phone
  if (institution) data.institution = institution
  if (yearOrSemester) data.yearOrSemester = yearOrSemester

  return { ok: true, data, extraFields, file }
}
