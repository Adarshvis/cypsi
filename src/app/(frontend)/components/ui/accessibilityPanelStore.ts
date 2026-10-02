'use client'

import { useSyncExternalStore } from 'react'

/**
 * Open/closed state of the Accessibility Adjustments panel, shared between the
 * header button that opens it and the panel itself (rendered once, in the root
 * layout). Also remembers which control opened it, so focus can return there.
 */
let isOpen = false
let opener: HTMLElement | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export const accessibilityPanel = {
  open(from?: HTMLElement | null) {
    opener = from ?? (document.activeElement as HTMLElement | null)
    isOpen = true
    emit()
  },
  close() {
    if (!isOpen) return
    isOpen = false
    emit()
    // After the panel unmounts, put focus back where the visitor was.
    requestAnimationFrame(() => opener?.focus())
  },
  toggle(from?: HTMLElement | null) {
    if (isOpen) this.close()
    else this.open(from)
  },
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function useAccessibilityPanelOpen(): boolean {
  return useSyncExternalStore(subscribe, () => isOpen, () => false)
}

export const ACCESSIBILITY_PANEL_ID = 'a11y-panel'
