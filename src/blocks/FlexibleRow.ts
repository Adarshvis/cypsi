import type { Block, Field } from 'payload'
import { sectionHeadingFields, colorField, iconField } from './shared'

/* ── Sub-block: Rich Text ── */
const RichTextSub: Block = {
  slug: 'flexRichText',
  labels: { singular: 'Rich Text', plural: 'Rich Text' },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'fontFamily',
      type: 'select',
      defaultValue: 'inherit',
      label: 'Body Font Family',
      admin: { description: 'Font family for body text (paragraphs, lists)' },
      options: [
        { label: 'Default (Inherit)', value: 'inherit' },
        { label: 'Inter', value: 'Inter' },
        { label: 'Roboto', value: 'Roboto' },
        { label: 'Poppins', value: 'Poppins' },
        { label: 'Open Sans', value: 'Open Sans' },
        { label: 'Lato', value: 'Lato' },
        { label: 'Montserrat', value: 'Montserrat' },
        { label: 'Nunito', value: 'Nunito' },
        { label: 'Raleway', value: 'Raleway' },
        { label: 'Playfair Display', value: 'Playfair Display' },
        { label: 'Merriweather', value: 'Merriweather' },
        { label: 'Source Sans Pro', value: 'Source Sans Pro' },
      ],
    },
    {
      name: 'headingFontFamily',
      type: 'select',
      defaultValue: 'inherit',
      label: 'Heading Font Family',
      admin: { description: 'Font family for headings only (h1-h6). Leave as Default to use the body font.' },
      options: [
        { label: 'Default (Same as body)', value: 'inherit' },
        { label: 'Inter', value: 'Inter' },
        { label: 'Playfair Display', value: 'Playfair Display' },
        { label: 'Merriweather', value: 'Merriweather' },
        { label: 'Roboto', value: 'Roboto' },
        { label: 'Poppins', value: 'Poppins' },
        { label: 'Montserrat', value: 'Montserrat' },
        { label: 'Raleway', value: 'Raleway' },
      ],
    },
    {
      name: 'fontSize',
      type: 'select',
      defaultValue: 'base',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'base' },
        { label: 'Large', value: 'lg' },
        { label: 'XL', value: 'xl' },
        { label: '2XL', value: '2xl' },
      ],
    },
    colorField('textColor', 'Text Color', '#1F2937'),
  ],
}

/* ── Sub-block: Image ── */
const ImageSub: Block = {
  slug: 'flexImage',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
      admin: { description: 'Optional caption below the image' },
    },
    colorField('captionColor', 'Caption Text Color', '#6B7280'),
    {
      name: 'objectFit',
      type: 'select',
      defaultValue: 'cover',
      options: [
        { label: 'Cover (fill & crop)', value: 'cover' },
        { label: 'Contain (fit inside)', value: 'contain' },
        { label: 'None (original size)', value: 'none' },
      ],
    },
    {
      name: 'rounded',
      type: 'select',
      defaultValue: 'lg',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
        { label: 'Full (Circle)', value: 'full' },
      ],
    },
  ],
}

/* ── Sub-block: Video ── */
const VideoSub: Block = {
  slug: 'flexVideo',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    {
      name: 'videoSource',
      type: 'select',
      defaultValue: 'upload',
      required: true,
      options: [
        { label: 'Upload Video File', value: 'upload' },
        { label: 'YouTube URL', value: 'youtube' },
        { label: 'Vimeo URL', value: 'vimeo' },
        { label: 'External URL (mp4/webm)', value: 'externalUrl' },
      ],
    },
    {
      name: 'uploadedVideo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_: unknown, siblingData: Record<string, unknown>) =>
          siblingData?.videoSource === 'upload',
        description: 'Upload mp4, webm, or other video file',
      },
    },
    {
      name: 'youtubeUrl',
      type: 'text',
      admin: {
        condition: (_: unknown, siblingData: Record<string, unknown>) =>
          siblingData?.videoSource === 'youtube',
        description: 'YouTube video URL (e.g. https://youtube.com/watch?v=...)',
      },
    },
    {
      name: 'vimeoUrl',
      type: 'text',
      admin: {
        condition: (_: unknown, siblingData: Record<string, unknown>) =>
          siblingData?.videoSource === 'vimeo',
        description: 'Vimeo video URL (e.g. https://vimeo.com/123456)',
      },
    },
    {
      name: 'externalVideoUrl',
      type: 'text',
      admin: {
        condition: (_: unknown, siblingData: Record<string, unknown>) =>
          siblingData?.videoSource === 'externalUrl',
        description: 'Direct URL to video file (mp4, webm)',
      },
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Thumbnail / poster image (optional)' },
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Auto-play on load (muted)' },
    },
    {
      name: 'loop',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'controls',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Show playback controls' },
    },
  ],
}

/* ── Sub-block: Carousel ── */
const CarouselSub: Block = {
  slug: 'flexCarousel',
  labels: { singular: 'Carousel', plural: 'Carousels' },
  fields: [
    {
      name: 'slides',
      type: 'array',
      required: true,
      minRows: 2,
      label: 'Slides',
      fields: [
        {
          name: 'mediaType',
          type: 'select',
          defaultValue: 'image',
          required: true,
          options: [
            { label: 'Image', value: 'image' },
            { label: 'Video (Upload)', value: 'video' },
            { label: 'YouTube', value: 'youtube' },
          ],
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            condition: (_: unknown, siblingData: Record<string, unknown>) =>
              siblingData?.mediaType === 'image',
          },
        },
        {
          name: 'video',
          type: 'upload',
          relationTo: 'media',
          admin: {
            condition: (_: unknown, siblingData: Record<string, unknown>) =>
              siblingData?.mediaType === 'video',
          },
        },
        {
          name: 'youtubeUrl',
          type: 'text',
          admin: {
            condition: (_: unknown, siblingData: Record<string, unknown>) =>
              siblingData?.mediaType === 'youtube',
            description: 'YouTube URL',
          },
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Auto-advance slides' },
    },
    {
      name: 'interval',
      type: 'number',
      defaultValue: 5000,
      admin: {
        description: 'Auto-play interval in milliseconds (e.g. 5000 = 5 seconds)',
        condition: (_: unknown, siblingData: Record<string, unknown>) =>
          siblingData?.autoplay === true,
      },
    },
    {
      name: 'showDots',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'showArrows',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}

/* ── Sub-block: Map / Embed ── */
const MapEmbedSub: Block = {
  slug: 'flexMapEmbed',
  labels: { singular: 'Map / Embed', plural: 'Maps / Embeds' },
  fields: [
    {
      name: 'embedType',
      type: 'select',
      defaultValue: 'iframe',
      required: true,
      options: [
        { label: 'iFrame URL (Google Maps, etc.)', value: 'iframe' },
        { label: 'HTML Embed Code', value: 'html' },
      ],
    },
    {
      name: 'iframeUrl',
      type: 'text',
      admin: {
        condition: (_: unknown, siblingData: Record<string, unknown>) =>
          siblingData?.embedType === 'iframe',
        description: 'URL for iframe embed (Google Maps, etc.)',
      },
    },
    {
      name: 'html',
      type: 'code',
      admin: {
        language: 'html',
        condition: (_: unknown, siblingData: Record<string, unknown>) =>
          siblingData?.embedType === 'html',
        description: 'Paste HTML embed code',
      },
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 400,
      admin: { description: 'Height in pixels' },
    },
  ],
}

/* ── Sub-block: Animation (Lottie / GIF) ── */
const AnimationSub: Block = {
  slug: 'flexAnimation',
  labels: { singular: 'Animation', plural: 'Animations' },
  fields: [
    {
      name: 'animationType',
      type: 'select',
      defaultValue: 'lottie',
      required: true,
      options: [
        { label: 'Lottie JSON URL', value: 'lottie' },
        { label: 'GIF Upload', value: 'gif' },
      ],
    },
    {
      name: 'lottieUrl',
      type: 'text',
      admin: {
        condition: (_: unknown, siblingData: Record<string, unknown>) =>
          siblingData?.animationType === 'lottie',
        description: 'URL to Lottie JSON file',
      },
    },
    {
      name: 'gif',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_: unknown, siblingData: Record<string, unknown>) =>
          siblingData?.animationType === 'gif',
      },
    },
    {
      name: 'loop',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}

const animationField = (name = 'animation', label = 'Animation'): Field => ({
  name,
  type: 'select',
  label,
  defaultValue: 'none',
  options: [
    { label: 'None', value: 'none' },
    { label: 'Hover Lift', value: 'hoverLift' },
    { label: 'Pulse', value: 'pulse' },
    { label: 'Float', value: 'float' },
  ],
})

/* ── Sub-block: Stats Cards ── */
const StatsCardsSub: Block = {
  slug: 'flexStatsCards',
  labels: { singular: 'Stats Cards', plural: 'Stats Cards' },
  fields: [
    {
      name: 'columns',
      type: 'select',
      defaultValue: '4',
      options: [
        { label: '1 Column', value: '1' },
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    {
      name: 'cardStyle',
      type: 'select',
      defaultValue: 'outline',
      options: [
        { label: 'Outline', value: 'outline' },
        { label: 'Elevated', value: 'elevated' },
        { label: 'Soft', value: 'soft' },
        { label: 'About (Icon box + vertical)', value: 'duccAbout' },
      ],
    },
    {
      name: 'cards',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
        { name: 'trend', type: 'text' },
        { name: 'trendLabel', type: 'text' },
        iconField('icon', 'Stat Icon'),
        colorField('iconColor', 'Icon Color', '#1d4ed8'),
        animationField(),
      ],
    },
  ],
}

/* ── Sub-block: Feature Cards ── */
const FeatureCardsSub: Block = {
  slug: 'flexFeatureCards',
  labels: { singular: 'Feature Cards', plural: 'Feature Cards' },
  fields: [
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '1 Column', value: '1' },
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    {
      name: 'cardStyle',
      type: 'select',
      defaultValue: 'borderTop',
      options: [
        { label: 'Border Top', value: 'borderTop' },
        { label: 'Outline', value: 'outline' },
        { label: 'Dark Glass', value: 'darkGlass' },
      ],
    },
    {
      name: 'cards',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        iconField('icon', 'Card Icon'),
        colorField('iconColor', 'Icon Color', '#1d4ed8'),
        colorField('accentColor', 'Accent Color', '#1d4ed8'),
        { name: 'title', type: 'richText', required: true },
        { name: 'subtitle', type: 'text' },
        { name: 'description', type: 'richText' },
        {
          name: 'points',
          type: 'array',
          fields: [{ name: 'text', type: 'text', required: true }],
        },
        animationField(),
      ],
    },
  ],
}

/* ── Sub-block: Highlight Cards ── */
const HighlightCardsSub: Block = {
  slug: 'flexHighlightCards',
  labels: { singular: 'Highlight Cards', plural: 'Highlight Cards' },
  fields: [
    {
      name: 'columns',
      type: 'select',
      defaultValue: '2',
      options: [
        { label: '1 Column', value: '1' },
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
      ],
    },
    {
      name: 'theme',
      type: 'select',
      defaultValue: 'light',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
      ],
    },
    {
      name: 'titleSize',
      type: 'select',
      defaultValue: 'base',
      options: [
        { label: 'Small (14px)', value: 'sm' },
        { label: 'Base (16px)', value: 'base' },
        { label: 'Large (18px)', value: 'lg' },
        { label: 'XL (20px)', value: 'xl' },
        { label: '2XL (24px)', value: '2xl' },
      ],
    },
    colorField('iconBgColor', 'Icon Background Color', '#EEF2FF'),
    {
      name: 'iconAlignment',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    {
      name: 'cards',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        iconField('icon', 'Card Icon'),
        colorField('iconColor', 'Icon Color', '#f59e0b'),
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        animationField(),
      ],
    },
  ],
}

/* ── Sub-block: Buttons / CTA ── */
const ButtonsSub: Block = {
  slug: 'flexButtons',
  labels: { singular: 'Buttons', plural: 'Buttons' },
  fields: [
    {
      name: 'alignment',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    {
      name: 'buttons',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Outline', value: 'outline' },
            { label: 'Ghost', value: 'ghost' },
          ],
        },
        {
          name: 'size',
          type: 'select',
          defaultValue: 'md',
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' },
          ],
        },
        iconField('icon', 'Button Icon'),
        {
          name: 'openInNewTab',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
}

/* ── Sub-block: Dashboard Mock Panel ── */
const DashboardMockSub: Block = {
  slug: 'flexDashboardMock',
  dbName: 'flex_dash_mock',
  labels: { singular: 'Dashboard Mock', plural: 'Dashboard Mocks' },
  fields: [
    {
      name: 'layoutVariant',
      type: 'select',
      defaultValue: 'floatingCards',
      options: [
        { label: 'Floating Cards', value: 'floatingCards' },
        { label: 'Sync Status Panel', value: 'syncStatusPanel' },
      ],
    },
    {
      name: 'theme',
      type: 'select',
      defaultValue: 'light',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
      ],
    },
    {
      name: 'chartCount',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 4,
      admin: {
        description: 'Number of mini tiles/rows inside the mock panel',
      },
    },
    {
      name: 'topBadgeLabel',
      type: 'text',
      // Left blank: these carried an earlier project's copy as defaults.
      defaultValue: '',
    },
    {
      name: 'topBadgeLabelSize',
      type: 'select',
      defaultValue: 'md',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
    },
    colorField('topBadgeLabelColor', 'Top Badge Label Color', '#64748b'),
    {
      name: 'topBadgeValue',
      type: 'text',
      defaultValue: '',
    },
    {
      name: 'topBadgeAnimation',
      type: 'select',
      defaultValue: 'float',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Float', value: 'float' },
        { label: 'Pulse', value: 'pulse' },
        { label: 'Hover Lift', value: 'hoverLift' },
      ],
    },
    {
      name: 'topBadgeValueSize',
      type: 'select',
      defaultValue: '2xl',
      options: [
        { label: 'Large', value: 'lg' },
        { label: 'XL', value: 'xl' },
        { label: '2XL', value: '2xl' },
      ],
    },
    colorField('topBadgeValueColor', 'Top Badge Value Color', '#4338ca'),
    {
      name: 'bottomChipPrimary',
      type: 'text',
      defaultValue: '',
    },
    {
      name: 'bottomChipSecondary',
      type: 'text',
      defaultValue: '',
    },
    {
      name: 'bottomSummary',
      type: 'text',
      defaultValue: '',
    },
    {
      name: 'bottomBadgeAnimation',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Float', value: 'float' },
        { label: 'Pulse', value: 'pulse' },
        { label: 'Hover Lift', value: 'hoverLift' },
      ],
    },
    {
      name: 'bottomSummarySize',
      type: 'select',
      defaultValue: 'lg',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
        { label: 'XL', value: 'xl' },
      ],
    },
    colorField('bottomSummaryColor', 'Bottom Summary Color', '#334155'),
    {
      name: 'syncFooterText',
      type: 'text',
      defaultValue: '',
      admin: {
        description: 'Footer status text for the Sync Status Panel layout',
      },
    },
  ],
}

/* ── Main Block: Flexible Row ── */
export const FlexibleRow: Block = {
  slug: 'flexibleRow',
  labels: { singular: 'Flexible Row', plural: 'Flexible Rows' },
  fields: [
    ...sectionHeadingFields,
    colorField('sectionBgColor', 'Section Background Color', '#FFFFFF'),
    {
      name: 'radialGlow',
      type: 'checkbox',
      defaultValue: false,
      label: 'Radial Glow Background',
      admin: {
        description: 'Add a subtle radial accent glow behind this section',
      },
    },
    {
      name: 'gap',
      type: 'select',
      defaultValue: '6',
      label: 'Column Gap',
      options: [
        { label: 'None', value: '0' },
        { label: 'Small', value: '4' },
        { label: 'Medium', value: '6' },
        { label: 'Large', value: '8' },
        { label: 'XL', value: '12' },
      ],
    },
    {
      name: 'verticalAlign',
      type: 'select',
      defaultValue: 'start',
      label: 'Vertical Alignment',
      options: [
        { label: 'Top', value: 'start' },
        { label: 'Center', value: 'center' },
        { label: 'Bottom', value: 'end' },
        { label: 'Stretch', value: 'stretch' },
      ],
    },
    {
      name: 'columns',
      type: 'array',
      required: true,
      label: 'Columns',
      admin: {
        description: 'Add columns – max 3 per row. More than 3 will wrap to new rows.',
      },
      fields: [
        {
          name: 'width',
          type: 'select',
          defaultValue: 'auto',
          label: 'Column Width',
          options: [
            { label: 'Auto (equal)', value: 'auto' },
            { label: '25%', value: '25' },
            { label: '33%', value: '33' },
            { label: '50%', value: '50' },
            { label: '66%', value: '66' },
            { label: '75%', value: '75' },
            { label: '100% (full width)', value: '100' },
          ],
        },
        colorField('columnBgColor', 'Column Background Color', 'transparent'),
        {
          name: 'padding',
          type: 'select',
          defaultValue: '0',
          options: [
            { label: 'None', value: '0' },
            { label: 'Small', value: '4' },
            { label: 'Medium', value: '6' },
            { label: 'Large', value: '8' },
          ],
        },
        {
          name: 'blocks',
          type: 'blocks',
          label: 'Content Blocks',
          blocks: [
            RichTextSub,
            ImageSub,
            VideoSub,
            CarouselSub,
            MapEmbedSub,
            AnimationSub,
            StatsCardsSub,
            FeatureCardsSub,
            HighlightCardsSub,
            ButtonsSub,
            DashboardMockSub,
          ],
        },
      ],
    },
  ],
}
