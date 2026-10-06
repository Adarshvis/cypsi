import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import PageBanner from '../../components/PageBanner'
import CareerPostingBlock from '../../components/blocks/CareerPostingBlock'
import { getProgrammeBySlug, getPublishedProgrammes } from '@/lib/workWithUs'
import { mediaOf } from '@/lib/blog'
import { safeHref } from '@/lib/safeEmbedUrl'
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
  const [programme, { siteName }] = await Promise.all([getProgrammeBySlug(slug), getSiteMeta()])
  if (!programme) return {}
  const image = mediaOf(programme.featuredImage)
  return {
    title: `${programme.title} — ${siteName}`,
    description: programme.excerpt || undefined,
    openGraph: image?.url ? { images: [{ url: image.url, alt: image.alt || programme.title }] } : undefined,
  }
}

export default async function ProgrammePage({ params }: PageProps) {
  const { slug } = await params
  const [programme, { workWithUs }] = await Promise.all([getProgrammeBySlug(slug), getSiteMeta()])
  if (!programme) notFound()

  const image = mediaOf(programme.featuredImage)
  const others = (await getPublishedProgrammes()).filter((p) => p.id !== programme.id)

  // The collection stores each challenge as `challenge`; the shared layout reads `text`.
  const problemDomains = (programme.problemDomains || []).map((d) => ({
    ...d,
    challenges: (d.challenges || []).map((c) => ({ id: c.id, text: c.challenge })),
  }))

  return (
    <div className="cms-page-shell">
      <PageBanner
        title={programme.title}
        slug={slug}
        breadcrumbs={[{ label: workWithUs.title, href: '/work-with-us' }]}
      />

      <div className="px-6 py-10 lg:py-14">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14">
          <div className="min-w-0">
            {image?.url && (
              <figure className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl">
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

            {/* Same layout as the Career Posting block: intro, content, problem
                domains accordion, apply buttons (each preselecting its domain). */}
            <CareerPostingBlock
              excerpt={programme.excerpt}
              effectiveDate={programme.effectiveDate}
              content={programme.content}
              problemDomains={problemDomains}
              applyButtonText={programme.applyButtonText}
              applyButtonLink={safeHref(programme.applyButtonLink)}
            />
          </div>

          {others.length > 0 && (
            <aside aria-labelledby="other-programmes" className="lg:sticky lg:top-28 lg:self-start">
              <h2
                id="other-programmes"
                className="mb-3 text-xs font-bold uppercase tracking-[0.12em]"
                style={{ color: TEXT, opacity: 0.6 }}
              >
                More from {workWithUs.title}
              </h2>
              <ul className="m-0 list-none space-y-2 p-0">
                {others.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/work-with-us/${p.slug}`}
                      className="block rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:bg-white"
                      style={{ borderColor: tint(12), color: SECONDARY, background: tint(3) }}
                    >
                      {p.title}
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
