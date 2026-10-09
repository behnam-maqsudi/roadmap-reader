/**
 * ثبتِ نتیجهٔ نهاییِ راستی‌آزماییِ کیش
 *
 * نتیجه: روایتِ کیش هیچ سندی ندارد. پس کلِ داستان حذف شد، نه اینکه با روایتِ
 * دیگری عوض شود.
 *
 * چرا با شمارهٔ بند؟ چون ادغامِ قبلی تورفتگیِ بندِ ۲ را جابه‌جا کرده بود و
 * الگوی متنیِ دقیق پیدا نمی‌شد. شماره‌گذاری لنگرِ پایداری است.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const note = join(here, 'یادداشت-بررسی-حافظه.md')

let text = readFileSync(note, 'utf8')
const lines = text.split('\n')

// از «## تصمیم» تا تیترِ بعدی را پیدا می‌کنیم
const start = lines.findIndex((l) => l.trim() === '## تصمیم')
if (start < 0) {
  console.log('✗ بخشِ «تصمیم» پیدا نشد')
  process.exit(1)
}
let end = start + 1
while (end < lines.length && !/^#{1,6}\s/.test(lines[end])) end += 1

const REPLACEMENT = [
  '## تصمیم',
  '',
  'دو کار انجام شد:',
  '',
  '1. **پاراگرافِ فنی سند گرفت** — نقلِ Roediger & Karpicke (۲۰۰۶) از رودیجر',
  '   و کارپیکه به آن اضافه شد. این کار قطعی است.',
  '2. **داستانِ بی‌سند حذف شد.** جایگزینی ننوشتیم.',
  '',
  '   برای جایگزینی، روایتِ «مدرسهٔ کیش با پروژهٔ سه‌بعدیِ جزیره» نوشته شد',
  '   و به راستی‌آزمایی سپرده شد. نتیجه: **هیچ سندی وجود ندارد** — نه مقالهٔ',
  '   داوری‌شده، نه گزارشِ وزارت‌آموزش، نه حتی یک خبر. تنها یک نقلِ شفاهیِ',
  '   بی‌منبع بود.',
  '',
  '   پس دو روایتِ بی‌سند داشتیم و هر دو می‌رفتند سرِ جای هم. به‌جای اینکه یکی',
  '   را با دیگری عوض کنیم، **کلِ داستان را برداشتیم** و جایش همان پاراگرافِ',
  '   سنددار ماند.',
  '',
].join('\n')

const out = [
  ...lines.slice(0, start),
  ...REPLACEMENT.split('\n'),
  ...lines.slice(end),
].join('\n')

writeFileSync(note, out, 'utf8')
console.log('✓ بخشِ «تصمیم» بازنویسی شد')