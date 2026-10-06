import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import RichText from '../../components/ui/RichText'
import PageBanner from '../../components/PageBanner'
import BlogCard, { AuthorAvatar } from '../../components/blog/BlogCard'
import { formatPostDate, getPostBySlug, getPublishedPosts, mediaOf } from '@/lib/blog'
import { getSiteMeta } from '@/lib/siteMeta'

interface PageProps {
  params: Promise<{ slug: string }>
}

const PRIMARY = 'var(--cms-primary, #04415f)'
const SECONDARY = 'var(--cms-secondary, #011e2c)'
const TEXT = 'var(--cms-text, #010608)'
const tint = (pct: number) => `color-mix(in srgb, ${PRIMARY} ${pct}%, transparent)`

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const [post, { siteName }] = await Promise.all([getPostBySlug(slug), getSiteMeta()])
  if (!post) return {}
  const image = mediaOf(post.featuredImage)
  const description = post.metaDescription || post.shortDescription
  return {
    title: `${post.title} — ${siteName}`,
    description,
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      publishedTime: post.publishedDate,
      authors: [post.authorName],
      images: image?.url ? [{ url: image.url, alt: image.alt || post.title }] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const [post, { blog }] = await Promise.all([getPostBySlug(slug), getSiteMeta()])
  if (!post) notFound()

  const image = mediaOf(post.featuredImage)
  const tags = (post.tags || []).map((t) => t.tag).filter(Boolean)
  const related = (
    await getPublishedPosts({ limit: 4, category: post.category || undefined })
  ).filter((p) => p.id !== post.id).slice(0, 3)

  return (
    <div className="cms-page-shell">
      <PageBanner title={post.title} slug={slug} breadcrumbs={[{ label: blog.title, href: '/blog' }]} />

      <article className="px-6 py-10 lg:py-14">
        <div className="mx-auto max-w-3xl">
          <header>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {post.category && (
                <Link
                  href={`/blog?category=${encodeURIComponent(post.category)}`}
                  className="font-bold uppercase tracking-[0.12em] hover:underline"
                  style={{ color: PRIMARY }}
                >
                  {post.category}
                </Link>
              )}
              <time dateTime={post.publishedDate} style={{ color: TEXT, opacity: 0.6 }}>
                {formatPostDate(post.publishedDate)}
              </time>
              {post.readTime && (
                <span className="inline-flex items-center gap-1" style={{ color: TEXT, opacity: 0.6 }}>
                  <Clock size={13} aria-hidden />
                  {post.readTime}
                </span>
              )}
            </div>

            {/* The title is the page banner's h1, so it is not repeated here. */}
            <p className="mt-4 text-lg leading-relaxed" style={{ color: TEXT, opacity: 0.75 }}>
              {post.shortDescription}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <AuthorAvatar post={post} size={44} />
              <span className="leading-tight">
                <span className="block font-semibold" style={{ color: SECONDARY }}>
                  {post.authorName}
                </span>
                {post.authorRole && (
                  <span className="block text-sm" style={{ color: TEXT, opacity: 0.6 }}>
                    {post.authorRole}
                  </span>
                )}
              </span>
            </div>
          </header>

          {image?.url && (
            <figure className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
              <Image
                src={image.url}
                alt={image.alt || ''}
                fill
                priority
                sizes="(min-width: 768px) 768px, 100vw"
                className="object-cover"
              />
            </figure>
          )}

          <div className="cms-richtext mt-10">
            <RichText data={post.content as never} />
          </div>

          {tags.length > 0 && (
            <ul className="mt-10 flex list-none flex-wrap gap-2 p-0" aria-label="Tags">
              {tags.map((t) => (
                <li
                  key={t}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: tint(8), color: PRIMARY }}
                >
                  #{t}
                </li>
              ))}
            </ul>
          )}

          {(post.authorBio || post.authorRole) && (
            <aside
              aria-label="About the author"
              className="mt-10 flex gap-4 rounded-2xl border p-6"
              style={{ borderColor: tint(12), background: tint(4) }}
            >
              <AuthorAvatar post={post} size={56} />
              <div>
                <p className="m-0 font-semibold" style={{ color: SECONDARY }}>
                  {post.authorName}
                </p>
                {post.authorRole && (
                  <p className="m-0 text-sm" style={{ color: PRIMARY }}>
                    {post.authorRole}
                  </p>
                )}
                {post.authorBio && (
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: TEXT, opacity: 0.75 }}>
                    {post.authorBio}
                  </p>
                )}
              </div>
            </aside>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-posts" className="px-6 pb-14">
          <div className="mx-auto max-w-7xl">
            <h2 id="related-posts" className="ducc-heading mb-6 text-2xl font-bold" style={{ color: SECONDARY }}>
              More from {blog.title}
            </h2>
            <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.id}>
                  <BlogCard post={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}
