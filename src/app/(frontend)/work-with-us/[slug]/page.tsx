import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PageBanner from '../../components/PageBanner'
import DocumentArticle from '../../components/DocumentArticle'
import RichText from '../../components/ui/RichText'
import { ProblemDomainsAccordion } from '../../components/blocks/CareerPostingBlock'
import { getProgrammeBySlug, getPublishedProgrammes } from '@/lib/workWithUs'
import { mediaOf } from '@/lib/blog'
import { safeHref } from '@/lib/safeEmbedUrl'
import { getSiteMeta } from '@/lib/siteMeta'

interface PageProps {
  params: Promise<{ slug: string }>
}

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

  const others = (await getPublishedProgrammes()).filter((p) => p.id !== programme.id)
  const applyHref = safeHref(programme.applyButtonLink) || '/apply'

  // The collection stores each challenge as `challenge`; the accordion reads `text`.
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

      <DocumentArticle
        title={programme.title}
        date={programme.effectiveDate}
        intro={programme.excerpt}
        image={mediaOf(programme.featuredImage)}
        more={{
          heading: `More from ${workWithUs.title}`,
          links: others.map((p) => ({ id: p.id, href: `/work-with-us/${p.slug}`, label: p.title })),
        }}
      >
        {programme.content ? (
          <div className="cms-doc__content">
            <RichText data={programme.content as never} />
          </div>
        ) : null}

        {problemDomains.length > 0 ? (
          <div className="cms-doc__section">
            <h2 className="cms-doc__section-heading ducc-heading">Problem Domains</h2>
            {/* Each domain's Apply button preselects that domain on the form. */}
            <ProblemDomainsAccordion
              domains={problemDomains}
              applyHref={applyHref}
              applyButtonText={programme.applyButtonText}
            />
          </div>
        ) : null}

        {programme.applyButtonText ? (
          <div className="cms-doc__actions">
            <a href={applyHref} className="career-posting__apply-btn">
              {programme.applyButtonText}
            </a>
          </div>
        ) : null}
      </DocumentArticle>
    </div>
  )
}
