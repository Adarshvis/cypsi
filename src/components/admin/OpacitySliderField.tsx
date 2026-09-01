'use client'

import React from 'react'
import { useField, FieldLabel, FieldDescription } from '@payloadcms/ui'
import type { NumberFieldClientComponent } from 'payload'

export const OpacitySliderField: NumberFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<number>({ path })

  const opacity = value ?? 50
  const label = field?.label || field?.name || 'Opacity'
  const description = field?.admin?.description
  const min = field && 'min' in field ? (field.min ?? 0) : 0
  const max = field && 'max' in field ? (field.max ?? 100) : 100

  return (
    <div style={{ marginBottom: '24px' }}>
      <FieldLabel label={label} path={path} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginTop: '8px',
        }}
      >
        {/* Range slider */}
        <input
          type="range"
          min={min}
          max={max}
          value={opacity}
          onChange={(e) => setValue(Number(e.target.value))}
          style={{
            flex: 1,
            height: '6px',
            borderRadius: '3px',
            cursor: 'pointer',
            accentColor: 'var(--theme-success-500, #10b981)',
          }}
        />

        {/* Number input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <input
            type="number"
            min={min}
            max={max}
            value={opacity}
            onChange={(e) => {
              const val = Number(e.target.value)
              if (val >= min && val <= max) {
                setValue(val)
              }
            }}
            style={{
              width: '60px',
              padding: '8px 8px',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '4px',
              backgroundColor: 'var(--theme-input-bg)',
              color: 'var(--theme-text)',
              fontSize: '14px',
              textAlign: 'center',
              lineHeight: '20px',
            }}
          />
          <span
            style={{
              color: 'var(--theme-elevation-500)',
              fontSize: '14px',
            }}
          >
            %
          </span>
        </div>

        {/* Opacity preview */}
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            border: '2px solid var(--theme-elevation-150)',
            flexShrink: 0,
            background: `linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)`,
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0, 4px 4px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#000000',
              opacity: opacity / 100,
            }}
          />
        </div>
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
