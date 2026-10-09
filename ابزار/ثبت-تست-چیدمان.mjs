/**
 * ثبتِ «آزمایش-چیدمان» در «استاندارد-نگارش»
 *
 * چرا اسکریپت؟ متن فارسیِ بلند در ابزارهای ویرایش می‌شکند.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const path = join(here, '..', 'محتوا', 'استاندارد-نگارش.md')

let text = readFileSync(path, 'utf8')

// ── ۱) جدول تست‌ها: ردیفِ ششم و تیترِ «پنج» به «شش» ──
const ROW =
  '| `آزمایش-کلیک-واقعی` | هر لینکِ فهرست، یک عنصرِ واقعی دارد — خطای لنگر خاموش نمی‌شود |'
if (text.includes(ROW) && !text.includes('آزمایش-چیدمان')) {
  text = text.replace(
    ROW,
    [
      ROW,
      '| `آزمایش-چیدمان` | فهرست بالای فازهاست، عنوان‌ها «…» نمی‌شوند، سرتیتر زیرِ نبار گم نمی‌شود |',
    ].join('\n'),
  )
  console.log('✓ ردیفِ چیدمان اضافه شد')
}

if (
  text.includes('### پنج تستِ ساختاری') &&
  !text.includes('### شش تستِ ساختاری')
) {
  text = text.replace('### پنج تستِ ساختاری', '### شش تستِ ساختاری')
  console.log('✓ تیتر به «شش تست» تغییر کرد')
}

writeFileSync(path, text, 'utf8')