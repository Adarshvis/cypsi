import type { Block } from 'payload'

const viewOptions = [
  { label: 'District', value: 'district' },
  { label: 'Taluka', value: 'taluka' },
  { label: 'School Type and Management', value: 'schoolTypeManagement' },
  { label: 'Minority Schools', value: 'minoritySchools' },
  { label: 'Only Girls Schools', value: 'girlsOnlySchools' },
  { label: 'Only Boys Schools', value: 'boysOnlySchools' },
  { label: 'Medium of Instruction', value: 'mediumOfInstruction' },
]

const dataRowFields = [
  {
    name: 'name',
    type: 'text' as const,
    required: true,
  },
  {
    name: 'totalSchools',
    type: 'number' as const,
    defaultValue: 0,
  },
  {
    name: 'percentage',
    type: 'number' as const,
    min: 0,
    max: 100,
    defaultValue: 0,
  },
  {
    name: 'markerLat',
    type: 'number' as const,
    admin: {
      description: 'Optional marker latitude for map sync',
    },
  },
  {
    name: 'markerLng',
    type: 'number' as const,
    admin: {
      description: 'Optional marker longitude for map sync',
    },
  },
  {
    name: 'highlightColor',
    type: 'text' as const,
    defaultValue: '#1f9d8f',
    admin: {
      components: {
        Field: '@/components/admin/ColorPickerField#ColorPickerField',
      },
    },
  },
] as const

export const GoaSchoolSnapshotBlock: Block = {
  slug: 'goaSnapshot',
  labels: {
    singular: 'Data Snapshot Block',
    plural: 'Data Snapshot Blocks',
  },
  fields: [
    {
      name: 'isEnabled',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'sectionTitle',
      type: 'text',
      defaultValue: 'Data Snapshots',
      required: true,
    },
    {
      type: 'group',
      name: 'viewOptions',
      fields: [
        {
          name: 'defaultView',
          type: 'select',
          defaultValue: 'schoolTypeManagement',
          options: viewOptions,
          required: true,
        },
        {
          name: 'availableViews',
          type: 'select',
          hasMany: true,
          defaultValue: ['district', 'taluka', 'schoolTypeManagement'],
          options: viewOptions,
          required: true,
        },
      ],
    },
    {
      type: 'group',
      name: 'layout',
      fields: [
        { name: 'showFilterPanel', type: 'checkbox', defaultValue: true },
        { name: 'showLeftPanel', type: 'checkbox', defaultValue: true },
        { name: 'showMiddlePanel', type: 'checkbox', defaultValue: true },
        { name: 'showRightPanel', type: 'checkbox', defaultValue: true },
        {
          name: 'columnsOnDesktop',
          type: 'select',
          defaultValue: '3',
          options: [
            { label: '2 Columns', value: '2' },
            { label: '3 Columns', value: '3' },
            { label: '4 Columns', value: '4' },
          ],
        },
        {
          name: 'cardSpacing',
          type: 'number',
          defaultValue: 24,
          min: 0,
        },
        {
          name: 'cardBorderRadius',
          type: 'number',
          defaultValue: 16,
          min: 0,
        },
        {
          name: 'cardShadow',
          type: 'select',
          defaultValue: 'soft',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Soft', value: 'soft' },
            { label: 'Medium', value: 'medium' },
            { label: 'Strong', value: 'strong' },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'filterSettings',
      fields: [
        { name: 'enableFilters', type: 'checkbox', defaultValue: true },
        { name: 'showApplyButton', type: 'checkbox', defaultValue: true },
        { name: 'applyFilterButton', type: 'text', defaultValue: 'Apply Filter' },
        {
          name: 'filterBy',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'District', value: 'district' },
            { label: 'Taluka', value: 'taluka' },
            { label: 'School Type', value: 'schoolType' },
            { label: 'Management Type', value: 'managementType' },
            { label: 'Medium', value: 'medium' },
          ],
          defaultValue: ['district', 'taluka', 'schoolType'],
        },
        {
          name: 'districtData',
          type: 'array',
          fields: [...dataRowFields],
        },
        {
          name: 'talukaData',
          type: 'array',
          fields: [...dataRowFields],
        },
        {
          name: 'schoolTypeData',
          type: 'array',
          fields: [...dataRowFields],
        },
      ],
    },
    {
      type: 'group',
      name: 'statistics',
      fields: [
        { name: 'minoritySchools', type: 'number', defaultValue: 0 },
        { name: 'girlsOnlySchools', type: 'number', defaultValue: 0 },
        { name: 'boysOnlySchools', type: 'number', defaultValue: 0 },
        { name: 'englishMedium', type: 'number', defaultValue: 0 },
        { name: 'konkaniMedium', type: 'number', defaultValue: 0 },
        { name: 'marathiMedium', type: 'number', defaultValue: 0 },
      ],
    },
    {
      type: 'group',
      name: 'summaryCards',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        {
          name: 'animateScroll',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'When enabled and cards exceed 4, cards scroll smoothly from right to left.',
          },
        },
        {
          name: 'scrollDurationSeconds',
          type: 'number',
          defaultValue: 22,
          min: 8,
          max: 90,
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.animateScroll),
          },
        },
        {
          name: 'cards',
          type: 'array',
          labels: {
            singular: 'Summary Card',
            plural: 'Summary Cards',
          },
          fields: [
            { name: 'isEnabled', type: 'checkbox', defaultValue: true },
            { name: 'label', type: 'text', required: true },
            {
              name: 'iconName',
              type: 'text',
              defaultValue: 'School',
              admin: {
                components: {
                  Field: '@/components/admin/IconPickerField#IconPickerField',
                },
                description: 'Select a Lucide icon',
              },
            },
            {
              name: 'valueSource',
              type: 'select',
              defaultValue: 'custom',
              options: [
                { label: 'Current View Total Schools', value: 'totalSchools' },
                { label: 'District Count', value: 'districtCount' },
                { label: 'Taluka Count', value: 'talukaCount' },
                { label: 'Current View Item Count', value: 'currentViewItems' },
                { label: 'Minority Schools (Statistics)', value: 'minoritySchools' },
                { label: 'Girls Only Schools (Statistics)', value: 'girlsOnlySchools' },
                { label: 'Boys Only Schools (Statistics)', value: 'boysOnlySchools' },
                { label: 'English Medium (Statistics)', value: 'englishMedium' },
                { label: 'Konkani Medium (Statistics)', value: 'konkaniMedium' },
                { label: 'Marathi Medium (Statistics)', value: 'marathiMedium' },
                { label: 'Custom Value', value: 'custom' },
              ],
              required: true,
            },
            {
              name: 'customValue',
              type: 'number',
              defaultValue: 0,
              admin: {
                condition: (_, siblingData) => siblingData?.valueSource === 'custom',
              },
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'mapSettings',
      fields: [
        { name: 'zoom', type: 'number', defaultValue: 8 },
        { name: 'centerLat', type: 'number', defaultValue: 15.2993 },
        { name: 'centerLng', type: 'number', defaultValue: 74.124 },
        {
          type: 'group',
          name: 'colors',
          fields: [
            {
              name: 'mapBackground',
              type: 'text',
              defaultValue: '#f8fafc',
              admin: {
                components: {
                  Field: '@/components/admin/ColorPickerField#ColorPickerField',
                },
              },
            },
            {
              name: 'markerColor',
              type: 'text',
              defaultValue: '#1f9d8f',
              admin: {
                components: {
                  Field: '@/components/admin/ColorPickerField#ColorPickerField',
                },
              },
            },
            {
              name: 'activeMarkerColor',
              type: 'text',
              defaultValue: '#1d4ed8',
              admin: {
                components: {
                  Field: '@/components/admin/ColorPickerField#ColorPickerField',
                },
              },
            },
          ],
        },
        {
          type: 'group',
          name: 'markerSettings',
          fields: [
            { name: 'size', type: 'number', defaultValue: 10, min: 4, max: 28 },
            { name: 'activeSize', type: 'number', defaultValue: 14, min: 6, max: 36 },
            { name: 'showPulse', type: 'checkbox', defaultValue: true },
          ],
        },
      ],
    },
    {
      name: 'mergedTalukas',
      type: 'array',
      fields: [
        { name: 'originalName', type: 'text', required: true },
        { name: 'mergedName', type: 'text', required: true },
      ],
    },
    {
      type: 'group',
      name: 'styles',
      label: 'Fonts & Colors',
      fields: [
        { name: 'fontFamily', type: 'text', defaultValue: 'inherit' },
        {
          name: 'titleColor',
          type: 'text',
          defaultValue: '#0f172a',
          admin: {
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
          },
        },
        {
          name: 'cardBackground',
          type: 'text',
          defaultValue: '#ffffff',
          admin: {
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
          },
        },
        {
          name: 'tableHeaderBackground',
          type: 'text',
          defaultValue: '#1e3a8a',
          admin: {
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'animations',
      fields: [
        { name: 'enableHoverEffects', type: 'checkbox', defaultValue: true },
        { name: 'enableEntryAnimation', type: 'checkbox', defaultValue: true },
      ],
    },
  ],
}
