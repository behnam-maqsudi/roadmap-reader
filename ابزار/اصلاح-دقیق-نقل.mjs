/**
 * اصلاحِ یک کلمه: «عدد نشان می‌دهد» ← «پژوهش نشان می‌دهد»
 *
 * پاراگراف می‌گفت «پژوهش این را عدد نشان می‌دهد» و بعد یک نقلِ کیفی می‌آورد.
 * آن نقل (Roediger & Karpicke 2006) خودش عددی ندارد — می‌گوید «به‌مراتب
 * بیشتر»، نه «چند برابر». پس «عدد» وعدهٔ چیزی را می‌داد که در متن نبود.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const path = join(here, '..', 'فازها', '۰۰-راهنمای-شروع.md')

const OLD = 'پژوهش این را عدد نشان می‌دهد: رودیجر و کارپیکه (۲۰۰۶) نوشتند'
const NEW = 'پژوهش این را نشان می‌دهد: رودیجر و کارپیکه (۲۰۰۶) نوشتند'

let text = readFileSync(path, 'utf8')

if (text.includes(NEW)) {
  console.log('✓ قبلاً اصلاح شده')
} else if (!text.includes(OLD)) {
  console.log('✗ جمله پیدا نشد')
  process.exitCode = 1
} else {
  text = text.replace(OLD, NEW)
  writeFileSync(path, text, 'utf8')
  console.log('✓ «عدد» حذف شد — آن نقل کیفی است نه کمّی')
}