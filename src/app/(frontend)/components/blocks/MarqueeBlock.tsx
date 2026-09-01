'use client'

import React from 'react'
import DynamicIcon from '../ui/DynamicIcon'

interface MarqueeBlockProps {
  items: {
    text: string
    url?: string | null
    icon?: string | null
    badge?: string | null
    id?: string | null
  }[]
  backgroundColor?: string | null
  textColor?: string | null
  speed?: 'slow' | 'normal' | 'fast' | null
  pauseOnHover?: boolean | null
  separator?: string | null
}

const speedDuration = {
  slow: '60s',
  normal: '35s',
  fast: '20s',
}

export default function MarqueeBlock({
  items,
  backgroundColor,
  textColor,
  speed = 'normal',
  pauseOnHover = true,
  separator = '•',
}: MarqueeBlockProps) {
  if (!items || items.length === 0) return null

  const duration = speedDuration[speed || 'normal']
  const sep = separator || '•'

  // Duplicate items for seamless loop
  const rendered = [...items, ...items]

  return (
    <div
      className="overflow-hidden relative"
      style={{ backgroundColor: backgroundColor || '#1E3A5F', color: textColor || '#FFFFFF' }}
    >
      <div
        className={`flex whitespace-nowrap animate-marquee ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}
        style={{ animationDuration: duration }}
      >
        {rendered.map((item, i) => (
          <span key={`${item.id || item.text}-${i}`} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm shrink-0">
            {i > 0 && <span className="opacity-50 mr-2">{sep}</span>}
            {item.icon && <DynamicIcon name={item.icon} size={14} />}
            {item.badge && (
              <span className="bg-white/20 text-xs font-semibold px-2 py-0.5 rounded uppercase">
                {item.badge}
              </span>
            )}
            {item.url ? (
              <a href={item.url} className="hover:underline underline-offset-2">
                {item.text}
              </a>
            ) : (
              <span>{item.text}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
