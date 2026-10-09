/**
 * افزودن-تیتر.mjs — به هر بخشِ داستان‌ها.json فیلدِ `heading` را اضافه می‌کند.
 *
 * چرا لازم است؟ چون اسکریپتِ درج، بخش را با **متنِ تیتر** پیدا می‌کند،
 * نه با شماره‌ی خط. این کار از اشتباه گذاشتنِ داستان زیرِ تیترِ اشتباه جلوگیری می‌کند.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const jsonPath = join(here, 'داستان‌ها.json')

const data = JSON.parse(readFileSync(jsonPath, 'utf8'))

for (const [file, spec] of Object.entries(data)) {
  const lines = readFileSync(join(root, 'فازها', file), 'utf8').split('\n')

  for (const sec of spec.sections ?? []) {
    const heading = lines[sec.line - 1]
    if (!heading || !heading.startsWith('## ')) {
      throw new Error(`${file}: خط ${sec.line} تیتر نیست → «${heading}»`)
    }
    // بخشِ شماره را نگه می‌داریم، متنِ یکتا را هم می‌نویسیم
    sec.heading = heading
    delete sec.line
  }
}

writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8')

const total = Object.values(data).reduce((n, s) => n + (s.sections?.length ?? 0), 0)
console.log(`✓ ${Object.keys(data).length} فایل، ${total} بخش — فیلد heading اضافه شد`)