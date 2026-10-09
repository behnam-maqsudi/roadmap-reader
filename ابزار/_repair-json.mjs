/**
 * _repair-json.mjs — ترمیمِ مکانیکیِ `فاز-۰۲.json`.
 *
 * رشته‌ی `solution` وسطِ کار شکسته بود: خط ۱۶۱ با `",` بسته شده بود و ادامه‌ی
 * متن در خط ۱۶۲ بیرون از رشته افتاده بود. این اسکریپت آن دو خط را به یک
 * رشته‌ی معتبر برمی‌گرداند و خط‌های جدیدِ خامِ داخلِ رشته‌ها را escape می‌کند.
 *
 * به متنِ فارسی دست نمی‌زند. بعد از اجرا باید حذف شود.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const path = join(process.cwd(), 'محتوا', 'پرسش-v2', 'فاز-۰۲.json')

const lines = readFileSync(path, 'utf8').split('\n')
const A = 160 // خطِ ۱۶۱ (صفر-پایه ۱۶۰)
const B = 161 // خطِ ۱۶۲ (صفر-پایه ۱۶۱)

if (!lines[A]?.includes('"solution"') || !lines[A].endsWith('",')) {
  throw new Error(`خط ${A + 1} آن‌طور که انتظار می‌رفت نیست`)
}
if (!lines[B]?.trimStart().startsWith('\\n')) {
  throw new Error(`خط ${B + 1} آن‌طور که انتظار می‌رفت نیست`)
}

/*
 * قیسهٔ پایانیِ خطِ اول («,») را بردار و خطِ دوم را که خودش با
 * backslash-n شروع می‌شود، بدون افزودنِ دوبارهٔ \n بچسبان.
 */
lines[A] = lines[A].slice(0, -2) + lines[B].trimStart()
lines.splice(B, 1)

/** خطِ جدیدِ خام داخلِ رشته → backslash-n */
function escapeRawNewlinesInStrings(text) {
  let out = ''
  let inStr = false
  let escaped = false
  for (const ch of text) {
    if (inStr && ch === '\n' && !escaped) {
      out += '\\n'
      continue
    }
    out += ch
    if (inStr) {
      if (escaped) escaped = false
      else if (ch === '\\') escaped = true
      else if (ch === '"') inStr = false
    } else if (ch === '"') {
      inStr = true
    }
  }
  return out
}

const after = escapeRawNewlinesInStrings(lines.join('\n'))
JSON.parse(after)
writeFileSync(path, after, 'utf8')
console.log('OK   فاز-۰۲.json ترمیم شد')
