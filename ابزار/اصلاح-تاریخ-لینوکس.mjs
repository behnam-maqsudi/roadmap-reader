/**
 * اصلاح تاریخِ لینوکس در فاز ۰۰
 *
 * چرا اسکریپت؟ متنِ فارسیِ بلند در ابزار ویرایش خطا می‌دهد (نویسه‌ها می‌شکنند).
 * این اسکریپت با متنِ کوتاه کار می‌کند، پس دقیق و قابل تکرار است.
 *
 * منبع: جدول نسخه‌های لینوکس (Wikipedia) — ۰.۰۱ در ۱۷ سپتامبر ۱۹۹۱،
 * و ۱.۰ در ۱۴ مارس ۱۹۹۴.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const path = join(here, '..', 'فازها', 'فاز-۰۰-پایه‌های-سیستم-و-لینوکس.md')

const OLD = '> سال ۱۹۹۴ نسخه‌ی ۱.۰ آن درآمد.'
const NEW =
  '> نسخه‌ی ۰.۰۱ آن سپتامبر ۱۹۹۱ بیرون آمد، و نسخه‌ی ۱.۰ در مارس ۱۹۹۴.'

let text = readFileSync(path, 'utf8')

if (!text.includes(OLD)) {
  console.log('✓ قبلاً اصلاح شده — دست نمی‌زنم')
} else {
  text = text.replace(OLD, NEW)
  writeFileSync(path, text, 'utf8')
  console.log('✓ تاریخِ لینوکس اصلاح شد: ۰.۰۱ سپتامبر ۱۹۹۱، ۱.۰ مارس ۱۹۹۴')
}
