import type { Block } from 'payload'

export const FormLayout: Block = {
  slug: 'formLayout',
  labels: { singular: 'Form', plural: 'Forms' },
  fields: [
    {
      name: 'sectionHeading',
      type: 'text',
      admin: {
        description: 'Section heading displayed above this block',
      },
    },
    {
      name: 'sectionDescription',
      type: 'richText',
      admin: {
        description: 'Optional rich-text description below the heading',
      },
    },
    {
      name: 'headingAlignment',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      admin: {
        description: 'Select a Form Builder form to display in this section.',
      },
    },
    {
      name: 'maxWidth',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Narrow (640px)', value: 'narrow' },
        { label: 'Medium (768px)', value: 'medium' },
        { label: 'Wide (1024px)', value: 'wide' },
        { label: 'Full Width', value: 'full' },
      ],
    },
  ],
}
