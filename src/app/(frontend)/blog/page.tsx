import type { Metadata } from 'next'
import Link from 'next/link'
import PageBanner from '../components/PageBanner'
import BlogCard from '../components/blog/BlogCard'
import { getPublishedPosts } from '@/lib/blog'
import { getSiteMeta } from '@/lib/siteMeta'

interface PageProps {
  searchParams: Promise<{ category?: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const { blog } = await getSiteMeta()
  return { title: blog.metaTitle, description: blog.metaDescription }
}

export default async function BlogListingPage({ searchParams }: PageProps) {
  const { category } = await searchParams
  const [allPosts, { blog }] = await Promise.all([getPublishedPosts(), getSiteMeta()])

  // Categories come from the posts themselves, so new ones appear automatically.
  const categories = [...new Set(allPosts.map((p) => p.category?.trim()).filter((c): c is string => Boolean(c)))].sort()
  const active = category && categories.includes(category) ? category : null
  const posts = active ? allPosts.filter((p) => p.category?.trim() === active) : allPosts

  // The newest featured post leads the page when no category is selected.
  const lead = !active ? posts.find((p) => p.isFeatured) || null : null
  const rest = lead ? posts.filter((p) => p.id !== lead.id) : posts

  const pill = (label: string, href: string, on: boolean) => (
    <Link
      key={href}
      href={href}
      aria-current={on ? 'page' : undefined}
      className="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
      style={
        on
          ? { background: 'var(--cms-primary, #04415f)', borderColor: 'var(--cms-primary, #04415f)', color: '#fff' }
          : { borderColor: 'color-mix(in srgb, var(--cms-primary, #04415f) 22%, transparent)', color: 'var(--cms-text, #010608)' }
      }
    >
      {label}
    </Link>
  )

  return (
    <div className="cms-page-shell">
      {/* Heading and intro come from Site Settings → Listing Page Titles → Blog. */}
      <PageBanner title={blog.title} eyebrow={blog.eyebrow} description={blog.description} />

      <section className="px-6 py-12 lg:py-14">
        <div className="mx-auto max-w-7xl">
          {categories.length > 1 && (
            <nav aria-label="Filter by category" className="mb-8 flex flex-wrap gap-2">
              {pill('All', '/blog', !active)}
              {categories.map((c) => pill(c, `/blog?category=${encodeURIComponent(c)}`, active === c))}
            </nav>
          )}

          {posts.length === 0 ? (
            <p className="py-16 text-center" style={{ color: 'var(--cms-text, #010608)', opacity: 0.6 }}>
              No posts yet.
            </p>
          ) : (
            <>
              {lead && (
                <div className="mb-8">
                  <BlogCard post={lead} featured />
                </div>
              )}
              {rest.length > 0 && (
                <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((p) => (
                    <li key={p.id}>
                      <BlogCard post={p} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
