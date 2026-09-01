import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import config from '@/payload.config'
import { getPayload } from '@/lib/payload'
import RichText from '../../components/ui/RichText'
import PageBanner from '../../components/PageBanner'
import { getSiteMeta } from '@/lib/siteMeta'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getNewsBySlug(slug: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'news',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
    depth: 1,
  })

  return docs[0] || null
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getNewsBySlug(slug)
  if (!article) return {}

  return {
    title: article.title,
    description: article.excerpt || undefined,
    openGraph:
      article.featuredImage &&
      typeof article.featuredImage === 'object' &&
      article.featuredImage.url
        ? { images: [{ url: article.featuredImage.url }] }
        : undefined,
  }
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params
  const [article, { news }] = await Promise.all([getNewsBySlug(slug), getSiteMeta()])

  if (!article) notFound()

  const featuredImageUrl =
    article.featuredImage &&
    typeof article.featuredImage === 'object' &&
    article.featuredImage.url
      ? article.featuredImage.url
      : null

  const featuredImageAlt =
    article.featuredImage &&
    typeof article.featuredImage === 'object' &&
    article.featuredImage.alt
      ? article.featuredImage.alt
      : article.title

  return (
    <div className="cms-page-shell">
      {/* The breadcrumb label follows the configured listing title, so renaming
          the section in Site Settings renames it here too. */}
      <PageBanner
        title={article.title}
        slug={slug}
        breadcrumbs={[{ label: news.title, href: '/news' }]}
      />
      <section className="py-14 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 p-8 md:p-10">
          {article.category ? (
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-2">
              {article.category}
            </p>
          ) : null}
          {article.publishedDate ? (
            <p className="text-sm text-gray-500 mb-6">{formatDate(article.publishedDate)}</p>
          ) : null}

          {featuredImageUrl ? (
            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-8">
              <Image src={featuredImageUrl} alt={featuredImageAlt} fill className="object-cover" />
            </div>
          ) : null}

          {article.excerpt ? (
            <p className="text-lg text-gray-700 leading-relaxed mb-8">{article.excerpt}</p>
          ) : null}

          {article.content ? <RichText data={article.content} /> : null}
        </div>
      </section>
    </div>
  )
}
