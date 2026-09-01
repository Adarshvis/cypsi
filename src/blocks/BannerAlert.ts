import type { Block } from 'payload'
import { sectionHeadingFields } from './shared'

export const BannerAlert: Block = {
  slug: 'bannerAlert',
  labels: { singular: 'Banner / Alert', plural: 'Banners / Alerts' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'type',
      type: 'select',
      defaultValue: 'info',
      required: true,
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Success', value: 'success' },
        { label: 'Warning', value: 'warning' },
        { label: 'Error', value: 'error' },
      ],
    },
    {
      name: 'message',
      type: 'text',
      required: true,
    },
    {
      name: 'dismissible',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      type: 'group',
      name: 'link',
      label: 'Optional Link',
      fields: [
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'url',
          type: 'text',
        },
      ],
    },
  ],
}
