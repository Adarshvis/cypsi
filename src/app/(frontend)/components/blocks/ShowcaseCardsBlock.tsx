'use client'

import React from 'react'
import Image from 'next/image'
import DynamicIcon from '../ui/DynamicIcon'
import SectionHeading from '../ui/SectionHeading'
import ScrollReveal from '../ui/ScrollReveal'
import { ArrowRight } from 'lucide-react'

interface CardData {
  title: string
  image?: any
  caption?: string | null
  logo?: any
  subtitle?: string | null
  description?: string | null
  featured?: boolean | null
  featuredLabel?: string | null
  url?: string | null
  icon?: string | null
  id?: string | null
}

interface ShowcaseCardsBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  cardStyle?: 'overlay' | 'clean' | null
  columns?: '2' | '3' | '4' | null
  cards: CardData[]
  overlaySettings?: {
    overlayColor?: string | null
    overlayOpacity?: number | null
    cardHeight?: number | null
  } | null
  bottomLink?: {
    enabled?: boolean | null
    label?: string | null
    url?: string | null
  } | null
  accentColor?: string | null
  backgroundColor?: string | null
}

const columnClasses: Record<string, string> = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

// ── Overlay Card ──
function OverlayCard({
  card,
  overlayColor,
  overlayOpacity,
  cardHeight,
  accentColor,
}: {
  card: CardData
  overlayColor: string
  overlayOpacity: number
  cardHeight: number
  accentColor: string
}) {
  const imgUrl = typeof card.image === 'object' && card.image?.url ? card.image.url : null

  const content = (
    <div
      className="group relative overflow-hidden rounded-xl cursor-pointer"
      style={{ height: `${cardHeight}px` }}
    >
      {/* Image */}
      {imgUrl && (
        <Image
          src={imgUrl}
          alt={typeof card.image === 'object' ? card.image.alt || card.title : card.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-80"
        style={{
          background: `linear-gradient(to top, ${overlayColor} 0%, transparent 60%)`,
          opacity: overlayOpacity / 100,
        }}
      />

      {/* Featured badge */}
      {card.featured && (
        <div
          className="absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full z-10"
          style={{ backgroundColor: accentColor }}
        >
          {card.featuredLabel || 'Featured'}
        </div>
      )}

      {/* Text content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <div className="flex items-center gap-2">
          {card.icon && <DynamicIcon name={card.icon} size={18} className="text-white" />}
          <h3 className="text-white font-bold text-lg leading-tight">{card.title}</h3>
        </div>
        {card.caption && (
          <p className="text-white/80 text-sm mt-1">{card.caption}</p>
        )}
      </div>

      {/* Accent border bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 opacity-0 group-hover:opacity-100"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  )

  if (card.url) {
    return <a href={card.url} className="block">{content}</a>
  }
  return content
}

// ── Clean Card ──
function CleanCard({
  card,
  accentColor,
}: {
  card: CardData
  accentColor: string
}) {
  const imgUrl = typeof card.image === 'object' && card.image?.url ? card.image.url : null
  const logoUrl = typeof card.logo === 'object' && card.logo?.url ? card.logo.url : null

  const content = (
    <div className="group h-full flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-48 shrink-0 overflow-hidden">
        {imgUrl && (
          <Image
            src={imgUrl}
            alt={typeof card.image === 'object' ? card.image.alt || card.title : card.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {/* Featured badge */}
        {card.featured && (
          <div
            className="absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full"
            style={{ backgroundColor: accentColor }}
          >
            {card.featuredLabel || 'Featured'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3">
          {logoUrl && (
            <Image
              src={logoUrl}
              alt=""
              width={40}
              height={40}
              className="object-contain rounded-md"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {card.icon && <DynamicIcon name={card.icon} size={16} className="text-gray-500 shrink-0" />}
              <h3 className="font-bold text-gray-900 text-base truncate">{card.title}</h3>
            </div>
            {card.subtitle && (
              <p className="text-gray-500 text-sm truncate">{card.subtitle}</p>
            )}
          </div>
        </div>
        {card.description && (
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{card.description}</p>
        )}
        {/* Pinned to the bottom so the footer lines up across the row even when
            descriptions differ in length. */}
        {card.url && (
          <div
            className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors"
            style={{ color: accentColor }}
          >
            Learn More
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </div>
        )}
      </div>
    </div>
  )

  if (card.url) {
    return (
      <a href={card.url} className="block h-full">
        {content}
      </a>
    )
  }
  return content
}

// ── Main Block ──
export default function ShowcaseCardsBlock(props: ShowcaseCardsBlockProps) {
  const {
    sectionHeading,
    sectionDescription,
    headingAlignment,
    cardStyle = 'overlay',
    columns = '3',
    cards,
    overlaySettings,
    bottomLink,
    accentColor = '#3B82F6',
    backgroundColor = '#FFFFFF',
  } = props

  if (!cards || cards.length === 0) return null

  const style = cardStyle || 'overlay'
  const cols = columns || '3'
  const accent = accentColor || '#3B82F6'
  const overlayColor = overlaySettings?.overlayColor || '#000000'
  const overlayOpacity = overlaySettings?.overlayOpacity ?? 40
  const cardHeight = overlaySettings?.cardHeight || 300

  return (
    <section className="py-16 px-6" style={{ backgroundColor: backgroundColor || '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          heading={sectionHeading}
          description={sectionDescription}
          alignment={headingAlignment}
        />

        <div className={`grid ${columnClasses[cols]} gap-6 items-stretch`}>
          {cards.map((card, i) => (
            <ScrollReveal key={card.id || i} delay={i * 100} className="h-full">
              {style === 'overlay' ? (
                <OverlayCard
                  card={card}
                  overlayColor={overlayColor}
                  overlayOpacity={overlayOpacity}
                  cardHeight={cardHeight}
                  accentColor={accent}
                />
              ) : (
                <CleanCard card={card} accentColor={accent} />
              )}
            </ScrollReveal>
          ))}
        </div>

        {bottomLink?.enabled && bottomLink.label && bottomLink.url && (
          <div className="mt-10 text-center">
            <a
              href={bottomLink.url}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 border-2 hover:shadow-lg"
              style={{ borderColor: accent, color: accent }}
            >
              {bottomLink.label}
              <ArrowRight size={18} />
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
