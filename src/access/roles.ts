import type { Access, FieldAccess, Where } from 'payload'

/**
 * Roles, most privileged first.
 *
 *   super_admin     everything; the only role that can grant Admin
 *   admin           all content, Header/Footer/Site Settings and Forms;
 *                   invites Content Editors and scopes what they can touch
 *   content_editor  only the collections and individual pages assigned to them
 *   author          legacy name for the same scoped access as content_editor
 *   viewer          read only
 *
 * The admin panel shows each user only what they can work on; everything else
 * is hidden. `admin.hidden` is presentation only — the access functions below
 * are what enforce it.
 */
export type Role = 'super_admin' | 'admin' | 'content_editor' | 'author' | 'viewer'

export const roles: { label: string; value: Role }[] = [
  { label: 'Super Admin — full access, grants Admin access', value: 'super_admin' },
  { label: 'Admin — all content and settings, invites editors', value: 'admin' },
  { label: 'Content Editor — only assigned pages and collections', value: 'content_editor' },
  { label: 'Author — only assigned pages and collections (legacy)', value: 'author' },
  { label: 'Viewer — read only', value: 'viewer' },
]

/** Roles whose access is limited to what is assigned on their profile. */
export const SCOPED_ROLES: Role[] = ['content_editor', 'author']

/** Roles an Admin may hand out or manage. Admin and Super Admin are not among them. */
export const ADMIN_MANAGEABLE_ROLES: Role[] = ['content_editor', 'author', 'viewer']

/**
 * Collections a scoped editor can be granted as a whole. Pages can also be
 * granted one by one through `allowedPages`. Media is not listed: every editor
 * may upload, and may change or delete only their own uploads.
 */
export const authorAssignableCollections: { label: string; value: string }[] = [
  { label: 'Pages (all pages)', value: 'pages' },
  { label: 'News', value: 'news' },
  { label: 'Blog Posts', value: 'blog-posts' },
  { label: 'Publications', value: 'publications' },
  { label: 'Research Domains', value: 'research-domains' },
  { label: 'Work With Us', value: 'work-with-us' },
  { label: 'Team Page', value: 'team-page' },
  // Kept so values already stored on users stay valid; media access no longer depends on it.
  { label: 'Media (not needed — every editor can upload)', value: 'media' },
  { label: 'Documents', value: 'documents' },
]

function hasRole(user: any, allowed: Role[]): boolean {
  // Absent or empty roles grant nothing. A permissive default here would mean a
  // half-created user, or one whose roles failed to save, silently gets access.
  if (!user?.roles || !Array.isArray(user.roles)) return false
  return user.roles.some((r: string) => allowed.includes(r as Role))
}

/** Super Admin only. */
export const isAdmin = (user: any): boolean => hasRole(user, ['super_admin'])

/** Super Admin or Admin: full content and settings access. */
export const isSiteAdmin = (user: any): boolean => hasRole(user, ['super_admin', 'admin'])

/**
 * Full access to all content. Content Editors used to have this; they are now
 * scoped, so this is the same as `isSiteAdmin`. Kept as a name for callers that
 * mean "can edit any content".
 */
export const isEditor = (user: any): boolean => isSiteAdmin(user)

/** Content Editor or Author: limited to assigned pages and collections. */
export const isScoped = (user: any): boolean => !isSiteAdmin(user) && hasRole(user, SCOPED_ROLES)

/** Legacy name. */
export const isAuthor = isScoped

export const isViewer = (user: any): boolean =>
  !isSiteAdmin(user) && !isScoped(user) && hasRole(user, ['viewer'])

export const isLoggedIn = (user: any): boolean => Boolean(user)

/** True when every role in the list is one an Admin may manage. */
export const onlyAdminManageableRoles = (list: unknown): boolean =>
  Array.isArray(list) && list.length > 0 && list.every((r) => ADMIN_MANAGEABLE_ROLES.includes(r as Role))

/** Relationship values arrive as ids or populated docs depending on depth. */
function toIds(value: unknown): (string | number)[] {
  if (!Array.isArray(value)) return []
  return value
    .map((v) => (v && typeof v === 'object' ? (v as { id?: string | number }).id : v))
    .filter((v): v is string | number => typeof v === 'string' || typeof v === 'number')
}

/** Ids of the individual pages assigned to a scoped editor. */
export const assignedPageIds = (user: any): (string | number)[] => toIds(user?.allowedPages)

/**
 * True when the user may write to this collection as a whole.
 *
 * Site admins may write to everything. A scoped editor may write only to the
 * collections named in `allowedCollections`.
 */
export function canWriteCollection(user: any, slug: string): boolean {
  if (isSiteAdmin(user)) return true
  if (!isScoped(user)) return false
  const allowed = user?.allowedCollections
  return Array.isArray(allowed) && allowed.includes(slug)
}

/** True when the user has any page access: all pages, or some assigned ones. */
export function hasAnyPageAccess(user: any): boolean {
  if (canWriteCollection(user, 'pages')) return true
  return isScoped(user) && assignedPageIds(user).length > 0
}

/* ── Collection-level helpers ────────────────────────────────────────── */

export const adminAccess: Access = ({ req: { user } }) => isAdmin(user)

export const siteAdminAccess: Access = ({ req: { user } }) => isSiteAdmin(user)

export const editorAccess: Access = ({ req: { user } }) => isEditor(user)

export const loggedInAccess: Access = ({ req: { user } }) => isLoggedIn(user)

export const publicAccess: Access = () => true

export const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true
  return { id: { equals: user.id } }
}

/** Site admins see every account (they manage editors); everyone else only their own. */
export const siteAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isSiteAdmin(user)) return true
  return { id: { equals: user.id } }
}

/**
 * Write access for a content collection, honouring editor scoping.
 * Use as `create: collectionWriteAccess('news')`.
 */
export const collectionWriteAccess =
  (slug: string): Access =>
  ({ req: { user } }) =>
    canWriteCollection(user, slug)

/**
 * Read access for a content collection.
 *
 * The public (and Viewers, and editors without this collection) see published
 * documents. Anyone who can write the collection sees everything, drafts
 * included.
 */
export const collectionReadAccess =
  (slug: string): Access =>
  ({ req: { user } }) => {
    if (user && canWriteCollection(user, slug)) return true
    return { status: { equals: 'published' } }
  }

/** Kept for collections that have no per-collection scoping. */
export const publishedOrEditor: Access = ({ req: { user } }) => {
  if (user && isEditor(user)) return true
  return { status: { equals: 'published' } }
}

/**
 * The pages a page-scoped editor may see and edit: those assigned to them and
 * those they created themselves (so a page they add stays editable).
 */
function ownPagesWhere(user: any): Where {
  const ids = assignedPageIds(user)
  const createdByMe: Where = { createdBy: { equals: user.id } }
  return ids.length ? { or: [{ id: { in: ids } }, createdByMe] } : createdByMe
}

/**
 * Pages read. The public site reads through the Local API without a user, so
 * this governs the admin panel and the REST API.
 *
 * A page-scoped editor sees only their own pages — not every published page —
 * so their Pages list shows exactly what they can work on.
 */
export const pagesReadAccess: Access = ({ req: { user } }) => {
  if (!user) return { status: { equals: 'published' } }
  if (canWriteCollection(user, 'pages')) return true
  if (isScoped(user)) return ownPagesWhere(user)
  return { status: { equals: 'published' } }
}

export const pagesUpdateAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (canWriteCollection(user, 'pages')) return true
  if (isScoped(user)) return ownPagesWhere(user)
  return false
}

/** Any editor with some page access may add new pages. */
export const pagesCreateAccess: Access = ({ req: { user } }) => hasAnyPageAccess(user)

/**
 * Media writes. Every editor may upload. Changing or deleting a file is limited
 * to the person who uploaded it, so nobody can remove or replace images other
 * people's pages rely on. Site admins may manage everything.
 */
export const mediaCreateAccess: Access = ({ req: { user } }) =>
  isSiteAdmin(user) || isScoped(user)

export const mediaOwnOrSiteAdmin: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isSiteAdmin(user)) return true
  if (isScoped(user)) return { uploadedBy: { equals: user.id } }
  return false
}

/* ── Admin panel visibility ──────────────────────────────────────────── */

type HiddenArgs = { user: any }

/** Site admins only: settings, forms, users, invitations. */
export const hiddenUnlessSiteAdmin = ({ user }: HiddenArgs): boolean => !isSiteAdmin(user)

/** Shown to site admins, Viewers (read only), and editors assigned this collection. */
export const hiddenUnlessCollectionAccess =
  (slug: string) =>
  ({ user }: HiddenArgs): boolean =>
    !(isSiteAdmin(user) || isViewer(user) || canWriteCollection(user, slug))

export const hiddenUnlessPageAccess = ({ user }: HiddenArgs): boolean =>
  !(isSiteAdmin(user) || isViewer(user) || hasAnyPageAccess(user))

export const hiddenUnlessCanUpload = ({ user }: HiddenArgs): boolean =>
  !(isSiteAdmin(user) || isScoped(user) || isViewer(user))

/* ── Field-level helpers ─────────────────────────────────────────────── */

export const adminFieldAccess: FieldAccess = ({ req: { user } }) => isAdmin(user)

export const siteAdminFieldAccess: FieldAccess = ({ req: { user } }) => isSiteAdmin(user)

export const editorFieldAccess: FieldAccess = ({ req: { user } }) => isEditor(user)
