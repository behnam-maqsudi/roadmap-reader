/**
 * آزمایش-استاندارد.test.mjs — آیا خودِ استاندارد، استاندارد است؟
 *
 * ⭐ چرا این تست هست؟
 *
 * استانداردِ نگارش یک سندِ زنده است که خودم مدام به آن اضافه می‌کنم. و
 * هر بار که اضافه کرده‌ام، یک دسته اشتباهِ تازه ساخته‌ام:
 *
 *   · شماره‌ی بندها با محتوا نخواند («سه قانون» با چهار بند)
 *   · تیترها به هم چسبیدند
 *   · یک تست، خودش را دوبار اجرا کرد
 *
 * این‌ها کوچک‌اند ولی در یک سندِ مرجع، کوچک‌بودن دلیلِ تحمل‌کردن نیست.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const path = join(root, 'محتوا', 'استاندارد-نگارش.md')
const text = readFileSync(path, 'utf8')

/**
 * عددِ فارسی را به عدد تبدیل می‌کند — هم رقم، هم کلمه.
 *
 * ⚠️ چرا هر دو؟ اول نسخه فقط رقم می‌فهمید، ولی متن «پس **چهار** قانون…»
 * و «**نه** تستِ ساختاری» می‌گوید — یعنی شمارنده‌ها کلمه‌اند. تستی که
 * شمارندهٔ کلمه‌ای را نمی‌بیند، عملاً هیچ بررسی نمی‌کند.
 */
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const FA_CLASS = '[' + FA_DIGITS + ']+'

const FA_WORDS = [
  'یک',
  'دو',
  'سه',
  'چهار',
  'پنج',
  'شش',
  'هفت',
  'هشت',
  'نه',
  'ده',
  'یازده',
  'دوازده',
]
const WORD_ALTERNATION = FA_WORDS.join('|')

function faToInt(s) {
  const word = s.trim()
  const byWord = FA_WORDS.indexOf(word)
  if (byWord >= 0) return byWord + 1

  let n = 0
  for (const c of word) {
    const d = FA_DIGITS.indexOf(c)
    if (d < 0) throw new Error(`«${s}» عددِ فارسی نیست`)
    n = n * 10 + d
  }
  return n
}

describe('استانداردِ نگارش — خودش سالم است؟', () => {
  it('شمارهٔ «N قانون» با تعداد بندها می‌خواند', () => {
    // بلوکِ قوانینِ ارجاع: «پس چهار قانون برای هر ارجاعی که از جست‌وجو می‌آید:»
    const m = text.match(new RegExp(`پس (${FA_CLASS}|${WORD_ALTERNATION}) قانون برای هر ارجاعی`))
    assert.ok(m, 'بلوکِ قوانینِ ارجاع پیدا نشد')

    const said = faToInt(m[1])

    // شمار بندهای ۱..n تا خطِ بعدیِ تیتر
    const from = text.indexOf(m[0])
    const to = text.indexOf('\n## ', from)
    const block = text.slice(from, to < 0 ? undefined : to)

    const items = [...block.matchAll(/^\d+\.\s/gm)].length
    assert.equal(items, said, `متن می‌گوید «${said} قانون» ولی ${items} بند دارد`)
  })

  it('هیچ تیتری به پاراگرافِ قبل نچسبیده', () => {
    const lines = text.split('\n')
    let inFence = false
    const glued = []

    for (let i = 0; i < lines.length; i += 1) {
      if (lines[i].startsWith('```')) inFence = !inFence
      if (inFence) continue

      const isHeading = /^#{1,6}\s/.test(lines[i])
      if (isHeading && i > 0 && lines[i - 1].trim() !== '') {
        glued.push(i + 1)
      }
    }

    assert.deepEqual(glued, [], `تیترِ چسبیده در خط ${glued.join(', ')}`)
  })

  it('تیترها شماره‌گذاریِ فهرستی را با واقعیت می‌خوانند', () => {
    // جدولِ تست‌ها باید همان تعداد ردیفِ آزمایشی را داشته باشد که تیتر می‌گوید
    const m = text.match(new RegExp(`### (${FA_CLASS}|${WORD_ALTERNATION}) تستِ ساختاری`))
    assert.ok(m, 'تیترِ جدولِ تست‌ها پیدا نشد')

    const said = faToInt(m[1])

    const from = text.indexOf(m[0])
    const to = text.indexOf('\n⭐ قاعده', from)
    const rows = [...text.slice(from, to).matchAll(/^\| `آزمایش-/gm)].length

    assert.equal(rows, said, `تیتر می‌گوید «${said} تست» ولی ${rows} ردیف دارد`)
  })

  it('هر ابزاری که در استاندارد نام برده شده، واقعاً وجود دارد', () => {
    const named = new Set()
    // ⚠️ الگوی اول حرف‌به‌حرف دنبال می‌کرد و چیزهایی مثل «Node.js» و
    // «tsconfig.js» را — که اصلاً ابزار نیستند — نامِ فایل فرض می‌کرد.
    // حالا فقط نام‌های داخلِ بک‌تیک با پسوند .mjs را می‌گیریم.
    for (const m of text.matchAll(/`([^`\n]+\.mjs)`/g)) {
      const name = m[1]
      if (name.includes('/') || name.includes('\\')) continue
      named.add(name)
    }

    const missing = [...named].filter((name) => {
      for (const dir of ['ابزار', 'src', 'محتوا']) {
        try {
          readFileSync(join(root, dir, name))
          return false
        } catch {
          /* پوشهٔ بعدی را امتحان کن */
        }
      }
      return true
    })

    assert.deepEqual(
      missing,
      [],
      `این‌ها در استاندارد آمده ولی فایلشان نیست: ${missing.join('، ')}`,
    )
  })

  it('بلوک‌های کد، بسته‌اند', () => {
    const fences = (text.match(/^```/gm) || []).length
    assert.equal(fences % 2, 0, `${fences} علامتِ کد — تعداد باید زوج باشد`)
  })
})