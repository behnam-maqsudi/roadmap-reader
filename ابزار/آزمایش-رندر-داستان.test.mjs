/**
 * آزمایش-رندر-داستان.test.mjs — آیا بلوکِ داستان واقعاً تشخیص داده می‌شود؟
 *
 * این تست، منطقِ رندرر را روی محتوای واقعیِ فایل‌ها اجرا می‌کند — نه روی یک
 * نمونه‌ی ساختگی. اگر کاراکترِ اولِ بلوک عوض شود یا فاصله‌ای بیفتد، همین‌جا
 * لو می‌رود.
 *
 * اجرا:  node --test ابزار/آزمایش-رندر-داستان.test.mjs
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
 * همان منطقی که در `src/Markdown.tsx` است — اینجا عیناً تکرار شده تا
 * تست، رندررِ واقعی را بدون نیاز به بیلد کردن بسنجد.
 */
function isStoryBlock(children) {
  const text = extractText(children).trimStart()
  return text.startsWith('🧒')
}

function extractText(node) {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (typeof node === 'object' && node.props) return extractText(node.props.children)
  return ''
}

const phases = readdirSync(phaseDir).filter((f) => f.endsWith('.md'))

describe('تشخیص بلوک داستان روی محتوای واقعی', () => {
  it('همه‌ی فایل‌ها پیدا می‌شوند', () => {
    assert.equal(
      phases.length,
      15,
      'باید ۱۴ فاز + ۱ راهنمای شروع باشد (راهنما فاز نیست)',
    )
  })

  it('دقیقاً یک فایل راهنما هست، بقیه فازند', () => {
    const guides = phases.filter((f) => /راهنما|شروع/.test(f))
    assert.equal(
      guides.length,
      1,
      `باید یک راهنما باشد، اما ${guides.length} تا پیدا شد`,
    )
    const numbered = phases.filter((f) => f.startsWith('فاز-'))
    assert.equal(numbered.length, 14, 'باید ۱۴ فاز شماره‌دار باشد')
  })

  for (const file of phases) {
    it(`داستان‌های «${file.slice(0, 7)}» تشخیص داده می‌شوند`, () => {
      const lines = readFileSync(join(phaseDir, file), 'utf8')
        .replace(/\r\n/g, '\n')
        .split('\n')

      // بلوک‌های نقل‌قولی را شبیه‌سازی می‌کنیم: هر بار که «>» تمام می‌شود
      // و دوباره شروع می‌شود، یک بلوکِ تازه داریم.
      const blocks = []
      let current = null
      for (const line of lines) {
        const quoted = line.trimStart().startsWith('>')
        if (quoted) {
          ;(current ??= []).push(line.trimStart().replace(/^>\s?/, ''))
        } else if (current) {
          blocks.push(current)
          current = null
        }
      }
      if (current) blocks.push(current)

      // هر بلوکی که با 🧒 شروع می‌شود باید «داستان» تشخیص داده شود
      const stories = blocks.filter((b) => b[0].startsWith('🧒'))
      assert.ok(stories.length > 0, `هیچ داستانی در ${file} پیدا نشد`)

      for (const block of stories) {
        // ورودی رندرر، آرایه‌ای از تکه‌های متنی است (نه یک رشته)
        assert.equal(
          isStoryBlock(block),
          true,
          `بلوک تشخیص داده نشد: ${block[0].slice(0, 40)}`,
        )
      }

      // و هیچ بلوکِ معمولی نباید اشتباهی «داستان» شمرده شود
      const others = blocks.filter((b) => !b[0].startsWith('🧒'))
      for (const block of others) {
        assert.equal(
          isStoryBlock(block),
          false,
          `بلوکِ عادی، داستان اشتباه شمرده شد: ${block[0].slice(0, 40)}`,
        )
      }
    })
  }
})