import type { Metadata } from 'next'
import config from '@/payload.config'
import { getPayload } from '@/lib/payload'
import PageBanner from '../components/PageBanner'
import PublicationsList, { type PublicationItem } from './PublicationsList'
import { getSiteMeta } from '@/lib/siteMeta'
import { labAuthorsOf } from './labAuthors'
import type { AuthorOption } from './types'

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

  return docs.map((doc) => {
    const authors = (doc.authors || []).map((a) => ({
      name: a.name,
      isLabMember: Boolean(a.isLabMember),
    }))
    return {
      id: String(doc.id),
      title: doc.title,
      publisher: doc.publisher,
      year: Number(doc.year),
      type: doc.type,
      doi: doc.doi ?? null,
      link: doc.link ?? null,
      citationCount: Number(doc.citationCount ?? 0),
      authors,
      labAuthors: labAuthorsOf(authors),
      keywords: (doc.keywords || []).map((k) => k.keyword),
    }
  })
}

export async function generateMetadata(): Promise<Metadata> {
  const { publications } = await getSiteMeta()
  return { title: publications.metaTitle, description: publications.metaDescription }
}

export default async function PublicationsPage() {
  const [publications, site] = await Promise.all([getPublications(), getSiteMeta()])

  // Lab authors only (labAuthors.ts), each with their publication count.
  // Authors with no published paper are left out, so the list stays relevant.
  const counts = new Map<string, number>()
  for (const p of publications) {
    for (const name of p.labAuthors) counts.set(name, (counts.get(name) || 0) + 1)
  }
  const authors: AuthorOption[] = [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))

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
