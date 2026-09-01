import type { CollectionConfig } from 'payload'
import {
  adminAccess,
  adminOrSelf,
  authorAssignableCollections,
  isAuthor,
  isEditor,
  isSiteAdmin,
  roles,
  siteAdminFieldAccess,
} from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'roles', 'lastLogin'],
    group: 'Admin',
    // Authors have no reason to browse the user list; hiding it keeps their
    // sidebar to what they can actually work on. Access rules below are what
    // actually enforce this — `hidden` is presentation only.
    hidden: ({ user }) => !isEditor(user),
  },
  auth: true,
  access: {
    read: adminOrSelf,
    create: adminAccess,
    update: adminOrSelf,
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
         * Only a Super Admin may change roles, and that includes their own.
         *
         * The obvious alternative — letting a user edit their own roles "for
         * initial setup" — is a privilege escalation: any invited Author could
         * promote themselves. The first Super Admin is created by seeding or
         * directly in the database instead.
         */
        update: siteAdminFieldAccess,
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
          'Which content this Author may create and edit. Ignored for other roles, which already have full content access.',
        condition: (data) => Array.isArray(data?.roles) && data.roles.includes('author'),
      },
      access: {
        // Same reasoning as roles: an Author must not widen their own scope.
        update: siteAdminFieldAccess,
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
        const touchingScope = data.allowedCollections !== undefined
        if (!touchingRoles && !touchingScope) return data

        const effectiveRoles = data.roles ?? originalDoc?.roles
        if (!isAuthor({ roles: effectiveRoles })) {
          data.allowedCollections = []
        }
        return data
      },
    ],
  },
}

/** Re-exported so callers do not need to reach into the access module. */
export { isSiteAdmin }
