import type { CollectionConfig } from 'payload'
import crypto from 'crypto'
import {
  adminAccess,
  authorAssignableCollections,
  isSiteAdmin,
  siteAdminAccess,
} from '../access/roles'
import { sendEmail, isEmailConfigured, missingSmtpVars } from '../lib/email/sendEmail'
import { getPublicUrl } from '../lib/email/config'
import { invitationEmail, invitationSubject } from '../lib/email/templates'

/** 32 random bytes is well beyond guessing range for a 7-day link. */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

const EXPIRY_DAYS = 7

function getExpiryDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + EXPIRY_DAYS)
  return date.toISOString()
}

/** Roles that may be handed out by invitation. Super Admin deliberately is not. */
const INVITABLE_ROLES = [
  { label: 'Author — edit only assigned collections', value: 'author' },
  { label: 'Content Editor — create and edit all content', value: 'content_editor' },
  { label: 'Admin — full access to content and settings', value: 'admin' },
  { label: 'Viewer — read only', value: 'viewer' },
]

export const Invitations: CollectionConfig = {
  slug: 'invitations',
  labels: { singular: 'Invitation', plural: 'Invitations' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'status', 'createdAt', 'expiresAt'],
    group: 'Admin',
    description:
      'Invite someone to help manage content. Saving a new invitation emails them a link to set their own password.',
    hidden: ({ user }) => !isSiteAdmin(user),
  },
  access: {
    /*
     * Site admins manage invitations. Read is restricted along with the rest
     * because the document holds the invite token: anyone who can read it could
     * claim the invitation and create the account themselves.
     */
    create: siteAdminAccess,
    read: siteAdminAccess,
    update: siteAdminAccess,
    delete: adminAccess,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: { description: 'Where to send the invitation.' },
      /*
       * Not `unique`. A unique column would make a cancelled or expired
       * invitation permanently block re-inviting that address, since the insert
       * fails on the constraint. Uniqueness is enforced below against *open*
       * invitations only, which is the rule actually wanted.
       */
      validate: async (value: unknown, { req, id }: any) => {
        const email = typeof value === 'string' ? value.trim().toLowerCase() : ''
        if (!email) return 'An email address is required.'
        if (!req?.payload) return true

        const open = await req.payload.find({
          collection: 'invitations',
          where: {
            and: [
              { email: { equals: email } },
              { status: { equals: 'pending' } },
              ...(id ? [{ id: { not_equals: id } }] : []),
            ],
          },
          limit: 1,
          overrideAccess: true,
        })
        if (open.docs.length > 0) {
          return 'There is already a pending invitation for this address. Cancel it first, or use Resend.'
        }

        const existing = await req.payload.find({
          collection: 'users',
          where: { email: { equals: email } },
          limit: 1,
          overrideAccess: true,
        })
        if (existing.docs.length > 0) {
          return 'A user with this address already exists.'
        }

        return true
      },
    },
    {
      name: 'name',
      type: 'text',
      admin: { description: 'Optional, used to greet them in the email.' },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'author',
      options: INVITABLE_ROLES,
      admin: { description: 'Role granted when the invitation is accepted.' },
    },
    {
      name: 'allowedCollections',
      type: 'select',
      hasMany: true,
      options: authorAssignableCollections,
      admin: {
        description: 'Which content this Author will be able to edit.',
        condition: (data) => data?.role === 'author',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Expired', value: 'expired' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'token',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Single-use secret in the invitation link.',
      },
      hooks: {
        // Generated server-side. A client-supplied token would let the sender
        // choose a guessable value.
        beforeValidate: [({ value }) => value || generateToken()],
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: `Set to ${EXPIRY_DAYS} days after the invitation is created.`,
      },
      hooks: {
        beforeValidate: [({ value }) => value || getExpiryDate()],
      },
    },
    {
      name: 'invitedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'acceptedAt',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        condition: (data) => data?.status === 'accepted',
      },
    },
    {
      name: 'acceptedUser',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
        condition: (data) => data?.status === 'accepted',
      },
    },
    {
      name: 'emailStatus',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Outcome of the last send attempt.',
      },
    },
    {
      name: 'resendCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (data?.email) data.email = String(data.email).trim().toLowerCase()
        if (operation === 'create' && req.user) data.invitedBy = req.user.id
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create' || doc.status !== 'pending') return doc

        if (!isEmailConfigured()) {
          req.payload.logger.error(
            `Invitation for ${doc.email} was not emailed. Missing: ${missingSmtpVars().join(', ')}`,
          )
          await recordEmailStatus(req, doc.id, `Not sent — missing ${missingSmtpVars().join(', ')}`)
          return doc
        }

        const result = await sendInvitationEmail(req, doc)
        await recordEmailStatus(
          req,
          doc.id,
          result.success ? `Sent ${new Date().toISOString()}` : `Failed — ${result.error}`,
        )

        if (!result.success) {
          req.payload.logger.error(
            `Invitation email to ${doc.email} failed: ${result.error}`,
          )
        }
        return doc
      },
    ],
  },
  endpoints: [
    {
      path: '/:id/resend',
      method: 'post',
      handler: async (req) => {
        // Endpoints bypass collection access, so the check is explicit.
        if (!isSiteAdmin(req.user)) {
          return Response.json({ error: 'Not permitted' }, { status: 403 })
        }

        const id = req.routeParams?.id
        if (!id) return Response.json({ error: 'Invitation id required' }, { status: 400 })

        try {
          const invitation: any = await req.payload.findByID({
            collection: 'invitations',
            id: id as string,
            overrideAccess: true,
          })

          if (!invitation) {
            return Response.json({ error: 'Invitation not found' }, { status: 404 })
          }
          if (invitation.status !== 'pending') {
            return Response.json(
              { error: `Only pending invitations can be resent (this one is ${invitation.status}).` },
              { status: 400 },
            )
          }

          // A fresh token invalidates the previous link, so a forwarded old
          // email cannot still be used.
          const token = generateToken()
          const expiresAt = getExpiryDate()

          const result = await sendInvitationEmail(req, { ...invitation, token })
          if (!result.success) {
            return Response.json({ error: result.error }, { status: 502 })
          }

          await req.payload.update({
            collection: 'invitations',
            id: id as string,
            overrideAccess: true,
            data: {
              token,
              expiresAt,
              resendCount: (invitation.resendCount || 0) + 1,
              emailStatus: `Resent ${new Date().toISOString()}`,
            } as never,
          })

          return Response.json({ success: true, message: 'Invitation resent.' })
        } catch (err) {
          req.payload.logger.error(`Resend failed: ${(err as Error).message}`)
          return Response.json({ error: 'Could not resend the invitation.' }, { status: 500 })
        }
      },
    },
  ],
}

/* ── helpers ─────────────────────────────────────────────────────────── */

async function recordEmailStatus(req: any, id: string | number, status: string) {
  try {
    await req.payload.update({
      collection: 'invitations',
      id,
      data: { emailStatus: status } as never,
      overrideAccess: true,
    })
  } catch {
    // Status is diagnostic only, never worth failing the request for.
  }
}

async function sendInvitationEmail(req: any, doc: any) {
  const inviteLink = `${getPublicUrl()}/accept-invite?token=${encodeURIComponent(doc.token)}`

  let siteName = 'this site'
  try {
    const settings: any = await req.payload.findGlobal({ slug: 'site-settings' })
    if (settings?.siteName?.trim()) siteName = settings.siteName.trim()
  } catch {
    // Fall through to the neutral wording.
  }

  let invitedBy: string | null = null
  if (doc.invitedBy) {
    try {
      const inviter: any = await req.payload.findByID({
        collection: 'users',
        id: typeof doc.invitedBy === 'object' ? doc.invitedBy.id : doc.invitedBy,
        overrideAccess: true,
      })
      invitedBy =
        [inviter?.firstName, inviter?.lastName].filter(Boolean).join(' ').trim() ||
        inviter?.email ||
        null
    } catch {
      // An unknown inviter just omits that line from the email.
    }
  }

  return sendEmail({
    to: doc.email,
    subject: invitationSubject(siteName),
    html: invitationEmail({
      siteName,
      recipientName: doc.name,
      role: doc.role,
      inviteLink,
      invitedBy,
      expiresIn: `${EXPIRY_DAYS} days`,
    }),
  })
}
