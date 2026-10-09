/**
 * آزمایش-لنگر-پایدار.test.mjs — لنگرها بعد از عوض شدنِ فاز، سرِ جای خود می‌مانند؟
 *
 * ⭐⭐ این تست روی چه چیزی نگهبانی می‌کند؟
 *
 * فهرستِ کنارِ صفحه (`App.tsx`) و رندرر (`Markdown.tsx`) باید **یک**
 * شناسه برای یک سرتیتر بسازند. اگر یکی از این مسیرها عوض شود و دیگری نه،
 * کلیک بی‌صدا از کار می‌افتاد.
 *
 * ⭐ چرا تست‌های دیگر کافی نبودند؟
 *
 * `آزمایش-کلیک-واقعی` هر فاز را با `renderToStaticMarkup` رندر می‌کند — و
 * این تابع برای هر فراخوانی هوک‌ها را **از نو** می‌سازد و حافظهٔ
 * `useMemo` را **نگه نمی‌دارد**. یعنی دقیقاً همان چیزی که می‌خواهیم
 * بسنجیم (رفتارِ بینِ رندرها) از بین می‌رود.
 *
 * ولی باگِ واقعی **درونِ یک رندرِ تنها** بود: `StrictMode` رندر را دوبار
 * اجرا می‌کند و شمارندهٔ زندهٔ سرتیترها خراب می‌شد.
 *
 * پس اینجا کارِ متفاوتی می‌کنیم: نمی‌خواهیم رفتارِ React را شبیه کنیم،
 * می‌خواهیم مطمئن شویم **اصلاً چیزی در حین رندر تغییر نمی‌کند**. یعنی
 * شناسه‌ها باید از روی متن به‌تنهایی بیایند.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

// ⭐ همان تابعی که هر دو مصرف‌کننده از آن می‌خوانند — نه یک کپی
const { extractHeadings, buildSlugs } = await import(
  pathToFileURL(join(root, 'src', 'slug.js')).href
)

/**
 * ⭐⭐ آزمونِ اصلی: **متن تنها، ورودیِ تنها**.
 *
 * اگر شناسه‌ها به هر چیزی جزِ متنِ سند وابسته باشند — یک شمارندهٔ
 * ماژولی، یک `useMemo` که باید بین رندرها زنده بماند، هر چیز — این
 * تست قرمز می‌شود. چون ما تابع را **از نو** صدا می‌زنیم و انتظار داریم
 * همان جواب قبلی را بدهد.
 *
 * این تنها خاصیتی است که رفتارِ `StrictMode` برایش اهمیت دارد.
 */
describe('شناسه‌ها فقط از متن می‌آیند (و از هیچ چیزِ دیگر)', () => {
  const content = readFileSync(join(root, 'فازها', 'فاز-۰۳-معماری-و-فریم‌ورک-وب.md'), 'utf8')

  it('صد بار صدا زدن، همان جواب را می‌دهد', () => {
    const first = extractHeadings(content).map((h) => h.id)

    for (let i = 0; i < 100; i++) {
      assert.deepEqual(
        extractHeadings(content).map((h) => h.id),
        first,
        `فراخوانیِ ${i + 2} جوابِ متفاوتی داد — یعنی چیزی بینِ فراخوانی‌ها ` +
          'به‌جا مانده. در مرورگر، `StrictMode` رندر را دوبار اجرا می‌کند و ' +
          'همین باعث می‌شود هر سرتیتر یک `-1` اضافه بگیرد و کلیک بی‌اثر شود.',
      )
    }
  })

  it('ترتیبِ فراخوانی‌ها مهم نیست — ولی خودِ متن مهم است', () => {
    const a = extractHeadings(content).map((h) => h.id)
    const b = extractHeadings(content).map((h) => h.id)

    // جابه‌جا کردنِ ترتیبِ محاسبه نباید چیزی را عوض کند
    extractHeadings(content.slice(0, 1000))
    const c = extractHeadings(content).map((h) => h.id)

    assert.deepEqual(c, a)
    assert.deepEqual(b, a)
  })

  it('سرتیترهای تکراری، شمارهٔ تکرارِ درست می‌گیرند', () => {
    // «چرا وجود دارد؟» در فاز ۳ پنج بار می‌آید ⇒ باید ۰ تا ۴ بگیرد.
    const ids = extractHeadings(content).filter((h) => h.text === 'چرا وجود دارد؟')
    const values = ids.map((h) => h.id)

    assert.deepEqual(
      values,
      ['چرا-وجود-دارد', 'چرا-وجود-دارد-1', 'چرا-وجود-دارد-2', 'چرا-وجود-دارد-3', 'چرا-وجود-دارد-4'],
      `شمارهٔ تکرارها غلط است: ${values.join(' | ')}`,
    )
  })

  it('شمارهٔ سطر، تنها منبعِ حقیقت است — نه شمارندهٔ کهنه', () => {
    const headings = extractHeadings(content)

    // شناسهٔ درست برای هر سطر، از محاسبهٔ مستقل به دست می‌آید
    const expected = buildSlugs(headings.map((h) => h.text))

    assert.deepEqual(headings.map((h) => h.id), expected)
    // سطرها یکتا هستند — اگر نباشند، جدولِ `سطر←شناسه` یکی را می‌بلعد
    const lines = headings.map((h) => h.line)
    assert.equal(new Set(lines).size, lines.length, 'دو سرتیتر یک شمارهٔ سطر دارند')
  })
})

/**
 * ⭐⭐ و حالا چیزی که باگِ واقعی را می‌ساخت.
 *
 * `StrictMode` هر کامپوننت را دو بار رندر می‌کند. نسخهٔ قدیمی، شمارندهٔ
 * زنده داشت و در رندرِ دوم لنگرها را خراب می‌کرد.
 *
 * این تست **ساختارِ لازم** را بررسی می‌کند: رندرر باید از جدولِ
 * «سطر←شناسه» بخواند، نه اینکه خودش شمارنده بسازد.
 */
describe('رندرر از جدولِ سطر می‌خواند، نه از شمارندهٔ زنده', () => {
  const src = readFileSync(join(root, 'src', 'Markdown.tsx'), 'utf8')

  // ⭐ توضیحات را برمی‌داریم. وگرنه تست روی کلمه‌هایی قرمز می‌شود که فقط
  // **دربارهٔ** باگِ قدیمی نوشته شده‌اند — و کدِ درست را تنبیه می‌کند.
  const code = src
    .replace(/\/\*[\s\S]*?\*\//g, '') // توضیحِ چندخطی
    .replace(/(^|[^:])\/\/.*$/gm, '$1') // توضیحِ تک‌خطی (به‌جز `https://`)
    .replace(/^\s*\/\/.*$/gm, '')

  it('هیچ شمارندهٔ مشترکی در Markdown.tsx نیست', () => {
    // `seenSlugs` / `nextSlug` / شمارندهٔ زنده = دقیقاً همان چیزی که
    // در `StrictMode` دو بار شمرده می‌شد.
    assert.doesNotMatch(
      code,
      /\bnextSlug\b/,
      '⚠️ `nextSlug` هنوز در Markdown.tsx استفاده می‌شود — ' +
        'یعنی شمارنده در حین رندر دستکاری می‌شود و `StrictMode` خرابش می‌کند',
    )
    assert.doesNotMatch(
      code,
      /\bseenSlugs\b/,
      '⚠️ `seenSlugs` هنوز در Markdown.tsx هست — همان ضدالگوی قدیمی',
    )
  })

  it('`components` به `headings` وابسته است', () => {
    const block = code.match(/const components = useMemo<Partial<Components>>\(([\s\S]*?)\n  \)/)
    assert.ok(block, 'پیدا نشد: useMemo مربوط به components')

    const deps = block[1].match(/\[([^\]]*)\],\s*$/m)
    assert.ok(deps, 'پیدا نشد: آرایهٔ وابستگی‌های components')

    assert.match(
      deps[1],
      /\bheadings\b/,
      '⚠️ `headings` از وابستگی‌های `components` جا افتاده — ' +
        'با عوض کردنِ فاز، بستهٔ کهنه را می‌بندد و لنگرهای فازِ جدید غلط می‌شوند',
    )
  })

  it('`StrictMode` در `main.tsx` هست (و باید باشد)', () => {
    // اگر این تست قرمز شود یعنی کسی StrictMode را برداشته — و دارد
    // خودِ باگِ لنگر را پنهان می‌کند. حذفش راه‌حل نیست، بدتر است.
    const main = readFileSync(join(root, 'src', 'main.tsx'), 'utf8')
    assert.match(main, /<StrictMode>/, 'StrictMode از main.tsx حذف شده است')
  })
})

/**
 * ⭐⭐ و یک نگهبانی که ساختاری است: **یک منبعِ حقیقت**.
 *
 * اگر کسی دوباره منطقِ شناسه را در `App.tsx` یا `Markdown.tsx` تکرار کند،
 * این تست قرمز می‌شود — قبل از اینکه به کاربر برسد.
 */
describe('هر دو مصرف‌کننده از یک تابع می‌خوانند', () => {
  /** کدِ بدونِ توضیح — تا تست روی حرف‌های داخلِ کامنت قرمز نشود. */
  const stripComments = (src) =>
    src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1')
      .replace(/^\s*\/\/.*$/gm, '')

  it('App.tsx از `extractHeadings` استفاده می‌کند، نه منطقِ خودش', () => {
    const code = stripComments(readFileSync(join(root, 'src', 'App.tsx'), 'utf8'))

    assert.match(
      code,
      /extractHeadings\(/,
      'App.tsx باید از `extractHeadings` بخواند — همان تابعی که رندرر می‌خواند',
    )
    assert.doesNotMatch(
      code,
      /\/\^\(#\{1,3\}\)/,
      '⚠️ App.tsx دوباره الگوی سرتیتر را نوشته — اگر این با الگوی ' +
        '`slug.js` یکی نباشد، شناسه‌ها از هم جدا می‌افتند و کلیک بی‌اثر می‌شود',
    )
  })

  it('Markdown.tsx هم از `extractHeadings` می‌خواند', () => {
    const code = stripComments(readFileSync(join(root, 'src', 'Markdown.tsx'), 'utf8'))
    assert.match(code, /extractHeadings\(/, 'Markdown.tsx از `extractHeadings` نمی‌خواند')
  })

  it('فهرست و رندرر، قاعدهٔ یکسان دارند', () => {
    // فهرست سطحِ ۱ تا ۳ را نشان می‌دهد؛ رندرر همه را. پس `id` باید از
    // شمارشِ **همهٔ** سرتیترها بیاید، نه فقط از ۱ تا ۳ — وگرنه اگر یک `h4`
    // تکراری بود، لنگرهای دو مسیر از هم جدا می‌افتادند.
    const content = readFileSync(join(root, 'فازها', 'فاز-۰۳-معماری-و-فریم‌ورک-وب.md'), 'utf8')
    const all = extractHeadings(content)
    const shallow = all.filter((h) => h.level <= 3)

    assert.deepEqual(
      shallow.map((h) => h.id),
      buildSlugs(shallow.map((h) => h.text)),
      'فیلترِ سطح نباید شمارشِ تکراری‌ها را به‌هم بزند',
    )
  })
})