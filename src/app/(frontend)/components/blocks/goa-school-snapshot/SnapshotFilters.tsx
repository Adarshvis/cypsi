import React from 'react'
import type { SnapshotView } from './types'

const viewLabels: Record<SnapshotView, string> = {
  district: 'District',
  taluka: 'Taluka',
  schoolTypeManagement: 'School Type & Management',
  minoritySchools: 'Minority Schools',
  girlsOnlySchools: 'Only Girls Schools',
  boysOnlySchools: 'Only Boys Schools',
  mediumOfInstruction: 'Medium of Instruction',
}

interface SnapshotFiltersProps {
  availableViews: SnapshotView[]
  currentView: SnapshotView
  onViewChange: (view: SnapshotView) => void
  applyLabel: string
  showApplyButton?: boolean
}

export default function SnapshotFilters({
  availableViews,
  currentView,
  onViewChange,
  applyLabel,
  showApplyButton = true,
}: SnapshotFiltersProps) {
  if (!availableViews.length) return null

  return (
    <div className="flex flex-wrap items-center gap-[calc(var(--spacing)*1)]">
      <label className="text-sm font-semibold text-slate-700" htmlFor="snapshot-view-select">
        View by:
      </label>
      <select
        id="snapshot-view-select"
        value={currentView}
        onChange={(e) => onViewChange(e.target.value as SnapshotView)}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
      >
        {availableViews.map((view) => (
          <option key={view} value={view}>
            {viewLabels[view]}
          </option>
        ))}
      </select>
      {showApplyButton && (
        <button
          type="button"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {applyLabel}
        </button>
      )}
    </div>
  )
}
