import type { Block, Field } from 'payload'
import { sectionHeadingFields, iconField, colorField } from './shared'

export const Statistics: Block = {
  slug: 'statistics',
  labels: { singular: 'Statistics / Impact', plural: 'Statistics / Impact' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'cardGrid',
      required: true,
      options: [
        { label: 'Card Grid (colored icon cards)', value: 'cardGrid' },
        { label: 'Circular Rings (donut progress)', value: 'circularRings' },
        { label: 'Interlocking Rings (ribbon weave)', value: 'interlockingRings' },
        { label: 'Horizontal Strip (Dark Horizontal)', value: 'duccStrip' },
      ],
      admin: {
        description: 'Choose between card grid layout or circular ring/donut layout',
      },
    },
    {
      name: 'stats',
      type: 'array',
      required: true,
      label: 'Statistics',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: { description: 'e.g. "Students Enrolled", "Schools", "Pass Rate"' },
        },
        {
          name: 'numericValue',
          type: 'number',
          required: true,
          admin: {
            description: 'Numeric value for count-up animation (e.g. 10000, 500, 98)',
          },
        },
        {
          name: 'suffix',
          type: 'text',
          admin: { description: 'Suffix after the number (e.g. "+", "%", "K", "M")' },
        },
        {
          name: 'prefix',
          type: 'text',
          admin: { description: 'Prefix before the number (e.g. "$", "₹")' },
        },
        iconField('icon', 'Stat Icon'),
        colorField('iconColor', 'Icon / Ring Color', '#3B82F6'),
        colorField('ringGradientEnd', 'Ring Gradient End Color (Interlocking)', '#FF4500'),
        colorField('iconBgColor', 'Icon Background Color (Card Grid)', '#EFF6FF'),
        {
          name: 'description',
          type: 'text',
          admin: {
            description: 'Short description shown below the stat (optional)',
          },
        },
        {
          name: 'ringPercentage',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Ring fill percentage (0-100). Used in Circular Rings layout.',
          },
        },
      ],
    },
    {
      ...colorField('ribbonBaseColor', 'Base Ribbon Color', '#e3e4e4'),
      admin: {
        ...colorField('ribbonBaseColor', 'Base Ribbon Color', '#e3e4e4').admin,
        condition: (_: unknown, siblingData: Record<string, unknown>) =>
          siblingData?.layout === 'interlockingRings',
        description: 'Color of the back ribbon (default gray)',
      },
    } as Field,
    {
      ...colorField('ribbonWaveStartColor', 'Wave Ribbon Start Color', '#3B82F6'),
      admin: {
        ...colorField('ribbonWaveStartColor', 'Wave Ribbon Start Color', '#3B82F6').admin,
        condition: (_: unknown, siblingData: Record<string, unknown>) =>
          siblingData?.layout === 'interlockingRings',
        description: 'Gradient start color of the front weave ribbon',
      },
    } as Field,
    {
      ...colorField('ribbonWaveEndColor', 'Wave Ribbon End Color', '#FF4500'),
      admin: {
        ...colorField('ribbonWaveEndColor', 'Wave Ribbon End Color', '#FF4500').admin,
        condition: (_: unknown, siblingData: Record<string, unknown>) =>
          siblingData?.layout === 'interlockingRings',
        description: 'Gradient end color of the front weave ribbon',
      },
    } as Field,
    colorField('backgroundColor', 'Section Background Color', '#FFFFFF'),
    colorField('cardBgColor', 'Card Background Color', '#FFFFFF'),
    {
      name: 'enableCountUp',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Animate numbers counting up when scrolled into view' },
    },
    {
      name: 'enableHoverZoom',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Zoom effect on card hover' },
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '4',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
  ],
}
