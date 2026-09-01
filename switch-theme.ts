/**
 * Switch theme preset via CLI.
 * Usage:
 *   npx tsx switch-theme.ts ducc      # Switch to DUCC theme
 *   npx tsx switch-theme.ts learner   # Switch to Learner theme
 *
 * This updates:
 * 1. Site Settings (colors, fonts, preset name)
 * 2. All block layouts in the database (hero, featureCards, news, etc.)
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config'
import { themePresets } from './src/lib/themePresets'
import { applyThemeToBlocks } from './src/lib/applyThemeToBlocks'

async function switchTheme() {
  const themeName = process.argv[2] || 'ducc'

  if (!themePresets[themeName]) {
    console.error(`❌ Unknown theme: "${themeName}". Available: ${Object.keys(themePresets).join(', ')}`)
    process.exit(1)
  }

  const preset = themePresets[themeName]
  console.log(`Switching to "${themeName}" theme...`)

  const payload = await getPayload({ config })

  // 1. Update Site Settings
  await payload.updateGlobal({
    slug: 'site-settings' as any,
    data: {
      themePreset: themeName,
      headingFont: preset.fonts.heading,
      bodyFont: preset.fonts.body,
      themeColors: {
        primaryColor: preset.colors.primary,
        secondaryColor: preset.colors.secondary,
        accentColor: preset.colors.accent,
        backgroundColor: preset.colors.background,
        surfaceColor: preset.colors.surface,
        mutedBackgroundColor: preset.colors.muted,
        textColor: preset.colors.text,
      },
    } as any,
  })

  console.log(`✅ Site Settings updated`)

  // 2. Apply theme to all block layouts in the database
  const updated = await applyThemeToBlocks(payload, themeName)

  console.log(`✅ Theme switched to "${themeName}"`)
  console.log(`   ${updated} block(s) updated`)
  console.log(`   Primary: ${preset.colors.primary}`)
  console.log(`   Secondary: ${preset.colors.secondary}`)
  console.log(`   Accent: ${preset.colors.accent}`)
  console.log(`   Heading font: ${preset.fonts.heading}`)
  console.log(`   Body font: ${preset.fonts.body}`)
  console.log(`   Layouts:`)
  console.log(`     Hero: ${preset.layouts.hero}`)
  console.log(`     Feature Cards: ${preset.layouts.featureCards} (${preset.layouts.featureCardsTheme})`)
  console.log(`     News: ${preset.layouts.news}`)

  process.exit(0)
}

switchTheme().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
