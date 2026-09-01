'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import DynamicIcon from '../ui/DynamicIcon'
import SectionHeading from '../ui/SectionHeading'
import ScrollReveal from '../ui/ScrollReveal'
import { ArrowRight, Calendar } from 'lucide-react'

interface ArticleData {
  title: string
  excerpt?: string | null
  image?: any
  category?: string | null
  date?: string | null
  url?: string | null
  icon?: string | null
  categoryColor?: string | null
  id?: string | null
}

interface NewsUpdatesBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  layout?: 'cards' | 'spotlight' | 'duccCards' | null
  entryType?: 'manual' | 'collection' | null
  articles?: ArticleData[]
  collectionSource?: {
    limit?: number | null
    sortBy?: 'latest' | 'oldest' | null
    category?: string | null
    featuredOnly?: boolean | null
  } | null
  columns?: '2' | '3' | null
  bottomLink?: {
    enabled?: boolean | null
    label?: string | null
    url?: string | null
  } | null
  backgroundColor?: string | null
}

interface NewsCollectionDoc {
  id?: string | number
  title: string
  excerpt?: string | null
  featuredImage?: any
  category?: string | null
  publishedDate?: string | null
  slug?: string | null
}

const columnClasses: Record<string, string> = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function buildNewsApiUrl(collectionSource?: NewsUpdatesBlockProps['collectionSource']) {
  const params = new URLSearchParams()
  const limit =
    typeof collectionSource?.limit === 'number' && collectionSource.limit > 0
      ? collectionSource.limit
      : 6

  params.set('limit', String(limit))
  params.set('depth', '1')
  params.set('where[status][equals]', 'published')
  params.set('sort', collectionSource?.sortBy === 'oldest' ? 'publishedDate' : '-publishedDate')

  if (collectionSource?.featuredOnly) {
    params.set('where[isFeatured][equals]', 'true')
  }

  if (collectionSource?.category && collectionSource.category.trim()) {
    params.set('where[category][equals]', collectionSource.category.trim())
  }

  return `/api/news?${params.toString()}`
}

function mapNewsDocToArticle(doc: NewsCollectionDoc): ArticleData {
  return {
    id: typeof doc.id === 'string' || typeof doc.id === 'number' ? String(doc.id) : null,
    title: doc.title,
    excerpt: doc.excerpt || null,
    image: doc.featuredImage,
    category: doc.category || null,
    date: doc.publishedDate || null,
    url: doc.slug ? `/news/${doc.slug}` : null,
  }
}

// ── News Card ──
function NewsCard({ article }: { article: ArticleData }) {
  const imgUrl = typeof article.image === 'object' && article.image?.url ? article.image.url : null
  const catColor = article.categoryColor || '#3B82F6'

  const content = (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1">
      {imgUrl && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={imgUrl}
            alt={typeof article.image === 'object' ? article.image.alt || article.title : article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {article.category && (
            <span
              className="absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: catColor }}
            >
              {article.icon && <DynamicIcon name={article.icon} size={12} className="inline mr-1" />}
              {article.category}
            </span>
          )}
        </div>
      )}
      <div className="p-5">
        {article.date && (
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
            <Calendar size={12} />
            {formatDate(article.date)}
          </div>
        )}
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{article.excerpt}</p>
        )}
        {article.url && (
          <div className="mt-3 inline-flex items-center gap-1 text-blue-600 text-sm font-medium">
            Read More
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </div>
        )}
      </div>
    </div>
  )

  if (article.url) {
    return <a href={article.url} className="block">{content}</a>
  }
  return content
}

// ── Spotlight Layout ──
function SpotlightLayout({ articles }: { articles: ArticleData[] }) {
  if (articles.length === 0) return null

  const featured = articles[0]
  const sideArticles = articles.slice(1, 5)
  const featuredImg =
    typeof featured.image === 'object' && featured.image?.url ? featured.image.url : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      {/* Featured article — image on top, content below */}
      <ScrollReveal className="h-full">
        <div className="bg-white rounded-2xl overflow-hidden border h-full flex flex-col" style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)' }}>
          {featuredImg && (
            <div className="relative overflow-hidden" style={{ aspectRatio: '16 / 10' }}>
              <img
                src={featuredImg}
                alt={featured.title}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {featured.category && (
                <span
                  className="absolute top-4 right-4 text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full text-white"
                  style={{ background: 'var(--cms-secondary, #1A103D)' }}
                >
                  {featured.category}
                </span>
              )}
            </div>
          )}
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-xl font-bold ducc-heading leading-tight" style={{ color: 'var(--cms-secondary, #1A103D)' }}>
              {featured.title}
            </h3>
            {featured.date && (
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(featured.date)}</span>
              </div>
            )}
            {featured.excerpt && (
              <p className="text-sm text-gray-600 leading-relaxed mt-3 flex-1">{featured.excerpt}</p>
            )}
            {featured.url && (
              <a
                href={featured.url}
                className="btn-shine mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-full transition hover:brightness-110 w-fit"
                style={{ background: 'var(--cms-secondary, #1A103D)' }}
              >
                Read More
              </a>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Side list — the column fills the featured card's height and the items
          share it equally, so both halves of the row end on the same line. */}
      <div className="flex flex-col gap-3 h-full">
        {sideArticles.map((article, i) => {
          const imgUrl =
            typeof article.image === 'object' && article.image?.url ? article.image.url : null

          return (
            <ScrollReveal key={article.id || i} delay={i * 100} className="flex-1 min-h-0">
              <a
                href={article.url || '#'}
                className="group flex h-full items-center gap-4 bg-white rounded-xl p-4 border transition-all hover:shadow-md"
                style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)' }}
              >
                {imgUrl && (
                  <div className="w-[70px] h-[70px] rounded-lg overflow-hidden shrink-0">
                    <img
                      src={imgUrl}
                      alt={article.title}
                      style={{ width: '70px', height: '70px', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4
                    className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-[--cms-primary] transition-colors"
                    style={{ color: 'var(--cms-secondary, #1A103D)' }}
                  >
                    {article.title}
                  </h4>
                  {article.excerpt && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{article.excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    {article.category && (
                      <span className="text-[9px] font-bold tracking-wider uppercase" style={{ color: 'var(--cms-primary, #4B2E83)' }}>
                        {article.category}
                      </span>
                    )}
                    {article.date && (
                      <span className="text-[10px] text-gray-400">{formatDate(article.date)}</span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 shrink-0 self-center text-gray-300 group-hover:text-[--cms-primary] transition-colors" />
              </a>
            </ScrollReveal>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Block ──
export default function NewsUpdatesBlock(props: NewsUpdatesBlockProps) {
  const {
    sectionHeading,
    sectionDescription,
    headingAlignment,
    layout = 'cards',
    entryType = 'manual',
    articles,
    collectionSource,
    columns = '3',
    bottomLink,
    backgroundColor = 'var(--bg-muted)',
  } = props

  const [fetchedArticles, setFetchedArticles] = useState<ArticleData[]>([])
  const [loadingFetchedArticles, setLoadingFetchedArticles] = useState(false)

  useEffect(() => {
    if (entryType !== 'collection') {
      setFetchedArticles([])
      return
    }

    let active = true

    async function fetchCollectionNews() {
      try {
        setLoadingFetchedArticles(true)
        const res = await fetch(buildNewsApiUrl(collectionSource), {
          credentials: 'same-origin',
        })

        if (!res.ok) {
          throw new Error('Failed to fetch news collection')
        }

        const data = await res.json()
        const docs = Array.isArray(data?.docs) ? (data.docs as NewsCollectionDoc[]) : []

        if (active) {
          setFetchedArticles(docs.map(mapNewsDocToArticle))
        }
      } catch {
        if (active) {
          setFetchedArticles([])
        }
      } finally {
        if (active) {
          setLoadingFetchedArticles(false)
        }
      }
    }

    void fetchCollectionNews()

    return () => {
      active = false
    }
  }, [entryType, collectionSource?.category, collectionSource?.featuredOnly, collectionSource?.limit, collectionSource?.sortBy])

  const displayArticles = useMemo(() => {
    if (entryType === 'collection') return fetchedArticles
    return articles || []
  }, [articles, entryType, fetchedArticles])

  if (loadingFetchedArticles && entryType === 'collection' && displayArticles.length === 0) {
    return (
      <section className="py-16 px-6" style={{ backgroundColor: backgroundColor || 'var(--bg-muted)' }}>
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            heading={sectionHeading}
            description={sectionDescription}
            alignment={headingAlignment}
          />
          <p>Loading news...</p>
        </div>
      </section>
    )
  }

  if (!displayArticles || displayArticles.length === 0) return null

  /* ── News cards layout ── */
  if (layout === 'duccCards') {
    return (
      <section className="py-24 px-6" style={{ backgroundColor: backgroundColor || '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
            <div>
              {sectionDescription && (
                <span
                  className="text-xs font-bold tracking-[0.2em] uppercase"
                  style={{ color: 'var(--cms-primary, #4B2E83)' }}
                >
                  {sectionDescription}
                </span>
              )}
              {sectionHeading && (
                <h2
                  className="mt-3 text-4xl md:text-5xl font-bold tracking-tight ducc-heading"
                  style={{ color: 'var(--cms-secondary, #1A103D)' }}
                >
                  {sectionHeading}
                </h2>
              )}
            </div>
            {bottomLink?.enabled && bottomLink.label && bottomLink.url && (
              <a
                href={bottomLink.url}
                className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
                style={{ color: 'var(--cms-primary, #4B2E83)' }}
              >
                {bottomLink.label} <ArrowRight size={16} />
              </a>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayArticles.slice(0, 3).map((article, i) => {
              const imgUrl =
                typeof article.image === 'object' && article.image?.url
                  ? article.image.url
                  : null

              return (
                <article
                  key={article.id || i}
                  className="card-hover group bg-white rounded-2xl overflow-hidden border"
                  style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)' }}
                >
                  {imgUrl && (
                    <div className="relative overflow-hidden" style={{ aspectRatio: '16 / 10' }}>
                      <img
                        src={imgUrl}
                        alt={article.title}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        className="group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      {article.category && (
                        <span
                          className="absolute top-4 left-4 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full"
                          style={{
                            background: 'var(--cms-accent, #EAB308)',
                            color: 'var(--cms-secondary, #1A103D)',
                          }}
                        >
                          {article.category}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-6">
                    {article.date && (
                      <div className="text-xs text-gray-500 font-medium">
                        {formatDate(article.date)}
                      </div>
                    )}
                    <h3
                      className="mt-2 text-lg font-bold leading-snug group-hover:text-[--cms-primary] transition-colors"
                      style={{ color: 'var(--cms-secondary, #1A103D)' }}
                    >
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-2">{article.excerpt}</p>
                    )}
                    <div
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold group-hover:gap-2.5 transition-all"
                      style={{ color: 'var(--cms-primary, #4B2E83)' }}
                    >
                      {article.url ? (
                        <a href={article.url} className="inline-flex items-center gap-1.5">
                          Read more <ArrowRight size={14} />
                        </a>
                      ) : (
                        <>Read more <ArrowRight size={14} /></>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  const style = layout || 'cards'
  const cols = columns || '3'

  return (
    <section className="py-16 px-6" style={{ backgroundColor: backgroundColor || 'var(--bg-muted)' }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          heading={sectionHeading}
          description={sectionDescription}
          alignment={headingAlignment}
        />

        {style === 'spotlight' ? (
          <SpotlightLayout articles={displayArticles} />
        ) : (
          <div className={`grid ${columnClasses[cols]} gap-6`}>
            {displayArticles.map((article, i) => (
              <ScrollReveal key={article.id || i} delay={i * 100}>
                <NewsCard article={article} />
              </ScrollReveal>
            ))}
          </div>
        )}

        {bottomLink?.enabled && bottomLink.label && bottomLink.url && (
          <div className="mt-10 text-center">
            <a
              href={bottomLink.url}
              className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              {bottomLink.label}
              <ArrowRight size={18} />
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
