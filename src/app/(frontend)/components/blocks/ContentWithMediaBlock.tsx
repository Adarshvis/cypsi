import React from 'react'
import Image from 'next/image'
import RichText from '../ui/RichText'
import type { Media as MediaType } from '@/payload-types'
import SectionHeading from '../ui/SectionHeading'

interface ContentWithMediaBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  content: any
  media: MediaType | string
  mediaPosition?: 'left' | 'right' | null
}

export default function ContentWithMediaBlock({ sectionHeading, sectionDescription, headingAlignment, content, media, mediaPosition = 'right' }: ContentWithMediaBlockProps) {
  const mediaUrl = typeof media === 'object' && media?.url ? media.url : null
  const isLeft = mediaPosition === 'left'

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
        <div className={`flex flex-col ${isLeft ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}>
          <div className="flex-1">
            <div className="prose prose-invert prose-lg max-w-none">
              <RichText data={content} />
            </div>
          </div>
          {mediaUrl && (
            <div className="flex-1 relative aspect-video rounded-xl overflow-hidden">
              <Image
                src={mediaUrl}
                alt={typeof media === 'object' ? media.alt : ''}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
