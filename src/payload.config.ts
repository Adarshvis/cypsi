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
import { SiteSettings } from './globals/SiteSettings'
import { Header } from './globals/Header'
import { Footer } from './globals/Footer'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { getSmtpConfig } from './lib/email/config'

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
        payment: false,
      },
      formOverrides: {
        fields: ({ defaultFields }) => {
          return defaultFields.map((field) => {
            if ('name' in field && field.name === 'title') {
              return {
                ...field,
                required: false,
              }
            }

            return field
          })
        },
        admin: {
          hidden: true,
        },
      },
      formSubmissionOverrides: {
        admin: {
          hidden: true,
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
