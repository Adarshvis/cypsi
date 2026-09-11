import type { CollectionConfig } from 'payload'
import { collectionWriteAccess, publicAccess, siteAdminAccess } from '../access/roles'

/**
 * Uploaded documents: reports, forms, notices and the like.
 *
 * Kept separate from Media rather than sharing it, for two reasons:
 *
 *   - The image optimizer plugin is bound to `media` and would try to convert
 *     every upload to WebP, which is meaningless for a PDF.
 *   - `media.alt` is required, and alt text does not apply to a file download.
 *
 * Allowed types are listed explicitly. HTML and SVG are deliberately absent:
 * both can carry script, and uploads are served from this origin, so accepting
 * them would let anyone who can upload run script on the site.
 */
export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: { singular: 'Document', plural: 'Documents' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'filename', 'mimeType', 'filesize', 'updatedAt'],
    group: 'Content',
    description: 'PDFs, Word, Excel and PowerPoint files offered for download.',
  },
  access: {
    // Downloads are public; the block that lists them is on public pages.
    read: publicAccess,
    create: collectionWriteAccess('documents'),
    update: collectionWriteAccess('documents'),
    delete: siteAdminAccess,
  },
  upload: {
    staticDir: 'documents',
    mimeTypes: [
      'application/pdf',
      // Word
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Excel
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // PowerPoint
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // Open Document
      'application/vnd.oasis.opendocument.text',
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/vnd.oasis.opendocument.presentation',
      // Plain data
      'text/csv',
      'text/plain',
      /*
       * Container types, needed for real Office files to upload at all.
       *
       * Payload inspects the bytes and uses what it detects, ignoring the type
       * the browser reported. Modern Office formats are zip archives and older
       * ones are Compound File Binary, so a .docx often arrives as
       * `application/zip` and a .doc as `application/x-cfb`. Without these two,
       * genuine Word and Excel uploads are refused.
       *
       * Accepting them is a small widening — an arbitrary zip could be uploaded
       * — but a zip or CFB file is only ever downloaded, never executed by the
       * browser, unlike the HTML and SVG that stay excluded.
       */
      'application/zip',
      'application/x-cfb',
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description:
          'Shown in the download list. Give it the name a reader should see, not the filename.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Optional one-line summary shown under the title.' },
    },
  ],
}
