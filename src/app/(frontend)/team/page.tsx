import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import config from '@/payload.config'
import { getPayload } from '@/lib/payload'
import PageBanner from '../components/PageBanner'
import BlockRenderer from '../components/BlockRenderer'
import { getSiteMeta } from '@/lib/siteMeta'

/** Used only when the team-page record has no title of its own. */
const DEFAULT_TITLE = 'Our Team'

async function getTeamPage() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'team-page' as any,
    where: { status: { equals: 'active' } },
    limit: 1,
    depth: 2,
  })
  return docs[0] || null
}

/**
 * This route had no metadata at all, so the tab and search results fell back to
 * the site-wide title. The heading already comes from the team-page record;
 * the meta text now follows it.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([getTeamPage(), getSiteMeta()])
  const pt = (page as any)?.pageTitle || {}
  const title = pt.title?.trim() || DEFAULT_TITLE

  return {
    title: `${title} — ${site.siteName}`,
    description: pt.description?.trim() || site.siteDescription,
  }
}

export default async function TeamListingPage() {
  const page = await getTeamPage()
  if (!page) notFound()

  const pt = (page as any).pageTitle || {}

  return (
    <div className="cms-page-shell">
      <PageBanner
        title={pt.title || DEFAULT_TITLE}
        eyebrow={pt.eyebrow}
        description={pt.description}
      />
      <BlockRenderer blocks={(page as any).layout} />
    </div>
  )
}
