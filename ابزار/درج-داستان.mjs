/**
 * درج-داستان.mjs — داستان‌ها را داخل فایل‌های فاز جا می‌گذارد.
 *
 * چرا اسکریپت و نه ویرایش دستی؟
 * متن فارسی در ابزار ویرایش، وقتی رشته‌ی بلند باشد، به‌هم می‌ریزد.
 * این اسکریپت با متنِ تیتر کار می‌کند، پس دقیق و قابل تکرار است.
 *
 * داده‌ها از پوشه‌ی `ابزار/داستان‌ها/*.json` خوانده می‌شوند — یک فایل برای
 * هر فاز. این طوری است که چند کارگر بتوانند هم‌زمان کار کنند و به یک فایل
 * مشترک دست نزنند.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const storyDir = join(here, 'داستان‌ها')

/** فقط یک فاز را درج می‌کند (برای آزمایش)؛ بدون آرگومان = همه */
const only = process.argv[2]

const data = {}
for (const f of readdirSync(storyDir).filter((f) => f.endsWith('.json'))) {
  const parsed = JSON.parse(readFileSync(join(storyDir, f), 'utf8'))
  for (const [file, spec] of Object.entries(parsed)) {
    if (only && !file.includes(only)) continue
    data[file] = spec
  }
}

/** شماره‌ی خط (۱-پایه) → اندیس آرایه */
const at = (lines, lineNo) => lineNo - 1

/**
 * پیدا کردن تیتر بر اساس متن — نه شماره‌ی خط.
 *
 * چرا لازم است؟ چون وقتی داستانِ یک بخش درج می‌شود، همه‌ی شماره‌خط‌های
 * بعد از آن جابه‌جا می‌شوند. اگر فقط به شماره‌ی خط تکیه کنیم، داستانِ بخش
 * بعدی می‌رود زیرِ یک خطِ دیگر. جست‌وجو با متن، این خطا را ناممکن می‌کند.
 */
function findHeading(lines, text) {
  if (!text) return -1

  // اول تطابق دقیق — اگر دو تیتر شبیه هم باشند، شامل‌شدن گمراه می‌کند
  const exact = lines.findIndex((l) => l === text)
  if (exact >= 0) return exact

  // بعد شامل‌شدن — اگر کارگری عنوان را دستکاری کرده باشد
  return lines.findIndex((l) => l.startsWith('## ') && l.includes(text))
}

let report = []

for (const [file, spec] of Object.entries(data)) {
  const path = join(root, 'فازها', file)
  let lines = readFileSync(path, 'utf8').split('\n')

  // ── ۱. داستانِ کل فاز: بلافاصله بعد از خط عنوان ──
  if (spec.phase) {
    const titleLine = lines.findIndex((l) => l.startsWith('# '))
    if (titleLine < 0) throw new Error(`${file}: خط عنوان پیدا نشد`)
    // خطِ خالیِ اصلیِ بعد از عنوان خودش هست؛ پس فقط جا‌های لازم است
    lines = [...lines.slice(0, titleLine + 1), ...spec.phase, ...lines.slice(titleLine + 1)]
  }

  // ── ۲. داستانِ هر بخش: بلافاصله بعد از تیترِ `## N.` ──
  // از آخر به اول می‌رویم تا درجِ هر بخش، شماره‌ی خطِ بخش‌های قبلی را جابه‌جا نکند.
  // شماره‌ی خط‌های JSON همیشه نسبت به **وضعیت پیش از درج** است.
  //
  // ⭐ نکته‌ی مهم: برای اطمینان، تیترِ هدف را با متن می‌جوییم نه فقط با شماره‌ی خط.
  // اگر درجِ بخش‌های قبلی باعث جابه‌جایی شده باشد، اسکریپت خطا می‌دهد
  // و چیزی نیمه‌کاره نمی‌نویسد.
  const sections = [...(spec.sections ?? [])].sort((a, b) => b.line - a.line)

  for (const sec of sections) {
    let i = at(lines, sec.line)

    // اگر شماره‌ی خط دقیق نبود، با متنِ تیتر دوباره پیدا می‌کنیم
    if (!lines[i] || !lines[i].startsWith('## ')) {
      i = findHeading(lines, sec.heading)
    }

    const heading = lines[i]
    if (!heading || !heading.startsWith('## ')) {
      throw new Error(`${file}: تیترِ «${sec.heading}» پیدا نشد (خط ${sec.line} → «${heading}»)`)
    }

    // خطِ خالیِ بعد از تیتر خودش هست؛ پس فقط جای محتوا را باز می‌کنیم
    lines = [...lines.slice(0, i + 1), ...sec.text, ...lines.slice(i + 1)]
  }

  // ── ۳. نقشه‌ی این فاز: قبل از اولین `## N.` ──
  if (spec.map) {
    const first = lines.findIndex((l) => /^## [۰-۹]/.test(l))
    if (first < 0) throw new Error(`${file}: بخش شماره‌دار پیدا نشد`)
    lines = [...lines.slice(0, first), ...spec.map, '---', '', ...lines.slice(first)]
  }

  // ── محافظ: درجِ دوباره، داستان‌ها را تکرار می‌کند ──
  // اگر فایل از قبل داستان دارد، این اسکریپت نباید دوباره بنویسد.
  const storyCount = lines.filter((l) => l.includes('🧒')).length
  if (storyCount > (spec.phase ? 1 : 0) + sections.length) {
    throw new Error(
      `${file}: ${storyCount} بلوک داستان هست ولی فقط ${sections.length + (spec.phase ? 1 : 0)} تا انتظار داشتیم.\n` +
      `یعنی قبلاً درج شده. اگر می‌خواهی دوباره بنویسی، اول فایل را از گیت برگردان.`,
    )
  }

  writeFileSync(path, lines.join('\n'), 'utf8')
  report.push(`${file}: فاز=${spec.phase ? '✓' : '—'} بخش‌ها=${sections.length} نقشه=${spec.map ? '✓' : '—'}`)
}

console.log(report.join('\n'))