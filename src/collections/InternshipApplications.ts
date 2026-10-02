import type {
  CollectionBeforeChangeHook,
  CollectionBeforeDeleteHook,
  CollectionConfig,
} from 'payload'
import { hiddenUnlessSiteAdmin, siteAdminAccess } from '../access/roles'
import { INTERNSHIP_STATUSES } from '../lib/requests/statuses'

/**
 * On create the server owns `status` and `submittedAt`: every application
 * starts as `new`, whoever creates it. Public submissions arrive through
 * /api/apply, which has no user.
 */
const setServerFields: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (operation !== 'create') return data
  data.status = 'new'
  data.submittedAt = new Date().toISOString()
  return data
}

/** Removes the linked resume so deleting an application leaves no orphan PDF. */
const deleteLinkedResume: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const doc = await req.payload.findByID({
    collection: 'internship-applications',
    id,
    depth: 0,
    req,
    // Already authorized: this hook only runs once the delete itself was allowed.
    overrideAccess: true,
  })
  const resume = doc?.resume
  const resumeId = resume && typeof resume === 'object' ? resume.id : resume
  if (resumeId === null || resumeId === undefined) return

  await req.payload.delete({
    collection: 'resumes',
    id: resumeId,
    req,
    // Same reason as above: the application delete was already authorized.
    overrideAccess: true,
  })
}

/**
 * Internship applications from the public site (Requests Dashboard, first tab).
 *
 * Personal data, so everything is site-admin only, like form submissions.
 * Visitors do not write here through REST: `POST /api/apply` validates the
 * input and creates the document with overrideAccess. `create` stays open to
 * site admins so an application received by other means can be added by hand.
 */
export const InternshipApplications: CollectionConfig = {
  slug: 'internship-applications',
  labels: {
    singular: 'Internship Application',
    plural: 'Internship Applications',
  },
  admin: {
    useAsTitle: 'name',
    // Out of the sidebar and dashboard cards; managed from the Requests Dashboard.
    // Routes stay available, so the dashboard's links and downloads keep working.
    group: false,
    defaultColumns: ['name', 'email', 'domain', 'status', 'submittedAt'],
    description:
      'Applications submitted through internship apply forms. Also listed in the Requests Dashboard on the admin home page.',
    hidden: hiddenUnlessSiteAdmin,
  },
  access: {
    create: siteAdminAccess,
    read: siteAdminAccess,
    update: siteAdminAccess,
    delete: siteAdminAccess,
  },
  hooks: {
    beforeChange: [setServerFields],
    beforeDelete: [deleteLinkedResume],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
      required: true,
      maxLength: 120,
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone',
      maxLength: 30,
    },
    {
      name: 'domain',
      type: 'text',
      label: 'Domain',
      required: true,
      maxLength: 200,
      admin: {
        description: 'The internship domain applied for.',
      },
    },
    {
      name: 'institution',
      type: 'text',
      label: 'College / University',
      maxLength: 200,
    },
    {
      name: 'yearOrSemester',
      type: 'text',
      label: 'Year / Semester',
      maxLength: 50,
    },
    {
      name: 'resume',
      type: 'upload',
      label: 'Resume',
      relationTo: 'resumes',
      admin: {
        readOnly: true,
        description: 'The PDF uploaded with the application.',
      },
    },
    {
      name: 'extraFields',
      type: 'json',
      label: 'Other Answers',
      admin: {
        readOnly: true,
        description: 'Every other field from the form; included in exports.',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'new',
      required: true,
      options: INTERNSHIP_STATUSES.map((s) => ({ ...s })),
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      label: 'Submitted At',
      access: {
        update: () => false,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
}
