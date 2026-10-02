'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import SectionHeading from '../ui/SectionHeading'
import ScrollReveal from '../ui/ScrollReveal'
import { X, ZoomIn } from 'lucide-react'

interface ScreenshotData {
  image?: any
  title?: string | null
  caption?: string | null
  category?: string | null
  id?: string | null
}

interface ScreenshotGalleryBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  screenshots: ScreenshotData[]
  columns?: '2' | '3' | '4' | null
  enableLightbox?: boolean | null
  showDeviceFrame?: boolean | null
  deviceType?: 'laptop' | 'tablet' | 'phone' | null
  backgroundColor?: string | null
}

const columnClasses: Record<string, string> = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

const deviceFrameClasses: Record<string, string> = {
  laptop: 'rounded-t-lg border-t-[24px] border-x-[12px] border-b-[36px] border-gray-800',
  tablet: 'rounded-2xl border-[14px] border-gray-800',
  phone: 'rounded-3xl border-[8px] border-gray-800 max-w-[280px] mx-auto',
}

// ── Lightbox Modal ──
function Lightbox({
  screenshot,
  onClose,
}: {
  screenshot: ScreenshotData
  onClose: () => void
}) {
  const imgUrl = typeof screenshot.image === 'object' && screenshot.image?.url ? screenshot.image.url : null
  const closeRef = useRef<HTMLButtonElement>(null)
  // Held in a ref so a new onClose each parent render does not re-run the effect.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // Escape closes; focus moves into the dialog and returns to the thumbnail after.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
      // The close button is the only control, so Tab stays on it.
      if (e.key === 'Tab') {
        e.preventDefault()
        closeRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      opener?.focus()
    }
  }, [])

  if (!imgUrl) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={screenshot.title || screenshot.image?.alt || undefined}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        aria-label="Close"
        title="Close"
      >
        <X size={32} />
      </button>
      <div className="relative max-w-5xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
        <Image
          src={imgUrl}
          alt={typeof screenshot.image === 'object' ? screenshot.image.alt || screenshot.title || '' : ''}
          width={1920}
          height={1080}
          className="object-contain w-full h-auto max-h-[80vh] rounded-lg"
        />
        {(screenshot.title || screenshot.caption) && (
          <div className="text-center mt-4">
            {screenshot.title && <h3 className="text-white font-semibold text-lg">{screenshot.title}</h3>}
            {screenshot.caption && <p className="text-gray-400 text-sm mt-1">{screenshot.caption}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Screenshot Card ──
function ScreenshotCard({
  screenshot,
  showDeviceFrame,
  deviceType,
  onLightbox,
}: {
  screenshot: ScreenshotData
  showDeviceFrame: boolean
  deviceType: string
  onLightbox?: () => void
}) {
  const imgUrl = typeof screenshot.image === 'object' && screenshot.image?.url ? screenshot.image.url : null

  return (
    <div className="group">
      <div
        className={`relative overflow-hidden cursor-pointer ${
          showDeviceFrame
            ? deviceFrameClasses[deviceType] || ''
            : 'rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300'
        }`}
        onClick={onLightbox}
        // Keyboard users can open the lightbox too; the image alt names the control.
        {...(onLightbox
          ? {
              role: 'button',
              tabIndex: 0,
              'aria-haspopup': 'dialog' as const,
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onLightbox()
                }
              },
            }
          : {})}
      >
        {imgUrl && (
          <div className="relative aspect-video">
            <Image
              src={imgUrl}
              alt={typeof screenshot.image === 'object' ? screenshot.image.alt || screenshot.title || '' : ''}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        {/* Hover overlay with zoom icon */}
        {onLightbox && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
            <ZoomIn
              size={32}
              className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        )}
        {screenshot.category && (
          <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            {screenshot.category}
          </span>
        )}
      </div>
      {(screenshot.title || screenshot.caption) && (
        <div className="mt-3 text-center">
          {screenshot.title && (
            <h3 className="font-semibold text-gray-900 text-sm">{screenshot.title}</h3>
          )}
          {screenshot.caption && (
            <p className="text-gray-500 text-xs mt-1">{screenshot.caption}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Block ──
export default function ScreenshotGalleryBlock(props: ScreenshotGalleryBlockProps) {
  const {
    sectionHeading,
    sectionDescription,
    headingAlignment,
    screenshots,
    columns = '3',
    enableLightbox = true,
    showDeviceFrame = false,
    deviceType = 'laptop',
    backgroundColor = '#F9FAFB',
  } = props

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (!screenshots || screenshots.length === 0) return null

  const cols = columns || '3'
  const device = deviceType || 'laptop'
  const frame = showDeviceFrame === true

  return (
    <section className="py-16 px-6" style={{ backgroundColor: backgroundColor || '#F9FAFB' }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          heading={sectionHeading}
          description={sectionDescription}
          alignment={headingAlignment}
        />

        <div className={`grid ${columnClasses[cols]} gap-8`}>
          {screenshots.map((screenshot, i) => (
            <ScrollReveal key={screenshot.id || i} delay={i * 100}>
              <ScreenshotCard
                screenshot={screenshot}
                showDeviceFrame={frame}
                deviceType={device}
                onLightbox={enableLightbox !== false ? () => setLightboxIndex(i) : undefined}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && screenshots[lightboxIndex] && (
        <Lightbox
          screenshot={screenshots[lightboxIndex]}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  )
}
