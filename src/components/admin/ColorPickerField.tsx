'use client'

import React from 'react'
import { useField, FieldLabel, FieldDescription } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

export const ColorPickerField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })

  const color = value || '#000000'
  const label = field?.label || field?.name || 'Color'
  const description = field?.admin?.description

  return (
    <div style={{ marginBottom: '24px' }}>
      <FieldLabel label={label} path={path} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '8px',
        }}
      >
        {/* Color picker input */}
        <div
          style={{
            position: 'relative',
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '2px solid var(--theme-elevation-150)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <input
            type="color"
            value={color}
            onChange={(e) => setValue(e.target.value)}
            style={{
              position: 'absolute',
              inset: '-8px',
              width: 'calc(100% + 16px)',
              height: 'calc(100% + 16px)',
              cursor: 'pointer',
              border: 'none',
              padding: 0,
            }}
          />
        </div>

        {/* Hex text input */}
        <input
          type="text"
          value={value || ''}
          onChange={(e) => setValue(e.target.value)}
          placeholder="#000000"
          style={{
            flex: 1,
            padding: '10px 12px',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '4px',
            backgroundColor: 'var(--theme-input-bg)',
            color: 'var(--theme-text)',
            fontSize: '14px',
            fontFamily: 'monospace',
            lineHeight: '20px',
          }}
        />

        {/* Preview swatch */}
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            backgroundColor: color,
            border: '2px solid var(--theme-elevation-150)',
            flexShrink: 0,
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
          }}
          title={color}
        />
      </div>

      {description && (
        <FieldDescription
          description={typeof description === 'string' ? description : undefined}
          path={path}
        />
      )}
    </div>
  )
}
