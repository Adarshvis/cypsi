import type { Block } from 'payload'
import { colorField, iconField } from './shared'

/**
 * A two-column "our story" section: narrative plus a vertical milestone
 * timeline on one side, supporting image with highlight cards on the other.
 *
 * Replaces what previously took four stacked blocks (content+media, two
 * feature-card grids and a lone button row), which read as unrelated bands.
 */
export const StoryTimeline: Block = {
  slug: 'storyTimeline',
  labels: { singular: 'Story / Timeline', plural: 'Story / Timeline' },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      admin: { description: 'Small label above the heading (e.g. "About Us")' },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
      admin: { description: 'Intro paragraph shown under the heading' },
    },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'right',
      options: [
        { label: 'Image on Right', value: 'right' },
        { label: 'Image on Left', value: 'left' },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Supporting image, shown above the highlight cards' },
    },
    {
      name: 'timeline',
      type: 'array',
      label: 'Milestones',
      admin: {
        description: 'Rendered as a vertical timeline with connected markers',
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        iconField('icon', 'Marker Icon (optional)'),
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'ctaLabel',
          type: 'text',
          label: 'Button Label',
          admin: {
            width: '50%',
            description: 'Appears as the final node of the timeline',
          },
        },
        {
          name: 'ctaUrl',
          type: 'text',
          label: 'Button URL',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'highlightCards',
      type: 'array',
      label: 'Highlight Cards',
      maxRows: 4,
      admin: {
        description: 'Shown beneath the image, e.g. Mission and Vision',
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
    colorField('backgroundColor', 'Section Background Color', '#e6edf0'),
  ],
}
