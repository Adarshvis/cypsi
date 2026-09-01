import React from 'react'
import RichText from '../ui/RichText'
import SectionHeading from '../ui/SectionHeading'

interface RichContentBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  content: any
  maxWidth?: 'narrow' | 'medium' | 'full' | null
}

const widthClasses = {
  narrow: 'max-w-2xl',
  medium: 'max-w-3xl',
  full: 'max-w-full',
}

export default function RichContentBlock({ sectionHeading, sectionDescription, headingAlignment, content, maxWidth = 'medium' }: RichContentBlockProps) {
  return (
    <section className="py-16 px-6">
      <div className={`mx-auto ${widthClasses[maxWidth || 'medium']}`}>
        <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
        <div className="prose prose-lg prose-invert">
          <RichText data={content} />
        </div>
      </div>
    </section>
  )
}
