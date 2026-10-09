/**
 * افزودن-جمله-پایانی.mjs — برای بخش‌هایی که داستان دارند ولی جمله‌ی پایانی ندارند.
 *
 * چرا اسکریپت؟ متن فارسیِ بلند در ابزار ویرایش خطا می‌دهد. این اسکریپت با
 * متنِ کوتاهِ تیتر کار می‌کند، پس دقیق و قابل تکرار است.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

/** شماره‌ی بخش → جمله‌ای که دقیقاً می‌گوید آن بخش چه چیزی را جواب می‌دهد */
const closers = JSON.parse(
  readFileSync(join(here, 'جمله-پایانی.json'), 'utf8'),
)

const only = process.argv[2] // نام فایل؛ بدون آرگومان = همه
const report = []

for (const [file, sections] of Object.entries(closers)) {
  if (only && !file.includes(only)) continue

  const path = join(root, 'فازها', file)

  // ⚠️ این فایل‌ها روی ویندوز با CRLF ذخیره شده‌اند. اگر فقط با \n بشکنیم،
  // هر خط یک \r آخرش می‌ماند و مقایسه‌ی دقیقِ متن هیچ‌وقت جواب نمی‌دهد.
  let lines = readFileSync(path, 'utf8').replace(/\r\n/g, '\n').split('\n')

  let added = 0

  for (const { heading, closer } of sections) {
    const i = lines.findIndex((l) => l === heading)
    if (i < 0) throw new Error(`${file}: تیترِ «${heading}» پیدا نشد`)

    // اگر از قبل هست، دست نمی‌زنیم — این اسکریپت باید قابل تکرار باشد
    if (lines.slice(i + 1, i + 40).some((l) => l.includes('این بخش جواب می‌دهد'))) {
      continue
    }

    // بلوکِ داستان بعد از یک خطِ خالی می‌آید. پس اول خط‌های خالی را رد می‌کنیم،
    // بعد تا وقتی خط با «>» شروع می‌شود ادامه می‌دهیم. اگر این ترتیب را برعکس
    // کنیم، جمله را *قبل* از داستان می‌گذاریم و داستان دیگر اولِ بخش نیست.
    let end = i + 1
    while (end < lines.length && lines[end].trim() === '') end += 1
    while (end < lines.length && lines[end].trimStart().startsWith('>')) end += 1

    lines = [
      ...lines.slice(0, end),
      '>',
      `> **این بخش جواب می‌دهد:** ${closer}`,
      ...lines.slice(end),
    ]
    added += 1
  }

  writeFileSync(path, lines.join('\n'), 'utf8')
  report.push(`${file}: ${added} جمله اضافه شد`)
}

console.log(report.join('\n'))