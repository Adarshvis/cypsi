export interface ThemePreset {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    muted: string
    text: string
  }
  fonts: {
    heading: string
    body: string
  }
  /** Header style overrides */
  header: {
    /** 'ducc' = centered logo + nav below, 'learner' = logo left + nav right (single row) */
    layout: 'ducc' | 'learner'
    /** Show the top bar announcement strip */
    showTopBar: boolean
    /** Header height in px */
    height: number
    /** Show bottom border/shadow */
    showBottomBorder: boolean
    /** CTA button style: 'square' or 'pill' */
    ctaStyle: 'square' | 'pill'
  }
  /** Layout overrides — which layout variant to use for each block type */
  layouts: {
    hero: 'duccFullscreen' | 'split'
    featureCards: 'duccService' | 'classic'
    featureCardsTheme: 'dark' | 'light'
    featureCardsShowButton: boolean
    news: 'duccCards' | 'spotlight'
    statistics: 'duccStrip' | 'cardGrid'
    testimonials: 'duccQuote' | 'default'
    callToAction: 'duccBanner' | 'default'
    faq: 'duccAccordion' | 'default'
  }
}

export const themePresets: Record<string, ThemePreset> = {
  ducc: {
    colors: {
      primary: '#4B2E83',
      secondary: '#1A103D',
      accent: '#EAB308',
      background: '#FFFFFF',
      surface: '#FFFFFF',
      muted: '#F8F4FF',
      text: '#1A103D',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
    header: {
      layout: 'ducc',
      showTopBar: true,
      height: 100,
      showBottomBorder: false,
      ctaStyle: 'square',
    },
    layouts: {
      hero: 'duccFullscreen',
      featureCards: 'duccService',
      featureCardsTheme: 'dark',
      featureCardsShowButton: false,
      news: 'duccCards',
      statistics: 'duccStrip',
      testimonials: 'duccQuote',
      callToAction: 'duccBanner',
      faq: 'duccAccordion',
    },
  },
  learner: {
    colors: {
      primary: '#04415f',
      secondary: '#011e2c',
      accent: '#2086b8',
      background: '#f1f5f7',
      surface: '#ffffff',
      muted: '#e6edf0',
      text: '#010608',
    },
    fonts: {
      heading: 'Raleway',
      body: 'Roboto',
    },
    header: {
      layout: 'learner',
      showTopBar: false,
      height: 70,
      showBottomBorder: true,
      ctaStyle: 'pill',
    },
    layouts: {
      hero: 'split',
      featureCards: 'classic',
      featureCardsTheme: 'light',
      featureCardsShowButton: true,
      news: 'spotlight',
      statistics: 'duccStrip',
      testimonials: 'duccQuote',
      callToAction: 'duccBanner',
      faq: 'duccAccordion',
    },
  },
}

export function getPreset(name?: string | null): ThemePreset {
  return themePresets[name || 'ducc'] || themePresets.ducc
}
