import React from 'react'
import { Inter, JetBrains_Mono, Playfair_Display, Raleway, Roboto, Montserrat, Poppins, Open_Sans, Lato } from 'next/font/google'
import type { Metadata } from 'next'
import config from '@/payload.config'
import { getPayload } from '@/lib/payload'
import Header from './components/Header'
import Footer from './components/Footer'
import AccessibilityWidget from './components/ui/AccessibilityWidget'
import { getSiteMeta } from '@/lib/siteMeta'
import './styles.css'

export const dynamic = 'force-dynamic'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
  display: 'swap',
})

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  display: 'swap',
})

const allFontVars = [
  inter.variable,
  jetbrainsMono.variable,
  playfair.variable,
  raleway.variable,
  roboto.variable,
  montserrat.variable,
  poppins.variable,
  openSans.variable,
  lato.variable,
].filter(Boolean).join(' ')

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSiteMeta()

  return {
    // Both come from Site Settings. The description previously repeated the site
    // name, which is not a description, and both fell back to a hardcoded
    // organisation name.
    title: meta.siteName,
    description: meta.siteDescription,
    icons: meta.faviconUrl
      ? {
          icon: [{ url: meta.faviconUrl }],
          shortcut: [{ url: meta.faviconUrl }],
          apple: [{ url: meta.faviconUrl }],
        }
      : undefined,
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const payload = await getPayload({ config })

  const headerData = await payload.findGlobal({ slug: 'header' as any, depth: 2 }).catch(() => null)
  const footerData = await payload.findGlobal({ slug: 'footer' as any }).catch(() => null)
  const siteSettings = await payload.findGlobal({ slug: 'site-settings' as any }).catch(() => null)

  const primaryColor = siteSettings?.themeColors?.primaryColor || '#4B2E83'
  const secondaryColor = siteSettings?.themeColors?.secondaryColor || '#1A103D'
  const accentColor = siteSettings?.themeColors?.accentColor || '#EAB308'
  const backgroundColor = siteSettings?.themeColors?.backgroundColor || '#FFFFFF'
  const surfaceColor = siteSettings?.themeColors?.surfaceColor || '#FFFFFF'
  const mutedBackgroundColor = siteSettings?.themeColors?.mutedBackgroundColor || '#F8F4FF'
  const textColor = siteSettings?.themeColors?.textColor || '#1A103D'

  // Accessibility settings. Fallbacks mirror the field defaults, for a Site
  // Settings record saved before these fields existed.
  const a11ySettings = (siteSettings as any)?.accessibility || {}
  const a11y = {
    skipLinkLabel: a11ySettings.skipLinkLabel?.trim() || 'Skip to main content',
    showHeaderLink: a11ySettings.showHeaderLink !== false,
    headerLinkLabel: a11ySettings.headerLinkLabel?.trim() || 'Accessibility options',
    headerLinkUrl: a11ySettings.headerLinkUrl?.trim() || '/help#accessibility',
  }

  // Theme preset — determines layout overrides
  const themePreset = (siteSettings as any)?.themePreset || 'ducc'
  const headingFont = (siteSettings as any)?.headingFont || 'Playfair Display'
  const bodyFont = (siteSettings as any)?.bodyFont || 'Inter'

  // Map font names to next/font CSS variables for optimal loading
  const fontVarMap: Record<string, string> = {
    'Playfair Display': 'var(--font-playfair)',
    'Raleway': 'var(--font-raleway)',
    'Montserrat': 'var(--font-montserrat)',
    'Inter': 'var(--font-inter)',
    'Roboto': 'var(--font-roboto)',
    'Poppins': 'var(--font-poppins)',
    'Open Sans': 'var(--font-open-sans)',
    'Lato': 'var(--font-lato)',
  }

  const headingFontStack = fontVarMap[headingFont]
    ? `${fontVarMap[headingFont]}, serif`
    : `"${headingFont}", serif`

  const bodyFontStack = fontVarMap[bodyFont]
    ? `${fontVarMap[bodyFont]}, sans-serif`
    : `"${bodyFont}", sans-serif`

  const themeStyle = {
    '--cms-primary': primaryColor,
    '--cms-secondary': secondaryColor,
    '--cms-accent': accentColor,
    '--cms-bg': backgroundColor,
    '--cms-surface': surfaceColor,
    '--cms-muted-bg': mutedBackgroundColor,
    '--cms-text': textColor,
    '--cms-theme': themePreset,
    '--font-heading': headingFontStack,
    '--font-body': bodyFontStack,
  } as React.CSSProperties

  return (
    <html lang="en" className={allFontVars}>
      <body className="flex flex-col min-h-screen" style={themeStyle} data-theme={themePreset}>
        {/* First focusable element on every page. Hidden until it receives
            keyboard focus. z-[101] rather than 100: the fixed header is z-100
            and comes later in the DOM, so at equal z-index it would cover this. */}
        <a
          href="#main"
          // Padding is focus-scoped: Tailwind v4's not-sr-only resets padding to 0.
          className="skip-link sr-only rounded-lg bg-maroon text-sm font-semibold text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[101] focus:px-4 focus:py-2"
        >
          {a11y.skipLinkLabel}
        </a>
        {/* siteName is passed so the header can show a wordmark when no logo
            image is uploaded, instead of a hardcoded brand. */}
        <Header
          data={headerData || {}}
          siteName={siteSettings?.siteName || undefined}
          accessibilityLink={
            a11y.showHeaderLink ? { label: a11y.headerLinkLabel, url: a11y.headerLinkUrl } : undefined
          }
        />
        <main id="main" className="site-main flex-1">
          {children}
        </main>
        <Footer data={footerData || {}} siteSettings={siteSettings || {}} />
        {/* Accessibility Adjustments panel, opened from the header button. */}
        {a11y.showHeaderLink && <AccessibilityWidget statementUrl={a11y.headerLinkUrl} />}
      </body>
    </html>
  )
}
