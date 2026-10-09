/**
 * آزمایش-داستان.test.mjs — تست تشخیص بلوک داستان.
 *
 * اجرا:  node --test ابزار/آزمایش-داستان.test.mjs
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

describe('بلوک داستان', () => {
  it('هر بخش فاز ۲ یک داستان دارد', () => {
    const lines = readFileSync(
      join(root, 'فازها', 'فاز-۰۲-nodejs-و-typescript-زیر-کاپوت.md'),
      'utf8',
    ).split('\n')

    const sections = lines.filter((l) => /^## [۰-۹]/.test(l))
    assert.equal(sections.length, 10, 'فاز ۲ باید ۱۰ بخش داشته باشد')

    sections.forEach((heading) => {
      const i = lines.indexOf(heading)
      const next4 = lines.slice(i + 1, i + 5).join('\n')
      assert.ok(
        next4.includes('🧒'),
        `بخشِ «${heading.slice(3, 40)}» داستان ندارد`,
      )
    })
  })

  it('استایل story در CSS تعریف شده', () => {
    const css = readFileSync(join(root, 'src', 'styles.css'), 'utf8')
    assert.ok(css.includes('.prose blockquote.story'), 'استایل story نیست')
    assert.ok(css.includes('.story-label'), 'برچسب story-label نیست')
  })

  it('رندرر بلوک داستان را تشخیص می‌دهد', () => {
    const src = readFileSync(join(root, 'src', 'Markdown.tsx'), 'utf8')
    assert.ok(src.includes('isStoryBlock'), 'تابع isStoryBlock نیست')
    assert.ok(src.includes("className={isStory ? 'story' : undefined}"), 'کلاس story اعمال نمی‌شود')
  })
})