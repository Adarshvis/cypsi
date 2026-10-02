import React from 'react'
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react'
import DynamicIcon from '../ui/DynamicIcon'
import SectionHeading from '../ui/SectionHeading'
import FormBuilderEmbed from './FormBuilderEmbed'
import { contactSocialPlatforms } from '@/blocks/ContactSection'
import { embedSrcFromInput, safeHref } from '@/lib/safeEmbedUrl'

interface ContactCard {
  id?: string | null
  icon?: string | null
  heading: string
  text: string
  link?: string | null
}

interface SocialLink {
  id?: string | null
  platform: string
  url: string
}

interface ContactSectionBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  mapEmbed?: string | null
  mapTitle?: string | null
  mapPosition?: 'left' | 'right' | null
  contactCards?: ContactCard[] | null
  formHeading?: string | null
  formDescription?: string | null
  form?: unknown
  socialLinks?: SocialLink[] | null
  backgroundColor?: string | null
}

const PRIMARY = 'var(--cms-primary, #04415f)'
const SECONDARY = 'var(--cms-secondary, #011e2c)'
const TEXT = 'var(--cms-text, #010608)'
const SURFACE = 'var(--cms-surface, #ffffff)'

const socialIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
}

const platformLabel = (value: string) =>
  contactSocialPlatforms.find((p) => p.value === value)?.label || value

function SocialLinks({ links }: { links: SocialLink[] }) {
  const safe = links
    .map((l) => ({ ...l, href: safeHref(l.url) }))
    .filter((l): l is SocialLink & { href: string } => Boolean(l.href && socialIcons[l.platform]))
  if (!safe.length) return null

  return (
    <ul className="flex flex-wrap gap-3 list-none m-0 p-0">
      {safe.map((link, i) => {
        const Icon = socialIcons[link.platform]
        return (
          <li key={link.id || i}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={platformLabel(link.platform)}
              className="contact-social-link flex h-[38px] w-[38px] items-center justify-center rounded-full transition duration-300 hover:-translate-y-[3px]"
            >
              <Icon size={16} />
            </a>
          </li>
        )
      })}
    </ul>
  )
}

function Card({ card }: { card: ContactCard }) {
  const href = safeHref(card.link)
  const text = (
    <p className="m-0 whitespace-pre-line" style={{ fontSize: 14, lineHeight: 1.5, color: TEXT }}>
      {card.text}
    </p>
  )

  return (
    <div
      className="flex items-start gap-[15px] rounded-xl p-5 transition duration-300 hover:-translate-y-[5px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] sm:odd:last:col-span-2"
      style={{ background: SURFACE, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.04)' }}
    >
      <span
        aria-hidden
        className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[10px]"
        style={{ background: `color-mix(in srgb, ${PRIMARY} 10%, transparent)` }}
      >
        <DynamicIcon name={card.icon || 'Info'} size={22} color={PRIMARY} />
      </span>
      <div className="min-w-0 break-words">
        <h3
          className="ducc-heading mb-2"
          style={{ fontSize: 18, fontWeight: 600, color: SECONDARY }}
        >
          {card.heading}
        </h3>
        {href ? (
          <a
            href={href}
            className="hover:underline"
            {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {text}
          </a>
        ) : (
          text
        )}
      </div>
    </div>
  )
}

export default function ContactSectionBlock({
  sectionHeading,
  sectionDescription,
  headingAlignment,
  mapEmbed,
  mapTitle,
  mapPosition,
  contactCards,
  formHeading,
  formDescription,
  form,
  socialLinks,
  backgroundColor,
}: ContactSectionBlockProps) {
  const mapSrc = embedSrcFromInput(mapEmbed)
  const cards = contactCards || []
  const socials = socialLinks || []
  const hasFormCard = Boolean(formHeading || formDescription || form || socials.length)
  const hasContent = cards.length > 0 || hasFormCard

  if (!mapSrc && !hasContent) return null

  const mapRight = mapPosition === 'right'

  return (
    <section
      className="contact-section py-12 lg:py-14 px-6"
      style={{ backgroundColor: backgroundColor || '#f1f5f7' }}
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          heading={sectionHeading}
          description={sectionDescription}
          alignment={headingAlignment}
        />

        <div
          className={`grid grid-cols-1 gap-[30px] ${
            mapSrc && hasContent ? 'lg:grid-cols-[9fr_11fr] lg:min-h-[600px]' : 'max-w-4xl mx-auto'
          }`}
        >
          {mapSrc && (
            <div
              className={`h-[300px] w-full overflow-hidden rounded-2xl lg:h-auto lg:min-h-[400px] ${
                mapRight ? 'lg:order-2' : ''
              }`}
            >
              <iframe
                src={mapSrc}
                title={mapTitle || 'Map'}
                className="block h-full w-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}

          {hasContent && (
            <div className="flex flex-col gap-[30px]">
              {cards.length > 0 && (
                <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2">
                  {cards.map((card, i) => (
                    <Card key={card.id || i} card={card} />
                  ))}
                </div>
              )}

              {hasFormCard && (
                <div
                  className="rounded-2xl px-5 py-[25px] md:p-[30px]"
                  style={{ background: SURFACE, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)' }}
                >
                  {formHeading && (
                    <h3
                      className="ducc-heading relative mb-[15px] pl-[15px] text-[22px] md:text-2xl"
                      style={{ fontWeight: 700, color: SECONDARY }}
                    >
                      <span
                        aria-hidden
                        className="absolute left-0 top-0 h-full w-1 rounded-sm"
                        style={{ background: PRIMARY }}
                      />
                      {formHeading}
                    </h3>
                  )}
                  {formDescription && (
                    <p
                      className="mb-[25px] whitespace-pre-line"
                      style={{ fontSize: 15, lineHeight: 1.6, color: TEXT }}
                    >
                      {formDescription}
                    </p>
                  )}

                  {form ? (
                    <FormBuilderEmbed
                      form={form}
                      variant="contact"
                      hideTitle
                      actionsSlot={socials.length ? <SocialLinks links={socials} /> : undefined}
                    />
                  ) : (
                    <SocialLinks links={socials} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
