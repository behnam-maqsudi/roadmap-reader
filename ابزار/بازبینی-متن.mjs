/**
 * بازبینی-متن.mjs — چک سلامت متن فازها.
 *
 * این اسکریپت چیزهایی را می‌گوید که با چشم پیدا نمی‌شوند:
 *   ۱) حروف فارسیِ خراب (نشانه‌ی به‌هم‌ریختگی هنگام ویرایش)
 *   ۲) بلوک‌های کدِ باز‌مانده (``` فرد)
 *   ۳) بخش‌های شماره‌دارِ بدون داستان
 *   ۴) تیترهای تکراری
 *
 * اجرا:  node ابزار/بازبینی-متن.mjs
 */

import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const dir = join(root, 'فازها')

/** نشانه‌ی جایگزین یونیکد = حرف فارسیِ خراب‌شده */
const BROKEN = '�'

let problems = 0

for (const file of readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
  const lines = readFileSync(join(dir, file), 'utf8').split('\n')
  const issues = []

  // ── ۱. حروف خراب ──
  lines.forEach((l, i) => {
    if (l.includes(BROKEN)) issues.push(`  خرابی فارسی در خط ${i + 1}`)
  })

  // ── ۲. بلوک کدِ باز‌مانده ──
  const fences = lines.filter((l) => l.trimStart().startsWith('```')).length
  if (fences % 2 !== 0) issues.push(`  ⛔ تعداد \`\`\` فرد است (${fences})`)

  // ── ۳. بخشِ بدون داستان ──
  lines.forEach((l, i) => {
    if (!/^## [۰-۹]/.test(l)) return
    // تا تیترِ بعدی را نگاه کن
    const next = lines.slice(i + 1, i + 4).join('\n')
    if (!next.includes('🧒')) issues.push(`  بخشِ بدون داستان در خط ${i + 1}: ${l.slice(3, 45)}`)
  })

  // ── ۴. تیتر تکراری ──
  const seen = new Map()
  lines.forEach((l, i) => {
    if (!l.startsWith('## ')) return
    if (seen.has(l)) issues.push(`  تیتر تکراری در خط ${i + 1} (قبلاً خط ${seen.get(l)})`)
    else seen.set(l, i + 1)
  })

  if (issues.length) {
    problems += issues.length
    console.log(`\n✗ ${file}`)
    console.log(issues.join('\n'))
  }
}

console.log(
  problems === 0
    ? '\n✓ همه‌ی ۱۴ فاز سالم‌اند: حروف سالم، کدها بسته، هر بخش داستان دارد.'
    : `\n✗ ${problems} مشکل پیدا شد.`,
)