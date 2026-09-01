import type { Metadata } from 'next'
import React from 'react'
import AcceptInviteForm from './AcceptInviteForm'

/**
 * Landing page for an invitation link.
 *
 * Not indexed: the URL carries a single-use token, and there is nothing here
 * worth listing in search results.
 */
export const metadata: Metadata = {
  title: 'Accept invitation',
  robots: { index: false, follow: false },
}

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6 py-16"
      style={{ background: 'var(--cms-muted-bg, #e6edf0)' }}
    >
      <AcceptInviteForm token={token || ''} />
    </main>
  )
}
