import type { CollectionConfig } from 'payload'
import { collectionWriteAccess, publicAccess, siteAdminAccess } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    // Uploads are served publicly, so read stays open.
    read: publicAccess,
    /*
     * Writes were previously unrestricted, which meant any authenticated user —
     * including a Viewer — could upload files and overwrite existing ones.
     * Uploads now follow the same rule as content, and an Author needs Media in
     * their assigned collections to add images to their own posts.
     */
    create: collectionWriteAccess('media'),
    update: collectionWriteAccess('media'),
    delete: siteAdminAccess,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
