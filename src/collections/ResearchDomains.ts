import type { CollectionConfig } from 'payload'
import {
  collectionReadAccess,
  collectionWriteAccess,
  hiddenUnlessCollectionAccess,
  siteAdminAccess,
} from '../access/roles'
import { uniqueSlugHook, validateSlug } from '../lib/slug'

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
    // Makes the slug from the title when empty, tidies typed ones, adds -2/-3 for duplicates.
    beforeValidate: [uniqueSlugHook({ collection: 'research-domains' })],
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
      // Lets the admin save with this left empty; the hook then fills it.
      validate: validateSlug,
      admin: {
        position: 'sidebar',
        description:
          'Web address: /research-domains/<slug>. Leave empty to make it from the title. Kept when the title changes, so links keep working.',
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
        components: { Field: '@/components/admin/IconPickerField#IconPickerField' },
        description: 'Optional icon for the listing card.',
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
