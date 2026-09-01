/**
 * Outgoing mail for the invitation workflow.
 *
 * The sender's display name comes from Site Settings, not from a constant, so
 * rebranding the site rebrands its email too. Credentials come from the
 * environment. Nothing in this module names the organisation.
 */
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { getSmtpConfig, isEmailConfigured, missingSmtpVars } from './config'

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * One transporter for the process. Nodemailer pools connections, so rebuilding
 * it per send would open a new SMTP handshake every time.
 */
let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (transporter) return transporter

  const smtp = getSmtpConfig()
  if (!smtp) return null

  transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
    // Certificate verification is deliberately left on. Disabling it, as is
    // common in copied SMTP snippets, would let anything on the network path
    // present its own certificate and read the credentials and message.
    tls: { minVersion: 'TLSv1.2' },
  })

  return transporter
}

/* ── Sender identity ─────────────────────────────────────────────────── */

let cachedSiteName: string | null = null
let cacheTime = 0
const CACHE_TTL = 60_000

/**
 * Display name for the From header, taken from Site Settings so it follows the
 * site's own branding. Falls back to the sender mailbox when unavailable.
 */
async function getSenderName(): Promise<string | null> {
  const now = Date.now()
  if (cachedSiteName && now - cacheTime < CACHE_TTL) return cachedSiteName

  try {
    const { getPayload } = await import('payload')
    const { default: config } = await import('@/payload.config')
    const payload = await getPayload({ config })
    const settings: any = await payload.findGlobal({ slug: 'site-settings' as any })
    const name = settings?.siteName?.trim()
    if (name) {
      cachedSiteName = name
      cacheTime = now
      return name
    }
  } catch {
    // Site Settings unreadable — fall through to the bare address.
  }
  return cachedSiteName
}

/** Quotes the display name so a comma or quote cannot break the From header. */
function formatFrom(name: string | null, address: string): string {
  if (!name) return address
  return `"${name.replace(/["\\]/g, '')}" <${address}>`
}

/* ── Send ────────────────────────────────────────────────────────────── */

export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const smtp = getSmtpConfig()
  const transport = getTransporter()

  if (!smtp || !transport) {
    // Named, not valued, so nothing secret reaches the logs.
    return {
      success: false,
      error: `Email is not configured. Missing: ${missingSmtpVars().join(', ')}`,
    }
  }

  try {
    const info = await transport.sendMail({
      from: formatFrom(await getSenderName(), smtp.senderEmail),
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
    })
    return { success: true, messageId: info.messageId }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email',
    }
  }
}

/** Plain-text alternative, so the message is not flagged as HTML-only. */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim()
}

/** Verifies the SMTP connection without sending, for a health check. */
export async function verifyEmailConnection(): Promise<EmailResult> {
  const transport = getTransporter()
  if (!transport) {
    return { success: false, error: `Missing: ${missingSmtpVars().join(', ')}` }
  }
  try {
    await transport.verify()
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    }
  }
}

export { isEmailConfigured, missingSmtpVars }
