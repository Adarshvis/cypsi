"use client"

import dynamic from 'next/dynamic'
import type { SnapshotDataRow } from './types'

interface GoaMapPanelProps {
  rows: SnapshotDataRow[]
  selectedName: string | null
  hoveredName: string | null
  onSelect: (name: string) => void
  onHover: (name: string | null) => void
  markerColor: string
  activeMarkerColor: string
  markerSize: number
  activeMarkerSize: number
  showPulse: boolean
  mapBackground: string
  centerLat: number
  centerLng: number
  zoom: number
  mergedTalukaMap: Map<string, string>
}

const GoaMapPanelLeaflet = dynamic(() => import('./GoaMapPanelLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="relative h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <div className="grid h-full place-items-center text-sm font-semibold text-slate-500">Loading map...</div>
    </div>
  ),
})

export default function GoaMapPanel(props: GoaMapPanelProps) {
  return <GoaMapPanelLeaflet {...props} />
}
