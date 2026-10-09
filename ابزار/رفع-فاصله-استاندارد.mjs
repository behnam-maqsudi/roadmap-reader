/**
 * یک خطِ خالی بین دو تیترِ Markdown
 *
 * اسکریپت قبلی بلوک را طوری چسباند که «### آفلاین بودن» بی‌فاصله به پاراگرافِ
 * قبل چسبید. Markdown این را هنوز تیتر می‌خواند، ولی استانداردِ خودمان
 * فاصله می‌خواهد.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const path = join(here, '..', 'محتوا', 'استاندارد-نگارش.md')

let text = readFileSync(path, 'utf8')

const GLUED = 'راهِ اجرا اشتباه است.\n### آفلاین بودن'
if (text.includes(GLUED)) {
  text = text.replace(GLUED, 'راهِ اجرا اشتباه است.\n\n### آفلاین بودن')
  console.log('✓ فاصله‌ی تیترها درست شد')
} else {
  console.log('· تیترها از جدا بودند')
}

writeFileSync(path, text, 'utf8')