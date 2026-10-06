'use client'

import React, { useEffect, useMemo, useState } from 'react'
import RichText from '../ui/RichText'
import { AlertCircle, ChevronDown, FileText, Upload, X } from 'lucide-react'
import { findDomainField } from '@/lib/requests/fieldHints'

type FormField = {
  id?: string
  blockType: string
  name?: string
  label?: string
  required?: boolean
  width?: number
  defaultValue?: string | boolean | number
  options?: Array<{ label: string; value: string }>
  placeholder?: string
  message?: unknown
  helperText?: string
  accept?: string
  maxSizeMB?: number
}

type FormDoc = {
  id: string | number
  title?: string
  fields?: FormField[]
  submitButtonLabel?: string
  confirmationType?: 'message' | 'redirect'
  confirmationMessage?: unknown
  redirect?: {
    url?: string
  }
}

type SubmissionItem = {
  field: string
  value: string
}

function getFormId(form: unknown): string | null {
  if (!form) return null
  if (typeof form === 'string' || typeof form === 'number') return String(form)
  if (typeof form === 'object' && form !== null && 'id' in form) {
    const id = (form as { id?: string | number }).id
    return typeof id === 'string' || typeof id === 'number' ? String(id) : null
  }
  return null
}

function normalizeSubmissionData(values: Record<string, FormDataEntryValue>): SubmissionItem[] {
  return Object.entries(values)
    .filter(([field]) => field !== '')
    .map(([field, value]) => ({
      field,
      value: typeof value === 'string' ? value : String(value),
    }))
}

function isLexicalData(value: unknown): value is { root: unknown } {
  return typeof value === 'object' && value !== null && 'root' in value
}

function matchesAcceptedType(file: File, accept?: string): boolean {
  if (!accept || accept.trim().length === 0) return true
  const accepted = accept
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  if (accepted.length === 0) return true

  return accepted.some((rule) => {
    if (rule.endsWith('/*')) {
      const prefix = rule.slice(0, -1)
      return file.type.startsWith(prefix)
    }
    return file.type === rule
  })
}

interface FormBuilderEmbedProps {
  form: unknown
  /** `contact` drops the card chrome so the form can sit inside another card. */
  variant?: 'default' | 'contact'
  /** Hide the form document's own title when the host block shows a heading. */
  hideTitle?: boolean
  /** Rendered beside the submit button (e.g. social links). */
  actionsSlot?: React.ReactNode
}

export default function FormBuilderEmbed({
  form,
  variant = 'default',
  hideTitle = false,
  actionsSlot,
}: FormBuilderEmbedProps) {
  const rootClass = variant === 'contact' ? 'apply-form apply-form--contact' : 'apply-form'
  const formId = getFormId(form)
  const initialFormDoc =
    typeof form === 'object' && form !== null && 'fields' in (form as object)
      ? (form as FormDoc)
      : null

  const [formDoc, setFormDoc] = useState<FormDoc | null>(initialFormDoc)
  const [loading, setLoading] = useState<boolean>(!initialFormDoc && !!formId)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [selectValues, setSelectValues] = useState<Record<string, string>>({})
  const [selectSearch, setSelectSearch] = useState<Record<string, string>>({})
  const [openSelect, setOpenSelect] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({})
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({})
  // The internship domain chosen on the Career Posting block (`/apply?domain=…`).
  const [domainParam, setDomainParam] = useState<string | null>(null)

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('domain')?.trim()
    setDomainParam(value ? value.slice(0, 200) : null)
  }, [])

  useEffect(() => {
    if (initialFormDoc || !formId) return

    let active = true

    async function loadForm() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/forms/${formId}`, {
          credentials: 'same-origin',
        })

        if (!res.ok) {
          throw new Error('Failed to load form')
        }

        const data = await res.json()
        if (active) {
          setFormDoc(data)
        }
      } catch (_err) {
        if (active) {
          setError('Unable to load form right now.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadForm()

    return () => {
      active = false
    }
  }, [formId, initialFormDoc])

  const fields = useMemo(() => formDoc?.fields || [], [formDoc])
  const hasResumeUpload = useMemo(
    () => fields.some((field) => field.blockType === 'resumeUpload'),
    [fields],
  )
  // Application forms only: the field the `?domain=` value fills in, if any.
  const domainField = useMemo(
    () =>
      hasResumeUpload ? findDomainField(fields) : undefined,
    [fields, hasResumeUpload],
  )
  const domainOption = useMemo(() => {
    if (!domainParam || !domainField?.options) return undefined
    const wanted = domainParam.toLowerCase()
    return domainField.options.find(
      (option) => option.value.toLowerCase() === wanted || option.label.toLowerCase() === wanted,
    )
  }, [domainField, domainParam])

  useEffect(() => {
    if (domainField?.blockType !== 'select' || !domainField.name || !domainOption) return
    const fieldName = domainField.name
    setSelectValues((prev) => ({ ...prev, [fieldName]: domainOption.value }))
  }, [domainField, domainOption])

  useEffect(() => {
    setSelectValues((prev) => {
      const next = { ...prev }
      for (const field of fields) {
        if (field.blockType !== 'select' || !field.name) continue
        if (next[field.name] !== undefined) continue
        next[field.name] = typeof field.defaultValue === 'string' ? field.defaultValue : ''
      }
      return next
    })
  }, [fields])

  function setFileError(fieldName: string, message: string) {
    setFileErrors((prev) => ({ ...prev, [fieldName]: message }))
  }

  function clearFileError(fieldName: string) {
    setFileErrors((prev) => ({ ...prev, [fieldName]: '' }))
  }

  function handleFileChange(field: FormField, file: File | null) {
    const name = field.name || ''
    if (!name) return

    clearFileError(name)

    if (!file) {
      setSelectedFiles((prev) => ({ ...prev, [name]: null }))
      return
    }

    const maxSizeMB = typeof field.maxSizeMB === 'number' && field.maxSizeMB > 0 ? field.maxSizeMB : 5
    const maxSizeBytes = maxSizeMB * 1024 * 1024

    if (!matchesAcceptedType(file, field.accept || 'application/pdf')) {
      setFileError(name, 'Selected file type is not allowed.')
      setSelectedFiles((prev) => ({ ...prev, [name]: null }))
      return
    }

    if (file.size > maxSizeBytes) {
      setFileError(name, `File size must be under ${maxSizeMB} MB.`)
      setSelectedFiles((prev) => ({ ...prev, [name]: null }))
      return
    }

    setSelectedFiles((prev) => ({ ...prev, [name]: file }))
  }

  function removeSelectedFile(fieldName: string) {
    clearFileError(fieldName)
    setSelectedFiles((prev) => ({ ...prev, [fieldName]: null }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formDoc?.id) return

    const formElement = event.currentTarget
    const fd = new FormData(formElement)
    const values: Record<string, FormDataEntryValue> = {}

    for (const [key, value] of fd.entries()) {
      if (key) values[key] = value
    }

    const submissionData = normalizeSubmissionData(values)

    try {
      setSubmitting(true)
      setError(null)

      let res: Response

      if (hasResumeUpload) {
        // Internship application: the form carries a resume, so it goes to
        // /api/apply, which stores the PDF and creates an internship
        // application. The server maps the fields (name, email, domain, ...)
        // from the form definition; every value is sent under its field name.
        const resumeField = fields.find((field) => field.blockType === 'resumeUpload' && field.name)
        if (!resumeField?.name) {
          setError('Resume upload field is misconfigured.')
          return
        }

        const resumeFile = selectedFiles[resumeField.name] || null
        if (!resumeFile) {
          setFileError(resumeField.name, 'Please upload your resume.')
          return
        }

        // The file input has no `name`, so only the chosen file is attached below.
        const applyFormData = new FormData(formElement)
        applyFormData.set('form', String(formDoc.id))
        applyFormData.set('resume', resumeFile)
        if (!domainField && domainParam) applyFormData.set('domain', domainParam)

        res = await fetch('/api/apply', {
          method: 'POST',
          body: applyFormData,
        })
      } else {
        res = await fetch('/api/form-submissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            form: String(formDoc.id),
            submissionData,
          }),
        })
      }

      if (!res.ok) {
        const response = await res.json().catch(() => null)
        throw new Error(response?.error || 'Submission failed')
      }

      if (formDoc.confirmationType === 'redirect' && formDoc.redirect?.url) {
        window.location.href = formDoc.redirect.url
        return
      }

      setSuccess(true)
      formElement.reset()
      setSelectedFiles({})
      setFileErrors({})
    } catch (_err) {
      const message =
        _err instanceof Error ? _err.message : 'Could not submit the form. Please try again.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!formId) return null

  if (loading) {
    return <div className={rootClass}>Loading form...</div>
  }

  if (error && !formDoc) {
    return (
      <div className={rootClass}>
        <div className="apply-form__error-banner" role="alert">
          {error}
        </div>
      </div>
    )
  }

  if (!formDoc) return null

  return (
    <div className={rootClass}>
      {formDoc.title && !hideTitle ? (
        <h3 className="apply-page__title" style={{ marginBottom: '0' }}>
          {formDoc.title}
        </h3>
      ) : null}

      {success && formDoc.confirmationType === 'message' && formDoc.confirmationMessage ? (
        <div className="apply-success__message" style={{ margin: 0 }}>
          {isLexicalData(formDoc.confirmationMessage) ? (
            <RichText data={formDoc.confirmationMessage as any} />
          ) : null}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error ? (
            <div className="apply-form__error-banner" role="alert">
              {error}
            </div>
          ) : null}

          {hasResumeUpload && !domainField && domainParam ? (
            <p className="apply-form__hint">
              Applying for: <strong>{domainParam}</strong>
            </p>
          ) : null}

          <div className="apply-form__grid" style={{ marginTop: error ? '1.25rem' : 0 }}>
            {fields.map((field, index) => {
              const key = field.id || `${field.blockType}-${field.name || index}`
              const isAlwaysFullWidth =
                field.blockType === 'message' || field.blockType === 'resumeUpload' || field.blockType === 'checkbox'
              const isHalfWidth =
                !isAlwaysFullWidth &&
                (field.width === 50 || field.width === undefined || field.width === null)
              const fieldClass = `apply-form__field${isHalfWidth ? '' : ' apply-form__field--full'}`

              if (field.blockType === 'message') {
                return (
                  <div key={key} className="apply-form__field apply-form__field--full">
                    {isLexicalData(field.message) ? <RichText data={field.message as any} /> : null}
                  </div>
                )
              }

              const name = field.name || ''
              if (!name) return null

              if (field.blockType === 'resumeUpload') {
                const selectedFile = selectedFiles[name]
                const helperText = field.helperText || 'Only PDF files accepted. Maximum size: 5 MB.'
                const maxSizeMB =
                  typeof field.maxSizeMB === 'number' && field.maxSizeMB > 0 ? field.maxSizeMB : 5
                const acceptedText =
                  (field.accept || 'application/pdf') === 'application/pdf'
                    ? 'PDF only'
                    : field.accept || 'Allowed file types'

                return (
                  <div key={key} className="apply-form__field apply-form__field--full">
                    <label className="apply-form__label" htmlFor={`${name}-upload`}>
                      {field.label || name}
                      {field.required ? <span className="apply-form__required">*</span> : null}
                    </label>
                    <p className="apply-form__hint" id={`${name}-help`}>
                      {helperText}
                    </p>

                    {!selectedFile ? (
                      <label className="apply-form__dropzone" htmlFor={`${name}-upload`}>
                        <Upload size={32} className="apply-form__dropzone-icon" />
                        <span className="apply-form__dropzone-text">Click to select your PDF resume</span>
                        <span className="apply-form__dropzone-sub">
                          {acceptedText}, max {maxSizeMB} MB
                        </span>
                        <input
                          id={`${name}-upload`}
                          type="file"
                          accept={field.accept || 'application/pdf'}
                          aria-describedby={
                            fileErrors[name] ? `${name}-help ${name}-error` : `${name}-help`
                          }
                          aria-invalid={fileErrors[name] ? true : undefined}
                          className="apply-form__file-input"
                          onChange={(event) => {
                            const file = event.target.files?.[0] || null
                            handleFileChange(field, file)
                          }}
                        />
                      </label>
                    ) : (
                      <div className="apply-form__file-selected">
                        <FileText size={20} className="apply-form__file-icon" />
                        <span className="apply-form__file-name">{selectedFile.name}</span>
                        <span className="apply-form__file-size">
                          ({(selectedFile.size / 1024).toFixed(0)} KB)
                        </span>
                        <button
                          type="button"
                          className="apply-form__file-remove"
                          onClick={() => removeSelectedFile(name)}
                          aria-label="Remove file"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}

                    {fileErrors[name] ? (
                      <p className="apply-form__field-error" id={`${name}-error`} role="alert">
                        <AlertCircle size={14} aria-hidden="true" /> {fileErrors[name]}
                      </p>
                    ) : null}
                  </div>
                )
              }

              if (field.blockType === 'select') {
                const currentSelectVal = selectValues[name] || ''
                const searchValue = selectSearch[name] || ''
                const options = field.options || []
                const filteredOptions = options.filter((option) => {
                  const keyword = searchValue.trim().toLowerCase()
                  if (!keyword) return true
                  return (
                    option.label.toLowerCase().includes(keyword) ||
                    option.value.toLowerCase().includes(keyword)
                  )
                })
                const selectedLabel =
                  options.find((option) => option.value === currentSelectVal)?.label ||
                  field.placeholder ||
                  'Select an option'
                return (
                  <React.Fragment key={key}>
                    <label className={fieldClass}>
                      <span className="apply-form__label">
                        {field.label || name}
                        {field.required ? <span className="apply-form__required">*</span> : null}
                      </span>
                      <select
                        name={name}
                        required={Boolean(field.required)}
                        value={currentSelectVal}
                        onChange={(e) => setSelectValues((prev) => ({ ...prev, [name]: e.target.value }))}
                        className="apply-form__native-select-proxy"
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        <option value="">{field.placeholder || 'Select an option'}</option>
                        {options.map((option) => (
                          <option key={`${name}-${option.value}`} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <div
                        className="apply-form__custom-select"
                        tabIndex={0}
                        onBlur={(event) => {
                          const nextTarget = event.relatedTarget as Node | null
                          if (!event.currentTarget.contains(nextTarget)) {
                            setOpenSelect((prev) => (prev === name ? null : prev))
                          }
                        }}
                      >
                        <button
                          type="button"
                          className="apply-form__custom-select-trigger"
                          onClick={() => setOpenSelect((prev) => (prev === name ? null : name))}
                        >
                          <span className="apply-form__custom-select-label">{selectedLabel}</span>
                          <ChevronDown size={16} className="apply-form__custom-select-icon" />
                        </button>

                        {openSelect === name ? (
                          <div className="apply-form__custom-select-panel">
                            <input
                              type="text"
                              value={searchValue}
                              onChange={(event) =>
                                setSelectSearch((prev) => ({ ...prev, [name]: event.target.value }))
                              }
                              placeholder="Search options..."
                              className="apply-form__custom-select-search"
                            />
                            <div className="apply-form__custom-select-options">
                              {filteredOptions.map((option) => (
                                <button
                                  type="button"
                                  key={`${name}-${option.value}`}
                                  className={`apply-form__custom-select-option${
                                    currentSelectVal === option.value
                                      ? ' apply-form__custom-select-option--active'
                                      : ''
                                  }`}
                                  onClick={() => {
                                    setSelectValues((prev) => ({ ...prev, [name]: option.value }))
                                    setOpenSelect(null)
                                  }}
                                >
                                  {option.label}
                                </button>
                              ))}
                              {filteredOptions.length === 0 ? (
                                <div className="apply-form__custom-select-empty">No options found</div>
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </label>
                  </React.Fragment>
                )
              }

              if (field.blockType === 'radio') {
                const isDomain = field === domainField
                return (
                  // Remounts once `?domain=` is read so the preselection applies.
                  <fieldset key={isDomain ? `${key}-${domainParam ?? ''}` : key} className={fieldClass}>
                    <legend className="apply-form__label">
                      {field.label || name}
                      {field.required ? <span className="apply-form__required">*</span> : null}
                    </legend>
                    {(field.options || []).map((option) => (
                      <label
                        key={`${name}-${option.value}`}
                        className="apply-form__hint"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <input
                          type="radio"
                          name={name}
                          value={option.value}
                          required={Boolean(field.required)}
                          defaultChecked={isDomain && domainOption?.value === option.value}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </fieldset>
                )
              }

              if (field.blockType === 'checkbox') {
                return (
                  <label key={key} className={fieldClass}>
                    <span
                      className="apply-form__hint"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <input
                        type="checkbox"
                        name={name}
                        value="true"
                        defaultChecked={Boolean(field.defaultValue)}
                        required={Boolean(field.required)}
                      />
                      <span className="apply-form__label" style={{ margin: 0 }}>
                        {field.label || name}
                        {field.required ? <span className="apply-form__required">*</span> : null}
                      </span>
                    </span>
                  </label>
                )
              }

              const inputType =
                field.blockType === 'email'
                  ? 'email'
                  : field.blockType === 'number'
                    ? 'number'
                    : field.blockType === 'date'
                      ? 'date'
                      : 'text'

              if (field.blockType === 'textarea') {
                return (
                  <label key={key} className={fieldClass}>
                    <span className="apply-form__label">
                      {field.label || name}
                      {field.required ? <span className="apply-form__required">*</span> : null}
                    </span>
                    <textarea
                      name={name}
                      required={Boolean(field.required)}
                      defaultValue={typeof field.defaultValue === 'string' ? field.defaultValue : ''}
                      placeholder={field.placeholder || ''}
                      className="apply-form__input"
                      style={{ minHeight: '7rem', resize: 'vertical' }}
                    />
                  </label>
                )
              }

              const isDomainText = field === domainField && Boolean(domainParam)
              return (
                // Remounts once `?domain=` is read so the prefill applies.
                <label key={isDomainText ? `${key}-${domainParam}` : key} className={fieldClass}>
                  <span className="apply-form__label">
                    {field.label || name}
                    {field.required ? <span className="apply-form__required">*</span> : null}
                  </span>
                  <input
                    type={inputType}
                    name={name}
                    required={Boolean(field.required)}
                    defaultValue={
                      isDomainText && domainParam
                        ? domainParam
                        : typeof field.defaultValue === 'string' || typeof field.defaultValue === 'number'
                          ? String(field.defaultValue)
                          : ''
                    }
                    placeholder={field.placeholder || ''}
                    className="apply-form__input"
                  />
                </label>
              )
            })}
          </div>

          <div className="apply-form__actions" style={{ marginTop: '1.5rem' }}>
            <button type="submit" disabled={submitting} className="apply-form__submit">
              {submitting ? 'Submitting...' : formDoc.submitButtonLabel || 'Submit Application'}
            </button>
            {actionsSlot}
          </div>
        </form>
      )}
    </div>
  )
}

