'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, ChevronDown } from 'lucide-react'
import { Accessibility } from './ui/AccessibilityIcon'
import {
  ACCESSIBILITY_PANEL_ID,
  accessibilityPanel,
  useAccessibilityPanelOpen,
} from './ui/accessibilityPanelStore'

interface HeaderData {
  topBar?: {
    enabled?: boolean | null
    text?: string | null
    backgroundColor?: string | null
  } | null
  leftLogo?: {
    image?: any
    url?: string | null
    height?: number | null
    maxWidth?: number | null
  } | null
  centerLogo?: {
    image?: any
    title?: string | null
    subtitle?: string | null
    url?: string | null
    height?: number | null
    maxWidth?: number | null
  } | null
  searchBar?: {
    enabled?: boolean | null
    placeholder?: string | null
  } | null
  navAlignment?: 'left' | 'center' | 'right' | null
  navItems?: {
    label: string
    url?: string | null
    children?: {
      type?: 'page' | 'custom' | null
      page?: { title?: string | null; slug?: string | null } | null
      label?: string | null
      customLabel?: string | null
      customUrl?: string | null
      id?: string | null
    }[] | null
    id?: string | null
  }[] | null
  ctaButton?: {
    enabled?: boolean | null
    label?: string | null
    url?: string | null
  } | null
}

interface HeaderProps {
  data: HeaderData
  /** From Site Settings; shown as a wordmark when no logo image is set. */
  siteName?: string
  /** From Site Settings → Accessibility. Omitted when the button is switched off. */
  accessibilityLink?: { label: string; url: string }
}

/** Icon-only button that opens the Accessibility Adjustments panel; lg and up. */
function AccessibilityLink({ link }: { link?: { label: string; url: string } }) {
  const open = useAccessibilityPanelOpen()
  if (!link) return null
  return (
    <button
      type="button"
      onClick={(e) => accessibilityPanel.toggle(e.currentTarget)}
      aria-label={link.label}
      title={link.label}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={ACCESSIBILITY_PANEL_ID}
      className="hidden lg:inline-flex rounded-lg p-2 text-primary-blue transition-colors hover:bg-primary-blue/10 aria-expanded:bg-primary-blue/10"
    >
      <Accessibility className="h-5 w-5" />
    </button>
  )
}

/** The same panel from the mobile menu, where the header icon is not shown. */
function MobileAccessibilityItem({ link }: { link?: { label: string; url: string } }) {
  if (!link) return null
  return (
    <button
      type="button"
      onClick={(e) => accessibilityPanel.open(e.currentTarget)}
      aria-haspopup="dialog"
      aria-controls={ACCESSIBILITY_PANEL_ID}
      className="mt-2 flex w-full items-center gap-2 rounded-lg py-2.5 text-left text-base font-medium text-primary-blue"
    >
      <Accessibility className="h-5 w-5" />
      {link.label}
    </button>
  )
}

const MOBILE_NAV_ID = 'site-mobile-nav'
const MOBILE_SEARCH_ID = 'site-mobile-search'
const submenuId = (key: string) => `site-submenu-${key.replace(/[^a-zA-Z0-9_-]+/g, '-')}`

export default function Header({ data, siteName, accessibilityLink }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  /** Desktop dropdown opened by click or keyboard (hover opens it visually too). */
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [theme, setTheme] = useState<string>('ducc')
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)
  const mobileToggleRef = useRef<HTMLButtonElement | null>(null)
  const searchToggleRef = useRef<HTMLButtonElement | null>(null)
  const pathname = usePathname()

  const searchLabel = data.searchBar?.placeholder?.trim() || 'Search'

  /*
   * Escape closes whatever is open, innermost first, and puts focus back on the
   * control that opened it so keyboard users are not dropped at the page top.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (openMenu) {
        const trigger = document.querySelector<HTMLElement>(`[aria-controls="${submenuId(openMenu)}"]`)
        setOpenMenu(null)
        trigger?.focus()
      } else if (mobileOpen) {
        setMobileOpen(false)
        mobileToggleRef.current?.focus()
      } else if (searchOpen) {
        setSearchOpen(false)
        searchToggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openMenu, mobileOpen, searchOpen])

  // A click anywhere outside an open dropdown closes it.
  useEffect(() => {
    if (!openMenu) return
    const onPointer = (e: PointerEvent) => {
      const wrapper = document.getElementById(submenuId(openMenu))?.parentElement
      if (wrapper && !wrapper.contains(e.target as Node)) setOpenMenu(null)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [openMenu])

  // Navigating closes everything.
  useEffect(() => {
    setOpenMenu(null)
    setMobileOpen(false)
  }, [pathname])

  /** Wrapper props for a desktop nav item: closes its dropdown once focus leaves it. */
  const menuWrapperProps = (key: string) => ({
    onBlur: (e: React.FocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        setOpenMenu((cur) => (cur === key ? null : cur))
      }
    },
  })

  /** Props for a dropdown's trigger button. */
  const menuTriggerProps = (key: string) => ({
    type: 'button' as const,
    'aria-expanded': openMenu === key,
    'aria-controls': submenuId(key),
    'aria-haspopup': 'true' as const,
    onClick: () => setOpenMenu((cur) => (cur === key ? null : key)),
  })

  /** Submenu visibility: open via keyboard/click, or on mouse hover. */
  const submenuVisibility = (key: string) => (openMenu === key ? 'block' : 'hidden group-hover:block')

  // Helper function to get child URL and label
  const getChildData = (child: any) => {
    if (child.type === 'custom') {
      return {
        url: child.customUrl || '#',
        label: child.customLabel || '',
      }
    }
    // Default to page type
    return {
      url: `/${child.page?.slug || ''}`,
      label: child.label || child.page?.title || '',
    }
  }

  // Read theme from body data-theme attribute
  useEffect(() => {
    const body = document.body
    const currentTheme = body.getAttribute('data-theme') || 'ducc'
    setTheme(currentTheme)

    const observer = new MutationObserver(() => {
      const t = body.getAttribute('data-theme') || 'ducc'
      setTheme(t)
    })
    observer.observe(body, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  // The learner header sits flush against the hero band until the page is
  // scrolled, then lifts to white with a shadow.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = headerRef.current
    if (!el) return

    const updateHeight = () => {
      document.documentElement.style.setProperty('--site-header-height', `${el.offsetHeight}px`)
    }

    updateHeight()

    let observer: ResizeObserver | null = null
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      observer = new ResizeObserver(updateHeight)
      observer.observe(el)
    }

    window.addEventListener('resize', updateHeight)

    return () => {
      if (observer) observer.disconnect()
      window.removeEventListener('resize', updateHeight)
      document.documentElement.style.removeProperty('--site-header-height')
    }
  }, [mobileOpen, searchOpen, data.topBar?.enabled, data.navItems?.length, theme])

  const isActive = (url?: string | null) => {
    if (!url) return false
    if (url === '/') return pathname === '/'
    return pathname === url || pathname.startsWith(url + '/')
  }

  const leftImg = typeof data.leftLogo?.image === 'object' && data.leftLogo.image?.url ? data.leftLogo.image : null
  const leftHeight = data.leftLogo?.height || 50
  const leftMaxWidth = data.leftLogo?.maxWidth || 200
  const centerImg =
    typeof data.centerLogo?.image === 'object' && data.centerLogo.image?.url ? data.centerLogo.image : null
  const centerHeight = data.centerLogo?.height || 60
  const centerMaxWidth = data.centerLogo?.maxWidth || 300
  const centerIntrinsicHeight =
    typeof centerImg?.height === 'number' && Number.isFinite(centerImg.height)
      ? centerImg.height
      : centerHeight
  // Respect the CMS height value — only cap to the image's intrinsic height so it doesn't upscale
  const centerRenderHeight = Math.min(centerHeight, centerIntrinsicHeight)
  const hasCenterLogoContent = Boolean(centerImg || data.centerLogo?.title || data.centerLogo?.subtitle)

  const isLearner = theme === 'learner'

  // ── LEARNER HEADER ──
  if (isLearner) {
    return (
      <>
        <header
          ref={headerRef}
          className="site-header fixed top-0 left-0 right-0 z-[100] w-full"
          style={{
            boxShadow: scrolled ? '0 0 18px rgba(0, 0, 0, 0.1)' : 'none',
            transition: 'box-shadow 0.3s, background-color 0.3s',
          }}
        >
          <div
            style={{
              // Site background (#f1f5f7) unscrolled, white once scrolled.
              // Deliberately not --cms-muted-bg: that is #e6edf0, used by the
              // hero and page-title bands. The header sits a shade lighter.
              backgroundColor: scrolled ? 'var(--cms-surface, #ffffff)' : 'var(--cms-bg, #f1f5f7)',
              transition: 'background-color 0.3s',
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-[70px] flex items-center justify-between gap-6 py-3">
              {/* Logo — left */}
              <div className="shrink-0 flex items-center gap-3">
                {leftImg?.url ? (
                  <Link href={data.leftLogo?.url || '/'} className="block">
                    <Image
                      src={leftImg.url}
                      alt={leftImg.alt || siteName || ''}
                      width={leftMaxWidth}
                      height={leftHeight}
                      style={{ height: `${leftHeight}px`, width: 'auto', maxWidth: `${leftMaxWidth}px` }}
                      className="object-contain"
                    />
                  </Link>
                ) : hasCenterLogoContent ? (
                  <Link href={data.centerLogo?.url || '/'} className="flex items-center gap-2">
                    {centerImg?.url && (
                      <Image
                        src={centerImg.url}
                        alt={centerImg.alt || data.centerLogo?.title || siteName || ''}
                        width={centerMaxWidth}
                        height={centerRenderHeight}
                        quality={100}
                        style={{ height: `${centerRenderHeight}px`, width: 'auto' }}
                        className="object-contain"
                      />
                    )}
                    {data.centerLogo?.title && (
                      <span
                        className="text-lg font-bold"
                        style={{ color: 'var(--cms-secondary, #011e2c)' }}
                      >
                        {data.centerLogo.title}
                      </span>
                    )}
                  </Link>
                ) : (
                  // Wordmark fallback for the centre slot, from Site Settings.
                  siteName && (
                    <Link
                      href="/"
                      className="text-lg font-bold"
                      style={{ color: 'var(--cms-secondary, #011e2c)' }}
                    >
                      {siteName}
                    </Link>
                  )
                )}
              </div>

              {/* Nav — center/right */}
              <nav className="hidden md:flex items-center gap-7 flex-1 justify-center">
                {(data.navItems || []).map((item) => {
                  const hasChildren = item.children && item.children.length > 0
                  const active = hasChildren
                    ? item.children?.some((child) => {
                        const { url } = getChildData(child)
                        return isActive(url)
                      }) || false
                    : isActive(item.url)

                  const menuKey = item.id || item.label

                  return (
                    <div key={menuKey} className="relative group" {...menuWrapperProps(menuKey)}>
                      {!hasChildren ? (
                        <Link
                          href={item.url || '#'}
                          className="text-[15px] font-medium pb-1 border-b-2 transition-all duration-200 inline-flex items-center"
                          style={{
                            color: active ? 'var(--cms-primary, #04415f)' : 'var(--cms-text, #010608)',
                            borderColor: active ? 'var(--cms-primary, #04415f)' : 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            if (!active) {
                              e.currentTarget.style.color = 'var(--cms-primary, #04415f)'
                              e.currentTarget.style.borderColor = 'var(--cms-accent, #2086b8)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!active) {
                              e.currentTarget.style.color = 'var(--cms-text, #010608)'
                              e.currentTarget.style.borderColor = 'transparent'
                            }
                          }}
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <>
                          {/* A real button: it opens the submenu by keyboard as well as hover. */}
                          <button
                            {...menuTriggerProps(menuKey)}
                            className="text-[15px] font-medium pb-1 border-b-2 transition-all duration-200 inline-flex items-center gap-1 bg-transparent"
                            style={{
                              color: active ? 'var(--cms-primary, #04415f)' : 'var(--cms-text, #010608)',
                              borderColor: active ? 'var(--cms-primary, #04415f)' : 'transparent',
                              cursor: 'pointer',
                            }}
                          >
                            {item.label}
                            <ChevronDown
                              size={14}
                              className={`transition-transform ${openMenu === menuKey ? 'rotate-180' : ''}`}
                            />
                          </button>
                          {item.children && item.children.length > 0 && (
                            <div
                              id={submenuId(menuKey)}
                              className={`absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[200px] z-50 ${submenuVisibility(menuKey)}`}
                            >
                              {item.children.map((child) => {
                                const { url: childUrl, label: childLabel } = getChildData(child)
                                const childActive = isActive(childUrl)
                                return (
                                  <Link
                                    key={child.id || childLabel}
                                    href={childUrl}
                                    className={`block px-4 py-2 text-sm transition-colors ${
                                      childActive
                                        ? 'font-semibold'
                                        : 'hover:bg-gray-50'
                                    }`}
                                    style={{
                                      color: childActive ? 'var(--cms-primary, #04415f)' : 'var(--cms-text, #010608)',
                                    }}
                                  >
                                    {childLabel}
                                  </Link>
                                )
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </nav>

              {/* Right: CTA + Search + Mobile toggle */}
              <div className="shrink-0 flex items-center gap-3">
                {data.searchBar?.enabled && (
                  <button
                    ref={searchToggleRef}
                    type="button"
                    className="hidden md:flex text-gray-500 hover:text-gray-700 p-2"
                    onClick={() => setSearchOpen(!searchOpen)}
                    aria-label={searchLabel}
                    title={searchLabel}
                    aria-expanded={searchOpen}
                    aria-controls={MOBILE_SEARCH_ID}
                  >
                    <Search size={18} />
                  </button>
                )}
                <AccessibilityLink link={accessibilityLink} />
                {data.ctaButton?.enabled && data.ctaButton.label && (
                  <a
                    href={data.ctaButton.url || '#'}
                    className="hidden md:inline-flex btn-shine text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:shadow-lg items-center gap-2"
                    style={{ background: 'var(--cms-primary, #04415f)' }}
                  >
                    {data.ctaButton.label}
                  </a>
                )}
                <button
                  ref={mobileToggleRef}
                  type="button"
                  className="md:hidden text-gray-600 hover:text-gray-900"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={mobileOpen}
                  aria-controls={MOBILE_NAV_ID}
                >
                  {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>

            {/* Search bar expanded */}
            {searchOpen && data.searchBar?.enabled && (
              <div
                id={MOBILE_SEARCH_ID}
                className="border-t px-4 py-3"
                style={{ borderColor: 'var(--cms-muted-bg, #e6edf0)' }}
              >
                <div className="max-w-7xl mx-auto flex items-center bg-gray-50 rounded-lg px-3 py-2 gap-2">
                  <Search size={16} className="text-gray-400 shrink-0" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={data.searchBar.placeholder || 'Search...'}
                    aria-label={searchLabel}
                    className="bg-transparent text-sm text-gray-700 w-full placeholder-gray-400"
                    autoFocus
                  />
                </div>
              </div>
            )}
          </div>

          {/* Mobile Nav */}
          {mobileOpen && data.navItems && data.navItems.length > 0 && (
            <nav
              id={MOBILE_NAV_ID}
              className="md:hidden bg-white border-t px-4 py-3"
              style={{ borderColor: 'var(--cms-muted-bg, #e6edf0)' }}
            >
              {data.navItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0
                const active = hasChildren
                  ? item.children?.some((child) => {
                      const { url } = getChildData(child)
                      return isActive(url)
                    }) || false
                  : isActive(item.url)

                return (
                  <div key={item.id || item.label}>
                    {!hasChildren ? (
                      <Link
                        href={item.url || '#'}
                        className={`block py-2.5 text-base transition-colors ${
                          active ? 'font-semibold' : ''
                        }`}
                        style={{ color: active ? 'var(--cms-primary, #04415f)' : 'var(--cms-text, #010608)' }}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <>
                        <div
                          className={`py-2.5 text-base font-medium`}
                          style={{ color: active ? 'var(--cms-primary, #04415f)' : 'var(--cms-text, #010608)' }}
                        >
                          {item.label}
                        </div>
                        {item.children?.map((child) => {
                          const { url: childUrl, label: childLabel } = getChildData(child)
                          return (
                            <Link
                              key={child.id || childLabel}
                              href={childUrl}
                              className={`block py-2 pl-4 text-sm transition-colors ${
                                isActive(childUrl) ? 'font-semibold' : 'text-gray-500'
                              }`}
                              style={{ color: isActive(childUrl) ? 'var(--cms-primary, #04415f)' : undefined }}
                            >
                              {childLabel}
                            </Link>
                          )
                        })}
                      </>
                    )}
                  </div>
                )
              })}
              <MobileAccessibilityItem link={accessibilityLink} />
              {data.ctaButton?.enabled && data.ctaButton.label && (
                <a
                  href={data.ctaButton.url || '#'}
                  className="block mt-3 text-center text-white text-sm font-semibold px-4 py-2.5 rounded-full"
                  style={{ background: 'var(--cms-primary, #04415f)' }}
                >
                  {data.ctaButton.label}
                </a>
              )}
            </nav>
          )}
        </header>
      </>
    )
  }

  // ── CENTERED HEADER (default) ──
  const navAlignment = data.navAlignment || 'center'
  const navAlignWrapperClass =
    navAlignment === 'left'
      ? 'justify-start'
      : navAlignment === 'right'
        ? 'justify-end'
        : 'justify-center'
  const innerSurfaceClass = 'header-main-surface max-w-7xl mx-auto px-4 sm:px-6 h-[100px] flex items-start justify-between gap-4 pt-3'
  const mobileSearchClass = 'header-mobile-search md:hidden border-t border-gray-200 px-4 py-3'

  return (
    <>
    <header ref={headerRef} className="site-header fixed top-0 left-0 right-0 z-[100] w-full">
      {/* ── Top Bar ── */}
      {data.topBar?.enabled && data.topBar.text && (
        <div
          className="text-white text-xs text-center py-1.5 px-4"
          style={{ backgroundColor: data.topBar.backgroundColor || '#1E3A5F' }}
        >
          {data.topBar.text}
        </div>
      )}

      {/* ── Main Header: Left Logo | Center Menu | Search ── */}
      <div className="bg-white">
        <div className={innerSurfaceClass}>
          {/* Left Logo */}
          <div className="shrink-0 self-start">
            {leftImg?.url ? (
              <a href={data.leftLogo?.url || '/'} className="block">
                <Image
                  src={leftImg.url}
                  alt={leftImg.alt || siteName || ''}
                  width={leftMaxWidth}
                  height={leftHeight}
                  style={{ height: `${leftHeight}px`, width: 'auto', maxWidth: `${leftMaxWidth}px` }}
                  className="object-contain"
                />
              </a>
            ) : (
              // Wordmark fallback. Renders nothing when Site Settings has no
              // name, rather than showing some other organisation's.
              siteName && (
                <Link href={data.leftLogo?.url || '/'} className="text-lg font-bold text-gray-900">
                  {siteName}
                </Link>
              )
            )}
          </div>

          {/* Center Logo */}
          <div className="hidden md:flex flex-1 h-full flex-col items-center justify-start">
            {hasCenterLogoContent && (
              <a
                href={data.centerLogo?.url || '/'}
                className="inline-flex max-h-full flex-col items-center justify-center text-center"
              >
                {centerImg?.url && (
                  <Image
                    src={centerImg.url}
                    alt={centerImg.alt || data.centerLogo?.title || siteName || ''}
                    width={centerMaxWidth}
                    height={centerRenderHeight}
                    quality={100}
                    sizes={`${centerMaxWidth}px`}
                    style={{
                      height: `${centerRenderHeight}px`,
                      width: 'auto',
                    }}
                    className="object-contain"
                  />
                )}
                {data.centerLogo?.title && (
                  <span className="mt-1 text-sm font-semibold text-gray-900">{data.centerLogo.title}</span>
                )}
                {data.centerLogo?.subtitle && (
                  <span className="text-xs text-gray-600">{data.centerLogo.subtitle}</span>
                )}
              </a>
            )}

            {data.navItems && data.navItems.length > 0 && (
              <div className={`mt-[calc(var(--spacing)*5)] flex w-full items-center ${navAlignWrapperClass}`}>
                <div className="flex items-baseline gap-4 flex-nowrap whitespace-nowrap">
                  {(data.navItems || []).map((item) => {
                    const hasChildren = item.children && item.children.length > 0
                    const active = hasChildren
                      ? item.children?.some((child) => {
                          const { url } = getChildData(child)
                          return isActive(url)
                        }) || false
                      : isActive(item.url)

                    const menuKey = item.id || item.label

                    return (
                      <div key={menuKey} className="relative group" {...menuWrapperProps(menuKey)}>
                        {!hasChildren ? (
                          <a
                            href={item.url || '#'}
                            onMouseEnter={() => setHoveredNav(item.id || item.label)}
                            onMouseLeave={() => setHoveredNav(null)}
                            className="header-nav-link inline-flex items-center text-sm font-medium pb-1 border-b-[3px] leading-none"
                            style={{
                              color: hoveredNav === (item.id || item.label)
                                ? '#FFAA01'
                                : active
                                  ? '#1A73E9'
                                  : '#000000',
                              borderColor: hoveredNav === (item.id || item.label)
                                ? '#FFAA01'
                                : active
                                  ? '#1A73E9'
                                  : 'transparent',
                              transition: 'color 0.3s ease-in-out, border-color 0.3s ease-in-out, transform 0.2s ease',
                              transform: hoveredNav === (item.id || item.label) ? 'translateY(-1px)' : 'translateY(0)',
                            }}
                          >
                            {item.label}
                          </a>
                        ) : (
                          <>
                            {/* A real button: it opens the submenu by keyboard as well as hover. */}
                            <button
                              {...menuTriggerProps(menuKey)}
                              onMouseEnter={() => setHoveredNav(item.id || item.label)}
                              onMouseLeave={() => setHoveredNav(null)}
                              className="header-nav-link inline-flex items-center gap-1 text-sm font-medium pb-1 border-b-[3px] leading-none bg-transparent"
                              style={{
                                color: hoveredNav === (item.id || item.label)
                                  ? '#FFAA01'
                                  : active
                                    ? '#1A73E9'
                                    : '#000000',
                                borderColor: hoveredNav === (item.id || item.label)
                                  ? '#FFAA01'
                                  : active
                                    ? '#1A73E9'
                                    : 'transparent',
                                transition: 'color 0.3s ease-in-out, border-color 0.3s ease-in-out, transform 0.2s ease',
                                transform: hoveredNav === (item.id || item.label) ? 'translateY(-1px)' : 'translateY(0)',
                                cursor: 'pointer',
                              }}
                            >
                              {item.label}
                              <ChevronDown
                                size={14}
                                className={`transition-transform ${openMenu === menuKey ? 'rotate-180' : ''}`}
                              />
                            </button>
                            {item.children && item.children.length > 0 && (
                              <div
                                id={submenuId(menuKey)}
                                className={`absolute top-full left-0 mt-0 bg-white rounded-b-lg shadow-lg border border-gray-200 py-1 min-w-[200px] z-50 ${submenuVisibility(menuKey)}`}
                              >
                                {item.children.map((child) => {
                                  const { url: childUrl, label: childLabel } = getChildData(child)
                                  const childActive = isActive(childUrl)
                                  return (
                                    <a
                                      key={child.id || childLabel}
                                      href={childUrl}
                                      className={`block px-4 py-2 text-base transition-colors ${
                                        childActive
                                          ? 'text-[#1A73E9] font-semibold'
                                          : 'text-gray-900 hover:text-[#1A73E9] hover:bg-gray-50'
                                      }`}
                                    >
                                      {childLabel}
                                    </a>
                                  )
                                })}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}

                  {data.ctaButton?.enabled && data.ctaButton.label && (
                    <a
                      href={data.ctaButton.url || '#'}
                      className="btn-shine text-white text-sm font-semibold px-5 py-2.5 rounded-md transition-all hover:shadow-lg inline-flex items-center gap-2"
                      style={{ background: 'var(--cms-primary, #4B2E83)' }}
                    >
                      {data.ctaButton.label}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Search Bar + Mobile Toggle */}
          <div className="shrink-0 self-start md:mt-2 flex items-center gap-3">
            {data.searchBar?.enabled && (
              <>
                {/* Desktop search */}
                <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 gap-2 w-56">
                  <Search size={16} className="text-gray-400 shrink-0" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={data.searchBar.placeholder || 'Search...'}
                    aria-label={searchLabel}
                    className="bg-transparent text-sm text-gray-700 w-full placeholder-gray-400"
                  />
                </div>
                {/* Mobile search toggle */}
                <button
                  ref={searchToggleRef}
                  type="button"
                  className="md:hidden text-gray-600 hover:text-gray-900"
                  onClick={() => setSearchOpen(!searchOpen)}
                  aria-label={searchLabel}
                  title={searchLabel}
                  aria-expanded={searchOpen}
                  aria-controls={MOBILE_SEARCH_ID}
                >
                  <Search size={20} />
                </button>
              </>
            )}
            <AccessibilityLink link={accessibilityLink} />
            <button
              ref={mobileToggleRef}
              type="button"
              className="md:hidden text-gray-600 hover:text-gray-900"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls={MOBILE_NAV_ID}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile search bar (expanded) */}
        {searchOpen && data.searchBar?.enabled && (
          <div id={MOBILE_SEARCH_ID} className={mobileSearchClass}>
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 gap-2">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={data.searchBar.placeholder || 'Search...'}
                aria-label={searchLabel}
                className="bg-transparent text-sm text-gray-700 w-full placeholder-gray-400"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile Navigation Bar ── */}
      {data.navItems && data.navItems.length > 0 && (
        <nav className="md:hidden bg-white border-b border-gray-200 pb-[5px]">

          {/* Mobile Nav */}
          {mobileOpen && (
            <div id={MOBILE_NAV_ID} className="md:hidden border-t border-gray-200 px-4 py-3 bg-white">
              {data.navItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0
                const active = hasChildren
                  ? item.children?.some((child) => {
                      const { url } = getChildData(child)
                      return isActive(url)
                    }) || false
                  : isActive(item.url)

                return (
                <div key={item.id || item.label}>
                  {!hasChildren ? (
                    <a
                      href={item.url || '#'}
                      className={`block py-2.5 text-base transition-colors ${
                        active
                          ? 'text-[#1A73E9] font-semibold'
                          : 'text-gray-900 hover:text-[#1A73E9]'
                      }`}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <>
                      <div className={`py-2.5 text-base font-medium ${
                        active ? 'text-[#1A73E9]' : 'text-gray-900'
                      }`}>{item.label}</div>
                      {item.children?.map((child) => {
                        const { url: childUrl, label: childLabel } = getChildData(child)
                        return (
                          <a
                            key={child.id || childLabel}
                            href={childUrl}
                            className={`block py-2 pl-4 text-base transition-colors ${
                              isActive(childUrl)
                                ? 'text-[#1A73E9] font-semibold'
                                : 'text-gray-500 hover:text-[#1A73E9]'
                            }`}
                          >
                            {childLabel}
                          </a>
                        )
                      })}
                    </>
                  )}
                </div>
                )
              })}
              <MobileAccessibilityItem link={accessibilityLink} />
              {data.ctaButton?.enabled && data.ctaButton.label && (
                <a
                  href={data.ctaButton.url || '#'}
                  className="block mt-3 text-center text-white text-sm font-semibold px-4 py-2.5 rounded-md"
                  style={{ background: 'var(--cms-primary, #4B2E83)' }}
                >
                  {data.ctaButton.label}
                </a>
              )}
            </div>
          )}
        </nav>
      )}
    </header>
    </>
  )
}

