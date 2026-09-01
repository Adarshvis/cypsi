import type { Metadata } from 'next'
import config from '@/payload.config'
import { getPayload } from '@/lib/payload'
import PageBanner from '../components/PageBanner'
import PublicationsList, { type PublicationItem } from './PublicationsList'
import { getSiteMeta } from '@/lib/siteMeta'

export const revalidate = 60

async function getPublications(): Promise<PublicationItem[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'publications',
    where: { status: { equals: 'published' } },
    sort: '-year',
    depth: 1,
    limit: 500,
  })

  return docs.map((doc) => ({
    id: String(doc.id),
    title: doc.title,
    publisher: doc.publisher,
    year: Number(doc.year),
    type: doc.type,
    doi: doc.doi ?? null,
    link: doc.link ?? null,
    citationCount: Number(doc.citationCount ?? 0),
    authors: (doc.authors || []).map((a) => ({
      name: a.name,
      isLabMember: Boolean(a.isLabMember),
    })),
    keywords: (doc.keywords || []).map((k) => k.keyword),
  }))
}

export async function generateMetadata(): Promise<Metadata> {
  const { publications } = await getSiteMeta()
  return { title: publications.metaTitle, description: publications.metaDescription }
}

export default async function PublicationsPage() {
  const [publications, site] = await Promise.all([getPublications(), getSiteMeta()])

  /** Only lab members are offered as author filters, matching the lab's own site. */
  const authors = [
    ...new Set(
      publications.flatMap((p) => p.authors.filter((a) => a.isLabMember).map((a) => a.name)),
    ),
  ].sort((a, b) => a.localeCompare(b))

  const keywords = [...new Set(publications.flatMap((p) => p.keywords))].sort((a, b) =>
    a.localeCompare(b),
  )

  return (
    <div className="cms-page-shell">
      {/* Heading and intro come from Site Settings → Listing Page Titles. */}
      <PageBanner
        title={site.publications.title}
        eyebrow={site.publications.eyebrow}
        description={site.publications.description}
      />
      <PublicationsList publications={publications} authors={authors} keywords={keywords} />
    </div>
  )
}
