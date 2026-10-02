import type { GlobalConfig } from 'payload'
import { hiddenUnlessSiteAdmin, publicAccess, siteAdminAccess } from '../access/roles'
import { themePresets } from '../lib/themePresets'
import { applyThemeToBlocks } from '../lib/applyThemeToBlocks'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    hidden: hiddenUnlessSiteAdmin,
  },
  access: {
    read: publicAccess,
    // Super Admin and Admin.
    update: siteAdminAccess,
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        // When themePreset changes, auto-populate colors and fonts from the preset
        const newPreset = data?.themePreset
        const oldPreset = originalDoc?.themePreset

        if (newPreset && newPreset !== oldPreset && themePresets[newPreset]) {
          const preset = themePresets[newPreset]

          // Auto-fill colors
          if (!data.themeColors) data.themeColors = {}
          data.themeColors.primaryColor = preset.colors.primary
          data.themeColors.secondaryColor = preset.colors.secondary
          data.themeColors.accentColor = preset.colors.accent
          data.themeColors.backgroundColor = preset.colors.background
          data.themeColors.surfaceColor = preset.colors.surface
          data.themeColors.mutedBackgroundColor = preset.colors.muted
          data.themeColors.textColor = preset.colors.text

          // Auto-fill fonts
          data.headingFont = preset.fonts.heading
          data.bodyFont = preset.fonts.body
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        // When themePreset changes, update all block layouts in the database
        const newPreset = doc?.themePreset
        const oldPreset = previousDoc?.themePreset

        if (newPreset && newPreset !== oldPreset) {
          // Run non-blocking so the admin save doesn't hang
          applyThemeToBlocks(req.payload, newPreset).catch((err) => {
            req.payload.logger.error(`[Theme] Failed to apply theme to blocks: ${err.message}`)
          })
        }
      },
    ],
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      admin: {
        description:
          'Used as the browser title, the sender name on outgoing email, and the header wordmark when no logo image is set.',
      },
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      admin: {
        description:
          'Default meta description for pages that do not set their own. Aim for 150–160 characters.',
      },
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      /*
       * Titles for the routes that are not `pages` documents.
       *
       * /news and /publications are route files, so there is no page record to
       * carry a heading or meta description. Without these the strings had to be
       * literals in the route, which is how the previous project's name ended up
       * baked into the markup.
       */
      type: 'group',
      name: 'listingPages',
      label: 'Listing Page Titles',
      admin: {
        description:
          'Headings and search-engine text for the News and Publications listings.',
      },
      fields: [
        {
          type: 'group',
          name: 'news',
          label: 'News Listing',
          fields: [
            { name: 'title', type: 'text', admin: { description: 'Heading in the page banner.' } },
            { name: 'eyebrow', type: 'text', admin: { description: 'Small label above the heading.' } },
            {
              name: 'description',
              type: 'textarea',
              admin: { description: 'Intro text under the heading.' },
            },
            {
              name: 'metaTitle',
              type: 'text',
              admin: { description: 'Browser and search-result title. Defaults to the heading.' },
            },
            { name: 'metaDescription', type: 'textarea' },
          ],
        },
        {
          type: 'group',
          name: 'publications',
          label: 'Publications Listing',
          fields: [
            { name: 'title', type: 'text', admin: { description: 'Heading in the page banner.' } },
            { name: 'eyebrow', type: 'text', admin: { description: 'Small label above the heading.' } },
            {
              name: 'description',
              type: 'textarea',
              admin: { description: 'Intro text under the heading.' },
            },
            {
              name: 'metaTitle',
              type: 'text',
              admin: { description: 'Browser and search-result title. Defaults to the heading.' },
            },
            { name: 'metaDescription', type: 'textarea' },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'accessibility',
      label: 'Accessibility',
      admin: {
        description:
          'Skip link, and the header button that opens the Accessibility Adjustments panel (font size, contrast, reading aids and more).',
      },
      fields: [
        {
          name: 'skipLinkLabel',
          type: 'text',
          defaultValue: 'Skip to main content',
          admin: { description: 'Shown on the first Tab press; jumps past the header to the page content.' },
        },
        {
          name: 'showHeaderLink',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show the Accessibility Adjustments panel and its header button',
        },
        {
          type: 'row',
          fields: [
            {
              name: 'headerLinkLabel',
              type: 'text',
              defaultValue: 'Accessibility options',
              admin: {
                width: '50%',
                description: 'Read by screen readers and shown as a tooltip (the button is icon-only).',
                condition: (_, siblingData) => siblingData?.showHeaderLink !== false,
              },
            },
            {
              name: 'headerLinkUrl',
              type: 'text',
              defaultValue: '/help#accessibility',
              label: 'Accessibility Statement Link',
              admin: {
                width: '50%',
                description: 'Shown at the bottom of the Accessibility Adjustments panel.',
                condition: (_, siblingData) => siblingData?.showHeaderLink !== false,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'homePage',
      type: 'text',
      label: 'Home Page',
      admin: {
        components: {
          Field: '@/components/admin/HomePageSelectorField#HomePageSelectorField',
        },
        description:
          'Select which page should be the home page. This will be displayed when visitors go to the root URL (/).',
      },
    },
    {
      name: 'themePreset',
      type: 'select',
      label: 'Theme Preset',
      defaultValue: 'ducc',
      options: [
        { label: 'Theme A (Purple & Gold)', value: 'ducc' },
        { label: 'Theme B (Teal & Dark)', value: 'learner' },
      ],
      admin: {
        /*
         * Hidden from the admin UI, not removed.
         *
         * `admin.hidden` is the right switch here: the field keeps its column,
         * its stored value and its REST/GraphQL presence, so the frontend still
         * reads the preset and the colour and layout hooks keep working. The
         * field-level `hidden: true` would have dropped it from the API too.
         *
         * Hidden because switching presets rewrites layout values on every
         * block across the site — a single click with very wide consequences.
         * Remove this flag to expose the control again.
         */
        hidden: true,
        description:
          'One-click theme change. Selecting a preset changes colors, fonts, and layout styles across the entire site.',
      },
    },
    {
      name: 'headingFont',
      type: 'select',
      label: 'Heading Font',
      defaultValue: 'Playfair Display',
      options: [
        { label: 'Playfair Display (Serif)', value: 'Playfair Display' },
        { label: 'Raleway (Sans)', value: 'Raleway' },
        { label: 'Montserrat (Sans)', value: 'Montserrat' },
        { label: 'Inter (Sans)', value: 'Inter' },
        { label: 'Roboto (Sans)', value: 'Roboto' },
        { label: 'Poppins (Sans)', value: 'Poppins' },
      ],
    },
    {
      name: 'bodyFont',
      type: 'select',
      label: 'Body Font',
      defaultValue: 'Inter',
      options: [
        { label: 'Inter', value: 'Inter' },
        { label: 'Roboto', value: 'Roboto' },
        { label: 'Open Sans', value: 'Open Sans' },
        { label: 'Poppins', value: 'Poppins' },
        { label: 'Lato', value: 'Lato' },
      ],
    },
    {
      type: 'group',
      name: 'themeColors',
      label: 'Theme Colors',
      fields: [
        {
          name: 'primaryColor',
          type: 'text',
          defaultValue: '#4B2E83',
          admin: {
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
            description: 'Pick primary brand color',
          },
        },
        {
          name: 'secondaryColor',
          type: 'text',
          defaultValue: '#1A103D',
          admin: {
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
            description: 'Pick secondary brand color',
          },
        },
        {
          name: 'accentColor',
          type: 'text',
          defaultValue: '#EAB308',
          admin: {
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
            description: 'Pick accent/highlight color',
          },
        },
        {
          name: 'backgroundColor',
          type: 'text',
          defaultValue: '#FFFFFF',
          admin: {
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
            description: 'Main page background color',
          },
        },
        {
          name: 'surfaceColor',
          type: 'text',
          defaultValue: '#FFFFFF',
          admin: {
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
            description: 'Card/surface background color',
          },
        },
        {
          name: 'mutedBackgroundColor',
          type: 'text',
          defaultValue: '#F8F4FF',
          admin: {
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
            description: 'Section muted background color',
          },
        },
        {
          name: 'textColor',
          type: 'text',
          defaultValue: '#1A103D',
          admin: {
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
            description: 'Default body text color',
          },
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Media Links',
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'LinkedIn', value: 'linkedin' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
