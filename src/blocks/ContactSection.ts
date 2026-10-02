import type { Block } from 'payload'
import { colorField, iconField, sectionHeadingFields } from './shared'

/** Shared with the frontend so icon aria-labels match what editors picked. */
export const contactSocialPlatforms = [
  { label: 'Facebook', value: 'facebook' },
  { label: 'X / Twitter', value: 'twitter' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'YouTube', value: 'youtube' },
]

/**
 * Contact section: a map on one side; contact cards and a Form Builder form
 * on the other.
 *
 * Mirrors the learner project's contact page, which was hard-wired to a
 * `contact-page` collection with a PHP form action. Here every piece is a
 * block field, and the form is a real Form Builder form, so submissions land
 * in Form Submissions instead of a non-existent PHP endpoint.
 */
export const ContactSection: Block = {
  slug: 'contactSection',
  labels: { singular: 'Contact Section', plural: 'Contact Sections' },
  fields: [
    ...sectionHeadingFields,

    /* ── Map ── */
    {
      type: 'collapsible',
      label: 'Map',
      fields: [
        {
          name: 'mapEmbed',
          type: 'textarea',
          label: 'Map Embed',
          admin: {
            description:
              'Paste the Google Maps "Embed a map" URL, or the whole <iframe> snippet — only its https src is used. Leave empty to hide the map.',
          },
        },
        {
          name: 'mapTitle',
          type: 'text',
          label: 'Map Title (accessibility)',
          defaultValue: 'Our location on the map',
          admin: { description: 'Read out by screen readers in place of the map.' },
        },
        {
          name: 'mapPosition',
          type: 'select',
          defaultValue: 'left',
          options: [
            { label: 'Map on Left', value: 'left' },
            { label: 'Map on Right', value: 'right' },
          ],
        },
      ],
    },

    /* ── Contact cards ── */
    {
      name: 'contactCards',
      type: 'array',
      label: 'Contact Cards',
      maxRows: 6,
      admin: {
        description: 'Address, email, phone, office hours… Shown two per row.',
      },
      fields: [
        iconField('icon', 'Icon'),
        {
          type: 'row',
          fields: [
            {
              name: 'heading',
              type: 'text',
              required: true,
              admin: { width: '50%', description: 'e.g. "Location", "Email", "Call"' },
            },
            {
              name: 'link',
              type: 'text',
              admin: {
                width: '50%',
                description: 'Optional. e.g. mailto:info@example.org, tel:+911234567890 or a URL.',
              },
            },
          ],
        },
        {
          name: 'text',
          type: 'textarea',
          required: true,
          admin: { description: 'Line breaks are kept.' },
        },
      ],
    },

    /* ── Form card ── */
    {
      type: 'collapsible',
      label: 'Form',
      fields: [
        {
          name: 'formHeading',
          type: 'text',
          defaultValue: 'Get in Touch',
        },
        {
          name: 'formDescription',
          type: 'textarea',
        },
        {
          name: 'form',
          type: 'relationship',
          relationTo: 'forms',
          admin: {
            description:
              'Form Builder form to show (e.g. Name, Email, Subject, Message). Its submit label and confirmation message are used.',
          },
        },
        {
          name: 'socialLinks',
          type: 'array',
          label: 'Social Links',
          admin: { description: 'Round icon links shown beside the submit button.' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  admin: { width: '40%' },
                  options: contactSocialPlatforms,
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  admin: { width: '60%' },
                },
              ],
            },
          ],
        },
      ],
    },

    colorField('backgroundColor', 'Section Background Color', '#f1f5f7'),
  ],
}
