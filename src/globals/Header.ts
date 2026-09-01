import type { GlobalConfig } from 'payload'
import { publicAccess, adminAccess } from '../access/roles'

async function sanitizeHeaderChildPageRefs(data: any, payload: any) {
  if (!data || !Array.isArray(data.navItems)) return data

  const pages = await payload.find({ collection: 'pages', limit: 1000, depth: 0 })
  const validPageIds = new Set(pages.docs.map((doc: any) => String(doc.id)))

  data.navItems = data.navItems.map((item: any) => {
    if (!Array.isArray(item?.children)) return item

    const children = item.children.filter((child: any) => {
      const pageRef = child?.page
      if (!pageRef) return false
      if (typeof pageRef === 'object' && 'id' in pageRef) return validPageIds.has(String(pageRef.id))
      return validPageIds.has(String(pageRef))
    })

    return {
      ...item,
      children,
    }
  })

  return data
}

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header',
  hooks: {
    beforeChange: [
      async ({ data, req }) => sanitizeHeaderChildPageRefs(data, req.payload),
    ],
  },
  access: {
    read: publicAccess,
    update: adminAccess,
  },
  fields: [
    // ── Top Bar (optional) ──
    {
      type: 'group',
      name: 'topBar',
      label: 'Top Bar (Optional)',
      admin: {
        description: 'Slim bar above the main header for announcements, contact info, etc.',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'text',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
            description: 'e.g. "Welcome to Our Portal"',
          },
        },
        {
          name: 'backgroundColor',
          type: 'text',
          defaultValue: '#1E3A5F',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
            description: 'Pick top bar background color',
          },
        },
      ],
    },

    // ── Left Logo (Organization) ──
    {
      type: 'group',
      name: 'leftLogo',
      label: 'Left Logo (Organization)',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'url',
          type: 'text',
          defaultValue: '/',
          admin: {
            description: 'Link when logo is clicked',
          },
        },
        {
          name: 'height',
          type: 'number',
          defaultValue: 50,
          admin: {
            description: 'Logo height in pixels (width auto-scales)',
          },
        },
        {
          name: 'maxWidth',
          type: 'number',
          defaultValue: 200,
          admin: {
            description: 'Maximum logo width in pixels',
          },
        },
      ],
    },

    // ── Center Logo (Ministry / State) ──
    {
      type: 'group',
      name: 'centerLogo',
      label: 'Center Logo (Ministry / State)',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Text displayed below/beside the center logo (e.g. "Ministry of Education")',
          },
        },
        {
          name: 'subtitle',
          type: 'text',
          admin: {
            description: 'Secondary text (e.g. "Government of India")',
          },
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            description: 'Link when center logo is clicked',
          },
        },
        {
          name: 'height',
          type: 'number',
          defaultValue: 60,
          admin: {
            description: 'Logo height in pixels (width auto-scales)',
          },
        },
        {
          name: 'maxWidth',
          type: 'number',
          defaultValue: 300,
          admin: {
            description: 'Maximum logo width in pixels',
          },
        },
      ],
    },

    // ── Search Bar ──
    {
      type: 'group',
      name: 'searchBar',
      label: 'Search Bar',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'placeholder',
          type: 'text',
          defaultValue: 'Search...',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
      ],
    },

    // ── Navigation ──
    {
      name: 'navAlignment',
      type: 'select',
      label: 'Navigation Alignment',
      defaultValue: 'center',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
      admin: {
        description: 'Controls desktop navigation alignment in the header bar.',
      },
    },
    {
      name: 'navItems',
      type: 'array',
      label: 'Navigation Items',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            description: 'Link URL (leave blank if this item has submenu children)',
          },
        },
        {
          name: 'children',
          type: 'array',
          label: 'Submenu Items',
          admin: {
            description: 'Add dropdown/submenu items under this menu item',
            initCollapsed: true,
          },
          fields: [
            {
              name: 'type',
              type: 'select',
              defaultValue: 'page',
              options: [
                { label: 'Page (from Pages collection)', value: 'page' },
                { label: 'Custom URL', value: 'custom' },
              ],
              admin: {
                description: 'Choose whether to link to a page or use a custom URL',
              },
            },
            {
              name: 'page',
              type: 'relationship',
              relationTo: 'pages',
              admin: {
                description: 'Select a page to link to',
                condition: (_, siblingData) => siblingData?.type === 'page',
              },
            },
            {
              name: 'customLabel',
              type: 'text',
              admin: {
                description: 'Link text (e.g., "Software", "Projects")',
                condition: (_, siblingData) => siblingData?.type === 'custom',
              },
            },
            {
              name: 'customUrl',
              type: 'text',
              admin: {
                description: 'URL path (e.g., "/software", "/projects", "/team")',
                condition: (_, siblingData) => siblingData?.type === 'custom',
              },
            },
            {
              name: 'label',
              type: 'text',
              admin: {
                description: 'Override label (uses page title if blank) - only for Page type',
                condition: (_, siblingData) => siblingData?.type === 'page',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'navSyncHiddenPageUrls',
      type: 'array',
      admin: {
        hidden: true,
      },
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'navSyncLastSyncedPageUrls',
      type: 'array',
      admin: {
        hidden: true,
      },
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },

    // ── CTA Button ──
    {
      type: 'group',
      name: 'ctaButton',
      label: 'CTA Button',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'label',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
      ],
    },
  ],
}
