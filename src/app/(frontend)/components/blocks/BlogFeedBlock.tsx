import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import BlogCard from '../blog/BlogCard'
import { getPublishedPosts } from '@/lib/blog'
import { safeHref } from '@/lib/safeEmbedUrl'

interface BlogFeedBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  limit?: number | null
  category?: string | null
  featuredOnly?: boolean | null
  linkLabel?: string | null
  linkUrl?: string | null
  backgroundColor?: string | null
}

export default async function BlogFeedBlock({
  sectionHeading,
  sectionDescription,
  headingAlignment,
  limit,
  category,
  featuredOnly,
  linkLabel,
  linkUrl,
  backgroundColor,
}: BlogFeedBlockProps) {
  const posts = await getPublishedPosts({
    limit: Math.min(Math.max(limit || 3, 1), 12),
    category,
    featuredOnly: Boolean(featuredOnly),
  })
  if (!posts.length) return null

  const href = safeHref(linkUrl)

  return (
    <section className="px-6 py-12 lg:py-14" style={{ backgroundColor: backgroundColor || undefined }}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
        <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <li key={p.id}>
              <BlogCard post={p} />
            </li>
          ))}
        </ul>
        {href && linkLabel && (
          <div className="mt-8 text-center">
            <Link
              href={href}
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: 'var(--cms-primary, #04415f)' }}
            >
              {linkLabel}
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
