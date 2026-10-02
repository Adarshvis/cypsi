import { postgresAdapter } from '@payloadcms/db-postgres'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { imageOptimizer } from '@inoo-ch/payload-image-optimizer'
import {
  AlignFeature,
  lexicalEditor,
  EXPERIMENTAL_TableFeature,
  TextStateFeature,
} from '@payloadcms/richtext-lexical'
import { HighlightColorFeature, TextColorFeature } from 'payloadcms-lexical-ext'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Invitations } from './collections/Invitations'
import { Media } from './collections/Media'
import { Documents } from './collections/Documents'
import { Pages } from './collections/Pages'
import { News } from './collections/News'
import { BlogPosts } from './collections/BlogPosts'
import { Publications } from './collections/Publications'
import { ResearchDomains } from './collections/ResearchDomains'
import { WorkWithUs } from './collections/WorkWithUs'
import { TeamPage } from './collections/TeamPage'
import { Resumes } from './collections/Resumes'
import { InternshipApplications } from './collections/InternshipApplications'
import { SiteSettings } from './globals/SiteSettings'
import { Header } from './globals/Header'
import { Footer } from './globals/Footer'
import { hiddenUnlessSiteAdmin, publicAccess, siteAdminAccess } from './access/roles'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { getSmtpConfig } from './lib/email/config'
import { ENQUIRY_STATUSES } from './lib/requests/statuses'

/**
 * Builds the email adapter from environment configuration.
 *
 * Returns undefined when SMTP is not configured, so a developer without
 * credentials still gets a working app with mail logged to the console.
 */
function buildEmailAdapter() {
  const smtp = getSmtpConfig()
  if (!smtp) return undefined

  return nodemailerAdapter({
    defaultFromAddress: smtp.senderEmail,
    // Payload requires a name here. The invitation emails set their own From
    // header from Site Settings; this covers Payload's built-in messages.
    defaultFromName: process.env.SMTP_SENDER_NAME?.trim() || smtp.senderEmail,
    transportOptions: {
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.pass },
      // Certificate verification stays enabled; see lib/email/sendEmail.ts.
      tls: { minVersion: 'TLSv1.2' },
    },
  })
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const databaseUrl = process.env.CMS_DATABASE_URL || ''

function maskDatabaseUrl(value: string): string {
  if (!value) return '<empty>'

  try {
    const parsed = new URL(value)
    const user = parsed.username || '<user>'
    const host = parsed.hostname || '<host>'
    const port = parsed.port || '<port>'
    const dbName = parsed.pathname?.replace(/^\//, '') || '<db>'
    return `${parsed.protocol}//${user}:***@${host}:${port}/${dbName}`
  } catch {
    return '<invalid-url>'
  }
}

export default buildConfig({
  onInit: async (payload) => {
    payload.logger.info('[DB] Payload initialized')
    payload.logger.info(`[DB] CMS_DATABASE_URL=${maskDatabaseUrl(databaseUrl)}`)
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      // Requests Dashboard (internship applications + contact enquiries).
      // Renders only for Super Admins and Admins.
      afterDashboard: ['@/components/admin/RequestsDashboard/RequestsDashboard#RequestsDashboard'],
    },
  },
  collections: [
    Users,
    Invitations,
    Media,
    Documents,
    Pages,
    News,
    BlogPosts,
    Publications,
    ResearchDomains,
    WorkWithUs,
    TeamPage,
    Resumes,
    InternshipApplications,
  ],
  globals: [SiteSettings, Header, Footer],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      AlignFeature(),
      TextStateFeature({
        state: {
          fontSize: {
            sm: { label: 'Small', css: { 'font-size': '0.875rem' } },
            base: { label: 'Normal', css: { 'font-size': '1rem' } },
            lg: { label: 'Large', css: { 'font-size': '1.125rem' } },
            xl: { label: 'XL', css: { 'font-size': '1.25rem' } },
            '2xl': { label: '2XL', css: { 'font-size': '1.5rem' } },
          },
        },
      }),
      TextColorFeature(),
      HighlightColorFeature(),
      EXPERIMENTAL_TableFeature(),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  /*
   * Registered so Payload's own transactional mail — notably the forgot-password
   * flow — actually sends. Without an adapter Payload logs the message to the
   * console and reports success, so a password reset appears to work and never
   * arrives. Left undefined when SMTP is unconfigured, which restores that
   * console behaviour rather than crashing at boot.
   */
  email: buildEmailAdapter(),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl,
    },
    // Off in normal operation. Only enabled by scripts/push-scratch.mts, which
    // points at a throwaway copy of the database to derive additive DDL.
    push: process.env.CMS_DB_PUSH === 'true',
  }),
  sharp,
  plugins: [
    formBuilderPlugin({
      redirectRelationships: ['pages'],
      fields: {
        // A PDF upload for internship application forms. A form that contains
        // one is submitted to /api/apply (Internship Applications) instead of
        // /api/form-submissions.
        resumeUpload: {
          slug: 'resumeUpload',
          labels: {
            singular: 'Resume Upload',
            plural: 'Resume Upload Fields',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  label: 'Name (lowercase, no special characters)',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'label',
                  type: 'text',
                  label: 'Label',
                  localized: true,
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'accept',
                  type: 'text',
                  label: 'Accepted MIME Types',
                  defaultValue: 'application/pdf',
                  admin: {
                    width: '50%',
                    description: 'Comma-separated list, e.g. application/pdf,image/*',
                  },
                },
                {
                  name: 'maxSizeMB',
                  type: 'number',
                  label: 'Max File Size (MB)',
                  defaultValue: 5,
                  min: 1,
                  // The server accepts at most 5 MB, so a higher limit here would only mislead.
                  max: 5,
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'helperText',
              type: 'text',
              label: 'Helper Text',
              defaultValue: 'Only PDF files accepted. Maximum size: 5 MB.',
            },
            {
              name: 'required',
              type: 'checkbox',
              label: 'Required',
              defaultValue: true,
            },
          ],
          // Cast: the plugin accepts a whole custom block here at runtime, but its
          // FieldConfig type only describes overrides of the built-in fields.
        } as never,
        payment: false,
      },
      formOverrides: {
        fields: ({ defaultFields }) => {
          return [
            ...defaultFields.map((field) => {
              if ('name' in field && field.name === 'title') {
                return {
                  ...field,
                  required: false,
                }
              }

              return field
            }),
            {
              name: 'showInContactEnquiries',
              type: 'checkbox',
              label: 'Show submissions in Contact Enquiries',
              defaultValue: false,
              admin: {
                position: 'sidebar',
                description:
                  'List this form’s submissions in the Contact Enquiries tab of the Requests Dashboard.',
              },
            },
          ]
        },
        admin: {
          // Not in the sidebar or dashboard cards; pages still reachable by URL
          // (/admin/collections/forms) for site admins.
          group: false,
          hidden: hiddenUnlessSiteAdmin,
        },
        access: {
          // The public site loads form definitions to render them.
          read: publicAccess,
          create: siteAdminAccess,
          update: siteAdminAccess,
          delete: siteAdminAccess,
        },
      },
      formSubmissionOverrides: {
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: 'status',
            type: 'select',
            label: 'Status',
            options: ENQUIRY_STATUSES.map((s) => ({ ...s })),
            defaultValue: 'new',
            required: true,
            admin: {
              position: 'sidebar',
              description: 'Used by the Contact Enquiries tab of the Requests Dashboard.',
            },
          },
        ],
        hooks: {
          beforeChange: [
            // Submissions are created publicly, so a visitor must not pick the status.
            ({ data, operation }) => {
              if (operation === 'create') data.status = 'new'
              return data
            },
          ],
        },
        admin: {
          // Not in the sidebar or dashboard cards; pages still reachable by URL
          // (/admin/collections/forms) for site admins.
          group: false,
          hidden: hiddenUnlessSiteAdmin,
        },
        access: {
          // Visitors submit forms; only site admins may read what was sent (PII).
          create: publicAccess,
          read: siteAdminAccess,
          update: siteAdminAccess,
          delete: siteAdminAccess,
        },
      },
    }),
    imageOptimizer({
      collections: {
        media: true,
      },
      format: { format: 'webp', quality: 85 },
      maxDimensions: { width: 2560, height: 2560 },
      generateThumbHash: true,
      stripMetadata: true,
      clientOptimization: true,
    }),
  ],
})
