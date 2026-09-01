import React from 'react'
import Image from 'next/image'
import { Linkedin, Instagram, Youtube, Facebook, Twitter } from 'lucide-react'

interface FooterData {
  columns?: {
    heading?: string | null
    links?: {
      label: string
      url: string
      newTab?: boolean | null
      id?: string | null
    }[] | null
    id?: string | null
  }[] | null
  copyrightText?: string | null
  showSocialLinks?: boolean | null
  lastUpdated?: {
    enabled?: boolean | null
    label?: string | null
    date?: string | null
  } | null
  visitorCount?: {
    enabled?: boolean | null
    label?: string | null
    count?: number | null
  } | null
  logos?: {
    leftLogo?: any
    rightLogo?: any
  } | null
  contactInfo?: {
    address?: string | null
    email?: string | null
    phone?: string | null
  } | null
}

interface SiteSettingsData {
  /** Used for the copyright line when the footer sets no custom text. */
  siteName?: string | null
  socialLinks?: {
    platform: string
    url: string
    id?: string | null
  }[] | null
}

interface FooterProps {
  data: FooterData
  siteSettings: SiteSettingsData
}

const socialIcons: Record<string, React.ComponentType<any>> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
}

const socialLabels: Record<string, string> = {
  facebook: 'Facebook',
  twitter: 'Twitter',
  instagram: 'Instagram',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default function Footer({ data, siteSettings }: FooterProps) {
  const leftLogo = typeof data.logos?.leftLogo === 'object' && data.logos?.leftLogo?.url
    ? data.logos.leftLogo : null
  const rightLogo = typeof data.logos?.rightLogo === 'object' && data.logos?.rightLogo?.url
    ? data.logos.rightLogo : null
  const hasLogos = leftLogo || rightLogo
  const hasContact = data.contactInfo?.address || data.contactInfo?.email || data.contactInfo?.phone
  const hasSocial = data.showSocialLinks && siteSettings?.socialLinks && siteSettings.socialLinks.length > 0

  return (
    <footer style={{ backgroundColor: 'var(--cms-secondary, #1A103D)' }}>


      {/* ── Main Footer Body ── */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div className="footer-columns" style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Nav columns grouped together */}
          {data.columns && data.columns.length > 0 && (
            <div style={{ display: 'flex', gap: '2.5rem', flex: '2 1 auto', flexWrap: 'wrap' }}>
              {data.columns.map((col) => (
                <div key={col.id || col.heading} className="footer-col" style={{ flex: '1 1 140px' }}>
                  {col.heading && (
                    <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', borderBottom: '2px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem' }}>
                      {col.heading}
                    </h3>
                  )}
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {col.links?.map((link) => (
                      <li key={link.id || link.label}>
                        <a
                          href={link.url}
                          target={link.newTab ? '_blank' : undefined}
                          rel={link.newTab ? 'noopener noreferrer' : undefined}
                          style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.875rem', lineHeight: '1.6' }}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Contact Us */}
          {hasContact && (
            <div className="footer-col" style={{ flex: '1 1 180px' }}>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', borderBottom: '2px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem' }}>
                Contact Us
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)' }}>
                {data.contactInfo?.address && (
                  <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{data.contactInfo.address}</p>
                )}
                {data.contactInfo?.email && (
                  <p style={{ margin: 0 }}>
                    Email:{' '}
                    <a href={`mailto:${data.contactInfo.email}`} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
                      {data.contactInfo.email}
                    </a>
                  </p>
                )}
                {data.contactInfo?.phone && (
                  <p style={{ margin: 0 }}>
                    Phone:{' '}
                    <a href={`tel:${data.contactInfo.phone}`} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
                      {data.contactInfo.phone}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Social Media */}
          {hasSocial && (
            <div className="footer-col" style={{ flex: '0 1 140px' }}>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', borderBottom: '2px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem' }}>
                Social Media
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {siteSettings.socialLinks!.map((social) => {
                  const Icon = socialIcons[social.platform]
                  const label = socialLabels[social.platform] || social.platform
                  return (
                    <li key={social.id || social.platform}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        {Icon && <Icon size={14} />}
                        {label}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Logos — always last, pinned to the right on desktop, centered on mobile */}
          {hasLogos && (
            <div className="flex-shrink-0 flex flex-col gap-3 mt-4 md:mt-0 md:ml-auto items-center md:items-end w-full md:w-auto">
              {leftLogo && (
                <div style={{ background: '#fff', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image
                    src={leftLogo.url}
                    alt={leftLogo.alt || 'Logo'}
                    width={120}
                    height={50}
                    style={{ height: '50px', width: 'auto', maxWidth: '120px', objectFit: 'contain' }}
                  />
                </div>
              )}
              {rightLogo && (
                <div style={{ background: '#fff', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image
                    src={rightLogo.url}
                    alt={rightLogo.alt || 'Logo'}
                    width={120}
                    height={50}
                    style={{ height: '50px', width: 'auto', maxWidth: '120px', objectFit: 'contain' }}
                  />
                </div>
              )}
            </div>
          )}
        </div>


        {/* ── Bottom Bar ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '2rem', paddingTop: '1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
          <span>
            {/* Falls back to the configured site name, so the copyright line
                never names a different organisation. */}
            {data.copyrightText ||
              [`© ${new Date().getFullYear()}`, siteSettings?.siteName].filter(Boolean).join(' ')}
          </span>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {data.lastUpdated?.enabled && (
              <span>
                {data.lastUpdated.label || 'Last Updated'}:{' '}
                {data.lastUpdated.date ? formatDate(data.lastUpdated.date) : formatDate(new Date().toISOString())}
              </span>
            )}
            {data.visitorCount?.enabled && (
              <span>
                {data.visitorCount.label || 'Total Visitors'}:{' '}
                <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{(data.visitorCount.count || 0).toLocaleString()}</strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
