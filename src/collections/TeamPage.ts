import type { CollectionConfig } from 'payload'
import {
  collectionWriteAccess,
  hiddenUnlessCollectionAccess,
  publicAccess,
  siteAdminAccess,
} from '../access/roles'
import { collectionBlocks } from '../blocks/allBlocks'

export const TeamPage: CollectionConfig = {
  slug: 'team-page',
  labels: {
    singular: 'Team Page',
    plural: 'Team Pages',
  },
  admin: {
    // Shown only to people who can work on this collection.
    hidden: hiddenUnlessCollectionAccess('team-page'),
    useAsTitle: 'pageName',
    group: 'Content',
    description: 'Team / Faculty listing pages with member profiles',
  },
  access: {
    read: publicAccess,
    create: collectionWriteAccess('team-page'),
    update: collectionWriteAccess('team-page'),
    delete: siteAdminAccess,
  },
  fields: [
    /* ── Page Meta ── */
    {
      name: 'pageName',
      type: 'text',
      required: true,
      admin: {
        description: 'Internal identifier (e.g. "Main Team Page")',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      admin: { position: 'sidebar' },
    },

    /* ── Page Title / Banner ── */
    {
      type: 'group',
      name: 'pageTitle',
      label: 'Page Title & Banner',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: { description: 'Page heading (e.g. "Our Team")' },
        },
        {
          name: 'eyebrow',
          type: 'text',
          admin: { description: 'Small badge text above title (e.g. "MEET THE TEAM")' },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: { description: 'Description below the title' },
        },
        {
          name: 'breadcrumbs',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'link', type: 'text' },
            { name: 'isActive', type: 'checkbox', defaultValue: false },
          ],
        },
      ],
    },

    /* ── Page URL ── */
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      defaultValue: 'team',
      admin: {
        description: 'URL path (e.g. "team" → /team)',
      },
    },

    /* ── Layout Blocks ── */
    {
      name: 'layout',
      type: 'blocks',
      label: 'Page Layout',
      blocks: collectionBlocks,
      admin: {
        description: 'Add blocks including Team Grid with member profiles',
      },
    },
  ],
}
