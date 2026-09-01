import type { Payload } from 'payload'
import { getPreset, type ThemePreset } from './themePresets'

/**
 * Layout mapping rules: maps block layouts between themes.
 * Key = blockType, value = mapping from old layout → new layout.
 *
 * IMPORTANT: fromLayouts should ONLY contain the OTHER theme's layout,
 * not the target layout. This prevents changing blocks that were manually
 * set to a specific layout on other pages.
 *
 * Example: switching to learner should only change 'duccService' → 'classic',
 * NOT touch blocks already set to 'classic' on other pages.
 */
function getLayoutMappings(preset: ThemePreset, targetTheme: string) {
  // Determine which layouts belong to the "other" theme
  const isDucc = targetTheme === 'ducc'

  return {
    hero: {
      fromLayouts: isDucc ? ['split'] : ['duccFullscreen'],
      toLayout: preset.layouts.hero,
      extraProps: preset.layouts.hero === 'split'
        ? { split_theme: 'light', split_direction: 'textLeft' }
        : {},
    },
    featureCards: {
      fromLayouts: isDucc ? ['classic'] : ['duccService'],
      toLayout: preset.layouts.featureCards,
      extraProps: {
        card_theme: preset.layouts.featureCardsTheme,
        show_card_button: preset.layouts.featureCardsShowButton,
      },
    },
    newsUpdates: {
      fromLayouts: isDucc ? ['spotlight'] : ['duccCards'],
      toLayout: preset.layouts.news,
      extraProps: {},
    },
    statistics: {
      fromLayouts: isDucc ? ['cardGrid'] : ['duccStrip'],
      toLayout: preset.layouts.statistics,
      extraProps: {},
    },
    testimonials: {
      fromLayouts: isDucc ? ['default'] : ['duccQuote'],
      toLayout: preset.layouts.testimonials,
      extraProps: {},
    },
    callToAction: {
      fromLayouts: isDucc ? ['default'] : ['duccBanner'],
      toLayout: preset.layouts.callToAction,
      extraProps: {},
    },
    faq: {
      fromLayouts: isDucc ? ['default'] : ['duccAccordion'],
      toLayout: preset.layouts.faq,
      extraProps: {},
    },
  }
}

/**
 * Map block slug to the DB column name for its layout field.
 */
const blockLayoutColumns: Record<string, string> = {
  hero: 'layout',
  featureCards: 'card_layout',
  newsUpdates: 'layout',
  statistics: 'layout',
  testimonials: 'layout',
  callToAction: 'layout',
  faq: 'layout',
}

/**
 * Map block slug to its DB table suffix (used in pages_blocks_xxx, news_blocks_xxx, etc.)
 */
const blockTableSuffixes: Record<string, string> = {
  hero: 'hero',
  featureCards: 'feature_cards',
  newsUpdates: 'news_updates',
  statistics: 'statistics',
  testimonials: 'testimonials',
  callToAction: 'call_to_action',
  faq: 'faq',
}

/** All parent collections that have layout blocks */
const parentTables = ['pages', 'news']

/**
 * Apply theme layout overrides to all blocks in the database.
 * This directly updates the block tables via SQL for speed and reliability.
 */
export async function applyThemeToBlocks(payload: Payload, themeName: string) {
  const preset = getPreset(themeName)
  const mappings = getLayoutMappings(preset, themeName)
  const db = (payload.db as any).pool

  let totalUpdated = 0

  for (const [blockType, mapping] of Object.entries(mappings)) {
    const tableSuffix = blockTableSuffixes[blockType]
    const layoutCol = blockLayoutColumns[blockType]
    if (!tableSuffix || !layoutCol) continue

    for (const parentTable of parentTables) {
      const tableName = `${parentTable}_blocks_${tableSuffix}`

      // Check if table exists
      try {
        const tableCheck = await db.query(
          `SELECT 1 FROM information_schema.tables WHERE table_name = $1 LIMIT 1`,
          [tableName]
        )
        if (tableCheck.rows.length === 0) continue
      } catch {
        continue
      }

      // Update layout column for matching rows
      const fromValues = mapping.fromLayouts
      try {
        // Get the actual enum type name from the schema
        const typeInfo = await db.query(
          `SELECT data_type, udt_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
          [tableName, layoutCol]
        )
        const isEnum = typeInfo.rows[0]?.data_type === 'USER-DEFINED'
        const enumName = typeInfo.rows[0]?.udt_name

        let result
        if (isEnum) {
          result = await db.query(
            `UPDATE "${tableName}" SET "${layoutCol}" = $1::text::"${enumName}" WHERE "${layoutCol}"::text = ANY($2::text[])`,
            [mapping.toLayout, fromValues]
          )
        } else {
          result = await db.query(
            `UPDATE "${tableName}" SET "${layoutCol}" = $1 WHERE "${layoutCol}" = ANY($2::text[])`,
            [mapping.toLayout, fromValues]
          )
        }
        totalUpdated += result.rowCount || 0

        // Apply extra props if any
        for (const [col, val] of Object.entries(mapping.extraProps)) {
          const colCheck = await db.query(
            `SELECT data_type, udt_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2 LIMIT 1`,
            [tableName, col]
          )
          if (colCheck.rows.length === 0) continue

          const colIsEnum = colCheck.rows[0]?.data_type === 'USER-DEFINED'
          const colEnumName = colCheck.rows[0]?.udt_name

          if (colIsEnum && typeof val === 'string') {
            await db.query(
              `UPDATE "${tableName}" SET "${col}" = $1::text::"${colEnumName}" WHERE "${layoutCol}"::text = $2`,
              [val, mapping.toLayout]
            )
          } else {
            await db.query(
              `UPDATE "${tableName}" SET "${col}" = $1 WHERE "${layoutCol}"::text = $2`,
              [typeof val === 'boolean' ? val : String(val), mapping.toLayout]
            )
          }
        }
      } catch (e: any) {
        payload.logger.warn(`[Theme] Could not update ${tableName}.${layoutCol}: ${e.message}`)
      }
    }
  }

  payload.logger.info(`[Theme] Applied "${themeName}" theme to ${totalUpdated} block(s) across all collections`)
  return totalUpdated
}
