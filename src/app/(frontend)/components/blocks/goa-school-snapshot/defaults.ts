import type {
  GoaSchoolSnapshotBlockData,
  SnapshotDataRow,
  SnapshotNormalizedData,
  SnapshotSummaryCard,
  SnapshotView,
} from './types'

const viewLabelOrder: SnapshotView[] = [
  'district',
  'taluka',
  'schoolTypeManagement',
  'minoritySchools',
  'girlsOnlySchools',
  'boysOnlySchools',
  'mediumOfInstruction',
]

function safeRows(rows?: SnapshotDataRow[] | null): SnapshotDataRow[] {
  if (!Array.isArray(rows)) return []
  return rows
    .filter((row) => row && typeof row.name === 'string' && row.name.trim().length > 0)
    .map((row) => ({
      ...row,
      name: row.name.trim(),
      totalSchools: row.totalSchools ?? 0,
      percentage: row.percentage ?? 0,
    }))
}

function getRowsByView(view: SnapshotView, data: GoaSchoolSnapshotBlockData): SnapshotDataRow[] {
  const districtRows = safeRows(data.filterSettings?.districtData)
  const talukaRows = safeRows(data.filterSettings?.talukaData)
  const schoolTypeRows = safeRows(data.filterSettings?.schoolTypeData)

  if (view === 'district') return districtRows
  if (view === 'taluka') return talukaRows
  return schoolTypeRows
}

export function normalizeSnapshotData(data: GoaSchoolSnapshotBlockData): SnapshotNormalizedData {
  const availableViews =
    (data.viewOptions?.availableViews?.filter(Boolean) as SnapshotView[] | undefined) ||
    ['district', 'taluka', 'schoolTypeManagement']

  const defaultView =
    (data.viewOptions?.defaultView as SnapshotView | undefined) || availableViews[0] || 'district'

  const mergedTalukaMap = new Map<string, string>()
  for (const item of data.mergedTalukas || []) {
    if (!item?.originalName || !item?.mergedName) continue
    mergedTalukaMap.set(item.originalName.trim().toLowerCase(), item.mergedName.trim())
  }

  const currentView = viewLabelOrder.includes(defaultView) ? defaultView : 'district'
  const configuredCards = (data.summaryCards?.cards || []).filter(
    (card): card is SnapshotSummaryCard => !!card && typeof card.label === 'string' && card.label.trim().length > 0,
  )
  const summaryCards = configuredCards.map((card) => ({
    id: card.id,
    isEnabled: card.isEnabled !== false,
    label: card.label.trim(),
    iconName: card.iconName?.trim() || null,
    valueSource: card.valueSource || 'custom',
    customValue: typeof card.customValue === 'number' ? card.customValue : null,
  }))

  return {
    // Generic: the block config's own default is 'Data Snapshots'.
    sectionTitle: data.sectionTitle || 'Data Snapshots',
    currentView,
    availableViews,
    selectedRows: getRowsByView(currentView, data),
    districtRows: safeRows(data.filterSettings?.districtData),
    talukaRows: safeRows(data.filterSettings?.talukaData),
    schoolTypeRows: safeRows(data.filterSettings?.schoolTypeData),
    stats: {
      minoritySchools: data.statistics?.minoritySchools ?? 0,
      girlsOnlySchools: data.statistics?.girlsOnlySchools ?? 0,
      boysOnlySchools: data.statistics?.boysOnlySchools ?? 0,
      englishMedium: data.statistics?.englishMedium ?? 0,
      konkaniMedium: data.statistics?.konkaniMedium ?? 0,
      marathiMedium: data.statistics?.marathiMedium ?? 0,
    },
    summaryCards: {
      enabled: data.summaryCards?.enabled !== false,
      animateScroll: data.summaryCards?.animateScroll === true,
      scrollDurationSeconds: Math.min(Math.max(data.summaryCards?.scrollDurationSeconds ?? 22, 8), 90),
      cards: summaryCards,
    },
    layout: {
      showFilterPanel: data.layout?.showFilterPanel !== false,
      showLeftPanel: data.layout?.showLeftPanel !== false,
      showMiddlePanel: data.layout?.showMiddlePanel !== false,
      showRightPanel: data.layout?.showRightPanel !== false,
      columnsOnDesktop: data.layout?.columnsOnDesktop || '3',
      cardSpacing: data.layout?.cardSpacing ?? 24,
      cardBorderRadius: data.layout?.cardBorderRadius ?? 16,
      cardShadow: data.layout?.cardShadow || 'soft',
    },
    map: {
      zoom: data.mapSettings?.zoom ?? 8,
      centerLat: data.mapSettings?.centerLat ?? 15.2993,
      centerLng: data.mapSettings?.centerLng ?? 74.124,
      mapBackground: data.mapSettings?.colors?.mapBackground || '#f8fafc',
      markerColor: data.mapSettings?.colors?.markerColor || '#1f9d8f',
      activeMarkerColor: data.mapSettings?.colors?.activeMarkerColor || '#1d4ed8',
      markerSize: data.mapSettings?.markerSettings?.size ?? 10,
      activeMarkerSize: data.mapSettings?.markerSettings?.activeSize ?? 14,
      showPulse: data.mapSettings?.markerSettings?.showPulse !== false,
    },
    style: {
      fontFamily: data.styles?.fontFamily || 'inherit',
      titleColor: data.styles?.titleColor || '#0f172a',
      cardBackground: data.styles?.cardBackground || '#ffffff',
      tableHeaderBackground: data.styles?.tableHeaderBackground || '#1e3a8a',
    },
    animation: {
      enableHoverEffects: data.animations?.enableHoverEffects !== false,
      enableEntryAnimation: data.animations?.enableEntryAnimation !== false,
    },
    mergedTalukaMap,
  }
}

export function rowsForView(view: SnapshotView, normalized: SnapshotNormalizedData): SnapshotDataRow[] {
  if (view === 'district') return normalized.districtRows
  if (view === 'taluka') return normalized.talukaRows
  return normalized.schoolTypeRows
}
