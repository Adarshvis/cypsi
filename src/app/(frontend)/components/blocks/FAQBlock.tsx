'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import RichText from '../ui/RichText'
import SectionHeading from '../ui/SectionHeading'

interface FAQBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  layout?: 'default' | 'duccAccordion' | null
  items: {
    question: string
    answer: any
    id?: string | null
  }[]
}

function FAQItem({ question, answer }: { question: string; answer: any }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-gray-700">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-5 text-left text-white hover:text-blue-400 transition-colors"
      >
        <span className="text-lg font-medium pr-4">{question}</span>
        <ChevronDown className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} size={20} />
      </button>
      {open && (
        <div className="pb-5 prose prose-invert prose-sm max-w-none">
          <RichText data={answer} />
        </div>
      )}
    </div>
  )
}

function DuccFAQItem({ question, answer }: { question: string; answer: any }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="bg-white rounded-xl border px-6 mb-3"
      style={{ borderColor: 'color-mix(in srgb, var(--cms-primary, #4B2E83) 20%, transparent)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-5 text-left font-semibold hover:no-underline transition-colors"
        style={{ color: 'var(--cms-secondary, #1A103D)' }}
      >
        <span className="pr-4">{question}</span>
        <ChevronDown
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          size={20}
          style={{ color: 'var(--cms-primary, #4B2E83)' }}
        />
      </button>
      {open && (
        <div className="pb-5 text-gray-600 leading-relaxed">
          <RichText data={answer} />
        </div>
      )}
    </div>
  )
}

export default function FAQBlock({ sectionHeading, sectionDescription, headingAlignment, layout, items }: FAQBlockProps) {
  /* ── Styled accordion layout ── */
  if (layout === 'duccAccordion') {
    return (
      <section className="py-24 px-6" style={{ background: 'var(--cms-muted-bg, #F8F4FF)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            {sectionDescription && (
              <span
                className="text-xs font-bold tracking-[0.2em] uppercase"
                style={{ color: 'var(--cms-primary, #4B2E83)' }}
              >
                {sectionDescription}
              </span>
            )}
            {sectionHeading && (
              <h2
                className="mt-3 text-4xl font-bold ducc-heading"
                style={{ color: 'var(--cms-secondary, #1A103D)' }}
              >
                {sectionHeading}
              </h2>
            )}
          </div>
          <div>
            {items?.map((item) => (
              <DuccFAQItem
                key={item.id || item.question}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
        <div>
          {items?.map((item) => (
            <FAQItem key={item.id || item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}
