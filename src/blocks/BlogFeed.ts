import type { Block } from 'payload'
import { colorField, sectionHeadingFields } from './shared'

/** Latest published blog posts, for the home page or any page. */
export const BlogFeed: Block = {
  slug: 'blogFeed',
  labels: { singular: 'Blog Posts', plural: 'Blog Posts' },
  fields: [
    ...sectionHeadingFields,
    {
      type: 'row',
      fields: [
        {
          name: 'limit',
          type: 'number',
          label: 'Number of posts',
          defaultValue: 3,
          min: 1,
          max: 12,
          admin: { width: '33%' },
        },
        {
          name: 'category',
          type: 'text',
          admin: { width: '33%', description: 'Optional. Only posts with exactly this category.' },
        },
        {
          name: 'featuredOnly',
          type: 'checkbox',
          label: 'Featured posts only',
          defaultValue: false,
          admin: { width: '33%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'linkLabel', type: 'text', defaultValue: 'View all posts', admin: { width: '50%' } },
        { name: 'linkUrl', type: 'text', defaultValue: '/blog', admin: { width: '50%' } },
      ],
    },
    colorField('backgroundColor', 'Section Background Color', ''),
  ],
}
