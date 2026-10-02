/**
 * Returns the URL only if it is an absolute http(s) address, otherwise null.
 *
 * Use for any CMS-supplied iframe `src`. A `javascript:` or `data:` URL there
 * either runs script or lets an editor serve arbitrary HTML under the site's
 * page, which would sidestep the SandboxedHtml isolation.
 *
 * Plain module (no 'use client') so both server and client components can call it.
 */
export function safeEmbedUrl(raw?: string | null): string | null {
  const value = raw?.trim()
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

/**
 * Accepts either a bare embed URL or a pasted `<iframe ... src="...">` snippet
 * (what Google Maps' "Embed a map" dialog gives you) and returns a safe https
 * src, or null. Only the src is ever used — never the pasted markup.
 */
export function embedSrcFromInput(raw?: string | null): string | null {
  const value = raw?.trim()
  if (!value) return null
  const match = value.match(/\bsrc\s*=\s*["']([^"']+)["']/i)
  const candidate = (match ? match[1] : value).replace(/&amp;/g, '&')
  const safe = safeEmbedUrl(candidate)
  return safe && safe.startsWith('https:') ? safe : null
}

/**
 * Href guard for CMS-supplied links: allows site-relative paths, anchors,
 * http(s), mailto: and tel:. Anything else (javascript:, data:, …) yields null.
 */
export function safeHref(raw?: string | null): string | null {
  const value = raw?.trim()
  if (!value) return null
  if (value.startsWith('/') && !value.startsWith('//')) return value
  if (value.startsWith('#')) return value
  try {
    const url = new URL(value)
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? value : null
  } catch {
    return null
  }
}
