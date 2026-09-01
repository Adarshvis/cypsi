import type { CollectionConfig } from 'payload'
import {
  collectionReadAccess,
  collectionWriteAccess,
  siteAdminAccess,
} from '../access/roles'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  labels: {
    singular: 'Blog Post',
    plural: 'Blog Posts',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'authorName', 'category', 'publishedDate', 'status'],
    group: 'Content',
    description: 'Authored articles, separate from the News announcement feed',
  },
  access: {
    read: collectionReadAccess('blog-posts'),
    create: collectionWriteAccess('blog-posts'),
    update: collectionWriteAccess('blog-posts'),
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
    beforeChange: [
      ({ data, req, operation }) => {
        if (operation === 'create' && req.user && !data.createdBy) {
          data.createdBy = req.user.id
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
      name: 'shortDescription',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Excerpt shown on blog listing cards',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Main image for the card and detail page',
      },
    },
    {
      name: 'category',
      type: 'text',
      admin: {
        description: 'Free-text label, e.g. "Cybersecurity", "IoT", "Research Notes"',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      type: 'collapsible',
      label: 'Author',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'authorName',
          type: 'text',
          required: true,
          label: 'Name',
        },
        {
          name: 'authorRole',
          type: 'text',
          label: 'Role / Title',
          admin: {
            description: 'e.g. "Research Scholar", "Professor"',
          },
        },
        {
          name: 'authorImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Photo',
        },
        {
          name: 'authorBio',
          type: 'textarea',
          label: 'Short Bio',
        },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    {
      name: 'readTime',
      type: 'text',
      admin: {
        description: 'e.g. "5 min read"',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      label: 'SEO Description',
      admin: {
        description: 'Optional meta description for search results',
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Highlight this post on listing pages',
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
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'User who created this post',
      },
    },
  ],
}
