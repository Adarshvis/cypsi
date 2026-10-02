import type { CollectionConfig } from 'payload'
import {
  hiddenUnlessCanUpload,
  mediaCreateAccess,
  mediaOwnOrSiteAdmin,
  publicAccess,
} from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    hidden: hiddenUnlessCanUpload,
  },
  access: {
    // Uploads are served publicly, so read stays open. Editors can also pick
    // any existing file for their pages.
    read: publicAccess,
    // Every editor may upload (images, video, etc.).
    create: mediaCreateAccess,
    /*
     * Replacing or deleting a file is limited to whoever uploaded it, so an
     * editor cannot remove or swap images other pages rely on. Site admins may
     * manage everything.
     */
    update: mediaOwnOrSiteAdmin,
    delete: mediaOwnOrSiteAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation, originalDoc }) => {
        if (!data) return data
        // Server-set only: whatever a client sends is ignored.
        data.uploadedBy =
          operation === 'create' ? (req.user?.id ?? null) : (originalDoc?.uploadedBy ?? null)
        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Set automatically. Only this person or an Admin can replace or delete the file.',
      },
    },
  ],
  upload: true,
}
