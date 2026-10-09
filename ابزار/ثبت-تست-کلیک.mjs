/**
 * ثبتِ «آزمایش-کلیک-واقعی» در «استاندارد-نگارش»
 *
 * چرا اسکریپت؟ متن فارسیِ بلند در ابزارهای ویرایش می‌شکند.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const path = join(here, '..', 'محتوا', 'استاندارد-نگارش.md')

let text = readFileSync(path, 'utf8')

// ── ۱) جدول چهارتایی، پنج‌تایی می‌شود ──
const ROW =
  '| `آزمایش-رندر-واقعی` | `id` واقعاً روی `<h1>/<h2>/<h3>` می‌نشیند |'
if (text.includes(ROW) && !text.includes('آزمایش-کلیک-واقعی')) {
  text = text.replace(
    ROW,
    [
      ROW,
      '| `آزمایش-کلیک-واقعی` | هر لینکِ فهرست، یک عنصرِ واقعی دارد — خطای لنگر خاموش نمی‌شود |',
    ].join('\n'),
  )
  console.log('✓ ردیفِ پنجم به جدول اضافه شد')
} else {
  console.log('· جدول از قبل کامل است')
}

if (
  text.includes('### چهار تستِ ساختاری') &&
  !text.includes('### پنج تستِ ساختاری')
) {
  text = text.replace('### چهار تستِ ساختاری', '### پنج تستِ ساختاری')
  console.log('✓ تیترِ «چهار تست» به «پنج تست» تغییر کرد')
}

writeFileSync(path, text, 'utf8')