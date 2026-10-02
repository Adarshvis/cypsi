'use client'

import React from 'react'
import DynamicIcon from '../ui/DynamicIcon'
import SectionHeading from '../ui/SectionHeading'
import ScrollReveal from '../ui/ScrollReveal'
import { useInView } from '../ui/useInView'
import { useCountUp } from '../ui/useCountUp'

interface StatData {
  label: string
  numericValue: number
  suffix?: string | null
  prefix?: string | null
  icon?: string | null
  iconColor?: string | null
  ringGradientEnd?: string | null
  iconBgColor?: string | null
  description?: string | null
  ringPercentage?: number | null
  id?: string | null
}

interface StatisticsBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  layout?: 'cardGrid' | 'circularRings' | 'interlockingRings' | 'duccStrip' | null
  stats: StatData[]
  backgroundColor?: string | null
  cardBgColor?: string | null
  ribbonBaseColor?: string | null
  ribbonWaveStartColor?: string | null
  ribbonWaveEndColor?: string | null
  enableCountUp?: boolean | null
  enableHoverZoom?: boolean | null
  columns?: '2' | '3' | '4' | null
}

const columnClasses: Record<string, string> = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

/**
 * Horizontal Strip columns, keyed by how many stats there actually are, so a
 * three-stat strip fills the band instead of leaving half a row blank.
 * Written out in full because Tailwind cannot see interpolated class names.
 */
const stripColumnClasses: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
  5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
}

// ── Count-up number display ──
function AnimatedNumber({
  value,
  prefix,
  suffix,
  animate,
}: {
  value: number
  prefix?: string | null
  suffix?: string | null
  animate: boolean
}) {
  const count = useCountUp(value, 2000, animate)
  const display = animate ? count : value

  return (
    <span>
      {prefix || ''}{display.toLocaleString()}{suffix || ''}
    </span>
  )
}

// ── Circular Ring SVG ──
function CircularRing({
  percentage,
  color,
  size = 120,
  strokeWidth = 10,
  animate,
}: {
  percentage: number
  color: string
  size?: number
  strokeWidth?: number
  animate: boolean
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const fillPercent = animate ? percentage : 0
  const offset = circumference - (fillPercent / 100) * circumference

  return (
    // Decorative: the figure itself is shown as text beside the ring.
    <svg width={size} height={size} className="transform -rotate-90" aria-hidden="true">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#E5E7EB"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
    </svg>
  )
}

// ── Card Grid Item ──
function CardGridItem({
  stat,
  cardBgColor,
  hoverZoom,
  animate,
}: {
  stat: StatData
  cardBgColor: string
  hoverZoom: boolean
  animate: boolean
}) {
  const iconColor = stat.iconColor || '#3B82F6'
  const iconBg = stat.iconBgColor || '#EFF6FF'

  return (
    <div
      className={`rounded-xl p-6 text-center transition-all duration-300 shadow-sm border border-gray-100 ${
        hoverZoom ? 'hover:scale-105 hover:shadow-xl' : 'hover:shadow-md'
      }`}
      style={{ backgroundColor: cardBgColor }}
    >
      {stat.icon && (
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: iconBg }}
        >
          <DynamicIcon name={stat.icon} size={28} color={iconColor} />
        </div>
      )}
      <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
        <AnimatedNumber
          value={stat.numericValue}
          prefix={stat.prefix}
          suffix={stat.suffix}
          animate={animate}
        />
      </div>
      <div className="text-gray-600 font-medium text-sm uppercase tracking-wider">
        {stat.label}
      </div>
      {stat.description && (
        <p className="text-gray-400 text-xs mt-2">{stat.description}</p>
      )}
    </div>
  )
}

// ── Circular Ring Item ──
function CircularRingItem({
  stat,
  hoverZoom,
  animate,
}: {
  stat: StatData
  hoverZoom: boolean
  animate: boolean
}) {
  const color = stat.iconColor || '#3B82F6'
  const percentage = stat.ringPercentage ?? 0

  return (
    <div
      className={`flex flex-col items-center transition-all duration-300 ${
        hoverZoom ? 'hover:scale-105' : ''
      }`}
    >
      <div className="relative mb-4">
        <CircularRing percentage={percentage} color={color} animate={animate} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-gray-900">
            <AnimatedNumber
              value={stat.numericValue}
              prefix={stat.prefix}
              suffix={stat.suffix}
              animate={animate}
            />
          </div>
        </div>
      </div>
      {stat.icon && (
        <div className="mb-2">
          <DynamicIcon name={stat.icon} size={22} color={color} />
        </div>
      )}
      <div className="text-gray-800 font-semibold text-sm text-center">{stat.label}</div>
      {stat.description && (
        <p className="text-gray-400 text-xs text-center mt-1">{stat.description}</p>
      )}
    </div>
  )
}

// ── Interlocking Rings (Edupoint ribbon weave) ──
// SVG paths extracted from the Edupoint rings-ribbon.svg
const RIBBON_PATH =
  'M968.77,139.57a102.46,102.46,0,0,1-204.91,0h-.11a139.68,139.68,0,0,0-279.35,0h0a102.46,102.46,0,0,1-204.92,0h-.11A139.71,139.71,0,0,0,11,85.3,139,139,0,0,0,0,139.57H37.22a102.46,102.46,0,0,1,204.92,0h.1a139.68,139.68,0,0,0,279.35,0h0a102.46,102.46,0,0,1,204.91,0h.11a139.68,139.68,0,0,0,279.35,0Z'

const WEAVE_CLIP_PATH =
  'M811.94,11a139.56,139.56,0,0,0-85.3,128.59h-.11a102.46,102.46,0,0,1-204.91,0h0a139.68,139.68,0,0,0-279.35,0h-.1a102.46,102.46,0,0,1-204.92,0H0a139.71,139.71,0,0,0,268.37,54.26,138.61,138.61,0,0,0,11-54.26h.11a102.46,102.46,0,0,1,204.91,0h0a139.68,139.68,0,0,0,279.35,0h.11a102.46,102.46,0,0,1,204.91,0H1006A139.75,139.75,0,0,0,811.94,11'

// 4 loop centres as % of viewBox (1008.18 wide, 281.16 tall)
const RING_CENTERS = [
  { xPct: 13.85 },
  { xPct: 37.95 },
  { xPct: 61.95 },
  { xPct: 86.0 },
]

function RibbonSVG({ uid, baseColor, stops }: { uid: string; baseColor: string; stops: { offset: number; color: string }[] }) {
  return (
    <svg
      viewBox="0 0 1008.18 281.16"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
          {stops.map((s, i) => (
            <stop key={i} offset={`${s.offset}%`} stopColor={s.color} />
          ))}
        </linearGradient>
        <clipPath id={`${uid}-weave`} transform="translate(1.09 1.01)">
          <path d={WEAVE_CLIP_PATH} />
        </clipPath>
        <clipPath id={`${uid}-bounds`} transform="translate(1.09 1.01)">
          <rect x="-1.09" y="-1.01" width="1008.18" height="281.16" />
        </clipPath>
      </defs>
      <path d={RIBBON_PATH} fill={baseColor} transform="translate(1.09 1.01)" />
      <g clipPath={`url(#${uid}-weave)`}>
        <g clipPath={`url(#${uid}-bounds)`}>
          <rect x="0" y="0" width="1008.18" height="281.16" fill={`url(#${uid}-grad)`} />
        </g>
      </g>
    </svg>
  )
}

function InterlockingRingsLayout({
  stats,
  animate,
  hoverZoom,
  ribbonBaseColor,
  ribbonWaveStartColor,
  ribbonWaveEndColor,
}: {
  stats: StatData[]
  animate: boolean
  hoverZoom: boolean
  ribbonBaseColor: string
  ribbonWaveStartColor: string
  ribbonWaveEndColor: string
}) {
  const uid = React.useId()
  const displayStats = stats.slice(0, 4)

  const stops: { offset: number; color: string }[] = [
    { offset: 0, color: ribbonWaveStartColor },
    { offset: 100, color: ribbonWaveEndColor },
  ]

  // Shared stat overlay renderer
  const renderStat = (stat: StatData, i: number, color: string) => (
    <>
      {stat.icon && (
        <div className="mb-0.5">
          <DynamicIcon name={stat.icon} size={18} color="#fff" />
        </div>
      )}
      <div className="text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight">
        <AnimatedNumber
          value={stat.numericValue}
          prefix={stat.prefix}
          suffix={stat.suffix}
          animate={animate}
        />
      </div>
    </>
  )

  return (
    <>
      {/* ── MOBILE: Same ribbon rotated 90° vertical ── */}
      <div className="md:hidden flex justify-center overflow-hidden">
        {/*
          Original SVG: 1008.18 × 281.16 (ratio 3.586:1).
          On mobile we want the ribbon vertical inside a ~180px wide column.
          Rotated SVG: width → height, height → width.
          Container: 180px wide, 180 × 3.586 = ~645px tall.
        */}
        <div
          className="relative"
          style={{ width: '180px', height: '645px' }}
        >
          {/* Rotated SVG – centered, rotated 90° CW */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: '645px',
              height: '180px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%) rotate(90deg)',
              transformOrigin: 'center center',
            }}
          >
            <RibbonSVG uid={`${uid}-m`} baseColor={ribbonBaseColor} stops={stops} />
          </div>

          {/* Stat overlays – mapped from horizontal xPct to vertical yPct */}
          {displayStats.map((stat, i) => {
            const pos = RING_CENTERS[i]
            if (!pos) return null
            const color = stat.iconColor || '#3B82F6'

            return (
              <div
                key={stat.id || i}
                className={`absolute flex flex-col items-center justify-center z-10 transition-all duration-300 ${
                  hoverZoom ? 'hover:scale-110' : ''
                }`}
                style={{
                  left: '50%',
                  top: `${pos.xPct}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg border-[3px] border-white/90"
                  style={{ backgroundColor: color }}
                >
                  {stat.icon && (
                    <div className="mb-0.5">
                      <DynamicIcon name={stat.icon} size={14} color="#fff" />
                    </div>
                  )}
                  <div className="text-[0.575rem] font-bold text-white leading-tight">
                    <AnimatedNumber
                      value={stat.numericValue}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      animate={animate}
                    />
                  </div>
                </div>
                <div className="mt-1 text-[9px] font-semibold text-gray-700 text-center max-w-[90px]">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── DESKTOP: Horizontal ribbon weave ── */}
      <div className="hidden md:block relative w-full overflow-hidden">
        <RibbonSVG uid={`${uid}-d`} baseColor={ribbonBaseColor} stops={stops} />

        {/* Stat overlays at ring centres */}
        <div className="absolute inset-0">
          {displayStats.map((stat, i) => {
            const pos = RING_CENTERS[i]
            if (!pos) return null
            const color = stat.iconColor || '#3B82F6'

            return (
              <div
                key={stat.id || i}
                className={`absolute flex flex-col items-center justify-center transition-all duration-300 ${
                  hoverZoom ? 'hover:scale-110' : ''
                }`}
                style={{
                  left: `${pos.xPct}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className="w-28 h-28 lg:w-32 lg:h-32 rounded-full flex flex-col items-center justify-center shadow-lg border-4 border-white/90"
                  style={{ backgroundColor: color }}
                >
                  {renderStat(stat, i, color)}
                </div>
                <div className="mt-2 text-xs lg:text-sm font-semibold text-gray-700 text-center max-w-[130px]">
                  {stat.label}
                </div>
                {stat.description && (
                  <p className="text-gray-400 text-[11px] text-center mt-0.5 max-w-[110px]">
                    {stat.description}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ── Main Block ──
export default function StatisticsBlock(props: StatisticsBlockProps) {
  const {
    sectionHeading,
    sectionDescription,
    headingAlignment,
    layout = 'cardGrid',
    stats,
    backgroundColor = '#FFFFFF',
    cardBgColor = '#FFFFFF',
    ribbonBaseColor = '#e3e4e4',
    ribbonWaveStartColor = '#3B82F6',
    ribbonWaveEndColor = '#FF4500',
    enableCountUp = true,
    enableHoverZoom = true,
    columns = '4',
  } = props

  const { ref, inView } = useInView(0.15)

  if (!stats || stats.length === 0) return null

  /* ── Horizontal stats strip layout ── */
  if (layout === 'duccStrip') {
    return (
      <section
        ref={ref}
        className="relative overflow-hidden py-12 md:py-14 px-6"
        style={{ background: 'var(--cms-secondary, #1A103D)' }}
      >
        {/* Soft glow in the primary colour so the band isn't a flat slab */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 120% at 15% 0%, color-mix(in srgb, var(--cms-primary, #4B2E83) 45%, transparent), transparent 70%), radial-gradient(ellipse 50% 100% at 90% 100%, color-mix(in srgb, var(--cms-primary, #4B2E83) 30%, transparent), transparent 70%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto">
          {/* The strip was built for six stats; with fewer, a fixed 6-column
              grid leaves the row half empty. Track count instead. */}
          <div
            className={`grid gap-y-10 lg:divide-x lg:divide-white/10 ${
              stripColumnClasses[Math.min(stats.length, 6)] || stripColumnClasses[6]
            }`}
          >
            {stats.map((stat, i) => (
              <div key={stat.id || i} className="px-4 text-center">
                {stat.icon && (
                  <DynamicIcon
                    name={stat.icon}
                    size={26}
                    className="mx-auto mb-4"
                    color="var(--cms-accent, #EAB308)"
                  />
                )}
                <div className="ducc-heading text-4xl md:text-5xl font-bold text-white tabular-nums">
                  <AnimatedNumber
                    value={stat.numericValue}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    animate={enableCountUp !== false && inView}
                  />
                </div>
                <span
                  aria-hidden
                  className="mx-auto mt-4 block h-0.5 w-10 rounded-full"
                  style={{ background: 'var(--cms-accent, #EAB308)' }}
                />
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70 mt-4">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const style = layout || 'cardGrid'
  const cols = columns || '4'
  const animate = enableCountUp !== false && inView
  const hoverZoom = enableHoverZoom !== false

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

        {style === 'interlockingRings' ? (
          <InterlockingRingsLayout
            stats={stats}
            animate={animate}
            hoverZoom={hoverZoom}
            ribbonBaseColor={ribbonBaseColor || '#e3e4e4'}
            ribbonWaveStartColor={ribbonWaveStartColor || '#3B82F6'}
            ribbonWaveEndColor={ribbonWaveEndColor || '#FF4500'}
          />
        ) : (
          <div className={`grid ${columnClasses[cols]} gap-6`}>
            {stats.map((stat, i) => (
              <ScrollReveal key={stat.id || i} delay={i * 100}>
                {style === 'circularRings' ? (
                  <CircularRingItem stat={stat} hoverZoom={hoverZoom} animate={animate} />
                ) : (
                  <CardGridItem
                    stat={stat}
                    cardBgColor={cardBgColor || '#FFFFFF'}
                    hoverZoom={hoverZoom}
                    animate={animate}
                  />
                )}
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
