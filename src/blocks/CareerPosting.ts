import type { Block } from 'payload'

export const CareerPosting: Block = {
  slug: 'careerPosting',
  labels: { singular: 'Career Posting', plural: 'Career Postings' },
  fields: [
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short description for preview (e.g. "Through hands-on project experience...")',
      },
    },
    {
      name: 'effectiveDate',
      type: 'text',
      admin: {
        description: 'Display string like "Last Updated: March 2026"',
      },
    },
    {
      name: 'content',
      type: 'richText',
      admin: {
        description: 'Full job description — supports headings, paragraphs, bold/italic, ordered and unordered lists',
      },
    },
    {
      name: 'problemDomains',
      type: 'array',
      label: 'Problem Domains',
      admin: {
        description: 'Expandable sections describing different work areas or specializations',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Domain name (e.g. "ML/DL Based Systems for Education 4.0 Applications")',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'Overview of the domain',
          },
        },
        {
          name: 'challenges',
          type: 'array',
          label: 'Challenges / Responsibilities',
          admin: {
            description: 'Specific tasks or responsibilities for this domain',
          },
          fields: [
            {
              name: 'text',
              type: 'text',
            },
          ],
        },
        {
          name: 'technicalSkills',
          type: 'array',
          label: 'Technical Skills',
          dbName: 'cp_domains_tech_skills',
          admin: {
            description: 'Required technical skills',
          },
          fields: [
            {
              name: 'skill',
              type: 'text',
            },
          ],
        },
        {
          name: 'nonTechnicalSkills',
          type: 'array',
          label: 'Non-Technical Skills',
          dbName: 'cp_domains_non_tech',
          admin: {
            description: 'Required soft / non-technical skills',
          },
          fields: [
            {
              name: 'skill',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'applyButtonText',
      type: 'text',
      admin: {
        description: 'CTA label (e.g. "Apply Now")',
      },
    },
    {
      name: 'applyButtonLink',
      type: 'text',
      admin: {
        description: 'URL the button points to. Leave blank to use the built-in /apply page.',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      admin: {
        description: 'Whether this career posting is currently active',
      },
    },
  ],
}
