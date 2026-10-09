/**
 * آزمایش-مرورگر.خودکار.mjs — تست مرورگر، با سرورِ خودش
 *
 * ⭐ چرا این فایل جدا از `آزمایش-مرورگر.mjs` است؟
 *
 * آن یکی یک نشانی می‌گیرد (آرگومان اول) و انتظار دارد سرور از قبل بالا باشد.
 * این یکی خودش سرور را بالا می‌آورد، تست را اجرا می‌کند، و سرور را می‌بندد.
 *
 * یعنی در `بررسی-کامل.mjs` می‌شود نوشت:
 *
 *     node ابزار/بررسی-کامل.mjs
 *
 * و انتظار داشت همه‌چیز — از جمله تست مرورگر — خودش راه بیفتد. بدون این
 * فایل، کاربر باید یادت بماند دستی `npm run preview` را در ترمینال دیگری
 * بالا نگه دارد، وگرنه این بررسی بی‌سروصدا رد می‌شود. همان چیزی که خودِ
 * این تست ساخته شد تا جلویش را بگیرد.
 *
 * ⚠️ چرا `vite preview` و نه `npm run dev`؟
 *
 * چون `dev` روی منابعِ خام کار می‌کند و باید کل پروژه را از نو تبدیل کند
 * (چند ثانیه طول می‌کشد و گاهی تایم‌اوت می‌خورد). `preview` دقیقاً همان
 * `dist`ای را سرو می‌کند که مرحلهٔ «بیلد ساخته می‌شود» ساخته — یعنی همان
 * چیزی که کاربر واقعاً دریافت می‌کند. سریع‌تر، واقعی‌تر، و قابل‌اتکاتر.
 */

import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * ⭐ یک پورتِ آزاد پیدا می‌کند.
 *
 * چرا؟ چون پورتِ ثابت یعنی «اگر یک چیزی روی آن باشد، کل بررسی می‌خوابد».
 * و این دقیقاً همان اتفاقی است که در اجرای قبلی افتاد: سرورِ `dev` روی
 * ۵۱۷۴ مرده بود و تست با یک پیامِ بی‌ربط («اپ بارگذاری نشد») شکست خورد.
 */
function freePort() {
  return new Promise((res, rej) => {
    const srv = createServer()
    srv.on('error', rej)
    // پورت ۰ یعنی «خودت یک پورتِ آزاد انتخاب کن» — پس لازم نیست حدس بزنیم
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => res(port))
    })
  })
}

/** ⭐ آیا سرور جواب می‌دهد؟ — نه اینکه فقط پورت باز باشد. */
async function isUp(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(1500) })
    return r.ok
  } catch {
    return false
  }
}

// ── ۱) بیلد باید exist داشته باشد ──
//
// `preview` از روی `dist` سرو می‌کند. اگر بیلد نباشد، سرور بالا می‌آید ولی
// هر مسیری ۴۰۴ می‌دهد و تست به‌جای «خرابیِ واقعی»، «تستِ بد» را نشان می‌دهد.
if (!existsSync(join(root, 'dist', 'index.html'))) {
  console.error(
    '❌ پوشهٔ dist نیست. اول باید بیلد گرفته شود:\n' +
      '     node ابزار/بررسی-کامل.mjs\n' +
      '  یا مستقیم: npx vite build',
  )
  process.exit(2)
}

// ── ۲) سرور را بالا بیاور ──
const port = await freePort()
const url = `http://localhost:${port}/`
const vite = join(root, 'node_modules', 'vite', 'bin', 'vite.js')

console.log(`سرور: ${url}`)

const server = spawn(process.execPath, [vite, 'preview', '--port', String(port), '--strictPort'], {
  cwd: root,
  stdio: 'ignore',
})

// ── ۳) صبر کن تا واقعاً بالا بیاید (نه فقط باز شدن پورت) ──
let up = false
for (let i = 0; i < 80 && !up; i++) {
  // اگر سرور در این فاصله مرد، زودتر بفهمیم تا ۱۶ ثانیه معطل نشویم
  if (server.exitCode !== null) {
    console.error(`❌ سرور با کد ${server.exitCode} بسته شد.`)
    process.exit(2)
  }
  up = await isUp(url)
  if (!up) await sleep(250)
}

if (!up) {
  server.kill()
  console.error(`❌ سرور روی ${url} جواب نداد.`)
  process.exit(2)
}

// ── ۴) تست را اجرا کن ──
let code = 1
try {
  const test = spawn(process.execPath, [join(here, 'آزمایش-مرورگر.mjs'), url], {
    cwd: root,
    stdio: 'inherit',
  })
  code = await new Promise((res) => test.on('exit', res))
} finally {
  // ── ۵) سرور را جمع کن — حتی اگر تست شکست خورد ──
  //
  // این `finally` عمدی است: اگر تست کرش کند و سرور بماند، دفعهٔ بعد
  // `بررسی-کامل` روی یک پروسهٔ یتیم گیر می‌کند و کاربر نمی‌فهمد چرا.
  server.kill()
  await sleep(200)
}

process.exit(code ?? 1)