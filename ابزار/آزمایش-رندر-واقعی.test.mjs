/**
 * آزمایش-رندر-واقعی.test.mjs — آیا `id` واقعاً روی سرتیترها می‌نشیند؟
 *
 * ⭐ چرا این تست فرق دارد؟
 *
 * تست‌های قبلی فقط منطق را روی متن اجرا می‌کردند. ولی باگِ کاربر («روی
 * سرتیتر می‌زنم، هیچی نمی‌شود») در سطحِ **کامپوننت** بود: شاید `id` حساب
 * می‌شد ولی به `<h2>` نمی‌رسید.
 *
 * این تست `Markdown.tsx` را واقعاً با esbuild می‌بندد، با `react-dom/server`
 * رندر می‌کند، و HTML نهایی را می‌خواند. پس اگر `id` از کامپوننت بیرون
 * نیفتد، همین‌جا لو می‌رود.
 *
 * اجرا:  node --test ابزار/آزمایش-رندر-واقعی.test.mjs
 */

import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { build } from 'esbuild'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

let Markdown
let React
let settings

/**
 * ⭐ پوشه‌ی موقتِ باندل باید **داخل پروژه** باشد، نه در `tmpdir`.
 *
 * نسخه‌ی اول باندل را در پوشه‌ی موقتیِ سیستم می‌نوشت. ولی `react` و
 * `react-dom` را `external` کرده بودیم — یعنی esbuild آن‌ها را داخل باندل
 * نمی‌ریزد و Node باید موقع `import` خودش پیدایشان کند. از پوشه‌ی موقتی،
 * Node پروژه را نمی‌شناسد و می‌گوید «Cannot find package 'react'» و همه‌ی
 * ۱۸ تست بی‌دلیل کَند می‌شوند.
 *
 * اینجا باندل را در `ابزار/.موقت-رندر/` می‌سازیم؛ یک پوشه بالاتر از
 * پروژه، پس `node_modules` در دسترس Node است، و آخرِ کار پاک می‌شود.
 */
const scratch = join(root, 'ابزار', '.موقت-رندر')

before(async () => {
  // ── ۱) با esbuild، Markdown.tsx را به JS قابل‌اجرا تبدیل می‌کنیم ──
  mkdirSync(scratch, { recursive: true })
  const entry = join(scratch, 'entry.mjs')

  // ورودی: یک فایل کوچک که Markdown را از پروژه می‌آورد و رندر می‌کند
  writeFileSync(
    entry,
    `
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Markdown } from ${JSON.stringify(join(root, 'src', 'Markdown.tsx'))}

export function render(content, settings) {
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
    // ⚠️ باید با tsconfig هم‌خوان باشد: پروژه روی «react-jsx» است (یعنی
    // هر فایل JSX خودش `react/jsx-runtime` را import می‌کند و به شیءِ
    // سراسریِ React نیازی ندارد). بدون این خط، esbuild به حالتِ کلاسیک
    // می‌افتد و کامپوننت موقع رندر می‌میرد با «React is not defined» —
    // خطایی که ربطی به `id` ندارد ولی همه‌ی تست‌ها را کور می‌کند.
    jsx: 'automatic',
    // ⚠️ CSS و فایل‌های جانبی را لازم نداریم؛ فقط منطقِ رندر
    external: ['react', 'react-dom', 'react-dom/server'],
    loader: { '.css': 'empty' },
  })

  const bundlePath = join(scratch, 'bundle.mjs')
  writeFileSync(bundlePath, result.outputFiles[0].text, 'utf8')

  const mod = await import(pathToFileURL(bundlePath).href)
  Markdown = mod.render

  // ── ۲) تنظیماتِ پیش‌فرض (فقط چیزهایی که رندرر می‌خواند) ──
  React = createElement
  settings = {
    showLineNumbers: false,
    codeWrap: false,
    tableBorder: true,
    direction: 'rtl',
    theme: 'light',
    codeTheme: 'auto',
    fontSize: 17,
    lineHeight: 1.9,
    paragraphSpacing: 1.1,
    contentWidth: 720,
    codeFontSize: 14,
    contentPadding: 24,
    codeBlockSpacing: 1.4,
    fontFamily: 'vazir',
    fontWeight: 400,
    letterSpacing: 0,
    textAlign: 'right',
    fontStyle: 'normal',
  }
})

// پوشه‌ی موقت را برمی‌داریم تا پروژه کثیف نشود
after(() => rmSync(scratch, { recursive: true, force: true }))

const phases = readdirSync(join(root, 'فازها')).filter((f) => f.endsWith('.md'))

describe('رندرِ واقعی — آیا id روی سرتیتر می‌نشیند؟', () => {
  it('یک سرتیتر ساده، id می‌گیرد', () => {
    const html = Markdown('# عنوان فاز\n\nمتن.\n', settings)
    assert.match(html, /<h1[^>]*id="/, 'h1 بدون id رندر شد')
  })

  it('سرتیترهای تکراری، id یکتا می‌گیرند', () => {
    const html = Markdown(
      '## ۱. اول\n\n## منابع\n\n## ۲. دوم\n\n## منابع\n',
      settings,
    )
    const ids = [...html.matchAll(/<h2[^>]*id="([^"]+)"/g)].map((m) => m[1])
    assert.equal(ids.length, 4, `چهار سرتیتر انتظار داشتیم، ${ids.length} پیدا شد`)
    assert.equal(new Set(ids).size, 4, `id تکراری است: ${ids.join(', ')}`)
  })

  for (const file of phases) {
    it(`«${file.slice(0, 8)}» — هر سرتیتر id دارد`, () => {
      const content = readFileSync(join(root, 'فازها', file), 'utf8')
      const html = Markdown(content, settings)

      // تعداد سرتیترهای فایل را مستقل حساب می‌کنیم
      let inFence = false
      let expected = 0
      for (const line of content.split('\n')) {
        if (line.startsWith('```')) inFence = !inFence
        if (!inFence && /^(#{1,3})\s+/.test(line)) expected += 1
      }

      const rendered = [
        ...html.matchAll(/<h[123][^>]*id="/g),
      ].length

      assert.equal(
        rendered,
        expected,
        `${file}: ${expected} سرتیتر در متن هست ولی ${rendered} تا id گرفت`,
      )
    })
  }

  it('بلوک داستان، id سرتیترِ ندارد و دست‌نخورده است', () => {
    const html = Markdown(
      '## ۱. بخش\n\n> 🧒 **داستان این بخش:** یک روایت.\n\nمتن عادی.\n',
      settings,
    )
    assert.match(html, /blockquote[^>]*class="[^"]*story/, 'کلاس story اعمال نشد')
    assert.match(html, /story-label/, 'برچسب story-label نیست')
  })
})
