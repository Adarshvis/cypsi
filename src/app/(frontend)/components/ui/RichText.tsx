'use client'

import React, { useEffect, useState } from 'react'
import { RichText as PayloadRichText } from '@payloadcms/richtext-lexical/react'
import {
  IS_BOLD,
  IS_CODE,
  IS_ITALIC,
  IS_STRIKETHROUGH,
  IS_SUBSCRIPT,
  IS_SUPERSCRIPT,
  IS_UNDERLINE,
} from '@payloadcms/richtext-lexical/lexical'

const lexicalExtJSXConverters = {
  'custom-paragraph': ({ node, nodesToJSX }: any) => {
    const children = nodesToJSX({ nodes: node?.children || [] })

    if (!children?.length) {
      return (
        <p>
          <br />
        </p>
      )
    }

    const style: Record<string, string> = {
      paddingTop: '.5rem',
      paddingBottom: '.5rem',
    }

    const match = node?.style?.match(/background-color: ([^;]+)/)
    if (match?.[1]) {
      style.backgroundColor = match[1]
    }

    return <p style={style}>{children}</p>
  },
  text: ({ node }: any) => {
    let text: React.ReactNode = node?.text

    if (node?.format & IS_BOLD) text = <strong>{text}</strong>
    if (node?.format & IS_ITALIC) text = <em>{text}</em>
    if (node?.format & IS_STRIKETHROUGH) text = <span style={{ textDecoration: 'line-through' }}>{text}</span>
    if (node?.format & IS_UNDERLINE) text = <span style={{ textDecoration: 'underline' }}>{text}</span>
    if (node?.format & IS_CODE) text = <code>{text}</code>
    if (node?.format & IS_SUBSCRIPT) text = <sub>{text}</sub>
    if (node?.format & IS_SUPERSCRIPT) text = <sup>{text}</sup>

    if (node?.style) {
      const style: Record<string, string> = {}

      let match = node.style.match(/(?:^|;)\s?background-color: ([^;]+)/)
      if (match?.[1]) style.backgroundColor = match[1]

      match = node.style.match(/(?:^|;)\s?color: ([^;]+)/)
      if (match?.[1]) style.color = match[1]

      match = node.style.match(/(?:^|;)\s?font-size: ([^;]+)/)
      if (match?.[1]) style.fontSize = match[1]

      text = <span style={style}>{text}</span>
    }

    return text
  },
  youtube: ({ node }: any) => {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${node?.id}?modestbranding=1&rel=0`}
        width="100%"
        style={{ aspectRatio: '16/9' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  },
  vimeo: ({ node }: any) => {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${node?.id}`}
        width="100%"
        style={{ aspectRatio: '16/9' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  },
}

type RichTextProps = {
  data: any
  converters?: any
  [key: string]: any
}

export default function RichText(props: RichTextProps) {
  const { converters: userConverters, className, ...restProps } = props
  const wrapperClassName = ['cms-richtext', className].filter(Boolean).join(' ')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={wrapperClassName} suppressHydrationWarning>
      {mounted ? (
        <PayloadRichText
          {...restProps}
          converters={(args: any) => {
            const defaultConverters = args?.defaultConverters || {}

            const pluginConverters = {
              ...defaultConverters,
              ...lexicalExtJSXConverters,
            }

            if (!userConverters) return pluginConverters

            if (typeof userConverters === 'function') {
              const resolved = userConverters({ ...args, defaultConverters: pluginConverters })
              return resolved || pluginConverters
            }

            return {
              ...pluginConverters,
              ...userConverters,
            }
          }}
        />
      ) : null}
    </div>
  )
}
