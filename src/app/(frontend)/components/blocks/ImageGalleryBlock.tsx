import React from 'react'
import Image from 'next/image'
import type { Media as MediaType } from '@/payload-types'
import SectionHeading from '../ui/SectionHeading'

interface ImageGalleryBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  columns?: '2' | '3' | '4' | null
  images: {
    image: MediaType | string
    caption?: string | null
    id?: string | null
  }[]
  backgroundColor?: string | null
}

const gridClasses = {
  '2': 'grid-cols-1 md:grid-cols-2',
  '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
}

export default function ImageGalleryBlock({ sectionHeading, sectionDescription, headingAlignment, columns = '3', images, backgroundColor }: ImageGalleryBlockProps) {
  const cols = columns || '3'

  return (
    <section className="py-16 px-6" style={{ backgroundColor: backgroundColor || undefined }}>
      <div className="max-w-6xl mx-auto">
        <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
        <div className={`grid gap-4 ${gridClasses[cols]}`}>
          {images?.map((item) => {
            const url = typeof item.image === 'object' && item.image?.url ? item.image.url : null
            if (!url) return null
            return (
              <figure key={item.id || url} className="relative aspect-video rounded-lg overflow-hidden group">
                <Image src={url} alt={typeof item.image === 'object' ? item.image.alt : ''} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                {item.caption && (
                  <figcaption className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm px-4 py-2">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
