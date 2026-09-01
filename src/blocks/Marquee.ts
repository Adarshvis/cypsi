import type { Block } from 'payload'
import { colorField, iconField } from './shared'

export const Marquee: Block = {
  slug: 'marquee',
  labels: { singular: 'Marquee / Ticker', plural: 'Marquees / Tickers' },
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      label: 'Ticker Items',
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          admin: { description: 'Optional link when clicked' },
        },
        iconField('icon', 'Item Icon'),
        {
          name: 'badge',
          type: 'text',
          admin: { description: 'Optional badge/label (e.g. "NEW", "IMPORTANT")' },
        },
      ],
    },
    colorField('backgroundColor', 'Background Color', '#1E3A5F'),
    colorField('textColor', 'Text Color', '#FFFFFF'),
    {
      name: 'speed',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { label: 'Slow', value: 'slow' },
        { label: 'Normal', value: 'normal' },
        { label: 'Fast', value: 'fast' },
      ],
    },
    {
      name: 'pauseOnHover',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'separator',
      type: 'text',
      defaultValue: '•',
      admin: { description: 'Character between items (e.g. "•", "|", "★")' },
    },
  ],
}
