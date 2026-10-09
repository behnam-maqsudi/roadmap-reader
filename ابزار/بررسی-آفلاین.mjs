/**
 * بررسی-آفلاین.mjs — ثابت می‌کند اپ بدون اینترنت کار می‌کند.
 *
 * چرا مهم است؟ کاربر در ایران است و اینترنت قطع می‌شود. اگر حتی یک درخواست
 * به بیرون برود، کل درس از کار می‌افتد. این اسکریپت بعد از هر build اجرا شود.
 *
 * چهار چیز را چک می‌کند:
 *   ۱) در سورس هیچ لینک بیرونی نباشد (http/https/cdn)
 *   ۲) در dist/ هیچ درخواست شبکه‌ای نباشد
 *   ۳) فونت‌های لازم واقعاً در dist/ باشند
 *   ۴) محتوای markdown داخل باندل باشد (نه fetch)
 *
 * اجرا:  node ابزار/بررسی-آفلاین.mjs
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

let problems = 0
const fail = (msg) => {
  problems += 1
  console.log(`  ✗ ${msg}`)
}
const pass = (msg) => console.log(`  ✓ ${msg}`)

// ── ۱) سورس: هیچ لینک بیرونی در فایل‌های اجرایی ──
console.log('\n۱) سورس — لینک بیرونی')

const sourceFiles = readdirSync(join(root, 'src')).filter((f) =>
  /\.(ts|tsx|css)$/.test(f),
)
sourceFiles.push('../index.html')

let found = 0
for (const rel of sourceFiles) {
  const path = rel.startsWith('..')
    ? join(root, 'index.html')
    : join(root, 'src', rel)
  const text = readFileSync(path, 'utf8')

  // دنبالای «https://» یا «http://» بگرد، ولی نه داخل کامنت‌های توضیحی
  const lines = text.split('\n')
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return // کامنت فارسی
    if (/https?:\/\//.test(line)) {
      fail(`${rel}:${i + 1} لینک بیرونی — ${line.trim().slice(0, 60)}`)
      found += 1
    }
  })
}
if (found === 0) pass(`هیچ لینک بیرونی در ${sourceFiles.length} فایل نیست`)

// ── ۲) فونت‌ها ──
console.log('\n۲) فونت‌ها')

const css = readFileSync(join(root, 'src', 'styles.css'), 'utf8')
const fontRefs = [...css.matchAll(/url\(['"]?(\/fonts\/[^)'"]+)/g)].map(
  (m) => m[1],
)

if (fontRefs.length === 0) fail('هیچ فونتی در CSS تعریف نشده')

let missing = 0
for (const ref of new Set(fontRefs)) {
  const onDisk = join(root, 'public', ref)
  if (!existsSync(onDisk)) {
    fail(`فونت محلی گم شده: ${ref}`)
    missing += 1
  }
}
if (missing === 0) pass(`${new Set(fontRefs).size} فونت، همه محلی و موجود`)

// ── ۳) dist: اگر بیلد شده، هنگام بارگذاری چیزی از بیرون نخواند ──
console.log('\n۳) خروجی بیلد (dist/)')

/**
 * ⭐ چرا این‌قدر دقیق؟
 *
 * در متنِ درس‌ها آدرس‌های زیادی هست (بخش «منابع»، مثال‌های `https://api.test.ir`
 * و…). آن‌ها **متن** هستند، نه درخواست. مرورگر موقع باز کردن صفحه آن‌ها را
 * نمی‌خواند؛ فقط اگر کاربر روی لینک کلیک کند باز می‌شوند. پس گشتن دنبالِ
 * «https» در باندل، اپ را بی‌دلیل «غیرآفلاین» اعلام می‌کند.
 *
 * چیزی که واقعاً اهمیت دارد، **درخواست هنگام بارگذاری** است:
 *   - fetch / XMLHttpRequest به آدرس بیرونی
 *   - <script src> یا <link href> به آدرس بیرونی در index.html
 *   - @import یا url(http…) در CSS
 *   - WebSocket / EventSource به آدرس بیرونی
 */
const NETWORK_CALLS = [
  { name: 'fetch به بیرون', re: /fetch\(\s*["'`]https?:\/\//gi },
  { name: 'XMLHttpRequest.open به بیرون', re: /\.open\(\s*["'][A-Z]+["']\s*,\s*["'`]https?:\/\//gi },
  { name: 'WebSocket به بیرون', re: /new\s+WebSocket\(\s*["'`]wss?:\/\//gi },
  { name: 'EventSource به بیرون', re: /new\s+EventSource\(\s*["'`]https?:\/\//gi },
  { name: 'importScripts به بیرون', re: /importScripts\(\s*["'`]https?:\/\//gi },
  { name: 'url(http…) در CSS', re: /url\(\s*["']?https?:\/\//gi },
  { name: '@import از بیرون', re: /@import\s+(?:url\()?["']?https?:\/\//gi },
  { name: 'new Image().src به بیرون', re: /\.src\s*=\s*["'`]https?:\/\//gi },
]

/** تگ‌هایی که موقع باز شدن صفحه، خودشان شبکه را صدا می‌زنند. */
const HTML_NETWORK = /<(?:script|link|img|iframe|source|video|audio)\b[^>]*\b(?:src|href)\s*=\s*["']https?:\/\//gi

const dist = join(root, 'dist')
if (!existsSync(dist)) {
  console.log('  ⓘ هنوز build نشده — این بخش رد شد (اول npm run build بزن)')
} else {
  const walk = (dir) =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f)
      return statSync(p).isDirectory() ? walk(p) : [p]
    })

  const bundles = walk(dist).filter((f) => /\.(js|css|html)$/.test(f))

  /**
   * ⭐ تفکیکِ کدِ اپ از محتوای درس.
   *
   * Vite هر فایل markdown را یک تکه‌ی جدا می‌کند و اسمش را از نام فایلِ مبدأ
   * می‌گیرد (مثل «فاز-۰۴-…js»). داخل آن تکه، `fetch(...)` می‌تواند از **کدِ
   * مثالِ درس** باشد — مثلاً فاز ۴ نشان می‌دهد اگر توکن را به دزد بدهی چه
   * می‌شود. آن کد هرگز اجرا نمی‌شود؛ فقط متن است.
   *
   * پس درخواست شبکه را فقط در **کدِ خودِ اپ** می‌گردیم، نه در متن درس.
   */
  const isLessonChunk = (f) => {
    const name = f.split(/[\\/]/).pop() ?? ''
    return /^[^/]*?(?:فاز|نقشه|راهنما|۰|ف)/.test(name) && !/^index-/.test(name)
  }

  const appCode = bundles.filter((f) => !isLessonChunk(f))
  const lessonText = bundles.filter(isLessonChunk)

  let networkCalls = 0

  for (const f of appCode) {
    const text = readFileSync(f, 'utf8')
    const short = f.replace(dist, 'dist')
    for (const { name, re } of NETWORK_CALLS) {
      for (const m of text.matchAll(re)) {
        fail(`${short} — ${name}: ${m[0].slice(0, 50)}`)
        networkCalls += 1
      }
    }
    if (f.endsWith('.html')) {
      for (const m of text.matchAll(HTML_NETWORK)) {
        fail(`${short} — تگ با src/href بیرونی: ${m[0].slice(0, 50)}`)
        networkCalls += 1
      }
    }
  }

  if (networkCalls === 0) {
    pass(
      `${appCode.length} فایل کدِ اپ — صفر درخواست شبکه هنگام بارگذاری`,
    )
  }

  // ── بررسیِ واقعی: هر چیزی که صفحه لازم دارد باید روی دیسک باشد ──
  //
  // این مهم‌ترین چک است. اگر یکی از این‌ها گم باشد، در قطعی اینترنت صفحه
  // سفید یا ناقص بالا می‌آید — و از بیرون معلوم نمی‌شود.
  console.log('\n۴) هر چیزی که صفحه لازم دارد روی دیسک هست؟')
  const html = readFileSync(join(dist, 'index.html'), 'utf8')
  const refs = [
    ...html.matchAll(/(?:src|href)\s*=\s*["']([^"':]+)["']/g),
  ].map((m) => m[1])

  let missingAssets = 0
  for (const ref of refs) {
    if (ref.startsWith('data:') || ref.startsWith('http')) continue
    if (!existsSync(join(dist, ref))) {
      fail(`فایل لازم پیدا نشد: ${ref}`)
      missingAssets += 1
    }
  }
  if (missingAssets === 0) pass(`${refs.length} ارجاع صفحه، همه موجود`)

  // فونت‌ها باید کپی شده باشند
  const distFonts = join(dist, 'fonts')
  if (!existsSync(distFonts)) {
    fail('پوشه‌ی فونت در dist نیست — متن آفلاین فونت نخواهد داشت')
  } else {
    const copied = readdirSync(distFonts).filter((f) => f.endsWith('.woff2'))
    if (copied.length < new Set(fontRefs).size) {
      fail(
        `فقط ${copied.length} فونت کپی شده ولی ${new Set(fontRefs).size} لازم است`,
      )
    } else {
      pass(`${copied.length} فونت داخل dist کپی شده`)
    }
  }

  // محتوای markdown باید داخل باندل باشد
  const hasContent = lessonText.some((f) => {
    const t = readFileSync(f, 'utf8')
    return t.includes('Multics') || t.includes('لینوکس')
  })
  if (hasContent) pass(`محتوای درس داخل باندل است (نه fetch) — ${lessonText.length} تکه`)
  else fail('محتوای درس در باندل پیدا نشد — شاید fetch شود؟')
}

// ── خلاصه ──
console.log(
  problems === 0
    ? '\n✓ اپ کاملاً آفلاین است: بدون لینک بیرونی، با فونت محلی، محتوا در باندل.'
    : `\n✗ ${problems} مشکل آفلاین بودن پیدا شد.`,
)
process.exit(problems === 0 ? 0 : 1)
