import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import config from '@/payload.config'
import { getPayload } from '@/lib/payload'
import RichText from '../../components/ui/RichText'
import PageBanner from '../../components/PageBanner'
import BlockRenderer from '../../components/BlockRenderer'
import { getSiteMeta } from '@/lib/siteMeta'
import { formatPostDate, mediaOf } from '@/lib/blog'

interface PageProps {
  params: Promise<{ slug: string }>
}

const PRIMARY = 'var(--cms-primary, #04415f)'
const SECONDARY = 'var(--cms-secondary, #011e2c)'
const TEXT = 'var(--cms-text, #010608)'
const tint = (pct: number) => `color-mix(in srgb, ${PRIMARY} ${pct}%, transparent)`

// Runs without a user (access bypassed): the published filter keeps drafts off the site.
async function getNewsBySlug(slug: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'news',
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
    limit: 1,
    depth: 2,
  })
  return docs[0] || null
}

async function getRecentNews(excludeId: number | string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'news',
    where: { and: [{ status: { equals: 'published' } }, { id: { not_equals: excludeId } }] },
    sort: '-publishedDate',
    limit: 4,
    depth: 0,
  })
  return docs
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const [article, { siteName }] = await Promise.all([getNewsBySlug(slug), getSiteMeta()])
  if (!article) return {}
  const image = mediaOf(article.featuredImage)
  return {
    title: `${article.title} — ${siteName}`,
    description: article.excerpt || undefined,
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt || undefined,
      publishedTime: article.publishedDate || undefined,
      images: image?.url ? [{ url: image.url, alt: image.alt || article.title }] : undefined,
    },
  }
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params
  const [article, { news }] = await Promise.all([getNewsBySlug(slug), getSiteMeta()])
  if (!article) notFound()

  const image = mediaOf(article.featuredImage)
  const tags = ((article as any).tags || []).map((t: { tag?: string }) => t?.tag).filter(Boolean) as string[]
  const layout = Array.isArray((article as any).layout) ? (article as any).layout : []
  const recent = await getRecentNews(article.id)

  return (
    <div className="cms-page-shell">
      {/* The breadcrumb label follows the configured listing title. */}
      <PageBanner title={article.title} slug={slug} breadcrumbs={[{ label: news.title, href: '/news' }]} />

      <div className="px-6 py-10 lg:py-14">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          <article className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              {article.category && (
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.1em]"
                  style={{ background: tint(10), color: PRIMARY }}
                >
                  {article.category}
                </span>
              )}
              {article.publishedDate && (
                <time dateTime={article.publishedDate} style={{ color: TEXT, opacity: 0.6 }}>
                  {formatPostDate(article.publishedDate)}
                </time>
              )}
            </div>

            {article.excerpt && (
              <p className="mt-5 text-lg leading-relaxed" style={{ color: TEXT, opacity: 0.8 }}>
                {article.excerpt}
              </p>
            )}

            {image?.url && (
              <figure className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
                <Image
                  src={image.url}
                  alt={image.alt || ''}
                  fill
                  priority
                  sizes="(min-width: 1024px) 860px, 100vw"
                  className="object-cover"
                />
              </figure>
            )}

            {article.content && (
              <div className="cms-richtext mt-10">
                <RichText data={article.content as never} />
              </div>
            )}

            {tags.length > 0 && (
              <ul className="mt-10 flex list-none flex-wrap gap-2 p-0" aria-label="Tags">
                {tags.map((t) => (
                  <li key={t} className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: tint(8), color: PRIMARY }}>
                    #{t}
                  </li>
                ))}
              </ul>
            )}
          </article>

          {recent.length > 0 && (
            <aside aria-labelledby="recent-news" className="lg:sticky lg:top-28 lg:self-start">
              <h2 id="recent-news" className="mb-3 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: TEXT, opacity: 0.6 }}>
                More from {news.title}
              </h2>
              <ul className="m-0 list-none space-y-2 p-0">
                {recent.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={`/news/${n.slug}`}
                      className="block rounded-xl border px-4 py-3 transition-colors hover:bg-white"
                      style={{ borderColor: tint(12), background: tint(3) }}
                    >
                      <span className="line-clamp-2 text-sm font-semibold leading-snug" style={{ color: SECONDARY }}>
                        {n.title}
                      </span>
                      {n.publishedDate && (
                        <span className="mt-1 block text-xs" style={{ color: TEXT, opacity: 0.55 }}>
                          {formatPostDate(n.publishedDate)}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </div>

      {/* Optional extra content blocks added to the article in the CMS. */}
      {layout.length > 0 && <BlockRenderer blocks={layout} />}
    </div>
  )
}
