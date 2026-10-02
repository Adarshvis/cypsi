import type { Access, CollectionConfig, FieldAccess } from 'payload'
import {
  adminAccess,
  authorAssignableCollections,
  hiddenUnlessSiteAdmin,
  isAdmin,
  isScoped,
  isSiteAdmin,
  onlyAdminManageableRoles,
  roles,
  siteAdminOrSelf,
} from '../access/roles'

const sameId = (a: unknown, b: unknown) => a != null && b != null && String(a) === String(b)

/**
 * Account edits. Everyone may edit their own profile (name, password). The
 * Super Admin may edit anyone. An Admin may also edit editor and viewer
 * accounts, which is how they change an editor's access after the invitation
 * is accepted, but never another Admin or the Super Admin.
 */
const userUpdateAccess: Access = async ({ req, id }) => {
  const { user } = req
  if (!user) return false
  if (isAdmin(user)) return true
  const self = { id: { equals: user.id } }
  if (!isSiteAdmin(user) || id == null) return self
  if (sameId(id, user.id)) return true
  const target = await req.payload.findByID({
    collection: 'users',
    id,
    depth: 0,
    overrideAccess: true,
    req,
  })
  return onlyAdminManageableRoles((target as any)?.roles)
}

/** Scope fields: Super Admin on anyone but themselves; Admin on editor and viewer accounts only. */
const canChangeScope: FieldAccess = ({ req: { user }, id, doc }) => {
  if (!user) return false
  if (sameId(id ?? doc?.id, user.id)) return false
  if (isAdmin(user)) return true
  return isSiteAdmin(user) && onlyAdminManageableRoles(doc?.roles)
}

/** Roles: as scope, and an Admin may only assign editor or viewer roles. */
const canChangeRoles: FieldAccess = (args) => {
  if (!canChangeScope(args)) return false
  if (isAdmin(args.req.user)) return true
  const incoming = args.data?.roles
  return incoming === undefined || onlyAdminManageableRoles(incoming)
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'roles', 'lastLogin'],
    group: 'Admin',
    // Only site admins manage people. Everyone else reaches their own account
    // from the avatar menu. Access rules below are what actually enforce this —
    // `hidden` is presentation only.
    hidden: hiddenUnlessSiteAdmin,
  },
  auth: true,
  access: {
    // Admins see every account, because they manage editors' access.
    read: siteAdminOrSelf,
    // New accounts come from invitations; direct creation stays Super Admin only.
    create: adminAccess,
    update: userUpdateAccess,
    delete: adminAccess,
    // Every role that can be invited needs the admin panel. Viewers are
    // included deliberately: read-only access is the point of that role.
    admin: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['viewer'],
      options: roles,
      required: true,
      saveToJWT: true,
      admin: {
        position: 'sidebar',
        description: 'Determines what this user can see and change.',
      },
      access: {
        /*
         * Nobody may change their own roles. That rule is what stops an Admin
         * (who may edit their own record) from promoting themselves to Super
         * Admin, and an editor from widening their own access.
         *
         * The Super Admin may set any role on anyone else. An Admin may change
         * roles only on editor and viewer accounts, and only to editor or
         * viewer roles — so an Admin can never create another Admin.
         *
         * Invitation acceptance sets roles with `overrideAccess: true`, so it is
         * unaffected. No field-level `create` rule: collection `create` is
         * already Super Admin only, and Payload's first-user screen runs with
         * no user, so a create rule here would leave a fresh install without
         * any admin.
         */
        update: canChangeRoles,
      },
    },
    {
      name: 'allowedCollections',
      type: 'select',
      hasMany: true,
      options: authorAssignableCollections,
      saveToJWT: true,
      admin: {
        position: 'sidebar',
        description:
          'Collections this editor may create and edit in full. Admins already have full content access.',
        condition: (data) => isScoped({ roles: data?.roles }),
      },
      access: {
        // Same rule as roles: never your own, and an Admin only on editors.
        update: canChangeScope,
      },
    },
    {
      name: 'allowedPages',
      type: 'relationship',
      relationTo: 'pages',
      hasMany: true,
      saveToJWT: true,
      admin: {
        position: 'sidebar',
        description:
          'Individual pages this editor may edit. Not needed if "Pages (all pages)" is ticked above. Pages they create themselves are always editable by them.',
        condition: (data) => isScoped({ roles: data?.roles }),
      },
      access: {
        update: canChangeScope,
      },
    },
    {
      name: 'lastLogin',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Updated automatically on sign in.',
      },
    },
  ],
  hooks: {
    afterLogin: [
      async ({ user, req }) => {
        try {
          await req.payload.update({
            collection: 'users',
            id: user.id,
            data: { lastLogin: new Date().toISOString() } as never,
            overrideAccess: true,
            /*
             * `req` must be passed so this joins the login's own transaction.
             *
             * Without it the update runs on a separate connection while the
             * login transaction still holds a lock on this very row (it writes
             * the session and login counters). The update waits for the
             * transaction to commit, the transaction waits for this hook to
             * return, and the login hangs — the sign-in button just sits there.
             */
            req,
          })
        } catch (err) {
          // A failed timestamp must never block a sign in.
          req.payload.logger.error(
            `Could not record lastLogin for user ${user.id}: ${(err as Error).message}`,
          )
        }
        return user
      },
    ],
    beforeValidate: [
      ({ data, originalDoc }) => {
        if (!data) return data

        /*
         * Scoped collections only mean something for an Author, so they are
         * cleared when the role is not Author. That stops a stale list from
         * granting access if someone is switched to Author later.
         *
         * Only applied when roles or the scope itself are actually part of this
         * write. A partial update — the lastLogin timestamp, for instance —
         * carries no `roles`, and treating that as "not an Author" would wipe a
         * real Author's assignments on every sign in.
         */
        const touchingRoles = data.roles !== undefined
        const touchingScope = data.allowedCollections !== undefined || data.allowedPages !== undefined
        if (!touchingRoles && !touchingScope) return data

        const effectiveRoles = data.roles ?? originalDoc?.roles
        if (!isScoped({ roles: effectiveRoles })) {
          data.allowedCollections = []
          data.allowedPages = []
        }
        return data
      },
    ],
  },
}

/** Re-exported so callers do not need to reach into the access module. */
export { isSiteAdmin }
