/**
 * آزمایش-فهرست.test.mjs — آیا فهرست کنار صفحه گیج‌کننده نیست؟
 *
 * سه چیز را نگه می‌دارد که کاربر را سردرگم می‌کرد:
 *   ۱) راهنما باید وجود داشته باشد و بالاتر از فازها بنشیند
 *   ۲) دو فایلِ نمایه نباید با هم یکی به نظر برسند (برچسب جدا دارند)
 *   ۳) منطقِ دسته‌بندی در docs.ts باید با نامِ فایل‌ها بخواند
 *
 * اجرا:  node --test ابزار/آزمایش-فهرست.test.mjs
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const phaseDir = join(root, 'فازها')

const phaseFiles = readdirSync(phaseDir).filter((f) => f.endsWith('.md'))

/** همان منطقِ docs.ts — اینجا تکرار شده تا بدون بیلد تست شود. */
function toLatinDigits(s) {
  const map = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  }
  return s.replace(/[۰-۹]/g, (d) => map[d] ?? d)
}

function extractKind(path) {
  const name = toLatinDigits(path.split('/').pop() ?? '')
  if (/راهنما|شروع/.test(name)) return 'guide'
  if (name.startsWith('فاز-')) return 'phase'
  return 'index'
}

function extractNum(path) {
  const name = toLatinDigits(path.split('/').pop() ?? '')
  if (/راهنما|شروع/.test(name)) return -1
  if (!name.startsWith('فاز-')) return 999
  const match = name.match(/(\d+)/)
  return match ? Number(match[1]) : 999
}

const rootIndexes = ['01-نقشه-راه-اسکلت.md', '02-نقشه-راه-کامل.md']
  .filter((f) => readdirSync(root).includes(f))

describe('دسته‌بندی فهرست', () => {
  it('دقیقاً یک راهنما در فازها هست', () => {
    const guides = phaseFiles.filter((f) => extractKind(f) === 'guide')
    assert.equal(guides.length, 1, `باید ۱ راهنما باشد، ${guides.length} تا هست`)
  })

  it('راهنما قبل از همه‌ی فازها می‌نشیند', () => {
    const guide = phaseFiles.find((f) => extractKind(f) === 'guide')
    assert.ok(guide, 'راهنما پیدا نشد')
    assert.equal(
      extractNum(guide),
      -1,
      'راهنما باید شماره‌ی -۱ بگیرد تا اول بیاید',
    )
  })

  it('هر ۱۴ فاز شماره‌دار یک شماره‌ی یکتا دارند', () => {
    const nums = phaseFiles
      .filter((f) => extractKind(f) === 'phase')
      .map((f) => extractNum(f))
      .sort((a, b) => a - b)
    assert.deepEqual(nums, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
  })

  it('دو فایل نمایه هر دو در دسته‌ی index می‌نشینند', () => {
    assert.equal(rootIndexes.length, 2, 'باید دو فایل نمایه در ریشه باشد')
    for (const f of rootIndexes) {
      assert.equal(extractKind(f), 'index', `${f} نباید فاز باشد`)
      assert.equal(extractNum(f), 999, `${f} نباید شماره‌ی فاز بگیرد`)
    }
  })

  it('عنوان دو نمایه یکی نیست (پس با برچسبِ جدا شناخته می‌شوند)', () => {
    const titles = rootIndexes.map((f) => {
      const content = readFileSync(join(root, f), 'utf8')
      return content.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? ''
    })
    assert.equal(new Set(titles).size, 2, 'دو نمایه عنوان یکسان دارند')
  })
})

describe('CSS فهرست', () => {
  const css = readFileSync(join(root, 'src', 'styles.css'), 'utf8')

  it('عنوان بلند بریده نمی‌شود (ellipsis ندارد)', () => {
    const block = css.match(/\.phase-name\s*\{[^}]*\}/)?.[0] ?? ''
    assert.ok(block, '.phase-name پیدا نشد')
    assert.ok(
      !block.includes('text-overflow'),
      'هنوز text-overflow هست — عنوان بریده می‌شود',
    )
    assert.ok(block.includes('-webkit-line-clamp'), 'شکستن به چند خط تعریف نشده')
  })

  it('استایلِ برچسب دسته‌ها وجود دارد', () => {
    assert.ok(css.includes('.phase-chip-guide'), 'استایل راهنما نیست')
    assert.ok(css.includes('.phase-chip-ref'), 'استایل نمایه نیست')
    assert.ok(css.includes('.phase-group'), 'تیترِ دسته‌ها استایل ندارد')
  })
})

describe('App فهرست را گروه‌بندی می‌کند', () => {
  const app = readFileSync(join(root, 'src', 'App.tsx'), 'utf8')

  it('چهار گروه جدا رندر می‌شود', () => {
    // ⭐ چهار گروه، نه سه: راهنما، سرتیترهای فازِ باز، فازها، مرجع.
    // «بخش‌های این فاز» را کاربر خواسته بود بالاتر از همه باشد، زیرِ راهنما.
    for (const label of [
      'شروع کنید',
      'بخش‌های این فاز',
      'فازها',
      'مرجع و نقشه',
    ]) {
      assert.ok(app.includes(label), `بخش «${label}» در فهرست نیست`)
    }
  })

  it('پیش‌فرض، راهنماست نه فاز ۰۰', () => {
    assert.ok(
      app.includes("d.kind === 'guide'"),
      'صفحه به راهنما باز نمی‌شود',
    )
  })
})
