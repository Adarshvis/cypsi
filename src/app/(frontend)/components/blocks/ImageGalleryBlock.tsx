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

// Three across jumps straight from one column so tablets don't get a 2 + 1 orphan row.
const gridClasses = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 md:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

const sizes = {
  '2': '(min-width: 640px) 50vw, 100vw',
  '3': '(min-width: 768px) 33vw, 100vw',
  '4': '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw',
}

export default function ImageGalleryBlock({
  sectionHeading,
  sectionDescription,
  headingAlignment,
  columns = '3',
  images,
  backgroundColor,
}: ImageGalleryBlockProps) {
  const cols = columns || '3'

  return (
    <section className="py-12 lg:py-14 px-6" style={{ backgroundColor: backgroundColor || undefined }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
        <div className={`grid gap-6 ${gridClasses[cols]}`}>
          {images?.map((item) => {
            const url = typeof item.image === 'object' && item.image?.url ? item.image.url : null
            if (!url) return null
            const alt = typeof item.image === 'object' ? item.image.alt || item.caption || '' : ''
            return (
              <figure
                key={item.id || url}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
                style={{ boxShadow: '0 12px 32px rgba(0, 0, 0, 0.10)' }}
              >
                <Image
                  src={url}
                  alt={alt}
                  fill
                  sizes={sizes[cols]}
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                {item.caption && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-5 pb-4 pt-16">
                    <span
                      aria-hidden
                      className="mb-2 block h-0.5 w-8 rounded-full transition-all duration-300 group-hover:w-14"
                      style={{ background: 'var(--cms-accent, #f59e0b)' }}
                    />
                    <span className="ducc-heading block text-lg font-semibold text-white">{item.caption}</span>
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
