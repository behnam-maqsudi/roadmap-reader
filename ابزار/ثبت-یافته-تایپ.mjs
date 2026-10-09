/**
 * ثبتِ یافته‌ی tsc و تستِ جدید در «استاندارد-نگارش»
 *
 * یافته: `tsc --noEmit` در این پروژه **کور** است. ریشه‌ی tsconfig.json
 * برابر `files: []` با `references` است، پس آن دستور هیچ فایلی را نمی‌بیند
 * و همیشه صفر می‌دهد. مدت‌ها فکر می‌کردیم بررسیِ نوع داریم و نداشتیم.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const path = join(here, '..', 'محتوا', 'استاندارد-نگارش.md')

let text = readFileSync(path, 'utf8')

// ── ۱) ردیفِ هشتمِ جدولِ تست‌ها ──
const ROW = '| `آزمایش-نحو` |'
if (text.includes(ROW) && !text.includes('آزمایش-تایپ-واقعی')) {
  const at = text.indexOf(ROW)
  const end = text.indexOf('\n', at) + 1
  text =
    text.slice(0, end) +
    '| `آزمایش-تایپ-واقعی` | بررسیِ نوع به خطای واقعی حساس است — صفرِ الکی قبول نیست |\n' +
    text.slice(end)
  console.log('✓ ردیفِ تایپ اضافه شد')
}

if (text.includes('### هفت تستِ ساختاری')) {
  text = text.replace('### هفت تستِ ساختاری', '### هشت تستِ ساختاری')
  console.log('✓ تیتر به «هشت تست» تغییر کرد')
}

// ── ۲) بخشِ کامل درباره‌ی tsc ──
const ANCHOR = '### آفلاین بودن'
const NOTE = [
  '### ⚠️ بررسیِ نوع در این پروژه',
  '',
  'ریشه‌ی `tsconfig.json` برابر `files: []` با `references` است. یعنی:',
  '',
  '```bash',
  '# ❌ این هیچ فایلی را نمی‌بیند و همیشه صفر می‌دهد',
  'tsc --noEmit',
  '',
  '# ✅ این واقعاً ۲۱۱ فایل را می‌خواند',
  'tsc -p tsconfig.app.json',
  '```',
  '',
  'این را یک بار اشتباه فهمیده بودیم و فکر می‌کردیم بررسیِ نوع داریم، در حالی',
  'که هیچ‌چیز چک نمی‌شد. `آزمایش-تایپ-واقعی` دیگر اجازه نمی‌دهد این اشتباه',
  'برگردد: یک خطای واقعی داخل `src` می‌گذارد و می‌سنجد که بررسی آن را',
  'می‌بیند یا نه.',
  '',
  '⚠️ `-b` بدون `--force` هم کور است: چون `noEmit` در tsconfig.app.json است،',
  'چیزی تولید نمی‌شود و کش هم به‌روز نمی‌شود.',
  '',
].join('\n')

if (text.includes(ANCHOR) && !text.includes('بررسیِ نوع در این پروژه')) {
  text = text.replace(ANCHOR, NOTE + ANCHOR)
  console.log('✓ بخشِ tsc اضافه شد')
}

// ── ۳) بررسی-کامل را به‌عنوان راهِ اصلی معرفی کن ──
const OLD = '# کل مجموعه‌ی تست‌ها (با پرچم‌های لازم)\nnode ابزار/همه-تست.mjs\n'
const NEW = OLD + '\n# یا همه‌چیز با هم (متن، تست، تایپ، بیلد، آفلاین)\nnode ابزار/بررسی-کامل.mjs\n'

if (text.includes(OLD) && !text.includes('بررسی-کامل.mjs')) {
  text = text.replace(OLD, NEW)
  console.log('✓ بررسی-کامل ثبت شد')
}

writeFileSync(path, text, 'utf8')