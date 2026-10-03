/**
 * SMTP configuration, read from the environment.
 *
 * Nothing here has a hardcoded fallback. A wrong-but-plausible default (a
 * localhost host, someone else's sender address) fails silently or sends from
 * the wrong identity, so a missing variable is reported instead.
 */

export interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  senderEmail: string
}

const REQUIRED = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USERNAME', 'SMTP_PASSWORD', 'SMTP_SENDER_EMAIL']

/** Which required variables are absent, for diagnostics that never log values. */
export function missingSmtpVars(): string[] {
  return REQUIRED.filter((k) => !process.env[k]?.trim())
}

export function isEmailConfigured(): boolean {
  return missingSmtpVars().length === 0
}

/** Returns null rather than throwing, so callers can degrade gracefully. */
export function getSmtpConfig(): SmtpConfig | null {
  if (!isEmailConfigured()) return null

  const port = Number(process.env.SMTP_PORT)
  if (!Number.isFinite(port) || port <= 0) return null

  return {
    host: process.env.SMTP_HOST!.trim(),
    port,
    // Implicit TLS on 465; everything else upgrades with STARTTLS.
    secure: port === 465,
    user: process.env.SMTP_USERNAME!.trim(),
    pass: process.env.SMTP_PASSWORD!,
    senderEmail: process.env.SMTP_SENDER_EMAIL!.trim(),
  }
}

/**
 * Public origin used to build links in emails.
 *
 * Falls back through the variables a deployment might set, then to the dev port
 * this project actually uses. An invite link is useless if the origin is wrong,
 * so this is worth getting from configuration rather than guessing.
 */
export function getPublicUrl(): string {
  const candidate =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.PAYLOAD_PUBLIC_SERVER_URL ||
    `http://localhost:${process.env.PORT || 3555}`

  // Next expands ${PORT} in .env itself; scripts that read .env by hand do not,
  // so expand it here too.
  return candidate
    .replace(/\$\{PORT\}|\$PORT\b/g, process.env.PORT || '3555')
    .trim()
    .replace(/\/+$/, '')
}
