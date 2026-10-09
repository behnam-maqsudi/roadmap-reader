/**
 * آزمایش-کلیک-واقعی.test.mjs — آیا کلیک روی فهرست، واقعاً کاربر را می‌برد؟
 *
 * ⭐ چرا این تست جدا از بقیه است؟
 *
 * `آزمایش-لنگر` می‌گوید «دو مسیرِ ساختِ شناسه یکی هستند».
 * `آزمایش-رندر-واقعی` می‌گوید «`id` روی سرتیتر می‌نشیند».
 *
 * ولی شکافِ بینِ این دو یعنی چیست؟ یعنی: **فهرست می‌گوید `#منابع-۲`،
 * و مرورگر باید عنصری با همان `id` را پیدا کند.** اگر یکی از این دو
 * رشته چند نویسه اختلاف داشته باشد — مثلاً یکی نیم‌فاصله دارد و دیگری
 * ندارد — هر دو تست سبز می‌مانند ولی کلیک بی‌اثر است.
 *
 * این تست دقیقاً همان شکاف را می‌بندد: از روی متنِ واقعیِ فازها، هر
 * شناسه‌ای که فهرست می‌سازد را در HTMLِ رندرشده جست‌وجو می‌کند و می‌گوید
 * آیا عنصری با آن `id` **واقعاً وجود دارد یا نه**.
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
const { buildSlugs } = await import(pathToFileURL(join(root, 'src', 'slug.js')).href)

let render
const scratch = join(root, 'ابزار', '.موقت-کلیک')

before(async () => {
  mkdirSync(scratch, { recursive: true })
  const entry = join(scratch, 'entry.mjs')

  writeFileSync(
    entry,
    `
import { createElement } from 'react'
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
  return renderToStaticMarkup(createElement(Markdown, { content, settings }))
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
  render = (await import(pathToFileURL(bundlePath).href)).render
})

after(() => rmSync(scratch, { recursive: true, force: true }))

/** همان کاری که `toc` در App.tsx می‌کند: سرتیترها را از متن درمی‌آورد. */
function buildToc(content) {
  const found = []
  let inFence = false

  for (const line of content.split('\n')) {
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

const phases = readdirSync(join(root, 'فازها')).filter((f) => f.endsWith('.md'))

describe('کلیک روی فهرست — از لینک تا عنصر، بدون شکاف', () => {
  for (const file of phases) {
    it(`«${file.slice(0, 8)}» — هر لینکِ فهرست، یک عنصرِ واقعی دارد`, () => {
      const content = readFileSync(join(root, 'فازها', file), 'utf8')
      const html = render(content)

      // ۱) شناسه‌هایی که فهرست می‌سازد (همان `buildSlugs`)
      const linkIds = buildSlugs(buildToc(content).map((h) => h.text))

      // ۲) شناسه‌هایی که واقعاً در صفحه نشسته‌اند
      const domIds = new Set(
        [...html.matchAll(/<h[1-4][^>]*\sid="([^"]*)"/g)].map((m) => m[1]),
      )

      // ۳) هر لینکی باید سرتیترش را در صفحه پیدا کند — وگرنه کلیک بی‌اثر است
      const orphans = linkIds.filter((id) => !domIds.has(id))

      assert.deepEqual(
        orphans,
        [],
        `${file}: ${orphans.length} لینکِ فهرست به هیچ سرتیتری نمی‌رسد — ` +
          `کلیک روی آن‌ها بی‌اثر می‌شود`,
      )
    })
  }

  it('سرتیترهای تکراری، لینک‌های متفاوت دارند (کلیکِ دومی هم می‌رسد)', () => {
    // «منابع» در یک فاز چند بار می‌آید. اگر هر سه یک `id` بگیرند، دو تای
    // آخر همیشه به همان اولی می‌رسند و خواننده گم می‌شود.
    const content = readFileSync(join(root, 'فازها', phases[0]), 'utf8')
    const html = render(content)

    const ids = [...html.matchAll(/<h[1-4][^>]*\sid="([^"]*)"/g)].map((m) => m[1])
    const counts = new Map()
    for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1)

    const dupes = [...counts.entries()].filter(([, n]) => n > 1)
    assert.deepEqual(dupes, [], `شناسه‌ی تکراری در HTML: ${dupes.map((d) => d[0]).join(', ')}`)
  })

  it('هیچ لینکِ فهرست، خالی یا «#» نمی‌شود', () => {
    for (const file of phases) {
      const content = readFileSync(join(root, 'فازها', file), 'utf8')
      for (const id of buildSlugs(buildToc(content).map((h) => h.text))) {
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