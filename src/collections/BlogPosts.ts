import type { CollectionConfig } from 'payload'
import {
  collectionReadAccess,
  collectionWriteAccess,
  hiddenUnlessCollectionAccess,
  siteAdminAccess,
} from '../access/roles'
import { uniqueSlugHook, validateSlug } from '../lib/slug'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  labels: {
    singular: 'Blog Post',
    plural: 'Blog Posts',
  },
  admin: {
    // Shown only to people who can work on this collection.
    hidden: hiddenUnlessCollectionAccess('blog-posts'),
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
    beforeValidate: [uniqueSlugHook({ collection: 'blog-posts' })],
    beforeChange: [
      ({ data, req, operation, originalDoc }) => {
        if (!data) return data
        // Server-set only: a client-supplied value is ignored (it could credit
        // the post to someone else, or crash the save with a bad id).
        data.createdBy =
          operation === 'create' ? (req.user?.id ?? null) : (originalDoc?.createdBy ?? null)
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
      // Lets the admin save with this left empty; the hook then fills it.
      validate: validateSlug,
      admin: {
        position: 'sidebar',
        description:
          'Web address: /blog/<slug>. Leave empty to make it from the title. Kept when the title changes, so links keep working.',
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
