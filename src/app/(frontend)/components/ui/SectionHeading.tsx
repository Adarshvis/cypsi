'use client'

import React from 'react'

interface SectionHeadingProps {
  heading?: string | null
  description?: string | null
  alignment?: 'left' | 'center' | 'right' | null
}

const alignClasses = {
  left: 'text-left',
  center: 'text-center mx-auto',
  right: 'text-right ml-auto',
}

export default function SectionHeading({ heading, description, alignment = 'center' }: SectionHeadingProps) {
  if (!heading && !description) return null
  const align = alignment || 'center'

  return (
    <div className={`mb-12 max-w-3xl ${alignClasses[align]}`}>
      {heading && (
        <h2
          className="ducc-heading text-3xl md:text-4xl font-bold tracking-tight mb-3"
          style={{ color: 'var(--cms-secondary, #111827)' }}
        >
          {heading}
        </h2>
      )}
      {description && (
        <p className="text-lg" style={{ color: 'var(--cms-text, #111827)', opacity: 0.7 }}>
          {description}
        </p>
      )}
    </div>
  )
}
