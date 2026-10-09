/**
 * ادغامِ دو بندِ تکراری در یادداشتِ بررسیِ حافظه
 *
 * بندِ ۲ و پاراگرافِ «⚠️ اما این روایت…» هر دو یک چیز می‌گفتند. یکی شد.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const path = join(here, '..', 'ابزار', 'یادداشت-بررسی-حافظه.md')

const DUP = [
  '',
  '⚠️ **اما این روایت هنوز راستی‌آزمایی نشده.** گزارشِ مدرسه‌ی کیش با داستانِ',
  '«هیچ تکراری نداشت / بدترین نمرهٔ فارسی» کل پروژهٔ جزیره بررسی شد و به',
  'عاملی سپرده شد. تا وقتی نتیجه نیاید، `ابزار/اصلاح-داستان-راهنما.mjs`',
  '**اجرا نشده** — چون جایگزینی با یک ادعای تأییدنشده، فقط یک روایتِ ساختگی',
  'را با روایتِ ساختگیِ دیگری عوض می‌کند.',
].join('\n')

const MERGED = [
  '',
  '   جایگزینی با یک ادعای تأییدنشده، فقط یک روایتِ ساختگی را با روایتِ',
  '   ساختگیِ دیگری عوض می‌کند — پس صبر کردیم تا **خودِ جایگزین** تأیید شود.',
  '   گزارشِ مدرسهٔ کیش با پروژهٔ «جزیره» برای همین به راستی‌آزمایی سپرده شد.',
].join('\n')

let text = readFileSync(path, 'utf8')

if (text.includes(MERGED)) {
  console.log('· از قبل ادغام شده')
} else if (!text.includes(DUP)) {
  console.log('✗ بندِ تکراری پیدا نشد')
  process.exitCode = 1
} else {
  text = text.replace(DUP, MERGED)
  writeFileSync(path, text, 'utf8')
  console.log('✓ دو بندِ تکراری ادغام شد')
}