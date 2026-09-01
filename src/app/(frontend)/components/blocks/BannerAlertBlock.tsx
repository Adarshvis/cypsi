'use client'

import React from 'react'
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'

interface BannerAlertBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  dismissible?: boolean | null
  link?: { label?: string | null; url?: string | null } | null
}

const styles = {
  info: { bg: 'bg-blue-900/50 border-blue-500', icon: Info, iconColor: 'text-blue-400' },
  success: { bg: 'bg-green-900/50 border-green-500', icon: CheckCircle, iconColor: 'text-green-400' },
  warning: { bg: 'bg-yellow-900/50 border-yellow-500', icon: AlertTriangle, iconColor: 'text-yellow-400' },
  error: { bg: 'bg-red-900/50 border-red-500', icon: XCircle, iconColor: 'text-red-400' },
}

export default function BannerAlertBlock({ sectionHeading, sectionDescription, headingAlignment, type, message, dismissible, link }: BannerAlertBlockProps) {
  const [visible, setVisible] = React.useState(true)
  if (!visible) return null

  const { bg, icon: Icon, iconColor } = styles[type] || styles.info

  return (
    <div className="mx-6 my-4">
      <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
      <div className={`${bg} border-l-4 px-6 py-4 rounded-r-lg flex items-center gap-3`}>
        <Icon className={`${iconColor} shrink-0`} size={20} />
        <span className="text-white flex-1">{message}</span>
        {link?.label && link?.url && (
          <a href={link.url} className="text-blue-400 hover:underline shrink-0 font-medium">{link.label}</a>
        )}
        {dismissible && (
          <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-white shrink-0">
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
