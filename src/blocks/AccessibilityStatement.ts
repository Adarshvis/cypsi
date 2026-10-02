import type { Block } from 'payload'

/**
 * Accessibility card for the Help page (the header's accessibility button links
 * to it). Defaults carry the statement as written, so adding the block gives a
 * finished card; every line stays editable.
 *
 * Write a key as [[Ctrl]] and it renders as a keyboard key.
 */
export const AccessibilityStatement: Block = {
  slug: 'accessibilityStatement',
  labels: { singular: 'Accessibility Statement', plural: 'Accessibility Statements' },
  fields: [
    {
      name: 'anchorId',
      type: 'text',
      defaultValue: 'accessibility',
      admin: {
        description:
          'Anchor for links to this card, e.g. /help#accessibility. Must match the header button link (Site Settings → Accessibility).',
      },
    },
    { name: 'heading', type: 'text', required: true, defaultValue: 'Accessibility' },
    {
      name: 'intro',
      type: 'textarea',
      defaultValue:
        'This site is designed to be usable with a keyboard alone and with assistive technology such as screen readers. Every interactive element can be reached with the Tab key, focus is always visible, and a \u201cSkip to main content\u201d link appears on the first Tab press.',
    },
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Point', plural: 'Points' },
      admin: { description: 'Shown as a bulleted list. Write keys as [[Ctrl]] to show them as keyboard keys.' },
      defaultValue: [
        { text: 'Text size can be increased with browser zoom ([[Ctrl]] and [[+]]) without the layout breaking.' },
        { text: 'Images have text alternatives, and decorative images are hidden from screen readers.' },
        { text: 'Animation is reduced automatically when your system asks for reduced motion.' },
      ],
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
  ],
}
