/**
 * آزمایش-نحو.test.mjs — آیا هر فایل تست، خودش قابل اجرا هست؟
 *
 * ⭐ چرا این تست هست؟
 *
 * یک بار، یک تست را ویرایش کردم و پرانتزِ بسته جا افتاد. نتیجه این شد که
 * `node --test ابزار/*.test.mjs` یک خطای نحوی داد و **هشت تستِ دیگرِ
 * همان فایل را بی‌سروصدا اجرا نکرد** — و شمارنده چون یک تست کم شده بود،
 * خودش را لو می‌داد، ولی اگر تعداد تصادفی هم‌تر بود، اصلاً معلوم نمی‌شد.
 *
 * ⚠️ چرا `import` نمی‌کنیم؟
 *
 * نسخه‌ی اول هر فایل را `import` می‌کرد. ولی فایل‌های `.test.mjs` خودشان
 * `it(...)` دارند، پس هر بار که این فایل اجرا می‌شد، **همه‌ی تست‌های آن‌ها
 * هم دوباره ثبت و اجرا می‌شدند** — یعنی این تست، کل مجموعه را دو بار
 * اجرا می‌کرد. به‌جایش فقط **نحو** را می‌سنجیم، بدون اجرا.
 *
 * ⚠️ چرا `vm.Script` و regex نمی‌خواهیم؟
 *
 * `vm.Script` یک `Script` است نه `Module`، پس `import`/`export` را نمی‌فهمد.
 * پوشاندنِ کد با یک پوشِ تابع و حذفِ importها با regex هم کار می‌کرد، ولی
 * الگوی چندخطیِ import را می‌شکست و هشت فایل را بی‌دلیل قرمز می‌کرد.
 *
 * راهِ درست `vm.SourceTextModule` است: **همان parser رسمیِ Node** را به کار
 * می‌برد، بدون اجرا و بدون تغییرِ متن. در Node پشت
 * `--experimental-vm-modules` است، برای همین این فایل را با
 * `ابزار/همه-تست.mjs` اجرا کن، نه با `node --test` خام.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const testFiles = readdirSync(here).filter((f) => f.endsWith('.test.mjs'))

/**
 * آیا parser در دسترس است؟ اگر نبود، این فایل را با `node --test` خام
 * اجرا کرده‌اند و تستِ نحو باید بی‌سروصدا رد شود، نه اینکه الکی قرمز شود.
 */
const canParse = typeof vm.SourceTextModule === 'function'

describe('نحوِ فایل‌های تست', () => {
  it('دست‌کم پنج فایل تست وجود دارد', () => {
    assert.ok(testFiles.length >= 5, `فقط ${testFiles.length} فایل تست پیدا شد`)
  })

  it('پرچمِ لازم فعال است (وگرنه این تست بی‌دنده است)', () => {
    assert.ok(
      canParse,
      'این فایل را با «node ابزار/همه-تست.mjs» اجرا کن — ' +
        'parserِ ماژول در Node پشت --experimental-vm-modules است',
    )
  })

  for (const file of testFiles) {
    it(`«${file}» خطای نحوی ندارد`, () => {
      if (!canParse) return // بدون parser، تستِ بالا گوش می‌دهد

      const src = readFileSync(join(here, file), 'utf8')
      // ⚠️ فقط *ساختِ* ماژول؛ نه link نه evaluate. یعنی نه اجرا، نه import.
      assert.doesNotThrow(
        () => new vm.SourceTextModule(src, { identifier: file }),
        `${file} خطای نحوی دارد — یکی از تست‌های دیگر بی‌سروصدا اجرا نمی‌شود`,
      )
    })
  }

  it('هر فایل تست، عنوانِ فارسی دارد (برای خوانایی خروجی)', () => {
    for (const file of testFiles) {
      const src = readFileSync(join(here, file), 'utf8')
      const title = src.match(/describe\(\s*'([^']+)'/)

      assert.ok(title, `${file}: عنوانِ describe ندارد`)
      // حروف فارسی در بازه‌ی U+0600 تا U+06FF هستند
      assert.match(title[1], /[؀-ۿ]/, `${file}: عنوان فارسی نیست — «${title[1]}»`)
    }
  })

  it('هیچ فایل تستی، تستِ دیگر را دوباره اجرا نمی‌کند', () => {
    // اگر یک فایل تست، فایل تستِ دیگری را `import` کند، آن یکی دوباره
    // اجرا می‌شود و شمارشِ کل مجموعه به‌هم می‌ریزد.
    for (const file of testFiles) {
      const src = readFileSync(join(here, file), 'utf8')
      for (const other of testFiles.filter((f) => f !== file)) {
        assert.ok(
          !src.includes(`'./${other}'`),
          `${file} فایلِ ${other} را import می‌کند — تست‌ها دو بار اجرا می‌شوند`,
        )
      }
    }
  })
})