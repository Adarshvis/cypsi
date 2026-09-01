import type { Block } from 'payload'

function slideFields() {
  return [
    {
      name: 'mediaType',
      type: 'select' as const,
      defaultValue: 'image',
      required: true,
      options: [
        { label: 'Text Content (No Media)', value: 'textOnly' },
        { label: 'Image Media', value: 'image' },
        { label: 'Video Media (Upload)', value: 'video' },
        { label: 'YouTube / Vimeo', value: 'externalVideo' },
        { label: 'Animation (Lottie / GIF)', value: 'animation' },
        { label: 'Data Visualization / Map', value: 'dataViz' },
      ],
    },
    {
      name: 'image',
      type: 'upload' as const,
      relationTo: 'media' as const,
      admin: {
        condition: (_: any, siblingData: any) => siblingData?.mediaType === 'image',
      },
    },
    {
      name: 'videoUrl',
      type: 'text' as const,
      admin: {
        condition: (_: any, siblingData: any) => siblingData?.mediaType === 'video',
        description: 'URL to self-hosted video file (mp4, webm)',
      },
    },
    {
      name: 'videoPoster',
      type: 'upload' as const,
      relationTo: 'media' as const,
      admin: {
        condition: (_: any, siblingData: any) => siblingData?.mediaType === 'video',
        description: 'Poster/thumbnail image for the video',
      },
    }, 
    {
      name: 'externalVideoUrl',
      type: 'text' as const,
      admin: {
        condition: (_: any, siblingData: any) => siblingData?.mediaType === 'externalVideo',
        description: 'YouTube or Vimeo URL (e.g. https://youtube.com/watch?v=...)',
      },
    },
    {
      name: 'animationUrl',
      type: 'text' as const,
      admin: {
        condition: (_: any, siblingData: any) => siblingData?.mediaType === 'animation',
        description: 'URL to Lottie JSON file or GIF image',
      },
    },
    { 
      name: 'dataVizEmbed',
      type: 'code' as const,
      admin: {
        language: 'html',
        condition: (_: any, siblingData: any) => siblingData?.mediaType === 'dataViz',
        description: 'Embed code for map, chart, or data visualization',
      },
    },
    {
      name: 'eyebrowText',
      type: 'text' as const,
      label: 'Eyebrow Badge Text',
      admin: {
        description: 'Small badge text above the heading (e.g. "ESTABLISHED 1956", "CORE SERVICE DOMAINS")',
      },
    },
    {
      name: 'showText',
      type: 'checkbox' as const,
      defaultValue: true,
      label: 'Show text overlay',
    },
    {
      name: 'heading', 
      type: 'text' as const,
      admin: {
        condition: (_: any, siblingData: any) => siblingData?.showText !== false,
      },
    },
    {
      name: 'headingColor',
      type: 'text' as const,
      defaultValue: '#FFFFFF',
      admin: {
        condition: (_: any, siblingData: any) => siblingData?.showText !== false,
        components: {
          Field: '@/components/admin/ColorPickerField#ColorPickerField',
        },
        description: 'Heading text color',
      },
    },
    {
      name: 'subtitle',
      type: 'textarea' as const,
      admin: {
        condition: (_: any, siblingData: any) => siblingData?.showText !== false,
      },
    },
    {
      name: 'subtitleColor',
      type: 'text' as const,
      defaultValue: '#E5E7EB',
      admin: {
        condition: (_: any, siblingData: any) => siblingData?.showText !== false,
        components: {
          Field: '@/components/admin/ColorPickerField#ColorPickerField',
        },
        description: 'Description text color',
      },
    },
    {
      name: 'buttons',
      type: 'array' as const,
      maxRows: 3,
      admin: {
        condition: (_: any, siblingData: any) => siblingData?.showText !== false,
      },
      fields: [
        { name: 'label', type: 'text' as const, required: true },
        { name: 'url', type: 'text' as const, required: true },
        {
          name: 'variant',
          type: 'select' as const,
          defaultValue: 'primary',
          options: [
            { label: 'Primary (Filled)', value: 'primary' },
            { label: 'Secondary (Filled)', value: 'secondary' },
            { label: 'Outline', value: 'outline' },
          ],
        },
        {
          name: 'icon',
          type: 'text' as const,
          admin: {
            components: {
              Field: '@/components/admin/IconPickerField#IconPickerField',
            },
            description: 'Select button icon',
          },
        },
      ],
    },
  ]
}

export const Hero: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    {
      name: 'mode',
      type: 'select',
      defaultValue: 'single',
      required: true,
      options: [
        { label: 'Single Slide', value: 'single' },
        { label: 'Carousel (Multiple Slides)', value: 'carousel' },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'fullWidth',
      required: true,
      options: [
        { label: 'Full-Width Background', value: 'fullWidth' },
        { label: 'Fullscreen Overlay Carousel', value: 'fullscreenOverlayCarousel' },
        { label: 'Fullscreen Overlay (Split + Floating Card)', value: 'duccFullscreen' },
        { label: '50/50 Split (Text + Media)', value: 'split' },
        { label: 'Contained', value: 'contained' },
      ],
    },
    {
      name: 'splitDirection',
      type: 'select',
      defaultValue: 'textLeft',
      options: [
        { label: 'Text Left, Media Right', value: 'textLeft' },
        { label: 'Text Right, Media Left', value: 'textRight' },
      ],
      admin: {
        condition: (_, siblingData) => siblingData?.layout === 'split',
      },
    },
    {
      name: 'splitTheme',
      type: 'select',
      defaultValue: 'dark',
      options: [
        { label: 'Dark Background', value: 'dark' },
        { label: 'Light Background', value: 'light' },
      ],
      admin: {
        condition: (_, siblingData) => siblingData?.layout === 'split',
        description: 'Dark: dark bg with white text. Light: muted bg with dark text.',
      },
    },
    {
      name: 'splitTextBehavior',
      type: 'select',
      defaultValue: 'static',
      label: 'Text Behavior (Carousel)',
      options: [
        { label: 'Static text, only media slides', value: 'static' },
        { label: 'Text and media both slide together', value: 'slide' },
      ],
      admin: {
        condition: (_, siblingData) => siblingData?.layout === 'split' && siblingData?.mode === 'carousel',
        description: 'Static: text stays fixed while images change. Slide: heading, subtitle, and buttons change with each slide.',
      },
    },
    {
      name: 'splitFeatures',
      type: 'array',
      label: 'Feature Tags (below buttons)',
      maxRows: 6,
      admin: {
        condition: (_, siblingData) => siblingData?.layout === 'split',
        description: 'Small icon + text tags shown below the buttons (e.g. "PHD Programs", "Internships")',
      },
      fields: [
        {
          name: 'icon',
          type: 'text',
          admin: {
            components: {
              Field: '@/components/admin/IconPickerField#IconPickerField',
            },
          },
        },
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 600,
      admin: { description: 'Hero height in pixels (e.g. 600)' },
    },
    {
      name: 'textAlignment',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    {
      name: 'textVerticalPosition',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Top', value: 'top' },
        { label: 'Center', value: 'center' },
        { label: 'Bottom', value: 'bottom' },
      ],
    },
    {
      name: 'contentMaxWidth',
      type: 'number',
      defaultValue: 1200,
      admin: {
        description: 'Maximum content width in pixels for hero text container',
      },
    },
    {
      name: 'contentPaddingX',
      type: 'number',
      defaultValue: 24,
      admin: {
        description: 'Horizontal content padding in pixels',
      },
    },
    {
      name: 'contentPaddingY',
      type: 'number',
      defaultValue: 32,
      admin: {
        description: 'Vertical content padding in pixels',
      },
    },
    {
      name: 'constantOverlayContent',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        condition: (_, siblingData) =>
          siblingData?.layout === 'fullscreenOverlayCarousel' && siblingData?.mode === 'carousel',
        description: 'Keep text/buttons constant while only the background slide changes',
      },
    },
    {
      type: 'group',
      name: 'constantOverlay',
      label: 'Constant Overlay Content',
      admin: {
        condition: (_, siblingData) =>
          siblingData?.layout === 'fullscreenOverlayCarousel' &&
          siblingData?.mode === 'carousel' &&
          siblingData?.constantOverlayContent,
      },
      fields: [
        {
          name: 'showText',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show text overlay',
        },
        {
          name: 'heading',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.showText !== false,
          },
        },
        {
          name: 'headingColor',
          type: 'text',
          defaultValue: '#FFFFFF',
          admin: {
            condition: (_, siblingData) => siblingData?.showText !== false,
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
            description: 'Heading text color',
          },
        },
        {
          name: 'subtitle',
          type: 'textarea',
          admin: {
            condition: (_, siblingData) => siblingData?.showText !== false,
          },
        },
        {
          name: 'subtitleColor',
          type: 'text',
          defaultValue: '#E5E7EB',
          admin: {
            condition: (_, siblingData) => siblingData?.showText !== false,
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
            description: 'Description text color',
          },
        },
        {
          name: 'buttons',
          type: 'array',
          maxRows: 3,
          admin: {
            condition: (_, siblingData) => siblingData?.showText !== false,
          },
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
            {
              name: 'variant',
              type: 'select',
              defaultValue: 'primary',
              options: [
                { label: 'Primary (Filled)', value: 'primary' },
                { label: 'Secondary (Filled)', value: 'secondary' },
                { label: 'Outline', value: 'outline' },
              ],
            },
            {
              name: 'icon',
              type: 'text',
              admin: {
                components: {
                  Field: '@/components/admin/IconPickerField#IconPickerField',
                },
                description: 'Select button icon',
              },
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'overlay',
      label: 'Overlay Settings',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        {
          name: 'color',
          type: 'text',
          defaultValue: '#000000',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
            description: 'Pick overlay color',
          },
        }, 
        {
          name: 'opacity',
          type: 'number',
          defaultValue: 50,
          min: 0,
          max: 100,
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
            components: {
              Field: '@/components/admin/OpacitySliderField#OpacitySliderField',
            },
            description: 'Overlay opacity (0-100)',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'headerGlass',
      label: 'Header Glass (Fullscreen Overlay)',
      admin: {
        condition: (_, siblingData) => siblingData?.layout === 'fullscreenOverlayCarousel',
      },
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        {
          name: 'fillColor',
          type: 'text',
          defaultValue: '#FFFFFF',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
            description: 'Glass overlay tint color for the fixed header',
          },
        },
        {
          name: 'fillOpacity',
          type: 'number',
          defaultValue: 20,
          min: 0,
          max: 100,
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
            description: 'Glass tint opacity in percent',
          },
        },
        {
          name: 'blurAmount',
          type: 'number',
          defaultValue: 16,
          min: 0,
          max: 40,
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
            description: 'Background blur amount in pixels',
          },
        },
        {
          name: 'showDivider',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
            description: 'Show thin divider under header while hero is active',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'carouselSettings',
      label: 'Carousel Settings',
      admin: { condition: (_, siblingData) => siblingData?.mode === 'carousel' },
      fields: [
        { name: 'autoPlay', type: 'checkbox', defaultValue: true },
        {
          name: 'autoPlayInterval',
          type: 'number',
          defaultValue: 5000,
          admin: { 
            description: 'Interval in milliseconds (e.g. 5000 = 5 seconds)',
            condition: (_, siblingData) => siblingData?.autoPlay,
          },
        },
        { name: 'showArrows', type: 'checkbox', defaultValue: true },
        { name: 'showDots', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      type: 'group',
      name: 'singleSlide',
      label: 'Slide Content',
      admin: { condition: (_, siblingData) => siblingData?.mode === 'single' },
      fields: slideFields(),
    },
    {
      name: 'slides',
      type: 'array',
      label: 'Slides',
      admin: { condition: (_, siblingData) => siblingData?.mode === 'carousel' },
      fields: slideFields(),
    },
    /* ── Fullscreen Overlay extras ── */
    {
      type: 'group',
      name: 'duccFloatingCard',
      label: 'Floating Stats Card (Right Side)',
      admin: {
        condition: (_, siblingData) => siblingData?.layout === 'duccFullscreen',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show floating stats card on desktop',
        },
        {
          name: 'badgeLabel',
          type: 'text',
          defaultValue: 'Live Snapshot',
          admin: { condition: (_, siblingData) => siblingData?.enabled },
        },
        {
          name: 'footerText',
          type: 'text',
          defaultValue: 'Updated Real-time',
          admin: { condition: (_, siblingData) => siblingData?.enabled },
        },
        {
          name: 'footerLink',
          type: 'text',
          defaultValue: '/about',
          admin: { condition: (_, siblingData) => siblingData?.enabled },
        },
        {
          name: 'footerLinkLabel',
          type: 'text',
          defaultValue: 'View dashboard →',
          admin: { condition: (_, siblingData) => siblingData?.enabled },
        },
        {
          name: 'stats',
          type: 'array',
          label: 'Stats',
          maxRows: 4,
          admin: { condition: (_, siblingData) => siblingData?.enabled },
          fields: [
            { name: 'value', type: 'text', required: true },
            { name: 'label', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'duccShowSlideCounter',
      type: 'checkbox',
      label: 'Show Slide Counter (01 / 04)',
      defaultValue: true,
      admin: {
        condition: (_, siblingData) =>
          siblingData?.layout === 'duccFullscreen' && siblingData?.mode === 'carousel',
      },
    },
    {
      name: 'duccShowPlayPause',
      type: 'checkbox',
      label: 'Show Play/Pause Button',
      defaultValue: true,
      admin: {
        condition: (_, siblingData) =>
          siblingData?.layout === 'duccFullscreen' && siblingData?.mode === 'carousel',
      },
    },
    /* ── Quick Access Bar (overlapping bottom of hero) ── */
    {
      type: 'group',
      name: 'quickAccessBar',
      label: 'Quick Access Bar',
      admin: {
        description: 'Floating card grid that overlaps the bottom of the hero into the next section',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          label: 'Enable Quick Access Bar',
        },
        {
          name: 'overlapAmount',
          type: 'number',
          defaultValue: 80,
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
            description: 'How many pixels the bar hangs below the hero (default: 80)',
          },
        },
        {
          name: 'items',
          type: 'array',
          label: 'Quick Access Items',
          minRows: 4,
          maxRows: 8,
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'icon',
              type: 'text',
              label: 'Icon',
              admin: {
                components: {
                  Field: '@/components/admin/IconPickerField#IconPickerField',
                },
                description: 'Select a Lucide icon',
              },
            },
            {
              name: 'link',
              type: 'text',
              required: true,
              admin: {
                description: 'Internal path (e.g. /it-services) or external URL',
              },
            },
            {
              name: 'external',
              type: 'checkbox',
              defaultValue: false,
              label: 'Opens in new tab',
            },
            {
              name: 'colorVariant',
              type: 'select',
              defaultValue: 'primary',
              options: [
                { label: 'Primary (#4B2E83)', value: 'primary' },
                { label: 'Dark (#1A103D)', value: 'dark' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
