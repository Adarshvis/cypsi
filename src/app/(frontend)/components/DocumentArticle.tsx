import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface MoreLink {
  id: string | number
  href: string
  label: string
}

interface DocumentArticleProps {
  title: string
  date?: string | null
  intro?: string | null
  /** Rendered above the title, e.g. a domain icon. */
  icon?: React.ReactNode
  image?: {
    url?: string | null
    alt?: string | null
    width?: number | null
    height?: number | null
  } | null
  /** Heading and links for the "more like this" strip at the bottom. */
  more?: { heading: string; links: MoreLink[] }
  children?: React.ReactNode
}

/**
 * Single-column reading layout for collection detail pages (Research Domains,
 * Work With Us), matching the learner site: a centred header (date, title,
 * intro) over an 800px body, with related links at the end. Colours come from
 * the theme variables set in the frontend layout.
 */
export default function DocumentArticle({
  title,
  date,
  intro,
  icon,
  image,
  more,
  children,
}: DocumentArticleProps) {
  return (
    <section className="cms-doc">
      <header className="cms-doc__header">
        {icon ? <div className="cms-doc__icon">{icon}</div> : null}
        {date ? <p className="cms-doc__date">{date}</p> : null}
        <h2 className="cms-doc__title ducc-heading">{title}</h2>
        {intro ? <p className="cms-doc__intro">{intro}</p> : null}
      </header>

      <div className="cms-doc__body">
        {image?.url ? (
          // Shown whole at its own aspect ratio, capped in size (see .cms-doc__figure).
          <figure className="cms-doc__figure">
            <Image
              src={image.url}
              alt={image.alt || ''}
              width={image.width || 1200}
              height={image.height || 675}
              priority
              sizes="(min-width: 640px) 576px, 100vw"
            />
          </figure>
        ) : null}

        {children}
      </div>

      {more && more.links.length > 0 ? (
        <nav className="cms-doc__more" aria-labelledby="cms-doc-more-heading">
          <h2 id="cms-doc-more-heading" className="cms-doc__more-heading">
            {more.heading}
          </h2>
          <ul className="cms-doc__more-list">
            {more.links.map((link) => (
              <li key={link.id}>
                <Link href={link.href} className="cms-doc__more-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </section>
  )
}
