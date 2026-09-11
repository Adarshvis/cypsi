import type { Block } from 'payload'
import { sectionHeadingFields, colorField } from './shared'

/**
 * A list of downloadable documents, each with a View and a Download action.
 *
 * Files come from the `documents` collection so the same document can be listed
 * on more than one page without being uploaded twice, and so replacing a file
 * updates every page that links to it.
 */
export const DocumentDownloads: Block = {
  slug: 'documentDownloads',
  labels: { singular: 'Document Downloads', plural: 'Document Downloads' },
  fields: [
    ...sectionHeadingFields,
    colorField('backgroundColor', 'Section Background Color', '#FFFFFF'),
    {
      type: 'row',
      fields: [
        {
          name: 'layout',
          type: 'select',
          defaultValue: 'rows',
          admin: { width: '50%' },
          options: [
            { label: 'Rows (one per line)', value: 'rows' },
            { label: 'Two Columns', value: 'twoColumn' },
          ],
        },
        {
          name: 'showFileMeta',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show File Type and Size',
          admin: {
            width: '50%',
            description: 'Adds a small "PDF · 240 KB" line so readers know what they are opening.',
          },
        },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Document', plural: 'Documents' },
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'documents',
          required: true,
          admin: {
            description: 'Pick an existing document or upload a new one.',
          },
        },
        {
          name: 'label',
          type: 'text',
          admin: {
            description: "Optional. Overrides the document's own title for this list only.",
          },
        },
        {
          name: 'description',
          type: 'text',
          admin: {
            description: "Optional. Overrides the document's own summary for this list only.",
          },
        },
      ],
    },
  ],
}
