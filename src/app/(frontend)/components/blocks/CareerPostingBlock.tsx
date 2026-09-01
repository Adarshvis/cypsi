'use client'

import React, { useState } from 'react'
import RichText from '../ui/RichText'
import { ChevronDown } from 'lucide-react'

interface ProblemDomain {
  title?: string | null
  description?: string | null
  challenges?: { text?: string | null; id?: string | null }[] | null
  technicalSkills?: { skill?: string | null; id?: string | null }[] | null
  nonTechnicalSkills?: { skill?: string | null; id?: string | null }[] | null
  id?: string | null
}

interface CareerPostingBlockProps {
  excerpt?: string | null
  effectiveDate?: string | null
  content?: any
  problemDomains?: ProblemDomain[] | null
  applyButtonText?: string | null
  applyButtonLink?: string | null
  status?: 'active' | 'inactive' | null
}

function DomainAccordionItem({ domain }: { domain: ProblemDomain }) {
  const [open, setOpen] = useState(false)

  const hasChallenges = domain.challenges && domain.challenges.length > 0
  const hasTechnical = domain.technicalSkills && domain.technicalSkills.length > 0
  const hasNonTechnical = domain.nonTechnicalSkills && domain.nonTechnicalSkills.length > 0

  return (
    <div className="career-accordion__item">
      <button
        onClick={() => setOpen(!open)}
        className={`career-accordion__trigger ${open ? 'career-accordion__trigger--open' : ''}`}
        aria-expanded={open}
      >
        <span className="career-accordion__trigger-text">{domain.title || 'Untitled Domain'}</span>
        <ChevronDown
          size={20}
          className={`career-accordion__icon ${open ? 'career-accordion__icon--open' : ''}`}
        />
      </button>

      {open && (
        <div className="career-accordion__content">
          {domain.description && (
            <p className="career-accordion__description">{domain.description}</p>
          )}

          {hasChallenges && (
            <div className="career-accordion__section">
              <strong className="career-accordion__section-title">Challenges:</strong>
              <ol className="career-accordion__ol">
                {domain.challenges!.map((c, i) => (
                  c.text ? <li key={c.id || i}>{c.text}</li> : null
                ))}
              </ol>
            </div>
          )}

          {(hasTechnical || hasNonTechnical) && (
            <div className="career-accordion__section">
              <strong className="career-accordion__section-title">Prerequisites:</strong>

              {hasTechnical && (
                <div className="career-accordion__subsection">
                  <strong className="career-accordion__subsection-title">Technical Skills:</strong>
                  <ul className="career-accordion__ul">
                    {domain.technicalSkills!.map((s, i) => (
                      s.skill ? <li key={s.id || i}>{s.skill}</li> : null
                    ))}
                  </ul>
                </div>
              )}

              {hasNonTechnical && (
                <div className="career-accordion__subsection">
                  <strong className="career-accordion__subsection-title">Non-Technical Skills:</strong>
                  <ul className="career-accordion__ul">
                    {domain.nonTechnicalSkills!.map((s, i) => (
                      s.skill ? <li key={s.id || i}>{s.skill}</li> : null
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CareerPostingBlock({
  excerpt,
  effectiveDate,
  content,
  problemDomains,
  applyButtonText,
  applyButtonLink,
  status,
}: CareerPostingBlockProps) {
  // Don't render if inactive
  if (status === 'inactive') return null

  const hasHeader = effectiveDate || excerpt
  const hasDomains = problemDomains && problemDomains.length > 0
  const hasApplyButton = Boolean(applyButtonText)

  return (
    <section className="career-posting">
      {/* Header: effective date + excerpt */}
      {hasHeader && (
        <div className="career-posting__header">
          {effectiveDate && (
            <p className="career-posting__date">{effectiveDate}</p>
          )}
          {excerpt && (
            <p className="career-posting__excerpt">{excerpt}</p>
          )}
          <hr className="career-posting__divider" />
        </div>
      )}

      {/* Rich text content */}
      {content && (
        <div className="career-posting__content">
          <div className="career-posting__richtext">
            <RichText data={content} />
          </div>
        </div>
      )}

      {/* Problem Domains accordion */}
      {hasDomains && (
        <div className="career-posting__domains">
          <h2 className="career-posting__domains-heading">Problem Domains</h2>
          <div className="career-accordion">
            {problemDomains!.map((domain, i) => (
              <DomainAccordionItem key={domain.id || i} domain={domain} />
            ))}
          </div>
        </div>
      )}

      {/* Apply button */}
      {hasApplyButton && (
        <div className="career-posting__apply">
          <a
            href={applyButtonLink || '/applicant/login'}
            className="career-posting__apply-btn"
          >
            {applyButtonText}
          </a>
        </div>
      )}
    </section>
  )
}
