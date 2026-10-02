import React from 'react'

/**
 * Accessibility figure (head, outstretched arms, torso and legs).
 *
 * Inline rather than Lucide's `Accessibility` icon, which draws a different
 * figure. Decorative: the control that uses it carries the label.
 */
export function Accessibility({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Head */}
      <circle cx="12" cy="4.5" r="1.8" />
      {/* Arms: quadratic curve whose midpoint sits at y = 9.9 */}
      <path d="M4.5 8.5 Q12 11.3 19.5 8.5" />
      {/* Torso, then legs */}
      <path d="M12 9.9 V15 M12 15 L9 20.5 M12 15 L15 20.5" />
    </svg>
  )
}

export default Accessibility
