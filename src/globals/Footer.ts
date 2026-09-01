import type { GlobalConfig } from 'payload'
import { publicAccess, adminAccess } from '../access/roles'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  access: {
    read: publicAccess,
    update: adminAccess,
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      label: 'Footer Columns',
      maxRows: 4,
      fields: [
        {
          name: 'heading',
          type: 'text',
        },
        {
          name: 'links',
          type: 'array',
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
              name: 'newTab',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
      ],
    },

    // ── Footer Logos ──
    {
      type: 'group',
      name: 'logos',
      label: 'Footer Logos',
      fields: [
        {
          name: 'leftLogo',
          type: 'upload',
          relationTo: 'media',
          label: 'Left Logo',
          admin: {
            description: 'e.g. Ministry of Education logo (displayed on the left)',
          },
        },
        {
          name: 'rightLogo',
          type: 'upload',
          relationTo: 'media',
          label: 'Right Logo',
          admin: {
            description: 'e.g. Organisation logo (displayed on the right)',
          },
        },
      ],
    },

    // ── Contact Info ──
    {
      type: 'group',
      name: 'contactInfo',
      label: 'Contact Information',
      fields: [
        {
          name: 'address',
          type: 'textarea',
          admin: {
            description: 'Physical address shown in the footer',
            placeholder: 'e.g. Block C, Ministry of Education, Shastri Bhawan, New Delhi – 110001',
          },
        },
        {
          name: 'email',
          type: 'email',
          admin: {
            description: 'Contact email shown in the footer',
            placeholder: 'e.g. contact@example.org',
          },
        },
        {
          name: 'phone',
          type: 'text',
          admin: {
            description: 'Phone number shown in the footer',
            placeholder: 'e.g. +91-11-23381426',
          },
        },
      ],
    },

    {
      name: 'copyrightText',
      type: 'text',
      admin: {
        description: 'e.g. "© 2025 Your Organization. All rights reserved."',
      },
    },
    {
      name: 'showSocialLinks',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Display social links from Site Settings',
      },
    },
    // New fields
    {
      type: 'group',
      name: 'lastUpdated',
      label: 'Last Updated Info',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Show "Last Updated" date in the footer' },
        },
        {
          name: 'label',
          type: 'text',
          defaultValue: 'Last Updated',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: 'date',
          type: 'date',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
            description: 'Leave blank to auto-display current date',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'visitorCount',
      label: 'Visitor Count',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Show visitor count in the footer' },
        },
        {
          name: 'label',
          type: 'text',
          defaultValue: 'Total Visitors',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: 'count',
          type: 'number',
          defaultValue: 0,
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
            description: 'Manually set visitor count (or integrate with analytics)',
          },
        },
      ],
    },
  ],
}
