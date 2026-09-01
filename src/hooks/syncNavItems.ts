import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

async function syncNavToHeader(payload: any) {
  // 1. Fetch current header to preserve manual items and submenus
  const header = await payload.findGlobal({ slug: 'header', depth: 0 })
  const existingNav = header.navItems || []
  /** Reads an array-of-{url} field off the header global as a set of URLs. */
  const urlSet = (rows: unknown): Set<string> =>
    new Set<string>(
      (Array.isArray(rows) ? rows : [])
        .map((item: { url?: string }) => item?.url)
        .filter((url: unknown): url is string => typeof url === 'string' && url.length > 0),
    )

  const hiddenPageUrls = urlSet(header.navSyncHiddenPageUrls)
  const lastSyncedPageUrls = urlSet(header.navSyncLastSyncedPageUrls)

  // 2. Fetch all pages, so submenu page references can be validated
  const allPages = await payload.find({ collection: 'pages', limit: 1000, depth: 0 })
  const allPageIds = new Set(allPages.docs.map((p: any) => p.id))

  const sanitizeChildren = (children: any[] | null | undefined) => {
    if (!Array.isArray(children)) return []
    return children.filter((child) => {
      const pageRef = child?.page
      if (typeof pageRef === 'number') return allPageIds.has(pageRef)
      if (typeof pageRef === 'string') return allPageIds.has(Number(pageRef)) || allPageIds.has(pageRef)
      if (pageRef && typeof pageRef === 'object' && 'id' in pageRef) return allPageIds.has(pageRef.id)
      return false
    })
  }

  // 3. Fetch the pages that SHOULD be in the nav
  const activePages = await payload.find({
    collection: 'pages',
    where: { showInNav: { equals: true }, status: { equals: 'published' } },
    sort: ['navOrder', 'createdAt'],
    limit: 1000,
    depth: 0
  })
  const activePageUrls = new Set<string>(
    activePages.docs.map((page: any): string => (page.slug === 'home' ? '/' : `/${page.slug}`)),
  )

  /*
   * 4. Set aside the items this sync does not own, so they survive the rebuild.
   *
   * Only two kinds of link are the sync's to manage: one for a page currently
   * eligible for the nav, and one it added on an earlier run (so that turning
   * showInNav off still removes the link).
   *
   * Matching against every page instead — as this once did — silently deleted
   * hand-written links that happened to point at a page not marked showInNav.
   * A link to a page the sync does not manage is a manual link and is kept.
   */
  const syncManagedUrls = new Set<string>([...activePageUrls, ...lastSyncedPageUrls])
  const manualNavItems = existingNav.filter((item: any) => !syncManagedUrls.has(item.url))

  // Detect page links removed manually from Header nav after previous sync and persist them as hidden.
  const currentPageUrlsInNav = new Set<string>(
    existingNav
      .map((item: any) => item?.url)
      .filter((url: unknown): url is string => typeof url === 'string' && activePageUrls.has(url)),
  )

  for (const url of lastSyncedPageUrls) {
    if (activePageUrls.has(url) && !currentPageUrlsInNav.has(url)) {
      hiddenPageUrls.add(url)
    }
  }

  // If admin adds a previously hidden page URL back manually, unhide it.
  for (const url of currentPageUrlsInNav) {
    hiddenPageUrls.delete(url)
  }

  // If a page is newly eligible for sync, do not keep stale hidden state.
  for (const url of activePageUrls) {
    if (!lastSyncedPageUrls.has(url)) {
      hiddenPageUrls.delete(url)
    }
  }

  // Keep hidden list clean by retaining only currently active page URLs.
  const nextHiddenUrls = [...hiddenPageUrls].filter((url) => activePageUrls.has(url))
  const nextHiddenSet = new Set(nextHiddenUrls)

  // 5. Build the new page links, but PRESERVE their existing `children` submenus
  const pageNavItems = activePages.docs.map((page: any) => {
    const url = page.slug === 'home' ? '/' : `/${page.slug}`
    const previousItem = existingNav.find((item: any) => item.url === url)
    return {
      label: page.title,
      url: url,
      children: sanitizeChildren(previousItem?.children), // Keep valid submenus only.
    }
  }).filter((item: any) => !nextHiddenSet.has(item.url))

  // Combine them: Page links first (sorted by navOrder), then any manual links at the end
  const navItems = [...pageNavItems, ...manualNavItems]

  await payload.updateGlobal({
    slug: 'header',
    data: {
      navItems,
      navSyncHiddenPageUrls: nextHiddenUrls.map((url) => ({ url })),
      navSyncLastSyncedPageUrls: pageNavItems.map((item: any) => ({ url: item.url })),
    },
    overrideAccess: true,
  })
}

export const syncNavAfterChange: CollectionAfterChangeHook = async ({ req }) => {
  // Run in background — don't block the save
  syncNavToHeader(req.payload).catch((err) => {
    req.payload.logger.error(`Failed to sync nav after change: ${err}`)
  })
}

export const syncNavAfterDelete: CollectionAfterDeleteHook = async ({ req }) => {
  // Run in background — don't block the save
  syncNavToHeader(req.payload).catch((err) => {
    req.payload.logger.error(`Failed to sync nav after delete: ${err}`)
  })
}
