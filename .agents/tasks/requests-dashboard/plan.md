# Implementation Plan: Requests Dashboard (Internship Applications + Contact Enquiries)

The spec is `c:\Users\Admin\Desktop\CPS\cps_web\.agents\tasks\requests-dashboard\brief.md`. Read it first. If this plan and the brief disagree, the brief wins.

Ground rules:
- Work IN PLACE in `c:\Users\Admin\Desktop\CPS\cps_web`. Pass it as `cwd` on every command. There is no worktree.
- Windows + PowerShell, pnpm.
- Do NOT commit. Do NOT start long-running servers.
- Don't re-open DUCC. Everything needed from it is in `.agents/tasks/job-applications-restore/ducc-reference.md`: the ApplicationsDashboardCard widget (tabs, header, stat row, filters, table) and the DUCC `/api/apply`.

## What exists now (checked during planning)

- **Live DB** (read-only probe):
  - `job_applications`: 0 rows. `resumes`: 0. `forms_blocks_resume_upload`: 0. `form_submissions`: 0. `forms`: 2, both DUCC "Request access" leftovers, not touched.
  - Enums `enum_job_applications_status` and `enum_job_applications_work_status` exist.
  - `payload_locked_documents_rels` has `job_applications_id` and `resumes_id`. No lock rows reference `job_applications_id`.
  - No page uses the `careerPosting`, `formLayout` or `contactSection` blocks yet, and no `apply` page exists.
- **Aborted-run files**, all untracked:
  - `src/collections/JobApplications.ts`, `src/collections/Resumes.ts`
  - `src/lib/jobApplications/validateApplication.ts`
  - `src/app/api/apply/route.ts`
  - `tests/int/job-applications.int.spec.ts`
  - `schema-history/20261001_job_applications.sql`
- **Aborted-run edits:**
  - `src/payload.config.ts`: imports and registers Resumes + JobApplications, adds the `resumeUpload` form-builder field block.
  - `.gitignore`: `/resumes/`.
  - `CareerPostingBlock.tsx`: fallback href `/applicant/login` → `/apply`.
  - `FormBuilderEmbed.tsx`: `hasResumeUpload` submit branch with client-side hint mapping and job fields, the "Year of Experience" hack removed, `aria-describedby`/`aria-invalid`/`role="alert"` on the file input.
- **NOT aborted-run work; keep as is:**
  - The `forms`/`form-submissions` `access` and `admin.hidden: hiddenUnlessSiteAdmin` overrides in `payload.config.ts`. They predate the run: `cps-conventions.md`, written before it, already lists them, and the brief says to keep them.
  - `FormBuilderEmbed`'s `variant` / `hideTitle` / `actionsSlot` props, used by `ContactSectionBlock.tsx`.
  - Everything in `styles.css`. The run's only CSS is the visually-hidden `.apply-form__file-input` and the `.apply-form__dropzone:has(...:focus-visible)` rule. Both are a11y fixes the resume dropzone still needs, so nothing in `styles.css` conflicts. Leave the file untouched.
  - ProjectShowcase, AccessibilityStatement, ContactSection, and the other modified files in `git status`.
- `scripts/drop-legacy-collections.mjs` (committed) lists `job_applications` AND `resumes` and `forms_blocks_resume_upload`. **Never run it.** It would destroy objects we keep. Use it only as a code model.
- Plugin facts (read in `node_modules/@payloadcms/plugin-form-builder/dist/collections/FormSubmissions/index.js`):
  - `formSubmissionOverrides.fields` may be a function `({ defaultFields }) => Field[]`.
  - `hooks.beforeChange` from overrides is appended after the plugin's `createCharge`.
  - `sendEmail` runs only on `operation === 'create'`, so a status PATCH does not resend emails.
  - `formOverrides.fields` is likewise a function (already used to make `title` optional).

## Design decisions (fixed; do not re-decide)

- **D1. Form opt-in = the form contains a `resumeUpload` field.** No new Forms checkbox for internships.
  - Why: a resume is mandatory for an internship application, the field block already exists in config/DB, and FormBuilderEmbed already switches on it. A second flag could disagree with it.
  - The server re-checks this: `/api/apply` loads the form by id and rejects any form without a `resumeUpload` field. The client cannot route an arbitrary form into applications.
- **D2. Field mapping happens server-side**, in a pure module shared with the dashboard.
  - The client posts multipart: `form` = form id, every form value under its Form Builder field `name`, `resume` = file, and optionally `domain` (from `?domain=`).
  - The route reads the form definition and maps fields by `name + label` hint. Unknown keys not defined on the form are ignored. All other non-empty form fields go to `extraFields` as `{ [label || name]: value }`.
  - Hint rules live in `src/lib/requests/fieldHints.ts`. Matching is case-insensitive against `${name} ${label}`. Each field gets the FIRST key it matches, in this priority order:
    - `email`: blockType `email` or `/e-?mail/`
    - `phone`: `/phone|mobile|whatsapp|contact\s*(no|number)/`
    - `institution`: `/college|university|institut|school/`
    - `yearOrSemester`: `/\byear\b|semester|\bsem\b/`
    - `domain`: `/domain|position|applying\s*for|area\s*of\s*interest|track/`
    - `subject`: `/subject|topic|regarding/`
    - `message`: `/message|enquiry|inquiry|query|comment|details/`, or blockType `textarea` as fallback when nothing else matched message
    - `name`: `/applicant|full\s*name|\bname\b/`
  - Institution comes before name, so "College Name" maps to institution, not name.
  - Each key takes the first field that matches; later matches of the same key go to extraFields.
  - The internship mapping uses keys email, phone, institution, yearOrSemester, domain, name. The enquiry mapping uses email, phone, subject, message, name.
- **D3. Domain is required.** Precedence: the mapped domain field value, else the `domain` multipart entry from the URL, else 400 "Please choose the internship domain you are applying for."
  - Editors are told to add a "Domain" select or text field. FormBuilderEmbed prefills it from `?domain=`.
- **D4. Statuses.** Defined once in `src/lib/requests/statuses.ts`:
  - `INTERNSHIP_STATUSES`: new, reviewed, approved, rejected. Labels New/Reviewed/Approved/Rejected.
  - `ENQUIRY_STATUSES`: new, reviewed, replied, closed.
  - Default is `new`. There is no "deleted" status and no delete action in the dashboard; the brief lists only those four statuses.
  - On create, status is ALWAYS forced to `new` by a `beforeChange` hook in both collections, so a public form-submissions POST cannot set it either.
  - Colours, as DUCC: total `#1e3a5f`, new `#3b82f6`/bg `#eff6ff`, reviewed `#f59e0b`/`#fffbeb`, approved `#10b981`/`#f0fdf4`, rejected `#ef4444`/`#fef2f2`. Two are new for enquiries: replied `#10b981`/`#f0fdf4` and closed `#6b7280`/`#f3f4f6`.
- **D5. Access**, using only `src/access/roles.ts` helpers.
  - `internship-applications`:
    - create `siteAdminAccess`; the public creates only via `/api/apply` with `overrideAccess: true`.
    - read/update/delete `siteAdminAccess`.
    - `admin.hidden: hiddenUnlessSiteAdmin`.
  - `resumes`: keep the aborted run's rules: create `() => false`, read/update/delete `siteAdminAccess`, hidden `hiddenUnlessSiteAdmin`. Files are served only through Payload's access-checked `/api/resumes/file/:filename`, from `CMS_RESUMES_UPLOAD_DIR || 'resumes'`, which is outside `public/`.
  - `form-submissions`: keep the existing create `publicAccess`, with read/update/delete `siteAdminAccess`.
  - Nothing is added to `authorAssignableCollections`.
  - No custom Payload endpoint is added. The dashboard uses REST with `credentials: 'include'`, which is access-checked. `/api/apply` is a Next route that never returns stored data.
- **D6. Dashboard = one client component registered at `admin.components.afterDashboard`**, matching DUCC's ApplicationsDashboardCard.
  - It renders `null` unless `isSiteAdmin(useAuth().user)`.
  - On open it fetches both data sets in parallel, so both tab counts show. Refresh refetches both.
  - Data sources:
    - Internships: `GET /api/internship-applications?limit=500&sort=-submittedAt&depth=1`. depth 1 populates `resume` with `url`/`filename`.
    - Enquiries, two steps:
      1. `GET /api/forms?where[showInContactEnquiries][equals]=true&depth=0&limit=100` returns the form ids plus their `fields` for labels.
      2. If there are any ids, `GET /api/form-submissions?where[form][in]=<ids comma-joined>&depth=0&limit=500&sort=-createdAt`.
    - The two-step query avoids depending on nested-relationship where queries.
  - Status change: `PATCH /api/<collection>/<id>` with `{ status }`, then update the row locally. On failure, show a message in a `role="alert"` element and revert. Do not `throw` inside a transition.
  - Limit of 500 rows per tab, no pagination (same as DUCC). Recorded as a known limitation.
- **D7. Export.** Client-side, as DUCC: CSV (`text/csv`) and "Excel" (TSV with an `.xls` name, `application/vnd.ms-excel`).
  - One column per field.
  - Every cell is CSV-escaped. Cells starting with `=`, `+`, `-`, `@`, tab or CR get a leading `'`, to guard against formula injection from public input.
  - Filenames: `internship-applications-<timestamp>.csv|xls` and `contact-enquiries-<timestamp>.csv|xls`.
- **D8. Schema change order.**
  1. Code changes first.
  2. Backup (`setup-scratch`).
  3. The temp drop script drops `job_applications` on live.
  4. `setup-scratch` again, so scratch = post-drop live.
  5. push/diff/apply.
  - That way `diff-scratch` shows no dropped tables or columns, and only additions remain.
- **D9. Not restructured into FEATs.** The work is one dependency chain: libs → collections/config/route → DB → frontend → admin UI → runtime checks. The brief also forbids commits, which per-FEAT coder steps would require. The existing implement/review loop runs this plan. Its verdict file stays `c:\Users\Admin\Desktop\CPS\cps_web\.agents\tasks\requests-dashboard\review.json`, with `verdict` = `APPROVED`.

### Table columns (exact; implementer and reviewer check these)

**Internship Applications.** Header text, in this order:

| # | Header | Cell |
|---|---|---|
| 1 | `Name` | `name`, bold |
| 2 | `Domain` | `domain` |
| 3 | `College / University` | `institution` or `—` |
| 4 | `Year / Semester` | `yearOrSemester` or `—` |
| 5 | `Contact` | `email`, with `phone` below in muted `#9ca3af` text |
| 6 | `Status` | inline status `<select>` pill |
| 7 | `Resume` | `↓ Download` link to `resume.url` (new tab, `rel="noopener noreferrer"`), or `No file` |

- Tab title "Internship Applications". Description: "Review and manage internship applications".
- Search placeholder: "Search by name, email, domain or college..."
- Search matches name, email, domain and institution.
- Filter pills: All, New, Reviewed, Approved, Rejected.
- Stat row, in DUCC's order: Total, New, Approved, Reviewed, Rejected.

**Contact Enquiries.** Header text, in this order:

| # | Header | Cell |
|---|---|---|
| 1 | `Name` | mapped `name` |
| 2 | `Contact` | email, with phone below in muted text |
| 3 | `Subject` | mapped `subject`, or `—` |
| 4 | `Message` | mapped `message`, truncated to 80 chars with `…`; the full text in a `title` attribute |
| 5 | `Received` | `createdAt` formatted `DD Mon YYYY` (DUCC `formatDate`) |
| 6 | `Status` | inline status `<select>` pill |

- Tab title "Contact Enquiries". Description: "Messages sent through contact forms".
- Search matches name, email, subject and message.
- Filter pills: All, New, Reviewed, Replied, Closed.
- Stat row: Total, New, Reviewed, Replied, Closed.
- If no form has the checkbox ticked, the empty state reads "No contact forms selected. Tick “Show submissions in Contact Enquiries” on a form."

**Export columns.**
- Internship: `ID`, `Submitted`, `Status`, `Name`, `Email`, `Phone`, `Domain`, `College / University`, `Year / Semester`, `Resume File`, then one column per distinct `extraFields` key across the exported rows, in first-seen order.
  - `Status` is the label.
  - `Resume File` is `resume.filename` or empty.
- Enquiries: `ID`, `Received`, `Status`, `Form`, `Name`, `Email`, `Phone`, `Subject`, `Message` (full text), then one column per other submission field.
  - `Form` is the form title.
  - Other fields are keyed by the form field's label, falling back to its name; first-seen order.
- An export covers the rows of the active tab after the status filter and search are applied. Its filename says which tab it came from.

### Known risks / decision points (record outcomes in verification.md)

- R1: Hint mapping is heuristic. A field labelled "Years of experience" would match `yearOrSemester`. Editors should use clear labels. Unmapped values are never lost; they go to `extraFields`.
- R2: There is no rate limit or CAPTCHA on `/api/apply` or `/api/form-submissions` (same as before). This is a follow-up, not in scope.
- R3: The inline DUCC colours (hard-coded `#fff` table backgrounds) don't adapt to the Payload dark theme. The brief says keep DUCC's styling, so leave them and note it.
- R4: The "Excel" export is TSV named `.xls`, as in DUCC, so Excel shows a format warning when opening it. Keep this and note it.
- R5: If `SELECT count(*) FROM job_applications` > 0 when step 3 runs, STOP. Don't drop anything, and report via the workflow.
- R6: Any DROP, or any ALTER of an existing object, in `scratch-diff.sql` → STOP and report. Known noise:
  - `changed enums` lists `*_x_mode` and `enum_users_roles`
  - `enum_header_nav_items_children_type` is excluded by apply-new-schema
- R7: `payload_preferences` rows keyed for `job-applications` (if any) are left alone. They are harmless.

---

- [x] 1. Create the pure shared modules and their unit tests, without touching the old ones yet.
      Create `src/lib/requests/statuses.ts`.
        - Exports `INTERNSHIP_STATUSES` and `ENQUIRY_STATUSES` (`as const` arrays of `{ label, value }`, per D4).
        - Exports their value types, and `STATUS_STYLES: Record<string, { color: string; bg: string }>` per D4.
      Create `src/lib/requests/fieldHints.ts`. No imports.
        - Exports `type FormFieldDef = { name?: string; label?: string; blockType: string }`.
        - Exports `matchHint(field, key)`.
        - Exports `mapFieldsByHint(entries: { name: string; label?: string; blockType: string; value: string }[], keys: HintKey[])`, which returns `{ mapped: Partial<Record<HintKey,string>>; rest: { key: string; value: string }[] }`, with `key = label?.trim() || name`.
        - Exports `isDomainField(field)`.
        - Hint rules and priority exactly as D2. Empty values are skipped.
      Create `src/lib/requests/validateApplication.ts`.
        - Move `MAX_RESUME_BYTES`, `isPdfMagic`, `EMAIL_RE` and `PHONE_RE` over from `src/lib/jobApplications/validateApplication.ts`.
        - Export `validateInternshipApplication({ fields: FormFieldDef[] (the form definition), get: (name) => FormDataEntryValue | null })`. It returns `{ ok: true, data: { name, email, phone?, domain, institution?, yearOrSemester? }, extraFields: Record<string,string>, file: File }` or `{ ok: false, status: 400|413, error }`.
        - Steps and rules:
          1. Walk the form fields, skipping `message`/`resumeUpload` blocks and fields without a name.
          2. Take each value as a trimmed string. A checkbox `'true'` becomes `'Yes'`.
          3. A required field that is empty → 400 `Please fill in "<label>".`
          4. `mapFieldsByHint` with the internship keys.
          5. domain per D3, from `get('domain')`.
          6. name required, 2–120 chars.
          7. email required, ≤254, matches `EMAIL_RE`.
          8. phone optional, matches `PHONE_RE`.
          9. domain ≤200, institution ≤200, yearOrSemester ≤50.
          10. extraFields: ≤50 entries, each value ≤2000 chars, each key ≤200 chars; otherwise 400.
          11. Resume must be a File/Blob, size > 0, ≤ `MAX_RESUME_BYTES` (else 413), `type === 'application/pdf'`.
        - Client keys `status`, `submittedAt`, `extraFields` and `resume` ids are never read. Only form-defined names plus `domain`/`resume` are read.
      Create `src/lib/requests/exportRows.ts`.
        - `csvCell(value)` applies the formula guard and quoting per D7.
        - `toCsv(headers, rows)` and `toTsv(headers, rows)`.
        - `formatDate(iso)`: DUCC's UTC `DD Mon YYYY`.
      Create `tests/int/requests.int.spec.ts`, in the style of `tests/int/job-applications.int.spec.ts`: `new FormData()`, `new File(...)`, and a `get` built from the FormData. Cover:
        - hint priority ("College Name" → institution; "Full Name " with a trailing space → name; blockType email; textarea fallback → message)
        - a valid application, with extras landing in `extraFields` by label
        - URL domain fallback and missing domain
        - missing name / email / required custom field
        - bad email
        - non-PDF type
        - 5 MB + 1 → 413; exactly 5 MB passes
        - client `status=approved` ignored; unknown keys ignored
        - `isPdfMagic`
        - `csvCell('=SUM(A1)')` → `'=SUM(A1)` and quoting of commas/quotes/newlines
      Files: `src/lib/requests/statuses.ts`, `src/lib/requests/fieldHints.ts`, `src/lib/requests/validateApplication.ts`, `src/lib/requests/exportRows.ts`, `tests/int/requests.int.spec.ts`.
      Verify: `npx vitest run --config ./vitest.config.mts tests/int/requests.int.spec.ts tests/int/access-roles.int.spec.ts` — all pass. Then `npx tsc --noEmit` exits 0.

- [x] 2. Swap the data model, config and apply route (server side), then regenerate types.
      a. Create `src/collections/InternshipApplications.ts` (slug `internship-applications`). Base it on the aborted `JobApplications.ts` for structure, comments and hooks.
        - labels: Internship Application / Internship Applications
        - admin: `useAsTitle: 'name'`, group `'Requests'`, `defaultColumns: ['name','email','domain','status','submittedAt']`, `hidden: hiddenUnlessSiteAdmin`, plus a description
        - access: per D5
        - fields:
          - `name`: text, required, maxLength 120
          - `email`: email, required
          - `phone`: text, maxLength 30
          - `domain`: text, required, maxLength 200, label "Domain"
          - `institution`: text, maxLength 200, label "College / University"
          - `yearOrSemester`: text, maxLength 50, label "Year / Semester"
          - `resume`: type `upload`, relationTo `resumes`, `admin.readOnly`
          - `extraFields`: json, label "Other Answers", `admin.readOnly`, description "Every other field from the form; included in exports."
          - `status`: select of `INTERNSHIP_STATUSES`, default `new`, required, sidebar
          - `submittedAt`: date, sidebar, readOnly, field `access: { update: () => false }`
        - hooks:
          - `beforeChange`: on create, ALWAYS set `status = 'new'` and `submittedAt = new Date().toISOString()`.
          - `beforeDelete`: deletes the linked resume. Copy it from `JobApplications.ts`, change the slug, and pass `req` to every nested call.
      b. Edit `src/collections/Resumes.ts`:
        - import `MAX_RESUME_BYTES` from `../lib/requests/validateApplication`
        - group `'Requests'`
        - the description and comment wording says "internship applications"
        - access, upload config and hook unchanged
      c. Edit `src/payload.config.ts`:
        - Replace the `JobApplications` import and registration with `InternshipApplications`, keeping `Resumes`.
        - Leave the `resumeUpload` block config byte-identical (its table already exists live). Change only its comment, to "internship application forms".
        - In `formOverrides.fields`, return `[...mapped defaultFields, { name: 'showInContactEnquiries', type: 'checkbox', label: 'Show submissions in Contact Enquiries', defaultValue: false, admin: { position: 'sidebar', description: 'List this form’s submissions in the Contact Enquiries tab of the Requests Dashboard.' } }]`.
        - In `formSubmissionOverrides`:
          - add `fields: ({ defaultFields }) => [...defaultFields, { name: 'status', type: 'select', options: ENQUIRY_STATUSES (spread to mutable), defaultValue: 'new', required: true, admin: { position: 'sidebar' } }]`
          - add `hooks: { beforeChange: [({ data, operation }) => { if (operation === 'create') data.status = 'new'; return data }] }`
        - Keep the existing access and `admin.hidden` exactly.
        - Do NOT add `admin.components` yet.
      d. Rewrite `src/app/api/apply/route.ts`. Keep the aborted route's structure:
        - Header doc comment updated.
        - 6 MB content-length → 413.
        - `formData()` parse → 400.
        - Then:
          1. `form` id must match `/^\d+$/`, else 400 "Missing form."
          2. `payload.findByID({ collection: 'forms', id, depth: 0, overrideAccess: true })` with a comment that forms are public-read anyway. Not found → 400 "This form is not available."
          3. The form must contain a `resumeUpload` field, else 400 "This form does not accept internship applications." (D1)
          4. `validateInternshipApplication({ fields: form.fields, get: (n) => formData.get(n) })`
          5. `isPdfMagic` on the buffer → 400
          6. create the resume (server-generated filename `resume-<Date.now()>-<8 hex>.pdf`, `overrideAccess: true`)
          7. create the `internship-applications` doc with `{ ...data, extraFields, resume: id, status: 'new', submittedAt }`, `overrideAccess: true`
          8. if step 7 fails, delete the orphan resume (best effort)
        - Response is `{ success: true }` only. Log with `payload.logger.error`, without logging PII or file content.
      e. Delete the aborted-only files:
        - `src/collections/JobApplications.ts`
        - `src/lib/jobApplications/` (whole dir)
        - `tests/int/job-applications.int.spec.ts`
      f. Edit the `applyButtonLink` admin description in `src/blocks/CareerPosting.ts` (description text only, so no schema effect) to: "URL the buttons point to. Leave blank to use /apply (a page with slug "apply" containing a Form Layout block whose form has a Resume Upload field). Each domain's button adds ?domain=<domain title>."
      g. Update the `.gitignore` comment above `/resumes/` to say "internship applications" and keep the `/resumes/` line.
      h. Run `pnpm generate:types`.
      Files: `src/collections/InternshipApplications.ts` (new), `src/collections/Resumes.ts`, `src/payload.config.ts`, `src/app/api/apply/route.ts`, `src/blocks/CareerPosting.ts`, `.gitignore`, `src/payload-types.ts` (generated); deleted: `src/collections/JobApplications.ts`, `src/lib/jobApplications/validateApplication.ts`, `tests/int/job-applications.int.spec.ts`.
      Verify:
        - `pnpm generate:types` exits 0, and `src/payload-types.ts` contains `InternshipApplication`, `Resume`, `showInContactEnquiries` and the form-submission `status`. It must not contain `JobApplication`.
        - `npx tsc --noEmit` exits 0.
        - `npx vitest run --config ./vitest.config.mts tests/int/requests.int.spec.ts tests/int/access-roles.int.spec.ts` passes.

- [x] 3. Drop the empty `job_applications` objects (authorised, conditional), then apply the additive schema.
      a. Run `node scripts/setup-scratch.mjs`. It must print `backup written: backups/cps_pre_add_collections_<stamp>..dump` and `scratch is an exact copy`. Record the backup filename (backup A).
      b. Create the temp script `scripts/_tmp-drop-job-applications.mjs`, modelled on `scripts/drop-legacy-collections.mjs` but importing `readDbConfig`/`clientOptions` from `./lib-db-env.mjs`. It targets ONLY these objects (it must never match `resumes` or `forms_blocks_resume_upload`):
        - table `job_applications` (exact name)
        - enums matching `^enum_job_applications_`
        - column `payload_locked_documents_rels.job_applications_id`, plus constraint `payload_locked_documents_rels_job_applications_fk`
        It prints:
        - `SELECT count(*)::int FROM job_applications`
        - the count of `payload_locked_documents_rels` rows with `job_applications_id IS NOT NULL`
        - the exact statements it would run
        If either count > 0, it prints `ROWS PRESENT — refusing to drop` and exits 1, in both modes.
        Without `--execute`: dry run, changes nothing.
        With `--execute`, in ONE transaction:
          1. `BEGIN`
          2. `LOCK TABLE job_applications IN ACCESS EXCLUSIVE MODE`
          3. re-count; ROLLBACK and exit 1 if > 0
          4. `ALTER TABLE payload_locked_documents_rels DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_job_applications_fk"`
          5. `ALTER TABLE payload_locked_documents_rels DROP COLUMN IF EXISTS "job_applications_id"` (its index goes with it)
          6. `DROP TABLE IF EXISTS public."job_applications"` (no CASCADE; the sequence is owned and goes with it; the FK to resumes lives on this table)
          7. `DROP TYPE IF EXISTS public."<each enum>"` (no CASCADE)
          8. `COMMIT`
          On error: ROLLBACK and exit 1.
        After a successful execute it writes the statements it ran to `dropped-schema.sql`.
      c. Run `node scripts/_tmp-drop-job-applications.mjs` (dry run). Read the output. If rows are present: STOP, don't continue step 3, and report via send_message severity "warning".
      d. Run `node scripts/_tmp-drop-job-applications.mjs --execute`. It must print success. Then delete `scripts/_tmp-drop-job-applications.mjs`.
      e. Run `node scripts/setup-scratch.mjs` again. Record backup B and `scratch is an exact copy`.
      f. Run `npx tsx scripts/push-scratch.mts`. It prints `push finished`.
      g. Run `node scripts/diff-scratch.mjs`, then read `scratch-diff-report.txt` and `scratch-diff.sql`.
        - Red flags: `dropped tables : 0` and `dropped columns : 0`.
        - Changed enums limited to the known noise (R6).
        - Expected additions:
          - table `internship_applications`
          - enums `enum_internship_applications_status` and `enum_form_submissions_status`, plus the excluded noise `enum_header_nav_items_children_type`
          - columns `forms.show_in_contact_enquiries`, `form_submissions.status`, `payload_locked_documents_rels.internship_applications_id`
          - their FK `payload_locked_documents_rels_internship_applications_fk` and indexes
        - Anything else, or any DROP / ALTER of an existing column or type → STOP and report.
      h. Run `node scripts/apply-new-schema.mjs` (dry run) and read the statement list. Then run `node scripts/apply-new-schema.mjs --execute`. It prints `Applied N statements`.
      i. Replace the schema history:
        - Delete `schema-history/20261001_job_applications.sql`.
        - Write `schema-history/20261001_requests_dashboard.sql`. It starts with a header comment: the date, backup A and backup B filenames, and "net change vs backups/cps_pre_add_collections_20261001111716..dump". Then three sections:
          1. "-- kept from the 2026-10-01 aborted run". Copy the `resumes` table/sequence/default/pkey/indexes, the `forms_blocks_resume_upload` table/pkey/indexes/FK, `payload_locked_documents_rels.resumes_id` and its FK and index, all verbatim from the old file. Omit every `job_applications` statement.
          2. "-- authorised drop of the empty job_applications objects (created by the aborted run)". Copy the contents of `dropped-schema.sql`.
          3. "-- requests dashboard additions". Copy the contents of `applied-schema.sql`.
        - Then delete `dropped-schema.sql`.
      Files: `schema-history/20261001_requests_dashboard.sql` (new), `schema-history/20261001_job_applications.sql` (deleted), plus regenerated `scratch-diff.sql`, `scratch-diff-report.txt`, `scratch-setup.log`, `applied-schema.sql`. The temp script is created and deleted.
      Verify: a short `node -e` / temp `.mjs` probe using `scripts/lib-db-env.mjs`, deleted afterwards, confirms all of:
        - `job_applications` and the `enum_job_applications_*` types are gone
        - `payload_locked_documents_rels.job_applications_id` is gone
        - `resumes`, `forms_blocks_resume_upload`, `internship_applications`, `forms.show_in_contact_enquiries` and `form_submissions.status` exist
      Then `npx tsc --noEmit` still exits 0.

- [x] 4. Wire the public apply flow (CareerPosting domain buttons → `/apply?domain=…` → FormBuilderEmbed → `/api/apply`).
      In `src/app/(frontend)/components/blocks/CareerPostingBlock.tsx`:
        - Pass `applyHref` (`applyButtonLink || '/apply'`) and `applyButtonText` into `DomainAccordionItem`.
        - When `applyButtonText` is set and `domain.title` exists, render at the end of the expanded content: `<div style={{ marginTop: '1rem' }}><a className="career-posting__apply-btn" href={withDomain(applyHref, domain.title)}>{applyButtonText}<span className="sr-only"> for {domain.title}</span></a></div>`.
          - `withDomain` appends `?domain=` or `&domain=` plus `encodeURIComponent(title)`.
          - `sr-only` is the Tailwind v4 utility, already used in `AccessibilityWidget.tsx`.
        - The bottom block-level button stays, pointing at `applyHref` with no domain.
        - Add `type="button"` to the accordion trigger.
        - Do not edit `styles.css`.
      In `src/app/(frontend)/components/blocks/FormBuilderEmbed.tsx`:
        - Keep the `variant`/`hideTitle`/`actionsSlot` props, the a11y attributes and the removed "Year of Experience" hack (confirm it's gone; it must not come back).
        - Add `domainParam` state, set in a `useEffect` from `new URLSearchParams(window.location.search).get('domain')?.trim()`, capped at 200 chars.
        - Once `fields` and `domainParam` are known, find the first field where `isDomainField(field)` is true (from `@/lib/requests/fieldHints`):
          - For a select/radio, pick the option whose value or label equals `domainParam` case-insensitively. For a select, set it into `selectValues`. For a radio, use `defaultChecked`.
          - For a text field, render the `<input>` with `key={`${key}-${domainParam ?? ''}`}` and `defaultValue={domainParam}`, so it remounts prefilled.
          - If the form has no domain field and `domainParam` is set, show `<p className="apply-form__hint">Applying for: <strong>{domainParam}</strong></p>` above the grid.
        - Replace the whole `hasResumeUpload` submit branch:
          - If the resume field exists and no file is selected → `setFileError(name, 'Please upload your resume.')` and return.
          - Build `const applyFormData = new FormData(formElement)`. The file input has no `name`, so it is not included.
          - `applyFormData.set('form', String(formDoc.id))`
          - `applyFormData.set('resume', resumeFile)`
          - If there is no domain field and `domainParam` is set, `applyFormData.set('domain', domainParam)`.
          - `fetch('/api/apply', { method: 'POST', body: applyFormData })`.
          - Remove all client-side hint mapping and the job fields (`jobTitle`, addresses, `workStatus`, `yearOfExperience`, `?position=`). Mapping is server-side (D2).
        - The non-resume branch (JSON to `/api/form-submissions`) stays unchanged.
        - Give the top-level error banner `role="alert"`.
      Files: `src/app/(frontend)/components/blocks/CareerPostingBlock.tsx`, `src/app/(frontend)/components/blocks/FormBuilderEmbed.tsx`.
      Verify: `npx tsc --noEmit` exits 0. `npx eslint "src/app/(frontend)/components/blocks/FormBuilderEmbed.tsx" "src/app/(frontend)/components/blocks/CareerPostingBlock.tsx" src/app/api/apply/route.ts src/lib/requests` reports 0 errors.

- [x] 5. Build the Requests Dashboard admin component, register it, and regenerate the import map.
      Create `src/components/admin/RequestsDashboard/RequestsDashboard.tsx` (`'use client'`, named export `RequestsDashboard`). This is DUCC's ApplicationsDashboardCard shell, ported with its inline styles and `var(--theme-*)` fallbacks:
        - `useAuth()` from `@payloadcms/ui`. Return `null` unless `isSiteAdmin(user)` (from `@/access/roles`).
        - `<section aria-labelledby>` with an h2 "Request Management".
        - A toggle button "Requests Dashboard" with the rotating `+`, `type="button"`, `aria-expanded`, `aria-controls`.
        - On first open, fetch both tabs' data in parallel (D6).
        - A tab bar: `role="tablist"`. Each tab is a `role="tab"` button with `aria-selected`, `aria-controls`, `id`, and a count badge: "Internship Applications (N)" and "Contact Enquiries (N)", styled as DUCC.
        - The active panel is `role="tabpanel"` with `aria-labelledby`.
        - Switching tab resets search and filter.
      Create `src/components/admin/RequestsDashboard/ui.tsx`. Shared presentational pieces using DUCC's exact inline styles:
        - `TabHeader` (title, description, Export CSV / Export Excel / `↻ Refresh` buttons, all `type="button"`)
        - `StatRow` (grid of N stats; colours from `STATUS_STYLES`; Total `#1e3a5f`)
        - `FilterBar` (search input with `aria-label`; status pills as `type="button"` with `aria-pressed`; "N result(s)" in an `aria-live="polite"` span)
        - `StatusSelect` (DUCC pill `<select>`, `aria-label={`Status for ${name}`}`, disabled while updating)
        - `ErrorNote` (`role="alert"`)
        - shared `th` / `td` styles. `th` uses `scope="col"`. Decorative glyphs are wrapped in `aria-hidden`.
      Create `src/components/admin/RequestsDashboard/InternshipApplicationsTab.tsx` and `ContactEnquiriesTab.tsx`.
        - Each receives its docs, a loading flag, `onRefresh`, and `onStatusChange` from the shell.
        - Each renders exactly the columns, search fields, pills, stats and export columns listed above under "Table columns".
        - Enquiries map each submission by building entries from `submissionData` (`field` → value), with labels looked up in the flagged form's `fields` by `name`, then calling `mapFieldsByHint(entries, ['email','phone','subject','message','name'])`. The rest are export-only.
        - Exports use `src/lib/requests/exportRows.ts` and the D7 filenames.
      Edit `src/payload.config.ts`: add `components: { afterDashboard: ['@/components/admin/RequestsDashboard/RequestsDashboard#RequestsDashboard'] }` under `admin`.
      Then run `pnpm generate:importmap`.
      Files: `src/components/admin/RequestsDashboard/RequestsDashboard.tsx`, `ui.tsx`, `InternshipApplicationsTab.tsx`, `ContactEnquiriesTab.tsx` (all new), `src/payload.config.ts`, `src/app/(payload)/admin/importMap.js` (generated).
      Verify:
        - `pnpm generate:importmap` exits 0, and `importMap.js` contains `@/components/admin/RequestsDashboard/RequestsDashboard#RequestsDashboard`.
        - `npx tsc --noEmit` exits 0.
        - `npx eslint src/components/admin/RequestsDashboard src/collections/InternshipApplications.ts src/collections/Resumes.ts src/payload.config.ts` reports 0 errors.

- [x] 6. Runtime verification with a temp script, plus an optional browser check.
      Create `scripts/_tmp-verify-requests.mts`, following `scripts/verify-new-collections.mts`: load `.env` manually, set `CMS_DB_PUSH='false'`, then `await import('../src/payload.config.js')` and `getPayload`. It prints PASS/FAIL lines and exits non-zero on any FAIL.
      Setup, all via the Local API with no user (admin bootstrap; comment it as such):
        - Create throwaway users with marker emails `tmp-verify+<role>-<ts>@example.com` and a random password: `admin`, `content_editor` (`allowedCollections: ['pages','news']`), `viewer`.
        - Use the existing super_admin, found with `find users where roles contains super_admin, limit 1`.
        - Create a throwaway form with fields:
          - text "Full Name" (required)
          - email "Email" (required)
          - text "Phone"
          - select "Domain" (options A/B)
          - text "College Name"
          - text "Year / Semester"
          - textarea "Why this domain"
          - `resumeUpload` "Resume"
        - Create a throwaway contact form with `showInContactEnquiries: true` and fields Name/Email/Subject/Message.
      Apply path: import `POST` from `../src/app/api/apply/route.ts` and call it with `new NextRequest('http://localhost/api/apply', { method: 'POST', body: formData })`. If that import fails under tsx, fall back to an HTTP POST against `http://localhost:3666/api/apply`, but only if that port responds; otherwise record "apply route not exercised". Cases:
        - valid submission + minimal PDF bytes (`%PDF-1.4\n%%EOF`) + client `status=approved` + an extra answer
          → 200 `{ success: true }`
          → stored doc (found by marker email) has `status === 'new'`, `submittedAt` set, `domain`/`institution`/`yearOrSemester` mapped, `extraFields["Why this domain"]` present, and a linked resume
        - `?domain` fallback: a form without a domain field + `domain` entry → domain stored
        - `text/plain` file → 400
        - PDF-typed file without `%PDF-` magic → 400
        - 5 MB + 1 → 413
        - bad email → 400
        - missing required "Full Name" → 400
        - missing resume → 400
        - a form without `resumeUpload` → 400
      Enquiry: Local API `create` of a form-submission with no user and `status: 'closed'` in data → the stored status is `new`.
      Access (Local API, `overrideAccess: false`, explicit `user`):
        - For `internship-applications`, `resumes` and `form-submissions`, `find` + `update({ status })` succeed for `super_admin` and `admin`. For resumes, update only `applicantName`.
        - For `content_editor`, `viewer` and no user, they throw Forbidden or return 0 docs.
        - `create` of `internship-applications` as `content_editor` is refused.
        - `create` of `resumes` as `admin` is refused (`create: () => false`).
      Cleanup, always in a `finally`:
        - delete the test applications (the cascade removes resumes) and assert the resume docs are gone
        - delete the test submissions, forms and throwaway users
        - assert none of them remain (found by marker)
      Run it with `npx tsx scripts/_tmp-verify-requests.mts`, then delete the script.
      Optional browser check, ONLY if `Invoke-WebRequest http://localhost:3666/admin/login -UseBasicParsing` responds. Never start a server. Use `playwright-core` with the Chromium at `%LOCALAPPDATA%\ms-playwright\chromium-*\chrome-win\chrome.exe` and `page.addInitScript('window.__name = (f) => f')`, in a temp script deleted afterwards. Use throwaway admin/editor users created and deleted as above. Check:
        - Admin: open `/admin`, click "Requests Dashboard". Both tabs render, with the exact header texts from "Table columns".
        - Editor: "Request Management" is absent.
        - An unauthenticated GET of a created resume's `/api/resumes/file/<filename>` returns 403.
        If the server is not running, record "not visually verified".
      Files: `scripts/_tmp-verify-requests.mts` (temp, deleted), plus an optional temp Playwright script (deleted).
      Verify: the script prints only PASS lines and exits 0. `Get-ChildItem scripts/_tmp-*requests*` returns nothing afterwards.

- [x] 7. Final checks and the verification note.
      Run:
        - `npx tsc --noEmit`
        - `npx eslint` on every changed/new file: `src/lib/requests`, `src/collections/InternshipApplications.ts`, `src/collections/Resumes.ts`, `src/payload.config.ts`, `src/app/api/apply/route.ts`, `src/components/admin/RequestsDashboard`, both block components, `src/blocks/CareerPosting.ts`. Must report 0 errors.
        - `pnpm test:int`. `tests/int/api.int.spec.ts` needs the DB; record its result.
      Confirm with `git status --short` that:
        - nothing was committed
        - no `_tmp-*` scripts remain
        - `src/collections/JobApplications.ts`, `src/lib/jobApplications/` and `schema-history/20261001_job_applications.sql` are gone
        - `styles.css` has no new diff hunks beyond those present before this task (compare `git diff --stat "src/app/(frontend)/styles.css"` to the planning-time value: 660 lines, +/−)
      Write `c:\Users\Admin\Desktop\CPS\cps_web\.agents\tasks\requests-dashboard\verification.md`. Keep it short, but it must contain:
        - files added / changed / removed
        - the reconciliation (what was kept, replaced, deleted, left untouched)
        - the apply flow and editor setup:
          1. create a form with a Resume Upload field and a Domain field
          2. create page `apply` with a Form Layout block for it
          3. set the Career Posting apply text; each domain's button links to `/apply?domain=<title>`
        - contact setup: tick "Show submissions in Contact Enquiries" on the contact form used by the Contact Section block
        - access rules (D5)
        - the schema delta: `scratch-diff-report.txt` content, the apply-new-schema counts, the drop output, backup A/B filenames
        - export columns
        - the step-6 PASS lines
        - what was not verified
        - the R1–R7 outcomes
      Files: `.agents/tasks/requests-dashboard/verification.md`.
      Verify: the file exists, and every step-3 and step-6 result appears in it. The reviewer reads it together with `git diff` / `git status` and writes `review.json`.

## Reviewer checklist

- The column headers and order in both tabs match "Table columns" exactly. Every non-column field appears only in the exports.
- Every Local API call that passes `user` also sets `overrideAccess: false`. Every `overrideAccess: true` has a justifying comment (apply route, beforeDelete cascade, verify-script bootstrap).
- Hooks pass `req` to nested calls.
- Status is forced to `new` on create for both collections. `submittedAt` is server-set.
- `authorAssignableCollections` is unchanged. Both new and existing PII collections are site-admin only and hidden otherwise. The dashboard renders `null` for non-site-admins.
- `/resumes/` is gitignored. The `staticDir` env fallback is `'resumes'`.
- Only `job_applications` objects were dropped, after a 0-row check and a backup. `resumes` and `forms_blocks_resume_upload` were untouched.
- No unrelated work was changed (`styles.css`, ProjectShowcase, ContactSection, etc.). Nothing was committed.
