/**
 * یک‌دست‌کردنِ فاصلهٔ تیترها در یادداشتِ ابزار جست‌وجو
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const path = join(here, 'یادداشت-ابزار-جست‌وجو-غلط.md')

const lines = readFileSync(path, 'utf8').split('\n')
const fixed = []
let repaired = 0

for (let i = 0; i < lines.length; i += 1) {
  const isHeading = /^#{1,6}\s/.test(lines[i])
  if (isHeading && i > 0 && fixed[fixed.length - 1]?.trim() !== '') {
    fixed.push('')
    repaired += 1
  }
  fixed.push(lines[i])
}

const out = fixed.join('\n')
if (out !== lines.join('\n')) {
  writeFileSync(path, out, 'utf8')
  console.log(`✓ ${repaired} جای چسبیده باز شد`)
} else {
  console.log('· از قبل درست بود')
}