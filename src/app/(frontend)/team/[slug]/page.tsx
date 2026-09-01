import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import config from '@/payload.config'
import { getPayload } from '@/lib/payload'
import ProfileClient from './ProfileClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

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

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function findMemberBySlug(page: any, slug: string): any | null {
  if (!page?.layout) return null
  for (const block of page.layout) {
    if (block.blockType === 'teamGrid' && Array.isArray(block.members)) {
      const member = block.members.find((m: any) => {
        // Match by saved slug
        if (m.slug === slug) return true
        // Fallback: match by auto-generated slug from name
        if (m.name && slugify(m.name) === slug) return true
        return false
      })
      if (member) return member
    }
  }
  return null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await getTeamPage()
  const member = page ? findMemberBySlug(page, slug) : null
  if (!member) return { title: 'Not Found' }
  return {
    title: `${member.name} — ${member.role || 'Team Member'}`,
    description: member.bio || member.biography || undefined,
  }
}

export default async function TeamMemberPage({ params }: PageProps) {
  const { slug } = await params
  const page = await getTeamPage()
  if (!page) notFound()

  const member = findMemberBySlug(page, slug)
  if (!member) notFound()

  return <ProfileClient member={member} />
}
