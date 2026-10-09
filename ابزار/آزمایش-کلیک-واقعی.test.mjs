/**
 * آزمایش-کلیک-واقعی.test.mjs — آیا کلیک روی فهرست، واقعاً کاربر را می‌برد؟
 *
 * ⭐⭐ چرا این تست با شبیه‌سازیِ رندرِ دوبله کار می‌کند؟
 *
 * تست‌های دیگر (`renderToStaticMarkup`) یک رندرِ تنها می‌سازند و سبز می‌مانند،
 * ولی اپ واقعی داخل `StrictMode` است و **هر کامپوننت دو بار رندر می‌شود**.
 *
 * همان باگی که این تست شکار می‌کند دقیقاً از همین‌جا می‌آمد: شمارندهٔ
 * سرتیترهای تکراری در **حین رندر** زیاد می‌شد. یعنی:
 *
 *     رندرِ ۱  →  «۱-از-کجا-شروع-کنم»     (شمارنده: ۰ ← ۱)
 *     رندرِ ۲  →  «۱-از-کجا-شروع-کنم-1»   (شمارنده: ۱ ← ۲)  ← این می‌ماند
 *
 * ولی فهرستِ کنارِ صفحه از روی متن ساخته شده و پسوند ندارد. پس `getElementById`
 * شکست می‌خورد و کلیک بی‌صدا از کار می‌افتاد.
 *
 * پس این تست **خودِ رفتارِ StrictMode را شبیه‌سازی می‌کند**: کامپوننت را
 * دوبار پشتِ سر هم صدا می‌زند، درست مثل کاری که React 19 می‌کند.
 */

import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { build } from 'esbuild'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

// منطقِ مشترکِ شناسه — همان فایلی که App.tsx و Markdown.tsx از آن می‌خوانند
const { extractHeadings } = await import(
  pathToFileURL(join(root, 'src', 'slug.js')).href
)

let render
let renderTwice
const scratch = join(root, 'ابزار', '.موقت-کلیک')

before(async () => {
  mkdirSync(scratch, { recursive: true })
  const entry = join(scratch, 'entry.mjs')

  writeFileSync(
    entry,
    `
import { createElement, StrictMode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Markdown } from ${JSON.stringify(join(root, 'src', 'Markdown.tsx'))}

const settings = {
  showLineNumbers: false, codeWrap: false, tableBorder: true, direction: 'rtl',
  theme: 'light', codeTheme: 'auto', fontSize: 17, lineHeight: 1.9,
  paragraphSpacing: 1.1, contentWidth: 720, codeFontSize: 14, contentPadding: 24,
  codeBlockSpacing: 1.4, fontFamily: 'vazir', fontWeight: 400, letterSpacing: 0,
  textAlign: 'right', fontStyle: 'normal',
}

export function render(content) {
  return renderToStaticMarkup(
    createElement(StrictMode, null, createElement(Markdown, { content, settings })),
  )
}

/** ⭐ دو رندرِ پشتِ سر هم — دقیقاً مثل StrictMode در مرورگر. */
export function renderTwice(content) {
  render(content)
  return render(content)
}
`,
    'utf8',
  )

  const result = await build({
    entryPoints: [entry],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    write: false,
    jsx: 'automatic',
    external: ['react', 'react-dom', 'react-dom/server'],
    loader: { '.css': 'empty' },
  })

  const bundlePath = join(scratch, 'bundle.mjs')
  writeFileSync(bundlePath, result.outputFiles[0].text, 'utf8')
  const mod = await import(pathToFileURL(bundlePath).href)
  render = mod.render
  renderTwice = mod.renderTwice
})

after(() => rmSync(scratch, { recursive: true, force: true }))

const phases = readdirSync(join(root, 'فازها')).filter((f) => f.endsWith('.md'))

/** همان کاری که فهرستِ کنارِ صفحه می‌کند: سطحِ ۱ تا ۳. */
const linkIds = (content) =>
  extractHeadings(content)
    .filter((h) => h.level <= 3)
    .map((h) => h.id)

/** شناسه‌هایی که واقعاً روی سرتیترهای رندرشده نشسته‌اند. */
const domIds = (html) =>
  new Set([...html.matchAll(/<h[1-6][^>]*\sid="([^"]*)"/g)].map((m) => m[1]))

describe('کلیک روی فهرست — از لینک تا عنصر، بدون شکاف', () => {
  for (const file of phases) {
    it(`«${file.slice(0, 8)}» — هر لینکِ فهرست، یک عنصرِ واقعی دارد`, () => {
      const content = readFileSync(join(root, 'فازها', file), 'utf8')
      const html = render(content)

      const links = linkIds(content)
      const onPage = domIds(html)

      // هر لینکی باید سرتیترش را در صفحه پیدا کند — وگرنه کلیک بی‌اثر می‌شود
      const orphans = links.filter((id) => !onPage.has(id))

      assert.deepEqual(
        orphans,
        [],
        `${file}: ${orphans.length} لینکِ فهرست به هیچ سرتیتری نمی‌رسد — ` +
          `کلیک روی آن‌ها بی‌اثر می‌شود. ` +
          `نمونه: ${orphans.slice(0, 3).join(' | ')}`,
      )
    })
  }

  // ⭐⭐ این تست همان چیزی است که هیچ تستِ دیگری نمی‌گفت.
  it('رندرِ دوباره (مثل StrictMode) لنگرها را خراب نمی‌کند', () => {
    for (const file of phases) {
      const content = readFileSync(join(root, 'فازها', file), 'utf8')

      const once = domIds(render(content))
      const twice = domIds(renderTwice(content))

      assert.deepEqual(
        [...twice].sort(),
        [...once].sort(),
        `${file}: رندرِ دوم شناسه‌ها را عوض کرد — ` +
          'یعنی چیزی در حین رندر تغییر می‌کند. ' +
          'اگر شمارندهٔ سرتیترها زنده بماند، هر رندر یک `-1` اضافه می‌کند.',
      )
    }
  })

  it('سرتیترهای تکراری، لینک‌های متفاوت دارند (کلیکِ دومی هم می‌رسد)', () => {
    // «چرا وجود دارد؟» در فاز ۳ پنج بار می‌آید. اگر هر پنج یک `id` بگیرند،
    // چهار تای آخر همیشه به همان اولی می‌رسند و خواننده گم می‌شود.
    const withDupes = phases.find((f) => {
      const c = readFileSync(join(root, 'فازها', f), 'utf8')
      const texts = extractHeadings(c).map((h) => h.text)
      return new Set(texts).size !== texts.length
    })

    assert.ok(withDupes, 'هیچ فازی سرتیترِ تکراری ندارد — تست بی‌معنا می‌شود')

    const content = readFileSync(join(root, 'فازها', withDupes), 'utf8')
    const ids = extractHeadings(content).map((h) => h.id)
    const counts = new Map()
    for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1)

    const dupes = [...counts.entries()].filter(([, n]) => n > 1)
    assert.deepEqual(
      dupes,
      [],
      `شناسه‌ی تکراری در «${withDupes}»: ${dupes.map((d) => d[0]).join(', ')}`,
    )
  })

  it('هیچ لینکِ فهرست، خالی یا «#» نمی‌شود', () => {
    for (const file of phases) {
      const content = readFileSync(join(root, 'فازها', file), 'utf8')
      for (const id of linkIds(content)) {
        assert.ok(id.trim().length > 0, `${file}: شناسه‌ی خالی — لینک می‌شود «#»`)
        assert.doesNotMatch(
          id,
          /[\s"'#?&=/]/u,
          `${file}: شناسه‌ی «${id}» نویسه‌ی ممنوع دارد — مرورگر آن را نمی‌پذیرد`,
        )
      }
    }
  })
})