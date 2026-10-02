/**
 * Reads blog posts for the public site.
 *
 * Every query filters `status: published` explicitly. These run through the
 * Local API without a user (access control bypassed), so the filter is what
 * keeps drafts off the site — never remove it.
 */
import type { Where } from 'payload'
import config from '@/payload.config'
import { getPayload } from '@/lib/payload'
import type { BlogPost, Media } from '@/payload-types'

export type { BlogPost }

const PUBLISHED: Where = { status: { equals: 'published' } }

export async function getPublishedPosts({
  limit = 100,
  category,
  featuredOnly = false,
}: { limit?: number; category?: string | null; featuredOnly?: boolean } = {}): Promise<BlogPost[]> {
  const payload = await getPayload({ config })
  const and: Where[] = [PUBLISHED]
  if (category?.trim()) and.push({ category: { equals: category.trim() } })
  if (featuredOnly) and.push({ isFeatured: { equals: true } })
  const { docs } = await payload.find({
    collection: 'blog-posts',
    where: { and },
    sort: '-publishedDate',
    depth: 1,
    limit,
  })
  return docs as BlogPost[]
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'blog-posts',
    where: { and: [PUBLISHED, { slug: { equals: slug } }] },
    limit: 1,
    depth: 1,
  })
  return (docs[0] as BlogPost) || null
}

export const mediaOf = (m: unknown): Media | null =>
  m && typeof m === 'object' && 'url' in (m as Media) && (m as Media).url ? (m as Media) : null

export function formatPostDate(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
}
