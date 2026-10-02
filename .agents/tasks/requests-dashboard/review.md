# Requests Dashboard: internship applications and contact enquiries in the Payload admin

The change replaces the aborted "job applications" restore with a DUCC-style Requests Dashboard on `/admin`, with two tabs. Internship Applications is backed by a new `internship-applications` collection. A validated public `POST /api/apply` route fills it, and CareerPosting domain buttons feed it through `/apply?domain=…`. Contact Enquiries is a view over Form Builder submissions from forms flagged "Show submissions in Contact Enquiries". The dashboard is a client component registered at `afterDashboard`. It reads and patches data over Payload REST with the admin's session, and builds CSV/TSV exports in the browser. On the database side, the empty `job_applications` objects were dropped after a 0-row check and a backup, and everything else is additive.

Watch for: on the public apply route, an email that passes the route's own regex but fails Payload's stricter email validator gets a 500 "Something went wrong" instead of a clear 400 (confirmed). The route's 6 MB guard only applies when a `Content-Length` header is sent, so a body without one is buffered in full (likely). Neither is a PII leak or an access-control gap.

**Verdict**: APPROVED

## High-level view

Access control holds. Resumes and internship applications refuse public writes (`create: () => false` and `siteAdminAccess`). Reads and updates are limited to site admins, and both collections are hidden from everyone else. Resume files are stored in `CMS_RESUMES_UPLOAD_DIR || 'resumes'`, outside `public/` and gitignored, and are downloaded only through Payload's access-checked `/api/resumes/file/…` path. The implementer's HTTP check shows an unauthenticated request there gets 403. No new code passes `user` to the Local API. The `overrideAccess: true` calls are limited to the apply route and the beforeDelete cascade.

The apply route is the only public way to create an application. It loads the form definition on the server and requires a Resume Upload field. It reads only the field names that form defines, plus `domain` and `resume`. It also checks the PDF magic bytes. The server, not the client, sets the status, `submittedAt` and the stored filename. Field-to-column mapping happens on the server through one hint module, which the dashboard reuses for enquiries. Any submitted value that doesn't match a column goes to `extraFields` or to the export.

Both tabs use exactly the headers and order in the plan. Internship: Name, Domain, College / University, Year / Semester, Contact, Status, Resume. Enquiries: Name, Contact, Subject, Message, Received, Status. Every other field shows up only in the CSV/Excel export, and both export column lists match the plan. The status pills are controlled selects that only change after the PATCH succeeds, so a failed update leaves the old value in place.

The schema change is clean. The history file has three sections: what was kept (`resumes`, `forms_blocks_resume_upload`), the authorised drop of the `job_applications` objects, and the additions (`internship_applications`, two enums, `forms.show_in_contact_enquiries`, `form_submissions.status`, the lock-rels column). `styles.css` has the same diff stat as at planning time (+241/−419), the accessibility and ProjectShowcase files weren't touched, and HEAD is still `1f90215`.

The remaining gaps are on the public route: two validation and robustness edges, listed below. They also don't have a rate limit (R2, already recorded as a follow-up).

<details>
<summary>Issues (4)</summary>

1. **Email regex weaker than Payload's** — the route's `EMAIL_RE` accepts addresses that Payload's `email` field validator rejects, e.g. `jane.@example.com`, `a..b@example.com` or a non-alphabetic TLD. Those submissions create a resume, fail on the application create, roll the resume back, and return a generic 500. Either tighten `EMAIL_RE` to match Payload's regex, or map a `ValidationError` from the application create to a 400 too.
2. **Body-size guard depends on Content-Length** — `MAX_BODY_BYTES` is checked only against the header, and `request.formData()` then buffers the whole body. Enforce the limit on the stream or at the proxy, alongside the R2 rate-limit follow-up.
3. **Orphan-resume delete comment** — the fourth `overrideAccess: true` in the apply route (the best-effort resume cleanup) has a purpose comment but doesn't say why bypassing access is fine. `verification.md` also counts "apply route ×3" when there are 4. Add a one-line justification so it matches the rule.
4. **Untested client paths** — the FormBuilderEmbed domain preselect and multipart submit, the UI status PATCH, and actual CSV/Excel downloads were only reviewed and type-checked. Exercise them once an `apply` page exists.

</details>

<details>
<summary>Details</summary>

### Trust boundary on `POST /api/apply`

```
CareerPosting domain button ──► /apply?domain=<title> ──► FormBuilderEmbed
                                                            │ multipart: form id, field values, resume, [domain]
                                                            ▼
                                    POST /api/apply (no user)
                                      ├─ findByID forms (overrideAccess; forms are public-read)
                                      ├─ requires a resumeUpload field
                                      ├─ validateInternshipApplication (only names the form defines)
                                      ├─ isPdfMagic
                                      ├─ create resumes            (overrideAccess, server filename)
                                      └─ create internship-applications (overrideAccess; the hook forces status/submittedAt)
```

The route is a good shape for an unauthenticated write path. Because the server loads the form definition, a client can't point an arbitrary form at the internship collection or slip `status`, `submittedAt`, `extraFields` or a resume id into the stored document. The `beforeChange` hook forces `status = 'new'` and `submittedAt` on every create, so a site admin creating a record through REST can't backdate it either. The response is just `{ success: true }`, and the error log carries no applicant data.

Validation has one gap (confirmed). `EMAIL_RE` is `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`, but the collection's `email` field runs Payload's validator in `node_modules/payload/dist/fields/validations.js:107`. That validator rejects consecutive dots, a local part ending in a dot, and a TLD that isn't letters only. Any address in that gap passes `validateInternshipApplication`, the resume gets created, and then the application create throws a `ValidationError`. The catch block maps a `ValidationError` to a 400 only while `resumeId === null`, so this case logs, deletes the orphan resume, and returns 500 "Something went wrong. Please try again." The failure is closed and nothing is left behind, but the applicant never learns what to fix. That falls short of the brief's "server-side validation with clear errors".

The body-size guard has a second gap (likely). `MAX_BODY_BYTES` is checked against the `content-length` header only. A chunked request sends no length, reads as `0`, and gets through, and then `request.formData()` buffers the entire body before the 5 MB file check runs. Next route handlers don't cap the body the way the old API routes did. Together with the missing rate limit (R2), a public endpoint can be made to buffer arbitrarily large requests. A reverse proxy body limit would close this in deployment, but nothing in the repo shows one.

### Resume storage and download path

`Resumes` keeps the aborted run's rules: create is off for everyone, reads and updates are `siteAdminAccess`, and the collection is hidden from everyone else. The 5 MB cap is enforced server-side in `beforeOperation`. The dashboard links to `resume.url` with `depth=1`, and that URL is Payload's `/api/resumes/file/<filename>`, which runs the collection's read access. Files are stored by server-generated name (`resume-<ts>-<8 hex>.pdf`), so applicant input never reaches the filesystem path. The application's `beforeDelete` passes `req` to its nested `findByID`/`delete`, so the cascade stays in the delete's transaction. The runtime check shows deleting two applications removed their two resumes.

The cleanup branch of the apply route is the fourth `overrideAccess: true` site. Its comment ("Best effort: do not leave a resume without an application") gives the purpose but not the access rationale, and `verification.md` says the apply route has three such calls. This is cosmetic, but the reviewer checklist asks for a justifying comment on every bypass.

### Contact Enquiries as a view over form-submissions

The plugin overrides add `showInContactEnquiries` to Forms, plus a required `status` select and a create-only hook forcing `new` to form-submissions. The existing access is kept: public create, site-admin read/update/delete, hidden unless site admin. The HTTP check confirms that a public `POST /api/form-submissions` sending `status: "closed"` is stored as `new`. The dashboard fetches in two steps, first the flagged forms and then `where[form][in]=…`, so it doesn't rely on nested relationship queries. Labels come from the form's `fields`, and `mapFieldsByHint` puts everything unmapped into the export only. When two answers share a label, the export joins them with ` | ` in one column rather than dropping one. The internship path does the same job by suffixing ` (2)`.

### Dashboard rendering, columns and exports

`RequestsDashboard` returns `null` unless `isSiteAdmin(user)`, and its comment says that this is presentation only. All of its data comes from REST with `credentials: 'include'`, so collection access still decides what comes back. In the browser check, a content_editor saw no "Request Management" section, and an admin saw both tabs with the exact header strings.

The export builders put a leading `'` on any cell starting with `= + - @`, tab or CR. That protects against formula injection, and every cell is CSV-quoted. Exports cover only the active tab's filtered rows, and the filenames carry the tab name. Each tab loads at most 500 rows with no pagination. The UI says "Showing the latest N of M" when rows are cut off, and this is recorded as a known limitation.

### Test coverage

`tests/int/requests.int.spec.ts` (15 tests) covers hint priority, validation, size limits, the PDF magic check, and CSV quoting/guarding. The temp runtime script covered the apply route end to end, role access for all three PII collections across five roles, status forcing, the 403 on the resume file, and the cascade cleanup. `access-roles.int.spec.ts` still has 4 failures, which come from the earlier scoped-editor redesign of `roles.ts` (modified 2026-09-30, before this task). They are out of scope here.

Not tested: the FormBuilderEmbed domain preselect and multipart submit in a browser (there is no `apply` page yet), the status `<select>` PATCH from the UI, actual CSV/Excel downloads, the email-regex mismatch above, and a request with no `Content-Length`.

</details>

<details>
<summary>File map</summary>

- `src/collections/InternshipApplications.ts`: new site-admin-only collection; the create hook forces status/submittedAt; the beforeDelete cascade removes the resume.
- `src/collections/Resumes.ts`: imports from `lib/requests`, "Requests" group, wording changes; access and upload config unchanged.
- `src/lib/requests/{statuses,fieldHints,validateApplication,exportRows}.ts`: shared statuses and colours, hint mapping, apply validation, CSV/TSV builders.
- `src/app/api/apply/route.ts`: public internship apply route, server-side mapping, PDF checks.
- `src/components/admin/RequestsDashboard/*`: dashboard shell, two tabs, shared DUCC-styled UI.
- `src/payload.config.ts`: registers the collections and `afterDashboard`, the Forms checkbox, form-submission `status` plus the create hook, the `resumeUpload` block.
- `src/app/(frontend)/components/blocks/CareerPostingBlock.tsx`: per-domain apply buttons to `/apply?domain=`; fallback `/apply`.
- `src/app/(frontend)/components/blocks/FormBuilderEmbed.tsx`: domain preselect/prefill, multipart submit to `/api/apply`, "Year of Experience" hack removed, a11y attributes.
- `src/blocks/CareerPosting.ts`: `applyButtonLink` description only.
- `.gitignore`: `/resumes/`.
- `schema-history/20261001_requests_dashboard.sql`: net schema change, including the authorised drop; replaces `20261001_job_applications.sql`.
- Generated: `src/payload-types.ts`, `src/app/(payload)/admin/importMap.js`. Removed: `JobApplications.ts`, `lib/jobApplications/`, `job-applications.int.spec.ts`.
- `tests/int/requests.int.spec.ts`: unit tests for the shared modules.

Full diff: `git -C c:\Users\Admin\Desktop\CPS\cps_web diff` plus the untracked files in `git status --short`.

</details>
