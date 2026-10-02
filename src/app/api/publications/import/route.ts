import { NextRequest, NextResponse } from 'next/server'
import config from '@/payload.config'
import { getPayload } from '@/lib/payload'
import { canWriteCollection } from '@/access/roles'

/**
 * Imports publications from an external source.
 *
 * POST /api/publications/import
 * Body: { source: 'google-scholar' | 'orcid' | 'semantic-scholar',
 *         authorId?: string, apiKey?: string }
 *
 * CrossRef is deliberately not an import source: its author search matches on
 * name text, so it returns papers by unrelated people with similar names. It is
 * still used below for DOI-based keyword enrichment, which is an exact lookup.
 */

type FetchedPublication = {
  title: string
  publisher?: string
  authors?: string[]
  keywords?: string[]
  year?: number
  type?: string
  abstract?: string
  doi?: string
  link?: string
  citationCount?: number
  externalId?: string
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const { user } = await payload.auth({ headers: request.headers })
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    // Importing writes rows with overrideAccess, so gate on the same role that
    // is allowed to create publications normally.
    if (!canWriteCollection(user, 'publications')) {
      return NextResponse.json(
        { error: 'You do not have permission to import publications' },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { source, authorId, apiKey } = body

    if (!source) {
      return NextResponse.json({ error: 'Source is required' }, { status: 400 })
    }

    let publications: FetchedPublication[] = []

    switch (source) {
      case 'google-scholar':
        publications = await importFromGoogleScholar(authorId, apiKey)
        break
      case 'orcid':
        publications = await importFromOrcid(authorId)
        break
      case 'semantic-scholar':
        publications = await importFromSemanticScholar(authorId)
        break
      default:
        return NextResponse.json({ error: 'Invalid source' }, { status: 400 })
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: 0,
      details: [] as Array<{ title: string; status: string; reason?: string }>,
    }

    for (const pub of publications) {
      try {
        // Build the duplicate check from defined identifiers only. Matching on an
        // undefined value would make unrelated records look like duplicates.
        const orClauses: Record<string, unknown>[] = []
        if (pub.externalId) orClauses.push({ externalId: { equals: pub.externalId } })
        if (pub.doi) orClauses.push({ doi: { equals: pub.doi } })

        if (orClauses.length > 0) {
          const existing = await payload.find({
            collection: 'publications',
            where: { or: orClauses } as never,
            limit: 1,
            overrideAccess: true,
          })

          if (existing.docs.length > 0) {
            results.skipped++
            results.details.push({ title: pub.title, status: 'skipped', reason: 'Already exists' })
            continue
          }
        }

        await payload.create({
          collection: 'publications',
          overrideAccess: true,
          data: {
            title: pub.title,
            publisher: pub.publisher || 'Unknown',
            authors: (pub.authors || []).map((name) => ({ name, isLabMember: false })),
            keywords: (pub.keywords || []).map((keyword) => ({ keyword })),
            year: pub.year || new Date().getFullYear(),
            type: pub.type || 'journal',
            abstract: pub.abstract,
            doi: pub.doi,
            link: pub.link,
            citationCount: pub.citationCount || 0,
            importSource: source,
            externalId: pub.externalId,
            status: 'published',
            createdBy: user.id,
          } as never,
        })

        results.imported++
        results.details.push({ title: pub.title, status: 'imported' })
      } catch (err) {
        results.errors++
        results.details.push({
          title: pub.title,
          status: 'error',
          reason: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${results.imported} publications, skipped ${results.skipped}, errors: ${results.errors}`,
      results,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Import failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/** Google Scholar, via SerpAPI (paid key, supplied per import and never stored). */
async function importFromGoogleScholar(
  authorId: string,
  apiKey: string,
): Promise<FetchedPublication[]> {
  if (!authorId || !apiKey) {
    throw new Error('Author ID and SerpAPI key are required for Google Scholar import')
  }

  const url = new URL('https://serpapi.com/search.json')
  url.searchParams.set('engine', 'google_scholar_author')
  url.searchParams.set('author_id', authorId)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('num', '100')

  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch from Google Scholar')

  const data = await response.json()

  return (data.articles || []).map((article: Record<string, any>) => ({
    title: article.title,
    publisher: article.publication || 'Unknown',
    authors: article.authors ? String(article.authors).split(', ') : [],
    year: parseInt(article.year, 10) || new Date().getFullYear(),
    type: 'journal',
    link: article.link,
    citationCount: article.cited_by?.value || 0,
    externalId: article.citation_id ? `gs-${article.citation_id}` : undefined,
  }))
}

/**
 * ORCID (free, identity-based — the most reliable source).
 *
 * The /works summary endpoint omits contributors, so put-codes are collected
 * first and full records fetched in batches.
 */
async function importFromOrcid(orcidId: string): Promise<FetchedPublication[]> {
  if (!orcidId) throw new Error('ORCID ID is required')

  const listResponse = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/works`, {
    headers: { Accept: 'application/json' },
  })
  if (!listResponse.ok) throw new Error('Failed to fetch works list from ORCID')

  const listData = await listResponse.json()
  const putCodes: number[] = (listData.group || [])
    .map((g: Record<string, any>) => g['work-summary']?.[0]?.['put-code'])
    .filter(Boolean)

  if (putCodes.length === 0) return []

  const batchSize = 50
  const publications: FetchedPublication[] = []

  for (let i = 0; i < putCodes.length; i += batchSize) {
    const batch = putCodes.slice(i, i + batchSize)
    const detailResponse = await fetch(
      `https://pub.orcid.org/v3.0/${orcidId}/works/${batch.join(',')}`,
      { headers: { Accept: 'application/json' } },
    )
    if (!detailResponse.ok) continue

    const detailData = await detailResponse.json()

    for (const entry of detailData.bulk || []) {
      const work = entry.work
      if (!work) continue

      const doi = work['external-ids']?.['external-id']?.find(
        (id: Record<string, any>) => id['external-id-type'] === 'doi',
      )?.['external-id-value']

      const authors = (work.contributors?.contributor || [])
        .map((c: Record<string, any>) => c['credit-name']?.value)
        .filter(Boolean)
      if (authors.length === 0) authors.push(orcidId)

      const keywords: string[] = []
      const subtitle = work.title?.subtitle?.value
      if (subtitle) keywords.push(subtitle)

      publications.push({
        title: work.title?.title?.value || 'Untitled',
        publisher: work['journal-title']?.value || 'Unknown',
        authors,
        keywords,
        year:
          parseInt(work['publication-date']?.year?.value, 10) || new Date().getFullYear(),
        type: mapOrcidWorkType(work.type),
        doi,
        link: doi ? `https://doi.org/${doi}` : work.url?.value,
        externalId: `orcid-${work['put-code']}`,
      })
    }
  }

  await enrichKeywordsFromCrossRef(publications)
  return publications
}

/** Semantic Scholar (free, author-ID based). */
async function importFromSemanticScholar(authorId: string): Promise<FetchedPublication[]> {
  if (!authorId) throw new Error('Author ID is required for Semantic Scholar')

  const fields = 'title,venue,year,authors,abstract,externalIds,citationCount'
  const response = await fetch(
    `https://api.semanticscholar.org/graph/v1/author/${authorId}/papers?fields=${fields}&limit=100`,
  )
  if (!response.ok) throw new Error('Failed to fetch from Semantic Scholar')

  const data = await response.json()

  return (data.data || []).map((paper: Record<string, any>) => ({
    title: paper.title,
    publisher: paper.venue || 'Unknown',
    authors: (paper.authors || []).map((a: Record<string, any>) => a.name),
    year: paper.year || new Date().getFullYear(),
    type: 'journal',
    doi: paper.externalIds?.DOI,
    link: paper.externalIds?.DOI ? `https://doi.org/${paper.externalIds.DOI}` : undefined,
    abstract: paper.abstract,
    citationCount: paper.citationCount || 0,
    externalId: paper.paperId ? `ss-${paper.paperId}` : undefined,
  }))
}

/**
 * Fills in missing keywords using CrossRef subject terms, looked up by DOI.
 * This is an exact identifier lookup, not a name search, so it is safe.
 */
async function enrichKeywordsFromCrossRef(publications: FetchedPublication[]): Promise<void> {
  for (const pub of publications) {
    if (!pub.doi || (pub.keywords && pub.keywords.length > 0)) continue
    try {
      const response = await fetch(
        `https://api.crossref.org/works/${encodeURIComponent(pub.doi)}`,
        { headers: { 'User-Agent': 'CyPSi-Lab-Website/1.0 (mailto:cps@uod.ac.in)' } },
      )
      if (!response.ok) continue
      const data = await response.json()
      const subjects: string[] = data.message?.subject || []
      if (subjects.length > 0) pub.keywords = subjects
    } catch {
      // Enrichment is best-effort; a failure here must not fail the import.
    }
  }
}

function mapOrcidWorkType(type: string): string {
  const typeMap: Record<string, string> = {
    'journal-article': 'journal',
    'conference-paper': 'conference',
    'book-chapter': 'book-chapter',
    report: 'technical-report',
    dissertation: 'thesis',
  }
  return typeMap[type] || 'journal'
}

/** Lists the sources the UI can offer. */
export async function GET() {
  return NextResponse.json({
    availableSources: [
      {
        id: 'orcid',
        name: 'ORCID',
        requiresApiKey: false,
        requiresAuthorId: true,
        description: 'Free API — enter your ORCID iD',
      },
      {
        id: 'semantic-scholar',
        name: 'Semantic Scholar',
        requiresApiKey: false,
        requiresAuthorId: true,
        description: 'Free API — find your Author ID on semanticscholar.org',
      },
      {
        id: 'google-scholar',
        name: 'Google Scholar',
        requiresApiKey: true,
        requiresAuthorId: true,
        description: 'Import via SerpAPI (requires paid API key from serpapi.com)',
      },
    ],
  })
}
