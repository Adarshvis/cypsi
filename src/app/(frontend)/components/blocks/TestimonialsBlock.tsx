import React from 'react'
import Image from 'next/image'
import { Quote } from 'lucide-react'
import type { Media as MediaType } from '@/payload-types'
import SectionHeading from '../ui/SectionHeading'

interface TestimonialsBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  layout?: 'default' | 'duccQuote' | null
  items: {
    quote: string
    name: string
    role?: string | null
    avatar?: MediaType | string | null
    initials?: string | null
    id?: string | null
  }[]
}

export default function TestimonialsBlock({ sectionHeading, sectionDescription, headingAlignment, layout, items }: TestimonialsBlockProps) {
  /* ── Large quote layout ── */
  if (layout === 'duccQuote' && items?.[0]) {
    const item = items[0]
    const avatarUrl = typeof item.avatar === 'object' && item.avatar?.url ? item.avatar.url : null

    return (
      <section
        className="relative py-24 px-6 overflow-hidden"
        style={{ background: 'var(--cms-secondary, #1A103D)' }}
      >
        <div className="absolute inset-0 bg-grid opacity-[0.05] pointer-events-none" />
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--cms-accent, #EAB308)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--cms-primary, #4B2E83)' }}
        />
        <div className="relative max-w-5xl mx-auto text-center">
          <Quote className="w-12 h-12 mx-auto mb-6" style={{ color: 'var(--cms-accent, #EAB308)' }} />
          <p className="text-2xl md:text-3xl text-white leading-[1.45] font-medium ducc-heading">
            &ldquo;{item.quote}&rdquo;
          </p>
          <div className="mt-10 inline-flex items-center gap-4">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={item.name}
                width={56}
                height={56}
                className="rounded-full object-cover"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg"
                style={{
                  background: 'var(--cms-accent, #EAB308)',
                  color: 'var(--cms-secondary, #1A103D)',
                }}
              >
                {item.initials || item.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
            )}
            <div className="text-left">
              <div className="text-white font-semibold">{item.name}</div>
              {item.role && <div className="text-white/60 text-sm">{item.role}</div>}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-6 bg-gray-800/50">
      <div className="max-w-6xl mx-auto">
        <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items?.map((item) => {
            const avatarUrl = typeof item.avatar === 'object' && item.avatar?.url ? item.avatar.url : null
            return (
              <div key={item.id || item.name} className="bg-gray-800 rounded-xl p-6">
                <Quote className="text-blue-400 mb-4" size={24} />
                <p className="text-gray-300 mb-6 italic">&ldquo;{item.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  {avatarUrl && (
                    <Image src={avatarUrl} alt={item.name} width={40} height={40} className="rounded-full object-cover" />
                  )}
                  <div>
                    <div className="text-white font-medium">{item.name}</div>
                    {item.role && <div className="text-gray-400 text-sm">{item.role}</div>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
