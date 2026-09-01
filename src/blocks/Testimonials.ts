import type { Block } from 'payload'
import { sectionHeadingFields } from './shared'

export const Testimonials: Block = {
  slug: 'testimonials',
  labels: { singular: 'Testimonials', plural: 'Testimonials' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Default Carousel', value: 'default' },
        { label: 'Large Quote (Dark Full-Width)', value: 'duccQuote' },
      ],
      admin: {
        description: 'Choose visual style for testimonials',
      },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'quote',
          type: 'textarea',
          required: true,
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'text',
          admin: {
            description: 'e.g. "Student, Class 10", "Parent", "Principal"',
          },
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'initials',
          type: 'text',
          maxLength: 3,
          admin: {
            description: 'Initials for avatar fallback (e.g. "SS") — used in Large Quote layout',
          },
        },
      ],
    },
  ],
}
