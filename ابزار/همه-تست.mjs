/**
 * همه-تست.mjs — اجرای کل مجموعه‌ی تست با پرچم‌های لازم
 *
 * ⭐ چرا این راه‌انداز هست؟
 *
 * `آزمایش-نحو` برای سنجیدنِ نحوِ فایل‌های تست به `vm.SourceTextModule` نیاز
 * دارد، و آن در Node پشت `--experimental-vm-modules` پنهان است. بدون آن
 * پرچم، آن یک تست هم می‌گوید و آدم نمی‌فهمد چرا.
 *
 * پس به‌جای ساختن یک پرچمِ جدا، این فایل همان مجموعه را **با پرچم** اجرا
 * می‌کند: اول پرچم را می‌گذارد و بعد `node --test` را صدا می‌زند.
 *
 * اجرا:  node ابزار/همه-تست.mjs
 */

import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

const files = readdirSync(here)
  .filter((f) => f.endsWith('.test.mjs'))
  .map((f) => join(here, f))

if (files.length === 0) {
  console.error('✗ هیچ فایل تستی پیدا نشد')
  process.exit(1)
}

console.log(`▶ اجرای ${files.length} فایل تست…\n`)

const result = spawnSync(
  process.execPath,
  ['--experimental-vm-modules', '--no-warnings', '--test', ...files],
  { stdio: 'inherit', cwd: join(here, '..') },
)

process.exit(result.status ?? 1)