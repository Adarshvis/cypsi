# cps_web conventions

## src/access/roles.ts (exact exports)
Roles: `'super_admin' | 'admin' | 'content_editor' | 'author' | 'viewer'`. `SCOPED_ROLES = ['content_editor','author']`.

Predicates (`user: any) => boolean`):
- `isAdmin(user)` – super_admin only
- `isSiteAdmin(user)` – super_admin or admin
- `isEditor(user)` – alias of isSiteAdmin
- `isScoped(user)` / `isAuthor` – content_editor/author, not site admin
- `isViewer(user)`, `isLoggedIn(user)`
- `canWriteCollection(user, slug: string)` – site admin, or scoped with slug in `user.allowedCollections`
- `hasAnyPageAccess(user)`, `assignedPageIds(user)`, `onlyAdminManageableRoles(list)`

Collection `Access`:
- `adminAccess` (super_admin), `siteAdminAccess`, `editorAccess`, `loggedInAccess`, `publicAccess` (`() => true`)
- `adminOrSelf`, `siteAdminOrSelf`
- `collectionWriteAccess(slug)`, `collectionReadAccess(slug)` (non-writers get `{status:{equals:'published'}}`), `publishedOrEditor`
- pages: `pagesReadAccess`, `pagesUpdateAccess`, `pagesCreateAccess`
- media: `mediaCreateAccess`, `mediaOwnOrSiteAdmin`

Admin visibility (`({ user }) => boolean`, true = hidden):
- `hiddenUnlessSiteAdmin` – "settings, forms, users, invitations" (also used for forms/form-submissions)
- `hiddenUnlessCollectionAccess(slug)`, `hiddenUnlessPageAccess`, `hiddenUnlessCanUpload`

Field access: `adminFieldAccess`, `siteAdminFieldAccess`, `editorFieldAccess`.

`authorAssignableCollections`: pages, news, blog-posts, publications, research-domains, work-with-us, team-page, media (legacy), documents. Job applications should NOT be added here (PII; site-admin only, mirroring form-submissions: create public, read/update/delete siteAdminAccess, hidden: hiddenUnlessSiteAdmin).

## payload.config.ts (current)
- `admin: { user: Users.slug, importMap: { baseDir: path.resolve(dirname) } }` – no `components` key yet (DUCC used `admin.components.afterDashboard: ['@/components/admin/ApplicationsDashboardCard#default']`).
- `collections: [Users, Invitations, Media, Documents, Pages, News, BlogPosts, Publications, ResearchDomains, WorkWithUs, TeamPage, ...]`
- formBuilderPlugin: `fields: { payment: false }` (no resumeUpload custom field — DUCC had one), forms/form-submissions access overridden as above.
- db: postgresAdapter with `push: process.env.CMS_DB_PUSH === 'true'`.
- .env has `CMS_RESUMES_UPLOAD_DIR=resumes` (value not secret).

## Admin components
- Live in `src/components/admin/` (existing: ColorPickerField, HomePageSelectorField, IconPickerField, OpacitySliderField, ProjectRowLabel, PublicationImportButton).
- Referenced by path strings: `'@/components/admin/X#X'` (or `#default`).
- Run `pnpm generate:importmap` after adding/changing admin components; `pnpm generate:types` after schema changes.
- Scripts: `pnpm build`, `pnpm dev` (port 3666), `pnpm lint`, `pnpm generate:importmap`, `pnpm generate:types`.

## AGENTS.md rules that apply
- Run `generate:types` after schema changes; generate import maps after creating/modifying components.
- Local API with `user` passed: ALWAYS set `overrideAccess: false` (otherwise access is bypassed).
- In hooks, ALWAYS pass `req` to nested `req.payload.*` operations (same transaction).
- Prevent hook loops with a `context` flag (e.g. `context: { skipHooks: true }`) when a hook updates its own collection.
- Access functions are the security boundary; `admin.hidden` is presentation only.
