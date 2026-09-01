import type { Block } from 'payload'
import { sectionHeadingFields } from './shared'

export const Embed: Block = {
  slug: 'embed',
  labels: { singular: 'Embed', plural: 'Embeds' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'embedType',
      type: 'select',
      defaultValue: 'iframe',
      required: true,
      options: [
        { label: 'HTML Code', value: 'html' },
        { label: 'iFrame URL', value: 'iframe' },
      ],
    },
    {
      name: 'html',
      type: 'code',
      admin: {
        language: 'html',
        condition: (_, siblingData) => siblingData?.embedType === 'html',
        description: 'Paste custom HTML/embed code',
      },
    },
    {
      name: 'iframeUrl',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.embedType === 'iframe',
        description: 'URL to embed (YouTube, Google Maps, etc.)',
      },
    },
    {
      name: 'width',
      type: 'select',
      defaultValue: 'full',
      options: [
        { label: 'Contained (896px)', value: 'contained' },
        { label: 'Wide (1152px)', value: 'wide' },
        { label: 'Full (page width)', value: 'full' },
        { label: 'Full Bleed (edge to edge)', value: 'fullBleed' },
      ],
      admin: {
        description: 'How wide the embed container should be',
      },
    },
    {
      name: 'height',
      type: 'number',
      admin: {
        description:
          'Fixed height in pixels. Leave empty for a responsive 16:9 frame, which suits video.',
      },
    },
  ],
}
