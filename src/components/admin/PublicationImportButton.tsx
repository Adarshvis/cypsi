'use client'

import React, { useState } from 'react'

interface ImportResult {
  success: boolean
  message: string
  results?: {
    imported: number
    skipped: number
    errors: number
    details: Array<{ title: string; status: string; reason?: string }>
  }
}

/**
 * CrossRef is intentionally absent: its author search matches on name text and
 * returns papers by unrelated people. It is still used server-side for
 * DOI-based keyword enrichment during ORCID imports.
 */
const sources = [
  {
    id: 'orcid',
    name: 'ORCID',
    idLabel: 'ORCID iD',
    idPlaceholder: 'e.g. 0000-0002-1234-5678',
    requiresApiKey: false,
    description: 'Free API — matches a specific researcher, most reliable',
  },
  {
    id: 'semantic-scholar',
    name: 'Semantic Scholar',
    idLabel: 'Semantic Scholar Author ID',
    idPlaceholder: 'e.g. 1741101',
    requiresApiKey: false,
    description: 'Free API — find your Author ID on semanticscholar.org',
  },
  {
    id: 'google-scholar',
    name: 'Google Scholar',
    idLabel: 'Google Scholar Author ID',
    idPlaceholder: 'e.g. rSMl_OIAAAAJ',
    requiresApiKey: true,
    description: 'Via SerpAPI — requires a paid key from serpapi.com',
  },
]

export const PublicationImportButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSource, setSelectedSource] = useState('')
  const [authorId, setAuthorId] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')

  const currentSource = sources.find((s) => s.id === selectedSource)

  const handleReset = () => {
    setSelectedSource('')
    setAuthorId('')
    setApiKey('')
    setResult(null)
    setError('')
  }

  const handleImport = async () => {
    if (!selectedSource || !authorId.trim()) {
      setError('Select a source and enter the required ID')
      return
    }
    if (currentSource?.requiresApiKey && !apiKey.trim()) {
      setError('An API key is required for this source')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const body: Record<string, string> = {
        source: selectedSource,
        authorId: authorId.trim(),
      }
      if (currentSource?.requiresApiKey) body.apiKey = apiKey.trim()

      const response = await fetch('/api/publications/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Import failed')
        return
      }
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const statusColor = (status: string) =>
    status === 'imported' ? '#28a745' : status === 'skipped' ? '#e6a817' : '#dc3545'

  const rowBackground = (status: string) =>
    status === 'imported' ? '#f0fff0' : status === 'skipped' ? '#fffff0' : '#fff0f0'

  return (
    <div style={{ marginBottom: 20 }}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen)
          if (isOpen) handleReset()
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          backgroundColor: isOpen ? '#333' : 'var(--theme-elevation-800, #0066cc)',
          color: '#fff',
          borderRadius: 4,
          border: 'none',
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        {isOpen ? 'Close Import' : 'Import from External Source'}
      </button>

      {isOpen && (
        <div
          style={{
            marginTop: 12,
            padding: 20,
            border: '1px solid var(--theme-elevation-150, #ddd)',
            borderRadius: 8,
            backgroundColor: 'var(--theme-elevation-50, #fafafa)',
            maxWidth: 700,
          }}
        >
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>
            Import Publications from External Source
          </h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
              Select Source
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {sources.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => {
                    setSelectedSource(source.id)
                    setError('')
                    setResult(null)
                  }}
                  style={{
                    padding: 12,
                    border:
                      selectedSource === source.id
                        ? '2px solid #0066cc'
                        : '1px solid var(--theme-elevation-150, #ccc)',
                    borderRadius: 6,
                    backgroundColor:
                      selectedSource === source.id ? '#e6f0ff' : 'var(--theme-input-bg, #fff)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{source.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                    {source.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {currentSource && (
            <>
              <div style={{ marginBottom: 12 }}>
                <label
                  htmlFor="import-author-id"
                  style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}
                >
                  {currentSource.idLabel}
                </label>
                <input
                  id="import-author-id"
                  type="text"
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  placeholder={currentSource.idPlaceholder}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--theme-elevation-150, #ccc)',
                    borderRadius: 4,
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {currentSource.requiresApiKey && (
                <div style={{ marginBottom: 12 }}>
                  <label
                    htmlFor="import-api-key"
                    style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}
                  >
                    SerpAPI Key
                  </label>
                  <input
                    id="import-api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your SerpAPI key"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--theme-elevation-150, #ccc)',
                      borderRadius: 4,
                      fontSize: 14,
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                    Used for this import only — it is not saved.
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleImport}
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  backgroundColor: loading ? '#999' : '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? 'wait' : 'pointer',
                }}
              >
                {loading ? 'Importing…' : 'Fetch & Import Publications'}
              </button>
            </>
          )}

          {error && (
            <div
              role="alert"
              style={{
                marginTop: 12,
                padding: '10px 14px',
                backgroundColor: '#fff3f3',
                border: '1px solid #e55',
                borderRadius: 4,
                color: '#c00',
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          {result && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#f0fff0',
                  border: '1px solid #4a4',
                  borderRadius: 4,
                  marginBottom: 12,
                  fontSize: 14,
                }}
              >
                <strong>{result.message}</strong>
              </div>

              {result.results && result.results.details.length > 0 && (
                <div
                  style={{
                    maxHeight: 300,
                    overflowY: 'auto',
                    border: '1px solid var(--theme-elevation-150, #ddd)',
                    borderRadius: 4,
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--theme-elevation-100, #f5f5f5)' }}>
                        <th scope="col" style={{ padding: '8px 12px', textAlign: 'left' }}>
                          Title
                        </th>
                        <th
                          scope="col"
                          style={{ padding: '8px 12px', textAlign: 'left', width: 120 }}
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.results.details.map((item, i) => (
                        <tr
                          key={`${item.title}-${i}`}
                          style={{
                            borderTop: '1px solid var(--theme-elevation-100, #eee)',
                            backgroundColor: rowBackground(item.status),
                          }}
                        >
                          <td style={{ padding: '6px 12px' }}>
                            {item.title?.substring(0, 80)}
                            {item.title?.length > 80 ? '…' : ''}
                          </td>
                          <td style={{ padding: '6px 12px' }}>
                            <span style={{ fontWeight: 600, color: statusColor(item.status) }}>
                              {item.status}
                            </span>
                            {item.reason && (
                              <span style={{ opacity: 0.6, marginLeft: 4 }}>({item.reason})</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  marginTop: 12,
                  padding: '8px 16px',
                  backgroundColor: '#0066cc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Refresh List
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PublicationImportButton
