/**
 * Structural audit of a rendered page: section order, headings, card counts,
 * empty states and anything that looks like unrendered rich text.
 */
import nextEnv from '@next/env'

// Read PORT (and the rest of .env) the same way Next does.
nextEnv.loadEnvConfig(process.cwd())

import fs from 'fs'

const url = process.argv[2] || `http://localhost:${process.env.PORT || 3555}/cypsi-home`
const res = await fetch(url)
const html = await res.text()
const out = [`GET ${url} → ${res.status}, ${html.length} bytes`, '']

// Section elements in document order, with their classes.
const sections = [...html.matchAll(/<section[^>]*class="([^"]*)"[^>]*>/g)].map((m) => m[1])
out.push(`--- <section> elements (${sections.length}) ---`)
sections.forEach((c, i) => out.push(`  ${String(i + 1).padStart(2)}. ${c.slice(0, 90)}`))

// Headings in order.
out.push('')
out.push('--- headings in order ---')
const headings = [...html.matchAll(/<(h[1-4])[^>]*>([\s\S]*?)<\/\1>/g)]
  .map((m) => ({ tag: m[1], text: m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() }))
  .filter((h) => h.text)
headings.forEach((h) => out.push(`  ${h.tag}  ${h.text.slice(0, 80)}`))

// Signals of trouble.
out.push('')
out.push('--- signals ---')
const signals = {
  'empty rich text ("No content")': /No content/g,
  'literal Lexical JSON leaked': /&quot;root&quot;|\{"root":/g,
  'unknown block warning': /Unknown block/gi,
  'placeholder text': /Lorem ipsum|placeholder/gi,
  'missing image alt': /<img(?![^>]*\balt=)[^>]*>/g,
  'DUCC branding': /DUCC/g,
  'SamarthX branding': /SamarthX/g,
  'Goa': /Goa/g,
  'empty paragraph': /<p>\s*<\/p>/g,
}
for (const [label, re] of Object.entries(signals)) {
  const n = (html.match(re) || []).length
  out.push(`  ${n > 0 ? 'x' : ' '}  ${String(n).padStart(3)}  ${label}`)
}

// Card-ish element counts, to confirm arrays rendered.
out.push('')
out.push('--- element counts ---')
const counts = {
  '<img>': /<img\b/g,
  '<iframe>': /<iframe\b/g,
  'links to /research-domains': /\/research-domains\//g,
  'links to /work-with-us': /\/work-with-us\//g,
  'links to /news': /\/news\//g,
  'buttons/links with class btn': /class="[^"]*\bbtn\b/g,
}
for (const [label, re] of Object.entries(counts)) {
  out.push(`  ${String((html.match(re) || []).length).padStart(3)}  ${label}`)
}

// What the news spotlight actually pulled in.
out.push('')
out.push('--- news headlines found ---')
const newsLinks = [...html.matchAll(/href="\/news\/([^"]+)"/g)].map((m) => m[1])
;[...new Set(newsLinks)].forEach((s) => out.push(`  /news/${s}`))

const report = out.join('\n')
console.log(report)
fs.writeFileSync('render-audit.txt', report)
