"use client"

import 'leaflet/dist/leaflet.css'
import React, { useEffect, useMemo } from 'react'
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet'
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

interface PlotMarker {
  name: string
  lat: number
  lng: number
  row: SnapshotDataRow
}

const LeafletMapContainer = MapContainer as unknown as React.ComponentType<any>
const LeafletCircleMarker = CircleMarker as unknown as React.ComponentType<any>
const LeafletTooltip = Tooltip as unknown as React.ComponentType<any>

const GOA_BOUNDS = {
  minLat: 14.96,
  maxLat: 15.82,
  minLng: 73.68,
  maxLng: 74.26,
}

const GOA_NAME_ANCHORS: Array<{ match: RegExp; x: number; y: number }> = [
  { match: /pernem/, x: 38, y: 12 },
  { match: /bardez/, x: 44, y: 28 },
  { match: /bicholim/, x: 55, y: 24 },
  { match: /sattari/, x: 67, y: 19 },
  { match: /tiswadi|panaji|panjim/, x: 47, y: 43 },
  { match: /ponda/, x: 58, y: 43 },
  { match: /mormugao|vasco/, x: 40, y: 56 },
  { match: /salcete|margao/, x: 48, y: 62 },
  { match: /dharbandora|mollem/, x: 68, y: 49 },
  { match: /quepem/, x: 58, y: 69 },
  { match: /sanguem/, x: 72, y: 64 },
  { match: /canacona/, x: 66, y: 82 },
  { match: /north\s*goa|district\s*1/, x: 51, y: 30 },
  { match: /south\s*goa|district\s*2/, x: 56, y: 67 },
  { match: /government/, x: 34, y: 50 },
  { match: /private/, x: 74, y: 50 },
  { match: /aided/, x: 48, y: 36 },
  { match: /unaided/, x: 62, y: 58 },
  { match: /boys/, x: 42, y: 72 },
  { match: /girls/, x: 58, y: 77 },
  { match: /co-?ed|mixed/, x: 52, y: 50 },
  { match: /primary/, x: 38, y: 36 },
  { match: /secondary/, x: 64, y: 34 },
  { match: /higher/, x: 68, y: 74 },
]

function fallbackMarkerPosition(name: string): { x: number; y: number } | null {
  const normalized = name.trim().toLowerCase()
  const found = GOA_NAME_ANCHORS.find((anchor) => anchor.match.test(normalized))
  return found ? { x: found.x, y: found.y } : null
}

function anchorToLatLng(anchor: { x: number; y: number }): { lat: number; lng: number } {
  const lngRange = GOA_BOUNDS.maxLng - GOA_BOUNDS.minLng
  const latRange = GOA_BOUNDS.maxLat - GOA_BOUNDS.minLat
  return {
    lng: GOA_BOUNDS.minLng + (anchor.x / 100) * lngRange,
    lat: GOA_BOUNDS.maxLat - (anchor.y / 100) * latRange,
  }
}

function normalizePoints(rows: SnapshotDataRow[], mergedTalukaMap: Map<string, string>): PlotMarker[] {
  const markers: PlotMarker[] = []

  rows.forEach((row) => {
    if (typeof row.markerLat !== 'number' || typeof row.markerLng !== 'number') return
    if (Number.isNaN(row.markerLat) || Number.isNaN(row.markerLng)) return

    const displayName = mergedTalukaMap.get(row.name.trim().toLowerCase()) || row.name
    markers.push({
      name: displayName,
      lat: row.markerLat,
      lng: row.markerLng,
      row,
    })
  })

  const seen = new Set(markers.map((marker) => marker.name.trim().toLowerCase()))

  rows.forEach((row) => {
    const displayName = mergedTalukaMap.get(row.name.trim().toLowerCase()) || row.name
    const key = displayName.trim().toLowerCase()
    if (seen.has(key)) return
    const fallback = fallbackMarkerPosition(displayName)
    if (!fallback) return
    const point = anchorToLatLng(fallback)

    markers.push({
      name: displayName,
      lat: point.lat,
      lng: point.lng,
      row,
    })
    seen.add(key)
  })

  return markers
}

function FitToMarkers({
  markers,
  centerLat,
  centerLng,
  zoom,
}: {
  markers: PlotMarker[]
  centerLat: number
  centerLng: number
  zoom: number
}) {
  const map = useMap()

  useEffect(() => {
    if (markers.length > 0) {
      map.fitBounds(markers.map((marker) => [marker.lat, marker.lng] as [number, number]), {
        padding: [20, 20],
        maxZoom: 12,
      })
      return
    }

    map.setView([centerLat, centerLng], zoom)
  }, [map, markers, centerLat, centerLng, zoom])

  return null
}

function ConfigureMap() {
  const map = useMap()

  useEffect(() => {
    map.scrollWheelZoom.disable()
    map.zoomControl?.remove()
    ;(map as { attributionControl?: { remove: () => void } }).attributionControl?.remove()
    map.setMaxBounds([
      [14.75, 73.45],
      [16.05, 74.45],
    ])
  }, [map])

  return null
}

export default function GoaMapPanelLeaflet({
  rows,
  selectedName,
  hoveredName,
  onSelect,
  onHover,
  markerColor,
  activeMarkerColor,
  markerSize,
  activeMarkerSize,
  showPulse,
  mapBackground,
  centerLat,
  centerLng,
  zoom,
  mergedTalukaMap,
}: GoaMapPanelProps) {
  const markers = useMemo(() => normalizePoints(rows, mergedTalukaMap), [rows, mergedTalukaMap])
  const pulseOpacity = showPulse ? 0.18 : 0

  return (
    <div
      className="goa-snapshot-map relative z-0 isolate h-[420px] overflow-hidden rounded-2xl border border-slate-200"
      style={{ background: mapBackground }}
    >
      <LeafletMapContainer
        bounds={[
          [GOA_BOUNDS.minLat, GOA_BOUNDS.minLng],
          [GOA_BOUNDS.maxLat, GOA_BOUNDS.maxLng],
        ]}
        boundsOptions={{ padding: [16, 16] }}
        className="relative z-0 h-full w-full"
      >
        <ConfigureMap />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitToMarkers markers={markers} centerLat={centerLat} centerLng={centerLng} zoom={zoom} />

        {markers.map((marker) => {
          const active = selectedName === marker.row.name || hoveredName === marker.row.name
          const radius = Math.max(4, (active ? activeMarkerSize : markerSize) / 2)

          return (
            <LeafletCircleMarker
              key={marker.row.id || marker.row.name}
              center={[marker.lat, marker.lng]}
              radius={radius}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
                fillOpacity: 0.95,
                fillColor: active ? activeMarkerColor : markerColor,
              }}
              eventHandlers={{
                click: () => onSelect(marker.row.name),
                mouseover: () => onHover(marker.row.name),
                mouseout: () => onHover(null),
              }}
            >
              <LeafletTooltip direction="top" offset={[0, -8]}>
                {marker.name}
              </LeafletTooltip>
            </LeafletCircleMarker>
          )
        })}

        {showPulse &&
          markers.map((marker) => {
            const active = selectedName === marker.row.name || hoveredName === marker.row.name
            if (!active) return null

            return (
              <LeafletCircleMarker
                key={`${marker.row.id || marker.row.name}-pulse`}
                center={[marker.lat, marker.lng]}
                radius={Math.max(8, activeMarkerSize)}
                pathOptions={{
                  color: activeMarkerColor,
                  weight: 2,
                  fillColor: activeMarkerColor,
                  fillOpacity: pulseOpacity,
                  opacity: 0.45,
                }}
                interactive={false}
              />
            )
          })}
      </LeafletMapContainer>

      {markers.length === 0 && (
        <div className="absolute inset-x-4 bottom-4 rounded-xl bg-white/85 px-3 py-2 text-xs font-semibold text-slate-600 backdrop-blur">
          Add marker coordinates in Goa Snapshot rows to pin exact locations.
        </div>
      )}

      <style jsx global>{`
        .goa-snapshot-map .leaflet-pane,
        .goa-snapshot-map .leaflet-control,
        .goa-snapshot-map .leaflet-top,
        .goa-snapshot-map .leaflet-bottom {
          z-index: 10 !important;
        }
      `}</style>
    </div>
  )
}