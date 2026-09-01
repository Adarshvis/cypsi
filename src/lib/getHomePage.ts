import type { Payload } from 'payload'

export interface HomePageData {
  collection: string
  slug?: string
  id?: string
  route?: string
  data?: any
}

/**
 * Get the home page data based on the Site Settings configuration
 * @param payload - Payload instance
 * @returns Home page data or null if not configured
 */
export async function getHomePage(payload: Payload): Promise<HomePageData | null> {
  try {
    const siteSettings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
    })

    const homePageValue = siteSettings?.homePage as string | undefined

    if (!homePageValue) {
      // Default to 'home' page if not configured
      const homePage = await payload.find({
        collection: 'pages',
        where: {
          slug: {
            equals: 'home',
          },
        },
        limit: 1,
        depth: 2,
      })

      if (homePage.docs.length > 0) {
        return {
          collection: 'pages',
          slug: 'home',
          data: homePage.docs[0],
        }
      }

      return null
    }

    // Parse the homePage value (format: "collection:identifier" or "route:/path")
    const [type, identifier] = homePageValue.split(':')

    if (!type || !identifier) {
      return null
    }

    // Handle static routes
    if (type === 'route') {
      return {
        collection: 'route',
        route: identifier,
        slug: identifier.replace('/', ''),
      }
    }

    // Handle Pages collection
    if (type === 'pages') {
      const page = await payload.find({
        collection: 'pages',
        where: {
          slug: {
            equals: identifier,
          },
        },
        limit: 1,
        depth: 2,
      })

      if (page.docs.length > 0) {
        return {
          collection: 'pages',
          slug: identifier,
          data: page.docs[0],
        }
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching home page:', error)
    return null
  }
}
