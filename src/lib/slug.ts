import type { CollectionBeforeValidateHook, CollectionSlug, Validate } from 'payload'
import { ValidationError } from 'payload'

/** Lowercase Latin letters, numbers and single hyphens, e.g. "my-first-post". */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** "Hello World: IoT & Security!" → "hello-world-iot-security". Non-Latin text yields "". */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents (é → e)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 96)
    .replace(/-$/, '')
}

/**
 * Field-level validate for a slug that the hook below may fill in.
 *
 * Replacing Payload's default validator matters: the default enforces
 * `required` in the admin form before the hook can run, which would block
 * saving with the slug left empty. The column stays NOT NULL because the hook
 * always provides a value or rejects the save.
 */
export const validateSlug: Validate = (value) => {
  if (value === undefined || value === null || value === '') return true
  if (typeof value !== 'string' || !SLUG_PATTERN.test(value)) {
    return 'Use lowercase letters, numbers and hyphens only, e.g. "my-first-post".'
  }
  return true
}

/**
 * Generates, normalises and de-duplicates a slug before validation.
 *
 * - empty slug → made from the source field (title)
 * - typed slug → normalised ("My Post!!" → "my-post")
 * - already used by another document → "-2", "-3", …
 * - existing slugs are kept when the title changes, so old links keep working
 */
export function uniqueSlugHook({
  collection,
  source = 'title',
}: {
  collection: CollectionSlug
  source?: string
}): CollectionBeforeValidateHook {
  return async ({ data, originalDoc, req }) => {
    if (!data) return data

    const typed = typeof data.slug === 'string' ? data.slug.trim() : ''
    const keep = !typed && data.slug === undefined ? originalDoc?.slug : undefined
    const sourceText = typeof data[source] === 'string' ? data[source] : originalDoc?.[source] || ''
    const base = keep || slugify(typed || sourceText)

    if (!base) {
      throw new ValidationError({
        collection,
        errors: [
          {
            path: 'slug',
            message:
              'A web address could not be made from this title. Please type a slug using Latin letters, numbers and hyphens, e.g. "cyber-security-basics".',
          },
        ],
      })
    }

    // Find the first free variant, ignoring this document's own row.
    const id = originalDoc?.id
    let candidate = base
    for (let n = 2; n < 1000; n++) {
      const { totalDocs } = await req.payload.count({
        collection,
        where: {
          and: [{ slug: { equals: candidate } }, ...(id ? [{ id: { not_equals: id } }] : [])],
        },
        overrideAccess: true, // must see drafts too
        req,
      })
      if (totalDocs === 0) break
      candidate = `${base}-${n}`
    }

    data.slug = candidate
    return data
  }
}
