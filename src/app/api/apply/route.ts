/**
 * Public internship application submit.
 *
 *   POST multipart/form-data → creates a `resumes` upload and an
 *   `internship-applications` doc
 *
 * Body: `form` (the Form Builder form id), every form value under its field
 * `name`, `resume` (the PDF) and optionally `domain` (from `?domain=` on the
 * apply page, used when the form has no domain field).
 *
 * Runs unauthenticated by necessity: applicants have no account. Both
 * collections refuse public writes, so this route is the only way in, and it
 * validates everything first (see lib/requests/validateApplication). The form
 * definition is loaded on the server and must contain a Resume Upload field,
 * so a client cannot route an arbitrary form here, and only the fields that
 * form defines are read. The server sets the status, the submission time and
 * the stored filename; nothing the client sends for those is used. The
 * response never echoes ids or applicant data.
 *
 * No rate limiting or CAPTCHA yet, matching the Form Builder submissions endpoint.
 */
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload, ValidationError } from 'payload'
import config from '@/payload.config'
import {
  isPdfMagic,
  validateInternshipApplication,
  type ApplicationFormField,
} from '@/lib/requests/validateApplication'

/** The 5 MB file plus room for the text fields and multipart framing. */
const MAX_BODY_BYTES = 6 * 1024 * 1024

const GENERIC_ERROR = 'Something went wrong. Please try again.'

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status })

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_BODY_BYTES) return bad('Resume must be 5 MB or smaller.', 413)

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return bad('Malformed request.')
  }

  const formId = formData.get('form')
  if (typeof formId !== 'string' || !/^\d+$/.test(formId)) return bad('Missing form.')

  const payload = await getPayload({ config })

  let fields: ApplicationFormField[]
  try {
    const form = await payload.findByID({
      collection: 'forms',
      id: formId,
      depth: 0,
      // Form definitions are public-read anyway (the site renders them); this
      // only reads which fields the form defines.
      overrideAccess: true,
    })
    fields = (form?.fields || []) as ApplicationFormField[]
  } catch {
    return bad('This form is not available.')
  }

  if (!fields.some((field) => field.blockType === 'resumeUpload')) {
    return bad('This form does not accept internship applications.')
  }

  const result = validateInternshipApplication({ fields, get: (name) => formData.get(name) })
  if (!result.ok) return bad(result.error, result.status)

  const { data, extraFields, file } = result
  const buffer = Buffer.from(await file.arrayBuffer())
  if (!isPdfMagic(buffer)) return bad('Only PDF resumes are accepted.')

  let resumeId: number | string | null = null
  try {
    const resumeDoc = await payload.create({
      collection: 'resumes',
      data: { applicantName: data.name },
      file: {
        data: buffer,
        mimetype: 'application/pdf',
        // Never derived from applicant input.
        name: `resume-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.pdf`,
        size: buffer.length,
      },
      // Resumes refuse public creates; this route is the one validated path.
      overrideAccess: true,
    })
    resumeId = resumeDoc.id

    await payload.create({
      collection: 'internship-applications',
      data: {
        ...data,
        extraFields,
        resume: resumeDoc.id,
        status: 'new',
        submittedAt: new Date().toISOString(),
      },
      // Internship applications refuse public creates; the input was validated above.
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    // Payload's upload check also needs the PDF trailer (`xref`, `%%EOF`); a
    // file that starts like a PDF but is truncated or damaged fails there.
    if (resumeId === null && err instanceof ValidationError) {
      return bad('This file is not a valid PDF. Please upload a different file.')
    }

    payload.logger.error(`Apply API error: ${err instanceof Error ? err.message : String(err)}`)

    if (resumeId !== null) {
      // Best effort: do not leave a resume without an application.
      try {
        await payload.delete({ collection: 'resumes', id: resumeId, overrideAccess: true })
      } catch {
        payload.logger.error(`Apply API: could not remove orphan resume ${String(resumeId)}`)
      }
    }

    return bad(GENERIC_ERROR, 500)
  }
}
