/**
 * اصلاحِ بخشِ «تصمیم» و فاصله‌ها در یادداشتِ بررسیِ حافظه
 *
 * بخشِ «تصمیم» هنوز می‌گفت «جای آن، روایتی گذاشته شد» — ولی آن روایت
 * هرگز اجرا نشد و پاراگرافِ فنی همان‌جا سند گرفت. متن باید وضعیتِ واقعی
 * را بگوید.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const path = join(here, '..', 'ابزار', 'یادداشت-بررسی-حافظه.md')

const text = readFileSync(path, 'utf8')

// ── ۱) بخشِ تصمیم را با وضعیتِ واقعی عوض می‌کنیم ──
const OLD_DECISION = [
  '## تصمیم',
  '',
  'جای آن، روایتی گذاشته شد که به منبعِ قابل‌بررسی تکیه دارد — و خودِ',
  'محدودیتِ آن هم صریح نوشته شد.',
].join('\n')

const NEW_DECISION = [
  '## تصمیم',
  '',
  'دو کار انجام شد:',
  '',
  '1. **پاراگرافِ فنی سند گرفت** — نقلِ Roediger & Karpicke (۲۰۰۶) به آن',
  '   اضافه شد. این کار قطعی است و انجام شده.',
  '2. **داستانِ بی‌سند هنوز سرِ جایش است.** برایش یک جایگزین نوشته شده',
  '   (`ابزار/اصلاح-داستان-راهنما.mjs`) ولی **اجرا نشده**، چون خودِ جایگزین',
  '   هنوز راستی‌آزمایی نشده بود.',
].join('\n')

let out = text
if (out.includes(OLD_DECISION)) {
  out = out.replace(OLD_DECISION, NEW_DECISION)
  console.log('✓ بخشِ تصمیم به‌روز شد')
} else {
  console.log('· بخشِ تصمیم از قبل به‌روز است')
}

// ── ۲) یک‌دست‌کردنِ فاصله‌های تیتر ──
const lines = out.split('\n')
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

out = fixed.join('\n')
if (repaired > 0) console.log(`✓ ${repaired} جای چسبیده باز شد`)

writeFileSync(path, out, 'utf8')