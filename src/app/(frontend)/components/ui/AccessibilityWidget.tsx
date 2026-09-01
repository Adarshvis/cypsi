'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Accessibility,
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
  Link,
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
} from 'lucide-react'

type AlignMode = 'default' | 'left' | 'center' | 'right'
type UsefulLink = 'acsbDefault' | 'skip-main' | 'header' | 'footer' | 'contact'

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

interface AccessibilityState {
  profiles: Record<ProfileKey, boolean>
  toggles: Record<ToggleKey, boolean>
  contentScale: number
  fontSize: number
  lineHeight: number
  letterSpacing: number
  align: AlignMode
  usefulLinks: UsefulLink
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
  usefulLinks: 'acsbDefault',
  textColor: null,
  titleColor: null,
  backgroundColor: null,
}

const colorOptions = ['#0076B4', '#7A549C', '#C83733', '#D07021', '#26999F', '#4D7831', '#FFFFFF', '#000000']

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [state, setState] = useState<AccessibilityState>(defaultState)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as AccessibilityState
      setState({
        ...defaultState,
        ...parsed,
        profiles: { ...defaultState.profiles, ...(parsed.profiles || {}) },
        toggles: { ...defaultState.toggles, ...(parsed.toggles || {}) },
      })
    } catch {
      // no-op
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    const root = document.documentElement
    const body = document.body

    const totalScale = 1 + state.contentScale * 0.1 + state.fontSize * 0.05
    root.style.setProperty('--a11y-font-scale', String(totalScale))
    root.style.setProperty('--a11y-line-height', String(1.6 + state.lineHeight * 0.15))
    root.style.setProperty('--a11y-letter-spacing', `${state.letterSpacing * 0.02}em`)

    root.classList.toggle('a11y-readable-font', state.toggles.readableFont)
    root.classList.toggle('a11y-highlight-titles', state.toggles.highlightTitles)
    root.classList.toggle('a11y-highlight-links', state.toggles.highlightLinks)
    root.classList.toggle('a11y-hide-images', state.toggles.hideImages)
    root.classList.toggle('a11y-stop-animations', state.toggles.stopAnimations || state.profiles.seizureSafe)
    root.classList.toggle('a11y-reading-guide', state.toggles.readingGuide)
    root.classList.toggle('a11y-reading-mask', state.toggles.readingMask)
    root.classList.toggle('a11y-highlight-hover', state.toggles.highlightHover)
    root.classList.toggle('a11y-highlight-focus', state.toggles.highlightFocus || state.profiles.keyboardNavigation)
    root.classList.toggle('a11y-big-black-cursor', state.toggles.bigBlackCursor)
    root.classList.toggle('a11y-big-white-cursor', state.toggles.bigWhiteCursor)

    root.classList.toggle('a11y-vision-impaired', state.profiles.visionImpaired)
    root.classList.toggle('a11y-adhd-friendly', state.profiles.adhdFriendly)
    root.classList.toggle('a11y-cognitive-disability', state.profiles.cognitiveDisability)
    root.classList.toggle('a11y-read-mode', state.toggles.readMode || state.profiles.screenReader)

    root.classList.remove('a11y-align-left', 'a11y-align-center', 'a11y-align-right')
    if (state.align === 'left') root.classList.add('a11y-align-left')
    if (state.align === 'center') root.classList.add('a11y-align-center')
    if (state.align === 'right') root.classList.add('a11y-align-right')

    root.classList.remove('a11y-dark-contrast', 'a11y-light-contrast', 'a11y-high-contrast')
    if (state.toggles.darkContrast) root.classList.add('a11y-dark-contrast')
    if (state.toggles.lightContrast) root.classList.add('a11y-light-contrast')
    if (state.toggles.highContrast) root.classList.add('a11y-high-contrast')

    root.classList.toggle('a11y-high-saturation', state.toggles.highSaturation)
    root.classList.toggle('a11y-low-saturation', state.toggles.lowSaturation)
    root.classList.toggle('a11y-monochrome', state.toggles.monochrome)
    root.classList.toggle('a11y-custom-text-color', Boolean(state.textColor))
    root.classList.toggle('a11y-custom-title-color', Boolean(state.titleColor))
    root.classList.toggle('a11y-custom-bg-color', Boolean(state.backgroundColor))

    if (state.textColor) root.style.setProperty('--a11y-text-color', state.textColor)
    else root.style.removeProperty('--a11y-text-color')

    if (state.titleColor) root.style.setProperty('--a11y-title-color', state.titleColor)
    else root.style.removeProperty('--a11y-title-color')

    if (state.backgroundColor) root.style.setProperty('--a11y-bg-color', state.backgroundColor)
    else root.style.removeProperty('--a11y-bg-color')

    if (state.toggles.muteSounds) {
      body.querySelectorAll('video, audio').forEach((node) => {
        const media = node as HTMLMediaElement
        media.muted = true
      })
    }
  }, [state])

  useEffect(() => {
    if (state.usefulLinks === 'acsbDefault') return

    const map: Record<Exclude<UsefulLink, 'acsbDefault'>, string> = {
      'skip-main': 'main',
      header: 'header',
      footer: 'footer',
      contact: '[href*="contact"]',
    }

    const selector = map[state.usefulLinks as Exclude<UsefulLink, 'acsbDefault'>]
    const target = document.querySelector(selector)
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      target.focus({ preventScroll: true })
    }
  }, [state.usefulLinks])

  const profileItems = useMemo(
    () => [
      { key: 'seizureSafe' as const, name: 'Seizure Safe Profile', text: 'Clear flashes & reduces color', icon: Ban },
      { key: 'visionImpaired' as const, name: 'Vision Impaired Profile', text: "Enhances website's visuals", icon: Eye },
      { key: 'adhdFriendly' as const, name: 'ADHD Friendly Profile', text: 'More focus & fewer distractions', icon: Brain },
      { key: 'cognitiveDisability' as const, name: 'Cognitive Disability Profile', text: 'Assists with reading & focusing', icon: Focus },
      { key: 'keyboardNavigation' as const, name: 'Keyboard Navigation (Motor)', text: 'Use website with the keyboard', icon: Keyboard },
      { key: 'screenReader' as const, name: 'Blind Users (Screen Reader)', text: 'Optimize website for screen-readers', icon: AudioLines },
      { key: 'olderAdults' as const, name: 'Older Adults', text: 'Enhance visibility and reading comfort', icon: Hand },
    ],
    [],
  )

  function setProfile(key: ProfileKey, value: boolean) {
    setState((prev) => ({ ...prev, profiles: { ...prev.profiles, [key]: value } }))
  }

  function setToggle(key: ToggleKey, value: boolean) {
    setState((prev) => ({ ...prev, toggles: { ...prev.toggles, [key]: value } }))
  }

  function updateRange(key: 'contentScale' | 'fontSize' | 'lineHeight' | 'letterSpacing', delta: number, min = -2, max = 3) {
    setState((prev) => ({ ...prev, [key]: clamp(prev[key] + delta, min, max) }))
  }

  function resetSettings() {
    setState(defaultState)
    setSearchTerm('')
  }

  const filteredProfiles = profileItems.filter((profile) => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return true
    return `${profile.name} ${profile.text}`.toLowerCase().includes(q)
  })

  if (hidden) {
    return (
      <button
        type="button"
        className="a11y-trigger"
        aria-label="Open Accessibility Interface"
        onClick={() => {
          setHidden(false)
          setOpen(true)
        }}
      >
        <Accessibility size={30} />
      </button>
    )
  }

  return (
    <div
      dir="ltr"
      className={`widget-container widget-container--position-left ${open ? 'widget-container--visible widget-container--transition' : ''}`}
      part="container"
      aria-hidden={open ? 'false' : 'true'}
    >
      {!open && (
        <button type="button" className="a11y-trigger" aria-label="Open Accessibility Interface" onClick={() => setOpen(true)}>
          <Accessibility size={30} />
        </button>
      )}

      {open && (
        <div className="widget-container__trap">
          <div tabIndex={-1} className="widget-container__main" role="dialog" aria-modal="true" aria-hidden="false" aria-label="Accessibility Adjustments">
            <div className="main">
              <div className="header-row">
                <button aria-label="Close Accessibility Interface" className="header-option" onClick={() => setOpen(false)}>
                  <X size={18} />
                </button>
                <div className="header-title">Accessibility Adjustments</div>
                <div className="header-spacer" />
              </div>

              <div className="hero-actions">
                <button type="button" className="hero-button" onClick={resetSettings}>
                  <RotateCcw size={16} />
                  <span>Reset Settings</span>
                </button>
                <button type="button" className="hero-button" onClick={() => window.alert('Accessibility statement can be linked here.') }>
                  <FileText size={16} />
                  <span>Statement</span>
                </button>
                <button type="button" className="hero-button" onClick={() => setHidden(true)}>
                  <EyeOff size={16} />
                  <span>Hide Interface</span>
                </button>
              </div>

              <div className="search-form">
                <Search size={18} />
                <input
                  className="input"
                  type="text"
                  name="acsb_search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Unclear content? Search in dictionary..."
                  aria-label="Unclear content? Search in dictionary..."
                />
              </div>

              <section className="action-section">
                <h3 className="action-title">Choose the right accessibility profile for you</h3>
                <div className="profiles">
                  {filteredProfiles.map((profile) => {
                    const Icon = profile.icon
                    const value = state.profiles[profile.key]
                    return (
                      <div key={profile.key} className="profile-row" role="switch" aria-checked={value}>
                        <div className="toggle-group">
                          <button type="button" className={!value ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setProfile(profile.key, false)}>OFF</button>
                          <button type="button" className={value ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setProfile(profile.key, true)}>ON</button>
                        </div>
                        <div className="profile-content">
                          <div className="profile-name">{profile.name}</div>
                          <div className="profile-text">{profile.text}</div>
                        </div>
                        <div className="profile-icon"><Icon size={18} /></div>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="action-section">
                <h3 className="action-title">Content Adjustments</h3>
                <div className="action-grid">
                  <RangeCard title="Content Scaling" value={state.contentScale} onDec={() => updateRange('contentScale', -1)} onInc={() => updateRange('contentScale', 1)} />
                  <SwitchCard title="Readable Font" icon={<Type size={20} />} value={state.toggles.readableFont} onChange={(v) => setToggle('readableFont', v)} />
                  <SwitchCard title="Highlight Titles" icon={<Type size={20} />} value={state.toggles.highlightTitles} onChange={(v) => setToggle('highlightTitles', v)} />
                  <SwitchCard title="Highlight Links" icon={<Link size={20} />} value={state.toggles.highlightLinks} onChange={(v) => setToggle('highlightLinks', v)} />
                  <SwitchCard title="Text Magnifier" icon={<ZoomIn size={20} />} value={state.toggles.textMagnifier} onChange={(v) => setToggle('textMagnifier', v)} />
                  <RangeCard title="Adjust Font Sizing" value={state.fontSize} onDec={() => updateRange('fontSize', -1)} onInc={() => updateRange('fontSize', 1)} />
                  <SwitchCard title="Align Center" icon={<AlignCenter size={20} />} value={state.align === 'center'} onChange={(v) => setState((prev) => ({ ...prev, align: v ? 'center' : 'default' }))} />
                  <RangeCard title="Adjust Line Height" value={state.lineHeight} onDec={() => updateRange('lineHeight', -1)} onInc={() => updateRange('lineHeight', 1)} />
                  <SwitchCard title="Align Left" icon={<AlignLeft size={20} />} value={state.align === 'left'} onChange={(v) => setState((prev) => ({ ...prev, align: v ? 'left' : 'default' }))} />
                  <RangeCard title="Adjust Letter Spacing" value={state.letterSpacing} onDec={() => updateRange('letterSpacing', -1)} onInc={() => updateRange('letterSpacing', 1)} />
                  <SwitchCard title="Align Right" icon={<AlignRight size={20} />} value={state.align === 'right'} onChange={(v) => setState((prev) => ({ ...prev, align: v ? 'right' : 'default' }))} />
                </div>
              </section>

              <section className="action-section">
                <h3 className="action-title">Color Adjustments</h3>
                <div className="action-grid">
                  <SwitchCard title="Dark Contrast" icon={<Moon size={20} />} value={state.toggles.darkContrast} onChange={(v) => setState((prev) => ({ ...prev, toggles: { ...prev.toggles, darkContrast: v, lightContrast: false, highContrast: false } }))} />
                  <SwitchCard title="Light Contrast" icon={<Sun size={20} />} value={state.toggles.lightContrast} onChange={(v) => setState((prev) => ({ ...prev, toggles: { ...prev.toggles, lightContrast: v, darkContrast: false, highContrast: false } }))} />
                  <SwitchCard title="High Contrast" icon={<Contrast size={20} />} value={state.toggles.highContrast} onChange={(v) => setState((prev) => ({ ...prev, toggles: { ...prev.toggles, highContrast: v, darkContrast: false, lightContrast: false } }))} />
                  <SwitchCard title="High Saturation" icon={<Droplets size={20} />} value={state.toggles.highSaturation} onChange={(v) => setToggle('highSaturation', v)} />
                  <ColorCard title="Adjust Text Colors" value={state.textColor} onPick={(color) => setState((prev) => ({ ...prev, textColor: color }))} />
                  <SwitchCard title="Monochrome" icon={<Palette size={20} />} value={state.toggles.monochrome} onChange={(v) => setToggle('monochrome', v)} />
                  <ColorCard title="Adjust Title Colors" value={state.titleColor} onPick={(color) => setState((prev) => ({ ...prev, titleColor: color }))} />
                  <SwitchCard title="Low Saturation" icon={<Droplets size={20} />} value={state.toggles.lowSaturation} onChange={(v) => setToggle('lowSaturation', v)} />
                  <ColorCard title="Adjust Background Colors" value={state.backgroundColor} onPick={(color) => setState((prev) => ({ ...prev, backgroundColor: color }))} />
                </div>
              </section>

              <section className="action-section">
                <h3 className="action-title">Orientation Adjustments</h3>
                <div className="action-grid">
                  <SwitchCard title="Mute Sounds" icon={<VolumeX size={20} />} value={state.toggles.muteSounds} onChange={(v) => setToggle('muteSounds', v)} />
                  <SwitchCard title="Hide Images" icon={<ImageOff size={20} />} value={state.toggles.hideImages} onChange={(v) => setToggle('hideImages', v)} />
                  <SwitchCard title="Read Mode" icon={<FileText size={20} />} value={state.toggles.readMode} onChange={(v) => setToggle('readMode', v)} />
                  <SwitchCard title="Reading Guide" icon={<Eye size={20} />} value={state.toggles.readingGuide} onChange={(v) => setToggle('readingGuide', v)} />
                  <SelectCard
                    title="Useful Links"
                    value={state.usefulLinks}
                    onChange={(value) => setState((prev) => ({ ...prev, usefulLinks: value as UsefulLink }))}
                    options={[
                      { value: 'acsbDefault', label: 'Select an option' },
                      { value: 'skip-main', label: 'Skip to Main Content' },
                      { value: 'header', label: 'Go to Header' },
                      { value: 'footer', label: 'Go to Footer' },
                      { value: 'contact', label: 'Go to Contact Link' },
                    ]}
                  />
                  <SwitchCard title="Stop Animations" icon={<Ban size={20} />} value={state.toggles.stopAnimations} onChange={(v) => setToggle('stopAnimations', v)} />
                  <SwitchCard title="Reading Mask" icon={<EyeOff size={20} />} value={state.toggles.readingMask} onChange={(v) => setToggle('readingMask', v)} />
                  <SwitchCard title="Highlight Hover" icon={<Focus size={20} />} value={state.toggles.highlightHover} onChange={(v) => setToggle('highlightHover', v)} />
                  <SwitchCard title="Highlight Focus" icon={<Focus size={20} />} value={state.toggles.highlightFocus} onChange={(v) => setToggle('highlightFocus', v)} />
                  <SwitchCard title="Big Black Cursor" icon={<MousePointer2 size={20} />} value={state.toggles.bigBlackCursor} onChange={(v) => setState((prev) => ({ ...prev, toggles: { ...prev.toggles, bigBlackCursor: v, bigWhiteCursor: false } }))} />
                  <SwitchCard title="Big White Cursor" icon={<MousePointer2 size={20} />} value={state.toggles.bigWhiteCursor} onChange={(v) => setState((prev) => ({ ...prev, toggles: { ...prev.toggles, bigWhiteCursor: v, bigBlackCursor: false } }))} />
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
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
  onChange: (value: boolean) => void
}) {
  return (
    <div className={`action-card ${value ? 'action-card--active' : ''}`} role="switch" aria-checked={value} tabIndex={0}>
      <div className="action-card__icon">{icon}</div>
      <div className="action-card__title">{title}</div>
      <div className="toggle-group toggle-group--small">
        <button type="button" className={!value ? 'toggle-btn active' : 'toggle-btn'} onClick={() => onChange(false)}>OFF</button>
        <button type="button" className={value ? 'toggle-btn active' : 'toggle-btn'} onClick={() => onChange(true)}>ON</button>
      </div>
    </div>
  )
}

function RangeCard({
  title,
  value,
  onDec,
  onInc,
}: {
  title: string
  value: number
  onDec: () => void
  onInc: () => void
}) {
  const label = value === 0 ? 'Default' : `${value > 0 ? '+' : ''}${value}`

  return (
    <div className="action-card action-card--wide">
      <div className="action-card__title">{title}</div>
      <div className="range-row">
        <button type="button" className="range-btn" aria-label="Decrease" onClick={onDec}>-</button>
        <div className="range-value">{label}</div>
        <button type="button" className="range-btn" aria-label="Increase" onClick={onInc}>+</button>
      </div>
    </div>
  )
}

function ColorCard({
  title,
  value,
  onPick,
}: {
  title: string
  value: string | null
  onPick: (color: string | null) => void
}) {
  return (
    <div className="action-card action-card--wide">
      <div className="action-card__title">{title}</div>
      <div className="color-row">
        {colorOptions.map((color) => (
          <button
            key={color}
            type="button"
            className={`color-dot ${value === color ? 'active' : ''}`}
            style={{ backgroundColor: color }}
            aria-label={`Change color to ${color}`}
            onClick={() => onPick(color)}
          />
        ))}
        <button type="button" className="color-cancel" onClick={() => onPick(null)}>Cancel</button>
      </div>
    </div>
  )
}

function SelectCard({
  title,
  value,
  onChange,
  options,
}: {
  title: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="action-card action-card--wide">
      <div className="action-card__title">{title}</div>
      <select className="base-select" aria-label={title} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  )
}
