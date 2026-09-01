'use client'

import React from 'react'
import * as LucideIcons from 'lucide-react'

interface DynamicIconProps {
  name?: string | null
  size?: number
  className?: string
  color?: string
}

export default function DynamicIcon({ name, size = 24, className = '', color }: DynamicIconProps) {
  if (!name) return null

  const Icon = (LucideIcons as any)[name]
  if (!Icon) return null

  return <Icon size={size} className={className} color={color} />
}
