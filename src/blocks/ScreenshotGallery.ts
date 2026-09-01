import type { Block } from 'payload'
import { sectionHeadingFields, colorField } from './shared'

export const ScreenshotGallery: Block = {
  slug: 'screenshotGallery',
  labels: { singular: 'Screenshot Gallery', plural: 'Screenshot Galleries' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'screenshots',
      type: 'array',
      required: true,
      label: 'Screenshots',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          admin: { description: 'Title displayed below the screenshot' },
        },
        {
          name: 'caption',
          type: 'text',
          admin: { description: 'Short caption or description' },
        },
        {
          name: 'category',
          type: 'text',
          admin: { description: 'Category/module name (e.g. "Dashboard", "Reports")' },
        },
      ],
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
      name: 'enableLightbox',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Allow clicking to view full-size screenshot' },
    },
    {
      name: 'showDeviceFrame',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Wrap screenshots in a device frame (laptop/tablet)' },
    },
    {
      name: 'deviceType',
      type: 'select',
      defaultValue: 'laptop',
      options: [
        { label: 'Laptop', value: 'laptop' },
        { label: 'Tablet', value: 'tablet' },
        { label: 'Phone', value: 'phone' },
      ],
      admin: {
        condition: (_, siblingData) => siblingData?.showDeviceFrame,
      },
    },
    colorField('backgroundColor', 'Section Background Color', '#F9FAFB'),
  ],
}
