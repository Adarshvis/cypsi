'use client'

import React, { useEffect, useState } from 'react'
import { useField, SelectInput } from '@payloadcms/ui'

interface PageOption {
  label: string
  value: string
  depth: number
  collection: string
}

interface PageData {
  id: string
  title: string
  slug: string
  parent?: { id: string } | string | null
}

export const HomePageSelectorField: React.FC<any> = ({ path }) => {
  const { value, setValue } = useField<string>({ path })
  const [options, setOptions] = useState<{ label: string; value: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true)

        // Fetch Pages collection
        const pagesRes = await fetch('/api/pages?limit=1000&depth=1').then((r) => r.json())

        const allPages: PageOption[] = []

        // Process Pages collection (with hierarchy)
        const pagesData: PageData[] = pagesRes.docs || []
        const pageMap = new Map<string, PageData>()
        pagesData.forEach((page) => pageMap.set(String(page.id), page))

        // Build hierarchy for Pages
        const buildHierarchy = (
          page: PageData,
          depth: number = 0,
          visited: Set<string> = new Set(),
        ): PageOption[] => {
          const pageId = String(page.id)

          // Prevent infinite loops
          if (visited.has(pageId)) return []
          visited.add(pageId)

          const indent = '—'.repeat(depth) + (depth > 0 ? '► ' : '')
          const result: PageOption[] = [
            {
              label: `${indent}(${page.slug}) ${page.title}`,
              value: `pages:${page.slug}`,
              depth,
              collection: 'pages',
            },
          ]

          // Find children
          const children = pagesData.filter((p) => {
            const parentId =
              typeof p.parent === 'object' && p.parent !== null ? p.parent.id : p.parent
            return parentId === pageId
          })

          children.forEach((child) => {
            result.push(...buildHierarchy(child, depth + 1, new Set(visited)))
          })

          return result
        }

        // Get root pages (no parent)
        const rootPages = pagesData.filter((p) => !p.parent)
        rootPages.forEach((page) => {
          allPages.push(...buildHierarchy(page))
        })

        // Add static routes section
        allPages.push({
          label: '─── STATIC ROUTES ───',
          value: '__static_separator__',
          depth: 0,
          collection: 'separator',
        })

        // Add hardcoded static routes
        const staticRoutes = [
          { label: 'News & Events', slug: 'news', route: '/news' },
          { label: 'Team', slug: 'team', route: '/team' },
        ]

        staticRoutes.forEach((route) => {
          allPages.push({
            label: `—► (${route.slug}) ${route.label}`,
            value: `route:${route.route}`,
            depth: 1,
            collection: 'route',
          })
        })

        // Convert to select options (filter out separators for disabled state)
        const selectOptions = allPages.map((page) => ({
          label: page.label,
          value: page.value,
          // Disable separator options
          ...(page.collection === 'separator' && { disabled: true }),
        }))

        setOptions(selectOptions)
      } catch (error) {
        console.error('Error fetching pages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPages()
  }, [])

  return (
    <div className="field-type">
      <label className="field-label">
        Home Page
        <span className="field-description" style={{ display: 'block', marginTop: '0.5rem' }}>
          Select which page should be the home page (root URL /)
        </span>
      </label>
      {loading ? (
        <div style={{ padding: '1rem', color: '#666' }}>Loading pages...</div>
      ) : (
        <SelectInput
          path={path}
          name={path}
          options={options}
          value={value}
          onChange={(selectedOption: any) => {
            setValue(selectedOption?.value || '')
          }}
        />
      )}
    </div>
  )
}
