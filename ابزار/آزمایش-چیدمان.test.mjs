/**
 * آزمایش-چیدمان.test.mjs — آیا چیدمان همان‌طور است که خواسته شد؟
 *
 * ⭐ چرا این تست هست؟
 *
 * سه خواسته‌ی صریحِ کاربر بود:
 *   ۱. فهرستِ سرتیترها بالاتر از همه باشد، زیرِ راهنمای شروع.
 *   ۲. عنوانِ فازها بریده نشود (سه خط، نه یک خط با «…»).
 *   ۳. سرتیتری که کلیک می‌کنیم زیرِ نوارِ بالای صفحه نرود.
 *
 * این‌ها را مرورگر باید تأیید کند، ولی اگر مرورگر نبود، CSS خودش سندِ
 * رسمیِ این سه ادعا است. پس قواعد را از `styles.css` و `App.tsx`
 * می‌خوانیم و همان چیزی را می‌سنجیم که مرورگر می‌سنجد.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

const css = readFileSync(join(root, 'src', 'styles.css'), 'utf8')
const app = readFileSync(join(root, 'src', 'App.tsx'), 'utf8')

/** بدنه‌ی یک قانونِ CSS را برمی‌گرداند؛ اگر نبود، رشته‌ی خالی. */
function rule(selector, source = css) {
  const i = source.indexOf(selector)
  if (i < 0) return ''
  const open = source.indexOf('{', i)
  if (open < 0) return ''
  let depth = 0
  for (let j = open; j < source.length; j += 1) {
    if (source[j] === '{') depth += 1
    else if (source[j] === '}') {
      depth -= 1
      if (depth === 0) return source.slice(open + 1, j)
    }
  }
  return ''
}

describe('چیدمان — فهرست بالا، عنوان‌ها بریده نمی‌شوند', () => {
  it('فهرستِ سرتیترها بالای فازها می‌نشیند', () => {
    // ⚠️ لنگرها باید «جای تیترِ گروه» را بگیرند، نه یک کلمه. نسخه‌ی اول
    // فقط «فازها» را می‌جست و به `const phases` (خط ۲۶۱، خیلی بالاتر) می‌رسید؛
    // نتیجه این شد که تست ادعا کرد ترتیبِ چیدمان غلط است، در حالی که درست بود.
    const iGuides = app.indexOf('>شروع کنید<')
    const iHeadings = app.indexOf('بخش‌های این فاز')
    // ⚠️ تیترِ گروهِ فازها یک عبارتِ درون‌خطی دارد («فازها {search…}»)، پس
    // با متن نمی‌شود گرفتش. با کلاسِ گروه می‌گیریم و اندیسش را می‌خوانیم.
    const iPhases = app.indexOf('<h5 className="phase-group">', app.indexOf('فازها {'))

    assert.ok(iGuides > 0, 'گروهِ «شروع کنید» پیدا نشد')
    assert.ok(iHeadings > 0, 'تیترِ «بخش‌های این فاز» پیدا نشد')
    assert.ok(iPhases > 0, 'گروهِ «فازها» پیدا نشد')

    // چهار گروه: راهنما، سرتیترهای فازِ باز، فازها، مرجع — نه کمتر، نه بیشتر
    const groupHeaders = [...app.matchAll(/<h5 className="phase-group">/g)]
    assert.equal(groupHeaders.length, 4, `باید چهار گروه باشد، ${groupHeaders.length} تا پیدا شد`)

    // و ترتیبشان دقیقاً همین باشد
    const order = groupHeaders.map((m) => m.index)
    assert.deepEqual(
      order,
      [...order].sort((a, b) => a - b),
      'تیترِ گروه‌ها به ترتیبِ خودشان در فایل نیستند',
    )

    assert.ok(
      iGuides < iHeadings,
      'فهرستِ سرتیترها باید *زیرِ* راهنمای شروع باشد، نه بالای آن',
    )
    assert.ok(
      iHeadings < iPhases,
      'فهرستِ سرتیترها باید *بالای* فازها باشد، نه پایین آن',
    )
    assert.ok(
      app.indexOf('>مرجع و نقشه<') > iPhases,
      'گروهِ «مرجع و نقشه» باید آخر باشد',
    )
  })

  it('راهنمای شروع، به‌طور پیش‌فرض باز است', () => {
    // کاربر گفت راهنما «دوبار تکرار شده» — یعنی نباید هم فاز باشد هم راهنما.
    assert.ok(
      /const guide = loaded\.find/.test(app),
      'فایلِ راهنما به‌عنوان سندِ پیش‌فرض انتخاب نمی‌شود',
    )
    assert.ok(
      /guide \?\? firstPhase/.test(app),
      'اولویت با راهنمای شروع باشد، نه فازِ اول',
    )
  })

  it('عنوانِ فاز سه خط می‌ماند و با «…» بریده نمی‌شود', () => {
    const body = rule('.phase-name')
    assert.ok(body, 'قانونِ .phase-name پیدا نشد')

    assert.doesNotMatch(
      body,
      /text-overflow\s*:\s*ellipsis/,
      '.phase-name هنوز با «…» بریده می‌شود — کاربر عنوانِ کامل را نمی‌بیند',
    )
    assert.match(body, /-webkit-line-clamp\s*:\s*3/, 'سقفِ سه خط تعریف نشده')
    assert.match(body, /overflow-wrap\s*:\s*anywhere/, 'عنوانِ بلند سرِ خود می‌ماند')
  })

  it('هر سرتیتر از نوارِ بالای صفحه فاصله دارد', () => {
    assert.ok(
      /scroll-margin-block-start/.test(css),
      'scroll-margin تعریف نشده — سرتیتر زیرِ نوارِ چسبان گم می‌شود',
    )
    // مقدارش باید به‌اندازه‌ی نوار باشد، نه صفر
    const m = css.match(/scroll-margin-block-start:\s*([\d.]+)(rem|px)/)
    assert.ok(m, 'مقدارِ scroll-margin پیدا نشد')
    const value = parseFloat(m[1]) * (m[2] === 'rem' ? 16 : 1)
    assert.ok(value >= 48, `فاصله‌ی ${value}px کم است — سرتیتر زیرِ نوار می‌افتد`)
  })

  it('فهرستِ بالایی از فازها قابل تشخیص است', () => {
    assert.match(css, /\.toc-list-top/, 'کلاسِ toc-list-top تعریف نشده')
    assert.match(css, /\.phase-group/, 'تیترِ گروه‌ها تعریف نشده')
    // هر سطح سرتیتر یک تورفتگیِ بصری می‌گیرد
    assert.match(css, /\.toc-level-1/, 'سرتیترهای سطحِ یک متمایز نیستند')
    assert.match(css, /\.toc-level-3/, 'سرتیترهای سطحِ سه متمایز نیستند')
  })
})