/**
 * Invitation acceptance.
 *
 *   GET  ?token=…  validates a token and returns what the form needs
 *   POST           creates the account and marks the invitation accepted
 *
 * Both run unauthenticated by necessity — the recipient has no account yet — so
 * the token is the only credential and every call revalidates it. Nothing about
 * the invitation is echoed back beyond what the form must display, and the role
 * always comes from the stored invitation rather than the request body, so a
 * caller cannot ask for a role they were not granted.
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  commitTransaction,
  createLocalReq,
  getPayload,
  initTransaction,
  killTransaction,
  ValidationError,
} from 'payload'
import config from '@/payload.config'
import { sendEmail } from '@/lib/email/sendEmail'
import { getPublicUrl } from '@/lib/email/config'
import { welcomeEmail, welcomeSubject } from '@/lib/email/templates'
import { SCOPED_ROLES } from '@/access/roles'

/** Payload's own default; enforced here so the error arrives before the create. */
const MIN_PASSWORD_LENGTH = 8

interface InvitationDoc {
  id: string | number
  email: string
  name?: string | null
  role: string
  allowedCollections?: string[] | null
  allowedPages?: (string | number | { id: string | number } | null)[] | null
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  expiresAt: string
}

async function findByToken(token: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'invitations',
    where: { token: { equals: token } },
    limit: 1,
    // Read access is admin-only; this route is the one legitimate public path.
    overrideAccess: true,
  })
  return { payload, invitation: (docs[0] as unknown as InvitationDoc) || null }
}

/** A single message for every rejection, so nothing about the token leaks. */
const INVALID = 'This invitation link is not valid.'

function isValidationError(err: unknown): err is ValidationError {
  return err instanceof ValidationError || (err as Error | null)?.name === 'ValidationError'
}

/**
 * Local API errors are not logged by Payload, so without this the cause of a
 * failed acceptance never reaches the server logs.
 */
async function logError(err: unknown, msg: string) {
  try {
    const payload = await getPayload({ config })
    payload.logger.error({ err }, msg)
  } catch {
    console.error(msg, err)
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: INVALID }, { status: 400 })

  try {
    const { payload, invitation } = await findByToken(token)
    if (!invitation) return NextResponse.json({ error: INVALID }, { status: 404 })

    if (invitation.status === 'accepted') {
      return NextResponse.json(
        { error: 'This invitation has already been used.', loginUrl: '/admin' },
        { status: 410 },
      )
    }
    if (invitation.status === 'cancelled') {
      return NextResponse.json({ error: 'This invitation was cancelled.' }, { status: 410 })
    }

    if (new Date(invitation.expiresAt).getTime() < Date.now()) {
      if (invitation.status === 'pending') {
        await payload.update({
          collection: 'invitations',
          id: invitation.id,
          data: { status: 'expired' } as never,
          overrideAccess: true,
        })
      }
      return NextResponse.json(
        { error: 'This invitation has expired. Ask for a new one.' },
        { status: 410 },
      )
    }

    // Only what the form needs. The token is not echoed.
    return NextResponse.json({
      valid: true,
      email: invitation.email,
      name: invitation.name ?? null,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      minPasswordLength: MIN_PASSWORD_LENGTH,
    })
  } catch (err) {
    await logError(err, 'Invitation check failed')
    return NextResponse.json({ error: 'Could not check this invitation.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let body: { token?: string; password?: string; firstName?: string; lastName?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 })
  }

  const token = typeof body.token === 'string' ? body.token : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!token) return NextResponse.json({ error: INVALID }, { status: 400 })
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Choose a password of at least ${MIN_PASSWORD_LENGTH} characters.` },
      { status: 400 },
    )
  }

  try {
    const { payload, invitation } = await findByToken(token)
    if (!invitation) return NextResponse.json({ error: INVALID }, { status: 404 })

    // Re-checked here rather than trusting the earlier GET: the two calls are
    // separate requests and the invitation may have been used or revoked between.
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        {
          error:
            invitation.status === 'accepted'
              ? 'This invitation has already been used.'
              : `This invitation is ${invitation.status}.`,
          loginUrl: invitation.status === 'accepted' ? '/admin' : undefined,
        },
        { status: 410 },
      )
    }

    if (new Date(invitation.expiresAt).getTime() < Date.now()) {
      await payload.update({
        collection: 'invitations',
        id: invitation.id,
        data: { status: 'expired' } as never,
        overrideAccess: true,
      })
      return NextResponse.json({ error: 'This invitation has expired.' }, { status: 410 })
    }

    /*
     * The account and the invitation's "accepted" status are written in one
     * transaction, so a failure part-way leaves neither behind (no account
     * without a closed invitation, which would block every retry).
     */
    const req = await createLocalReq({}, payload)
    const ownsTransaction = await initTransaction(req)

    let accountExisted = false
    try {
      const existing = await payload.find({
        collection: 'users',
        where: { email: { equals: invitation.email } },
        limit: 1,
        overrideAccess: true,
        req,
      })

      if (existing.docs.length > 0) {
        // Close the invitation so it cannot be reused against the live account.
        // The existing account itself is left untouched (no password or role change).
        await payload.update({
          collection: 'invitations',
          id: invitation.id,
          data: {
            status: 'accepted',
            acceptedAt: new Date().toISOString(),
            acceptedUser: existing.docs[0].id,
          } as never,
          overrideAccess: true,
          req,
        })
        accountExisted = true
      } else {
        // Content Editor and Author are both scoped to what the invitation assigns.
        const isScopedRole = SCOPED_ROLES.includes(invitation.role as never)
        const pageIds = (invitation.allowedPages || [])
          .map((p) => (p && typeof p === 'object' ? p.id : p))
          .filter((p): p is string | number => p !== null && p !== undefined)

        const user = await payload.create({
          collection: 'users',
          overrideAccess: true,
          data: {
            email: invitation.email,
            password,
            firstName: (body.firstName || invitation.name || '').trim() || undefined,
            lastName: (body.lastName || '').trim() || undefined,
            // Role and scope come from the invitation, never from the request.
            roles: [invitation.role],
            allowedCollections: isScopedRole ? invitation.allowedCollections || [] : [],
            allowedPages: isScopedRole ? pageIds : [],
          } as never,
          req,
        })

        await payload.update({
          collection: 'invitations',
          id: invitation.id,
          data: {
            status: 'accepted',
            acceptedAt: new Date().toISOString(),
            acceptedUser: user.id,
          } as never,
          overrideAccess: true,
          req,
        })
      }

      if (ownsTransaction) await commitTransaction(req)
    } catch (err) {
      await killTransaction(req)
      throw err
    }

    if (accountExisted) {
      return NextResponse.json(
        { error: 'An account with this address already exists. Sign in instead.', loginUrl: '/admin' },
        { status: 409 },
      )
    }

    // Best effort: the account exists either way, so a failed welcome email
    // must not turn a successful signup into an error.
    try {
      let siteName = 'this site'
      const settings: any = await payload.findGlobal({ slug: 'site-settings' })
      if (settings?.siteName?.trim()) siteName = settings.siteName.trim()

      await sendEmail({
        to: invitation.email,
        subject: welcomeSubject(siteName),
        html: welcomeEmail({
          siteName,
          userName: [body.firstName, body.lastName].filter(Boolean).join(' ') || invitation.name,
          userEmail: invitation.email,
          role: invitation.role,
          loginUrl: `${getPublicUrl()}/admin`,
        }),
      })
    } catch {
      // Ignored deliberately.
    }

    return NextResponse.json({ success: true, email: invitation.email, loginUrl: '/admin' })
  } catch (err) {
    await logError(err, 'Invitation accept failed')

    const message = err instanceof Error ? err.message : ''
    // The Postgres adapter reports unique-constraint hits as a ValidationError
    // whose per-field message carries the "unique" wording.
    const fieldMessages = isValidationError(err)
      ? (err.data?.errors || []).map((e) => e.message).join(' ')
      : ''
    if (/duplicate|unique/i.test(`${message} ${fieldMessages}`)) {
      return NextResponse.json(
        { error: 'An account with this address already exists.', loginUrl: '/admin' },
        { status: 409 },
      )
    }
    if (isValidationError(err)) {
      // Field details stay in the server log; the form only needs to know it can retry.
      return NextResponse.json(
        {
          error:
            'Some of the details could not be saved. Check them and try again, or ask the person who invited you for help.',
        },
        { status: 400 },
      )
    }
    return NextResponse.json({ error: 'Could not complete the invitation.' }, { status: 500 })
  }
}
