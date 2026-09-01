import React from 'react'
import SectionHeading from '../ui/SectionHeading'

interface EmbedBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  embedType: 'html' | 'iframe'
  html?: string | null
  iframeUrl?: string | null
  width?: 'contained' | 'wide' | 'full' | 'fullBleed' | null
  height?: number | null
}

const widthClasses: Record<string, string> = {
  contained: 'max-w-4xl',
  wide: 'max-w-6xl',
  full: 'max-w-7xl',
  fullBleed: 'max-w-none',
}

export default function EmbedBlock({
  sectionHeading,
  sectionDescription,
  headingAlignment,
  embedType,
  html,
  iframeUrl,
  width = 'full',
  height,
}: EmbedBlockProps) {
  const w = width || 'full'
  const isFullBleed = w === 'fullBleed'
  const container = `${widthClasses[w] || widthClasses.full} mx-auto`

  if (embedType === 'html' && html) {
    return (
      <section className={`py-8 ${isFullBleed ? '' : 'px-6'}`}>
        <div className={container}>
          <SectionHeading
            heading={sectionHeading}
            description={sectionDescription}
            alignment={headingAlignment}
          />
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </section>
    )
  }

  if (embedType === 'iframe' && iframeUrl) {
    return (
      <section className={`py-8 ${isFullBleed ? '' : 'px-6'}`}>
        <div className={container}>
          {/* Heading keeps its side padding even when the frame goes edge to edge */}
          <div className={isFullBleed ? 'px-6' : undefined}>
            <SectionHeading
              heading={sectionHeading}
              description={sectionDescription}
              alignment={headingAlignment}
            />
          </div>

          {/* No explicit height means a responsive 16:9 frame, which is what
              video needs — a fixed pixel height letterboxes as the container grows. */}
          <div
            className={`relative w-full overflow-hidden ${isFullBleed ? '' : 'rounded-lg'}`}
            style={height ? { height } : { aspectRatio: '16 / 9' }}
          >
            <iframe
              src={iframeUrl}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    )
  }

  return null
}
