import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import RichText from '../../components/ui/RichText'
import PageBanner from '../../components/PageBanner'
import DocumentArticle from '../../components/DocumentArticle'
import DynamicIcon from '../../components/ui/DynamicIcon'
import { getDomainBySlug, getPublishedDomains, iconName } from '@/lib/researchDomains'
import { mediaOf } from '@/lib/blog'
import { getSiteMeta } from '@/lib/siteMeta'

interface PageProps {
  params: Promise<{ slug: string }>
}

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

  const icon = iconName(domain.icon)
  const others = (await getPublishedDomains()).filter((d) => d.id !== domain.id)

  return (
    <div className="cms-page-shell">
      <PageBanner
        title={domain.title}
        slug={slug}
        breadcrumbs={[{ label: researchDomains.title, href: '/research-domains' }]}
      />

      <DocumentArticle
        title={domain.title}
        date={domain.effectiveDate}
        intro={domain.excerpt}
        icon={icon ? <DynamicIcon name={icon} size={26} color="var(--cms-primary, #04415f)" /> : null}
        image={mediaOf(domain.featuredImage)}
        more={{
          heading: `Other ${researchDomains.title.toLowerCase()}`,
          links: others.map((d) => ({ id: d.id, href: `/research-domains/${d.slug}`, label: d.title })),
        }}
      >
        {domain.content ? (
          <div className="cms-doc__content">
            <RichText data={domain.content as never} />
          </div>
        ) : null}
      </DocumentArticle>
    </div>
  )
}
