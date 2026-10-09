/**
 * content.ts — بارگذاریِ محتوای نسخهٔ ۲
 *
 * ⭐⭐ قاعدهٔ مهم: نسخهٔ ۲ **متنِ درس را از نسخهٔ ۱ قرض می‌گیرد**
 *
 * فایل‌های `فازها/*.md` هرگز کپی نمی‌شوند. این ماژول `loadDocs` را از
 * `../docs` **import** می‌کند و فقط می‌خواندش. یعنی:
 *
 *   - یک نسخه از هر درس روی دیسک هست، پس متن هرگز بین دو نسخه اختلاف پیدا
 *     نمی‌کند. اگر فردا درسی را ویرایش کنی، **هر دو** نسخه با هم عوض می‌شوند.
 *   - اگر بعداً فازی به `فازها/` اضافه شود، بی‌درنگ در نسخهٔ ۲ هم ظاهر می‌شود.
 *
 * ⚠️ چرا `import.meta.glob` داخل `../docs.ts` هنوز کار می‌کند؟
 * چون الگوی `../فازها/*.md` **نسبت به فایلی حل می‌شود که داخلش نوشته
 * شده**، نه نسبت به جایی که import می‌شود. `src/docs.ts` سرِ جایش مانده،
 * پس مسیر از آن به ریشهٔ پروژه درست می‌ماند — دقیقاً مثل قبل.
 */

import { loadDocs as loadV1Docs } from '../docs'
import type { Doc } from '../types'
import type { InteractiveContent } from './types'

/** همان اسنادِ نسخهٔ ۱، بدون دست‌زدن به فایلش. */
export function loadDocs(): Promise<Doc[]> {
  return loadV1Docs()
}

/**
 * ⭐ پرسش‌های تعاملی، از پوشهٔ خودِ نسخهٔ ۲.
 *
 * عمداً در پوشهٔ جدا (`محتوا/پرسش-v2/`) هستند، نه کنار `محتوا/فازها/`:
 * آن پوشه مالِ نسخهٔ ۱ است و ساختارش (`cards`/`exercises`) با این فرق دارد.
 * مخلوط‌کردنشان یعنی هر دو نسخه به هم وابسته می‌شوند.
 *
 * ?raw و import:default یعنی JSON به‌صورت ماژولِ باندل می‌آید، نه با fetch —
 * پس آفلاین کار می‌کند، دقیقاً مثل بقیهٔ پروژه.
 */
const questionModules = import.meta.glob('../../محتوا/پرسش-v2/*.json', {
  import: 'default',
}) as Record<string, () => Promise<InteractiveContent>>

/**
 * ⭐ تبدیلِ شمارهٔ لاتینِ فاز به رقمِ فارسی، برای تطبیقِ نامِ فایل.
 * (`فاز-۰۰.json` در نسخهٔ ۱ همین کار را می‌کرد.)
 */
const PERSIAN: Record<string, string> = {
  '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
  '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
}

function toPersianDigits(s: string): string {
  return s.replace(/\d/g, (d) => PERSIAN[d] ?? d)
}

/**
 * پرسش‌های یک فاز را می‌دهد. اگر فازی هنوز پرسشی نداشته باشد،
 * آرایهٔ خالی می‌گیرد — اپ نباید به‌خاطرِ این بشکند.
 */
export async function questionsFor(num: number): Promise<InteractiveContent> {
  const key = `فاز-${toPersianDigits(String(num).padStart(2, '0'))}`
  const load = questionModules[`../../محتوا/پرسش-v2/${key}.json`]

  if (!load) return { num, questions: [] }

  const raw = await load()
  return { num, questions: raw.questions ?? [] }
}

/** همهٔ پرسش‌ها، یک‌جا — برای شمردن در فهرست. */
export async function loadAllQuestions(
  docs: Doc[],
): Promise<Map<number, InteractiveContent>> {
  // فقط فازها واقعاً پرسش دارند؛ راهنما و نمایه شمارهٔ منفی/۹۹۹ دارند.
  const phases = docs.filter((d) => d.kind === 'phase' && d.num >= 0)
  const entries = await Promise.all(
    phases.map(async (d) => [d.num, await questionsFor(d.num)] as const),
  )
  return new Map(entries)
}