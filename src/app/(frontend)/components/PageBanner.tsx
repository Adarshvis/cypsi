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
      {/* The title takes the free space; the breadcrumb is capped and its last
          crumb truncates, so a long article title never gets squeezed into a
          narrow column by its own breadcrumb. */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-x-10 gap-y-2">
        <div className="min-w-0 lg:flex-1">
          <h1
            className="ducc-heading text-balance"
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

        <div className="flex min-w-0 items-center gap-4 lg:max-w-[40%] lg:shrink-0">
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol
              className="flex min-w-0 items-center"
              style={{ fontSize: 14, fontWeight: 400, listStyle: 'none', margin: 0, padding: 0 }}
            >
              {trail.map((crumb) => (
                <li key={crumb.label} className="flex shrink-0 items-center whitespace-nowrap">
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
              {/* Truncated with an ellipsis; the full title is the h1 beside it. */}
              <li aria-current="page" className="min-w-0 truncate" title={title} style={{ opacity: 0.85 }}>
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
