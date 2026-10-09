/**
 * دیباگ-واقعی.mjs — اپ را با همان داده‌ای رندر می‌کند که مرورگر می‌گیرد
 *
 * ⭐ چرا این متفاوت است؟
 *
 * «دیباگ-اپ» با شیمِ گلوب کار می‌کرد و ۵ سند می‌دید — یعنی تصویری که
 * با آنچه مرورگر می‌بیند فرق دارد. این یکی داده را **از خودِ سرورِ Vite**
 * می‌خواند، دقیقاً از همان URLهایی که در src/docs.ts نوشته شده.
 *
 * نتیجه یا باید محتوا را نشان بدهد، یا خطای واقعی را چاپ کند.
 */

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { build } from 'esbuild'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const scratch = join(root, 'ابزار', '.موقت-واقعی')
const BASE = 'http://localhost:5173'

/** همان کاری که مرورگر می‌کند: URL فارسی را رمز می‌کند و می‌خواند */
async function fetchDoc(spec) {
  const url = BASE + encodeURI(spec).replace(/#/g, '%23')
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} — ${url}`)
  return res.text()
}

const settings = {
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

try {
  mkdirSync(scratch, { recursive: true })

  const entry = join(scratch, 'entry.mjs')
  writeFileSync(
    entry,
    `
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Markdown } from ${JSON.stringify(join(root, 'src', 'Markdown.tsx'))}

// ⭐ محتوا را از بیرون می‌گیریم — یعنی دقیقاً همان چیزی که مرورگر می‌گیرد
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
    jsx: 'automatic',
    external: ['react', 'react-dom', 'react-dom/server'],
    loader: { '.css': 'empty' },
  })

  const bundlePath = join(scratch, 'bundle.mjs')
  writeFileSync(bundlePath, result.outputFiles[0].text, 'utf8')
  const { render } = await import(pathToFileURL(bundlePath).href)

  // ── گام ۱: فهرستِ سندها، دقیقاً مثل docs.ts ولی از روی سرور ──
  const globbed = [
    '../فازها/فاز-۰۰-پایه‌های-سیستم-و-لینوکس.md',
    '../فازها/فاز-۰۱-شبکه-و-چرخه-حیات-وب.md',
    '../فازها/فاز-۰۲-nodejs-و-typescript-زیر-کاپوت.md',
    '../فازها/فاز-۰۳-معماری-و-فریم‌ورک-وب.md',
    '../فازها/فاز-۰۴-احراز-هویت-و-مجوزدهی.md',
    '../فازها/فاز-۰۵-پایگاه-داده.md',
    '../فازها/فاز-۰۶-کش-و-صف.md',
    '../فازها/فاز-۰۷-امنیت.md',
    '../فازها/فاز-۰۸-تست-و-استقرار.md',
    '../فازها/فاز-۰۹-پایتون.md',
    '../فازها/فاز-۱۰-مهندسی-llm.md',
    '../فازها/فاز-۱۱-rag.md',
    '../فازها/فاز-۱۲-ایجنت.md',
    '../فازها/فاز-۱۳-امنیتی-و-ارزیابی-ai.md',
    '../فازها/۰۰-راهنمای-شروع.md',
    '../01-نقشه-راه-اسکلت.md',
    '../02-نقشه-راه-کامل.md',
  ]

  console.log('── گام ۱: خواندنِ سندها از سرور ──')
  const loaded = []
  for (const spec of globbed) {
    try {
      const content = await fetchDoc(spec)
      loaded.push({ spec, content })
    } catch (error) {
      console.log(`  ✗ ${spec}\n    ${error.message}`)
    }
  }
  console.log(`  ${loaded.length} از ${globbed.length} سند خوانده شد`)

  if (loaded.length === 0) {
    console.log('✗ هیچ سندی خوانده نشد — همین دلیلِ صفحهٔ خالی است')
    process.exitCode = 1
  }

  // ── گام ۲: رندر ──
  console.log('\n── گام ۲: رندر ──')
  for (const { spec, content } of loaded.slice(0, 3)) {
    try {
      const html = render(content, settings)
      console.log(`  ✓ ${spec.split('/').pop()} → ${html.length} کاراکتر`)
    } catch (error) {
      console.log(`  ✗ ${spec.split('/').pop()}`)
      console.log('    ' + error.message.split('\n')[0])
      process.exitCode = 1
    }
  }
} finally {
  rmSync(scratch, { recursive: true, force: true })
}