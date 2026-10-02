import type { CollectionConfig } from 'payload'
import {
  collectionReadAccess,
  collectionWriteAccess,
  hiddenUnlessCollectionAccess,
  siteAdminAccess,
} from '../access/roles'

export const Publications: CollectionConfig = {
  slug: 'publications',
  labels: {
    singular: 'Publication',
    plural: 'Publications',
  },
  admin: {
    // Shown only to people who can work on this collection.
    hidden: hiddenUnlessCollectionAccess('publications'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'publisher', 'year', 'type', 'status', 'updatedAt'],
    group: 'Research',
    description: 'Journal articles, conference papers, book chapters and reports',
    components: {
      beforeListTable: ['@/components/admin/PublicationImportButton#PublicationImportButton'],
    },
  },
  access: {
    read: collectionReadAccess('publications'),
    create: collectionWriteAccess('publications'),
    update: collectionWriteAccess('publications'),
    delete: siteAdminAccess,
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (operation === 'create' && req.user && !data.createdBy) {
          data.createdBy = req.user.id
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Publication Title',
    },
    {
      name: 'publisher',
      type: 'text',
      required: true,
      label: 'Publisher / Journal / Conference',
      admin: {
        description: 'e.g. "ACM Transactions on Asian and Low-Resource Language Processing"',
      },
    },
    {
      name: 'authors',
      type: 'array',
      required: true,
      label: 'Authors',
      minRows: 1,
      admin: {
        description: 'Listed in publication order',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'isLabMember',
          type: 'checkbox',
          defaultValue: false,
          label: 'Is Lab Member?',
          admin: {
            description: 'Lab members appear in the Author filter on the publications page',
          },
        },
      ],
    },
    {
      name: 'year',
      type: 'number',
      required: true,
      label: 'Publication Year',
      min: 1990,
      max: 2100,
      index: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      label: 'Publication Type',
      defaultValue: 'journal',
      options: [
        { label: 'Journal Article', value: 'journal' },
        { label: 'Conference Paper', value: 'conference' },
        { label: 'Book Chapter', value: 'book-chapter' },
        { label: 'Technical Report', value: 'technical-report' },
        { label: 'Thesis', value: 'thesis' },
      ],
    },
    {
      name: 'keywords',
      type: 'array',
      label: 'Keywords / Research Areas',
      fields: [
        {
          name: 'keyword',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'abstract',
      type: 'textarea',
      label: 'Abstract',
      admin: {
        description: 'Optional summary shown on the publication card',
      },
    },
    {
      name: 'doi',
      type: 'text',
      label: 'DOI',
      admin: {
        description: 'Digital Object Identifier, e.g. 10.1145/3597926',
      },
    },
    {
      name: 'link',
      type: 'text',
      label: 'External Link',
      admin: {
        description: 'Publisher page or PDF URL',
      },
    },
    {
      name: 'pdfFile',
      type: 'upload',
      relationTo: 'media',
      label: 'PDF File',
      admin: {
        description: 'Optional local copy of the paper',
      },
    },
    {
      name: 'citationCount',
      type: 'number',
      label: 'Citation Count',
      defaultValue: 0,
      admin: {
        description: 'Used for sorting by relevance',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'published',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'importSource',
      type: 'select',
      label: 'Import Source',
      defaultValue: 'manual',
      options: [
        { label: 'Manual Entry', value: 'manual' },
        { label: 'Google Scholar', value: 'google-scholar' },
        { label: 'ORCID', value: 'orcid' },
        { label: 'Scopus', value: 'scopus' },
        { label: 'CrossRef', value: 'crossref' },
        { label: 'Semantic Scholar', value: 'semantic-scholar' },
      ],
      admin: {
        position: 'sidebar',
        description: 'How this record was added',
      },
    },
    {
      name: 'externalId',
      type: 'text',
      label: 'External ID',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'ID from the import source, used to avoid duplicates',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'User who added this publication',
      },
    },
  ],
}
