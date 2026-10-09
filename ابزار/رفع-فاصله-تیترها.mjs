/**
 * تضمینِ فاصله‌ی خالی بین تیترها
 *
 * اسکریپت‌های قبلی، بلوک را طوری می‌چسباندند که تیترِ بعدی بی‌فاصله به
 * پاراگرافِ قبل بچسبد. Markdown هنوز آن را تیتر می‌خواند، ولی استانداردِ
 * خودمان یک خط خالی می‌خواهد. اینجا یک‌بار برای همیشه درستش می‌کنیم.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const path = join(here, '..', 'محتوا', 'استاندارد-نگارش.md')

const text = readFileSync(path, 'utf8')
const lines = text.split('\n')
let inFence = false

// هر تیتر (به‌جز اولین خط) باید با یک خط خالی از قبل جدا باشد
const fixed = []
let repaired = 0

for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i]
  // ⚠️ داخل بلوکِ کد، «تیتر» فقط نمونه است — به آن دست نمی‌زنیم
  if (line.startsWith('```')) inFence = !inFence
  const isHeading = !inFence && /^#{1,6}\s/.test(line)

  if (isHeading && i > 0) {
    const prev = fixed[fixed.length - 1]
    if (prev !== undefined && prev.trim() !== '') {
      fixed.push('')
      repaired += 1
    }
  }
  fixed.push(line)
}

const out = fixed.join('\n')

if (out !== text) {
  writeFileSync(path, out, 'utf8')
  console.log(`✓ ${repaired} جای چسبیده باز شد`)
} else {
  console.log('✓ همه‌ی تیترها از قبل فاصله داشتند')
}