import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import PageBanner from '../components/PageBanner'
import DynamicIcon from '../components/ui/DynamicIcon'
import { getPublishedDomains, iconName } from '@/lib/researchDomains'
import { mediaOf } from '@/lib/blog'
import { getSiteMeta } from '@/lib/siteMeta'

const PRIMARY = 'var(--cms-primary, #04415f)'
const SECONDARY = 'var(--cms-secondary, #011e2c)'
const TEXT = 'var(--cms-text, #010608)'
const tint = (pct: number) => `color-mix(in srgb, ${PRIMARY} ${pct}%, transparent)`

export async function generateMetadata(): Promise<Metadata> {
  const { researchDomains } = await getSiteMeta()
  return { title: researchDomains.metaTitle, description: researchDomains.metaDescription }
}

export default async function ResearchDomainsPage() {
  const [domains, { researchDomains }] = await Promise.all([getPublishedDomains(), getSiteMeta()])

  return (
    <div className="cms-page-shell">
      {/* Heading and intro come from Site Settings → Listing Page Titles → Research Domains. */}
      <PageBanner
        title={researchDomains.title}
        eyebrow={researchDomains.eyebrow}
        description={researchDomains.description}
      />

      <section className="px-6 py-12 lg:py-14">
        <div className="mx-auto max-w-7xl">
          {domains.length === 0 ? (
            <p className="py-16 text-center" style={{ color: TEXT, opacity: 0.6 }}>
              No research domains yet.
            </p>
          ) : (
            <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {domains.map((d) => {
                const image = mediaOf(d.featuredImage)
                const icon = iconName(d.icon)
                const href = `/research-domains/${d.slug}`
                return (
                  <li key={d.id}>
                    <article
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.35)]"
                      style={{ borderColor: tint(12) }}
                    >
                      {image?.url && (
                        <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-[16/9] overflow-hidden">
                          <Image
                            src={image.url}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                        </Link>
                      )}
                      <div className="flex flex-1 flex-col p-6">
                        {icon && (
                          <span
                            aria-hidden
                            className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                            style={{ background: tint(10) }}
                          >
                            <DynamicIcon name={icon} size={22} color={PRIMARY} />
                          </span>
                        )}
                        <h2 className="ducc-heading text-xl font-bold leading-snug" style={{ color: SECONDARY }}>
                          <Link href={href} className="hover:underline underline-offset-4">
                            {d.title}
                          </Link>
                        </h2>
                        {d.excerpt && (
                          <p className="mt-3 line-clamp-4 text-sm leading-relaxed" style={{ color: TEXT, opacity: 0.72 }}>
                            {d.excerpt}
                          </p>
                        )}
                        <span className="flex-1" />
                        <span
                          aria-hidden
                          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold"
                          style={{ color: PRIMARY }}
                        >
                          Explore
                          <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
