import type { CollectionBeforeOperationHook, CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { hiddenUnlessSiteAdmin, siteAdminAccess } from '../access/roles'
import { MAX_RESUME_BYTES } from '../lib/requests/validateApplication'

const resumesUploadDir = process.env.CMS_RESUMES_UPLOAD_DIR || 'resumes'

/** Server-side size cap; Payload's upload config has no per-collection limit. */
const enforceMaxSize: CollectionBeforeOperationHook = ({ operation, req }) => {
  if (operation !== 'create' && operation !== 'update') return
  const size = req.file?.size
  if (typeof size === 'number' && size > MAX_RESUME_BYTES) {
    throw new APIError('Resume must be 5 MB or smaller.', 413)
  }
}

/**
 * Resume PDFs attached to internship applications.
 *
 * Unlike Documents, these are personal data, so reads are limited to site
 * admins. Payload serves `/api/resumes/file/:filename` through the collection's
 * read access, and the files live outside `public/`, so there is no other way
 * to download one. Nobody creates a resume directly: the only path is
 * `POST /api/apply`, which validates the file and writes with overrideAccess.
 */
export const Resumes: CollectionConfig = {
  slug: 'resumes',
  labels: {
    singular: 'Resume',
    plural: 'Resumes',
  },
  admin: {
    // Out of the sidebar and dashboard cards; managed from the Requests Dashboard.
    // Routes stay available, so the dashboard's links and downloads keep working.
    group: false,
    description: 'Resume PDFs uploaded with internship applications.',
    defaultColumns: ['filename', 'applicantName', 'filesize', 'createdAt'],
    hidden: hiddenUnlessSiteAdmin,
  },
  access: {
    // Created only by /api/apply (overrideAccess), never through REST or the admin.
    create: () => false,
    read: siteAdminAccess,
    update: siteAdminAccess,
    delete: siteAdminAccess,
  },
  hooks: {
    beforeOperation: [enforceMaxSize],
  },
  upload: {
    staticDir: resumesUploadDir,
    mimeTypes: ['application/pdf'],
  },
  fields: [
    {
      name: 'applicantName',
      type: 'text',
      maxLength: 120,
      admin: {
        description: 'Name of the applicant who uploaded this resume',
      },
    },
  ],
}
