/**
 * دیباگ-اپ.mjs — کلِ صفحه را در Node رندر می‌کند تا خطای runtime دیده شود
 *
 * چرا لازم است؟
 *
 * تستِ «رندرِ واقعی» فقط <Markdown /> را رندر می‌کرد. ولی کاربر می‌گوید
 * «کلِ صفحه کار نمی‌کند» — یعنی جایی *بیرون* از رندررِ مارک‌داون.
 * این اسکریپت همان را هدف می‌گیرد: خودِ <App />، با همان مسیرِ کد.
 *
 * ⚠️ پوشهٔ موقت باید داخل پروژه باشد، وگرنه Node نمی‌تواند
 * پکیج‌های external (react و ...) را پیدا کند.
 */

import { build } from 'esbuild'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const scratch = join(root, 'ابزار', '.موقت-دیباگ')

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
import App from ${JSON.stringify(join(root, 'src', 'App.tsx'))}

// ⭐ رندرِ ایستا useEffect را اجرا نمی‌کند، پس محتوا هیچ‌وقت نمی‌آید.
// برای دیدنِ خطای واقعی، خودِ بارگذاریِ سند را جداگانه صدا می‌زنیم.
import { loadDocs } from ${JSON.stringify(join(root, 'src', 'docs.ts'))}
export async function probe() {
  const docs = await loadDocs()
  return { count: docs.length, first: docs[0] ? { id: docs[0].id, title: docs[0].title, kind: docs[0].kind, len: docs[0].content.length } : null }
}

export function render(settings) {
  return renderToStaticMarkup(createElement(App, { settings }))
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
    // ⚠️ باید با tsconfig هم‌خوان باشد: پروژه روی «react-jsx» است
    jsx: 'automatic',
    external: ['react', 'react-dom', 'react-dom/server'],
    loader: { '.css': 'empty' },
    // ⭐ این کلیدِ اصلی است: import.meta.glob یک ویژگیِ Vite است و esbuild
    // آن را نمی‌شناسد. اگر این را ندهی، باندل می‌سازد ولی موقعِ اجرا
    // می‌میرد با «glob is not a function» — دقیقاً همان خطایی که پیش آمد.
    define: {
      'import.meta.glob': '__globShim',
    },
    inject: [join(root, 'ابزار', 'شیم-گلوب.mjs')],
  })

  const bundlePath = join(scratch, 'bundle.mjs')
  writeFileSync(bundlePath, result.outputFiles[0].text, 'utf8')

  const { render, probe } = await import(pathToFileURL(bundlePath).href)

  // ⭐ اول بارگذاریِ سند را جدا امتحان می‌کنیم — اگر این بشکند،
  // «در حال بارگذاری…» ماندنِ اپ توضیح دارد.
  try {
    const info = await probe()
    console.log('✓ loadDocs:', JSON.stringify(info, null, 2))
  } catch (error) {
    console.error('✗ loadDocs شکست خورد:')
    console.error(error)
  }

  let html
  try {
    html = render(settings)
  } catch (error) {
    console.error('✗ رندرِ <App /> شکست خورد:')
    console.error(error)
    process.exitCode = 1
  }

  if (html !== undefined) {
    console.log(`✓ رندر شد — ${html.length} کاراکتر HTML`)
    console.log('--- HTML کامل ---')
    console.log(html)
    console.log('--- پایان ---')
    console.log('  h1:', (html.match(/<h1[^>]*>([\s\S]{0,60})/) || [])[1] || '— هیچ —')
    console.log('  تعداد تیتر h2:', (html.match(/<h2/g) || []).length)
    console.log('  تعداد فاز در فهرست:', (html.match(/phase-item|phase-link/g) || []).length)
  }
} finally {
  rmSync(scratch, { recursive: true, force: true })
}