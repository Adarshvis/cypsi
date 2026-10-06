/**
 * Reads research domains for the public site.
 *
 * These run through the Local API without a user (access control bypassed), so
 * the explicit `status: published` filter is what keeps drafts off the site.
 */
import config from '@/payload.config'
import { getPayload } from '@/lib/payload'
import type { ResearchDomain } from '@/payload-types'

export type { ResearchDomain }

export async function getPublishedDomains(): Promise<ResearchDomain[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'research-domains',
    where: { status: { equals: 'published' } },
    sort: ['sortOrder', 'title'],
    depth: 1,
    limit: 200,
  })
  return docs as ResearchDomain[]
}

export async function getDomainBySlug(slug: string): Promise<ResearchDomain | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'research-domains',
    where: { and: [{ status: { equals: 'published' } }, { slug: { equals: slug } }] },
    limit: 1,
    depth: 1,
  })
  return (docs[0] as ResearchDomain) || null
}

/**
 * Lucide component name from what an editor stored. The field used to be free
 * text with hints like "cpu" or "shield-check"; the picker stores "Cpu".
 */
export function iconName(raw?: string | null): string | null {
  const v = raw?.trim()
  if (!v) return null
  if (/^[A-Z]/.test(v)) return v
  return v
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('')
}
