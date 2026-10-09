/**
 * «سه قانون» ← «چهار قانون»
 *
 * قانونِ «بی‌نشانی» اضافه شد، ولی جملهٔ بالای لیست هنوز سه می‌گفت.
 * این تیپ ناسازگاری دقیقاً همان چیزی است که استاندارد خودش می‌گوید نباید
 * بماند: «شمارنده‌ای که با محتوا نمی‌خواند».
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const path = join(here, '..', 'محتوا', 'استاندارد-نگارش.md')

const OLD = 'پس سه قانون برای هر ارجاعی که از جست‌وجو می‌آید:'
const NEW = 'پس چهار قانون برای هر ارجاعی که از جست‌وجو می‌آید:'

let text = readFileSync(path, 'utf8')

if (text.includes(NEW)) {
  console.log('✓ قبلاً اصلاح شده')
} else if (!text.includes(OLD)) {
  console.log('✗ جمله پیدا نشد')
  process.exitCode = 1
} else {
  text = text.replace(OLD, NEW)
  writeFileSync(path, text, 'utf8')
  console.log('✓ «سه قانون» به «چهار قانون» تغییر کرد')
}