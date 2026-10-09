/**
 * آزمایش-کارت-v2.test.mjs — کارت‌های آموزشی همه‌جا کارت می‌شوند
 *
 * ⭐ چرا این تست هست؟
 *
 * ادعایِ `src/v2/callout.ts` این است که جدولِ `EMOJI_MAP` **همهٔ** ایموجی‌های
 * واقعیِ درس را پوشش می‌دهد. اگر ایموجیِ تازه‌ای اضافه شود و در جدول
 * نباشد، هیچ خطایی داده نمی‌شود — کارت بی‌سکوت به `plain` می‌افتد و دقیقاً
 * همان چیزی می‌شود که می‌خواستیم درست کنیم: متنِ خشک.
 *
 * پس این تست، ادعا را روی **خودِ فایل‌های درس** می‌آزماید، نه روی چند
 * نمونهٔ دستی.
 *
 * ⭐⭐ تفکیکِ کلیدی: نمودارِ متنی از نقل‌قول جدا است.
 *
 * پروبِ اول ۱۱۴ تا ⬇ شمرد و همه‌شان «ناشناخته» بودند — ولی ⬇ داخلِ
 * بلوک‌های ```text (نمودارهای جریان) است و **نقل‌قول نیست**. اگر این
 * تفکیک را نکنیم، تست یا بی‌دلیل شکست می‌خورد یا — بدتر — الگو را
 * طوری گشاد کنیم که نمودارها هم کارت شوند.
 *
 * اجرا:  node --experimental-vm-modules --test ابزار/آزمایش-کارت-v2.test.mjs
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const phaseDir = join(root, 'فازها')

/**
 * جدولِ کارت — عیناً از `src/v2/callout.ts`.
 *
 * این عمداً کپی است نه import: آن فایل TypeScript است و این تست با Node
 * خام اجرا می‌شود. اگر روزی جدول عوض شد، این کپی هم باید عوض شود — و
 * همین «عوض شدن» چیزی است که می‌خواهیم بیدارمان کند.
 */
const KNOWN = new Set([
  '🧒', // story
  '💡', // note
  '🔑', // key
  '⚠️', // warn
  '🔴', // danger
  '⛔', // trap
  '✅', // ok
  '❌', // bad
  '🎯', // goal
  '📌', // link
  '📖', // read
  '⚡', // note
  '🧪', // note
  '🔍', // note
])

const LEAD_EMOJI =
  /^[>]*\s*([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F000}-\u{1F0FF}][\u{FE0F}\u{20E3}]?)/u

/**
 * ایموجیِ ابتدایِ بلاک‌هایِ نقل‌قولِ واقعی، در همهٔ فایل‌های درس.
 *
 * دو چیز را رد می‌کنیم:
 *   ۱) محتوای داخلِ بلوک‌های ``` — چون ⬇ و | آنجا نمودارند، نه کارت
 *   ۲) ادامهٔ یک نقل‌قولِ قبلی — چون همان یک کارت است، نه چند تا
 */
function scanCallouts() {
  const found = new Map() // ایموجی → {count, sample}
  for (const f of readdirSync(phaseDir)) {
    if (!f.endsWith('.md')) continue
    let inFence = false
    let prevWasQuote = false
    const lines = readFileSync(join(phaseDir, f), 'utf8').split('\n')
    for (const [i, line] of lines.entries()) {
      if (/^\s*```/.test(line)) {
        inFence = !inFence
        prevWasQuote = false
        continue
      }
      if (inFence) continue

      const isQuote = /^\s*>/.test(line)
      const startsBlock = isQuote && !prevWasQuote
      prevWasQuote = isQuote
      if (!startsBlock) continue

      const m = line.match(LEAD_EMOJI)
      if (!m) continue

      const e = m[1]
      if (!found.has(e)) found.set(e, { count: 0, sample: `${f}:${i + 1}` })
      found.get(e).count += 1
    }
  }
  return found
}

const found = scanCallouts()

describe('کارت‌های آموزشیِ نسخهٔ ۲', () => {
  it('درس‌ها کارتِ آموزشی دارند (یعنی چیزی برای رندر کردن هست)', () => {
    const total = [...found.values()].reduce((s, x) => s + x.count, 0)
    assert.ok(
      total > 100,
      `فقط ${total} کارت پیدا شد — احتمالاً تشخیصِ نقل‌قول خراب است`,
    )
  })

  it('⭐ هیچ ایموجیِ کارت، ناشناخته نمانده است', () => {
    const unknown = [...found]
      .filter(([e]) => !KNOWN.has(e))
      .map(([e, x]) => `${e} (${x.count} بار، اولین: ${x.sample})`)

    assert.equal(
      unknown.length,
      0,
      `این ایموjی‌ها در EMOJI_MAP نیستند و بی‌صدا به plain می‌افتند:\n  ` +
        unknown.join('\n  '),
    )
  })

  it('پرکاربردترین کارت‌ها همان‌هایی هستند که متن می‌گوید', () => {
    // 🧒 (داستان) و 💡 (نکته) و 🔑 (قاعدهٔ کلیدی) باید سه تای اول باشند.
    // اگر ترتیب عوض شود، یعنی تشخیصِ «بلاکِ تازه» خراب شده.
    const top = [...found].sort((a, b) => b[1].count - a[1].count).slice(0, 3)
    assert.deepEqual(
      top.map(([e]) => e),
      ['🧒', '💡', '🔑'],
      `سه کارتِ پرتکرار تغییر کرده‌اند: ${top.map(([e, x]) => `${e}=${x.count}`).join(' ')}`,
    )
  })

  it('نمودارِ متنی، کارت نمی‌شود', () => {
    // ⬇ فقط داخلِ نمودارهای ```text است. اگر روزی جدولِ کارت را طوری
    // گشاد کردیم که ⬇ را بگیرد، نمودارها کارتِ نکته می‌شوند.
    assert.equal(
      found.has('⬇'),
      false,
      '⬇ نباید به‌عنوان کارت شمرده شود — یعنی بلوک‌های کد درست تشخیص داده نشده‌اند',
    )
  })
})
