'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Play, Pause, ArrowRight, ArrowUpRight } from 'lucide-react'
import Lottie from 'lottie-react'
import DynamicIcon from '../ui/DynamicIcon'
import SandboxedHtml from '../ui/SandboxedHtml'
import { usePrefersReducedMotion } from '../ui/usePrefersReducedMotion'

const mediaFillStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
}

const mediaCoverStyle: React.CSSProperties = {
  ...mediaFillStyle,
  objectFit: 'cover',
  objectPosition: 'center',
}

// ── Types ──
interface SlideData {
  mediaType?: string | null
  image?: any
  videoUrl?: string | null
  videoPoster?: any
  externalVideoUrl?: string | null
  animationUrl?: string | null
  dataVizEmbed?: string | null
  eyebrowText?: string | null
  showText?: boolean | null
  heading?: string | null
  headingColor?: string | null
  subtitle?: string | null
  subtitleColor?: string | null
  buttons?: {
    label: string
    url: string
    variant?: 'primary' | 'secondary' | 'outline' | null
    icon?: string | null
    id?: string | null
  }[] | null
  id?: string | null
}

interface HeroBlockProps {
  mode?: 'single' | 'carousel' | null
  layout?: 'fullWidth' | 'fullscreenOverlayCarousel' | 'duccFullscreen' | 'split' | 'contained' | null
  splitDirection?: 'textLeft' | 'textRight' | null
  splitTheme?: 'dark' | 'light' | null
  splitTextBehavior?: 'static' | 'slide' | null
  splitFeatures?: { icon?: string | null; text: string; id?: string }[] | null
  height?: number | null
  textAlignment?: 'left' | 'center' | 'right' | null
  textVerticalPosition?: 'top' | 'center' | 'bottom' | null
  contentMaxWidth?: number | null
  contentPaddingX?: number | null
  contentPaddingY?: number | null
  constantOverlayContent?: boolean | null
  constantOverlay?: {
    showText?: boolean | null
    heading?: string | null
    headingColor?: string | null
    subtitle?: string | null
    subtitleColor?: string | null
    buttons?: {
      label: string
      url: string
      variant?: 'primary' | 'secondary' | 'outline' | null
      icon?: string | null
      id?: string | null
    }[] | null
  } | null
  overlay?: { enabled?: boolean | null; color?: string | null; opacity?: number | null } | null
  headerGlass?: {
    enabled?: boolean | null
    fillColor?: string | null
    fillOpacity?: number | null
    blurAmount?: number | null
    showDivider?: boolean | null
  } | null
  carouselSettings?: {
    autoPlay?: boolean | null
    autoPlayInterval?: number | null
    showArrows?: boolean | null
    showDots?: boolean | null
  } | null
  singleSlide?: SlideData | null
  slides?: SlideData[] | null
  /* Fullscreen overlay extras */
  duccFloatingCard?: {
    enabled?: boolean | null
    badgeLabel?: string | null
    footerText?: string | null
    footerLink?: string | null
    footerLinkLabel?: string | null
    stats?: { value: string; label: string; id?: string }[] | null
  } | null
  duccShowSlideCounter?: boolean | null
  duccShowPlayPause?: boolean | null
  quickAccessBar?: {
    enabled?: boolean | null
    overlapAmount?: number | null
    items?: {
      label: string
      icon?: string | null
      link: string
      external?: boolean | null
      colorVariant?: 'primary' | 'dark' | null
      id?: string | null
    }[] | null
  } | null
}

function hexToRgba(hex: string, opacity: number): string {
  const normalized = hex.replace('#', '').trim()
  const valid = normalized.length === 3 || normalized.length === 6
  if (!valid) return `rgba(255, 255, 255, ${opacity})`

  const full =
    normalized.length === 3
      ? `${normalized[0]}${normalized[0]}${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}`
      : normalized

  const r = Number.parseInt(full.slice(0, 2), 16)
  const g = Number.parseInt(full.slice(2, 4), 16)
  const b = Number.parseInt(full.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

function LottieFromUrl({ url }: { url: string }) {
  const [animationData, setAnimationData] = useState<any | null>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setAnimationData(null)
    setHasError(false)

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load Lottie JSON')
        return response.json()
      })
      .then((data) => {
        if (!cancelled) setAnimationData(data)
      })
      .catch(() => {
        if (!cancelled) setHasError(true)
      })

    return () => {
      cancelled = true
    }
  }, [url])

  if (hasError) {
    return <iframe src={url} className="border-0" style={mediaFillStyle} loading="lazy" />
  }

  if (!animationData) {
    return <div className="absolute inset-0 animate-pulse bg-slate-800/40" />
  }

  return (
    <div className="absolute inset-0 w-full h-full p-4 sm:p-6">
      <Lottie animationData={animationData} loop autoplay className="w-full h-full" />
    </div>
  )
}

const alignClasses = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
}

const verticalPositionClasses = {
  top: 'items-start',
  center: 'items-center',
  bottom: 'items-end',
}

const horizontalPositionClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

const btnVariants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl',
  secondary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl',
  outline: 'border-2 border-white text-white hover:bg-white hover:text-gray-900',
}

// ── Helper: parse YouTube/Vimeo URL to embed ──
function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&mute=0&loop=0&controls=1&rel=0&modestbranding=1`
  const vmMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}?autoplay=1&muted=1&loop=1&background=1`
  return null
}

function hasTextContent(slide: SlideData): boolean {
  if (slide.showText === false) return false
  const hasButtons = Array.isArray(slide.buttons) && slide.buttons.length > 0
  return Boolean(slide.heading || slide.subtitle || hasButtons)
}

function hasMediaContent(slide: SlideData): boolean {
  const type = slide.mediaType || 'textOnly'

  if (type === 'image') {
    return Boolean(typeof slide.image === 'object' && slide.image?.url)
  }

  if (type === 'video') {
    return Boolean(slide.videoUrl)
  }

  if (type === 'externalVideo') {
    return Boolean(slide.externalVideoUrl && getEmbedUrl(slide.externalVideoUrl))
  }

  if (type === 'animation') {
    return Boolean(slide.animationUrl)
  }

  if (type === 'dataViz') {
    return Boolean(slide.dataVizEmbed)
  }

  return false
}

// ── Slide Media Renderer ──
function SlideMedia({ slide }: { slide: SlideData }) {
  const type = slide.mediaType || 'textOnly'

  if (type === 'image') {
    const url = typeof slide.image === 'object' && slide.image?.url ? slide.image.url : null
    if (!url) return null
    return (
      <img
        src={url}
        alt={typeof slide.image === 'object' ? slide.image.alt || '' : ''}
        style={mediaCoverStyle}
        loading="eager"
      />
    )
  }

  if (type === 'video') {
    const posterUrl = typeof slide.videoPoster === 'object' && slide.videoPoster?.url ? slide.videoPoster.url : undefined
    return (
      <video
        src={slide.videoUrl || undefined}
        poster={posterUrl}
        autoPlay
        muted
        loop
        playsInline
        style={mediaCoverStyle}
      />
    )
  }

  if (type === 'externalVideo' && slide.externalVideoUrl) {
    const embedUrl = getEmbedUrl(slide.externalVideoUrl)
    if (!embedUrl) return null
    return (
      <div style={{ ...mediaFillStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <iframe
          src={embedUrl}
          className="border-0"
          style={{ width: '100%', height: '100%' }}
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
          loading="lazy"
        />
      </div>
    )
  }

  if (type === 'animation' && slide.animationUrl) {
    const isGif = slide.animationUrl.endsWith('.gif')
    const isLottieJson = slide.animationUrl.endsWith('.json')

    if (isLottieJson) {
      return <LottieFromUrl url={slide.animationUrl} />
    }

    if (isGif) {
      return <img src={slide.animationUrl} alt="" style={mediaCoverStyle} />
    }
    return (
      <iframe src={slide.animationUrl} className="border-0" style={mediaFillStyle} loading="lazy" />
    )
  }

  if (type === 'dataViz' && slide.dataVizEmbed) {
    return (
      <div style={mediaFillStyle}>
        {/* Sandboxed: CMS HTML must never run with the site's origin */}
        <SandboxedHtml
          html={slide.dataVizEmbed}
          title={slide.eyebrowText || 'Data visualisation'}
          sizing={{ mode: 'fill' }}
        />
      </div>
    )
  }

  return null
}

// ── Slide Text Content ──
function SlideContent({
  slide,
  align,
}: {
  slide: SlideData
  align: 'left' | 'center' | 'right'
}) {
  if (slide.showText === false) return null

  return (
    <div className={`relative z-10 flex flex-col gap-5 ${alignClasses[align]}`}>
      {slide.heading && (
        <h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight break-words [overflow-wrap:anywhere] max-w-[22ch] animate-fade-in-up"
          style={slide.headingColor ? { color: slide.headingColor } : undefined}
        >
          {slide.heading}
        </h1>
      )}
      {slide.subtitle && (
        <p
          className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl animate-fade-in-up animation-delay-200"
          style={slide.subtitleColor ? { color: slide.subtitleColor } : undefined}
        >
          {slide.subtitle}
        </p>
      )}
      {slide.buttons && slide.buttons.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-2 animate-fade-in-up animation-delay-400">
          {slide.buttons.map((btn) => (
            <a
              key={btn.id || btn.url}
              href={btn.url}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${btnVariants[btn.variant || 'primary']}`}
            >
              {btn.label}
              {btn.icon && <DynamicIcon name={btn.icon} size={18} />}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Hero Block ──
export default function HeroBlock(props: HeroBlockProps) {
  const {
    mode = 'single',
    layout = 'fullWidth',
    splitDirection = 'textLeft',
    splitTheme = 'dark',
    splitTextBehavior = 'static',
    splitFeatures,
    height = 600,
    textAlignment = 'center',
    textVerticalPosition = 'center',
    contentMaxWidth = 1200,
    contentPaddingX = 24,
    contentPaddingY = 32,
    constantOverlayContent = false,
    constantOverlay,
    overlay,
    headerGlass,
    carouselSettings,
    singleSlide,
    slides,
    duccFloatingCard,
    duccShowSlideCounter,
    duccShowPlayPause,
    quickAccessBar,
  } = props

  const allSlides: SlideData[] =
    mode === 'carousel' && slides && slides.length > 0 ? slides : singleSlide ? [singleSlide] : []

  const [current, setCurrent] = useState(0)
  const [previous, setPrevious] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const currentRef = useRef(0)

  useEffect(() => {
    if (allSlides.length === 0) {
      setCurrent(0)
      return
    }

    setCurrent((prev) => (prev >= allSlides.length ? 0 : prev))
  }, [allSlides.length])

  useEffect(() => {
    if (currentRef.current === current) return

    setPrevious(currentRef.current)
    currentRef.current = current

    const timer = window.setTimeout(() => {
      setPrevious(null)
    }, 750)

    return () => {
      window.clearTimeout(timer)
    }
  }, [current])

  const next = useCallback(() => {
    setCurrent((prev) => {
      if (allSlides.length === 0) return 0
      return (prev + 1) % allSlides.length
    })
  }, [allSlides.length])

  const prev = useCallback(() => {
    setCurrent((prev) => {
      if (allSlides.length === 0) return 0
      return (prev - 1 + allSlides.length) % allSlides.length
    })
  }, [allSlides.length])

  // Auto-play. Off when the system asks for reduced motion; the arrows and dots still work.
  const reducedMotion = usePrefersReducedMotion()
  useEffect(() => {
    if (mode !== 'carousel' || !carouselSettings?.autoPlay || allSlides.length <= 1) return
    if (!isPlaying || reducedMotion) return
    const interval = setInterval(next, carouselSettings.autoPlayInterval || 5000)
    return () => clearInterval(interval)
  }, [mode, carouselSettings, allSlides.length, next, isPlaying, reducedMotion])

  useEffect(() => {
    if (layout !== 'fullscreenOverlayCarousel') return

    const headerEl = document.querySelector<HTMLElement>('.site-header')
    if (!headerEl) return

    const glassEnabled = headerGlass?.enabled !== false
    const fillOpacity = Math.min(Math.max((headerGlass?.fillOpacity ?? 20) / 100, 0), 1)
    const blurAmount = Math.min(Math.max(headerGlass?.blurAmount ?? 16, 0), 40)
    const fillColor = headerGlass?.fillColor || '#FFFFFF'
    const showDivider = headerGlass?.showDivider !== false

    const onScroll = () => {
      const solid = window.scrollY > 12
      headerEl.classList.toggle('hero-header-solid', solid)
      headerEl.classList.toggle('hero-header-transparent', !solid)
    }

    headerEl.classList.add('hero-header-overlay')
    headerEl.classList.toggle('header-glass', glassEnabled)
    headerEl.classList.toggle('hero-header-no-divider', !showDivider)
    if (glassEnabled) {
      headerEl.style.setProperty('--header-glass-bg', hexToRgba(fillColor, fillOpacity))
      headerEl.style.setProperty('--header-glass-blur', `${blurAmount}px`)
    } else {
      headerEl.style.removeProperty('--header-glass-bg')
      headerEl.style.removeProperty('--header-glass-blur')
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      headerEl.classList.remove('hero-header-overlay')
      headerEl.classList.remove('hero-header-solid')
      headerEl.classList.remove('hero-header-transparent')
      headerEl.classList.remove('header-glass')
      headerEl.classList.remove('hero-header-no-divider')
      headerEl.style.removeProperty('--header-glass-bg')
      headerEl.style.removeProperty('--header-glass-blur')
    }
  }, [layout, headerGlass])

  if (allSlides.length === 0) return null

  const currentSlide = allSlides[current]
  const fallbackTextSlide = allSlides.find(hasTextContent) || allSlides[0]
  const fallbackMediaSlide = allSlides.find(hasMediaContent) || allSlides[0]
  const constantOverlaySlide: SlideData | null =
    constantOverlay &&
    (constantOverlay.heading ||
      constantOverlay.subtitle ||
      (Array.isArray(constantOverlay.buttons) && constantOverlay.buttons.length > 0))
      ? {
          showText: constantOverlay.showText,
          heading: constantOverlay.heading,
          headingColor: constantOverlay.headingColor,
          subtitle: constantOverlay.subtitle,
          subtitleColor: constantOverlay.subtitleColor,
          buttons: constantOverlay.buttons,
        }
      : null
  const fullscreenContentSlide =
    mode === 'carousel' && layout === 'fullscreenOverlayCarousel' && constantOverlayContent
      ? constantOverlaySlide || fallbackTextSlide
      : currentSlide
  const align = textAlignment || 'center'
  const heroHeight = height || 600
  const showArrows = mode === 'carousel' && carouselSettings?.showArrows !== false && allSlides.length > 1
  const showDots = mode === 'carousel' && carouselSettings?.showDots !== false && allSlides.length > 1
  const autoPlayInterval = carouselSettings?.autoPlayInterval || 5000

  // Overlay
  const overlayEnabled = overlay?.enabled !== false
  const overlayColor = overlay?.color || '#000000'
  const overlayOpacity = (overlay?.opacity ?? 50) / 100

  if (layout === 'duccFullscreen') {
    const slideData = mode === 'carousel' ? currentSlide : allSlides[0]
    const showCounter = duccShowSlideCounter !== false && mode === 'carousel' && allSlides.length > 1
    const showPlayPauseBtn = duccShowPlayPause !== false && mode === 'carousel' && allSlides.length > 1
    const qaEnabled = quickAccessBar?.enabled
    const qaItems = quickAccessBar?.items || []
    const qaOverlap = quickAccessBar?.overlapAmount || 80
    const floatingEnabled = duccFloatingCard?.enabled !== false
    const floatingStats = duccFloatingCard?.stats || []

    return (
      <>
        {/* Hero — sits below header, NOT fullscreen behind it */}
        <section
          className="relative w-full overflow-hidden"
          style={{
            minHeight: `${heroHeight}px`,
            background: 'var(--cms-secondary, #1A103D)',
            marginBottom: qaEnabled ? `${qaOverlap}px` : undefined,
          }}
          role="region"
          aria-label="Hero"
        >
          {/* Gold accent line */}
          <div
            className="absolute top-0 left-0 w-full h-1 z-30"
            style={{
              background: `linear-gradient(90deg, transparent, var(--cms-accent, #EAB308) 30%, var(--cms-accent, #EAB308) 70%, transparent)`,
            }}
          />

          {/* Slides — opacity crossfade with Ken Burns zoom */}
          {allSlides.map((slide, i) => (
            <div
              key={slide.id || `ducc-slide-${i}`}
              // Hidden slides must not be reachable by Tab or read out.
              inert={i !== current}
              aria-hidden={i !== current}
              className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${
                i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {slide.mediaType === 'image' &&
                typeof slide.image === 'object' &&
                slide.image?.url ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${slide.image.url})`,
                      transition: 'transform 8s ease-out',
                      transform: i === current ? 'scale(1.08)' : 'scale(1.0)',
                    }}
                  />
                ) : (
                  <div className="absolute inset-0">
                    <SlideMedia slide={slide} />
                  </div>
                )}
              <div
                className="absolute inset-0"
                style={{
                  background: overlayEnabled
                    ? `linear-gradient(135deg, color-mix(in srgb, var(--cms-secondary, #1A103D) ${overlayOpacity * 100}%, transparent) 0%, color-mix(in srgb, var(--cms-primary, #4B2E83) ${overlayOpacity * 85}%, transparent) 100%)`
                    : 'none',
                }}
              />
            </div>
          ))}

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-28 lg:py-36">
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center min-h-[70vh]">
              {/* Left content */}
              <div key={slideData.id || 'ducc-content'} className="fade-in-up">
                  {slideData.eyebrowText && (
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] mb-6 backdrop-blur-sm"
                      style={{
                        background: `color-mix(in srgb, var(--cms-accent, #EAB308) 15%, transparent)`,
                        border: `1px solid color-mix(in srgb, var(--cms-accent, #EAB308) 40%, transparent)`,
                        color: 'var(--cms-accent, #EAB308)',
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ background: 'var(--cms-accent, #EAB308)' }}
                      />
                      {slideData.eyebrowText}
                    </div>
                  )}

                  {slideData.heading && (
                    <h1
                      className="ducc-heading text-white font-bold leading-[1.05] tracking-tight"
                      style={{
                        fontSize: 'clamp(2.25rem, 5vw, 4.25rem)',
                        color: slideData.headingColor || '#FFFFFF',
                      }}
                    >
                      {slideData.heading}
                    </h1>
                  )}

                  {slideData.subtitle && (
                    <p
                      className="mt-6 text-lg max-w-2xl leading-relaxed"
                      style={{ color: slideData.subtitleColor || 'rgba(255,255,255,0.85)' }}
                    >
                      {slideData.subtitle}
                    </p>
                  )}

                  {/* Buttons */}
                  <div className="mt-10 flex flex-wrap items-center gap-4">
                    {slideData.buttons?.map((btn) => (
                      <a
                        key={btn.id || btn.url}
                        href={btn.url}
                        className={`btn-shine group inline-flex items-center gap-2 text-sm font-semibold px-7 py-3.5 rounded-md transition ${
                          btn.variant === 'outline'
                            ? 'text-white border border-white/30 hover:bg-white/10'
                            : btn.variant === 'secondary'
                              ? 'text-white hover:brightness-110'
                              : 'hover:brightness-110'
                        }`}
                        style={
                          btn.variant === 'outline'
                            ? undefined
                            : btn.variant === 'secondary'
                              ? { background: 'var(--cms-primary, #4B2E83)' }
                              : { background: 'var(--cms-accent, #EAB308)', color: 'var(--cms-secondary, #1A103D)' }
                        }
                      >
                        {btn.label}
                        {btn.icon ? (
                          <DynamicIcon name={btn.icon} size={16} />
                        ) : (
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                        )}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Right floating card */}
                {floatingEnabled && floatingStats.length > 0 && (
                  <div className="hidden lg:block relative">
                    <div
                      className="absolute -top-8 -right-8 w-64 h-64 rounded-full blur-3xl opacity-30"
                      style={{ background: 'var(--cms-accent, #EAB308)' }}
                    />
                    <div
                      className="relative float-y backdrop-blur-md rounded-2xl p-7 border"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        borderColor: 'rgba(255,255,255,0.15)',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: 'var(--cms-accent, #EAB308)' }}
                        />
                        <span className="text-xs font-semibold tracking-wider text-white/70 uppercase">
                          {duccFloatingCard?.badgeLabel || 'Live Snapshot'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        {floatingStats.map((stat) => (
                          <div
                            key={stat.id || stat.label}
                            className="p-4 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
                          >
                            <div
                              className="text-3xl font-bold"
                              style={{ color: 'var(--cms-accent, #EAB308)' }}
                            >
                              {stat.value}
                            </div>
                            <div className="text-xs text-white/70 mt-1">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                      {duccFloatingCard?.footerLink && (
                        <div className="mt-5 pt-5 border-t border-white/10 flex items-center justify-between">
                          <span className="text-xs text-white/60">
                            {duccFloatingCard.footerText || 'Updated Real-time'}
                          </span>
                          <Link
                            href={duccFloatingCard.footerLink}
                            className="text-xs font-semibold hover:underline"
                            style={{ color: 'var(--cms-accent, #EAB308)' }}
                          >
                            {duccFloatingCard.footerLinkLabel || 'View dashboard →'}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

          {/* Bottom controls */}
          {mode === 'carousel' && allSlides.length > 1 && (
            <div className="absolute bottom-8 left-0 right-0 z-20">
              <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {showArrows && (
                    <>
                      <button
                        onClick={prev}
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white border border-white/30 hover:bg-white/10 transition"
                        aria-label="Previous"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={next}
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white border border-white/30 hover:bg-white/10 transition"
                        aria-label="Next"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  {showPlayPauseBtn && (
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="ml-2 w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {showDots &&
                    allSlides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: i === current ? '2.5rem' : '1.25rem',
                          background:
                            i === current
                              ? 'var(--cms-accent, #EAB308)'
                              : 'rgba(255,255,255,0.3)',
                        }}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  {showCounter && (
                    <span className="ml-4 text-white/70 text-xs font-mono">
                      {String(current + 1).padStart(2, '0')} / {String(allSlides.length).padStart(2, '0')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

        </section>

        {/* Quick Access Bar */}
        {qaEnabled && qaItems.length > 0 && (
          <section
            className="hero-quick-access px-6"
            style={{ marginTop: `-${qaOverlap}px` }}
          >
            <div className="max-w-7xl mx-auto">
              <div
                className="rounded-2xl shadow-2xl overflow-hidden"
                style={{ background: '#ffffff', border: `1px solid var(--cms-muted-bg, #F8F4FF)` }}
              >
                {/* Items per row: mobile=2, tablet=3, desktop=min(itemCount, 6) */}
                {(() => {
                  const lgCols = Math.min(qaItems.length, 6)
                  const lgClass =
                    lgCols <= 2 ? 'lg:grid-cols-2'
                    : lgCols === 3 ? 'lg:grid-cols-3'
                    : lgCols === 4 ? 'lg:grid-cols-4'
                    : lgCols === 5 ? 'lg:grid-cols-5'
                    : 'lg:grid-cols-6'

                  return (
                <div className={`grid grid-cols-2 md:grid-cols-3 ${lgClass}`}>
                  {qaItems.map((item, i) => {
                    const isExternal = item.external
                    const Tag = isExternal ? 'a' : Link
                    const linkProps = isExternal
                      ? { href: item.link, target: '_blank', rel: 'noreferrer' }
                      : { href: item.link }

                    return (
                      <Tag
                        key={item.id || i}
                        {...(linkProps as any)}
                        className="group relative flex flex-col items-center justify-center gap-3 py-8 px-4 text-center transition-all hover:bg-[--cms-muted-bg] border-r border-b border-[--cms-muted-bg]"
                      >
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3"
                          style={{
                            background:
                              i % 2 === 0
                                ? 'var(--cms-primary, #4B2E83)'
                                : 'var(--cms-secondary, #1A103D)',
                          }}
                        >
                          {item.icon ? (
                            <DynamicIcon
                              name={item.icon}
                              size={24}
                              color="var(--cms-accent, #EAB308)"
                            />
                          ) : (
                            <ArrowRight
                              className="w-6 h-6"
                              style={{ color: 'var(--cms-accent, #EAB308)' }}
                            />
                          )}
                        </div>
                        <div
                          className="text-sm font-semibold group-hover:text-[--cms-primary] transition-colors"
                          style={{ color: 'var(--cms-text, #1A103D)' }}
                        >
                          {item.label}
                        </div>
                        <ArrowUpRight
                          className="w-4 h-4 text-gray-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
                          style={{ color: 'var(--cms-accent, #EAB308)', opacity: 0.4 }}
                        />
                      </Tag>
                    )
                  })}
                </div>
                  )
                })()}
              </div>
            </div>
          </section>
        )}
      </>
    )
  }

  if (layout === 'fullscreenOverlayCarousel') {
    const align = textAlignment || 'center'
    const vertical = textVerticalPosition || 'center'

    return (
      <section
        className="hero-fs-carousel"
        style={
          {
            '--hero-slide-fade-ms': '700ms',
            '--hero-kenburns-duration-ms': `${Math.max(autoPlayInterval + 1800, 9000)}ms`,
            marginTop: 'calc(var(--site-header-height, 140px) * -1)',
            paddingTop: 'var(--site-header-height, 140px)',
            minHeight: '100svh',
          } as React.CSSProperties
        }
        role="region"
        aria-label="Hero"
      >
        {allSlides.map((slide, i) => (
          <div
            key={slide.id || `fullscreen-slide-${i}`}
            // Hidden slides must not be reachable by Tab or read out.
            inert={i !== current}
            aria-hidden={i !== current}
            className={`hero-fs-slide ${i === current ? 'is-active' : i === previous ? 'is-leaving' : 'is-idle'}`}
          >
            <div className="hero-fs-slide-media">
              <SlideMedia slide={slide} />
            </div>
          </div>
        ))}

        {overlayEnabled && (
          <div className="hero-fs-overlay" style={{ backgroundColor: overlayColor, opacity: overlayOpacity }} />
        )}

        <div
          className={`hero-fs-content-wrap ${verticalPositionClasses[vertical]} ${horizontalPositionClasses[align]}`}
        >
          <div
            className="hero-fs-content"
            style={{
              maxWidth: `${contentMaxWidth}px`,
              paddingInline: `${contentPaddingX}px`,
              paddingBlock: `${contentPaddingY}px`,
            }}
          >
            <SlideContent slide={fullscreenContentSlide} align={align} />
          </div>
        </div>

        {showArrows && <CarouselArrows prev={prev} next={next} />}
        {showDots && <CarouselDots total={allSlides.length} current={current} setCurrent={setCurrent} />}
      </section>
    )
  }

  // ── Split layout ──
  if (layout === 'split') {
    const isTextLeft = splitDirection !== 'textRight'
    const isLight = splitTheme === 'light'
    const textBehavior = splitTextBehavior || 'static'

    // For 'static': always show first slide's text. For 'slide': show current slide's text.
    const textSlide = textBehavior === 'slide'
      ? (mode === 'carousel' ? currentSlide : allSlides[0])
      : allSlides.find(hasTextContent) || allSlides[0]

    const renderTextSide = (slide: SlideData) => (
      <>
        {slide.heading && (
          <h1
            className="ducc-heading font-bold tracking-tight"
            style={{
              // Deliberately modest: the split hero pairs a restrained heading
              // with a larger body paragraph, rather than a dominant display title.
              fontSize: 'clamp(1.6rem, 2.6vw, 2.1rem)',
              lineHeight: 1.2,
              marginBottom: '1.25rem',
              color: isLight ? 'var(--cms-secondary, #1A103D)' : '#FFFFFF',
            }}
          >
            {slide.heading}
          </h1>
        )}
        {slide.subtitle && (
          <p
            className="max-w-xl"
            style={{
              fontSize: '1.15rem',
              lineHeight: 1.6,
              color: isLight ? 'var(--cms-text, #1A103D)' : 'rgba(255,255,255,0.85)',
              opacity: 0.8,
            }}
          >
            {slide.subtitle}
          </p>
        )}

        {/* Buttons */}
        {slide.buttons && slide.buttons.length > 0 && (
          <div className="mt-7 flex flex-wrap gap-4">
            {slide.buttons.map((btn, bi) => (
              <a
                key={btn.id || bi}
                href={btn.url}
                className={`btn-shine inline-flex items-center gap-2 font-semibold transition ${
                  btn.variant === 'outline' ? 'border' : ''
                }`}
                style={{
                  padding: '11px 27px',
                  borderRadius: 10,
                  fontSize: '1rem',
                  ...(btn.variant === 'outline'
                    ? {
                        borderColor: isLight ? 'var(--cms-secondary, #1A103D)' : 'rgba(255,255,255,0.3)',
                        color: isLight ? 'var(--cms-secondary, #1A103D)' : '#fff',
                        background: 'transparent',
                      }
                    : {
                        background: isLight ? 'var(--cms-secondary, #1A103D)' : 'var(--cms-accent, #EAB308)',
                        color: isLight ? '#fff' : 'var(--cms-secondary, #1A103D)',
                      }),
                }}
              >
                {btn.label}
                {btn.icon && <DynamicIcon name={btn.icon} size={16} />}
              </a>
            ))}
          </div>
        )}
      </>
    )

    return (
      <section
        style={{
          backgroundColor: isLight ? 'var(--cms-muted-bg, #F8F4FF)' : 'var(--cms-secondary, #1A103D)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div
            className={`flex flex-col ${isTextLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-10 lg:gap-16`}
            style={{ padding: '30px 0 60px' }}
          >
            {/* Text side */}
            <div className="flex-1">
              {textBehavior === 'slide' ? (
                /* Sliding text — crossfade with each slide */
                <div className="relative">
                  {allSlides.map((slide, i) => {
                    const s = hasTextContent(slide) ? slide : allSlides.find(hasTextContent) || allSlides[0]
                    return (
                      <div
                        key={slide.id || `split-text-${i}`}
                        // Hidden slides must not be reachable by Tab or read out.
                        inert={i !== current}
                        aria-hidden={i !== current}
                        className={`transition-opacity duration-500 ease-in-out ${
                          i === current ? 'opacity-100 relative' : 'opacity-0 absolute inset-0 pointer-events-none'
                        }`}
                      >
                        {renderTextSide(s)}
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* Static text — always shows first slide with text */
                renderTextSide(textSlide)
              )}

              {/* Features row — always static */}
              {splitFeatures && splitFeatures.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-8">
                  {splitFeatures.map((feat, fi) => (
                    <div
                      key={feat.id || fi}
                      className="flex items-center gap-2 font-medium"
                      style={{
                        fontSize: '0.9rem',
                        color: isLight ? 'var(--cms-text, #1A103D)' : 'rgba(255,255,255,0.8)',
                      }}
                    >
                      {feat.icon && (
                        <DynamicIcon
                          name={feat.icon}
                          size={16}
                          color={isLight ? 'var(--cms-primary, #4B2E83)' : 'var(--cms-accent, #EAB308)'}
                        />
                      )}
                      {feat.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Media side */}
            <div className="flex-1 relative w-full">
              <div
                className="relative overflow-hidden"
                style={{
                  // The source renders hero media at its natural height. These
                  // slides are 1920x1080, so 16/9 shows them uncropped.
                  aspectRatio: '16 / 9',
                  borderRadius: 7,
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                }}
              >
                {allSlides.map((slide, i) => {
                  const mediaSlide = hasMediaContent(slide) ? slide : fallbackMediaSlide
                  return (
                    <div
                      key={slide.id || `split-media-${i}`}
                      // Hidden slides must not be reachable by Tab or read out.
                      inert={i !== current}
                      aria-hidden={i !== current}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      <SlideMedia slide={mediaSlide} />
                    </div>
                  )
                })}
              </div>

              {allSlides.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                  {allSlides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className="w-2.5 h-2.5 rounded-full transition-all"
                      style={{
                        background:
                          i === current
                            ? isLight
                              ? 'var(--cms-secondary, #1A103D)'
                              : 'var(--cms-accent, #EAB308)'
                            : 'rgba(255,255,255,0.55)',
                      }}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ── Contained layout ──
  if (layout === 'contained') {
    return (
      <section className="py-12 px-6">
        <div
          className="relative max-w-6xl mx-auto rounded-2xl overflow-hidden flex items-center justify-center"
          style={{ minHeight: `${heroHeight}px` }}
        >
          <SlideMedia slide={currentSlide} />
          {overlayEnabled && (
            <div className="absolute inset-0" style={{ backgroundColor: overlayColor, opacity: overlayOpacity }} />
          )}
          <div className="relative z-10 px-8 py-16 w-full max-w-4xl mx-auto">
            <SlideContent slide={currentSlide} align={align} />
          </div>
          {showArrows && <CarouselArrows prev={prev} next={next} />}
          {showDots && <CarouselDots total={allSlides.length} current={current} setCurrent={setCurrent} />}
        </div>
      </section>
    )
  }

  // ── Full-width layout (default) ──
  return (
    <section
      className="relative overflow-hidden flex items-center justify-center"
      style={{ minHeight: `${heroHeight}px`, backgroundColor: overlayEnabled ? overlayColor : 'var(--cms-secondary, #1A103D)' }}
      role="region"
      aria-label="Hero"
    >
      {/* Slides */}
      {allSlides.map((slide, i) => (
        <div
          key={slide.id || i}
          inert={i !== current}
          aria-hidden={i !== current}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <SlideMedia slide={slide} />
        </div>
      ))}

      {/* Overlay — skip for external video so controls are clickable */}
      {overlayEnabled && currentSlide.mediaType !== 'externalVideo' && (
        <div className="absolute inset-0 z-[1]" style={{ backgroundColor: overlayColor, opacity: overlayOpacity }} />
      )}

      {/* Text — pointer-events-none for video slides so YouTube controls work */}
      <div
        className="relative z-10 px-6 py-16 w-full max-w-4xl mx-auto"
        style={{ pointerEvents: currentSlide.mediaType === 'externalVideo' ? 'none' : undefined }}
      >
        <SlideContent slide={currentSlide} align={align} />
      </div>

      {showArrows && <CarouselArrows prev={prev} next={next} />}
      {showDots && <CarouselDots total={allSlides.length} current={current} setCurrent={setCurrent} />}
    </section>
  )
}

// ── Carousel navigation ──
function CarouselArrows({ prev, next }: { prev: () => void; next: () => void }) {
  return (
    <>
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>
    </>
  )
}

function CarouselDots({
  total,
  current,
  setCurrent,
}: {
  total: number
  current: number
  setCurrent: (i: number) => void
}) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => setCurrent(i)}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            i === current ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/70'
          }`}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  )
}
