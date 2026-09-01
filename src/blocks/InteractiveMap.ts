import type { Block } from 'payload'
import { sectionHeadingFields, colorField } from './shared'

export const InteractiveMap: Block = {
  slug: 'interactiveMap',
  labels: { singular: 'Interactive Map', plural: 'Interactive Maps' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'mapImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Map image (e.g. India map SVG/PNG)' },
    },
    {
      name: 'mapEmbedUrl',
      type: 'text',
      admin: { description: 'Alternatively, embed URL for interactive map (iframe)' },
    },
    {
      name: 'mapHeight',
      type: 'number',
      defaultValue: 500,
      admin: { description: 'Map display height in pixels' },
    },
    {
      name: 'showProgressBars',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Show progress bars alongside the map' },
    },
    {
      name: 'progressItems',
      type: 'array',
      label: 'Progress Bars',
      admin: {
        condition: (_, siblingData) => siblingData?.showProgressBars,
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: { description: 'e.g. "Rajasthan", "Maharashtra"' },
        },
        {
          name: 'value',
          type: 'number',
          required: true,
          min: 0,
          max: 100,
          admin: { description: 'Progress percentage (0-100)' },
        },
        {
          name: 'displayValue',
          type: 'text',
          admin: { description: 'Custom display text (e.g. "1,250 Schools")' },
        },
        colorField('barColor', 'Bar Color', '#3B82F6'),
      ],
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'mapLeft',
      options: [
        { label: 'Map Left + Progress Right', value: 'mapLeft' },
        { label: 'Map Right + Progress Left', value: 'mapRight' },
        { label: 'Map Full Width + Progress Below', value: 'stacked' },
      ],
    },
    colorField('backgroundColor', 'Section Background Color', '#FFFFFF'),
  ],
}
