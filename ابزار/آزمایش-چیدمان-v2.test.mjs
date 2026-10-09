/**
 * آزمایش-چیدمان-v2.test.mjs — چیدمانِ «فهرستِ راست، محتوای وسط»
 *
 * ⭐ چرا این تست هست؟
 *
 * کاربر سه چیز خواسته بود و هر سه‌ تا یک تصمیمِ معماری است که می‌تواند
 * بی‌صدا برگردد:
 *
 *   ۱) **فهرست راست بماند و آیتم‌ها زیرِ هم باشند** — نه آکاردئون.
 *   ۲) **محتوا وسط بماند** — نه کشیده تا لبه‌ها.
 *   ۳) **باز کردنِ فاز، صفحه را بالا نبرد.**
 *
 * این‌ها در تستِ رندرِ واقعی (`آزمایش-رندر-آکاردئون-v2`) هم هست، ولی آنجا
 * فقط لنگرها را می‌سنجد. اینجا خودِ **چیدمان** را می‌سنجیم، چون چیدمان
 * با تستِ رندر دیده نمی‌شود — کلاس‌های CSS در HTML نهایی نیستند.
 *
 * اجرا:  node --experimental-vm-modules --test ابزار/آزمایش-چیدمان-v2.test.mjs
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

const read = (p) => readFileSync(join(root, 'src', 'v2', p), 'utf8')

/** ⭐ تست‌های سورس باید **کامنت‌های فارسی** را نبینند — وگرنه هر توضیحی
 *  که در کامنت نوشته شود، تست را سبز می‌کند بی‌آنکه کد آن را داشته باشد. */
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1')

const code = {
  app: stripComments(read('App.tsx')),
  nav: stripComments(read('components/PhaseNav.tsx')),
  section: stripComments(read('components/PhaseSection.tsx')),
  markdown: stripComments(read('Markdown.tsx')),
}

describe('⭐ ستون‌ها — فهرستِ راست، محتوای وسط', () => {
  it('شبکه دو ستونی با فهرستِ ۳۰۰ پیکسلی در راست', () => {
    // ⭐ ترتیبِ ستون‌ها در RTL: اولین ستونِ گرید سمت **راست** می‌افتد.
    // پس `[300px_…]` یعنی فهرستِ باریک راست، محتوای پهن چپ.
    assert.match(
      code.app,
      /lg:grid-cols-\[300px_minmax\(0,1fr\)\]/,
      'ستونِ اول باید فهرستِ باریک باشد (در RTL سمت راست)',
    )
  })

  it('فهرست قبل از محتوا نوشته شده — یعنی در RTL سمت راست است', () => {
    const navIdx = code.app.indexOf('<PhaseNav')
    const mainIdx = code.app.indexOf('<main')
    assert.ok(navIdx > -1, 'PhaseNav باید در App باشد')
    assert.ok(navIdx < mainIdx, 'فهرست باید قبل از <main> بیاید تا سمت راست بیفتد')
  })

  it('⭐ محتوا وسط است، نه کشیده', () => {
    assert.match(
      code.app,
      /mx-auto flex max-w-\[900px\] flex-col gap-6/,
      'کارت‌های محتوا باید وسط و با عرضِ محدود باشند',
    )
    assert.match(
      code.section,
      /mx-auto max-w-\[78ch\]/,
      'خودِ متن هم باید وسط بماند — خطِ بلندِ فارسی خسته‌کننده است',
    )
  })

  it('فهرست هنگام اسکرول می‌چسبد و خودش اسکرول می‌خورد', () => {
    assert.match(
      code.app,
      /lg:sticky/,
      'فهرست باید sticky باشد تا با اسکرولِ متن از صفحه نرود',
    )
    assert.match(code.app, /lg:overflow-y-auto/, 'فهرستِ بلند خودش اسکرول بخورد')
  })

  it('در موبایل ستون‌ها روی هم می‌افتند', () => {
    // عرضِ کم، فهرست و متن را هر دو شلوغ می‌کند؛ یکی زیرِ دیگری بهتر است.
    assert.match(code.app, /grid-cols-1|lg:grid-cols-\[300px/, 'بدون lg:، ستون‌ها باید یکی باشند')
  })
})

describe('⭐ فهرست تخت است — آیتم‌ها زیرِ هم، بدون تاشدنی', () => {
  it('هیچ آکاردئونی در فهرست نیست', () => {
    // اگر روزی فهرست آکاردئونی شود، دو لایهٔ «باز و بسته» می‌شود و معلوم
    // نمی‌ماند کدام لایه را کاربر باز کرده — همان چیزی که کاربر نخواست.
    const all = Object.values(code).join('\n')
    assert.equal(
      /<Accordion/.test(all),
      false,
      'فهرست باید تخت باشد — آکاردئون در فهرست، دو لایهٔ تاشدنی می‌سازد',
    )
  })

  it('آیتم‌های فهرست یک لیستِ عمودی‌اند', () => {
    assert.match(code.nav, /<ul className="flex flex-col/, 'فهرست باید عمودی باشد')
    assert.match(code.nav, /<li key=\{d\.id\}>/, 'هر آیتم باید یک <li> باشد')
  })

  it('کلیک روی عنوان، باز و بسته می‌کند', () => {
    // ⭐ «قابلیت collapse» یعنی کلیکِ دوم روی همان عنوان، بسته‌اش کند.
    assert.match(code.nav, /onClick=\{\(\) => onToggle\(d\.id\)\}/, 'کلیک باید toggle کند')
    assert.match(
      code.app,
      /if \(next\.has\(id\)\) next\.delete\(id\)\s*\n\s*else next\.add\(id\)/,
      'toggle باید اگر باز است ببندد و اگر بسته است باز کند',
    )
  })

  it('باز بودن، مجموعه است — چند فاز هم‌زمان', () => {
    // اگر رشتهٔ تک باشد، باز کردن فاز دوم فاز اول را می‌بندد و کاربرِ
    // «مقایسهٔ دو فاز» را از دست می‌دهد.
    assert.match(code.app, /useState<Set<string>>\(new Set\(\)\)/, 'بازها باید Set باشند')
    assert.match(code.nav, /openIds\.has\(d\.id\)/, 'باز بودن از مجموعه خوانده شود')
  })

  it('هر آیتم به کارتِ خودش وصل است', () => {
    // ⭐ بدون این، صفحه‌خوان می‌گوید «یک دکمهٔ باز» ولی نمی‌گوید چه چیزی.
    assert.match(code.nav, /aria-expanded=\{isOpen\}/, 'aria-expanded لازم است')
    assert.match(
      code.nav,
      /aria-controls=\{`phase-panel-\$\{d\.id\}`\}/,
      'aria-controls باید به کارتِ همین فاز اشاره کند',
    )
    assert.match(
      code.section,
      /id=\{`phase-panel-\$\{doc\.id\}`\}/,
      'کارت باید همان شناسه را داشته باشد',
    )
  })

  it('کارتِ محتوا برچسبِ دسترس‌پذیری دارد', () => {
    assert.match(code.section, /aria-labelledby=/, 'کارت باید عنوانش را به فهرست وصل کند')
  })
})

describe('⭐ محتوا بدون پرش به بالای صفحه', () => {
  it('هیچ اسکرولِ اجباری در کل نسخهٔ ۲ نیست', () => {
    // همان رفتاری که کاربر از آن شکایت داشت: کلیک روی فاز، متن را بالای
    // صفحه می‌برد و خواننده جای قبلی‌اش را گم می‌کرد.
    const all = Object.values(code).join('\n')
    const scrolls = all.match(/scrollTo\(|scrollIntoView\(/g) ?? []
    assert.equal(
      scrolls.length,
      0,
      `اسکرولِ اجباری هنوز هست (${scrolls.length} مورد) — محتوا دوباره می‌پرد بالای صفحه`,
    )
  })

  it('فهرست و کارت، از یک منبعِ باز/بسته می‌خوانند', () => {
    // اگر فهرست از `App` و کارت از جای دیگری بداند که باز است، یک روز
    // از هم جدا می‌افتند و نمایش با وضعیتِ واقعی فرق می‌کند.
    assert.match(code.app, /<PhaseNav[\s\S]*openIds=\{openIds\}/, 'فهرست باید openIds را بگیرد')
    assert.match(
      code.app,
      /openDocs\.map\(/,
      'کارت‌ها از فهرستِ بازها ساخته شوند',
    )
  })

  it('کارت برای فازهای باز رندر می‌شود و برای بقیه نه', () => {
    assert.match(code.app, /all\.filter\(\(d\) => openIds\.has\(d\.id\)\)/, 'فقط بازها رندر شوند')
  })
})

describe('جست‌وجو، مقصد را نشان می‌دهد', () => {
  it('جست‌وجو عنوان و متن را می‌گردد', () => {
    assert.match(code.app, /doc\.title\.includes\(q\)/, 'عنوان باید جست‌وجو شود')
    assert.match(code.app, /doc\.content\.includes\(q\)/, 'متنِ درس هم باید جست‌وجو شود')
  })

  it('جست‌وجو همهٔ گروه‌ها را می‌گیرد', () => {
    // سه گروه ساخته می‌شوند: راهنما، فازها، مرجع. اگر یکی جا بماند،
    // نتیجهٔ جست‌وجو ناقص است و آدم فکر می‌کند چیزی وجود ندارد.
    for (const t of ['شروع کنید', 'فازها', 'مرجع']) {
      assert.ok(code.app.includes(t), `گروه «${t}» باید در جست‌وجو هم باشد`)
    }
  })

  it('پیامِ «چیزی پیدا نشد» فقط وقتی واقعاً چیزی نبود', () => {
    assert.match(
      code.app,
      /query && visibleCount === 0/,
      'پیامِ خالی باید به هر دو شرط وابسته باشد',
    )
  })
})