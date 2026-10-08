# Atomic invitation acceptance and change-aware invitation email validation

Accepting an invitation always returned a 500. The new user was committed, then the follow-up "mark accepted" update failed. Payload back-fills the stored `email` on partial updates and re-validates it, and the validator rejected the address because the just-created user owned it. Three changes fix this. The Invitations email validator skips its pending-duplicate and user-exists checks when an update leaves the address unchanged. `POST /api/invitations/accept` runs the user lookup, the user create and the invitation update in one transaction. Both route catches log the real error, and POST maps `ValidationError` to a non-sensitive 400. Already-affected users retry into the existing-user branch, which closes the invitation and returns 409 without touching the account. The verification note shows 38/38 checks passing on the fix and the original code reproducing the prod symptom.

Watch for: setting a cancelled or expired invitation back to `pending` in the admin sidebar now also counts as "email unchanged". It skips the duplicate-pending and user-exists checks that the old validator applied (confirmed, low impact, non-blocking). The GET catch logs but does not map `ValidationError` to 400 (confirmed, minor, non-blocking).

**Verdict**: APPROVED

## High-level view

The root cause is fixed in the validator, not worked around in the route. On `update`, the validator compares the normalized incoming value with Payload's `previousValue`. If that is missing it falls back to a `findByID` that passes `req`, and it returns early when the values match. Creates and real address changes still run both checks, and the nested queries now pass `req`. All six update types in scope (accept, expire, cancel, resend, emailStatus, and admin edits of accepted invitations) save without being re-checked.

Acceptance is all-or-nothing. One `createLocalReq` transaction spans the existing-user lookup, the user create and the invitation update. Any error kills the transaction, so no orphaned account is left. The welcome email stays after the commit in its own swallowed try/catch.

The catches now log the real error and classify it. Duplicate/unique maps to 409, including when the wording only appears in the ValidationError's per-field messages. Other ValidationErrors map to a generic 400, and anything else falls back to the generic 500. Token, status and expiry responses (404/410) are unchanged.

For the affected production user, the next submit takes the existing-user branch. It marks the invitation `accepted` with that user as `acceptedUser` and returns 409 "Sign in instead". The password, roles and scope are never written.

<details>
<summary>Issues (3)</summary>

1. **Reopen-to-pending skips uniqueness** — Setting a cancelled or expired invitation back to `pending` from the editable sidebar `status` select now skips the pending-duplicate and user-exists checks. It can create a second open token for one address, or revive one for an address that already has an account. Non-blocking. Fix by re-checking when `status` moves from non-pending to `pending`, or make `status` read-only in the admin.
2. **GET catch doesn't classify ValidationError** — A ValidationError from the GET expiry update still returns 500, though it is only logged now. That path shouldn't fail anymore, so this is minor. Mirror the POST mapping if you want consistent semantics.
3. **Admin form-state path untested** — Two paths were covered only by direct `payload.update` calls: the validator's `findByID` fallback (used when `previousValue` is absent, e.g. admin form-state validation) and the `/:id/resend` endpoint. Smoke-test editing an invitation and pressing Resend in the admin panel around deploy.

</details>

<details><summary>Details</summary>

### Change-aware email validator

The guard only applies when `operation === 'update' && id`, so creates always run both checks. A real address change still hits both queries, and the pending-duplicate query still excludes the invitation's own `id`. A case-only or whitespace-only edit normalizes to the same value and is treated as unchanged (verification case c).

The side effect is the reopen path (Issue 1, confirmed). `status` is an editable sidebar select (`Invitations.ts` around line 194, no `readOnly`). Moving a cancelled or expired invitation back to `pending` leaves the email unchanged, so the validator returns `true` before either query. The old code rejected that save when another pending invitation existed for the address or a user owned it. The impact is limited. A duplicate pending invitation for an address with an account resolves to the 409 existing-user branch on acceptance. The brief also requires status-only updates not to re-check. But reopening is the one transition where the old checks protected something:

```ts
// possible follow-up inside the update branch
const reopening = siblingData?.status === 'pending' && originalStatus !== 'pending'
if (!reopening && normalize(previous) === email) return true
```

### One transaction for lookup, create and accept

```
POST /accept
  findByToken ── status / expiry checks (unchanged, outside txn)
  createLocalReq + initTransaction
     ├─ find users by email            (req)
     ├─ existing? → update invitation accepted, acceptedUser=existing  (req)
     └─ else      → create user (role/scope from invitation)          (req)
                    update invitation accepted, acceptedUser=new      (req)
  commit (if owned) | kill + rethrow
  409 existing  |  welcome email (best effort) → 200
```

The expiry write-backs in GET and POST still run outside the transaction without `req`, as before. They now pass validation only because the email is unchanged, so they depend on the validator guard. Two concurrent POSTs with the same token both pass the status check outside the transaction. The loser fails on the users email unique constraint and its invitation update rolls back, which maps to 409. That race is pre-existing, and the transaction now makes it clean. Verification case (e) forced a failure after the user create: no user was left behind, and the invitation stayed `pending` and could be retried.

### Unique-wording match on ValidationError field messages

The 409 regex now also scans the joined `err.data.errors[].message`, so the Postgres adapter's "Value must be unique" on users email lands on 409. The custom validator messages ("There is already a pending invitation…", "A user with this address already exists.") contain neither "duplicate" nor "unique", so they reach the generic 400. Response bodies are fixed strings, and field paths only go to `payload.logger`.

### Verification evidence and scope

The verification note covers what was asked. It ran the real `GET`/`POST` handlers against the local DB with SMTP blanked, reproduced the bug on stashed original code, cleaned up test rows, and reports tsc and lint clean with no new warnings. Case (b) confirms the existing-user branch leaves password and roles untouched. Token validation, expiry checks, collection access and the resend endpoint's role checks are unchanged in the diff. Not tested: the resend HTTP endpoint and the admin edit form end to end (Issue 3). Only the two intended source files changed. Both `scripts/_tmp-*.mts` files are gone, and `scripts/_tmp-theme-check.mjs` predates the task. `recordEmailStatus` running without `req` is pre-existing and out of scope.

</details>

<details>
<summary>File map</summary>

- `src/collections/Invitations.ts`: email `validate` skips uniqueness checks on update when the normalized address is unchanged, and passes `req` to nested queries.
- `src/app/api/invitations/accept/route.ts`: shared-transaction acceptance, logging in GET/POST catches, ValidationError→400 and field-level unique→409 mapping.

Full diff: `git -C c:\Users\Admin\Desktop\CPS\cps_web diff`

</details>
