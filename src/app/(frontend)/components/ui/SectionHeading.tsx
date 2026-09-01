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
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{heading}</h2>
      )}
      {description && (
        <p className="text-gray-500 text-lg">{description}</p>
      )}
    </div>
  )
}
