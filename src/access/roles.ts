import type { Access, FieldAccess } from 'payload'

/**
 * Roles, most privileged first.
 *
 * `admin` was previously called `school_admin`, a name inherited from an
 * earlier project that meant nothing here. `author` is new: an invited
 * contributor who can only touch the collections listed on their profile.
 */
export type Role = 'super_admin' | 'admin' | 'content_editor' | 'author' | 'viewer'

export const roles: { label: string; value: Role }[] = [
  { label: 'Super Admin — full access, manages users', value: 'super_admin' },
  { label: 'Admin — full access to content and settings', value: 'admin' },
  { label: 'Content Editor — create and edit all content', value: 'content_editor' },
  { label: 'Author — edit only assigned collections', value: 'author' },
  { label: 'Viewer — read only', value: 'viewer' },
]

/**
 * Collections an Author can be granted. Keyed by collection slug so the value
 * stored on a user is checked directly against `collection.slug`.
 */
export const authorAssignableCollections: { label: string; value: string }[] = [
  { label: 'Pages', value: 'pages' },
  { label: 'News', value: 'news' },
  { label: 'Blog Posts', value: 'blog-posts' },
  { label: 'Publications', value: 'publications' },
  { label: 'Research Domains', value: 'research-domains' },
  { label: 'Work With Us', value: 'work-with-us' },
  { label: 'Team Page', value: 'team-page' },
  { label: 'Media', value: 'media' },
]

function hasRole(user: any, allowed: Role[]): boolean {
  // Absent or empty roles grant nothing. A permissive default here would mean a
  // half-created user, or one whose roles failed to save, silently gets access.
  if (!user?.roles || !Array.isArray(user.roles)) return false
  return user.roles.some((r: string) => allowed.includes(r as Role))
}

export const isAdmin = (user: any): boolean => hasRole(user, ['super_admin'])

/** Full content and settings access; can delete. */
export const isSiteAdmin = (user: any): boolean => hasRole(user, ['super_admin', 'admin'])

export const isEditor = (user: any): boolean =>
  hasRole(user, ['super_admin', 'admin', 'content_editor'])

export const isAuthor = (user: any): boolean => hasRole(user, ['author'])

export const isLoggedIn = (user: any): boolean => Boolean(user)

/**
 * True when the user may write to this collection.
 *
 * Editors and above may write to everything. An Author may write only to the
 * collections named in `allowedCollections`, which is how invited contributors
 * are scoped.
 */
export function canWriteCollection(user: any, slug: string): boolean {
  if (isEditor(user)) return true
  if (!isAuthor(user)) return false
  const allowed = user?.allowedCollections
  return Array.isArray(allowed) && allowed.includes(slug)
}

/* ── Collection-level helpers ────────────────────────────────────────── */

export const adminAccess: Access = ({ req: { user } }) => isAdmin(user)

/** Retained name; now also satisfied by `admin`. */
export const siteAdminAccess: Access = ({ req: { user } }) => isSiteAdmin(user)

export const editorAccess: Access = ({ req: { user } }) => isEditor(user)

export const loggedInAccess: Access = ({ req: { user } }) => isLoggedIn(user)

export const publicAccess: Access = () => true

export const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true
  return { id: { equals: user.id } }
}

/**
 * Write access for a content collection, honouring Author scoping.
 * Use as `create: collectionWriteAccess('news')`.
 */
export const collectionWriteAccess =
  (slug: string): Access =>
  ({ req: { user } }) =>
    canWriteCollection(user, slug)

/**
 * Read access for a content collection.
 *
 * The public sees published documents. Editors see everything. An Author sees
 * everything in the collections assigned to them, so they can work on their own
 * drafts.
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

/* ── Field-level helpers ─────────────────────────────────────────────── */

export const adminFieldAccess: FieldAccess = ({ req: { user } }) => isAdmin(user)

export const siteAdminFieldAccess: FieldAccess = ({ req: { user } }) => isSiteAdmin(user)

export const editorFieldAccess: FieldAccess = ({ req: { user } }) => isEditor(user)
