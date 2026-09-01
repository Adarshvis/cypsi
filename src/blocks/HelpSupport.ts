import type { Block } from 'payload'
import { sectionHeadingFields, iconField, colorField } from './shared'

export const HelpSupport: Block = {
  slug: 'helpSupport',
  labels: { singular: 'Help & Support', plural: 'Help & Support' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'sideBySide',
      options: [
        { label: 'Side by Side (helpdesk + video)', value: 'sideBySide' },
        { label: 'Stacked (cards above, video below)', value: 'stacked' },
      ],
    },
    // Helpdesk cards
    {
      name: 'supportCards',
      type: 'array',
      label: 'Support Cards',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: { description: 'e.g. "Technical Support", "Training Resources"' },
        },
        {
          name: 'description',
          type: 'textarea',
        },
        iconField('icon', 'Card Icon'),
        colorField('iconColor', 'Icon Color', '#3B82F6'),
        {
          name: 'buttonLabel',
          type: 'text',
          admin: { description: 'e.g. "Contact Support", "View Resources"' },
        },
        {
          name: 'buttonUrl',
          type: 'text',
        },
      ],
    },
    // Video embed
    {
      type: 'group',
      name: 'video',
      label: 'Video Section',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Video section title (e.g. "How to Get Started")',
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: 'videoUrl',
          type: 'text',
          admin: {
            description: 'YouTube or Vimeo URL',
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: 'poster',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Thumbnail/poster image for the video',
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: 'uploadedVideo',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Or upload a video file directly',
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
      ],
    },
    colorField('backgroundColor', 'Section Background Color', '#FFFFFF'),
    colorField('cardBgColor', 'Card Background Color', '#F9FAFB'),
  ],
}
