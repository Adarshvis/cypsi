import React from 'react'
import Link from 'next/link'

interface Crumb {
  label: string
  href?: string
}

interface PageBannerProps {
  title: string
  slug?: string
  /** Extra crumbs between Home and the current page, e.g. [{ label: 'News', href: '/news' }] */
  breadcrumbs?: Crumb[]
  /** Optional supporting line under the title. Omit for the plainest treatment. */
  description?: string
  /** Kept for API compatibility; the compact band has no room for a badge. */
  eyebrow?: string
  userSlot?: React.ReactNode
}

/**
 * Compact page title band: title on the left, breadcrumb trail on the right.
 *
 * Replaces the previous full-bleed gradient hero, which was around 400px tall
 * and repeated the page title at display size on every interior page.
 */
export default function PageBanner({
  title,
  breadcrumbs,
  description,
  userSlot,
}: PageBannerProps) {
  const trail: Crumb[] = [{ label: 'Home', href: '/' }, ...(breadcrumbs || [])]

  return (
    <section
      className="relative"
      style={{
        backgroundColor: 'var(--cms-muted-bg, #e6edf0)',
        padding: '25px 0',
        color: 'var(--cms-text, #04415f)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div className="min-w-0">
          <h1
            className="ducc-heading"
            style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.25 }}
          >
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-3xl" style={{ fontSize: 15, opacity: 0.75 }}>
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <nav aria-label="Breadcrumb">
            <ol
              className="flex flex-wrap items-center"
              style={{ fontSize: 14, fontWeight: 400, listStyle: 'none', margin: 0, padding: 0 }}
            >
              {trail.map((crumb) => (
                <li key={crumb.label} className="flex items-center">
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:underline">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                  <span aria-hidden className="px-2.5" style={{ opacity: 0.3 }}>
                    /
                  </span>
                </li>
              ))}
              <li aria-current="page" style={{ opacity: 0.85 }}>
                {title}
              </li>
            </ol>
          </nav>

          {userSlot}
        </div>
      </div>
    </section>
  )
}
