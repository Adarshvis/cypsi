# One-Click Theme System — Technical Documentation

## Overview

The DUCC CMS supports **one-click theme switching** between two visual themes — **DUCC (Purple & Gold)** and **Learner (Teal & Dark)** — from a single dropdown in Site Settings. Changing the theme updates colors, fonts, header layout, and all block layouts across the entire site instantly.

The key design principle: **what you see in admin is what renders on the frontend**. There are no hidden runtime overrides. When the theme changes, the actual block data in the database is updated so admin and frontend always match.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Panel                          │
│  Site Settings → Theme Preset dropdown                  │
│  [DUCC (Purple & Gold)] or [Learner (Teal & Dark)]     │
└──────────────────────┬──────────────────────────────────┘
                       │ Save
                       ▼
┌─────────────────────────────────────────────────────────┐
│              beforeChange Hook                          │
│  Auto-fills: colors, heading font, body font            │
│  from themePresets.ts definitions                        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              afterChange Hook                           │
│  Calls applyThemeToBlocks() which runs SQL UPDATEs      │
│  on all block tables to switch layout variants           │
│  (e.g. hero: duccFullscreen → split)                    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   Database                              │
│  site_settings: colors, fonts, theme_preset updated     │
│  pages_blocks_hero: layout column updated               │
│  pages_blocks_feature_cards: card_layout updated        │
│  pages_blocks_news_updates: layout updated              │
│  ... (all collections × all block types)                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   Frontend                              │
│  layout.tsx reads colors/fonts → CSS variables           │
│  Header reads data-theme → switches layout              │
│  BlockRenderer renders blocks as-is (no overrides)      │
│  All components use var(--cms-primary) etc.              │
└─────────────────────────────────────────────────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/themePresets.ts` | Defines both themes — colors, fonts, header config, and block layout mappings |
| `src/lib/applyThemeToBlocks.ts` | SQL-based function that updates all block layouts in the database when theme changes |
| `src/globals/SiteSettings.ts` | Theme preset dropdown + beforeChange (auto-fill colors/fonts) + afterChange (apply to blocks) |
| `src/app/(frontend)/layout.tsx` | Reads theme settings, sets CSS variables on `<body>`, loads all Google Fonts |
| `src/app/(frontend)/components/Header.tsx` | Reads `data-theme` attribute, renders DUCC or Learner header layout |
| `src/app/(frontend)/styles.css` | Body font uses `var(--font-body)`, heading uses `var(--font-heading)` |
| `switch-theme.ts` | CLI script for switching themes: `npx tsx switch-theme.ts learner` |

---

## How It Works Step by Step

### 1. Theme Preset Definitions (`themePresets.ts`)

Each theme defines:

```typescript
{
  colors: { primary, secondary, accent, background, surface, muted, text },
  fonts: { heading: 'Raleway', body: 'Roboto' },
  header: { layout: 'learner', showTopBar: false, height: 70, ctaStyle: 'pill' },
  layouts: {
    hero: 'split',              // vs 'duccFullscreen'
    featureCards: 'classic',     // vs 'duccService'
    featureCardsTheme: 'light',  // vs 'dark'
    featureCardsShowButton: true,
    news: 'spotlight',           // vs 'duccCards'
    statistics: 'duccStrip',
    testimonials: 'duccQuote',
    callToAction: 'duccBanner',
    faq: 'duccAccordion',
  }
}
```

### 2. When Admin Changes Theme Preset

**beforeChange hook** (synchronous):
- Reads the new preset from `themePresets.ts`
- Auto-fills all 7 color fields in `themeColors` group
- Auto-fills `headingFont` and `bodyFont` select fields
- Admin sees the new values immediately after save

**afterChange hook** (async, non-blocking):
- Calls `applyThemeToBlocks(payload, 'learner')`
- This function iterates over all block types × all parent collections
- For each block table, it runs a SQL UPDATE to change the layout column

### 3. Database Updates (`applyThemeToBlocks.ts`)

The function handles PostgreSQL enum types properly:

```sql
-- Example: switch hero blocks from duccFullscreen to split
UPDATE "pages_blocks_hero"
SET "layout" = 'split'::text::"enum_pages_blocks_hero_layout"
WHERE "layout"::text = ANY(ARRAY['duccFullscreen', 'split'])
```

It also updates related columns:
- `card_theme` → 'light' or 'dark'
- `show_card_button` → true or false
- `split_theme` → 'light' for learner hero
- `split_direction` → 'textLeft' for learner hero

Tables updated across 5 parent collections (pages, news, projects, software, trainings):
- `*_blocks_hero` — layout column
- `*_blocks_feature_cards` — card_layout, card_theme, show_card_button
- `*_blocks_news_updates` — layout column
- `*_blocks_statistics` — layout column
- `*_blocks_testimonials` — layout column
- `*_blocks_call_to_action` — layout column
- `*_blocks_faq` — layout column

### 4. CSS Variables (`layout.tsx`)

The root layout reads Site Settings and sets CSS custom properties on `<body>`:

```tsx
const themeStyle = {
  '--cms-primary': primaryColor,      // #4B2E83 or #04415f
  '--cms-secondary': secondaryColor,  // #1A103D or #011e2c
  '--cms-accent': accentColor,        // #EAB308 or #2086b8
  '--cms-bg': backgroundColor,
  '--cms-surface': surfaceColor,
  '--cms-muted-bg': mutedBackgroundColor,
  '--cms-text': textColor,
  '--font-heading': headingFontStack, // var(--font-playfair) or var(--font-raleway)
  '--font-body': bodyFontStack,       // var(--font-inter) or var(--font-roboto)
}
```

All components use these variables instead of hardcoded colors:
```css
background: var(--cms-primary, #4B2E83);
color: var(--cms-secondary, #1A103D);
```

### 5. Font Loading

All 9 Google Fonts are pre-loaded via `next/font/google` for optimal performance:
- Inter, Playfair Display, Raleway, Roboto, Montserrat, Poppins, Open Sans, Lato, JetBrains Mono

Each font gets a CSS variable (e.g., `--font-raleway`). The `--font-heading` and `--font-body` variables reference the correct font variable based on admin selection.

### 6. Header Theme Switching

The Header component reads `data-theme` from `<body>` via a MutationObserver:

- **DUCC theme**: Centered logo with title/subtitle, nav below logo, top bar visible, square CTA button, 100px height
- **Learner theme**: Logo left, nav center, CTA right (single row), no top bar, pill CTA button, 70px height, subtle bottom border

### 7. No Runtime Overrides

The `BlockRenderer` component is simple — it just renders whatever block data is in the database:

```tsx
export default function BlockRenderer({ blocks }) {
  return blocks.map((block) => {
    const Component = blockComponents[block.blockType]
    return <Component key={block.id} {...rest} />
  })
}
```

No theme-aware logic, no layout remapping. What's saved is what renders.

---

## Theme Comparison

| Element | DUCC (Purple & Gold) | Learner (Teal & Dark) |
|---------|---------------------|----------------------|
| **Primary** | `#4B2E83` (Purple) | `#04415f` (Dark Teal) |
| **Secondary** | `#1A103D` (Deep Purple) | `#011e2c` (Navy) |
| **Accent** | `#EAB308` (Gold) | `#2086b8` (Blue) |
| **Background** | `#FFFFFF` | `#f1f5f7` |
| **Muted** | `#F8F4FF` (Lavender) | `#e6edf0` (Light Gray) |
| **Heading Font** | Playfair Display (Serif) | Raleway (Sans) |
| **Body Font** | Inter | Roboto |
| **Hero** | duccFullscreen (dark overlay, floating card) | split (50/50, light bg) |
| **Feature Cards** | duccService (dark icons, no buttons) | classic (light, with buttons) |
| **News** | duccCards (3-column grid) | spotlight (featured + sidebar) |
| **Header** | Centered, top bar, 100px | Single row, no top bar, 70px |
| **CTA Button** | Square corners | Pill shape |

---

## CLI Usage

```bash
# Switch to Learner theme
npx tsx switch-theme.ts learner

# Switch back to DUCC theme
npx tsx switch-theme.ts ducc
```

This updates Site Settings + all block layouts in one command.

---

## Adding a New Theme

1. Add the preset definition in `src/lib/themePresets.ts`
2. Add the option to the `themePreset` select field in `src/globals/SiteSettings.ts`
3. Add a header layout branch in `src/app/(frontend)/components/Header.tsx` if the new theme needs a different header
4. The `applyThemeToBlocks` function will automatically handle the layout mappings based on the preset's `layouts` object

---

## Production Deployment

When deploying theme changes to production:

1. Run the SQL migrations first:
```sql
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS theme_preset VARCHAR DEFAULT 'ducc';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS heading_font VARCHAR DEFAULT 'Playfair Display';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS body_font VARCHAR DEFAULT 'Inter';
```

2. Deploy the code
3. The theme switch will work from admin immediately — no additional migration needed since `applyThemeToBlocks` handles all block updates dynamically via SQL
