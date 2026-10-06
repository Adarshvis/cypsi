/**
 * Reads Work With Us programmes for the public site.
 *
 * Local API without a user (access bypassed): the explicit `status: published`
 * filter is what keeps drafts off the site.
 */
import config from '@/payload.config'
import { getPayload } from '@/lib/payload'
import type { WorkWithUs } from '@/payload-types'

export type Programme = WorkWithUs

export async function getPublishedProgrammes(): Promise<Programme[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'work-with-us',
    where: { status: { equals: 'published' } },
    sort: ['sortOrder', 'title'],
    depth: 1,
    limit: 200,
  })
  return docs as Programme[]
}

export async function getProgrammeBySlug(slug: string): Promise<Programme | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'work-with-us',
    where: { and: [{ status: { equals: 'published' } }, { slug: { equals: slug } }] },
    limit: 1,
    depth: 1,
  })
  return (docs[0] as Programme) || null
}
