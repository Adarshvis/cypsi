'use client'

import { useRowLabel } from '@payloadcms/ui'

/** Shows "03 · Digital Learning — Title" on collapsed project rows instead of "Project 03". */
export function ProjectRowLabel() {
  const { data, rowNumber } = useRowLabel<{ category?: string; title?: string; client?: string }>()
  const n = String((rowNumber ?? 0) + 1).padStart(2, '0')
  const name = data?.title || data?.client || 'Untitled project'
  return <span>{`${n} · ${data?.category ? `${data.category} — ` : ''}${name}`}</span>
}
