'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import RichText from '../ui/RichText'
import DynamicIcon from '../ui/DynamicIcon'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// ── Shared helpers ──

function getMediaUrl(media: unknown): string | null {
  if (typeof media === 'object' && media && 'url' in media) {
    return (media as { url: string }).url
  }
  return null
}

function getMediaAlt(media: unknown): string {
  if (typeof media === 'object' && media && 'alt' in media) {
    return (media as { alt: string }).alt || ''
  }
  return ''
}

function getYouTubeEmbedUrl(url: string, autoplay: boolean, controls: boolean): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (!match) return null
  const id = match[1]
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: autoplay ? '1' : '0',
    controls: controls ? '1' : '0',
    rel: '0',
  })
  if (autoplay) params.set('playlist', id)
  return `https://www.youtube.com/embed/${id}?${params.toString()}`
}

function getVimeoEmbedUrl(url: string, autoplay: boolean, controls: boolean): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  if (!match) return null
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    muted: autoplay ? '1' : '0',
    background: controls ? '0' : '1',
  })
  return `https://player.vimeo.com/video/${match[1]}?${params.toString()}`
}

// ── Section Heading (local copy to avoid cross-imports) ──

function SectionHeading({
  heading,
  description,
  alignment = 'center',
}: {
  heading?: string | null
  description?: string | null
  alignment?: string | null
}) {
  if (!heading) return null
  const align = alignment === 'left' ? 'text-left' : alignment === 'right' ? 'text-right' : 'text-center'
  return (
    <div className={`mb-12 ${align}`}>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{heading}</h2>
      {description && <p className="text-gray-600 text-lg max-w-3xl mx-auto">{description}</p>}
    </div>
  )
}

// ── Sub-block renderers ──

function FlexRichText({
  content,
  fontFamily = 'inherit',
  headingFontFamily = 'inherit',
  fontSize = 'base',
  textColor = '#1F2937',
}: {
  content: unknown
  fontFamily?: string | null
  headingFontFamily?: string | null
  fontSize?: string | null
  textColor?: string | null
}) {
  const sizeClass: Record<string, string> = {
    sm: 'text-sm [&_p]:text-sm [&_li]:text-sm',
    base: 'text-base [&_p]:text-base [&_li]:text-base',
    lg: 'text-lg [&_p]:text-lg [&_li]:text-lg',
    xl: 'text-xl [&_p]:text-xl [&_li]:text-xl',
    '2xl': 'text-2xl [&_p]:text-2xl [&_li]:text-2xl',
  }

  const headingFont = headingFontFamily && headingFontFamily !== 'inherit'
    ? `"${headingFontFamily}", serif`
    : undefined

  return (
    <div
      className={`cms-richtext max-w-none rounded-lg ${sizeClass[fontSize || 'base'] || 'text-base [&_p]:text-base [&_li]:text-base'}`}
      style={{
        fontFamily: fontFamily && fontFamily !== 'inherit' ? `"${fontFamily}", sans-serif` : undefined,
        color: textColor || undefined,
        '--heading-font': headingFont || 'inherit',
      } as React.CSSProperties}
    >
      <RichText data={content as SerializedEditorState} />
    </div>
  )
}

function FlexImage({
  image,
  caption,
  captionColor = '#6B7280',
  objectFit = 'cover',
  rounded = 'lg',
}: {
  image: unknown
  caption?: string | null
  captionColor?: string | null
  objectFit?: string | null
  rounded?: string | null
}) {
  const url = getMediaUrl(image)
  if (!url) return null
  const alt = getMediaAlt(image)
  const roundedClass: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }
  return (
    <figure>
      <div className={`relative aspect-video overflow-hidden ${roundedClass[rounded || 'lg'] || 'rounded-lg'}`}>
        <Image
          src={url}
          alt={alt}
          fill
          className={`transition-transform duration-300 hover:scale-105`}
          style={{ objectFit: (objectFit as React.CSSProperties['objectFit']) || 'cover' }}
        />
      </div>
      {caption && (
        <figcaption
          className="mt-2 text-sm text-center"
          style={{ color: captionColor || '#6B7280' }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

function FlexVideo({
  videoSource = 'upload',
  uploadedVideo,
  youtubeUrl,
  vimeoUrl,
  externalVideoUrl,
  poster,
  autoplay = false,
  loop = false,
  controls = true,
}: {
  videoSource?: string | null
  uploadedVideo?: unknown
  youtubeUrl?: string | null
  vimeoUrl?: string | null
  externalVideoUrl?: string | null
  poster?: unknown
  autoplay?: boolean | null
  loop?: boolean | null
  controls?: boolean | null
}) {
  const posterUrl = getMediaUrl(poster)
  const shouldAutoplay = autoplay === true
  const shouldLoop = loop === true
  const showControls = controls !== false

  if (videoSource === 'youtube' && youtubeUrl) {
    const embedUrl = getYouTubeEmbedUrl(youtubeUrl, shouldAutoplay, showControls)
    if (!embedUrl) return <p className="text-red-500 text-sm">Invalid YouTube URL</p>
    return (
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
          loading="lazy"
          title="YouTube video"
        />
      </div>
    )
  }

  if (videoSource === 'vimeo' && vimeoUrl) {
    const embedUrl = getVimeoEmbedUrl(vimeoUrl, shouldAutoplay, showControls)
    if (!embedUrl) return <p className="text-red-500 text-sm">Invalid Vimeo URL</p>
    return (
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          allow="autoplay; fullscreen"
          allowFullScreen
          loading="lazy"
          title="Vimeo video"
        />
      </div>
    )
  }

  if (videoSource === 'externalUrl' && externalVideoUrl) {
    return (
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <video
          src={externalVideoUrl}
          poster={posterUrl || undefined}
          autoPlay={shouldAutoplay}
          muted={shouldAutoplay}
          loop={shouldLoop}
          controls={showControls}
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  // Default: uploaded video
  const videoUrl = getMediaUrl(uploadedVideo)
  if (!videoUrl) return null
  return (
    <div className="relative aspect-video rounded-lg overflow-hidden">
      <video
        src={videoUrl}
        poster={posterUrl || undefined}
        autoPlay={shouldAutoplay}
        muted={shouldAutoplay}
        loop={shouldLoop}
        controls={showControls}
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  )
}

function FlexCarousel({
  slides,
  autoplay = true,
  interval = 5000,
  showDots = true,
  showArrows = true,
}: {
  slides?: {
    id?: string
    mediaType?: string | null
    image?: unknown
    video?: unknown
    youtubeUrl?: string | null
    caption?: string | null
  }[]
  autoplay?: boolean | null
  interval?: number | null
  showDots?: boolean | null
  showArrows?: boolean | null
}) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const validSlides = slides?.filter(Boolean) || []
  const total = validSlides.length

  const next = useCallback(() => setCurrent((p) => (p + 1) % total), [total])
  const prev = useCallback(() => setCurrent((p) => (p - 1 + total) % total), [total])

  useEffect(() => {
    if (autoplay && total > 1) {
      timerRef.current = setInterval(next, interval || 5000)
      return () => clearInterval(timerRef.current)
    }
  }, [autoplay, interval, next, total])

  if (total === 0) return null

  const renderSlide = (slide: (typeof validSlides)[0]) => {
    if (slide.mediaType === 'youtube' && slide.youtubeUrl) {
      const embedUrl = getYouTubeEmbedUrl(slide.youtubeUrl, false, true)
      if (!embedUrl) return null
      return (
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
          loading="lazy"
          title="YouTube video"
        />
      )
    }
    if (slide.mediaType === 'video') {
      const videoUrl = getMediaUrl(slide.video)
      if (!videoUrl) return null
      return (
        <video
          src={videoUrl}
          controls
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )
    }
    // Default: image
    const url = getMediaUrl(slide.image)
    if (!url) return null
    return (
      <Image
        src={url}
        alt={getMediaAlt(slide.image)}
        fill
        className="object-cover"
      />
    )
  }

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden group">
      {validSlides.map((slide, i) => (
        <div
          key={slide.id || i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {renderSlide(slide)}
        </div>
      ))}

      {/* Caption */}
      {validSlides[current]?.caption && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
          <p className="text-white text-sm">{validSlides[current].caption}</p>
        </div>
      )}

      {/* Arrows */}
      {showArrows && total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {validSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === current ? 'bg-white scale-110' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FlexMapEmbed({
  embedType = 'iframe',
  iframeUrl,
  html,
  height = 400,
}: {
  embedType?: string | null
  iframeUrl?: string | null
  html?: string | null
  height?: number | null
}) {
  if (embedType === 'html' && html) {
    return (
      <div
        className="rounded-lg overflow-hidden"
        style={{ height: height || 400 }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }
  if (iframeUrl) {
    return (
      <iframe
        src={iframeUrl}
        className="w-full rounded-lg border-0"
        style={{ height: height || 400 }}
        loading="lazy"
        allowFullScreen
        title="Embedded content"
      />
    )
  }
  return null
}

function FlexAnimation({
  animationType = 'lottie',
  lottieUrl,
  gif,
  loop = true,
  autoplay = true,
}: {
  animationType?: string | null
  lottieUrl?: string | null
  gif?: unknown
  loop?: boolean | null
  autoplay?: boolean | null
}) {
  if (animationType === 'gif') {
    const url = getMediaUrl(gif)
    if (!url) return null
    return (
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <Image src={url} alt="Animation" fill className="object-contain" />
      </div>
    )
  }

  // Lottie – use dotlottie-player web component
  if (lottieUrl) {
    return (
      <div className="relative aspect-video rounded-lg overflow-hidden flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <iframe
          src={`https://lottie.host/embed?src=${encodeURIComponent(lottieUrl)}&loop=${loop !== false}&autoplay=${autoplay !== false}`}
          className="w-full h-full border-0"
          loading="lazy"
          title="Lottie animation"
        />
      </div>
    )
  }
  return null
}

function getAnimationClass(animation?: string | null): string {
  switch (animation) {
    case 'hoverLift':
      return 'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'
    case 'pulse':
      return 'animate-pulse-slow'
    case 'float':
      return 'animate-bounce-slow'
    default:
      return ''
  }
}

function isLexicalData(value: unknown): value is { root: unknown } {
  return Boolean(value && typeof value === 'object' && 'root' in (value as Record<string, unknown>))
}

function getResponsiveGridClass(columns: number): string {
  if (columns <= 1) return 'grid-cols-1'
  if (columns === 2) return 'grid-cols-1 md:grid-cols-2'
  if (columns === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
}

function getStatValueClass(value?: string | null): string {
  const raw = (value || '').trim()
  if (!raw) return 'text-3xl md:text-3xl'

  if (raw.toLowerCase() === 'enabled') return 'text-3xl md:text-2xl'
  if (raw.toLowerCase() === 'university of delhi') return 'text-2xl md:text-2xl'

  const isMostlyNumeric = /^[\d.,+%\-]+$/.test(raw)
  if (isMostlyNumeric && raw.length <= 5) return 'text-4xl md:text-3xl'

  return 'text-3xl md:text-3xl'
}

function FlexStatsCards({
  columns = '4',
  cardStyle = 'outline',
  cards,
}: {
  columns?: string | null
  cardStyle?: string | null
  cards?: {
    id?: string
    label?: string | null
    value?: string | null
    trend?: string | null
    trendLabel?: string | null
    icon?: string | null
    iconColor?: string | null
    animation?: string | null
  }[]
}) {
  if (!cards?.length) return null

  const cols = Number(columns || '4')
  const safeCols = Number.isFinite(cols) ? Math.min(4, Math.max(1, cols)) : 4

  const styleClass =
    cardStyle === 'elevated'
      ? 'bg-white shadow-lg border border-gray-100'
      : cardStyle === 'soft'
        ? 'bg-slate-50 border border-slate-100'
        : cardStyle === 'duccAbout'
          ? 'card-hover bg-white border'
          : 'bg-white border border-slate-200'

  /* ── About card style ── */
  if (cardStyle === 'duccAbout') {
    return (
      <div className={`grid gap-4 ${getResponsiveGridClass(safeCols)}`}>
        {cards.map((card, index) => (
          <article
            key={card.id || index}
            className="card-hover p-6 rounded-2xl bg-white border"
            style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)' }}
          >
            {card.icon && (
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
                style={{ background: 'var(--cms-muted-bg, #F8F4FF)' }}
              >
                <DynamicIcon
                  name={card.icon}
                  size={20}
                  color="var(--cms-primary, #4B2E83)"
                />
              </div>
            )}
            <div
              className="text-4xl font-bold tracking-tight"
              style={{ color: 'var(--cms-secondary, #1A103D)' }}
            >
              {card.value}
            </div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </article>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid gap-6 ${getResponsiveGridClass(safeCols)}`}>
      {cards.map((card, index) => (
        <article
          key={card.id || index}
          className={`rounded-3xl p-6 ${styleClass} ${getAnimationClass(card.animation)}`}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <p className="text-base font-semibold text-slate-500">{card.label}</p>
            {card.icon ? <DynamicIcon name={card.icon} size={24} color={card.iconColor || '#1d4ed8'} /> : null}
          </div>
          <p className={`${getStatValueClass(card.value)} font-extrabold leading-[1.05] tracking-tight text-slate-900`}>
            {card.value}
          </p>
          {(card.trend || card.trendLabel) && (
            <p className="mt-3 text-lg text-slate-500">
              {card.trend ? <span className="font-bold text-green-600">{card.trend}</span> : null}
              {card.trendLabel ? <span className={card.trend ? 'ml-2' : ''}>{card.trendLabel}</span> : null}
            </p>
          )}
        </article>
      ))}
    </div>
  )
}

function FlexFeatureCards({
  columns = '3',
  cardStyle = 'borderTop',
  cards,
}: {
  columns?: string | null
  cardStyle?: string | null
  cards?: {
    id?: string
    icon?: string | null
    iconColor?: string | null
    accentColor?: string | null
    title?: unknown
    subtitle?: string | null
    description?: unknown
    points?: { text?: string | null; id?: string }[]
    animation?: string | null
  }[]
}) {
  if (!cards?.length) return null

  const cols = Number(columns || '3')
  const safeCols = Number.isFinite(cols) ? Math.min(4, Math.max(1, cols)) : 3
  const accentPalette = ['#2563eb', '#f59e0b', '#0f172a', '#16a34a', '#7c3aed', '#dc2626']

  return (
    <div className={`grid gap-6 ${getResponsiveGridClass(safeCols)}`}>
      {cards.map((card, index) => {
        const accent = card.accentColor || accentPalette[index % accentPalette.length]
        const baseStyle =
          cardStyle === 'darkGlass'
            ? 'bg-slate-900/90 border border-slate-700 text-slate-100'
            : cardStyle === 'outline'
              ? 'bg-white border border-slate-200 text-slate-900'
              : 'bg-white border-t-4 border-slate-200 border border-slate-200 text-slate-900'

        return (
          <article
            key={card.id || index}
            className={`rounded-2xl p-6 ${baseStyle} ${getAnimationClass(card.animation)}`}
            style={cardStyle === 'borderTop' ? { borderTopColor: accent } : undefined}
          >
            {card.icon ? (
              <div
                className="mb-4 inline-flex rounded-xl p-3"
                style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, white)` }}
              >
                <DynamicIcon name={card.icon} size={22} color={card.iconColor || accent} />
              </div>
            ) : null}
            {card.subtitle ? <p className="mb-1 text-xs italic text-slate-500">{card.subtitle}</p> : null}
            {isLexicalData(card.title) ? (
              <div className="mb-3 cms-richtext text-inherit [&_p]:my-0">
                <RichText data={card.title as any} />
              </div>
            ) : (
              <h3 className="mb-3 text-2xl font-bold">{(card.title as string) || ''}</h3>
            )}

            {isLexicalData(card.description) ? (
              <div className="mb-4 cms-richtext text-slate-500 [&_p]:my-0">
                <RichText data={card.description as any} />
              </div>
            ) : card.description ? (
              <p className="mb-4 text-sm text-slate-500">{card.description as string}</p>
            ) : null}
            {card.points?.length ? (
              <ul className="space-y-2">
                {card.points.map((point, pointIndex) =>
                  point.text ? (
                    <li key={point.id || pointIndex} className="flex items-start gap-2 text-sm font-medium">
                      <span className="mt-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
                      <span>{point.text}</span>
                    </li>
                  ) : null,
                )}
              </ul>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}

function FlexHighlightCards({
  columns = '2',
  theme = 'light',
  titleSize = 'base',
  iconBgColor = '#EEF2FF',
  iconAlignment = 'left',
  cards,
}: {
  columns?: string | null
  theme?: string | null
  titleSize?: string | null
  iconBgColor?: string | null
  iconAlignment?: string | null
  cards?: {
    id?: string
    icon?: string | null
    iconColor?: string | null
    title?: string | null
    description?: string | null
    animation?: string | null
  }[]
}) {
  if (!cards?.length) return null

  const cols = Number(columns || '2')
  const safeCols = Number.isFinite(cols) ? Math.min(3, Math.max(1, cols)) : 2
  const cardStyle =
    theme === 'dark'
      ? 'bg-slate-900/60 border border-slate-700 text-slate-100'
      : 'bg-white border border-slate-200 text-slate-900'
  const titleSizeClass: Record<string, string> = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  }
  const iconAlignmentClass =
    iconAlignment === 'center'
      ? 'justify-center'
      : iconAlignment === 'right'
        ? 'justify-end'
        : 'justify-start'

  return (
    <div className={`grid gap-6 ${getResponsiveGridClass(safeCols)}`}>
      {cards.map((card, index) => (
        <article
          key={card.id || index}
          className={`rounded-3xl p-6 ${cardStyle} ${getAnimationClass(card.animation)}`}
        >
          {card.icon ? (
            <div className={`mb-4 flex ${iconAlignmentClass}`}>
              <div className="inline-flex rounded-2xl p-3" style={{ backgroundColor: iconBgColor || '#EEF2FF' }}>
                <DynamicIcon name={card.icon} size={24} color={card.iconColor || '#f59e0b'} />
              </div>
            </div>
          ) : null}
          <h3 className={`mb-2 font-bold ${titleSizeClass[titleSize || 'base'] || 'text-base'}`}>{card.title}</h3>
          {card.description ? <p className="text-base opacity-85">{card.description}</p> : null}
        </article>
      ))}
    </div>
  )
}

function FlexButtons({
  alignment = 'left',
  buttons,
}: {
  alignment?: string | null
  buttons?: {
    id?: string
    label?: string | null
    url?: string | null
    variant?: string | null
    size?: string | null
    icon?: string | null
    openInNewTab?: boolean | null
  }[]
}) {
  if (!buttons?.length) return null

  const alignClass =
    alignment === 'center'
      ? 'justify-center'
      : alignment === 'right'
        ? 'justify-end'
        : 'justify-start'

  const variantClass: Record<string, string> = {
    primary: 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] hover:opacity-90',
    secondary: 'bg-[var(--brand-secondary)] text-white border-[var(--brand-secondary)] hover:opacity-90',
    outline:
      'bg-transparent text-[var(--brand-primary)] border-[var(--brand-primary)] hover:bg-[color-mix(in_srgb,var(--brand-primary)_8%,white)]',
    ghost:
      'bg-transparent text-[var(--brand-primary)] border-transparent hover:bg-[color-mix(in_srgb,var(--brand-primary)_8%,white)]',
  }

  const sizeClass: Record<string, string> = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3 text-lg',
  }

  return (
    <div className={`flex flex-wrap gap-3 ${alignClass}`}>
      {buttons.map((button, index) => {
        if (!button.url || !button.label) return null

        const rel = button.openInNewTab ? 'noopener noreferrer' : undefined
        const target = button.openInNewTab ? '_blank' : undefined
        const variant = button.variant || 'primary'
        const size = button.size || 'md'

        return (
          <a
            key={button.id || index}
            href={button.url}
            target={target}
            rel={rel}
            className={`inline-flex items-center gap-2 rounded-xl border font-semibold transition-all duration-200 ${variantClass[variant] || variantClass.primary} ${sizeClass[size] || sizeClass.md}`}
          >
            <span>{button.label}</span>
            {button.icon ? <DynamicIcon name={button.icon} size={16} /> : null}
          </a>
        )
      })}
    </div>
  )
}

function FlexDashboardMock({
  layoutVariant = 'floatingCards',
  theme = 'light',
  chartCount = 3,
  /*
   * All of the label defaults below are empty on purpose.
   *
   * They previously carried copy from an earlier project — an education
   * dashboard for Goa — so an editor who added this block and left a field blank
   * got another organisation's wording rendered on the page. Every one of these
   * is an editable field, so an empty default simply renders nothing, and the
   * block shows only what was actually entered.
   */
  topBadgeLabel = '',
  topBadgeLabelSize = 'md',
  topBadgeLabelColor = '#64748b',
  topBadgeValue = '',
  topBadgeAnimation = 'float',
  topBadgeValueSize = '2xl',
  topBadgeValueColor = '#4338ca',
  bottomChipPrimary = '',
  bottomChipSecondary = '',
  bottomSummary = '',
  bottomBadgeAnimation = 'none',
  bottomSummarySize = 'lg',
  bottomSummaryColor = '#334155',
  syncFooterText = '',
}: {
  layoutVariant?: string | null
  theme?: string | null
  chartCount?: number | null
  topBadgeLabel?: string | null
  topBadgeLabelSize?: string | null
  topBadgeLabelColor?: string | null
  topBadgeValue?: string | null
  topBadgeAnimation?: string | null
  topBadgeValueSize?: string | null
  topBadgeValueColor?: string | null
  bottomChipPrimary?: string | null
  bottomChipSecondary?: string | null
  bottomSummary?: string | null
  bottomBadgeAnimation?: string | null
  bottomSummarySize?: string | null
  bottomSummaryColor?: string | null
  syncFooterText?: string | null
}) {
  const count = Math.max(1, Math.min(4, Number(chartCount || 3)))
  const isDark = theme === 'dark'
  const labelSizeClass: Record<string, string> = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' }
  const valueSizeClass: Record<string, string> = { lg: 'text-4xl', xl: 'text-5xl', '2xl': 'text-6xl' }
  const summarySizeClass: Record<string, string> = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }

  if (layoutVariant === 'syncStatusPanel') {
    return (
      <div className="relative py-6">
        <div
          className={`relative overflow-hidden rounded-[2rem] border px-5 py-6 shadow-2xl md:px-7 md:py-8 ${
            isDark ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-slate-100'
          }`}
        >
          <div className="space-y-5">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={`flex items-center justify-between rounded-[1.7rem] border px-4 py-4 md:px-5 ${
                  isDark ? 'border-slate-600 bg-slate-700/70' : 'border-slate-300 bg-white/80'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`inline-flex rounded-2xl p-3 ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                    <DynamicIcon name="School" size={24} color="#1d4ed8" />
                  </div>
                  <div>
                    <div className={`mb-2 h-3 w-24 rounded-full ${isDark ? 'bg-slate-500/60' : 'bg-slate-400/60'}`} />
                    <div className={`h-2.5 w-36 rounded-full ${isDark ? 'bg-slate-500/50' : 'bg-slate-400/50'}`} />
                  </div>
                </div>
                <div className={`h-8 w-20 rounded-full ${isDark ? 'bg-amber-900/40' : 'bg-amber-700/60'}`} />
              </div>
            ))}
          </div>

          <div className={`my-7 border-t ${isDark ? 'border-slate-600' : 'border-slate-300'}`} />

          <div className="flex items-center justify-center gap-2">
            <p
              className={`dashboard-sync-footer-text text-center font-semibold tracking-[0.16em] ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {syncFooterText}
            </p>
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse animation-delay-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse animation-delay-400" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative py-10">
      <div
        className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-2xl ${
          isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="h-4 w-4 rounded-full bg-rose-300" />
          <span className="h-4 w-4 rounded-full bg-amber-300" />
          <span className="h-4 w-4 rounded-full bg-indigo-300" />
        </div>

        <div className="mb-8 h-7 w-36 rounded-full bg-indigo-100" />

        <div className="mb-8 grid gap-4" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className={`flex h-24 items-center justify-center rounded-3xl border border-dashed ${
                isDark ? 'border-slate-600 bg-slate-700 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-500'
              }`}
            >
              <DynamicIcon name="ChartColumn" size={28} />
            </div>
          ))}
        </div>

        <div
          className={`rounded-3xl border p-5 ${
            isDark ? 'border-slate-600 bg-slate-700/60' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className={`mb-4 h-5 w-full rounded-full ${isDark ? 'bg-slate-500/40' : 'bg-slate-200'}`} />
          <div className={`mb-4 h-5 w-3/4 rounded-full ${isDark ? 'bg-slate-500/35' : 'bg-slate-200'}`} />
          <div className={`h-5 w-1/2 rounded-full ${isDark ? 'bg-slate-500/30' : 'bg-slate-200'}`} />
        </div>
      </div>

      <div
        className={`absolute right-[-0.8rem] top-[-0.8rem] rounded-[1.8rem] border px-6 py-4 shadow-xl ${getAnimationClass(topBadgeAnimation)} ${
          isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <p
          className={`${labelSizeClass[topBadgeLabelSize || 'md'] || 'text-base'} font-bold tracking-wider`}
          style={{ color: topBadgeLabelColor || '#64748b' }}
        >
          {topBadgeLabel}
        </p>
        <p
          className={`${valueSizeClass[topBadgeValueSize || '2xl'] || 'text-5xl'} font-black leading-none`}
          style={{ color: topBadgeValueColor || '#4338ca' }}
        >
          {topBadgeValue}
        </p>
      </div>

      <div
        className={`absolute bottom-[-0.6rem] left-[-1.2rem] max-w-[20rem] rounded-[2rem] border p-5 shadow-xl ${getAnimationClass(bottomBadgeAnimation)} ${
          isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <div className="mb-3 flex items-center gap-3">
          <span className="whitespace-nowrap rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-base font-semibold text-amber-500">
            {bottomChipPrimary}
          </span>
          <span className="whitespace-nowrap rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-base font-semibold text-slate-600">
            {bottomChipSecondary}
          </span>
        </div>
        <p
          className={`${summarySizeClass[bottomSummarySize || 'lg'] || 'text-2xl'} font-semibold leading-snug`}
          style={{ color: bottomSummaryColor || '#334155' }}
        >
          {bottomSummary}
        </p>
      </div>
    </div>
  )
}

// ── Sub-block router ──

function RenderSubBlock(block: { blockType: string; [key: string]: unknown }) {
  const { blockType, ...rest } = block
  switch (blockType) {
    case 'flexRichText':
      return <FlexRichText {...(rest as Parameters<typeof FlexRichText>[0])} />
    case 'flexImage':
      return <FlexImage {...(rest as Parameters<typeof FlexImage>[0])} />
    case 'flexVideo':
      return <FlexVideo {...(rest as Parameters<typeof FlexVideo>[0])} />
    case 'flexCarousel':
      return <FlexCarousel {...(rest as Parameters<typeof FlexCarousel>[0])} />
    case 'flexMapEmbed':
      return <FlexMapEmbed {...(rest as Parameters<typeof FlexMapEmbed>[0])} />
    case 'flexAnimation':
      return <FlexAnimation {...(rest as Parameters<typeof FlexAnimation>[0])} />
    case 'flexStatsCards':
      return <FlexStatsCards {...(rest as Parameters<typeof FlexStatsCards>[0])} />
    case 'flexFeatureCards':
      return <FlexFeatureCards {...(rest as Parameters<typeof FlexFeatureCards>[0])} />
    case 'flexHighlightCards':
      return <FlexHighlightCards {...(rest as Parameters<typeof FlexHighlightCards>[0])} />
    case 'flexButtons':
      return <FlexButtons {...(rest as Parameters<typeof FlexButtons>[0])} />
    case 'flexDashboardMock':
      return <FlexDashboardMock {...(rest as Parameters<typeof FlexDashboardMock>[0])} />
    default:
      return null
  }
}

// ── Column width map ──

const widthStyles: Record<string, string> = {
  auto: '',
  '25': 'w-full md:w-1/4',
  '33': 'w-full md:w-1/3',
  '50': 'w-full md:w-1/2',
  '66': 'w-full md:w-2/3',
  '75': 'w-full md:w-3/4',
  '100': 'w-full',
}

const gapClasses: Record<string, string> = {
  '0': 'gap-0',
  '4': 'gap-4',
  '6': 'gap-6',
  '8': 'gap-8',
  '12': 'gap-12',
}

const paddingClasses: Record<string, string> = {
  '0': 'p-0',
  '4': 'p-4',
  '6': 'p-6',
  '8': 'p-8',
}

const alignClasses: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

function getSectionAutoGridClass(columnCount: number): string {
  if (columnCount <= 1) return 'grid grid-cols-1'
  if (columnCount === 2) return 'grid grid-cols-1 lg:grid-cols-2'
  if (columnCount === 3) return 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
  return 'grid grid-cols-1 md:grid-cols-2'
}

// ── Main Component ──

interface ColumnData {
  id?: string
  width?: string | null
  columnBgColor?: string | null
  padding?: string | null
  blocks?: { blockType: string; id?: string; [key: string]: unknown }[]
}

interface FlexibleRowBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  sectionBgColor?: string | null
  radialGlow?: boolean | null
  gap?: string | null
  verticalAlign?: string | null
  columns?: ColumnData[]
}

export default function FlexibleRowBlock({
  sectionHeading,
  sectionDescription,
  headingAlignment,
  sectionBgColor = '#FFFFFF',
  radialGlow = false,
  gap = '6',
  verticalAlign = 'start',
  columns,
}: FlexibleRowBlockProps) {
  if (!columns || columns.length === 0) return null

  const allAuto = columns.every((c) => !c.width || c.width === 'auto')
  const containerClass = allAuto
    ? `${getSectionAutoGridClass(columns.length)} ${gapClasses[gap || '6'] || 'gap-6'} ${alignClasses[verticalAlign || 'start'] || 'items-start'}`
    : `flex flex-wrap ${gapClasses[gap || '6'] || 'gap-6'} ${alignClasses[verticalAlign || 'start'] || 'items-start'}`

  return (
    <section
      className="relative py-16 px-6 overflow-hidden"
      style={{ backgroundColor: sectionBgColor || '#FFFFFF' }}
    >
      {radialGlow && (
        <div className="absolute inset-0 radial-glow pointer-events-none" />
      )}
      <div className="max-w-7xl mx-auto relative">
        <SectionHeading
          heading={sectionHeading}
          description={sectionDescription}
          alignment={headingAlignment}
        />

        <div className={containerClass}>
          {columns.map((col, i) => {
            const w = col.width || 'auto'
            const isAuto = w === 'auto'
            const bgColor = col.columnBgColor && col.columnBgColor !== 'transparent' ? col.columnBgColor : undefined

            return (
              <div
                key={col.id || i}
                className={`${!isAuto ? widthStyles[w] || '' : ''} ${paddingClasses[col.padding || '0'] || ''} ${bgColor ? 'rounded-lg' : ''} flex-shrink-0`}
                style={{
                  backgroundColor: bgColor || undefined,
                  // For auto columns in flex mode, use 2-col layout for 4+ columns
                  ...(isAuto && !allAuto ? { flex: `1 1 calc(${columns.length > 3 ? '50%' : '33.333%'} - 1.5rem)`, minWidth: '280px' } : {}),
                }}
              >
                {col.blocks?.map((block, j) => (
                  <div key={block.id || j} className={j > 0 ? 'mt-4' : ''}>
                    <RenderSubBlock {...block} />
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
