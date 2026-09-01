import React from 'react'
import FormBuilderEmbed from './FormBuilderEmbed'
import RichText from '../ui/RichText'

interface FormLayoutBlockProps {
  sectionHeading?: string | null
  sectionDescription?: unknown
  headingAlignment?: 'left' | 'center' | 'right' | null
  form?: unknown
  maxWidth?: 'narrow' | 'medium' | 'wide' | 'full' | null
}

const widthClasses: Record<string, string> = {
  narrow: 'max-w-2xl',
  medium: 'max-w-3xl',
  wide: 'max-w-5xl',
  full: 'max-w-full',
}

const alignClasses: Record<string, string> = {
  left: 'text-left',
  center: 'text-center mx-auto',
  right: 'text-right ml-auto',
}

function isLexicalData(value: unknown): value is { root: unknown } {
  return Boolean(value && typeof value === 'object' && 'root' in (value as Record<string, unknown>))
}

export default function FormLayoutBlock({
  sectionHeading,
  sectionDescription,
  headingAlignment,
  form,
  maxWidth = 'medium',
}: FormLayoutBlockProps) {
  if (!form) return null

  const align = headingAlignment || 'center'
  const headingClass = alignClasses[align] || alignClasses.center
  const hasSectionIntro =
    Boolean(sectionHeading) ||
    (typeof sectionDescription === 'string' && sectionDescription.trim().length > 0) ||
    isLexicalData(sectionDescription)

  return (
    <section className="py-16 px-6">
      <div className={`mx-auto ${widthClasses[maxWidth || 'medium'] || 'max-w-3xl'}`}>
        {hasSectionIntro && (
          <div className={`mb-12 max-w-3xl ${headingClass}`}>
            {sectionHeading && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{sectionHeading}</h2>
            )}
            {typeof sectionDescription === 'string' && sectionDescription.trim() ? (
              <p className="text-gray-500 text-lg">{sectionDescription}</p>
            ) : null}
            {isLexicalData(sectionDescription) ? (
              <div className="cms-richtext text-gray-500 text-lg [&_p]:text-gray-500">
                <RichText data={sectionDescription as any} />
              </div>
            ) : null}
          </div>
        )}
        <FormBuilderEmbed form={form} />
      </div>
    </section>
  )
}
