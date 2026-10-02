/**
 * Email templates for the invitation workflow.
 *
 * Deliberately unbranded: the site name is passed in from Site Settings so
 * these never need editing when the site is rebranded. Layout is table-based
 * with inline styles, which is what mail clients reliably render.
 */

/** Escapes text interpolated into HTML, since names and emails are user input. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const INK = '#0f172a'
const MUTED = '#475569'
const BORDER = '#e2e8f0'

function layout(opts: { siteName: string; heading: string; body: string }): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid ${BORDER};border-radius:12px;">
    <tr><td style="padding:28px 32px 8px;">
      <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${MUTED};">${esc(opts.siteName)}</p>
      <h1 style="margin:12px 0 0;font-size:20px;line-height:1.35;color:${INK};">${esc(opts.heading)}</h1>
    </td></tr>
    <tr><td style="padding:12px 32px 32px;color:${MUTED};font-size:15px;line-height:1.65;">${opts.body}</td></tr>
  </table>
  <p style="max-width:520px;margin:16px auto 0;font-size:12px;line-height:1.6;color:#94a3b8;text-align:center;">
    This message was sent by ${esc(opts.siteName)}. If it was not meant for you, you can ignore it.
  </p>
</body></html>`
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:${INK};border-radius:8px;">
    <a href="${esc(href)}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${esc(label)}</a>
  </td></tr></table>`
}

/* ── Role wording ─────────────────────────────────────────────────────── */

/**
 * What each role can do, in the recipient's terms.
 *
 * Kept beside the templates rather than imported from the access rules: this is
 * copy for a human, and it should not silently change wording if a role's
 * internal value is renamed.
 */
const ROLE_SUMMARY: Record<string, string> = {
  super_admin: 'full access, including user management',
  admin: 'full access to all content and settings, and inviting editors',
  content_editor: 'permission to work on the pages and content assigned to you',
  author: 'permission to work on the content assigned to you',
  viewer: 'read-only access',
}

export function describeRole(role: string): string {
  return ROLE_SUMMARY[role] || 'access to the admin area'
}

/* ── Invitation ───────────────────────────────────────────────────────── */

export interface InvitationEmailArgs {
  siteName: string
  recipientName?: string | null
  role: string
  inviteLink: string
  invitedBy?: string | null
  expiresIn: string
}

export function invitationSubject(siteName: string): string {
  return `You have been invited to ${siteName}`
}

export function invitationEmail(args: InvitationEmailArgs): string {
  const greeting = args.recipientName?.trim() ? `Hello ${esc(args.recipientName.trim())},` : 'Hello,'
  const from = args.invitedBy?.trim() ? ` by ${esc(args.invitedBy.trim())}` : ''

  return layout({
    siteName: args.siteName,
    heading: `You have been invited to contribute`,
    body: `
      <p style="margin:0 0 14px;">${greeting}</p>
      <p style="margin:0 0 14px;">You have been invited${from} to help manage content on
        <strong style="color:${INK};">${esc(args.siteName)}</strong>.
        Your account will have ${esc(describeRole(args.role))}.</p>
      <p style="margin:0;">Choose a password to finish setting up your account:</p>
      ${button(args.inviteLink, 'Accept invitation')}
      <p style="margin:0 0 10px;font-size:13px;">This invitation expires in ${esc(args.expiresIn)}.</p>
      <p style="margin:0;font-size:13px;word-break:break-all;">If the button does not work, paste this link into your browser:<br>
        <span style="color:${INK};">${esc(args.inviteLink)}</span></p>`,
  })
}

/* ── Welcome ──────────────────────────────────────────────────────────── */

export interface WelcomeEmailArgs {
  siteName: string
  userName?: string | null
  userEmail: string
  role: string
  loginUrl: string
}

export function welcomeSubject(siteName: string): string {
  return `Your ${siteName} account is ready`
}

export function welcomeEmail(args: WelcomeEmailArgs): string {
  const greeting = args.userName?.trim() ? `Hello ${esc(args.userName.trim())},` : 'Hello,'

  return layout({
    siteName: args.siteName,
    heading: 'Your account is ready',
    body: `
      <p style="margin:0 0 14px;">${greeting}</p>
      <p style="margin:0 0 14px;">Your account has been created with ${esc(describeRole(args.role))}.
        Sign in with <strong style="color:${INK};">${esc(args.userEmail)}</strong> and the password you chose.</p>
      ${button(args.loginUrl, 'Go to the admin area')}
      <p style="margin:0;font-size:13px;">Keep this address handy — it is where you will manage content from now on.</p>`,
  })
}
