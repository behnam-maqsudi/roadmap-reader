/**
 * رفعِ چسبِ تیتر و بلوک کد در «استاندارد-نگارش»
 *
 * اسکریپت قبلی متن را *قبل* از تیترِ «اسکریپت بازبینی» چسباند، پس خودِ
 * تیتر به تیترِ بعدی قوز شد؛ و دستورِ تستِ داستان هنوز تهِ بلوک کد مانده بود.
 * اینجا هر دو را درست می‌کنیم.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const path = join(here, '..', 'محتوا', 'استاندارد-نگارش.md')

let text = readFileSync(path, 'utf8')

// ── ۱) تیترِ چسبیده را آزاد می‌کنیم ──
const GLUED = '## اسکریپت بازبینی## فایل راهنما'
if (text.includes(GLUED)) {
  text = text.replace(GLUED, '## فایل راهنما')
  console.log('✓ تیترِ «اسکریپت بازبینی» از تیترِ بعدی جدا شد')
} else {
  console.log('· تیترها از قبل جدا بودند')
}

// ── ۲) تیترِ «اسکریپت بازبینی» را سرِ جایش، جلوی بلوک کد، می‌گذاریم ──
const CODE_OPEN = '```bash\n# یک‌جا: حروف سالم'
if (!text.includes('## اسکریپت بازبینی')) {
  if (!text.includes(CODE_OPEN)) {
    console.log('✗ بلوک کد پیدا نشد')
    process.exitCode = 1
  } else {
    text = text.replace(CODE_OPEN, '## اسکریپت بازبینی\n\n' + CODE_OPEN)
    console.log('✓ تیترِ «اسکریپت بازبینی» برگشت سرِ جایش')
  }
}

// ── ۳) دستورِ کهنه‌ی تستِ داستان را از بلوک کد بیرون می‌بریم ──
const STALE = '# رندرر روی محتوای واقعی (بلوک داستان درست تشخیص داده می‌شود؟)\nnode --test ابزار/آزمایش-داستان.test.mjs ابزار/آزمایش-رندر-داستان.test.mjs\n'
if (text.includes(STALE)) {
  text = text.replace(STALE, '')
  console.log('✓ دستورِ کهنه از بلوک کد حذف شد')
}

writeFileSync(path, text, 'utf8')