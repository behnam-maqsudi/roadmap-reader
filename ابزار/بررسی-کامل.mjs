/**
 * بررسی-کامل.mjs — یک دستور، همه‌ی بررسی‌ها
 *
 * ⭐ چرا این فایل هست؟
 *
 * تا الان پنج دستور جدا بود: بازبینی متن، تست‌ها، tsc، build، بررسی آفلاین.
 * آدم باید یادت بماند کدام را کِی اجرا کند، و یکی جا افتادن یعنی یک چیز
 * بی‌سروصدا خراب می‌شود. این فایل همه را پشت سر هم اجرا می‌کند و آخرش
 * یک خلاصه‌ی سبز/قرمز می‌دهد.
 *
 * اجرا:  node ابزار/بررسی-کامل.mjs
 */

import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

/** ⭐ رنگ فقط اگر خروجی واقعی باشد — وگرنه کدِ رنگ در لاگ می‌ماند. */
const useColor = process.stdout.isTTY
const c = (code, s) => (useColor ? `[${code}m${s}[0m` : s)
const green = (s) => c(32, s)
const red = (s) => c(31, s)
const dim = (s) => c(90, s)
const bold = (s) => c(1, s)

/** یک مرحله را اجرا می‌کند و نتیجه‌اش را برمی‌گرداند. */
function step(title, command, args) {
  process.stdout.write(`\n${bold('▸')} ${title}\n${dim('  $ ' + command + ' ' + args.join(' '))}\n\n`)

  const started = Date.now()
  const r = spawnSync(command, args, { cwd: root, encoding: 'utf8', shell: false })

  const secs = ((Date.now() - started) / 1000).toFixed(1)
  const ok = r.status === 0

  if (!ok) {
    // فقط وقتی خطا هست، خروجی را نشان می‌دهیم — وگرنه ۲۰۰ خط سبز چاپ می‌شود
    process.stdout.write(red(r.stdout || '') + red(r.stderr || ''))
  }

  process.stdout.write(`\n${ok ? green('✓') : red('✗')} ${title} — ${secs}s\n`)
  return { title, ok, secs }
}

const tsc = join(root, 'node_modules', 'typescript', 'bin', 'tsc')
// ⚠️ `npm` را مستقیم صدا نمی‌زنیم: `spawnSync` روی ویندوز فایل `.cmd` را
// بدون `shell: true` اجرا نمی‌کند و بی‌سروصدا `status: null` می‌دهد.
// به‌جایش همان کاری را می‌کنیم که `npm run build` می‌کند: tsc و بعد vite.
const vite = join(root, 'node_modules', 'vite', 'bin', 'vite.js')

const steps = [
  ['متنِ فازها سالم است', process.execPath, [join(here, 'بازبینی-متن.mjs')]],
  ['همه‌ی تست‌ها سبزند', process.execPath, [join(here, 'همه-تست.mjs')]],
  // ⚠️ نه `--noEmit` و نه `-b`. ریشه‌ی tsconfig.json برابر `files: []` با
  // `references` است، پس:
  //   · `tsc --noEmit` → هیچ فایلی را نمی‌بیند و همیشه صفر می‌دهد. یعنی
  //     تا حالا «سبز» بودیم در حالی که هیچ‌چیز چک نمی‌شد.
  //   · `tsc -b` → چون `noEmit` در tsconfig.app.json است، چیزی نمی‌سازد
  //     و کش هم نمی‌شود، پس باز هم چیزی را تازه نمی‌کند.
  // `-p tsconfig.app.json` تنها راهی است که واقعاً ۲۱۱ فایل را می‌خواند.
  ['TypeScript خطا ندارد', process.execPath, [tsc, '-p', 'tsconfig.app.json']],
  ['بیلد ساخته می‌شود', process.execPath, [vite, 'build']],
  ['اپ آفلاین است', process.execPath, [join(here, 'بررسی-آفلاین.mjs')]],
  // ⭐⭐ تنها بررسی‌ای که یک مرورگرِ واقعی را روشن می‌کند.
  //
  // چرا لازم است؟ چون همهٔ بررسی‌های بالا روی رشته و انتزاع کار می‌کنند.
  // هیچ‌کدام نمی‌گویند کلیکِ واقعی اسکرول می‌کند یا نه — و دقیقاً همان
  // چیزی بود که در مرورگر خراب بود ولی همهٔ تست‌ها سبز بودند.
  //
  // خودش سرور را بالا می‌آورد (روی پورتِ آزاد) و بعد جمعش می‌کند، پس
  // کاربر نباید دستی سروری بالا نگه دارد.
  ['کلیک روی فهرست در مرورگر اسکرول می‌کند', process.execPath, [join(here, 'آزمایش-مرورگر.خودکار.mjs')]],
]

const results = []
for (const [title, cmd, args] of steps) {
  results.push(step(title, cmd, args))
}

// ── خلاصه ──
const failed = results.filter((r) => !r.ok)

console.log('\n' + '─'.repeat(52))
if (failed.length === 0) {
  console.log(green(bold(`✓ هر ${results.length} بررسی سبز است`)))
} else {
  console.log(red(bold(`✗ ${failed.length} بررسی خراب است:`)))
  for (const f of failed) console.log(red(`   · ${f.title}`))
}
console.log(dim('─'.repeat(52)))

process.exit(failed.length === 0 ? 0 : 1)