/**
 * شماره-خط-بخش.mjs — شماره‌ی خط و متن تیترِ هر بخش شماره‌دار را چاپ می‌کند.
 * برای ساخت داستان‌ها.json لازم است.
 *
 * اجرا:  node ابزار/شماره-خط-بخش.mjs
 */

import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

const target = process.argv[2]

const files = readdirSync(join(root, 'فازها')).filter((f) => f.endsWith('.md'))
const list = target ? files.filter((f) => f.includes(target)) : files

for (const f of list.sort()) {
  const lines = readFileSync(join(root, 'فازها', f), 'utf8').split('\n')
  const found = []
  lines.forEach((l, i) => {
    if (/^## [۰-۹]/.test(l)) found.push([i + 1, l])
  })
  console.log(`\n${f}  (${found.length} بخش)`)
  for (const [n, l] of found) console.log(`  ${String(n).padStart(4)}  ${l}`)
}