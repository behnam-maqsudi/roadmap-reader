/**
 * رفعِ دو غلط در جدولِ تست‌ها
 *
 * ۱) «نبار» → «نوار» (غلط املایی خودم در جدولِ تازه)
 * ۲) «سه گروه» → «چهار گروه» — چون فهرست کنار صفحه حالا چهار گروه دارد:
 *    راهنما، سرتیترهای فازِ باز، فازها، مرجع. عددِ سه از نسخه‌ی قبل مانده بود.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const path = join(here, '..', 'محتوا', 'استاندارد-نگارش.md')

let text = readFileSync(path, 'utf8')

const swaps = [
  ['سرتیتر زیرِ نبار گم نمی‌شود', 'سرتیتر زیرِ نوار گم نمی‌شود', 'نبار → نوار'],
  [
    'فهرستِ کنار صفحه سه گروه دارد، شماره‌ی فازها ۰ تا ۱۳ است',
    'فهرستِ کنار صفحه چهار گروه دارد، شماره‌ی فازها ۰ تا ۱۳ است',
    'سه گروه → چهار گروه',
  ],
]

for (const [from, to, label] of swaps) {
  if (!text.includes(from)) {
    console.log('· یافت نشد (شاید قبلاً درست شده) —', label)
    continue
  }
  text = text.split(from).join(to)
  console.log('✓ اصلاح شد —', label)
}

writeFileSync(path, text, 'utf8')