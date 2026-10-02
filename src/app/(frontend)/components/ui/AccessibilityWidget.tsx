'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  X,
  Search,
  Eye,
  Keyboard,
  AudioLines,
  Brain,
  Hand,
  RotateCcw,
  FileText,
  EyeOff,
  Type,
  Link as LinkIcon,
  ZoomIn,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Moon,
  Sun,
  Contrast,
  Droplets,
  Palette,
  ImageOff,
  VolumeX,
  Focus,
  MousePointer2,
  Ban,
  Heading,
  ScanLine,
  ScanFace,
  Pointer,
  Rows3,
  ArrowRight,
} from 'lucide-react'
import {
  ACCESSIBILITY_PANEL_ID,
  accessibilityPanel,
  useAccessibilityPanelOpen,
} from './accessibilityPanelStore'

/* ─────────────────────────── State ─────────────────────────── */

type AlignMode = 'default' | 'left' | 'center' | 'right'

type ProfileKey =
  | 'seizureSafe'
  | 'visionImpaired'
  | 'adhdFriendly'
  | 'cognitiveDisability'
  | 'keyboardNavigation'
  | 'screenReader'
  | 'olderAdults'

type ToggleKey =
  | 'readableFont'
  | 'highlightTitles'
  | 'highlightLinks'
  | 'textMagnifier'
  | 'darkContrast'
  | 'lightContrast'
  | 'highContrast'
  | 'highSaturation'
  | 'lowSaturation'
  | 'monochrome'
  | 'muteSounds'
  | 'hideImages'
  | 'readMode'
  | 'readingGuide'
  | 'stopAnimations'
  | 'readingMask'
  | 'highlightHover'
  | 'highlightFocus'
  | 'bigBlackCursor'
  | 'bigWhiteCursor'

type RangeKey = 'contentScale' | 'fontSize' | 'lineHeight' | 'letterSpacing'

interface AccessibilityState {
  profiles: Record<ProfileKey, boolean>
  toggles: Record<ToggleKey, boolean>
  contentScale: number
  fontSize: number
  lineHeight: number
  letterSpacing: number
  align: AlignMode
  textColor: string | null
  titleColor: string | null
  backgroundColor: string | null
}

const STORAGE_KEY = 'cms-accessibility-settings'

const defaultState: AccessibilityState = {
  profiles: {
    seizureSafe: false,
    visionImpaired: false,
    adhdFriendly: false,
    cognitiveDisability: false,
    keyboardNavigation: false,
    screenReader: false,
    olderAdults: false,
  },
  toggles: {
    readableFont: false,
    highlightTitles: false,
    highlightLinks: false,
    textMagnifier: false,
    darkContrast: false,
    lightContrast: false,
    highContrast: false,
    highSaturation: false,
    lowSaturation: false,
    monochrome: false,
    muteSounds: false,
    hideImages: false,
    readMode: false,
    readingGuide: false,
    stopAnimations: false,
    readingMask: false,
    highlightHover: false,
    highlightFocus: false,
    bigBlackCursor: false,
    bigWhiteCursor: false,
  },
  contentScale: 0,
  fontSize: 0,
  lineHeight: 0,
  letterSpacing: 0,
  align: 'default',
  textColor: null,
  titleColor: null,
  backgroundColor: null,
}

const RANGE = { min: -2, max: 3 }
const colorOptions = ['#0076B4', '#7A549C', '#C83733', '#D07021', '#26999F', '#4D7831', '#FFFFFF', '#000000']
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/**
 * What the page should actually look like: the individual settings plus
 * whatever the active profiles switch on. Profiles are presets, so turning one
 * off restores the visitor's own choices instead of wiping them.
 */
function resolve(s: AccessibilityState) {
  const t = { ...s.toggles }
  let fontSize = s.fontSize
  let lineHeight = s.lineHeight
  const p = s.profiles

  if (p.seizureSafe) {
    t.stopAnimations = true
    t.lowSaturation = true
    t.highSaturation = false
  }
  if (p.visionImpaired) {
    t.readableFont = true
    t.highlightLinks = true
    t.highContrast = true
    fontSize = Math.max(fontSize, 1)
  }
  if (p.adhdFriendly) {
    t.stopAnimations = true
    t.readingMask = true
  }
  if (p.cognitiveDisability) {
    t.readableFont = true
    t.highlightTitles = true
    t.highlightLinks = true
    t.readingGuide = true
  }
  if (p.keyboardNavigation) t.highlightFocus = true
  if (p.screenReader) {
    // Moving and self-playing content talks over a screen reader.
    t.stopAnimations = true
    t.muteSounds = true
  }
  if (p.olderAdults) {
    t.highlightLinks = true
    if (!t.bigWhiteCursor) t.bigBlackCursor = true
    fontSize = Math.max(fontSize, 1)
    lineHeight = Math.max(lineHeight, 1)
  }
  if (t.readMode) {
    t.readableFont = true
    t.stopAnimations = true
  }
  return { t, fontSize, lineHeight }
}

/** Text-bearing elements the magnifier reads from. */
const MAGNIFY_SELECTOR = 'p, a, li, h1, h2, h3, h4, h5, h6, button, label, td, th, dt, dd, blockquote, figcaption, span'

/* ─────────────────────────── Panel ─────────────────────────── */

export default function AccessibilityWidget({ statementUrl }: { statementUrl?: string }) {
  const open = useAccessibilityPanelOpen()
  const [state, setState] = useState<AccessibilityState>(defaultState)
  const [loaded, setLoaded] = useState(false)
  const [query, setQuery] = useState('')
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)
  const [magnified, setMagnified] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Restore saved settings so they follow the visitor from page to page.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AccessibilityState>
        setState({
          ...defaultState,
          ...parsed,
          profiles: { ...defaultState.profiles, ...(parsed.profiles || {}) },
          toggles: { ...defaultState.toggles, ...(parsed.toggles || {}) },
        })
      }
    } catch {
      // Corrupt or blocked storage: start from defaults.
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage unavailable (private mode): settings last for this page only.
    }
  }, [state, loaded])

  const { t, fontSize, lineHeight } = useMemo(() => resolve(state), [state])

  /* Apply everything to <html>; the CSS for each class lives in styles.css. */
  useEffect(() => {
    const root = document.documentElement
    const set = (cls: string, on: boolean) => root.classList.toggle(cls, on)

    root.style.setProperty('--a11y-font-scale', String(1 + fontSize * 0.1))
    root.style.setProperty('--a11y-zoom', String(1 + state.contentScale * 0.1))
    root.style.setProperty('--a11y-line-height', String(1.5 + lineHeight * 0.25))
    root.style.setProperty('--a11y-letter-spacing', `${state.letterSpacing * 0.03}em`)
    set('a11y-zoom', state.contentScale !== 0)
    set('a11y-line-height', lineHeight !== 0)
    set('a11y-letter-spacing', state.letterSpacing !== 0)

    set('a11y-readable-font', t.readableFont)
    set('a11y-highlight-titles', t.highlightTitles)
    set('a11y-highlight-links', t.highlightLinks)
    set('a11y-hide-images', t.hideImages)
    set('a11y-stop-animations', t.stopAnimations)
    set('a11y-read-mode', t.readMode)
    set('a11y-highlight-hover', t.highlightHover)
    set('a11y-highlight-focus', t.highlightFocus)
    set('a11y-big-black-cursor', t.bigBlackCursor)
    set('a11y-big-white-cursor', t.bigWhiteCursor)
    set('a11y-dark-contrast', t.darkContrast)
    set('a11y-light-contrast', t.lightContrast)

    root.classList.remove('a11y-align-left', 'a11y-align-center', 'a11y-align-right')
    if (state.align !== 'default') root.classList.add(`a11y-align-${state.align}`)

    // Filters compose into one value; separate classes would overwrite each other.
    const filters = [
      t.highContrast && 'contrast(1.5)',
      t.lowSaturation ? 'saturate(0.5)' : t.highSaturation && 'saturate(1.6)',
      t.monochrome && 'grayscale(1)',
    ].filter(Boolean)
    root.style.filter = filters.join(' ')

    const colour = (cls: string, prop: string, value: string | null) => {
      set(cls, Boolean(value))
      if (value) root.style.setProperty(prop, value)
      else root.style.removeProperty(prop)
    }
    colour('a11y-custom-text-color', '--a11y-text-color', state.textColor)
    colour('a11y-custom-title-color', '--a11y-title-color', state.titleColor)
    colour('a11y-custom-bg-color', '--a11y-bg-color', state.backgroundColor)
  }, [t, fontSize, lineHeight, state.contentScale, state.letterSpacing, state.align, state.textColor, state.titleColor, state.backgroundColor])

  /* Mute: everything already on the page, and anything that starts later. */
  useEffect(() => {
    if (!t.muteSounds) return
    const mute = (el: Element) => {
      if (el instanceof HTMLMediaElement) el.muted = true
    }
    document.querySelectorAll('video, audio').forEach(mute)
    const onPlay = (e: Event) => e.target && mute(e.target as Element)
    document.addEventListener('play', onPlay, true)
    return () => document.removeEventListener('play', onPlay, true)
  }, [t.muteSounds])

  /* Reading guide, reading mask and magnifier follow the pointer. */
  const followPointer = t.readingGuide || t.readingMask || t.textMagnifier
  useEffect(() => {
    if (!followPointer) {
      setPointer(null)
      setMagnified(null)
      return
    }
    const onMove = (e: PointerEvent) => {
      setPointer({ x: e.clientX, y: e.clientY })
      if (!t.textMagnifier) return
      const target = e.target as Element | null
      const el = target?.closest(MAGNIFY_SELECTOR)
      const text = el && !el.closest(`#${ACCESSIBILITY_PANEL_ID}`) ? el.textContent?.replace(/\s+/g, ' ').trim() : ''
      setMagnified(text ? (text.length > 180 ? `${text.slice(0, 180)}…` : text) : null)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [followPointer, t.textMagnifier])

  /* Dialog behaviour: focus in on open, Tab stays inside, Escape closes. */
  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        accessibilityPanel.close()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const items = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>('button, a[href], input, select, [tabindex]:not([tabindex="-1"])'),
      ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node
      if (panelRef.current?.contains(target)) return
      // The header button toggles the panel itself.
      if ((target as Element).closest?.(`[aria-controls="${ACCESSIBILITY_PANEL_ID}"]`)) return
      accessibilityPanel.close()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  const setProfile = (key: ProfileKey, value: boolean) =>
    setState((s) => ({ ...s, profiles: { ...s.profiles, [key]: value } }))
  const setToggle = (key: ToggleKey, value: boolean) =>
    setState((s) => ({ ...s, toggles: { ...s.toggles, [key]: value } }))
  /** Toggles that cannot be on together (contrast modes, cursors). */
  const setExclusive = (key: ToggleKey, value: boolean, group: ToggleKey[]) =>
    setState((s) => {
      const toggles = { ...s.toggles }
      group.forEach((k) => (toggles[k] = false))
      toggles[key] = value
      return { ...s, toggles }
    })
  const step = (key: RangeKey, delta: number) =>
    setState((s) => ({ ...s, [key]: clamp(s[key] + delta, RANGE.min, RANGE.max) }))
  const setAlign = (align: AlignMode, on: boolean) => setState((s) => ({ ...s, align: on ? align : 'default' }))

  const jumpTo = useCallback((selector: string) => {
    const target = document.querySelector<HTMLElement>(selector)
    if (!target) return
    accessibilityPanel.close()
    requestAnimationFrame(() => {
      target.scrollIntoView({ block: 'start' })
      if (!target.hasAttribute('tabindex') && !target.matches('a, button, input, select, textarea')) {
        target.setAttribute('tabindex', '-1')
      }
      target.focus({ preventScroll: true })
    })
  }, [])

  const contrastGroup: ToggleKey[] = ['darkContrast', 'lightContrast']
  const saturationGroup: ToggleKey[] = ['highSaturation', 'lowSaturation']
  const cursorGroup: ToggleKey[] = ['bigBlackCursor', 'bigWhiteCursor']

  const profiles: { key: ProfileKey; name: string; text: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { key: 'seizureSafe', name: 'Seizure Safe Profile', text: 'Clear flashes & reduces color', icon: Ban },
    { key: 'visionImpaired', name: 'Vision Impaired Profile', text: "Enhances website's visuals", icon: Eye },
    { key: 'adhdFriendly', name: 'ADHD Friendly Profile', text: 'More focus & fewer distractions', icon: Brain },
    { key: 'cognitiveDisability', name: 'Cognitive Disability Profile', text: 'Assists with reading & focusing', icon: ScanFace },
    { key: 'keyboardNavigation', name: 'Keyboard Navigation (Motor)', text: 'Use website with the keyboard', icon: Keyboard },
    { key: 'screenReader', name: 'Blind Users (Screen Reader)', text: 'Optimize website for screen-readers', icon: AudioLines },
    { key: 'olderAdults', name: 'Older Adults', text: 'Enhance visibility and reading comfort', icon: Hand },
  ]

  type Item = { label: string; wide?: boolean; node: React.ReactNode }
  const switchItem = (label: string, icon: React.ReactNode, value: boolean, onChange: (v: boolean) => void): Item => ({
    label,
    node: <SwitchCard title={label} icon={icon} value={value} onChange={onChange} />,
  })
  const rangeItem = (label: string, key: RangeKey): Item => ({
    label,
    wide: true,
    node: <RangeCard title={label} value={state[key]} onDec={() => step(key, -1)} onInc={() => step(key, 1)} />,
  })
  const colorItem = (label: string, value: string | null, onPick: (c: string | null) => void): Item => ({
    label,
    wide: true,
    node: <ColorCard title={label} value={value} onPick={onPick} />,
  })

  const sections: { title: string; items: Item[] }[] = [
    {
      title: 'Content Adjustments',
      items: [
        rangeItem('Content Scaling', 'contentScale'),
        switchItem('Readable Font', <Type size={20} />, state.toggles.readableFont, (v) => setToggle('readableFont', v)),
        switchItem('Highlight Titles', <Heading size={20} />, state.toggles.highlightTitles, (v) => setToggle('highlightTitles', v)),
        switchItem('Highlight Links', <LinkIcon size={20} />, state.toggles.highlightLinks, (v) => setToggle('highlightLinks', v)),
        switchItem('Text Magnifier', <ZoomIn size={20} />, state.toggles.textMagnifier, (v) => setToggle('textMagnifier', v)),
        rangeItem('Adjust Font Sizing', 'fontSize'),
        switchItem('Align Center', <AlignCenter size={20} />, state.align === 'center', (v) => setAlign('center', v)),
        switchItem('Align Left', <AlignLeft size={20} />, state.align === 'left', (v) => setAlign('left', v)),
        rangeItem('Adjust Line Height', 'lineHeight'),
        switchItem('Align Right', <AlignRight size={20} />, state.align === 'right', (v) => setAlign('right', v)),
        switchItem('Read Mode', <FileText size={20} />, state.toggles.readMode, (v) => setToggle('readMode', v)),
        rangeItem('Adjust Letter Spacing', 'letterSpacing'),
      ],
    },
    {
      title: 'Color Adjustments',
      items: [
        switchItem('Dark Contrast', <Moon size={20} />, state.toggles.darkContrast, (v) => setExclusive('darkContrast', v, contrastGroup)),
        switchItem('Light Contrast', <Sun size={20} />, state.toggles.lightContrast, (v) => setExclusive('lightContrast', v, contrastGroup)),
        switchItem('High Contrast', <Contrast size={20} />, state.toggles.highContrast, (v) => setToggle('highContrast', v)),
        switchItem('Monochrome', <Palette size={20} />, state.toggles.monochrome, (v) => setToggle('monochrome', v)),
        switchItem('High Saturation', <Droplets size={20} />, state.toggles.highSaturation, (v) => setExclusive('highSaturation', v, saturationGroup)),
        switchItem('Low Saturation', <Droplets size={20} />, state.toggles.lowSaturation, (v) => setExclusive('lowSaturation', v, saturationGroup)),
        colorItem('Adjust Text Colors', state.textColor, (c) => setState((s) => ({ ...s, textColor: c }))),
        colorItem('Adjust Title Colors', state.titleColor, (c) => setState((s) => ({ ...s, titleColor: c }))),
        colorItem('Adjust Background Colors', state.backgroundColor, (c) => setState((s) => ({ ...s, backgroundColor: c }))),
      ],
    },
    {
      title: 'Orientation Adjustments',
      items: [
        switchItem('Mute Sounds', <VolumeX size={20} />, state.toggles.muteSounds, (v) => setToggle('muteSounds', v)),
        switchItem('Hide Images', <ImageOff size={20} />, state.toggles.hideImages, (v) => setToggle('hideImages', v)),
        switchItem('Stop Animations', <Ban size={20} />, state.toggles.stopAnimations, (v) => setToggle('stopAnimations', v)),
        switchItem('Reading Guide', <Rows3 size={20} />, state.toggles.readingGuide, (v) => setToggle('readingGuide', v)),
        switchItem('Reading Mask', <ScanLine size={20} />, state.toggles.readingMask, (v) => setToggle('readingMask', v)),
        switchItem('Highlight Hover', <Pointer size={20} />, state.toggles.highlightHover, (v) => setToggle('highlightHover', v)),
        switchItem('Highlight Focus', <Focus size={20} />, state.toggles.highlightFocus, (v) => setToggle('highlightFocus', v)),
        switchItem('Big Black Cursor', <MousePointer2 size={20} />, state.toggles.bigBlackCursor, (v) => setExclusive('bigBlackCursor', v, cursorGroup)),
        switchItem('Big White Cursor', <MousePointer2 size={20} />, state.toggles.bigWhiteCursor, (v) => setExclusive('bigWhiteCursor', v, cursorGroup)),
        {
          label: 'Useful Links',
          wide: true,
          node: (
            <UsefulLinks
              onJump={jumpTo}
              options={[
                { value: '#main', label: 'Skip to Main Content' },
                { value: 'header', label: 'Go to Header' },
                { value: 'footer', label: 'Go to Footer' },
                { value: 'a[href*="contact"]', label: 'Go to Contact Link' },
              ]}
            />
          ),
        },
      ],
    },
  ]

  const shownProfiles = profiles
  const shownSections = sections

  return (
    <>
      {/* Pointer aids: rendered whether or not the panel is open */}
      {t.readingGuide && pointer && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 z-[140] h-1.5 rounded-full bg-primary-blue/80 shadow-[0_0_0_3px_rgba(255,255,255,0.7)]"
          style={{ top: pointer.y + 14 }}
        />
      )}
      {t.readingMask && pointer && (
        <>
          <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[140] bg-black/60" style={{ height: Math.max(0, pointer.y - 60) }} />
          <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-[140] bg-black/60" style={{ top: pointer.y + 60 }} />
        </>
      )}
      {t.textMagnifier && pointer && magnified && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[145] max-w-md rounded-lg bg-ink px-4 py-3 text-2xl leading-snug text-white shadow-2xl"
          style={{ left: Math.min(pointer.x + 16, window.innerWidth - 460), top: pointer.y + 22 }}
        >
          {magnified}
        </div>
      )}

      {open && (
        <div
          ref={panelRef}
          id={ACCESSIBILITY_PANEL_ID}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${ACCESSIBILITY_PANEL_ID}-title`}
          className="a11y-panel fixed inset-y-0 right-0 z-[150] flex w-full max-w-[380px] flex-col bg-[var(--cms-bg,#f1f5f7)] text-sm shadow-[0_0_40px_rgba(1,30,44,0.22)]"
        >
          {/* Header bar, in the site's primary colour */}
          <div className="flex shrink-0 items-center gap-3 bg-primary-blue px-4 py-3 text-white">
            <button
              ref={closeRef}
              type="button"
              onClick={() => accessibilityPanel.close()}
              aria-label="Close accessibility adjustments"
              title="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25 focus-visible:outline-white"
            >
              <X size={16} />
            </button>
            <h2 id={`${ACCESSIBILITY_PANEL_ID}-title`} className="ducc-heading flex-1 text-center text-base font-bold">
              Accessibility Adjustments
            </h2>
            <span aria-hidden className="w-8 shrink-0" />
          </div>

          <div className="a11y-panel-scroll flex-1 overflow-y-auto px-4 pb-6 pt-4">
            <div className="grid grid-cols-2 gap-2">
              <PanelButton onClick={() => setState(defaultState)} icon={<RotateCcw size={14} />}>
                Reset Settings
              </PanelButton>
              <PanelButton onClick={() => accessibilityPanel.close()} icon={<EyeOff size={14} />}>
                Hide Interface
              </PanelButton>
            </div>

            {/* Looks a word up in a dictionary (opens in a new tab). */}
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault()
                const term = query.trim()
                if (term) window.open(`https://en.wiktionary.org/wiki/${encodeURIComponent(term)}`, '_blank', 'noopener,noreferrer')
              }}
              className="mt-3 flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 focus-within:border-primary-blue"
            >
              <Search size={16} className="shrink-0 text-slate-400" />
              <label htmlFor={`${ACCESSIBILITY_PANEL_ID}-dictionary`} className="sr-only">
                Search in dictionary
              </label>
              <input
                id={`${ACCESSIBILITY_PANEL_ID}-dictionary`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Unclear content? Search in dictionary..."
                className="w-full bg-transparent text-sm text-ink placeholder:text-slate-400"
              />
            </form>

            {shownProfiles.length > 0 && (
              <section className="mt-5">
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                  Choose the right accessibility profile for you
                </h3>
                <ul className="m-0 list-none space-y-1.5 p-0">
                  {shownProfiles.map((p) => {
                    const Icon = p.icon
                    return (
                      <li
                        key={p.key}
                        className={`flex items-center gap-2.5 rounded-lg border bg-white px-3 py-2 transition-colors ${
                          state.profiles[p.key] ? 'border-primary-blue' : 'border-slate-200'
                        }`}
                      >
                        <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-blue/10 text-primary-blue">
                          <Icon size={16} />
                        </span>
                        <span className="min-w-0 flex-1 leading-tight">
                          <span className="block text-[13px] font-semibold text-ink">{p.name}</span>
                          <span className="mt-0.5 block text-xs text-slate-500">{p.text}</span>
                        </span>
                        <OffOn label={p.name} value={state.profiles[p.key]} onChange={(v) => setProfile(p.key, v)} />
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}

            {shownSections.map((s) => (
              <section key={s.title} className="mt-5">
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">{s.title}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {s.items.map((i) => (
                    <div key={i.label} className={i.wide ? 'col-span-2' : undefined}>
                      {i.node}
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {statementUrl && (
              <a
                href={statementUrl}
                onClick={() => accessibilityPanel.close()}
                className="mt-6 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-primary-blue hover:underline"
              >
                Accessibility statement
                <ArrowRight size={14} />
              </a>
            )}
          </div>
        </div>
      )}
    </>
  )
}

/* ─────────────────────────── Parts ─────────────────────────── */

function PanelButton({ onClick, icon, children }: { onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-primary-blue transition-colors hover:border-primary-blue/40 hover:bg-primary-blue/10"
    >
      {icon}
      {children}
    </button>
  )
}

/** OFF / ON pill. Two real buttons with aria-pressed, grouped under the setting's name. */
function OffOn({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const btn = (on: boolean, text: string) => (
    <button
      type="button"
      aria-pressed={value === on}
      onClick={() => onChange(on)}
      className={`min-w-[36px] rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide transition-colors ${
        value === on ? 'bg-primary-blue text-white shadow-sm' : 'text-slate-500 hover:text-ink'
      }`}
    >
      {text}
    </button>
  )
  return (
    <span role="group" aria-label={label} className="inline-flex shrink-0 rounded-full bg-[var(--cms-muted-bg,#e6edf0)] p-0.5">
      {btn(false, 'OFF')}
      {btn(true, 'ON')}
    </span>
  )
}

function SwitchCard({
  title,
  icon,
  value,
  onChange,
}: {
  title: string
  icon: React.ReactNode
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div
      className={`flex h-full flex-col items-center gap-1.5 rounded-lg border bg-white px-2 py-3 text-center transition-colors ${
        value ? 'border-primary-blue bg-primary-blue/5' : 'border-slate-200'
      }`}
    >
      <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-blue/10 text-primary-blue [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>
      <span className="text-[13px] font-semibold leading-tight text-ink">{title}</span>
      <OffOn label={title} value={value} onChange={onChange} />
    </div>
  )
}

function RangeCard({ title, value, onDec, onInc }: { title: string; value: number; onDec: () => void; onInc: () => void }) {
  const label = value === 0 ? 'Default' : `${value > 0 ? '+' : ''}${value * 10}%`
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border bg-white px-3 py-2 ${
        value !== 0 ? 'border-primary-blue bg-primary-blue/5' : 'border-slate-200'
      }`}
    >
      <p className="m-0 flex-1 text-[13px] font-semibold text-ink">{title}</p>
      <div className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--cms-muted-bg,#e6edf0)] p-0.5">
        <button
          type="button"
          onClick={onDec}
          disabled={value <= RANGE.min}
          aria-label={`Decrease ${title.toLowerCase()}`}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-blue text-base font-bold text-white disabled:opacity-40"
        >
          −
        </button>
        <span className="w-14 text-center text-xs font-semibold text-primary-blue" aria-live="polite">
          {label}
        </span>
        <button
          type="button"
          onClick={onInc}
          disabled={value >= RANGE.max}
          aria-label={`Increase ${title.toLowerCase()}`}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-blue text-base font-bold text-white disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  )
}

function ColorCard({ title, value, onPick }: { title: string; value: string | null; onPick: (c: string | null) => void }) {
  return (
    <div className={`rounded-lg border bg-white px-3 py-2.5 ${value ? 'border-primary-blue bg-primary-blue/5' : 'border-slate-200'}`}>
      <p className="m-0 text-[13px] font-semibold text-ink">{title}</p>
      <div role="group" aria-label={title} className="mt-2 flex flex-wrap items-center gap-1.5">
        {colorOptions.map((color) => (
          <button
            key={color}
            type="button"
            aria-pressed={value === color}
            aria-label={color}
            onClick={() => onPick(color)}
            className={`h-6 w-6 rounded-full border-2 ${value === color ? 'border-primary-blue ring-2 ring-primary-blue/25' : 'border-slate-200'}`}
            style={{ backgroundColor: color }}
          />
        ))}
        <button type="button" onClick={() => onPick(null)} className="ml-auto text-xs font-semibold text-slate-500 underline">
          Cancel
        </button>
      </div>
    </div>
  )
}

function UsefulLinks({ options, onJump }: { options: { value: string; label: string }[]; onJump: (selector: string) => void }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
      <label className="block text-[13px] font-semibold text-ink">
        Useful Links
        <select
          value=""
          onChange={(e) => e.target.value && onJump(e.target.value)}
          className="mt-2 block w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] font-normal text-ink"
        >
          <option value="">Select an option</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
