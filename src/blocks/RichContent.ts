import type { Block } from 'payload'
import { sectionHeadingFields } from './shared'

export const RichContent: Block = {
  slug: 'richContent',
  labels: { singular: 'Rich Content', plural: 'Rich Contents' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'maxWidth',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Narrow (640px)', value: 'narrow' },
        { label: 'Medium (768px)', value: 'medium' },
        { label: 'Full Width', value: 'full' },
      ],
    },
  ],
}
