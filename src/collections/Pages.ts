import type { CollectionConfig } from 'payload'
import {
  collectionReadAccess,
  collectionWriteAccess,
  siteAdminAccess,
} from '../access/roles'
import { syncNavAfterChange, syncNavAfterDelete } from '../hooks/syncNavItems'
import { allBlocks } from '../blocks/allBlocks'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: collectionReadAccess('pages'),
    create: collectionWriteAccess('pages'),
    update: collectionWriteAccess('pages'),
    delete: siteAdminAccess,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
    afterChange: [syncNavAfterChange],
    afterDelete: [syncNavAfterDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'bannerEyebrow',
      type: 'text',
      label: 'Banner Eyebrow',
      admin: {
        description: 'Optional small badge text on the page banner (e.g. "ABOUT US", "SOFTWARE SERVICES")',
      },
    },
    {
      name: 'bannerDescription',
      type: 'textarea',
      label: 'Banner Description',
      admin: {
        description: 'Optional description text below the title on the page banner',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly identifier (auto-generated from title if left empty)',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      admin: {
        description: 'Parent page for hierarchy',
      },
    },
    {
      type: 'group',
      name: 'meta',
      label: 'SEO',
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Override page title for search engines',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'Meta description for search engines',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Open Graph image for social sharing',
          },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      required: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'showInNav',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show in Navigation',
      admin: {
        position: 'sidebar',
        description: 'Automatically add this page to the header navigation',
      },
    },
    {
      name: 'navOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Order in navigation (lower numbers appear first)',
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Date this page was published',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      required: true,
      blocks: allBlocks,
    },
  ],
}
