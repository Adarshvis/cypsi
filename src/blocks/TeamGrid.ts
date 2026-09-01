import type { Block } from 'payload'
import { sectionHeadingFields } from './shared'

export const TeamGrid: Block = {
  slug: 'teamGrid',
  labels: { singular: 'Team / Faculty Grid', plural: 'Team / Faculty Grids' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'columns',
      type: 'select',
      defaultValue: '4',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
        { label: '5 Columns', value: '5' },
        { label: '6 Columns', value: '6' },
      ],
    },
    {
      name: 'showStats',
      type: 'checkbox',
      defaultValue: false,
      label: 'Show Stats (rating, student count)',
    },
    {
      name: 'showSocialLinks',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show Social Links on Cards',
    },
    {
      name: 'members',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          label: 'Profile Photo',
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          admin: {
            description: 'URL slug for profile page. Auto-generated from name if empty.',
          },
          hooks: {
            beforeValidate: [
              ({ value, data }) => {
                if (!value && data?.name) {
                  return data.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '')
                }
                return value
              },
            ],
          },
        },
        {
          name: 'role',
          type: 'text',
          label: 'Specialty / Designation',
          admin: {
            description: 'e.g. "Professor", "Research Scholar", "HOD Science"',
          },
        },
        {
          name: 'bio',
          type: 'textarea',
          label: 'Short Description',
        },
        {
          name: 'rating',
          type: 'number',
          min: 0,
          max: 5,
          admin: {
            description: 'Rating out of 5 (e.g. 4.8)',
            step: 0.1,
          },
        },
        {
          name: 'courseCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of courses',
          },
        },
        {
          name: 'studentCount',
          type: 'text',
          admin: {
            description: 'Student count (e.g. "2.1k" or "2100")',
          },
        },
        {
          name: 'profileLink',
          type: 'text',
          admin: {
            description: 'External profile URL. Leave empty to auto-link to /instructors/{slug}',
          },
        },
        {
          name: 'socialLinks',
          type: 'array',
          label: 'Social Links',
          maxRows: 6,
          fields: [
            {
              name: 'platform',
              type: 'select',
              required: true,
              options: [
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Twitter / X', value: 'twitter-x' },
                { label: 'GitHub', value: 'github' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'YouTube', value: 'youtube' },
                { label: 'Google Scholar', value: 'google' },
                { label: 'Website', value: 'globe' },
                { label: 'Email', value: 'envelope' },
              ],
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
          ],
        },
        /* ── Profile Page Fields ── */
        {
          type: 'collapsible',
          label: 'Profile Page Details',
          admin: {
            initCollapsed: true,
          },
          fields: [
            {
              name: 'biography',
              type: 'textarea',
              label: 'Full Biography',
            },
            {
              name: 'email',
              type: 'email',
              label: 'Email',
            },
            {
              name: 'phone',
              type: 'text',
              label: 'Phone',
            },
            {
              name: 'office',
              type: 'text',
              label: 'Office Location',
            },
            {
              name: 'researchInterests',
              type: 'array',
              label: 'Research Interests',
              fields: [
                { name: 'interest', type: 'text', required: true },
              ],
            },
            {
              name: 'education',
              type: 'array',
              label: 'Education',
              fields: [
                { name: 'degree', type: 'text', required: true },
                { name: 'institution', type: 'text', required: true },
                { name: 'year', type: 'text' },
              ],
            },
            {
              name: 'experience',
              type: 'array',
              label: 'Experience',
              fields: [
                { name: 'position', type: 'text', required: true },
                { name: 'organization', type: 'text', required: true },
                { name: 'duration', type: 'text' },
                { name: 'expDescription', type: 'textarea', label: 'Description' },
              ],
            },
            {
              name: 'awards',
              type: 'array',
              label: 'Awards & Honors',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'year', type: 'text' },
                { name: 'organization', type: 'text' },
              ],
            },
            {
              name: 'courses',
              type: 'array',
              label: 'Courses',
              fields: [
                { name: 'courseName', type: 'text', required: true },
                { name: 'courseCode', type: 'text' },
                { name: 'semester', type: 'text' },
                { name: 'courseDescription', type: 'textarea', label: 'Description' },
              ],
            },
            {
              name: 'publications',
              type: 'array',
              label: 'Publications',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'journal', type: 'text' },
                { name: 'year', type: 'text' },
                { name: 'link', type: 'text' },
              ],
            },
            {
              name: 'academicLinks',
              type: 'array',
              label: 'Academic Links',
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Google Scholar', value: 'google-scholar' },
                    { label: 'ResearchGate', value: 'researchgate' },
                    { label: 'ORCID', value: 'orcid' },
                    { label: 'Academia.edu', value: 'academia' },
                    { label: 'Scopus', value: 'scopus' },
                    { label: 'Web of Science', value: 'wos' },
                    { label: 'Other', value: 'other' },
                  ],
                },
                { name: 'url', type: 'text', required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
}
