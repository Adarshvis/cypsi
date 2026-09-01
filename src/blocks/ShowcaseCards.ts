import type { Block } from 'payload'
import { sectionHeadingFields, iconField, colorField } from './shared'

export const ShowcaseCards: Block = {
  slug: 'showcaseCards',
  labels: { singular: 'Showcase Cards', plural: 'Showcase Cards' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'cardStyle',
      type: 'select',
      defaultValue: 'overlay',
      required: true,
      options: [
        { label: 'Overlay (image with text overlay)', value: 'overlay' },
        { label: 'Clean Card (image + details below)', value: 'clean' },
      ],
      admin: {
        description: 'Toggle between overlay cards and clean card layout',
      },
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    {
      name: 'cards',
      type: 'array',
      required: true,
      label: 'Cards',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: { description: 'Card title (e.g. state name or project name)' },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          admin: {
            description: 'Short overlay caption (used in Overlay style)',
          },
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Small logo/emblem (used in Clean Card style)',
          },
        },
        {
          name: 'subtitle',
          type: 'text',
          admin: {
            description: 'Subtitle or location (e.g. "Rajasthan, India")',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'Short description (used in Clean Card style)',
          },
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Show a "Featured" badge on this card',
          },
        },
        {
          name: 'featuredLabel',
          type: 'text',
          defaultValue: 'Featured',
          admin: {
            description: 'Custom badge text (e.g. "Featured", "New", "Live")',
            condition: (_, siblingData) => siblingData?.featured,
          },
        },
        {
          name: 'url',
          type: 'text',
          admin: { description: 'Link when card is clicked' },
        },
        iconField('icon', 'Card Icon'),
      ],
    },
    // Overlay style settings
    {
      type: 'group',
      name: 'overlaySettings',
      label: 'Overlay Style Settings',
      admin: {
        condition: (_, siblingData) => siblingData?.cardStyle === 'overlay',
        description: 'Settings specific to the overlay card style',
      },
      fields: [
        colorField('overlayColor', 'Overlay Color', '#000000'),
        {
          name: 'overlayOpacity',
          type: 'number',
          defaultValue: 40,
          min: 0,
          max: 100,
          admin: {
            components: {
              Field: '@/components/admin/OpacitySliderField#OpacitySliderField',
            },
            description: 'Overlay opacity (0-100)',
          },
        },
        {
          name: 'cardHeight',
          type: 'number',
          defaultValue: 300,
          admin: { description: 'Card height in pixels' },
        },
      ],
    },
    // Bottom link
    {
      type: 'group',
      name: 'bottomLink',
      label: 'Bottom Link (View All)',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'label',
          type: 'text',
          defaultValue: 'View All',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
      ],
    },
    colorField('accentColor', 'Accent Border Color', '#3B82F6'),
    colorField('backgroundColor', 'Section Background Color', '#FFFFFF'),
  ],
}
