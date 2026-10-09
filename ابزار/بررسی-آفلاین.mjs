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

/**
 * ⭐ پیمایشِ بازگشتیِ `src/`.
 *
 * پیش از نسخهٔ ۲، این اسکریپت فقط `readdirSync(join(root,'src'))` می‌کرد —
 * یعنی **فقط** فایل‌های ترازِ اول را می‌دید. با اضافه شدن `src/v2/` و
 * `src/v2/components/`، آن پوشه‌ها بی‌صدا از قلم می‌افتادند و اسکریپت با
 * خوش‌بینی سبز می‌شد در حالی که هیچ‌چیز از نسخهٔ ۲ را ندیده بود.
 * این سکوتِ خطرناک است: سندِ «اپ آفلاین است» باید واقعاً همه را دیده باشد.
 */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

const sourceFiles = walk(join(root, 'src')).filter((f) =>
  /\.(ts|tsx|css)$/.test(f),
)

/**
 * ⭐ هر دو صفحهٔ ورودی، نه فقط نسخهٔ ۱.
 *
 * `v2.html` یک فایل مستقل است با `<script>` مخصوصِ خودش؛ اگر آن را
 * نمی‌خوانیم، یک CDN یا فونتِ بیرونی که آنجا اضافه شود بی‌صدا از قلم
 * در می‌رود.
 */
const htmlEntries = ['index.html', 'v2.html'].filter((f) =>
  existsSync(join(root, f)),
)
for (const f of htmlEntries) sourceFiles.push(join(root, f))

let found = 0
for (const path of sourceFiles) {
  const rel = path.replace(root + '\\', '').replace(root + '/', '')
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

/**
 * ⭐ فونت‌ها را از **همهٔ** CSSها می‌خوانیم، نه فقط `src/styles.css`.
 *
 * نسخهٔ ۲ `src/v2/styles.css` خودش `@font-face`هایش را تعریف می‌کند و
 * عمداً هیچ import‌ای از نسخهٔ ۱ ندارد. اگر فقط CSS نسخهٔ ۱ را بخوانیم،
 * آن ۹ تعریف نامرئی می‌مانند و خرابیِ یکی از آن‌ها بی‌صدا رد می‌شود.
 */
const cssFiles = sourceFiles.filter((f) => f.endsWith('.css'))
const fontRefs = cssFiles.flatMap((f) => {
  const text = readFileSync(f, 'utf8')
  return [...text.matchAll(/url\(['"]?(\/fonts\/[^)'"]+)/g)].map((m) => m[1])
})
if (cssFiles.length === 0) fail('هیچ فایل CSS پیدا نشد')

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

  /**
   * ⭐ هر دو صفحه: `index.html` (نسخهٔ ۱) و `v2.html` (نسخهٔ ۲).
   *
   * قبلاً فقط نسخهٔ ۱ خوانده می‌شد. یعنی اگر باندلِ نسخهٔ ۲ گم می‌شد یا
   * فونتی کپی نمی‌شد، این اسکریپت سبز می‌ماند و کاربر در نسخهٔ ۲ صفحهٔ
   * سفید می‌دید.
   */
  let totalRefs = 0
  let missingAssets = 0
  const distEntries = htmlEntries.filter((f) => existsSync(join(dist, f)))

  if (distEntries.length === 0) {
    fail('هیچ صفحهٔ HTML در dist نیست — بیلد ناقص است')
  }

  for (const entry of distEntries) {
    const html = readFileSync(join(dist, entry), 'utf8')
    const refs = [
      ...html.matchAll(/(?:src|href)\s*=\s*["']([^"':]+)["']/g),
    ].map((m) => m[1])
    totalRefs += refs.length

    for (const ref of refs) {
      if (ref.startsWith('data:') || ref.startsWith('http')) continue
      if (!existsSync(join(dist, ref))) {
        fail(`${entry}: فایل لازم پیدا نشد: ${ref}`)
        missingAssets += 1
      }
    }
  }
  if (missingAssets === 0) {
    pass(
      `${totalRefs} ارجاع در ${distEntries.length} صفحه (${distEntries.join('، ')}) — همه موجود`,
    )
  }

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
