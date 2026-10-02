import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, BookOpen, Users, Linkedin, Twitter, Github, Instagram, Facebook, Youtube, Globe, Mail, ArrowRight } from 'lucide-react'
import type { Media as MediaType } from '@/payload-types'
import SectionHeading from '../ui/SectionHeading'

interface SocialLink {
  platform: string
  url: string
  id?: string
}

interface Member {
  name: string
  slug?: string | null
  role?: string | null
  photo?: MediaType | string | null
  bio?: string | null
  rating?: number | null
  courseCount?: number | null
  studentCount?: string | null
  profileLink?: string | null
  socialLinks?: SocialLink[] | null
  id?: string | null
}

interface TeamGridBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  columns?: '2' | '3' | '4' | '5' | '6' | null
  showStats?: boolean | null
  showSocialLinks?: boolean | null
  members: Member[]
}

const gridClasses: Record<string, string> = {
  '2': 'grid-cols-1 md:grid-cols-2',
  '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  '5': 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
  '6': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
}

const socialIcons: Record<string, React.ComponentType<any>> = {
  linkedin: Linkedin,
  'twitter-x': Twitter,
  github: Github,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  google: Globe,
  globe: Globe,
  envelope: Mail,
}

/** Names read out for the icon-only social links. */
const socialLabels: Record<string, string> = {
  linkedin: 'LinkedIn',
  'twitter-x': 'X',
  github: 'GitHub',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  google: 'Google Scholar',
  globe: 'Website',
  envelope: 'Email',
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.3
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="w-3.5 h-3.5"
          style={{
            color: i < full || (i === full && hasHalf) ? 'var(--cms-accent, #EAB308)' : '#d1d5db',
          }}
          fill={i < full ? 'var(--cms-accent, #EAB308)' : i === full && hasHalf ? 'url(#half)' : 'none'}
        />
      ))}
      <span className="text-xs font-semibold ml-1" style={{ color: 'var(--cms-text, #1A103D)' }}>
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

export default function TeamGridBlock({
  sectionHeading,
  sectionDescription,
  headingAlignment,
  columns = '4',
  showStats = false,
  showSocialLinks = true,
  members,
}: TeamGridBlockProps) {
  const cols = columns || '4'

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
        <div className={`grid gap-6 ${gridClasses[cols]}`}>
          {members?.map((member) => {
            const photoUrl = typeof member.photo === 'object' && member.photo?.url ? member.photo.url : null
            const href =
              member.profileLink ||
              `/team/${member.slug || member.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
            const initials = member.name
              .replace(/^(prof|dr|mr|mrs|ms)\.?\s+/i, '')
              .split(/\s+/)
              .slice(0, 2)
              .map((w) => w[0])
              .join('')
              .toUpperCase()

            return (
              // Capped width so one or two members do not stretch across half the page.
              <article
                key={member.id || member.name}
                className="team-card group mx-auto flex w-full max-w-[260px] flex-col overflow-hidden rounded-2xl border bg-white transition duration-300 hover:-translate-y-1"
                style={{
                  borderColor: 'color-mix(in srgb, var(--cms-primary, #4B2E83) 12%, transparent)',
                  boxShadow: '0 1px 2px rgb(0 0 0 / 0.04), 0 12px 30px -18px rgb(0 0 0 / 0.25)',
                }}
              >
                {/* Photo: portrait frame anchored to the top so faces are never cropped */}
                <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt=""
                      fill
                      sizes="260px"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <span
                      className="ducc-heading absolute inset-0 flex items-center justify-center text-4xl font-bold"
                      style={{
                        background: 'color-mix(in srgb, var(--cms-primary, #4B2E83) 10%, #fff)',
                        color: 'var(--cms-primary, #4B2E83)',
                      }}
                    >
                      {initials}
                    </span>
                  )}
                  {/* Soft fade into the card body */}
                  <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent" />
                </Link>

                <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
                  {member.role && (
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.12em]"
                      style={{ color: 'var(--cms-primary, #4B2E83)' }}
                    >
                      {member.role}
                    </p>
                  )}
                  <h3
                    className="ducc-heading mt-1 text-base font-bold leading-snug"
                    style={{ color: 'var(--cms-secondary, #1A103D)' }}
                  >
                    <Link href={href} className="hover:underline underline-offset-4">
                      {member.name}
                    </Link>
                  </h3>
                  <span
                    aria-hidden
                    className="mt-2 block h-0.5 w-8 rounded-full transition-all duration-300 group-hover:w-12"
                    style={{ background: 'var(--cms-accent, #EAB308)' }}
                  />

                  {/* Bio */}
                  {member.bio && (
                    <p
                      className="mt-2 line-clamp-2 text-[13px] leading-relaxed"
                      style={{ color: 'var(--cms-text, #1A103D)', opacity: 0.7 }}
                    >
                      {member.bio}
                    </p>
                  )}
                  <span className="flex-1" />

                  {/* Stats */}
                  {showStats && (member.rating || member.courseCount || member.studentCount) && (
                    <div className="mt-3 pt-3 border-t flex items-center gap-4 text-xs text-gray-500" style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)' }}>
                      {member.rating != null && member.rating > 0 && (
                        <StarRating rating={member.rating} />
                      )}
                      {member.courseCount != null && member.courseCount > 0 && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" /> {member.courseCount}
                        </span>
                      )}
                      {member.studentCount && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> {member.studentCount}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer: social icons left, profile link right */}
                  <div
                    className="mt-3 flex items-center justify-between gap-2 border-t pt-3"
                    style={{ borderColor: 'color-mix(in srgb, var(--cms-primary, #4B2E83) 10%, transparent)' }}
                  >
                    {showSocialLinks && member.socialLinks && member.socialLinks.length > 0 ? (
                      <ul className="m-0 flex list-none gap-1.5 p-0">
                        {member.socialLinks.map((link, i) => {
                          const Icon = socialIcons[link.platform] || Globe
                          const label = socialLabels[link.platform] || 'Website'
                          return (
                            <li key={link.id || i}>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`${member.name} on ${label}`}
                                title={label}
                                className="team-card__social flex h-7 w-7 items-center justify-center rounded-full"
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </a>
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <span />
                    )}

                    <Link
                      href={href}
                      className="team-card__link inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold"
                    >
                      View Profile
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      <span className="sr-only">: {member.name}</span>
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
