import { getPayload } from 'payload'
import config from '@/payload.config'

let cachedPreset: string | null = null
let cacheTime = 0
const CACHE_TTL = 30_000 // 30 seconds

/**
 * Fetch the active theme preset from Site Settings.
 * Uses a simple in-memory cache to avoid hitting the DB on every page render.
 */
export async function getThemePreset(): Promise<string> {
  const now = Date.now()
  if (cachedPreset && now - cacheTime < CACHE_TTL) {
    return cachedPreset
  }

  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'site-settings' as any })
    cachedPreset = (settings as any)?.themePreset || 'ducc'
    cacheTime = now
    return cachedPreset!
  } catch {
    return cachedPreset || 'ducc'
  }
}
