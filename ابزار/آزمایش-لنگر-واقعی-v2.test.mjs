/**
 * آزمایش-لنگر-واقعی-v2.test.mjs — لنگرهای نسخهٔ ۲ در HTML واقعی
 *
 * ⭐ چرا این تست و نه تستِ سورس؟
 *
 * `آزمایش-چیدمان-v2` می‌گوید «کد این را دارد». ولی سورس داشتنِ یک چیز با
 * **رسیدنش به صفحه** فرق دارد. اینجا کامپوننتِ واقعیِ نسخهٔ ۲ را با esbuild
 * می‌بندیم، با `react-dom/server` رندر می‌کنیم و HTML نهایی را می‌خوانیم —
 * درست همان روشی که `آزمایش-رندر-واقعی` برای نسخهٔ ۱ دارد.
 *
 * ⭐⭐ سناریویِ کلیدی: **چند فاز هم‌زمان باز**.
 *
 * این همان چیزی است که چیدمانِ تازه ممکن می‌کند. و دقیقاً همان‌جایی است که
 * یک باگِ بی‌صدا می‌مرد: هر فاز سرتیترِ «منابع» خودش را دارد (اندازه‌گیری
 * نشان داد ۸ شناسه بین فازها تکرار می‌شود و «منابع-پیشنهادی» در هر ۱۴ فاز
 * هست). اگر پیشوندِ لنگرها نباشد، چند تا `id="منابع"` در یک صفحه می‌نشت و
 * `getElementById` همیشه اولی را برمی‌گرداند — یعنی فهرستِ فازِ دوم به
 * سرتیترِ فازِ اول می‌پرید. بی‌صدا، بدون خطا، فقط لینکِ غلط.
 *
 * اجرا:  node --experimental-vm-modules --test ابزار/آزمایش-لنگر-واقعی-v2.test.mjs
 */

import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { build } from 'esbuild'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

let renderPhase
const scratch = join(root, 'ابزار', '.موقت-آکاردئون')

before(async () => {
  mkdirSync(scratch, { recursive: true })
  const entry = join(scratch, 'entry.mjs')

  // ⚠️ پیشوند پاس داده می‌شود، دقیقاً مثل کاری که `PhaseSection` می‌کند.
  // اگر پیشوند را اینجا ندهیم، تستِ پیشوند اصلاً اجرا نمی‌شود.
  writeFileSync(
    entry,
    `
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Markdown } from ${JSON.stringify(join(root, 'src', 'v2', 'Markdown.tsx'))}

export function renderPhase(content, anchorPrefix) {
  return renderToStaticMarkup(
    createElement(Markdown, { content, anchorPrefix }),
  )
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
  renderPhase = mod.renderPhase
})

after(() => rmSync(scratch, { recursive: true, force: true }))

const phaseDir = join(root, 'فازها')
const phaseFiles = readdirSync(phaseDir).filter((f) => f.endsWith('.md'))

/** ⭐ همان کاری که `PhaseSection` می‌کند: پیشوند از شمارهٔ فاز. */
function prefixFor(file) {
  const m = /فاز-(\S+?)-/.exec(file)
  if (!m) return 'fg-'
  const FA = '۰۱۲۳۴۵۶۷۸۹'
  const n = [...m[1]].reduce((o, ch) => (FA.includes(ch) ? o + FA.indexOf(ch) : o + ch), '')
  return `f${n.padStart(2, '0')}-`
}

const domIds = (html) =>
  [...html.matchAll(/<h[1-6][^>]*\sid="([^"]*)"/g)].map((x) => x[1])

describe('رندرِ واقعی — یک فاز به‌تنهایی', () => {
  for (const file of phaseFiles.slice(0, 4)) {
    it(`«${file.slice(0, 8)}» — شناسه‌ها با پیشوند ساخته می‌شوند`, () => {
      const content = readFileSync(join(phaseDir, file), 'utf8')
      const html = renderPhase(content, prefixFor(file))
      const ids = domIds(html)

      assert.ok(ids.length > 0, 'هیچ سرتیتری با شناسه رندر نشد')
      assert.equal(
        ids.every((id) => id.startsWith(prefixFor(file))),
        true,
        `همهٔ شناسه‌ها باید با «${prefixFor(file)}» شروع شوند`,
      )
    })
  }

  it('بدون پیشوند هم رندر می‌شود (سازگاری با استفادهٔ قبلی)', () => {
    const content = readFileSync(join(phaseDir, phaseFiles[0]), 'utf8')
    const ids = domIds(renderPhase(content, ''))
    assert.ok(ids.length > 0)
    // پیشوندِ خالی باید شناسهٔ خامِ قبلی را بدهد، نه خرابی
    assert.equal(ids.some((id) => id.includes('f00-')), false)
  })
})

describe('⭐ رندرِ واقعی — دو فاز هم‌زمان باز', () => {
  it('هیچ شناسهٔ تکراری بین دو فاز نیست', () => {
    const [a, b] = phaseFiles
    const idsA = domIds(renderPhase(readFileSync(join(phaseDir, a), 'utf8'), prefixFor(a)))
    const idsB = domIds(renderPhase(readFileSync(join(phaseDir, b), 'utf8'), prefixFor(b)))

    const all = [...idsA, ...idsB]
    const unique = new Set(all)

    assert.equal(
      all.length,
      unique.size,
      `شناسهٔ تکراری بین دو فاز: ` +
        [...all.filter((id, i) => all.indexOf(id) !== i)].slice(0, 5).join('، '),
    )
  })

  it('⭐ همهٔ ۱۴ فاز با هم باز: باز هم یکتا می‌ماند', () => {
    // سناریوی حدی. کاربر می‌تواند همه را باز کند؛ نباید هیچ‌جا شکاف بیفتد.
    const all = []
    for (const f of phaseFiles) {
      const html = renderPhase(readFileSync(join(phaseDir, f), 'utf8'), prefixFor(f))
      all.push(...domIds(html))
    }

    const dups = [...all.filter((id, i) => all.indexOf(id) !== i)]
    assert.equal(
      new Set(dups).size,
      0,
      `با همهٔ فازها باز، ${new Set(dups).size} شناسه تکرار شد — ` +
        `کلیک روی فهرستِ یک فاز به فازِ دیگر می‌پرد`,
    )
    assert.ok(all.length > 600, `فقط ${all.length} سرتیتر رندر شد — کم است`)
  })

  it('«منابع» در هر فاز، لنگرِ خودش را دارد', () => {
    // این همان موردِ واقعی است: ۱۴ فاز، ۱۴ تا سرتیترِ یکسان.
    const found = []
    for (const f of phaseFiles) {
      const p = prefixFor(f)
      const html = renderPhase(readFileSync(join(phaseDir, f), 'utf8'), p)
      const id = domIds(html).find((x) => x.includes('منابع'))
      if (id) found.push(id)
    }

    assert.ok(found.length >= 10, `فقط ${found.length} فاز سرتیترِ «منابع» دارد`)
    assert.equal(
      new Set(found).size,
      found.length,
      `سرتیترِ «منابع» در فازهای مختلف، یک شناسه شده: ${[...new Set(found)].join('، ')}`,
    )
  })
})