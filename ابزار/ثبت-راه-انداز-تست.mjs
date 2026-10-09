/**
 * ثبتِ راه‌انداز و تستِ نحو در «استاندارد-نگارش»
 *
 * چرا اسکریپت؟ متن فارسیِ بلند در ابزارهای ویرایش می‌شکند.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const path = join(here, '..', 'محتوا', 'استاندارد-نگارش.md')

let text = readFileSync(path, 'utf8')

// ── ۱) دستور اجرای تست‌ها: باید از راه‌انداز رد شود ──
const OLD = '# کل مجموعه‌ی تست‌ها\nnode --test ابزار/*.test.mjs\n'
const NEW = '# کل مجموعه‌ی تست‌ها (با پرچم‌های لازم)\nnode ابزار/همه-تست.mjs\n'

if (text.includes(OLD)) {
  text = text.replace(OLD, NEW)
  console.log('✓ دستور اجرای تست به راه‌انداز تغییر کرد')
} else if (text.includes('همه-تست.mjs')) {
  console.log('· دستور اجرا از قبل درست است')
} else {
  console.log('✗ دستور اجرای تست پیدا نشد')
  process.exitCode = 1
}

// ── ۲) ردیفِ هفتمِ جدولِ تست‌ها ──
const ROW = '| `آزمایش-چیدمان` |'
if (text.includes(ROW) && !text.includes('آزمایش-نحو')) {
  const at = text.indexOf(ROW)
  const end = text.indexOf('\n', at) + 1
  text =
    text.slice(0, end) +
    '| `آزمایش-نحو` | هیچ فایل تستی خراب نیست — تستِ خراب، بقیه را بی‌سروصدا حذف می‌کند |\n' +
    text.slice(end)
  console.log('✓ ردیفِ نحو اضافه شد')
}

if (text.includes('### شش تستِ ساختاری')) {
  text = text.replace('### شش تستِ ساختاری', '### هفت تستِ ساختاری')
  console.log('✓ تیتر به «هفت تست» تغییر کرد')
}

// ── ۳) توضیحِ راه‌انداز ──
const ANCHOR = '### آفلاین بودن'
const NOTE = [
  '### چرا تست‌ها با راه‌انداز اجرا می‌شوند؟',
  '',
  '`آزمایش-نحو` برای سنجیدنِ نحوِ بقیه‌ی فایل‌ها به `vm.SourceTextModule` نیاز',
  'دارد، و آن در Node پشت `--experimental-vm-modules` است. `همه-تست.mjs`',
  'همان پرچم را می‌گذارد و بعد `node --test` را صدا می‌زند.',
  '',
  '⚠️ اگر با `node --test ابزار/*.test.mjs` اجرا کنی، آن یک تست «پرچم فعال',
  'است» قرمز می‌شود — نه به‌خاطر خرابیِ کد، بلکه چون راهِ اجرا اشتباه است.',
  '',
].join('\n')

if (text.includes(ANCHOR) && !text.includes('چرا تست‌ها با راه‌انداز')) {
  text = text.replace(ANCHOR, NOTE + ANCHOR)
  console.log('✓ توضیحِ راه‌انداز اضافه شد')
}

writeFileSync(path, text, 'utf8')