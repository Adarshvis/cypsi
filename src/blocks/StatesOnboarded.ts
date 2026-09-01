import type { Block } from 'payload'

export const StatesOnboarded: Block = {
  slug: 'statesOnboarded',
  labels: {
    singular: 'States Onboarded Section',
    plural: 'States Onboarded Sections',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'States Powered by Our Platform',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional descriptive text below the heading',
      },
    },
    {
      name: 'states',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Add the states that are currently onboarded',
      },
      fields: [
        {
          name: 'stateName',
          type: 'text',
          required: true,
          admin: {
            description: 'E.g., Maharashtra',
          },
        },
        {
          name: 'portalUrl',
          type: 'text',
          required: true,
          admin: {
            description: 'Link to this state\'s portal (e.g., https://portal.example.in)',
          },
        },
        {
          name: 'tagline',
          type: 'text',
          admin: {
            description: 'Optional short tagline (e.g., Active Since 2026)',
          },
        },
        {
          name: 'themeColor',
          type: 'text',
          defaultValue: '#1e3a5f',
          admin: {
            description: 'Pick the theme color for the state card highlight and button',
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
          },
        },
        {
          name: 'imageOpacity',
          type: 'number',
          defaultValue: 60,
          min: 0,
          max: 100,
          admin: {
            description: 'Opacity of the background image (0 to 100)',
          },
        },
        {
          name: 'backgroundImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Optional subtle background image or map outline SVG for this card',
          },
        },
      ],
    },
  ],
}
