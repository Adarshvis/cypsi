import type { Block } from 'payload'
import { sectionHeadingFields, iconField, colorField } from './shared'

export const FeatureCards: Block = {
  slug: 'featureCards',
  labels: { singular: 'Feature Cards', plural: 'Feature Cards' },
  fields: [
    ...sectionHeadingFields,
    colorField('backgroundColor', 'Section Background Color', '#FFFFFF'),
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow Text',
      admin: {
        description: 'Small uppercase text above the heading (used in Service Cards layout)',
      },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      label: 'CTA Link Label',
      admin: {
        description: 'Link text shown next to heading (e.g. "Explore all services")',
      },
    },
    {
      name: 'ctaLink',
      type: 'text',
      label: 'CTA Link URL',
      admin: {
        description: 'URL for the CTA link',
      },
    },
    {
      name: 'cardLayout',
      type: 'select',
      defaultValue: 'classic',
      options: [
        { label: 'Classic', value: 'classic' },
        { label: 'Minimal', value: 'minimal' },
        { label: 'Split', value: 'split' },
        { label: 'Accent Top', value: 'accentTop' },
        { label: 'Service Cards', value: 'duccService' },
        { label: 'Service Detail (Alternating)', value: 'duccServiceDetail' },
        { label: 'Project Cards (Progress Bar)', value: 'duccProject' },
        { label: 'Training Cards', value: 'duccTraining' },
      ],
      admin: {
        description: 'Choose how cards should be displayed.',
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
      name: 'cardTheme',
      type: 'select',
      defaultValue: 'dark',
      label: 'Card Theme',
      options: [
        { label: 'Dark', value: 'dark' },
        { label: 'Light', value: 'light' },
      ],
      admin: {
        description: 'Dark: dark background with light text. Light: white cards with theme-colored icons and borders.',
        condition: (_, siblingData) => siblingData?.cardLayout === 'classic',
      },
    },
    {
      name: 'showCardNumbers',
      type: 'checkbox',
      defaultValue: false,
      label: 'Show Card Numbers',
      admin: {
        description: 'Show a faded number (01, 02, 03...) next to the icon on each card',
        condition: (_, siblingData) =>
          siblingData?.cardLayout === 'classic' && siblingData?.cardTheme === 'light',
      },
    },
    {
      name: 'showCardButton',
      type: 'checkbox',
      defaultValue: false,
      label: 'Show Card Button',
      admin: {
        description: 'Show a full-width button at the bottom of each card (uses Button Label / Button URL fields)',
        condition: (_, siblingData) =>
          siblingData?.cardLayout === 'classic' && siblingData?.cardTheme === 'light',
      },
    },
    {
      name: 'cards',
      type: 'array',
      fields: [
        iconField('icon', 'Card Icon'),
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Card Image',
          admin: {
            description: 'Optional image shown at the top of the card (used in Classic Light layout)',
          },
        },
        {
          name: 'title',
          type: 'richText',
          admin: {
            description: 'Optional card title (rich text supported).',
          },
        },
        {
          name: 'description',
          type: 'richText',
          admin: {
            description: 'Optional card description/details (rich text supported).',
          },
        },
        {
          name: 'link',
          type: 'text',
          admin: {
            description: 'Optional URL this card links to',
          },
        },
        {
          name: 'tag',
          type: 'text',
          admin: {
            description: 'Small tag label (e.g. "Platform", "Security") — used in Service Cards layout',
          },
        },
        {
          name: 'external',
          type: 'checkbox',
          defaultValue: false,
          label: 'External Link',
          admin: {
            description: 'Open link in new tab',
          },
        },
        {
          name: 'features',
          type: 'array',
          label: 'Feature Points',
          admin: {
            description: 'Bullet points for the Service Detail layout',
          },
          fields: [
            {
              name: 'text',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'buttonLabel',
          type: 'text',
          admin: {
            description: 'CTA button label (e.g. "Request Access")',
          },
        },
        {
          name: 'buttonUrl',
          type: 'text',
          admin: {
            description: 'CTA button URL',
          },
        },
        /* ── Project Card fields ── */
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Ongoing', value: 'ongoing' },
            { label: 'Active', value: 'active' },
            { label: 'Live', value: 'live' },
            { label: 'Completed', value: 'completed' },
            { label: 'Planned', value: 'planned' },
          ],
          admin: {
            description: 'Project status badge (used in Project Cards layout)',
          },
        },
        {
          name: 'progress',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Progress percentage 0-100 (used in Project Cards layout)',
          },
        },
        /* ── Training Card fields ── */
        {
          name: 'level',
          type: 'select',
          options: [
            { label: 'Beginner', value: 'Beginner' },
            { label: 'Intermediate', value: 'Intermediate' },
            { label: 'Advanced', value: 'Advanced' },
          ],
          admin: {
            description: 'Difficulty level (used in Training Cards layout)',
          },
        },
        {
          name: 'duration',
          type: 'text',
          admin: {
            description: 'e.g. "5 Days", "1 Day" (used in Training Cards layout)',
          },
        },
        {
          name: 'mode',
          type: 'text',
          admin: {
            description: 'e.g. "In-person", "Online", "Hybrid" (used in Training Cards layout)',
          },
        },
        {
          name: 'audience',
          type: 'text',
          admin: {
            description: 'e.g. "Faculty", "Students & Faculty" (used in Training Cards layout)',
          },
        },
        {
          name: 'date',
          type: 'date',
          admin: {
            description: 'Next batch date (used in Training Cards layout)',
          },
        },
      ],
    },
  ],
}
