/**
 * آزمایش-لنگر.test.mjs — آیا کلیک روی فهرستِ کنار صفحه کار می‌کند؟
 *
 * ⭐ چرا این تست مهم است؟
 *
 * کاربر گزارش داد که روی سرتیترها کلیک می‌کند و هیچ اتفاقی نمی‌افتد. علتش
 * این بود که فهرست در `App.tsx` شناسه می‌ساخت، ولی رندرر در `Markdown.tsx`
 * اصلاً `id` به سرتیترها نمی‌داد. مرورگر دنبالِ عنصری می‌گشت که نبود.
 *
 * این تست همان دو مسیر را روی **محتوای واقعیِ فازها** اجرا می‌کند و می‌گوید
 * شناسه‌های تولیدشده یکی هستند یا نه. اگر کسی بعداً یکی از دو را عوض کند،
 * همین‌جا لو می‌رود.
 *
 * اجرا:  node --test ابزار/آزمایش-لنگر.test.mjs
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

/**
 * ⭐ منطقِ شناسه را از خودِ `src/slug.ts` می‌خوانیم، نه کپی.
 *
 * نسخه‌ی اولِ این تست، تابع را اینجا کپی کرده بود. نتیجه: فرمولِ شماره در
 * دو جا نوشته شده بود و یکی `-1` می‌داد و دیگری `-2` — و همین‌طور که
 * باید، تست خودش را گرفتار کرد. اگر کپی بماند، همین اتفاق دوباره می‌افتد.
 *
 * راه‌حل: `slug.ts` جای دیگری به‌عنوان ماژولِ قابل‌استفاده نوشته شده — یک
 * فایلِ کوچکِ JS که هر دو مصرف‌کننده (App و Markdown) آن را `import` می‌کنند.
 * اینجا هم همان فایل را می‌خوانیم و اجرا می‌کنیم.
 */
const { slugify, nextSlug, buildSlugs } = await import(
  // ⚠️ در ویندوز، import با مسیرِ مطلقِ «E:\…» خطا می‌دهد؛ باید file:// باشد
  pathToFileURL(join(root, 'src', 'slug.js')).href
)

/** عینِ ساختِ `toc` در App.tsx — سرتیترها را از متن درمی‌آورد. */
function buildToc(content) {
  const found = []
  let inFence = false

  for (const line of content.split('\n')) {
    // نادیده گرفتن # داخل بلوک کد
    if (line.startsWith('```')) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const m = line.match(/^(#{1,3})\s+(.+)$/)
    if (m) found.push({ text: m[2].trim(), level: m[1].length })
  }
  return found
}

/**
 * عینِ رندرر: سرتیترها یکی‌یکی ساخته می‌شوند و شمارنده زنده می‌ماند.
 * (App.tsx به‌جایش از `buildSlugs` استفاده می‌کند.)
 */
function renderHeadingIds(headings) {
  const seen = new Map()
  return headings.map((h) => nextSlug(h.text, seen))
}

const phases = readdirSync(join(root, 'فازها')).filter((f) => f.endsWith('.md'))

describe('لنگرِ سرتیترها — کلیک روی فهرست باید کار کند', () => {
  it('رندرر به هر سرتیتر id می‌دهد', () => {
    const src = readFileSync(join(root, 'src', 'Markdown.tsx'), 'utf8')
    // کامپوننت‌های سرتیتر باید وجود داشته باشند و id را عبور دهند
    for (const level of ['h1', 'h2', 'h3']) {
      assert.ok(
        src.includes(`${level}: (`),
        `کامپوننت ${level} تعریف نشده — سرتیترها id نمی‌گیرند`,
      )
    }
    assert.ok(src.includes('id={id}'), 'id به سرتیتر داده نمی‌شود')
  })

  it('فهرست کنار صفحه از همان تابعِ slug می‌خواند', () => {
    const app = readFileSync(join(root, 'src', 'App.tsx'), 'utf8')
    assert.ok(
      app.includes("from './slug'"),
      'App.tsx تابعِ مشترکِ slug را وارد نکرده — شناسه‌ها از هم جدا می‌افتند',
    )
    assert.ok(
      !/^function slugify/m.test(app),
      'تابعِ کپی‌شده‌ی slugify هنوز در App.tsx هست — منطق دو جا شده',
    )
  })

  it('هیچ منطقِ slug کپی‌شده‌ای در رندرر نمانده', () => {
    const src = readFileSync(join(root, 'src', 'Markdown.tsx'), 'utf8')
    assert.ok(
      !/^function slugify/m.test(src),
      'slugify در Markdown.tsx کپی شده — باید از slug.ts بخواند',
    )
    assert.ok(
      !/uniqueSlug/.test(src),
      'تابعِ uniqueSlug باقی مانده — باید به nextSlug مشترک بشود',
    )
  })

  it('CSS فاصله‌ی اسکرول را دارد تا سرتیتر زیر نوار نرود', () => {
    const css = readFileSync(join(root, 'src', 'styles.css'), 'utf8')
    assert.ok(
      css.includes('scroll-margin-block-start'),
      'scroll-margin تعریف نشده — سرتیتر زیرِ نوارِ بالای صفحه می‌افتد',
    )
  })

  for (const file of phases) {
    it(`شناسه‌های «${file.slice(0, 8)}» بین فهرست و رندر یکی است`, () => {
      const content = readFileSync(join(root, 'فازها', file), 'utf8')
      const headings = buildToc(content)
      assert.ok(headings.length > 0, `${file} سرتیتر ندارد`)

      // راهی که فهرستِ کنار صفحه می‌رود (App.tsx → slug.js)
      const fromList = buildSlugs(headings.map((h) => h.text))
      // راهی که رندرر می‌رود (Markdown.tsx → slug.js)
      const fromRender = renderHeadingIds(headings)

      assert.deepEqual(
        fromList,
        fromRender,
        `${file}: شناسه‌ی فهرست با رندر یکی نیست — کلیک بی‌اثر می‌شود`,
      )

      // و هیچ شناسه‌ای نباید تکراری باشد، وگرنه لنگرِ دوم کار نمی‌کند
      const dupes = fromList.filter((id, i) => fromList.indexOf(id) !== i)
      assert.deepEqual(dupes, [], `${file}: شناسه‌ی تکراری — ${dupes.join(', ')}`)

      // و هیچ شناسه‌ای نباید خالی باشد (وگرنه لینک «#» می‌شود)
      for (const id of fromList) {
        assert.ok(id.length > 0, `${file}: شناسه‌ی خالی ساخته شد`)
      }
    })
  }
})

describe('شماره‌گذاریِ سرتیترهای تکراری', () => {
  it('اولی بدون شماره، بقیه با شماره‌ی یکتا', () => {
    // شمارنده از ۱ شروع می‌شود: اولی بدون شماره، دومی -1، سومی -2
    const ids = buildSlugs(['منابع', 'مقدمه', 'منابع', 'منابع'])
    assert.deepEqual(ids, ['منابع', 'مقدمه', 'منابع-1', 'منابع-2'])
  })

  it('رندرر و فهرست در تکراری‌ها هم یکی می‌مانند', () => {
    const headings = [
      { text: 'منابع' },
      { text: 'مقدمه' },
      { text: 'منابع' },
    ]
    assert.deepEqual(renderHeadingIds(headings), buildSlugs(headings.map((h) => h.text)))
  })

  it('سرتیترِ خالی «بخش» می‌شود، نه رشته‌ی خالی', () => {
    assert.equal(buildSlugs(['!!!'])[0], 'بخش')
  })
})
