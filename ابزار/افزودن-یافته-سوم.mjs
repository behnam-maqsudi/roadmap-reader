/**
 * افزودنِ یافته‌های گزارشِ سوم به یادداشتِ بررسیِ حافظه
 *
 * گزارشِ سوم دو چیزِ تازه آورد:
 *   ۱) یک ارجاعِ **ساختگی** از ابزار جست‌وجوی وب (→ یادداشتِ جداگانه)
 *   ۲) جمله‌ای **تأییدشده** از Roediger & Karpicke 2006 که دقیقاً ادعای
 *      متنِ ما را می‌گوید — پس به‌جای پاراگرافِ بی‌سند نشست
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const path = join(here, '..', 'ابزار', 'یادداشت-بررسی-حافظه.md')

let text = readFileSync(path, 'utf8')

const ANCHOR = '## تصمیم'
const ADD = [
  '## ✅ جملهٔ تأییدشده‌ای که پیدا شد',
  '',
  'گزارشِ سوم یک نقلِ دقیق و قابل بررسی آورد — از Roediger & Karpicke (۲۰۰۶):',
  '',
  '> "prior testing produced substantially greater retention than studying"',
  '> "Testing is a powerful means of improving learning, not just assessing it."',
  '',
  'این دقیقاً ادعای پاراگرافِ فنیِ ماست، ولی این‌بار **سند دارد**. پس آن',
  'پاراگرفت تقویت شد و نقل به متن اضافه شد.',
  '',
  '⚠️ ضمناً: گزارش تأیید کرد مقاله‌ای به نام **«کپل و آندرسون ۱۹۵۹»** دربارهٔ',
  'همین موضوع **اصلاً وجود ندارد** (فهرستِ کاملِ آن شمارهٔ JEP در سال ۱۹۵۹ آن را',
  'ندارد). پس به آن ارجاع نمی‌دهیم — ارجاع‌های قدیمیِ این حوزه پر از اسم‌های',
  'غلط‌اند.',
  '',
].join('\n')

if (text.includes(ANCHOR) && !text.includes('Roediger & Karpicke')) {
  text = text.replace(ANCHOR, ADD + ANCHOR)
  console.log('✓ یافتهٔ گزارشِ سوم اضافه شد')
} else {
  console.log('· از قبل هست')
}

writeFileSync(path, text, 'utf8')