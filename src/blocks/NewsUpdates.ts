import type { Block } from 'payload'
import { sectionHeadingFields, iconField, colorField } from './shared'

export const NewsUpdates: Block = {
  slug: 'newsUpdates',
  labels: { singular: 'News & Updates', plural: 'News & Updates' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'cards',
      required: true,
      options: [
        { label: 'News Cards Grid', value: 'cards' },
        { label: 'Spotlight (featured + side list)', value: 'spotlight' },
        { label: 'Card Grid (Gold Badges)', value: 'duccCards' },
      ],
      admin: {
        description: 'Choose between a card grid or a featured spotlight layout',
      },
    },
    {
      name: 'entryType',
      type: 'select',
      defaultValue: 'manual',
      required: true,
      label: 'News Source',
      options: [
        { label: 'Manual Entry', value: 'manual' },
        { label: 'Fetch from News Collection', value: 'collection' },
      ],
      admin: {
        description: 'Choose manual card entry or automatic fetch from News collection.',
      },
    },
    {
      name: 'articles',
      type: 'array',
      required: false,
      label: 'Articles',
      admin: {
        condition: (_, siblingData) => siblingData?.entryType !== 'collection',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'excerpt',
          type: 'textarea',
          admin: { description: 'Short summary or excerpt' },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'category',
          type: 'text',
          admin: { description: 'Category label (e.g. "Update", "Press Release", "Event")' },
        },
        {
          name: 'date',
          type: 'date',
          admin: { description: 'Published date' },
        },
        {
          name: 'url',
          type: 'text',
          admin: { description: 'Link to the full article' },
        },
        iconField('icon', 'Category Icon'),
        colorField('categoryColor', 'Category Badge Color', '#3B82F6'),
      ],
    },
    {
      name: 'collectionSource',
      type: 'group',
      label: 'Collection Fetch Settings',
      admin: {
        condition: (_, siblingData) => siblingData?.entryType === 'collection',
      },
      fields: [
        {
          name: 'limit',
          type: 'number',
          defaultValue: 6,
          min: 1,
          max: 24,
          required: true,
          admin: {
            description: 'Maximum number of cards to fetch',
          },
        },
        {
          name: 'sortBy',
          type: 'select',
          defaultValue: 'latest',
          options: [
            { label: 'Latest First', value: 'latest' },
            { label: 'Oldest First', value: 'oldest' },
          ],
        },
        {
          name: 'category',
          type: 'text',
          admin: {
            description: 'Optional category filter (exact match)',
          },
        },
        {
          name: 'featuredOnly',
          type: 'checkbox',
          defaultValue: false,
          label: 'Fetch only featured news',
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
      ],
      admin: {
        condition: (_, siblingData) => siblingData?.layout === 'cards',
      },
    },
    {
      type: 'group',
      name: 'bottomLink',
      label: 'View All Link',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'label',
          type: 'text',
          defaultValue: 'View All News',
          admin: { condition: (_, siblingData) => siblingData?.enabled },
        },
        {
          name: 'url',
          type: 'text',
          admin: { condition: (_, siblingData) => siblingData?.enabled },
        },
      ],
    },
    colorField('backgroundColor', 'Section Background Color', '#F9FAFB'),
  ],
}
