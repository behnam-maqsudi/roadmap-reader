/**
 * _probe.mjs — بررسیِ موقت: الگوهای واقعیِ بلوک‌های نقل‌قول با ایموجی
 * (فایل موقت؛ پس از استفاده حذف می‌شود)
 */
import { readdirSync, readFileSync } from 'node:fs'

const files = readdirSync('فازها').filter((f) => f.endsWith('.md'))
const counts = new Map()

const EMOJI =
  /([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F000}-\u{1F0FF}\u{FE0F}\u{20E3}\s]{1,3})/u

for (const f of files) {
  const text = readFileSync(`فازها/${f}`, 'utf8')
  for (const line of text.split('\n')) {
    if (!line.startsWith('>')) continue
    const m = line.match(/^>\s*(.{1,3}?)\s*\*\*(.{0,45}?):/u)
    if (m) {
      const key = `${m[1].trim()}  **${m[2].trim()}`
      counts.set(key, (counts.get(key) ?? 0) + 1)
    } else {
      const m2 = line.match(/^>\s*(.{1,3}?)(?:\s|$)/u)
      if (m2 && /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F000}-\u{1F0FF}]/u.test(m2[1])) {
        const key = `${m2[1].trim()}  (بدون تیتر)`
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
  }
}

const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
for (const [k, v] of sorted) {
  console.log(String(v).padStart(4), k)
}
console.log('\nمجموع انواع:', new Set([...counts.keys()].map((k) => k.split(' ')[0])).size)