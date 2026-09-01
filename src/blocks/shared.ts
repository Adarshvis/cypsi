import type { Field } from 'payload'

export const sectionHeadingFields: Field[] = [
  {
    name: 'sectionHeading',
    type: 'text',
    admin: {
      description: 'Section heading displayed above this block',
    },
  },
  {
    name: 'sectionDescription',
    type: 'textarea',
    admin: {
      description: 'Optional description below the heading',
    },
  },
  {
    name: 'headingAlignment',
    type: 'select',
    defaultValue: 'center',
    options: [
      { label: 'Left', value: 'left' },
      { label: 'Center', value: 'center' },
      { label: 'Right', value: 'right' },
    ],
  },
]

export const iconField = (name: string, label?: string): Field => ({
  name,
  type: 'text',
  label: label || 'Icon',
  admin: {
    components: {
      Field: '@/components/admin/IconPickerField#IconPickerField',
    },
    description: 'Select a Lucide icon',
  },
})

export const colorField = (name: string, label: string, defaultVal?: string): Field => ({
  name,
  type: 'text',
  label,
  defaultValue: defaultVal,
  admin: {
    components: {
      Field: '@/components/admin/ColorPickerField#ColorPickerField',
    },
    description: 'Pick a color or enter hex value',
  },
})

export const opacityField = (name: string, label: string, defaultVal = 50): Field => ({
  name,
  type: 'number',
  label,
  defaultValue: defaultVal,
  min: 0,
  max: 100,
  admin: {
    components: {
      Field: '@/components/admin/OpacitySliderField#OpacitySliderField',
    },
    description: 'Opacity percentage (0-100)',
  },
})
