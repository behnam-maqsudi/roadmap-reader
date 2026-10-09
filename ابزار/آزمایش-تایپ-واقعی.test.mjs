/**
 * آزمایش-بررسی-تایپ.test.mjs — آیا بررسیِ TypeScript واقعاً کار می‌کند؟
 *
 * ⭐ چرا این تست هست؟
 *
 * مدت‌ها هر بار `tsc --noEmit` می‌زدیم و صفر می‌گرفتیم و فکر می‌کردیم
 * پروژه type-safe است. ولی ریشه‌ی `tsconfig.json` برابر `files: []` با
 * `references` است — یعنی آن دستور **هیچ فایلی را نمی‌دید**. صفرِ همیشگی
 * یعنی «هیچی چک نشد»، نه «همه‌چیز سالم است».
 *
 * این تست دو چیز را تضمین می‌کند:
 *   ۱. بررسیِ ما (`-p tsconfig.app.json`) به یک خطای واقعی حساس است.
 *   ۲. دستورهای بی‌اثر (`--noEmit` و `-b`) دوباره برنمی‌گردند.
 */

import { describe, it, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const tsc = join(root, 'node_modules', 'typescript', 'bin', 'tsc')

/** فایلی که برای آزمایش، یک خطای نوعِ آشکارا غلط داخلش می‌گذاریم. */
const victim = join(root, 'src', 'App.tsx')
const backup = readFileSync(victim, 'utf8')

after(() => writeFileSync(victim, backup, 'utf8'))

/** tsc را می‌دَواند و کدِ خروج را می‌دهد. */
function run(args) {
  return spawnSync(process.execPath, [tsc, ...args], {
    cwd: root,
    encoding: 'utf8',
    timeout: 120_000,
  }).status
}

/** خطایی می‌گذارد که هیچ راه فراری ندارد. */
function poison() {
  writeFileSync(
    victim,
    backup + '\nconst بدِ_آزمایشی: number = "این یک رشته است"\n',
    'utf8',
  )
}

describe('بررسیِ TypeScript — واقعاً کار می‌کند؟', () => {
  it('پروژه در حالت عادی خطا ندارد', () => {
    assert.equal(run(['-p', 'tsconfig.app.json']), 0, 'خطای واقعی در کد هست')
  })

  it('به یک خطای واقعی حساس است (نه همیشه صفر)', () => {
    poison()
    const status = run(['-p', 'tsconfig.app.json'])
    writeFileSync(victim, backup, 'utf8')

    assert.notEqual(
      status,
      0,
      'خطای عمدی را ندید — یعنی این بررسی اصلاً کد را نمی‌خواند',
    )
  })

  it('دستورِ کورِ tsc --noEmit برنگشته باشد', () => {
    // ⭐ این تست یک ادعای منفی را ثابت می‌کند: `--noEmit` باید **کور** بماند.
    // اگر کسی ریشه‌ی tsconfig.json را عوض کند و آن دستور ناگهان کار کند،
    // یعنی دیگر نمی‌توان به تستِ «حساس است» تکیه کرد.
    //
    // توجه: `-b` (بدون --force) هم کور است چون noEmit چیزی تولید نمی‌کند و
    // کش نمی‌شود — ولی `-b --force` کار می‌کند، چون کش را دور می‌ریزد. پس
    // تنها چیزی که باید کور بماند، `--noEmit` است.
    poison()
    const status = run(['--noEmit'])
    writeFileSync(victim, backup, 'utf8')

    assert.equal(
      status,
      0,
      'tsc --noEmit هم خطا را گرفت — ریشه‌ی tsconfig.json عوض شده و ' +
        'تستِ «حساس است» دیگر معنیِ خودش را ندارد',
    )
  })

  it('همه‌ی بررسی‌ها، واقعاً فایل‌ها را می‌بینند', () => {
    const listed = spawnSync(
      process.execPath,
      [tsc, '-p', 'tsconfig.app.json', '--listFiles'],
      { cwd: root, encoding: 'utf8', timeout: 120_000 },
    ).stdout

    for (const file of ['App.tsx', 'Markdown.tsx', 'slug.d.ts']) {
      assert.ok(
        listed.includes(`src/${file}`),
        `src/${file} در فهرستِ بررسی نیست — بررسی ناقص است`,
      )
    }
  })

  it('دستورِ build در package.json هم درست است', () => {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
    assert.match(
      pkg.scripts.build,
      /tsc -p tsconfig\.app\.json/,
      'build هنوز از tsc -b استفاده می‌کند که هیچ فایلی را نمی‌بیند',
    )
  })
})