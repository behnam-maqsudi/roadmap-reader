/**
 * آزمایش-پرسش-v2.test.mjs — صحتِ محتوای پرسش‌های نسخهٔ ۲
 *
 * ⭐ چرا این تست هست؟
 *
 * محتوای پرسش‌ها دستی نوشته می‌شود (JSON) و کامپوننت‌ها در زمان اجرا
 * آن را می‌خوانند. یک خطای کوچک — مثلاً `correct` که به گزینه‌ی ناموجود
 * اشاره می‌کند یا گزینه‌ی درست که با یک دام تکرار شده — در رابط کاربری
 * **بی‌صدا** خراب می‌شود: دکمه هرگز سبز نمی‌شود، یا دو گزینهٔ یکسان
 * نمایش داده می‌شود و کاربر هیچ‌وقت نمی‌فهمد چرا.
 *
 * پس اینجا ساختار را **قبل** از رسیدن به مرورگر می‌سنجیم.
 *
 * اجرا:  node --experimental-vm-modules --test ابزار/آزمایش-پرسش-v2.test.mjs
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const dir = join(root, 'محتوا', 'پرسش-v2')

/** تبدیلِ ارقام فارسی به لاتین — برای تطبیق شمارهٔ فاز با نامِ فایل */
const FA = '۰۱۲۳۴۵۶۷۸۹'
const toLatinDigits = (s) =>
  [...s].reduce(
    (out, ch) => (FA.includes(ch) ? out + FA.indexOf(ch) : out + ch),
    '',
  )

const files = existsDir() ? readdirSync(dir).filter((f) => f.endsWith('.json')) : []

function existsDir() {
  try {
    readdirSync(dir)
    return true
  } catch {
    return false
  }
}

/** همهٔ پرسش‌های همهٔ فایل‌ها، با شمارهٔ فاز کنارشان */
const allQuestions = files.flatMap((f) => {
  const json = JSON.parse(readFileSync(join(dir, f), 'utf8'))
  return json.questions.map((q) => ({ ...q, phase: json.num, file: f }))
})

describe('پرسش‌های نسخهٔ ۲ — ساختار', () => {
  it('دست‌کم یک فاز پرسش دارد', () => {
    assert.ok(files.length > 0, 'هیچ فایل پرسشی در محتوا/پرسش-v2 نیست')
  })

  it('نامِ هر فایل با شمارهٔ داخلش می‌خواند', () => {
    for (const f of files) {
      const json = JSON.parse(readFileSync(join(dir, f), 'utf8'))
      const m = /فاز-(\S+)\.json$/.exec(f)
      assert.ok(m, `نامِ فایل قابل خواندن نیست: ${f}`)
      assert.equal(
        String(json.num).padStart(2, '0'),
        toLatinDigits(m[1]).padStart(2, '0'),
        `${f} باید دربارهٔ فازِ ${json.num} باشد`,
      )
    }
  })

  it('هر پرسش فیلدهای مشترک را دارد', () => {
    for (const q of allQuestions) {
      assert.ok(q.id, `${q.file}: پرسشی بدون id`)
      assert.ok(q.title, `${q.id}: title خالی`)
      assert.ok(q.prompt, `${q.id}: prompt خالی`)
      assert.ok(q.question, `${q.id}: question خالی`)
      assert.ok(q.section, `${q.id}: section خالی`)
      assert.ok(['choice', 'predict', 'exercise'].includes(q.kind), `${q.id}: kind ناشناخته`)
    }
  })

  it('شناسهٔ پرسش‌ها یکتاست', () => {
    const ids = allQuestions.map((q) => q.id)
    assert.equal(new Set(ids).size, ids.length, 'id تکراری وجود دارد')
  })

  it('هر فاز حداقل یک پرسش دارد', () => {
    const perPhase = new Map()
    for (const q of allQuestions) {
      perPhase.set(q.phase, (perPhase.get(q.phase) ?? 0) + 1)
    }
    for (const [phase, n] of perPhase) {
      assert.ok(n >= 1, `فاز ${phase} پرسش ندارد`)
    }
  })
})

describe('پرسش‌های انتخابی (choice)', () => {
  const choices = allQuestions.filter((q) => q.kind === 'choice')

  it('دست‌کم یک پرسشِ انتخابی وجود دارد', () => {
    assert.ok(choices.length > 0)
  })

  for (const q of choices) {
    it(`${q.id}: ساختارِ درست دارد`, () => {
      assert.ok(q.options.length >= 2, 'کمتر از دو گزینه')
      for (const [i, o] of q.options.entries()) {
        assert.ok(o.text?.trim(), `گزینهٔ ${i} متن ندارد`)
        assert.ok(o.why?.trim(), `گزینهٔ ${i} توضیح ندارد`)
      }
      assert.ok(
        Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length,
        `correct=${q.correct} به گزینهٔ موجود اشاره نمی‌کند`,
      )
      assert.ok(q.because?.trim(), 'توضیحِ کلیِ جواب ندارد')
    })

    it(`${q.id}: گزینه‌ها یکتا هستند`, () => {
      const texts = q.options.map((o) => o.text)
      assert.equal(new Set(texts).size, texts.length, 'دو گزینه متنِ یکسان دارند')
    })

    it(`${q.id}: هر گزینه توضیحِ مخصوصِ خودش را دارد`, () => {
      // اگر دو گزینه توضیحِ یکسان داشته باشند، یعنی یکی را کپی کرده‌ایم و
      // بازخوردِ آن دو برای کاربر یکی می‌شود — یعنی بی‌فایده.
      const whys = q.options.map((o) => o.why)
      assert.equal(new Set(whys).size, whys.length, 'دو گزینه توضیحِ یکسان دارند')
    })
  }
})

describe('پرسش‌های پیش‌بینی (predict)', () => {
  const predicts = allQuestions.filter((q) => q.kind === 'predict')

  it('دست‌کم یک پرسشِ پیش‌بینی وجود دارد', () => {
    assert.ok(predicts.length > 0)
  })

  for (const q of predicts) {
    it(`${q.id}: ساختارِ درست دارد`, () => {
      assert.ok(q.output?.trim(), 'خروجیِ واقعی ندارد')
      assert.ok(q.why?.trim(), 'توضیحِ جواب ندارد')
      assert.ok(q.traps.length >= 2, 'کمتر از دو دام')
      if (q.code) {
        assert.ok(q.lang, 'کد دارد ولی lang ندارد')
      }
      for (const [i, t] of q.traps.entries()) {
        assert.ok(t.text?.trim(), `دام ${i} متن ندارد`)
        assert.ok(t.why?.trim(), `دام ${i} توضیح ندارد`)
      }
    })

    it(`${q.id}: پاسخِ درست در میانِ دام‌ها تکرار نشده`, () => {
      // ⭐ این مهم‌ترین تستِ این فایل است.
      //
      // کامپوننت، گزینهٔ درست را از `output` می‌سازد و به ابتدای فهرستِ
      // دام‌ها اضافه می‌کند. اگر دامی متنِ درست را داشته باشد، کاربر دو
      // گزینهٔ **یکسان** می‌بیند که یکی‌شان غلط است — و هیچ خطایی هم رخ
      // نمی‌دهد. اینجا گرفته می‌شود.
      const clash = q.traps.find((t) => t.text === q.output)
      assert.equal(
        clash,
        undefined,
        `دامی با متنِ پاسخِ درست یکی است: «${q.output}»`,
      )
    })

    it(`${q.id}: دام‌ها یکتا هستند`, () => {
      const texts = q.traps.map((t) => t.text)
      assert.equal(new Set(texts).size, texts.length, 'دو دام متنِ یکسان دارند')
    })
  }
})

describe('پرسش‌های تمرینی (exercise)', () => {
  const exercises = allQuestions.filter((q) => q.kind === 'exercise')

  it('دست‌کم یک پرسشِ تمرینی وجود دارد', () => {
    assert.ok(exercises.length > 0)
  })

  for (const q of exercises) {
    it(`${q.id}: ساختارِ درست دارد`, () => {
      assert.ok(q.steps?.length > 0, 'راهنمای مرحله‌به‌مرحله ندارد')
      assert.ok(q.solution?.trim(), '⭐ جواب ندارد — بزرگ‌ترین قابلیت نسخهٔ ۲')
    })

    it(`${q.id}: جدول‌های داده پهن و یکدست هستند`, () => {
      for (const t of [q.data, q.answerData].filter(Boolean)) {
        assert.ok(t.name, 'جدول نام ندارد')
        assert.ok(t.columns.length > 0, 'جدول ستون ندارد')
        for (const [i, row] of t.rows.entries()) {
          assert.equal(
            row.length,
            t.columns.length,
            `سطر ${i} عرضِ ${row.length} دارد ولی ${t.columns.length} ستون تعریف شده`,
          )
          assert.ok(
            row.every((c) => typeof c === 'string'),
            'خانه‌های جدول باید رشته باشند (React key و رندر می‌خواهند)',
          )
        }
      }
    })

    it(`${q.id}: دادهٔ خروجی هم دارد`, () => {
      assert.ok(q.answerData, 'بدونِ answerData کاربر نمی‌تواند جوابش را مقایسه کند')
    })
  }
})
