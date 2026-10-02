import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { type BlogPost, formatPostDate, mediaOf } from '@/lib/blog'

const PRIMARY = 'var(--cms-primary, #04415f)'
const SECONDARY = 'var(--cms-secondary, #011e2c)'
const TEXT = 'var(--cms-text, #010608)'
const tint = (pct: number) => `color-mix(in srgb, ${PRIMARY} ${pct}%, transparent)`

/** Author photo or initials, used on cards and the article page. */
export function AuthorAvatar({ post, size = 32 }: { post: BlogPost; size?: number }) {
  const photo = mediaOf(post.authorImage)
  if (photo?.url) {
    return (
      <Image
        src={photo.url}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }
  const initials = post.authorName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full text-xs font-bold"
      style={{ width: size, height: size, background: tint(12), color: PRIMARY }}
    >
      {initials}
    </span>
  )
}

export default function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const image = mediaOf(post.featuredImage)
  const href = `/blog/${post.slug}`

  return (
    <article
      className={`group flex h-full overflow-hidden rounded-2xl border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.35)] ${
        featured ? 'flex-col md:flex-row' : 'flex-col'
      }`}
      style={{ borderColor: tint(12) }}
    >
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className={`relative block shrink-0 overflow-hidden ${featured ? 'aspect-[16/10] md:aspect-auto md:w-1/2' : 'aspect-[16/10]'}`}
      >
        {image?.url && (
          <Image
            src={image.url}
            alt=""
            fill
            sizes={featured ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
      </Link>

      <div className={`flex flex-1 flex-col ${featured ? 'p-6 md:p-8' : 'p-5'}`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {post.category && (
            <span className="font-bold uppercase tracking-[0.12em]" style={{ color: PRIMARY }}>
              {post.category}
            </span>
          )}
          {post.readTime && (
            <span className="inline-flex items-center gap-1" style={{ color: TEXT, opacity: 0.6 }}>
              <Clock size={12} aria-hidden />
              {post.readTime}
            </span>
          )}
        </div>

        <h3
          className={`ducc-heading mt-2 font-bold leading-snug ${featured ? 'text-2xl md:text-3xl' : 'text-lg'}`}
          style={{ color: SECONDARY }}
        >
          <Link href={href} className="hover:underline underline-offset-4">
            {post.title}
          </Link>
        </h3>

        <p
          className={`mt-2 text-sm leading-relaxed ${featured ? 'line-clamp-4' : 'line-clamp-3'}`}
          style={{ color: TEXT, opacity: 0.72 }}
        >
          {post.shortDescription}
        </p>

        <span className="flex-1" />

        <div
          className="mt-5 flex items-center justify-between gap-3 border-t pt-4"
          style={{ borderColor: tint(10) }}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <AuthorAvatar post={post} />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[13px] font-semibold" style={{ color: SECONDARY }}>
                {post.authorName}
              </span>
              <span className="block text-xs" style={{ color: TEXT, opacity: 0.55 }}>
                <time dateTime={post.publishedDate}>{formatPostDate(post.publishedDate)}</time>
              </span>
            </span>
          </span>
          <ArrowRight
            size={16}
            aria-hidden
            className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
            style={{ color: PRIMARY }}
          />
        </div>
      </div>
    </article>
  )
}
