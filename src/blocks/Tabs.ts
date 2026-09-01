import type { Block } from 'payload'
import { sectionHeadingFields } from './shared'

export const Tabs: Block = {
  slug: 'tabs',
  labels: { singular: 'Tabs', plural: 'Tabs' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'tabs',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'content',
          type: 'richText',
          required: true,
        },
      ],
    },
  ],
}
