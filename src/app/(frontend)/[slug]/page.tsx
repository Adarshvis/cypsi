import React from 'react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import type { Metadata } from 'next'
import config from '@/payload.config'
import BlockRenderer from '../components/BlockRenderer'
import PageBanner from '../components/PageBanner'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getPage(slug: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
    depth: 2,
  })
  return docs[0] || null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return {}

  return {
    title: page.meta?.title || page.title,
    description: page.meta?.description || undefined,
    openGraph: page.meta?.image && typeof page.meta.image === 'object' && page.meta.image.url
      ? { images: [{ url: page.meta.image.url }] }
      : undefined,
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params
  const page = await getPage(slug)

  if (!page) notFound()

  const firstBlock = Array.isArray(page.layout) ? page.layout[0] : null
  const firstBlockIsHero = firstBlock && typeof firstBlock === 'object' && 'blockType' in firstBlock && firstBlock.blockType === 'hero'

  return (
    <div className="cms-page-shell">
      {!firstBlockIsHero && (
        <PageBanner
          title={page.title}
          slug={slug}
          eyebrow={(page as any).bannerEyebrow || undefined}
          description={(page as any).bannerDescription || undefined}
        />
      )}
      <BlockRenderer blocks={page.layout} />
    </div>
  )
}
