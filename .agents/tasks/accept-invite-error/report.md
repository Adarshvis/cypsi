# Accept-invite 500: "Could not complete the invitation."

## Summary

Most likely cause (high confidence, deterministic code bug, not environment): the account IS created, then the route's follow-up `payload.update` on the invitation fails validation because the Invitations `email` field validator rejects any email that already belongs to a user, and at that moment the user it just created owns that email.

Sequence in `POST /api/invitations/accept`:

1. `payload.create({ collection: 'users', ... })` succeeds and commits (own transaction, no `req`) — `src/app/api/invitations/accept/route.ts:176`.
2. `payload.update({ collection: 'invitations', data: { status: 'accepted', ... } })` — `route.ts:191`.
3. Payload's update pipeline back-fills `email` from the stored doc (beforeValidate fallback) and runs the field's `validate` — `src/collections/Invitations.ts:89-121`.
4. The validator queries `users` by email (`Invitations.ts:111-118`), finds the brand-new user, returns `'A user with this address already exists.'`.
5. Payload throws `ValidationError` ("The following field is invalid: Email", HTTP 400 inside Payload). The route's catch (`route.ts:225-233`) only special-cases `/duplicate|unique/`, so it returns the generic 500.

Every retry hits the same error via a second path: the "existing user" branch (`route.ts:152-167`) also calls `payload.update` on the invitation, which fails the same validator, so the friendly 409 is never reached either.

Net production state for this user: the Users row exists with role `content_editor` and the password they typed; the invitation is stuck at `pending`; no welcome email was sent. The user can most likely sign in at `/admin` right now.

This bug affects every invitation acceptance, for every role. It is not specific to Content Editor or this user.

## Evidence

### Payload behaviour (verified in installed source, payload 3.77.0)

- `node_modules/payload/dist/collections/operations/utilities/update.js:82` runs `beforeValidate` with `doc: originalDoc`. Then `:132-153` runs `beforeChange` with `skipValidation` false (it is only true for drafts/trash).
- `node_modules/payload/dist/fields/hooks/beforeValidate/promise.js:179-235`: when a field is absent from `data`, it gets `getFallbackValue`, which clones `siblingDoc[field.name]` (the stored value). So `email` is filled in on a partial update.
- `node_modules/payload/dist/fields/hooks/beforeChange/promise.js:86-97`: `field.validate(siblingData[field.name], ...)` is called for that back-filled value. `overrideAccess: true` does not skip validation.
- `node_modules/payload/dist/errors/ValidationError.js`: the message is `"The following field is invalid: <label>"`. It does not contain "duplicate" or "unique".

### Project code

- `src/collections/Invitations.ts:89-121`: the email `validate` rejects when (a) another pending invitation has the address (excluding own `id`, so that check is fine), or (b) **any user has the address** (no exclusion for `acceptedUser`, `operation`, or status transitions).
- `src/app/api/invitations/accept/route.ts:154-163` (existing-user branch) and `:191-199` (post-create) both do a partial update of the invitation, so both trip (b).
- Other invitation updates don't trip it, which is why creating and resending invitations works in production. Those are the GET expiry update (`route.ts:70`), the resend endpoint (`Invitations.ts` `/:id/resend`), and `recordEmailStatus`. In each case no user exists for the address yet.
- `route.ts:176` and `:191` run without a shared `req`/transaction. So the user insert commits even though the invitation update fails (the AGENTS.md "Transaction Safety" concern). This is why the user ends up half-onboarded instead of rolled back.

### Things ruled out or unlikely

Ranked from "possible but unlikely" down to "ruled out":

| # | Candidate | Verdict | Evidence |
|---|-----------|---------|----------|
| 2 | `allowedPages` contains a page id that no longer exists (FK `users_rels_pages_fk`) | Unlikely | `invitations_rels` FK to pages is `ON DELETE CASCADE` (`schema-history/20260930_scoped_editor_access.sql`), so deleted pages drop out of the invitation. |
| 3 | Prod enum drift: `enum_users_roles` lacks `content_editor`, or `enum_users_allowed_collections` lacks a value such as `documents` | Unlikely | `content_editor` was in the original users enum. Local DB order is `super_admin,school_admin,content_editor,viewer,admin,author`; `scripts/migrate-roles.mjs` only had to add `admin`/`author`. Both allowed-collections enums were created together (`schema-history/20260828_invitations_and_author_scoping.sql`) and extended by the same `scripts/add-enum-values.mjs`. `scratch-diff-report.txt` flags `enum_users_roles` as "changed" because of the legacy `school_admin` label and its order, not a missing value. |
| 4 | Missing tables (`users_rels`, `users_sessions`, `users_allowed_collections`) | Unlikely | Any users read would fail, so admins couldn't log in or create the invitation. All exist locally. |
| 5 | Missing env vars (PAYLOAD_SECRET, SMTP_*, NEXT_PUBLIC_APP_URL) | Ruled out for the 500 | The welcome email block, including `findGlobal`/`getPublicUrl`/`sendEmail`, has its own swallowed try/catch (`route.ts:203-223`). Users `auth: true` has no verify email. A missing PAYLOAD_SECRET would break all auth. |
| 6 | Password policy | Ruled out | No custom password validation. The route only checks length ≥ 8. |
| 7 | Users hooks throwing | Ruled out | Users has only `beforeValidate` (pure) and `afterLogin` (wrapped in try/catch) — `src/collections/Users.ts`. The Invitations `afterChange` returns early for `operation !== 'create'` (`Invitations.ts:264`). |

Side note, unrelated to the 500: `.env.example` lists `DATABASE_URL` and `RESUMES_UPLOAD_DIR`, but the code reads `CMS_DATABASE_URL` (`payload.config.ts`) and `.env` uses `CMS_RESUMES_UPLOAD_DIR`. `.env.example` also omits `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_SENDER_EMAIL`, `SMTP_SENDER_NAME`.

### Local DB check (read-only transaction)

- All five relevant enums contain the values the code expects. `users_rels`, `invitations_rels`, `users_sessions`, `users_allowed_collections` and `users_roles` all exist.
- The local `invitations` table is empty, so the local DB is not production. The failure could not be observed in data locally.

## Where the real error appears in prod logs

Nowhere today. The catch at `route.ts:225-233` neither logs nor rethrows, and errors thrown from the Local API are not logged by Payload itself (only its REST handlers log). Searching the app logs for "ValidationError" or "invalid: Email" will find nothing. At most, a reverse proxy access log will show `POST /api/invitations/accept` with status 500.

## Quickest confirmation

1. On the production DB (read-only), run:
   `SELECT i.id, i.status, u.id AS user_id, u.created_at > i.created_at AS user_created_after_invite FROM invitations i JOIN users u ON lower(u.email) = lower(i.email) WHERE i.status = 'pending';`
   A row for this invitee with `user_created_after_invite = true` confirms the cause.
2. Alternatively, ask the invitee to sign in at `https://cps.iic.du.ac.in/admin` with the email and the password they chose. If it works, the account was created and only the invitation update failed.
3. Reproduce locally: create an invitation, accept it, and observe the same 500 with a new user row and a still-pending invitation.

## Recommended fixes (description only, nothing implemented)

1. **Fix the validator (root cause).** In `Invitations.ts` email `validate`, run the "user already exists" and "pending duplicate" checks only when the email is actually being set or changed. That means `operation === 'create'`, or on update when `value` differs from `originalDoc.email`. Alternatively, skip them when `siblingData.status !== 'pending'`. Then status-only updates (accept, expire, cancel, resend) never re-check. Alternatively, have the accept route pass a `context` flag the validator honours, though the operation/changed-value check is cleaner and also fixes admins editing an accepted invitation in the panel.
2. **Make acceptance atomic.** Run the user create and invitation update in one transaction: `payload.db.beginTransaction()`, pass a shared `req` (e.g. from `createLocalReq`) to both calls, then commit or `killTransaction` on error. A failure then leaves no orphaned account. Alternatively, mark the invitation accepted first, then create the user, then roll back on failure.
3. **Log and map errors in the catch.** Add `payload.logger.error({ err }, 'Invitation accept failed')` (or `console.error`) in both GET and POST catches so the real message reaches prod logs. Also map Payload `ValidationError` (`err.name === 'ValidationError'`, `err.data.errors`) to a 400 with a non-sensitive message instead of the generic 500.
4. **Repair the affected production user** once the code fix is deployed. Either have the user retry, which will take the existing-user branch, close the invitation and return 409 "Sign in instead". Or have an admin set that invitation's status to `accepted` in the panel. Verify their roles and allowed collections/pages match the invitation, because the account already exists.
