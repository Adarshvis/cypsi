'use client'

import React, { useState, useRef, useEffect } from 'react'
import RichText from '../ui/RichText'
import SectionHeading from '../ui/SectionHeading'

interface TabsBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  tabs: {
    label: string
    content: any
    id?: string | null
  }[]
}

export default function TabsBlock({ sectionHeading, sectionDescription, headingAlignment, tabs }: TabsBlockProps) {
  const [activeTab, setActiveTab] = useState(0)
  const tabsRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({})

  // Slide the active indicator to the selected tab
  useEffect(() => {
    if (activeRef.current && tabsRef.current) {
      const container = tabsRef.current
      const btn = activeRef.current
      setIndicatorStyle({
        left: btn.offsetLeft - container.scrollLeft,
        width: btn.offsetWidth,
      })
    }
  }, [activeTab])

  if (!tabs || tabs.length === 0) return null

  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />

        {/* Tab bar */}
        <div className="relative mb-10">
          <div
            ref={tabsRef}
            className="flex gap-1 overflow-x-auto scrollbar-hide rounded-xl p-1.5"
            style={{ background: 'var(--cms-muted-bg, #f1f5f9)' }}
          >
            {tabs.map((tab, i) => {
              const isActive = i === activeTab
              return (
                <button
                  key={tab.id || tab.label}
                  ref={isActive ? activeRef : undefined}
                  onClick={() => setActiveTab(i)}
                  className="relative px-5 py-2.5 text-sm font-semibold whitespace-nowrap rounded-lg transition-all duration-200"
                  style={{
                    background: isActive ? 'white' : 'transparent',
                    color: isActive
                      ? 'var(--cms-primary, #4B2E83)'
                      : 'var(--cms-text, #64748b)',
                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab content */}
        <div>
          <RichText data={tabs[activeTab].content} />
        </div>
      </div>
    </section>
  )
}
