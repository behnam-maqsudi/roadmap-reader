/**
 * شیم-گلوب.mjs — جایگزینِ import.meta.glob برای esbuild
 *
 * ⭐ چرا این فایل هست؟
 *
 * `import.meta.glob('../فازها/*.md', { query: '?raw' })` یک ویژگیِ Vite است:
 * در زمانِ بیلد، Vite فایل‌ها را پیدا می‌کند و محتوایشان را داخل باندل
 * می‌گذارد. esbuild این را نمی‌شناسد، پس باندل می‌سازد ولی موقع اجرا
 * می‌میرد با: «TypeError: (intermediate value).glob is not a function».
 *
 * این شیم همان شکلِ برگشتی را می‌سازد — یک شیء از «مسیر» به «تابعی که
 * محتوا را برمی‌گرداند» — ولی از دیسک می‌خواند، نه از باندل. برای تست کافی
 * است؛ برای پروداکشن، Vite خودش کار را درست انجام می‌دهد.
 *
 * ⚠️ این فایل فقط ابزارِ تست است. هیچ‌وقت وارد src/ نشود.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

/**
 * ⭐ الگوهای glob در Vite نسبت به **ماژولی که صداش می‌زند** معنا می‌شوند،
 * نه نسبت به ریشه‌ی پروژه. src/docs.ts می‌گوید '../فازها/*.md' — یعنی
 * از src/ یک پله بالا → ریشه → فازها/.
 *
 * resolve(root, '../فازها') ما را از پروژه بیرون می‌برد؛ باید از src/ حساب شود.
 */
const baseDir = join(root, 'src')

/** تبدیل «الگوی گلوب» به regex. فقط `*` را می‌فهمد — که برای این پروژه کافی است. */
function globToRegExp(pattern) {
  const escaped = pattern
    .split('*')
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('[^/]*')
  return new RegExp(`^${escaped}$`)
}

/**
 * @param {string[]} patterns الگوها، نسبی به ریشه‌ی پروژه
 * @param {{query?: string}} options
 * @returns {Record<string, () => Promise<string>>}
 */
export function __globShim(patterns, options = {}) {
  const list = Array.isArray(patterns) ? patterns : [patterns]
  const found = new Map()

  for (const pattern of list) {
    const re = globToRegExp(pattern)

    // ⚠️ کلیدها باید دقیقاً مثل Vite باشند: «../فازها/...» — نه «/فازها/...».
    // docs.ts روی همین شکل مسیر می‌خواند، پس اگر کلید عوض شود فایل‌ها
    // گم می‌شوند و اپ روی «در حال بارگذاری…» می‌ماند.
    const starIndex = pattern.indexOf('*')
    const dirPart =
      starIndex < 0
        ? dirname(pattern)
        : pattern.slice(0, starIndex).replace(/[/\\][^/\\]*$/, '')
    const absDir = resolve(baseDir, dirPart)

    let entries
    try {
      entries = readdirSync(absDir, { withFileTypes: true })
    } catch {
      continue // پوشه نیست یا وجود ندارد
    }

    for (const entry of entries) {
      if (!entry.isFile()) continue

      const rel = dirPart + '/' + entry.name
      if (!re.test(rel)) continue
      if (found.has(rel)) continue

      const abs = resolve(baseDir, rel)
      if (options.query === '?raw') {
        found.set(rel, async () => readFileSync(abs, 'utf8'))
      } else {
        // بدون ?raw، esbuild فایل را به‌عنوان ماژول می‌آورد — ولی ما
        // نمی‌توانیم ماژولِ ناشناخته را dynamic import کنیم. برای JSON
        // کافی است و برای بقیه یک پوسته می‌دهیم.
        found.set(rel, async () => {
          try {
            return JSON.parse(readFileSync(abs, 'utf8'))
          } catch {
            return { default: readFileSync(abs, 'utf8') }
          }
        })
      }
    }
  }

  return Object.fromEntries(found)
}