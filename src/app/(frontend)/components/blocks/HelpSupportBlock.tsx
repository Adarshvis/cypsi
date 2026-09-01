'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import DynamicIcon from '../ui/DynamicIcon'
import SectionHeading from '../ui/SectionHeading'
import ScrollReveal from '../ui/ScrollReveal'
import { Play, ArrowRight } from 'lucide-react'

interface SupportCardData {
  title: string
  description?: string | null
  icon?: string | null
  iconColor?: string | null
  buttonLabel?: string | null
  buttonUrl?: string | null
  id?: string | null
}

interface HelpSupportBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  layout?: 'sideBySide' | 'stacked' | null
  supportCards?: SupportCardData[] | null
  video?: {
    enabled?: boolean | null
    title?: string | null
    videoUrl?: string | null
    poster?: any
    uploadedVideo?: any
  } | null
  backgroundColor?: string | null
  cardBgColor?: string | null
}

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`
  const vmMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}?autoplay=1`
  return null
}

// ── Support Card ──
function SupportCard({ card, cardBg }: { card: SupportCardData; cardBg: string }) {
  const iconColor = card.iconColor || '#3B82F6'

  return (
    <div
      className="rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
      style={{ backgroundColor: cardBg }}
    >
      {card.icon && (
        <div className="mb-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <DynamicIcon name={card.icon} size={24} color={iconColor} />
          </div>
        </div>
      )}
      <h3 className="font-bold text-gray-900 text-lg mb-2">{card.title}</h3>
      {card.description && (
        <p className="text-gray-500 text-sm leading-relaxed mb-4">{card.description}</p>
      )}
      {card.buttonLabel && card.buttonUrl && (
        <a
          href={card.buttonUrl}
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: iconColor }}
        >
          {card.buttonLabel}
          <ArrowRight size={14} />
        </a>
      )}
    </div>
  )
}

// ── Video Player ──
function VideoPlayer({ video }: { video: HelpSupportBlockProps['video'] }) {
  const [playing, setPlaying] = useState(false)

  if (!video?.enabled) return null

  const posterUrl = typeof video.poster === 'object' && video.poster?.url ? video.poster.url : null
  const uploadedUrl =
    typeof video.uploadedVideo === 'object' && video.uploadedVideo?.url
      ? video.uploadedVideo.url
      : null

  const embedUrl = video.videoUrl ? getEmbedUrl(video.videoUrl) : null

  return (
    <div>
      {video.title && (
        <h3 className="font-bold text-gray-900 text-lg mb-4">{video.title}</h3>
      )}
      <div className="relative rounded-xl overflow-hidden shadow-lg bg-gray-900 aspect-video">
        {playing && embedUrl ? (
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full border-0"
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
          />
        ) : playing && uploadedUrl ? (
          <video
            src={uploadedUrl}
            controls
            autoPlay
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <>
            {posterUrl && (
              <Image
                src={posterUrl}
                alt={video.title || 'Video'}
                fill
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <button
                onClick={() => setPlaying(true)}
                className="w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                aria-label="Play video"
              >
                <Play size={28} className="text-gray-900 ml-1" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main Block ──
export default function HelpSupportBlock(props: HelpSupportBlockProps) {
  const {
    sectionHeading,
    sectionDescription,
    headingAlignment,
    layout = 'sideBySide',
    supportCards,
    video,
    backgroundColor = '#FFFFFF',
    cardBgColor = '#F9FAFB',
  } = props

  const hasCards = supportCards && supportCards.length > 0
  const hasVideo = video?.enabled
  const blockLayout = layout || 'sideBySide'
  const cardBg = cardBgColor || '#F9FAFB'

  if (!hasCards && !hasVideo) return null

  return (
    <section className="py-16 px-6" style={{ backgroundColor: backgroundColor || '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          heading={sectionHeading}
          description={sectionDescription}
          alignment={headingAlignment}
        />

        {blockLayout === 'stacked' ? (
          <div className="space-y-10">
            {hasCards && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {supportCards.map((card, i) => (
                  <ScrollReveal key={card.id || i} delay={i * 100}>
                    <SupportCard card={card} cardBg={cardBg} />
                  </ScrollReveal>
                ))}
              </div>
            )}
            {hasVideo && (
              <ScrollReveal delay={200}>
                <div className="max-w-3xl mx-auto">
                  <VideoPlayer video={video} />
                </div>
              </ScrollReveal>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {hasCards && (
              <div className="space-y-4">
                {supportCards.map((card, i) => (
                  <ScrollReveal key={card.id || i} delay={i * 100}>
                    <SupportCard card={card} cardBg={cardBg} />
                  </ScrollReveal>
                ))}
              </div>
            )}
            {hasVideo && (
              <ScrollReveal delay={200}>
                <VideoPlayer video={video} />
              </ScrollReveal>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
