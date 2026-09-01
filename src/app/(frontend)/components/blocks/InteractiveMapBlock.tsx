'use client'

import React from 'react'
import SectionHeading from '../ui/SectionHeading'
import ScrollReveal from '../ui/ScrollReveal'
import { useInView } from '../ui/useInView'

interface ProgressItem {
  label: string
  value: number
  displayValue?: string | null
  barColor?: string | null
  id?: string | null
}

interface InteractiveMapBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  mapImage?: any
  mapEmbedUrl?: string | null
  mapHeight?: number | null
  showProgressBars?: boolean | null
  progressItems?: ProgressItem[] | null
  layout?: 'mapLeft' | 'mapRight' | 'stacked' | null
  backgroundColor?: string | null
}

// ── Animated Progress Bar ──
function ProgressBar({
  item,
  animate,
  delay,
}: {
  item: ProgressItem
  animate: boolean
  delay: number
}) {
  const barColor = item.barColor || '#3B82F6'

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-gray-700 font-medium text-sm">{item.label}</span>
        <span className="text-gray-500 text-sm font-medium">
          {item.displayValue || `${item.value}%`}
        </span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all ease-out"
          style={{
            width: animate ? `${item.value}%` : '0%',
            backgroundColor: barColor,
            transitionDuration: '1.5s',
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  )
}

// ── Map Display ──
function MapDisplay({
  mapImage,
  mapEmbedUrl,
  mapHeight,
}: {
  mapImage?: any
  mapEmbedUrl?: string | null
  mapHeight: number
}) {
  const imgUrl = typeof mapImage === 'object' && mapImage?.url ? mapImage.url : null

  if (mapEmbedUrl) {
    return (
      <div className="rounded-xl overflow-hidden shadow-lg">
        <iframe
          src={mapEmbedUrl}
          className="w-full border-0"
          style={{ height: `${mapHeight}px` }}
          loading="lazy"
          title="Interactive Map"
        />
      </div>
    )
  }

  if (imgUrl) {
    return (
      <div className="relative rounded-xl overflow-hidden shadow-lg flex items-center justify-center" style={{ height: `${mapHeight}px` }}>
        <img
          src={imgUrl}
          alt={typeof mapImage === 'object' ? mapImage.alt || 'Map' : 'Map'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div
      className="rounded-xl bg-gray-100 flex items-center justify-center text-gray-400"
      style={{ height: `${mapHeight}px` }}
    >
      No map configured
    </div>
  )
}

// ── Main Block ──
export default function InteractiveMapBlock(props: InteractiveMapBlockProps) {
  const {
    sectionHeading,
    sectionDescription,
    headingAlignment,
    mapImage,
    mapEmbedUrl,
    mapHeight = 500,
    showProgressBars = true,
    progressItems,
    layout = 'mapLeft',
    backgroundColor = '#FFFFFF',
  } = props

  const { ref, inView } = useInView(0.15)
  const hasProgress = showProgressBars && progressItems && progressItems.length > 0
  const mapLayout = layout || 'mapLeft'
  const height = mapHeight || 500

  return (
    <section
      ref={ref}
      className="py-16 px-6"
      style={{ backgroundColor: backgroundColor || '#FFFFFF' }}
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          heading={sectionHeading}
          description={sectionDescription}
          alignment={headingAlignment}
        />

        {mapLayout === 'stacked' ? (
          <div className="space-y-10">
            <ScrollReveal>
              <MapDisplay mapImage={mapImage} mapEmbedUrl={mapEmbedUrl} mapHeight={height} />
            </ScrollReveal>
            {hasProgress && (
              <ScrollReveal delay={200}>
                <div className="max-w-3xl mx-auto">
                  {progressItems.map((item, i) => (
                    <ProgressBar key={item.id || i} item={item} animate={inView} delay={i * 150} />
                  ))}
                </div>
              </ScrollReveal>
            )}
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-start ${
              mapLayout === 'mapRight' ? 'lg:[direction:rtl] lg:[&>*]:[direction:ltr]' : ''
            }`}
          >
            <ScrollReveal>
              <MapDisplay mapImage={mapImage} mapEmbedUrl={mapEmbedUrl} mapHeight={height} />
            </ScrollReveal>
            {hasProgress && (
              <ScrollReveal delay={200}>
                <div className="py-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">State-wise Progress</h3>
                  {progressItems.map((item, i) => (
                    <ProgressBar key={item.id || i} item={item} animate={inView} delay={i * 150} />
                  ))}
                </div>
              </ScrollReveal>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
