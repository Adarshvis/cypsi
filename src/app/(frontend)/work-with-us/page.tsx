import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import PageBanner from '../components/PageBanner'
import { getPublishedProgrammes } from '@/lib/workWithUs'
import { mediaOf } from '@/lib/blog'
import { getSiteMeta } from '@/lib/siteMeta'

const PRIMARY = 'var(--cms-primary, #04415f)'
const SECONDARY = 'var(--cms-secondary, #011e2c)'
const TEXT = 'var(--cms-text, #010608)'
const tint = (pct: number) => `color-mix(in srgb, ${PRIMARY} ${pct}%, transparent)`

export async function generateMetadata(): Promise<Metadata> {
  const { workWithUs } = await getSiteMeta()
  return { title: workWithUs.metaTitle, description: workWithUs.metaDescription }
}

export default async function WorkWithUsPage() {
  const [programmes, { workWithUs }] = await Promise.all([getPublishedProgrammes(), getSiteMeta()])

  return (
    <div className="cms-page-shell">
      {/* Heading and intro come from Site Settings → Listing Page Titles → Work With Us. */}
      <PageBanner title={workWithUs.title} eyebrow={workWithUs.eyebrow} description={workWithUs.description} />

      <section className="px-6 py-12 lg:py-14">
        <div className="mx-auto max-w-7xl">
          {programmes.length === 0 ? (
            <p className="py-16 text-center" style={{ color: TEXT, opacity: 0.6 }}>
              No programmes open right now.
            </p>
          ) : (
            <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {programmes.map((p) => {
                const image = mediaOf(p.featuredImage)
                const href = `/work-with-us/${p.slug}`
                const domains = p.problemDomains?.length || 0
                return (
                  <li key={p.id}>
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
                        {p.effectiveDate && (
                          <p className="m-0 text-xs" style={{ color: TEXT, opacity: 0.55 }}>
                            {p.effectiveDate}
                          </p>
                        )}
                        <h2 className="ducc-heading mt-1 text-xl font-bold leading-snug" style={{ color: SECONDARY }}>
                          <Link href={href} className="hover:underline underline-offset-4">
                            {p.title}
                          </Link>
                        </h2>
                        {p.excerpt && (
                          <p className="mt-3 line-clamp-4 text-sm leading-relaxed" style={{ color: TEXT, opacity: 0.72 }}>
                            {p.excerpt}
                          </p>
                        )}
                        {domains > 0 && (
                          <p className="mt-3 text-xs font-semibold" style={{ color: PRIMARY }}>
                            {domains} problem {domains === 1 ? 'domain' : 'domains'}
                          </p>
                        )}
                        <span className="flex-1" />
                        <span
                          aria-hidden
                          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold"
                          style={{ color: PRIMARY }}
                        >
                          View details
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
