import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Media as MediaType } from '@/payload-types'
import SectionHeading from '../ui/SectionHeading'

interface CallToActionBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  layout?: 'default' | 'duccBanner' | null
  heading: string
  description?: string | null
  buttons?: { label: string; url: string; variant?: 'primary' | 'secondary' | 'outline' | null; id?: string | null }[] | null
  backgroundType?: 'color' | 'image' | null
  backgroundColor?: string | null
  backgroundImage?: MediaType | string | null
}

const buttonVariants = {
  primary: 'bg-white text-gray-900 hover:bg-gray-100',
  secondary: 'bg-purple-600 text-white hover:bg-purple-700',
  outline: 'border-2 border-white text-white hover:bg-white hover:text-gray-900',
}

export default function CallToActionBlock({ sectionHeading, sectionDescription, headingAlignment, layout, heading, description, buttons, backgroundType = 'color', backgroundColor, backgroundImage }: CallToActionBlockProps) {
  /* ── Full-width gradient banner layout ── */
  if (layout === 'duccBanner') {
    const primaryBtn = buttons?.[0]
    const secondaryBtn = buttons?.[1]

    return (
      <section className="py-20 px-6" style={{ background: 'var(--cms-muted-bg, #F8F4FF)' }}>
        <div
          className="max-w-6xl mx-auto rounded-3xl overflow-hidden relative"
          style={{
            background: `linear-gradient(135deg, var(--cms-primary, #4B2E83) 0%, var(--cms-secondary, #1A103D) 100%)`,
          }}
        >
          <div className="absolute inset-0 bg-grid opacity-[0.08]" />
          <div className="relative p-10 md:p-14 grid md:grid-cols-[1.4fr_1fr] gap-10 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight ducc-heading">
                {heading}
              </h3>
              {description && (
                <p className="mt-4 text-white/70 text-lg">{description}</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col gap-3">
              {primaryBtn && (
                <Link
                  href={primaryBtn.url}
                  className="btn-shine inline-flex items-center justify-center gap-2 text-sm font-semibold px-7 py-4 rounded-md transition hover:brightness-110"
                  style={{
                    background: 'var(--cms-accent, #EAB308)',
                    color: 'var(--cms-secondary, #1A103D)',
                  }}
                >
                  {primaryBtn.label} <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              {secondaryBtn && (
                <a
                  href={secondaryBtn.url}
                  className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-7 py-4 rounded-md text-white border border-white/30 hover:bg-white/10 transition"
                >
                  {secondaryBtn.label}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const bg = typeof backgroundImage === 'object' && backgroundImage?.url ? backgroundImage.url : null

  return (
    <section
      className="relative py-20 px-6"
      style={backgroundType === 'color' ? { backgroundColor: backgroundColor || '#1E40AF' } : undefined}
    >
      {backgroundType === 'image' && bg && (
        <>
          <Image src={bg} alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </>
      )}
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{heading}</h2>
        {description && <p className="text-gray-200 text-lg mb-8">{description}</p>}
        {buttons && buttons.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4">
            {buttons.map((btn) => (
              <a
                key={btn.id || btn.url}
                href={btn.url}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${buttonVariants[btn.variant || 'primary']}`}
              >
                {btn.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
