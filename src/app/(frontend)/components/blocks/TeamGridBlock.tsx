import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, BookOpen, Users, Linkedin, Twitter, Github, Instagram, Facebook, Youtube, Globe, Mail } from 'lucide-react'
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
            const href = member.profileLink || (member.slug ? `/team/${member.slug}` : null)

            return (
              <div
                key={member.id || member.name}
                className="card-hover rounded-2xl overflow-hidden border bg-white flex flex-col"
                style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)' }}
              >
                {/* Photo */}
                {photoUrl && (
                  <div className="relative overflow-hidden" style={{ aspectRatio: '4 / 3' }}>
                    <Image src={photoUrl} alt={member.name} fill className="object-cover" />
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col">
                  {/* Name + Role */}
                  <h3 className="text-base font-bold" style={{ color: 'var(--cms-secondary, #1A103D)' }}>
                    {member.name}
                  </h3>
                  {member.role && (
                    <p className="text-sm mt-0.5" style={{ color: 'var(--cms-primary, #4B2E83)' }}>
                      {member.role}
                    </p>
                  )}

                  {/* Bio */}
                  {member.bio && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 flex-1">{member.bio}</p>
                  )}

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

                  {/* Social Links */}
                  {showSocialLinks && member.socialLinks && member.socialLinks.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {member.socialLinks.map((link, i) => {
                        const Icon = socialIcons[link.platform] || Globe
                        return (
                          <a
                            key={link.id || i}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors hover:text-white"
                            style={{
                              borderColor: 'var(--cms-muted-bg, #F8F4FF)',
                              color: 'var(--cms-primary, #4B2E83)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--cms-primary, #4B2E83)'
                              e.currentTarget.style.color = '#fff'
                              e.currentTarget.style.borderColor = 'var(--cms-primary, #4B2E83)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = ''
                              e.currentTarget.style.color = 'var(--cms-primary, #4B2E83)'
                              e.currentTarget.style.borderColor = 'var(--cms-muted-bg, #F8F4FF)'
                            }}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </a>
                        )
                      })}
                    </div>
                  )}

                  {/* View Profile */}
                  <Link
                    href={href || `/team/${member.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
                    className="btn-shine mt-4 w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white py-2.5 rounded-lg transition hover:brightness-110"
                    style={{ background: 'var(--cms-primary, #4B2E83)' }}
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
