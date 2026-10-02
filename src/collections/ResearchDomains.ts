import type { CollectionConfig } from 'payload'
import {
  collectionReadAccess,
  collectionWriteAccess,
  hiddenUnlessCollectionAccess,
  siteAdminAccess,
} from '../access/roles'

export const ResearchDomains: CollectionConfig = {
  slug: 'research-domains',
  labels: {
    singular: 'Research Domain',
    plural: 'Research Domains',
  },
  admin: {
    // Shown only to people who can work on this collection.
    hidden: hiddenUnlessCollectionAccess('research-domains'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'sortOrder', 'updatedAt'],
    group: 'Research',
    description: 'Research areas the lab works in, each with its own detail page',
  },
  access: {
    read: collectionReadAccess('research-domains'),
    create: collectionWriteAccess('research-domains'),
    update: collectionWriteAccess('research-domains'),
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
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "Cyber Physical Systems", "Applied Machine Learning"',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL path segment (auto-generated from title if left empty)',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary shown on listing cards',
      },
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Optional Lucide icon name for the listing card, e.g. "cpu"',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Image for the listing card and detail page banner',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Full body of the research domain detail page',
      },
    },
    {
      name: 'effectiveDate',
      type: 'text',
      admin: {
        description: 'Optional line such as "Last Updated: December 2025"',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
