'use client'

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useField, FieldLabel, FieldDescription } from '@payloadcms/ui'
import { icons } from 'lucide-react'
import type { TextFieldClientComponent } from 'payload'

const allIconNames = Object.keys(icons)
const PAGE_SIZE = 60

export const IconPickerField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const label = field?.label || field?.name || 'Icon'
  const description = field?.admin?.description

  // Filter icons by search term
  const filtered = useMemo(() => {
    if (!search.trim()) return allIconNames
    const lower = search.toLowerCase()
    return allIconNames.filter((name) => name.toLowerCase().includes(lower))
  }, [search])

  // Paginate
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const visible = useMemo(
    () => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [filtered, page],
  )

  // Reset page when search changes
  useEffect(() => {
    setPage(0)
  }, [search])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const selectIcon = useCallback(
    (name: string) => {
      setValue(name)
      setOpen(false)
      setSearch('')
    },
    [setValue],
  )

  const clearIcon = useCallback(() => {
    setValue('')
  }, [setValue])

  // Render a single Lucide icon by name
  const renderIcon = (name: string, size = 20) => {
    const IconComp = icons[name as keyof typeof icons]
    if (!IconComp) return null
    return <IconComp size={size} />
  }

  return (
    <div style={{ marginBottom: '24px', position: 'relative' }}>
      <FieldLabel label={label} path={path} />

      {/* Trigger / selected value display */}
      <div
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '8px',
          padding: '8px 12px',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: '4px',
          backgroundColor: 'var(--theme-input-bg)',
          cursor: 'pointer',
          minHeight: '42px',
        }}
      >
        {value ? (
          <>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: 'var(--theme-elevation-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {renderIcon(value, 20)}
            </div>
            <span
              style={{
                flex: 1,
                fontSize: '14px',
                color: 'var(--theme-text)',
                fontFamily: 'monospace',
              }}
            >
              {value}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                clearIcon()
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--theme-elevation-500)',
                fontSize: '18px',
                padding: '0 4px',
                lineHeight: 1,
              }}
              title="Clear icon"
            >
              &times;
            </button>
          </>
        ) : (
          <span style={{ color: 'var(--theme-elevation-400)', fontSize: '14px' }}>
            Click to select an icon...
          </span>
        )}
      </div>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 100,
            marginTop: '4px',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '8px',
            backgroundColor: 'var(--theme-bg)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            maxHeight: '420px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Search input */}
          <div style={{ padding: '12px 12px 8px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons..."
              autoFocus
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--theme-elevation-150)',
                borderRadius: '4px',
                backgroundColor: 'var(--theme-input-bg)',
                color: 'var(--theme-text)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div
              style={{
                fontSize: '12px',
                color: 'var(--theme-elevation-500)',
                marginTop: '6px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>{filtered.length} icons found</span>
              {totalPages > 1 && (
                <span>
                  Page {page + 1} of {totalPages}
                </span>
              )}
            </div>
          </div>

          {/* Icon grid */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0 12px 8px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))',
                gap: '4px',
              }}
            >
              {visible.map((name) => {
                const isSelected = name === value
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => selectIcon(name)}
                    title={name}
                    style={{
                      width: '44px',
                      height: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: isSelected
                        ? '2px solid var(--theme-success-500, #10b981)'
                        : '1px solid transparent',
                      borderRadius: '6px',
                      backgroundColor: isSelected
                        ? 'var(--theme-success-100, rgba(16,185,129,0.1))'
                        : 'transparent',
                      cursor: 'pointer',
                      color: 'var(--theme-text)',
                      transition: 'background-color 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor =
                          'var(--theme-elevation-100)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    {renderIcon(name, 20)}
                  </button>
                )
              })}
            </div>

            {filtered.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '24px',
                  color: 'var(--theme-elevation-400)',
                  fontSize: '14px',
                }}
              >
                No icons match &ldquo;{search}&rdquo;
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px 12px',
                borderTop: '1px solid var(--theme-elevation-100)',
              }}
            >
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                style={{
                  padding: '4px 12px',
                  border: '1px solid var(--theme-elevation-150)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--theme-input-bg)',
                  color: page === 0 ? 'var(--theme-elevation-300)' : 'var(--theme-text)',
                  cursor: page === 0 ? 'default' : 'pointer',
                  fontSize: '13px',
                }}
              >
                &larr; Prev
              </button>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                style={{
                  padding: '4px 12px',
                  border: '1px solid var(--theme-elevation-150)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--theme-input-bg)',
                  color:
                    page >= totalPages - 1
                      ? 'var(--theme-elevation-300)'
                      : 'var(--theme-text)',
                  cursor: page >= totalPages - 1 ? 'default' : 'pointer',
                  fontSize: '13px',
                }}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {description && (
        <FieldDescription
          description={typeof description === 'string' ? description : undefined}
          path={path}
        />
      )}
    </div>
  )
}
