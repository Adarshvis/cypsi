import type { Block } from 'payload'
import { sectionHeadingFields } from './shared'

export const ContentWithMedia: Block = {
  slug: 'contentWithMedia',
  labels: { singular: 'Content with Media', plural: 'Content with Media' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'mediaPosition',
      type: 'select',
      defaultValue: 'right',
      options: [
        { label: 'Media on Left', value: 'left' },
        { label: 'Media on Right', value: 'right' },
      ],
    },
  ],
}
