/**
 * Site-level text used by page metadata and banners.
 *
 * Exists so no route has to hardcode a title or an organisation name. Every
 * value comes from Site Settings; where a setting is empty the fallback is a
 * generic noun ("News", "Publications", "Blog"), never a brand.
 */
import { getPayload } from 'payload'
import config from '@/payload.config'

export interface ListingMeta {
  title: string
  eyebrow?: string
  description?: string
  metaTitle: string
  metaDescription?: string
}

export interface SiteMeta {
  siteName: string
  siteDescription?: string
  faviconUrl?: string
  news: ListingMeta
  publications: ListingMeta
  blog: ListingMeta
}

/**
 * Neutral defaults.
 *
 * Deliberately plain nouns: a site that has not filled these in should read as
 * unconfigured, not as some other organisation.
 */
const DEFAULT_SITE_NAME = 'Site'
const DEFAULT_LISTING_TITLES = {
  news: 'News',
  publications: 'Publications',
  blog: 'Blog',
} as const

let cached: SiteMeta | null = null
let cacheTime = 0
const CACHE_TTL = 30_000

function resolveListing(
  raw: any,
  fallbackTitle: string,
  siteName: string,
  siteDescription?: string,
): ListingMeta {
  const title = raw?.title?.trim() || fallbackTitle
  const description = raw?.description?.trim() || undefined

  return {
    title,
    eyebrow: raw?.eyebrow?.trim() || undefined,
    description,
    // A listing that sets no meta title still gets a useful one.
    metaTitle: raw?.metaTitle?.trim() || `${title} — ${siteName}`,
    metaDescription: raw?.metaDescription?.trim() || description || siteDescription,
  }
}

export async function getSiteMeta(): Promise<SiteMeta> {
  const now = Date.now()
  if (cached && now - cacheTime < CACHE_TTL) return cached

  let settings: any = null
  try {
    const payload = await getPayload({ config })
    settings = await payload.findGlobal({ slug: 'site-settings' as any, depth: 1 })
  } catch {
    // Fall through to defaults; a metadata lookup must not break the page.
  }

  const siteName = settings?.siteName?.trim() || DEFAULT_SITE_NAME
  const siteDescription = settings?.siteDescription?.trim() || undefined
  const listings = settings?.listingPages || {}

  const meta: SiteMeta = {
    siteName,
    siteDescription,
    faviconUrl:
      settings?.favicon && typeof settings.favicon === 'object' && settings.favicon.url
        ? settings.favicon.url
        : undefined,
    news: resolveListing(listings.news, DEFAULT_LISTING_TITLES.news, siteName, siteDescription),
    publications: resolveListing(
      listings.publications,
      DEFAULT_LISTING_TITLES.publications,
      siteName,
      siteDescription,
    ),
    blog: resolveListing(listings.blog, DEFAULT_LISTING_TITLES.blog, siteName, siteDescription),
  }

  cached = meta
  cacheTime = now
  return meta
}

/** Clears the cache; used after Site Settings are saved. */
export function clearSiteMetaCache(): void {
  cached = null
  cacheTime = 0
}
