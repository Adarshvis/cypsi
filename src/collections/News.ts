import type { CollectionConfig } from 'payload'
import {
  collectionReadAccess,
  collectionWriteAccess,
  siteAdminAccess,
} from '../access/roles'
import { collectionBlocks } from '../blocks/allBlocks'

export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'category', 'status', 'publishedDate', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: collectionReadAccess('news'),
    create: collectionWriteAccess('news'),
    update: collectionWriteAccess('news'),
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
        description: 'News article headline',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly version of title (e.g. "campus-expansion-2025")',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Brief summary/excerpt shown on news listing pages',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Main image for the news article',
      },
    },
    {
      name: 'category',
      type: 'text',
      required: true,
      admin: {
        description: 'Category label (e.g. Update, Press Release, Event)',
      },
    },
    {
      name: 'content',
      type: 'richText',
      admin: {
        description: 'Main news article content',
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      admin: {
        description: 'Publication date',
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      admin: {
        description: 'Related tags/keywords for this news article',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Mark as featured news',
      },
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
      name: 'layout',
      type: 'blocks',
      label: 'Page Layout',
      blocks: collectionBlocks,
      admin: {
        description: 'Optional content blocks for the article page',
      },
    },
  ],
}