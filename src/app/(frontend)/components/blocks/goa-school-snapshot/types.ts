export type SnapshotView =
  | 'district'
  | 'taluka'
  | 'schoolTypeManagement'
  | 'minoritySchools'
  | 'girlsOnlySchools'
  | 'boysOnlySchools'
  | 'mediumOfInstruction'

export type SnapshotSummaryCardValueSource =
  | 'totalSchools'
  | 'districtCount'
  | 'talukaCount'
  | 'currentViewItems'
  | 'minoritySchools'
  | 'girlsOnlySchools'
  | 'boysOnlySchools'
  | 'englishMedium'
  | 'konkaniMedium'
  | 'marathiMedium'
  | 'custom'

export interface SnapshotDataRow {
  id?: string | null
  name: string
  totalSchools?: number | null
  percentage?: number | null
  markerLat?: number | null
  markerLng?: number | null
  highlightColor?: string | null
}

export interface SnapshotMergedTaluka {
  id?: string | null
  originalName: string
  mergedName: string
}

export interface SnapshotSummaryCard {
  id?: string | null
  isEnabled?: boolean | null
  label: string
  iconName?: string | null
  valueSource?: SnapshotSummaryCardValueSource | null
  customValue?: number | null
}

export interface GoaSchoolSnapshotBlockData {
  isEnabled?: boolean | null
  sectionTitle?: string | null
  viewOptions?: {
    defaultView?: SnapshotView | null
    availableViews?: SnapshotView[] | null
  } | null
  layout?: {
    showFilterPanel?: boolean | null
    showLeftPanel?: boolean | null
    showMiddlePanel?: boolean | null
    showRightPanel?: boolean | null
    columnsOnDesktop?: '2' | '3' | '4' | null
    cardSpacing?: number | null
    cardBorderRadius?: number | null
    cardShadow?: 'none' | 'soft' | 'medium' | 'strong' | null
  } | null
  filterSettings?: {
    enableFilters?: boolean | null
    showApplyButton?: boolean | null
    applyFilterButton?: string | null
    filterBy?: ('district' | 'taluka' | 'schoolType' | 'managementType' | 'medium')[] | null
    districtData?: SnapshotDataRow[] | null
    talukaData?: SnapshotDataRow[] | null
    schoolTypeData?: SnapshotDataRow[] | null
  } | null
  statistics?: {
    minoritySchools?: number | null
    girlsOnlySchools?: number | null
    boysOnlySchools?: number | null
    englishMedium?: number | null
    konkaniMedium?: number | null
    marathiMedium?: number | null
  } | null
  summaryCards?: {
    enabled?: boolean | null
    animateScroll?: boolean | null
    scrollDurationSeconds?: number | null
    cards?: SnapshotSummaryCard[] | null
  } | null
  mapSettings?: {
    zoom?: number | null
    centerLat?: number | null
    centerLng?: number | null
    colors?: {
      mapBackground?: string | null
      markerColor?: string | null
      activeMarkerColor?: string | null
    } | null
    markerSettings?: {
      size?: number | null
      activeSize?: number | null
      showPulse?: boolean | null
    } | null
  } | null
  mergedTalukas?: SnapshotMergedTaluka[] | null
  styles?: {
    fontFamily?: string | null
    titleColor?: string | null
    cardBackground?: string | null
    tableHeaderBackground?: string | null
  } | null
  animations?: {
    enableHoverEffects?: boolean | null
    enableEntryAnimation?: boolean | null
  } | null
}

export interface SnapshotNormalizedData {
  sectionTitle: string
  currentView: SnapshotView
  availableViews: SnapshotView[]
  selectedRows: SnapshotDataRow[]
  districtRows: SnapshotDataRow[]
  talukaRows: SnapshotDataRow[]
  schoolTypeRows: SnapshotDataRow[]
  stats: Required<NonNullable<GoaSchoolSnapshotBlockData['statistics']>>
  summaryCards: {
    enabled: boolean
    animateScroll: boolean
    scrollDurationSeconds: number
    cards: Array<{
      id?: string | null
      isEnabled: boolean
      label: string
      iconName: string | null
      valueSource: SnapshotSummaryCardValueSource
      customValue: number | null
    }>
  }
  layout: {
    showFilterPanel: boolean
    showLeftPanel: boolean
    showMiddlePanel: boolean
    showRightPanel: boolean
    columnsOnDesktop: '2' | '3' | '4'
    cardSpacing: number
    cardBorderRadius: number
    cardShadow: 'none' | 'soft' | 'medium' | 'strong'
  }
  map: {
    zoom: number
    centerLat: number
    centerLng: number
    mapBackground: string
    markerColor: string
    activeMarkerColor: string
    markerSize: number
    activeMarkerSize: number
    showPulse: boolean
  }
  style: {
    fontFamily: string
    titleColor: string
    cardBackground: string
    tableHeaderBackground: string
  }
  animation: {
    enableHoverEffects: boolean
    enableEntryAnimation: boolean
  }
  mergedTalukaMap: Map<string, string>
}
