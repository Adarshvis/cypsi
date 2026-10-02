import type { Block } from 'payload'
import { colorField } from './shared'

/**
 * Project showcase: a sticky intro panel with category filters on one side,
 * and a stacked list of detailed project entries on the other (screenshot in a
 * browser frame, description, tags, a deliverables card and a link).
 *
 * Filters are built from the projects' own categories, so adding a project
 * with a new category adds its filter automatically.
 */
export const ProjectShowcase: Block = {
  slug: 'projectShowcase',
  labels: { singular: 'Project Showcase', plural: 'Project Showcases' },
  fields: [
    /* ── Intro panel ── */
    {
      type: 'collapsible',
      label: 'Intro Panel',
      fields: [
        { name: 'eyebrow', type: 'text', admin: { description: 'Optional small label above the heading.' } },
        { name: 'heading', type: 'text', required: true },
        {
          name: 'headingHighlight',
          type: 'text',
          admin: {
            description:
              'Optional word or phrase from the heading to show in italic accent colour, e.g. "impact". Must match the heading text exactly.',
          },
        },
        { name: 'description', type: 'textarea' },
        {
          type: 'row',
          fields: [
            { name: 'filterLabel', type: 'text', defaultValue: 'Filter by area', admin: { width: '50%' } },
            { name: 'allLabel', type: 'text', defaultValue: 'All', admin: { width: '50%', description: 'Label of the "show everything" filter.' } },
          ],
        },
        {
          name: 'scrollHint',
          type: 'text',
          defaultValue: 'Scroll to explore projects',
          admin: { description: 'Shown at the bottom of the intro panel on large screens. Leave empty to hide.' },
        },
      ],
    },

    /* ── Labels shared by every project ── */
    {
      type: 'collapsible',
      label: 'Project Labels',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'clientLabel', type: 'text', defaultValue: 'Partner', admin: { width: '33%', description: 'e.g. Client, Partner, Funded by' } },
            { name: 'deliverablesHeading', type: 'text', defaultValue: 'What we delivered', admin: { width: '33%' } },
            { name: 'linkLabel', type: 'text', defaultValue: 'Visit project', admin: { width: '33%' } },
          ],
        },
      ],
    },

    /* ── Projects ── */
    {
      name: 'projects',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        initCollapsed: true,
        components: { RowLabel: '@/components/admin/ProjectRowLabel#ProjectRowLabel' },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'category',
              type: 'text',
              required: true,
              admin: {
                width: '50%',
                description: 'Used for the filters, e.g. "Digital Learning". Projects with the same text share a filter.',
              },
            },
            {
              name: 'categoryIcon',
              type: 'text',
              label: 'Category Icon',
              admin: {
                width: '50%',
                components: { Field: '@/components/admin/IconPickerField#IconPickerField' },
                description: 'Optional Lucide icon shown next to the category.',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'client', type: 'text', admin: { width: '50%', description: 'Client, partner or sponsor name.' } },
            { name: 'title', type: 'text', required: true, admin: { width: '50%', description: 'Short tagline shown large.' } },
          ],
        },
        { name: 'image', type: 'upload', relationTo: 'media' },
        {
          type: 'row',
          fields: [
            {
              name: 'imageFrame',
              type: 'select',
              defaultValue: 'browser',
              options: [
                { label: 'Browser window (for websites / apps)', value: 'browser' },
                { label: 'Plain image', value: 'plain' },
              ],
              admin: { width: '50%' },
            },
            {
              name: 'cardColor',
              type: 'text',
              label: 'Card Tint',
              admin: {
                width: '50%',
                components: { Field: '@/components/admin/ColorPickerField#ColorPickerField' },
                description: 'Background tint behind the image. Leave empty to use the theme colour.',
              },
            },
          ],
        },
        { name: 'description', type: 'textarea' },
        {
          name: 'tags',
          type: 'array',
          labels: { singular: 'Tag', plural: 'Tags' },
          fields: [{ name: 'label', type: 'text', required: true }],
        },
        {
          name: 'deliverables',
          type: 'array',
          labels: { singular: 'Deliverable', plural: 'Deliverables' },
          fields: [{ name: 'item', type: 'text', required: true }],
        },
        {
          type: 'row',
          fields: [
            { name: 'link', type: 'text', admin: { width: '50%', description: 'Project website or detail page. Leave empty to hide the button.' } },
            {
              name: 'displayUrl',
              type: 'text',
              admin: { width: '50%', description: 'Text in the browser address bar. Defaults to the link\u2019s domain.' },
            },
          ],
        },
      ],
    },

    colorField('backgroundColor', 'Section Background Color', ''),
  ],
}
