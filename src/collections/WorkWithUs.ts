import type { CollectionConfig } from 'payload'
import {
  collectionReadAccess,
  collectionWriteAccess,
  hiddenUnlessCollectionAccess,
  siteAdminAccess,
} from '../access/roles'
import { uniqueSlugHook, validateSlug } from '../lib/slug'

export const WorkWithUs: CollectionConfig = {
  slug: 'work-with-us',
  labels: {
    singular: 'Programme',
    plural: 'Work With Us',
  },
  admin: {
    // Shown only to people who can work on this collection.
    hidden: hiddenUnlessCollectionAccess('work-with-us'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'sortOrder', 'updatedAt'],
    group: 'Opportunities',
    description: 'PhD, incubation, research internships and other programmes',
  },
  access: {
    read: collectionReadAccess('work-with-us'),
    create: collectionWriteAccess('work-with-us'),
    update: collectionWriteAccess('work-with-us'),
    delete: siteAdminAccess,
  },
  hooks: {
    // Makes the slug from the title when empty, tidies typed ones, adds -2/-3 for duplicates.
    beforeValidate: [uniqueSlugHook({ collection: 'work-with-us' })],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "PhD Programme", "Research Internship", "Incubation"',
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
          'Web address: /work-with-us/<slug>. Leave empty to make it from the title. Kept when the title changes, so links keep working.',
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
        description: 'Full body of the programme detail page',
      },
    },
    {
      name: 'problemDomains',
      type: 'array',
      label: 'Problem Domains',
      admin: {
        description: 'Expandable research areas. Mainly used by Research Internship.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            description: 'e.g. "ML/DL Based Systems for Education 4.0"',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Overview of the problem domain',
          },
        },
        {
          name: 'challenges',
          type: 'array',
          label: 'Research Challenges',
          fields: [{ name: 'challenge', type: 'text', required: true }],
        },
        {
          name: 'technicalSkills',
          type: 'array',
          label: 'Technical Skills Required',
          fields: [{ name: 'skill', type: 'text', required: true }],
        },
        {
          name: 'nonTechnicalSkills',
          type: 'array',
          label: 'Non-Technical Skills Required',
          fields: [{ name: 'skill', type: 'text', required: true }],
        },
      ],
    },
    {
      name: 'applyButtonText',
      type: 'text',
      admin: {
        description: 'e.g. "Apply Now". Leave empty to hide the button.',
      },
    },
    {
      name: 'applyButtonLink',
      type: 'text',
      admin: {
        description: 'Application URL, e.g. an external DU form',
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
