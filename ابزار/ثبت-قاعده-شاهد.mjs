/**
 * ثبتِ قاعدهٔ «نشانی لازم است» در استاندارد نگارش
 *
 * جایگزینِ دقیق‌ترِ قاعدهٔ قبلی: «هر شناسه را باز کن» خوب است، ولی کامل
 * نیست. بعضی خروجی‌ها اصلاً نشانی ندارند و از همان اول باید رد شوند.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const path = join(here, '..', 'محتوا', 'استاندارد-نگارش.md')

let text = readFileSync(path, 'utf8')

const ANCHOR = '3. ⚠️ **اگر فرمولی همراهِ ارجاع آمد، قرمزترین حالت است.** فرمول باید از'
const RULE = [
  '3. ⭐ **بی‌نشانی = بی‌شاهد.** اگر خروجی هیچ URL یا DOI یا شمارهٔ صفحه‌ای',
  '   ندارد، از همان اول ردش کن. چهار راستی‌آزماییِ این پروژه، هر چهار بار،',
  '   ابزار جست‌وجو همین کار را کرد — از جمله یک بار با **فهرست مطالبِ',
  '   ساختگی**، که دقیقاً همان چیزی بود که برای باور کردن لازم است.',
  '4. ⚠️ **اگر فرمولی همراهِ ارجاع آمد، قرمزترین حالت است.** فرمول باید از',
].join('\n')

if (text.includes(ANCHOR) && !text.includes('بی‌نشانی')) {
  text = text.replace(ANCHOR, RULE)
  console.log('✓ قاعدهٔ «بی‌نشانی» اضافه شد و شماره‌ها اصلاح شدند')
} else {
  console.log('· از قبل هست')
}

writeFileSync(path, text, 'utf8')