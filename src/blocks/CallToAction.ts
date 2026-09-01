import type { Block } from 'payload'
import { sectionHeadingFields } from './shared'

export const CallToAction: Block = {
  slug: 'callToAction',
  labels: { singular: 'Call to Action', plural: 'Calls to Action' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Full-Width Banner (Gradient Card)', value: 'duccBanner' },
      ],
      admin: {
        description: 'Choose visual style for this CTA block',
      },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      admin: { description: 'CTA headline text' },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'CTA description text' },
    },
    {
      name: 'buttons',
      type: 'array',
      maxRows: 2,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Outline', value: 'outline' },
          ],
        },
      ],
    },
    {
      name: 'backgroundType',
      type: 'select',
      defaultValue: 'color',
      options: [
        { label: 'Color', value: 'color' },
        { label: 'Image', value: 'image' },
      ],
    },
    {
      name: 'backgroundColor',
      type: 'text',
      defaultValue: '#1E40AF',
      admin: {
        condition: (_, siblingData) => siblingData?.backgroundType === 'color',
        components: {
          Field: '@/components/admin/ColorPickerField#ColorPickerField',
        },
        description: 'Pick background color',
      },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_, siblingData) => siblingData?.backgroundType === 'image',
      },
    },
  ],
}
