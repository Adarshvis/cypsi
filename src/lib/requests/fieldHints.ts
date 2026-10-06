/**
 * Maps Form Builder fields onto the known Requests Dashboard columns by their
 * name and label ("hints"), so editors can build the forms freely.
 *
 * Used on the server by `/api/apply` (internship applications) and in the
 * admin dashboard (contact enquiries). No imports, so it runs in both places
 * and can be unit tested without a database.
 *
 * Matching is case-insensitive against `${name} ${label}`. Each field takes the
 * FIRST key it matches in HINT_ORDER, so "College Name" is an institution, not
 * a name. Each key takes the first field that lands on it; every other value
 * is returned in `rest` (export-only data), so nothing is ever dropped.
 */

export type FormFieldDef = {
  name?: string | null
  label?: string | null
  blockType: string
}

export type HintKey =
  | 'email'
  | 'phone'
  | 'institution'
  | 'yearOrSemester'
  | 'domain'
  | 'subject'
  | 'message'
  | 'name'

/** Priority order: earlier keys win when a field matches several. */
export const HINT_ORDER: HintKey[] = [
  'email',
  'phone',
  'institution',
  'yearOrSemester',
  'domain',
  'subject',
  'message',
  'name',
]

const HINT_RULES: Record<HintKey, RegExp> = {
  email: /e-?mail/,
  phone: /phone|mobile|whatsapp|contact\s*(no|number)/,
  institution: /college|university|institut|school/,
  yearOrSemester: /\byear\b|semester|\bsem\b/,
  // Also tolerates the common misspellings ("domin", "domian", "doamin").
  domain:
    /domain|domin|domian|doamin|position|\brole\b|applying\s*for|area\s*of\s*interest|interested\s*in|track|speciali[sz]ation/,
  subject: /subject|topic|regarding/,
  message: /message|enquiry|inquiry|query|comment|details/,
  name: /applicant|full\s*name|\bname\b/,
}

export const INTERNSHIP_HINT_KEYS: HintKey[] = [
  'email',
  'phone',
  'institution',
  'yearOrSemester',
  'domain',
  'name',
]

export const ENQUIRY_HINT_KEYS: HintKey[] = ['email', 'phone', 'subject', 'message', 'name']

function hintText(field: FormFieldDef): string {
  return `${field.name || ''} ${field.label || ''}`.toLowerCase()
}

/** True when the field's name/label (or, for email, its type) matches the key's rule. */
export function matchHint(field: FormFieldDef, key: HintKey): boolean {
  if (key === 'email' && field.blockType === 'email') return true
  // A long answer ("Why this domain?") is never the domain itself.
  if (key === 'domain' && field.blockType === 'textarea') return false
  return HINT_RULES[key].test(hintText(field))
}

/** The first key in HINT_ORDER the field matches, or null. */
export function classifyField(field: FormFieldDef): HintKey | null {
  for (const key of HINT_ORDER) {
    if (matchHint(field, key)) return key
  }
  return null
}

/** True when the field's name/label marks it as the internship domain field. */
export function isDomainField(field: FormFieldDef): boolean {
  return classifyField(field) === 'domain'
}

/** Choice fields that can stand in for the domain when none is named like one. */
const DOMAIN_FALLBACK_TYPES = new Set(['select', 'radio'])

function isDomainFallback(field: FormFieldDef): boolean {
  return DOMAIN_FALLBACK_TYPES.has(field.blockType) && classifyField(field) === null
}

/**
 * The form's internship domain field: the first field named like a domain,
 * else the first dropdown/radio no other hint claims (e.g. a field labelled
 * just "Select"). Matches what `mapFieldsByHint` maps to `domain`.
 */
export function findDomainField<T extends FormFieldDef>(fields: T[]): T | undefined {
  const usable = fields.filter((field) => field.name && field.blockType !== 'resumeUpload')
  return usable.find(isDomainField) ?? usable.find(isDomainFallback)
}

export type HintEntry = FormFieldDef & { name: string; value: string }

export interface HintMapResult {
  mapped: Partial<Record<HintKey, string>>
  rest: { key: string; value: string }[]
}

/**
 * Splits submitted values into the requested keys and the rest.
 * Empty values are skipped. `rest` keys are the field label, else its name.
 */
export function mapFieldsByHint(entries: HintEntry[], keys: HintKey[]): HintMapResult {
  const mapped: Partial<Record<HintKey, string>> = {}
  const leftovers: { entry: HintEntry; value: string; classified: boolean }[] = []

  for (const entry of entries) {
    const value = typeof entry.value === 'string' ? entry.value.trim() : ''
    if (!value) continue
    const key = classifyField(entry)
    if (key && keys.includes(key) && mapped[key] === undefined) {
      mapped[key] = value
      continue
    }
    leftovers.push({ entry, value, classified: key !== null })
  }

  // An unlabelled dropdown/radio ("Select") is the domain when nothing else claimed it.
  if (keys.includes('domain') && mapped.domain === undefined) {
    const index = leftovers.findIndex((l) => !l.classified && isDomainFallback(l.entry))
    if (index !== -1) {
      mapped.domain = leftovers[index].value
      leftovers.splice(index, 1)
    }
  }

  // A plain textarea ("Your note") is the message when nothing else claimed it.
  if (keys.includes('message') && mapped.message === undefined) {
    const index = leftovers.findIndex((l) => !l.classified && l.entry.blockType === 'textarea')
    if (index !== -1) {
      mapped.message = leftovers[index].value
      leftovers.splice(index, 1)
    }
  }

  const rest = leftovers.map(({ entry, value }) => ({
    key: entry.label?.trim() || entry.name,
    value,
  }))

  return { mapped, rest }
}
