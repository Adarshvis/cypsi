import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import RichText from '../../components/ui/RichText'
import PageBanner from '../../components/PageBanner'
import DynamicIcon from '../../components/ui/DynamicIcon'
import { getDomainBySlug, getPublishedDomains, iconName } from '@/lib/researchDomains'
import { mediaOf } from '@/lib/blog'
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
  const [domain, { siteName }] = await Promise.all([getDomainBySlug(slug), getSiteMeta()])
  if (!domain) return {}
  const image = mediaOf(domain.featuredImage)
  return {
    title: `${domain.title} — ${siteName}`,
    description: domain.excerpt || undefined,
    openGraph: image?.url ? { images: [{ url: image.url, alt: image.alt || domain.title }] } : undefined,
  }
}

export default async function ResearchDomainPage({ params }: PageProps) {
  const { slug } = await params
  const [domain, { researchDomains }] = await Promise.all([getDomainBySlug(slug), getSiteMeta()])
  if (!domain) notFound()

  const image = mediaOf(domain.featuredImage)
  const icon = iconName(domain.icon)
  const others = (await getPublishedDomains()).filter((d) => d.id !== domain.id)

  return (
    <div className="cms-page-shell">
      <PageBanner
        title={domain.title}
        slug={slug}
        breadcrumbs={[{ label: researchDomains.title, href: '/research-domains' }]}
      />

      <div className="px-6 py-10 lg:py-14">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="min-w-0">
            <header className="flex items-start gap-4">
              {icon && (
                <span
                  aria-hidden
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: tint(10) }}
                >
                  <DynamicIcon name={icon} size={24} color={PRIMARY} />
                </span>
              )}
              <div>
                <h2
                  className="ducc-heading font-bold leading-tight"
                  style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', color: SECONDARY }}
                >
                  {domain.title}
                </h2>
                {domain.effectiveDate && (
                  <p className="mt-1 text-sm" style={{ color: TEXT, opacity: 0.6 }}>
                    {domain.effectiveDate}
                  </p>
                )}
              </div>
            </header>

            {domain.excerpt && (
              <p className="mt-5 text-lg leading-relaxed" style={{ color: TEXT, opacity: 0.78 }}>
                {domain.excerpt}
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

            <div className="cms-richtext mt-10">
              <RichText data={domain.content as never} />
            </div>
          </article>

          {others.length > 0 && (
            <aside aria-labelledby="other-domains" className="lg:sticky lg:top-28 lg:self-start">
              <h2
                id="other-domains"
                className="mb-3 text-xs font-bold uppercase tracking-[0.12em]"
                style={{ color: TEXT, opacity: 0.6 }}
              >
                Other {researchDomains.title.toLowerCase()}
              </h2>
              <ul className="m-0 list-none space-y-2 p-0">
                {others.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/research-domains/${d.slug}`}
                      className="block rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:bg-white"
                      style={{ borderColor: tint(12), color: SECONDARY, background: tint(3) }}
                    >
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
