'use client'

import React, { useState } from 'react'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  category?: string | null
  publishedDate?: string | null
  featuredImage?: { url?: string; alt?: string } | null
  isFeatured?: boolean
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function getImageUrl(article: Article): string | null {
  return typeof article.featuredImage === 'object' && article.featuredImage?.url
    ? article.featuredImage.url
    : null
}

export default function NewsListing({
  articles,
  /** Shown as the source beside each card. From Site Settings, not a literal. */
  siteName,
}: {
  articles: Article[]
  siteName?: string
}) {
  const [tab, setTab] = useState<'top' | 'trending' | 'latest'>('top')

  const featured = articles.find((a) => a.isFeatured) || articles[0]
  const rest = articles.filter((a) => a.id !== featured?.id)

  const sidebarArticles = (() => {
    if (tab === 'latest') return [...rest].slice(0, 5)
    if (tab === 'trending') return [...rest].reverse().slice(0, 5)
    return rest.filter((a) => a.isFeatured).length > 0
      ? rest.filter((a) => a.isFeatured).slice(0, 5)
      : rest.slice(0, 5)
  })()

  const gridArticles = rest.slice(0, 6)

  return (
    <>
      {/* Spotlight Section */}
      <section className="py-10 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.4fr_1fr] gap-8">
          {/* Featured Article */}
          {featured && (
            <Link
              href={`/news/${featured.slug}`}
              className="group relative rounded-2xl overflow-hidden block"
              style={{ minHeight: '450px' }}
            >
              {getImageUrl(featured) && (
                <img
                  src={getImageUrl(featured)!}
                  alt={featured.title}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  className="group-hover:scale-105 transition-transform duration-700"
                />
              )}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-3 mb-3">
                  {featured.category && (
                    <span
                      className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full"
                      style={{ background: 'var(--cms-primary, #4B2E83)', color: '#fff' }}
                    >
                      {featured.category}
                    </span>
                  )}
                  {featured.publishedDate && (
                    <span className="text-xs text-white/70">{formatDate(featured.publishedDate)}</span>
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight ducc-heading">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="mt-3 text-white/75 text-sm leading-relaxed line-clamp-2">{featured.excerpt}</p>
                )}
              </div>
            </Link>
          )}

          {/* Sidebar with tabs */}
          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)' }}>
            <div className="flex gap-2 mb-5">
              {(['top', 'trending', 'latest'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="text-xs font-semibold px-4 py-2 rounded-full transition border capitalize"
                  style={
                    tab === t
                      ? { background: 'var(--cms-secondary, #1A103D)', borderColor: 'var(--cms-secondary, #1A103D)', color: '#fff' }
                      : { background: '#fff', borderColor: 'var(--cms-muted-bg, #F8F4FF)', color: 'var(--cms-text, #1A103D)' }
                  }
                >
                  {t === 'top' ? 'Event' : t === 'trending' ? 'Update' : 'Invitation'}
                </button>
              ))}
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)' }}>
              {sidebarArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group flex gap-4 py-3 first:pt-0 last:pb-0"
                >
                  {getImageUrl(article) ? (
                    <div className="w-[90px] h-[65px] rounded-lg overflow-hidden shrink-0" style={{ background: 'var(--cms-muted-bg, #F8F4FF)' }}>
                      <img
                        src={getImageUrl(article)!}
                        alt={article.title}
                        style={{ width: '90px', height: '65px', objectFit: 'cover', display: 'block' }}
                        className="group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="w-[90px] h-[65px] rounded-lg shrink-0" style={{ background: 'var(--cms-muted-bg, #F8F4FF)' }} />
                  )}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3
                      className="text-[13px] font-semibold leading-tight line-clamp-2 group-hover:text-[--cms-primary] transition-colors"
                      style={{ color: 'var(--cms-secondary, #1A103D)' }}
                    >
                      {article.title}
                    </h3>
                    {article.publishedDate && (
                      <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(article.publishedDate)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Card Grid Section */}
      <section className="pb-20 px-6" style={{ background: 'var(--cms-muted-bg, #F8F4FF)' }}>
        <div className="max-w-7xl mx-auto pt-14">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridArticles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="card-hover group bg-white rounded-2xl overflow-hidden border"
                style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)' }}
              >
                {getImageUrl(article) && (
                  <div className="relative overflow-hidden" style={{ aspectRatio: '16 / 10' }}>
                    <img
                      src={getImageUrl(article)!}
                      alt={article.title}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      className="group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                )}
                <div className="p-5">
                  {article.category && (
                    <p className="text-xs text-gray-500 mb-1">{article.category}</p>
                  )}
                  <h3
                    className="text-lg font-bold leading-snug line-clamp-2 group-hover:text-[--cms-primary] transition-colors"
                    style={{ color: 'var(--cms-secondary, #1A103D)' }}
                  >
                    {article.title}
                  </h3>
                  <div className="mt-3 flex items-center gap-3">
                    {siteName && (
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--cms-text, #1A103D)' }}
                      >
                        {siteName}
                      </span>
                    )}
                    {article.publishedDate && (
                      <span className="text-xs text-gray-500">{formatDate(article.publishedDate)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
