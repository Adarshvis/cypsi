'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Mail, Phone, MapPin, ArrowLeft, ExternalLink, BookOpen, GraduationCap,
  Briefcase, Award, FileText, Microscope, Linkedin, Twitter, Github,
  Instagram, Facebook, Youtube, Globe,
} from 'lucide-react'

interface Member {
  name: string
  slug?: string
  role?: string
  photo?: { url?: string; alt?: string } | null
  bio?: string
  biography?: string
  email?: string
  phone?: string
  office?: string
  rating?: number
  courseCount?: number
  studentCount?: string
  profileLink?: string
  researchInterests?: { interest: string }[]
  education?: { degree: string; institution: string; year?: string }[]
  experience?: { position: string; organization: string; duration?: string; expDescription?: string }[]
  awards?: { title: string; year?: string; organization?: string }[]
  courses?: { courseName: string; courseCode?: string; semester?: string; courseDescription?: string }[]
  publications?: { title: string; journal?: string; year?: string; link?: string }[]
  socialLinks?: { platform: string; url: string }[]
  academicLinks?: { platform: string; url: string }[]
}

const socialIcons: Record<string, React.ComponentType<any>> = {
  linkedin: Linkedin, 'twitter-x': Twitter, github: Github, instagram: Instagram,
  facebook: Facebook, youtube: Youtube, google: Globe, globe: Globe, envelope: Mail,
}

const academicLabels: Record<string, string> = {
  'google-scholar': 'Google Scholar', researchgate: 'ResearchGate', orcid: 'ORCID',
  academia: 'Academia.edu', scopus: 'Scopus', wos: 'Web of Science', other: 'Link',
}

export default function ProfileClient({ member }: { member: Member }) {
  const photoUrl = typeof member.photo === 'object' && member.photo?.url ? member.photo.url : null

  const tabs = [
    { id: 'about', label: 'About', icon: BookOpen, show: !!(member.biography || member.bio) },
    { id: 'education', label: 'Education', icon: GraduationCap, show: !!(member.education?.length) },
    { id: 'experience', label: 'Experience', icon: Briefcase, show: !!(member.experience?.length || member.awards?.length) },
    { id: 'research', label: 'Research', icon: Microscope, show: !!(member.researchInterests?.length) },
    { id: 'courses', label: 'Courses', icon: BookOpen, show: !!(member.courses?.length) },
    { id: 'publications', label: 'Publications', icon: FileText, show: !!(member.publications?.length) },
  ].filter((t) => t.show)

  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'about')

  return (
    <div className="cms-page-shell">
      {/* Back link */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <Link href="/team" className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all" style={{ color: 'var(--cms-primary, #4B2E83)' }}>
          <ArrowLeft className="w-4 h-4" /> Back to Team
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-[320px_1fr] gap-10">
        {/* ── Left Sidebar ── */}
        <aside className="lg:sticky lg:top-[120px] lg:self-start">
          <div className="bg-white rounded-2xl border p-6 text-center" style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)' }}>
            {photoUrl && (
              <div className="w-[180px] h-[180px] rounded-full overflow-hidden mx-auto mb-5 border-4" style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)' }}>
                <Image src={photoUrl} alt={member.name} width={180} height={180} className="object-cover w-full h-full" />
              </div>
            )}
            <h1 className="text-xl font-bold ducc-heading" style={{ color: 'var(--cms-secondary, #1A103D)' }}>{member.name}</h1>
            {member.role && <p className="text-sm mt-1" style={{ color: 'var(--cms-primary, #4B2E83)' }}>{member.role}</p>}
            {member.bio && <p className="text-xs text-gray-500 mt-3">{member.bio}</p>}

            {/* Contact */}
            {(member.email || member.phone || member.office) && (
              <div className="mt-5 pt-5 border-t text-left space-y-3" style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)' }}>
                {member.email && (
                  <a href={`mailto:${member.email}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-[--cms-primary]">
                    <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--cms-primary, #4B2E83)' }} /> {member.email}
                  </a>
                )}
                {member.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone className="w-4 h-4 shrink-0" style={{ color: 'var(--cms-primary, #4B2E83)' }} /> {member.phone}
                  </div>
                )}
                {member.office && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 shrink-0" style={{ color: 'var(--cms-primary, #4B2E83)' }} /> {member.office}
                  </div>
                )}
              </div>
            )}

            {/* Social Links */}
            {member.socialLinks && member.socialLinks.length > 0 && (
              <div className="mt-5 pt-5 border-t flex justify-center gap-2" style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)' }}>
                {member.socialLinks.map((link, i) => {
                  const Icon = socialIcons[link.platform] || Globe
                  return (
                    <a key={i} href={link.url} target="_blank" rel="noreferrer"
                      className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors hover:text-white"
                      style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)', color: 'var(--cms-primary, #4B2E83)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--cms-primary, #4B2E83)'; e.currentTarget.style.color = '#fff' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--cms-primary, #4B2E83)' }}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  )
                })}
              </div>
            )}

            {/* Academic Links */}
            {member.academicLinks && member.academicLinks.length > 0 && (
              <div className="mt-4 space-y-2">
                {member.academicLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border transition hover:bg-[--cms-muted-bg]"
                    style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)', color: 'var(--cms-primary, #4B2E83)' }}
                  >
                    <ExternalLink className="w-3 h-3" /> {academicLabels[link.platform] || link.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ── Right Content (Tabs) ── */}
        <main>
          {/* Tab Navigation */}
          {tabs.length > 0 && (
            <div className="flex gap-2 mb-8 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full transition border"
                  style={
                    activeTab === tab.id
                      ? { background: 'var(--cms-primary, #4B2E83)', borderColor: 'var(--cms-primary, #4B2E83)', color: '#fff' }
                      : { background: '#fff', borderColor: 'var(--cms-muted-bg, #F8F4FF)', color: 'var(--cms-text, #1A103D)' }
                  }
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Tab Content */}
          <div className="bg-white rounded-2xl border p-8" style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)' }}>
            {/* About */}
            {activeTab === 'about' && (
              <div>
                <h2 className="text-2xl font-bold ducc-heading mb-4" style={{ color: 'var(--cms-secondary, #1A103D)' }}>About</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{member.biography || member.bio}</p>
              </div>
            )}

            {/* Education */}
            {activeTab === 'education' && member.education && (
              <div>
                <h2 className="text-2xl font-bold ducc-heading mb-6" style={{ color: 'var(--cms-secondary, #1A103D)' }}>Education</h2>
                <div className="space-y-6">
                  {member.education.map((edu, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-3 h-3 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--cms-primary, #4B2E83)' }} />
                      <div>
                        <div className="font-semibold" style={{ color: 'var(--cms-secondary, #1A103D)' }}>{edu.degree}</div>
                        <div className="text-sm text-gray-600">{edu.institution}</div>
                        {edu.year && <div className="text-xs text-gray-400 mt-0.5">{edu.year}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience + Awards */}
            {activeTab === 'experience' && (
              <div>
                {member.experience && member.experience.length > 0 && (
                  <>
                    <h2 className="text-2xl font-bold ducc-heading mb-6" style={{ color: 'var(--cms-secondary, #1A103D)' }}>Experience</h2>
                    <div className="space-y-6 mb-10">
                      {member.experience.map((exp, i) => (
                        <div key={i} className="border-l-2 pl-5" style={{ borderColor: 'var(--cms-primary, #4B2E83)' }}>
                          <div className="font-semibold" style={{ color: 'var(--cms-secondary, #1A103D)' }}>{exp.position}</div>
                          <div className="text-sm text-gray-600">{exp.organization}</div>
                          {exp.duration && <div className="text-xs text-gray-400 mt-0.5">{exp.duration}</div>}
                          {exp.expDescription && <p className="text-sm text-gray-500 mt-2">{exp.expDescription}</p>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {member.awards && member.awards.length > 0 && (
                  <>
                    <h2 className="text-xl font-bold ducc-heading mb-4" style={{ color: 'var(--cms-secondary, #1A103D)' }}>Awards & Honors</h2>
                    <div className="space-y-3">
                      {member.awards.map((award, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Award className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--cms-accent, #EAB308)' }} />
                          <div>
                            <div className="font-medium" style={{ color: 'var(--cms-secondary, #1A103D)' }}>{award.title}</div>
                            <div className="text-xs text-gray-400">{[award.organization, award.year].filter(Boolean).join(' · ')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Research */}
            {activeTab === 'research' && member.researchInterests && (
              <div>
                <h2 className="text-2xl font-bold ducc-heading mb-6" style={{ color: 'var(--cms-secondary, #1A103D)' }}>Research Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {member.researchInterests.map((r, i) => (
                    <span key={i} className="text-sm px-4 py-2 rounded-full" style={{ background: 'var(--cms-muted-bg, #F8F4FF)', color: 'var(--cms-text, #1A103D)' }}>
                      {r.interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Courses */}
            {activeTab === 'courses' && member.courses && (
              <div>
                <h2 className="text-2xl font-bold ducc-heading mb-6" style={{ color: 'var(--cms-secondary, #1A103D)' }}>Courses</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {member.courses.map((course, i) => (
                    <div key={i} className="border rounded-xl p-5" style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)' }}>
                      <div className="font-semibold" style={{ color: 'var(--cms-secondary, #1A103D)' }}>{course.courseName}</div>
                      {course.courseCode && <div className="text-xs text-gray-400 mt-0.5">{course.courseCode}{course.semester ? ` · ${course.semester}` : ''}</div>}
                      {course.courseDescription && <p className="text-sm text-gray-500 mt-2">{course.courseDescription}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Publications */}
            {activeTab === 'publications' && member.publications && (
              <div>
                <h2 className="text-2xl font-bold ducc-heading mb-6" style={{ color: 'var(--cms-secondary, #1A103D)' }}>Publications</h2>
                <div className="space-y-4">
                  {member.publications.map((pub, i) => (
                    <div key={i} className="border-b pb-4" style={{ borderColor: 'var(--cms-muted-bg, #F8F4FF)' }}>
                      {pub.link ? (
                        <a href={pub.link} target="_blank" rel="noreferrer" className="font-medium hover:underline" style={{ color: 'var(--cms-primary, #4B2E83)' }}>{pub.title}</a>
                      ) : (
                        <div className="font-medium" style={{ color: 'var(--cms-secondary, #1A103D)' }}>{pub.title}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-0.5">{[pub.journal, pub.year].filter(Boolean).join(' · ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
