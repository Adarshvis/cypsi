import type { Metadata } from 'next'
import config from '@/payload.config'
import { getPayload } from '@/lib/payload'
import PageBanner from '../components/PageBanner'
import NewsListing from './NewsListing'
import { getSiteMeta } from '@/lib/siteMeta'

async function getNewsList() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'news',
    where: { status: { equals: 'published' } },
    sort: '-publishedDate',
    depth: 1,
    limit: 100,
  })
  return docs
}

export async function generateMetadata(): Promise<Metadata> {
  const { news } = await getSiteMeta()
  return { title: news.metaTitle, description: news.metaDescription }
}

export default async function NewsListingPage() {
  const [newsList, { news, siteName }] = await Promise.all([getNewsList(), getSiteMeta()])

  return (
    <div className="cms-page-shell">
      {/* Heading and intro come from Site Settings → Listing Page Titles. */}
      <PageBanner title={news.title} eyebrow={news.eyebrow} description={news.description} />
      <NewsListing articles={newsList as any[]} siteName={siteName} />
    </div>
  )
}
