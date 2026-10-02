# Current apply flow in cps_web

## src/blocks/CareerPosting.ts (slug `careerPosting`)
Fields: excerpt, effectiveDate, content (richText), problemDomains[] (title, description, challenges[].text, technicalSkills[].skill dbName cp_domains_tech_skills, nonTechnicalSkills[].skill dbName cp_domains_non_tech), applyButtonText, applyButtonLink (description says "Leave blank to use the built-in /apply page"), status (active|inactive).

## src/app/(frontend)/components/blocks/CareerPostingBlock.tsx
Renders the posting; apply button shown only if `applyButtonText` is set, `href={applyButtonLink || '/applicant/login'}` (line ~153). No `/apply` route exists in src/app (checked). It does not embed a form itself and has no job title wiring.

## src/blocks/FormLayout.ts + FormLayoutBlock.tsx
Block fields: sectionHeading, sectionDescription, headingAlignment, form (relationship → `forms`), maxWidth. FormLayoutBlock renders `<FormBuilderEmbed form={form} />` (returns null if no form).

## src/app/(frontend)/components/blocks/FormBuilderEmbed.tsx
- Loads form via `fetch('/api/forms/${formId}')` (line ~133) if not populated.
- Submits JSON to `fetch('/api/form-submissions', { method:'POST', body: JSON.stringify({ form: String(formDoc.id), submissionData }) })` (line ~241) via Form Builder plugin. Files are NOT uploaded (JSON only).
- Dead DUCC leftovers:
  - `hasResumeUpload` memo (line ~164) and `field.blockType === 'resumeUpload'` rendering branch (line ~330: dropzone, accept default application/pdf, maxSizeMB default 5, helperText) — cps formBuilderPlugin no longer defines a `resumeUpload` block, so this never renders; `selectedFiles`/`fileErrors` state is still maintained.
  - Hardcoded "Year of Experience" number input (`name="yearOfExperience"`, min 1 max 50, required) shown when a work-status select equals `experienced` (line ~490).
- DUCC's version of this same file POSTs multipart FormData to `/api/apply` (see ducc-reference.md) which creates a resume upload + job-applications doc.
