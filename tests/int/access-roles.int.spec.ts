/**
 * Access rule tests.
 *
 * These encode the authorization decisions, so a future refactor that quietly
 * widens permissions fails here rather than in production. The dangerous cases
 * are the negative ones: a Viewer writing, an Author reaching a collection they
 * were not assigned, and a user with no roles at all.
 */
import { describe, expect, it } from 'vitest'
import {
  canWriteCollection,
  collectionReadAccess,
  collectionWriteAccess,
  isAdmin,
  isAuthor,
  isEditor,
  isSiteAdmin,
  roles,
  authorAssignableCollections,
} from '@/access/roles'

const user = (userRoles: string[], allowedCollections?: string[]) => ({
  id: 1,
  roles: userRoles,
  ...(allowedCollections ? { allowedCollections } : {}),
})

const superAdmin = user(['super_admin'])
const admin = user(['admin'])
const editor = user(['content_editor'])
const viewer = user(['viewer'])
const author = user(['author'], ['blog-posts', 'media'])
const authorNoScope = user(['author'], [])

/** Mimics how Payload invokes an Access function. */
const call = (fn: any, u: unknown) => fn({ req: { user: u } })

describe('role predicates', () => {
  it('recognises the privileged roles', () => {
    expect(isAdmin(superAdmin)).toBe(true)
    expect(isAdmin(admin)).toBe(false)

    expect(isSiteAdmin(superAdmin)).toBe(true)
    expect(isSiteAdmin(admin)).toBe(true)
    expect(isSiteAdmin(editor)).toBe(false)

    expect(isEditor(superAdmin)).toBe(true)
    expect(isEditor(admin)).toBe(true)
    expect(isEditor(editor)).toBe(true)
    expect(isEditor(author)).toBe(false)
    expect(isEditor(viewer)).toBe(false)

    expect(isAuthor(author)).toBe(true)
    expect(isAuthor(editor)).toBe(false)
  })

  it('grants nothing when roles are missing or malformed', () => {
    // A half-created user, or one whose roles failed to save, must not inherit
    // access. The previous project this code came from treated a missing role as
    // admin, which is the opposite of safe.
    for (const bad of [null, undefined, {}, { roles: null }, { roles: 'admin' }, { roles: [] }]) {
      expect(isAdmin(bad)).toBe(false)
      expect(isSiteAdmin(bad)).toBe(false)
      expect(isEditor(bad)).toBe(false)
      expect(isAuthor(bad)).toBe(false)
      expect(canWriteCollection(bad, 'news')).toBe(false)
    }
  })
})

describe('author scoping', () => {
  it('allows only the assigned collections', () => {
    expect(canWriteCollection(author, 'blog-posts')).toBe(true)
    expect(canWriteCollection(author, 'media')).toBe(true)
    expect(canWriteCollection(author, 'news')).toBe(false)
    expect(canWriteCollection(author, 'pages')).toBe(false)
    expect(canWriteCollection(author, 'publications')).toBe(false)
  })

  it('allows nothing when no collections are assigned', () => {
    for (const { value } of authorAssignableCollections) {
      expect(canWriteCollection(authorNoScope, value)).toBe(false)
    }
  })

  it('ignores scoping for editors and above', () => {
    for (const u of [superAdmin, admin, editor]) {
      for (const { value } of authorAssignableCollections) {
        expect(canWriteCollection(u, value)).toBe(true)
      }
    }
  })

  it('does not let a viewer write anywhere', () => {
    for (const { value } of authorAssignableCollections) {
      expect(canWriteCollection(viewer, value)).toBe(false)
    }
  })

  it('is not fooled by an allowedCollections list on a non-author', () => {
    // Scoping must never *grant* access to a role that does not use it.
    const scopedViewer = user(['viewer'], ['pages', 'news'])
    expect(canWriteCollection(scopedViewer, 'pages')).toBe(false)
  })
})

describe('collectionWriteAccess', () => {
  it('matches canWriteCollection for every role', () => {
    const access = collectionWriteAccess('blog-posts')
    expect(call(access, superAdmin)).toBe(true)
    expect(call(access, admin)).toBe(true)
    expect(call(access, editor)).toBe(true)
    expect(call(access, author)).toBe(true)
    expect(call(access, viewer)).toBe(false)
    expect(call(access, null)).toBe(false)
  })

  it('refuses an author outside their scope', () => {
    expect(call(collectionWriteAccess('news'), author)).toBe(false)
  })
})

describe('collectionReadAccess', () => {
  it('limits anonymous readers to published documents', () => {
    // A query constraint rather than false: the public should see the published
    // subset, not get a 403.
    expect(call(collectionReadAccess('news'), null)).toEqual({
      status: { equals: 'published' },
    })
  })

  it('limits a viewer to published documents', () => {
    expect(call(collectionReadAccess('news'), viewer)).toEqual({
      status: { equals: 'published' },
    })
  })

  it('gives editors unrestricted read', () => {
    expect(call(collectionReadAccess('news'), editor)).toBe(true)
  })

  it('gives an author unrestricted read only within their scope', () => {
    // They need to see their own drafts in assigned collections...
    expect(call(collectionReadAccess('blog-posts'), author)).toBe(true)
    // ...but elsewhere they are just a member of the public.
    expect(call(collectionReadAccess('news'), author)).toEqual({
      status: { equals: 'published' },
    })
  })
})

describe('role catalogue', () => {
  it('exposes exactly the five expected roles', () => {
    expect(roles.map((r) => r.value)).toEqual([
      'super_admin',
      'admin',
      'content_editor',
      'author',
      'viewer',
    ])
  })

  it('no longer offers the retired school_admin role', () => {
    expect(roles.map((r) => r.value)).not.toContain('school_admin')
  })
})
