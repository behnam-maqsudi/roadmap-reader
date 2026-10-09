/**
 * ردیاب-بارگذاری.mjs — همه‌ی importها را مثل مرورگر دنبال می‌کند
 *
 * ⭐ چرا این هست؟
 *
 * هر تکه از سرور جداگانه ۲۰۰ می‌داد، ولی صفحه در مرورگر خالی بود.
 * یعنی مشکل در **زنجیره** است نه در یک فایل. این اسکریپت از main.tsx
 * شروع می‌کند و هر import را دنبال می‌کند — مثل مرورگر — و هرچه خطا
 * بدهد را چاپ می‌کند.
 */

const BASE = 'http://localhost:5173'

const seen = new Map()
const failed = []
const queue = ['/src/main.tsx']

/** تبدیل importهای نسبی به مسیرِ قابل درخواست */
function resolveRelative(fromPath, spec) {
  const fromDir = fromPath.replace(/[^/]*$/, '')
  const base = new URL(fromDir, 'http://x/').pathname
  const resolved = new URL(spec, 'http://x' + base).pathname
  return resolved.startsWith('//') ? resolved : resolved
}

while (queue.length > 0) {
  const path = queue.shift()
  if (seen.has(path)) continue
  seen.set(path, true)

  let text
  let status
  try {
    const res = await fetch(BASE + path)
    status = res.status
    text = await res.text()
  } catch (error) {
    failed.push({ path, status: 'FETCH-ERR', message: error.message })
    continue
  }

  if (status !== 200) {
    failed.push({ path, status, message: text.slice(0, 200) })
    continue
  }

  // importهای استاتیک
  const importRe = /(?:^|[\s;}])(?:import|export)\s*(?:[\s\S]*?)\s*from\s*["']([^"']+)["']/g
  const dynamicRe = /import\(\s*["']([^"']+)["']\s*\)/g

  for (const re of [importRe, dynamicRe]) {
    for (const m of text.matchAll(re)) {
      const spec = m[1]

      if (spec.startsWith('/')) {
        queue.push(spec)
      } else if (spec.startsWith('.')) {
        queue.push(resolveRelative(path, spec))
      }
      // بسته‌های npm (react و ...) از مسیر /node_modules/ می‌آیند و لازم
      // نیست دنبال شوند — ولی اگر /@vite یا /node_modules بود، رد کن
    }
  }

  // ⚠️ globهای Vite به مسیرهایی اشاره می‌کنند که فقط با ?import/&raw معتبرند
  const globRe = /import\(\s*["']([^"']+\.(?:md|json)[^"']*)["']\s*\)/g
  for (const m of text.matchAll(globRe)) {
    queue.push(m[1])
  }
}

console.log(`بازدید شد: ${seen.size} ماژول`)

if (failed.length === 0) {
  console.log('✓ هیچ ماژولی خطا نداد')
} else {
  console.log(`\n✗ ${failed.length} ماژول خطا داد:`)
  for (const f of failed) {
    console.log(`\n  [${f.status}] ${f.path}`)
    if (f.message) console.log('    ' + f.message.replace(/\n/g, '\n    ').slice(0, 400))
  }
  process.exitCode = 1
}