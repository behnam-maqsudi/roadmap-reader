/**
 * برگرداندنِ بلوک‌های کد
 *
 * اسکریپتِ قبلی («رفع-فاصله-تیترها») لزوم را نمی‌دانست و داخل بلوکِ کد هم
 * خط خالی گذاشت. نتیجه: نمونه‌های `markdown` یک خطِ اضافه اولشان داشتند.
 * اینجا برمی‌گردانیم — و این بار فقط داخل بلوکِ کد دست می‌زنیم.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const path = join(here, '..', 'محتوا', 'استاندارد-نگارش.md')

const lines = readFileSync(path, 'utf8').split('\n')

let inFence = false
const fixed = []
let removed = 0

for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i]

  if (line.startsWith('```')) {
    // تازه داخل بلوک کد شدیم: اگر بلافاصله قبلش یک خط خالیِ اضافه است، حذفش
    if (line.startsWith('```markdown') && fixed[fixed.length - 1] === '') {
      // ولی فقط اگر خطِ خالی *قبل* از باز شدن بلوک اضافه شده بود
      const afterFence = lines[i + 1]
      if (afterFence === '' && /^#{1,6}\s/.test(lines[i + 2] ?? '')) {
        i += 1 // آن خط خالیِ اضافه را رد کن
        removed += 1
      }
    }
    inFence = !inFence
  }

  fixed.push(line)
}

const out = fixed.join('\n')

if (out !== lines.join('\n')) {
  writeFileSync(path, out, 'utf8')
  console.log(`✓ ${removed} خطِ اضافه از داخل بلوک کد حذف شد`)
} else {
  console.log('· بلوک‌های کد از قبل درست بودند')
}

// ⭐ و حالا خودِ اسکریپتِ قبلی را اصلاح می‌کنیم تا دوباره این کار را نکند
const buggy = join(here, 'رفع-فاصله-تیترها.mjs')
const buggySrc = readFileSync(buggy, 'utf8')
if (!buggySrc.includes('inFence')) {
  writeFileSync(
    buggy,
    buggySrc.replace(
      "  const isHeading = /^#{1,6}\\s/.test(line)",
      [
        "  // ⚠️ داخل بلوکِ کد، «تیتر» فقط نمونه است — به آن دست نمی‌زنیم",
        "  if (line.startsWith('```')) inFence = !inFence",
        "  const isHeading = !inFence && /^#{1,6}\\s/.test(line)",
      ].join('\n'),
    ).replace(
      'const lines = text.split(\'\\n\')',
      "const lines = text.split('\\n')\nlet inFence = false",
    ),
    'utf8',
  )
  console.log('✓ اسکریپتِ «رفع-فاصله-تیترها» هم اصلاح شد (بلوک کد را رد می‌کند)')
} else {
  console.log('· اسکریپت از قبل درست بود')
}