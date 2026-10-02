# Verification: Requests Dashboard

Run on 2026-10-01/02, in place in `cps_web`. Nothing committed (`git log -1` is still `1f90215`). Steps 1–5 were done by an earlier run that died on an auth error. This run audited them against the brief and plan, fixed one bug (below), then did steps 6–7.

## Files

Added:
- `src/collections/InternshipApplications.ts`
- `src/lib/requests/statuses.ts`, `fieldHints.ts`, `validateApplication.ts`, `exportRows.ts`
- `src/components/admin/RequestsDashboard/RequestsDashboard.tsx`, `ui.tsx`, `InternshipApplicationsTab.tsx`, `ContactEnquiriesTab.tsx`
- `tests/int/requests.int.spec.ts`
- `schema-history/20261001_requests_dashboard.sql`

Changed:
- `src/collections/Resumes.ts`: imports from `lib/requests`, group "Requests", wording.
- `src/app/api/apply/route.ts`: rewritten for internship applications.
- `src/payload.config.ts`:
  - registers `Resumes` + `InternshipApplications`
  - `afterDashboard` component
  - Forms `showInContactEnquiries` checkbox
  - form-submissions `status` field + a create hook that forces `new`
  - existing forms/form-submissions access and `admin.hidden` unchanged
- `src/blocks/CareerPosting.ts`: `applyButtonLink` description only.
- `CareerPostingBlock.tsx`, `FormBuilderEmbed.tsx`
- `.gitignore`: `/resumes/`
- Generated: `src/payload-types.ts`, `src/app/(payload)/admin/importMap.js`
- Regenerated: `scratch-diff.sql`, `scratch-diff-report.txt`, `scratch-setup.log`, `applied-schema.sql`

Removed:
- `src/collections/JobApplications.ts`
- `src/lib/jobApplications/`
- `tests/int/job-applications.int.spec.ts`
- `schema-history/20261001_job_applications.sql`

All four are confirmed absent.

### Fix made in this run

`/api/apply` returned 500 "Something went wrong" for every real submission whose PDF had no `xref`/`%%EOF` trailer. Payload's own upload check (`validatePDF`) needs that trailer and throws a `ValidationError`.

The route now catches a `ValidationError` raised while creating the resume and returns 400 "This file is not a valid PDF. Please upload a different file." Real PDFs are unaffected. The runtime check found this.

## Reconciliation

- **Kept:**
  - `Resumes` (access, upload config, 5 MB hook)
  - the `resumeUpload` form-builder block, unchanged
  - the validation helpers (`MAX_RESUME_BYTES`, `isPdfMagic`, `EMAIL_RE`, `PHONE_RE`)
  - the apply route's structure
  - FormBuilderEmbed's a11y attributes and `variant`/`hideTitle`/`actionsSlot`
- **Replaced:**
  - `JobApplications` → `InternshipApplications`
  - client-side hint mapping → server-side (`lib/requests/fieldHints.ts`)
- **Deleted:** the aborted-only files above. The "Year of Experience" hack is gone and stays gone.
- **Untouched:**
  - `styles.css`: `git diff --stat` is still 660 lines (+241/−419), the same as at planning time.
  - ProjectShowcase, ContactSection, AccessibilityStatement and the other pre-existing modified files.
  - The pre-existing `scripts/_tmp-theme-check.mjs` and `scripts/_probe-social.mts` (dated 2026-09-02, not from this task) were left alone.

## Apply flow and editor setup

1. Create a Form with a **Resume Upload** field and a **Domain** field (select or text). Also add Name, Email and optionally Phone, College/University and Year/Semester. Clear labels help the mapping (R1). D1: a form opts in by containing a Resume Upload field. There is no separate checkbox.
2. Create a page with slug `apply` containing a **Form Layout** block for that form.
3. On the Career Posting block, set the apply button text. Each Problem Domain gets a button to `/apply?domain=<domain title>`. The block-level button goes to `/apply` (or `applyButtonLink`).
4. On `/apply`, FormBuilderEmbed preselects the matching Domain option (or prefills a text field). Without a domain field, it shows "Applying for: X" and sends `domain`.
5. The form posts multipart to `POST /api/apply`. The server loads the form, requires a `resumeUpload` field and validates everything. It then creates the resume (server-generated filename) and the application, with status `new`, server-set `submittedAt`, mapped fields, and the rest in `extraFields`.

## Contact enquiries setup

Tick **"Show submissions in Contact Enquiries"** (Forms sidebar) on the form used by the Contact Section block. The tab lists the form-submissions of flagged forms. It maps name/email/phone/subject/message by hint; every other field is export-only. A new submission is always created as status `new`.

## Access (D5)

| Collection | create | read / update / delete | admin.hidden |
|---|---|---|---|
| `internship-applications` | `siteAdminAccess` (public only via `/api/apply`) | `siteAdminAccess` | `hiddenUnlessSiteAdmin` |
| `resumes` | `() => false` (only `/api/apply`) | `siteAdminAccess` | `hiddenUnlessSiteAdmin` |
| `form-submissions` | `publicAccess` (existing) | `siteAdminAccess` (existing) | `hiddenUnlessSiteAdmin` (existing) |

- Resume files live in `CMS_RESUMES_UPLOAD_DIR || 'resumes'`, outside `public/`, gitignored. They are only served via the access-checked `/api/resumes/file/:filename`.
- The dashboard renders `null` unless `isSiteAdmin(useAuth().user)`. Its data comes from REST with the session cookie, so it is access-checked.
- No Local API call passes `user` without `overrideAccess: false`. Each `overrideAccess: true` has a comment (apply route ×3, beforeDelete cascade ×2).
- The beforeDelete hook passes `req`.
- `authorAssignableCollections` is unchanged. No custom Payload endpoint was added.

## Schema delta

The previous run did the authorised drop and the additive apply. This run made no schema change; the route fix is code only.

- **Backups:**
  - backup A, before the drop: `backups/cps_pre_add_collections_20261001122944..dump`
  - backup B, after the drop and before the additions: `backups/cps_pre_add_collections_20261001123113..dump`
  - the history file's net change is against `backups/cps_pre_add_collections_20261001111716..dump`
- **Drop:**
  - Done in one transaction after `count(*) = 0` and 0 lock rows.
  - It dropped `payload_locked_documents_rels_job_applications_fk`, `payload_locked_documents_rels.job_applications_id`, table `job_applications`, and types `enum_job_applications_status` and `enum_job_applications_work_status`.
  - `resumes` and `forms_blocks_resume_upload` were not touched.
  - The temp drop script and `dropped-schema.sql` are deleted.
  - The dead run's console output was lost; the statements are recorded in the history file.
- **`scratch-diff-report.txt`:**
  - new tables: `internship_applications`
  - new enums: `enum_form_submissions_status`, `enum_internship_applications_status`, plus `enum_header_nav_items_children_type` (known noise, excluded)
  - new columns: `form_submissions.status`, `forms.show_in_contact_enquiries`, `payload_locked_documents_rels.internship_applications_id`
  - red flags: dropped tables 0, dropped columns 0. The 4 changed enums are the known noise (3× `*_x_mode`, `enum_users_roles`).
- **Applied:** `applied-schema.sql` has 16 statements.
- **History file:** `schema-history/20261001_requests_dashboard.sql` has three sections: kept from the aborted run, the authorised drop, and the additions.
- **Live DB state** (verified before this run, and exercised by the checks below): the `job_applications` objects are gone. `resumes`, `forms_blocks_resume_upload`, `internship_applications`, `forms.show_in_contact_enquiries` and `form_submissions.status` exist.

## Export columns

- **Internship:** `ID, Submitted, Status, Name, Email, Phone, Domain, College / University, Year / Semester, Resume File`, then one column per distinct `extraFields` key (first-seen order).
- **Enquiries:** `ID, Received, Status, Form, Name, Email, Phone, Subject, Message` (full text), then one column per other submission field, keyed by its label or name.
- Both cover the active tab's filtered and searched rows.
- Every cell is formula-guarded (`= + - @` tab CR → leading `'`) and CSV-quoted.
- File names: `internship-applications-<stamp>.csv|xls` and `contact-enquiries-<stamp>.csv|xls`.

## Commands run (this run)

- `pnpm generate:types` → exit 0. The types contain `InternshipApplication`, `Resume`, `showInContactEnquiries` and the form-submission `status`; there is no `JobApplication`.
- `pnpm generate:importmap` → exit 0 ("No new imports found"). `importMap.js` contains `@/components/admin/RequestsDashboard/RequestsDashboard#RequestsDashboard`.
- `npx tsc --noEmit` → exit 0, before and after the route fix.
- `npx eslint` on all changed and new files (`src/lib/requests`, both collections, `payload.config.ts`, the apply route, `RequestsDashboard/`, both block components, `CareerPosting.ts`, the new spec) → **0 errors**, 3 warnings. The warnings are pre-existing `no-explicit-any` in CareerPostingBlock:19 and FormBuilderEmbed:356/386.
- `npx vitest run … tests/int/requests.int.spec.ts tests/int/access-roles.int.spec.ts`:
  - `requests.int.spec.ts`: **15/15 pass**.
  - `access-roles.int.spec.ts`: 11 pass, **4 fail**. This is **pre-existing and unrelated**:
    - `src/access/roles.ts` was redesigned on 2026-09-30 by the earlier "scoped editor access" work (`schema-history/20260930_scoped_editor_access.sql`). That change made `isEditor = isSiteAdmin`, so content_editor is no longer a full editor.
    - The spec (last modified 2026-08-29) still expects the old model.
    - This task does not touch `roles.ts` or that spec, so I did not rewrite them.
- `pnpm test:int`: 27 pass / 4 fail (the same 4 access-roles failures). `api.int.spec.ts` passes against the DB.

## Step 6 runtime check

`scripts/_tmp-verify-requests.mts` was run with the Local API (`overrideAccess: false` + explicit users) and then deleted.
- It used throwaway admin/content_editor/viewer users and the existing super_admin.
- The apply route was exercised by importing `POST` directly.
- `localhost:3666` was already running, so the HTTP and Playwright checks ran too. No server was started.

Final run: **all PASS**.

```
PASS  apply: valid submission -> 200 {success:true}, stored with status new
      (client status=approved and submittedAt=2000 ignored; domain/institution/yearOrSemester/name/phone
       mapped; extraFields["Why this domain"] set; linked resume is application/pdf named resume-<ts>-<hex>.pdf)
PASS  apply: ?domain fallback when the form has no domain field
PASS  apply rejects text/plain file -> 400
PASS  apply rejects PDF type without %PDF- magic -> 400
PASS  apply rejects %PDF- header without xref/%%EOF trailer -> 400
PASS  apply rejects 5 MB + 1 byte -> 413
PASS  apply rejects bad email -> 400
PASS  apply rejects missing required "Full Name" -> 400
PASS  apply rejects missing resume -> 400
PASS  apply rejects missing domain (no field, no URL value) -> 400
PASS  apply rejects form without resumeUpload -> 400
PASS  apply rejects missing form id -> 400
PASS  apply: rejected submissions left no resume or application behind
PASS  enquiry: Local API create with status "closed" is stored as "new"
PASS  super_admin can read + update internship-applications / resumes / form-submissions   (3 lines)
PASS  admin can read + update internship-applications / resumes / form-submissions         (3 lines)
PASS  content_editor | viewer | anonymous cannot read / read by id / update / delete
      internship-applications | resumes | form-submissions (Forbidden)                     (36 lines)
PASS  content_editor cannot create internship-applications (Forbidden)
PASS  admin cannot create resumes (create: () => false) (Forbidden)
PASS  records unchanged after denied writes
PASS  HTTP: public POST /api/form-submissions with status "closed" is stored as "new"
PASS  HTTP: unauthenticated GET of the resume file -> 403
PASS  HTTP: unauthenticated GET /api/internship-applications, /api/resumes, /api/form-submissions -> 403
      tabs: "Internship Applications(2)" | "Contact Enquiries(2)"
      internship headers: Name | Domain | College / University | Year / Semester | Contact | Status | Resume
      enquiry headers: Name | Contact | Subject | Message | Received | Status
PASS  browser (admin): both tabs render with the exact columns
      (Download link target=_blank rel="noopener noreferrer"; message cell has full-text title)
PASS  browser (content_editor): Request Management absent
PASS  cleanup: deleting 2 applications removed their 2 resumes (cascade)
PASS  cleanup: no throwaway docs or users remain {"applications":0,"resumes":0,"forms":0,"submissions":0,"users":0}
```

The tab text reads "(2)" because the parentheses are visually hidden; they are there for screen readers.

## Not verified

- The public `/apply` page in a browser: there is no `apply` page or Career Posting usage in the DB yet. FormBuilderEmbed's domain preselect and the multipart submit were checked by code review and tsc only. The server side was exercised directly.
- An actual CSV/Excel download in a browser: the builders are unit-tested, and the column lists were checked by review.
- The status `<select>` PATCH from the UI: the same update was exercised via the Local API as admin and super_admin.
- Dark theme appearance (R3).

## R1–R7

- **R1:** Hint mapping is heuristic. "Years of experience" would map to Year / Semester. Unmapped values always go to `extraFields` / the export, so nothing is lost. Editors should use clear labels.
- **R2:** There is no rate limit or CAPTCHA on `/api/apply` or `/api/form-submissions`. Left as a follow-up.
- **R3:** DUCC's inline light colours (`#fff`, `#f9fafb`) are kept and won't adapt to Payload's dark theme.
- **R4:** "Excel" is TSV named `.xls`, as in DUCC. Excel shows a format warning when opening it.
- **R5:** `job_applications` had 0 rows (and 0 lock rows), so the drop went ahead.
- **R6:** The diff had no drops or alters beyond the known noise, so the apply went ahead.
- **R7:** `payload_preferences` rows for `job-applications` (if any) were left alone.

Known limitation: each tab loads at most 500 rows, with no pagination (as in DUCC). The UI says "Showing the latest N of M" when there are more.
