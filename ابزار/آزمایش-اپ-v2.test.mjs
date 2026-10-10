/**
 * آزمایش-اپ-v2.test.mjs — رندرِ واقعیِ نسخهٔ ۲ با دادهٔ واقعی
 *
 * ⭐ چرا این تست لازم است؟
 *
 * تست‌های قبلی یا **سورس** را نگاه می‌کردند (`آزمایش-چیدمان-v2`) یا فقط یک
 * کامپوننت را رندر می‌کردند (`آزمایش-لنگر-واقعی-v2`). هیچ‌کدام نگفتند که
 * **خروجیِ واقعیِ صفحه** چه شکلی است.
 *
 * و این تفاوتِ کوچک، تفاوتِ بزرگی است: تایپ‌اسکریپت فقط می‌گوید «امضا درست
 * است». اگر پراپی اشتباه پاس داده شود، یا کلیدی از `undefined` خوانده شود،
 * تایپ ساکت می‌ماند و صفحه در مرورگر خالی می‌ماند — بدون یک خطای قابل‌دیدن.
 *
 * ⭐⭐ چرا DOM نداریم، و چرا این راه درست است؟
 *
 * `jsdom` در `node_modules` نیست و پروژه **آفلاین** است، پس نصبش نمی‌کنیم.
 * و لازم هم نیست: `renderToStaticMarkup` در سرور اجرا می‌شود و `useEffect`
 * در سرور اجرا **نمی‌شود**. یعنی رندرِ خودِ `App` همیشه در حالتِ «در حال
 * بارگذاری» می‌ماند و محتوایش را هرگز نشان نمی‌دهد.
 *
 * پس کار را دو تکه کردیم:
 *
 *   ۱) **خودِ `App`** رندر می‌شود → ثابت می‌کند پوسته بالا می‌آید و صفحه پر است.
 *   ۲) **درختِ محتوا** — همان `PhaseNav` و `PhaseSection` که `App` می‌چیند —
 *      با دادهٔ واقعی رندر می‌شود → ثابت می‌کند محتوا درست ساخته می‌شود.
 *
 * و برای اینکه تکهٔ دوم از `App` جدا نشود، همین فایل چند assert دارد که
 * `App` هنوز همان پراپ‌ها را می‌دهد. اگر روزی `App` را عوض کرد، این تست
 * می‌افتد — نه اینکه بی‌صدا دربارهٔ یک درختِ ناموجود حرف بزند.
 *
 * ⭐⭐ سناریویِ کلیدی: **چند فاز هم‌زمان باز**.
 *
 * هر فاز سرتیترِ «منابع» و «جمع‌بندی» خودش را دارد. بدون پیشوندِ لنگر،
 * شناسه‌ها تکرار می‌شوند و کلیک روی فهرستِ فازِ سوم سرتیترِ فازِ اول را پیدا
 * می‌کند — بی‌صدا، بدون خطا، فقط لینکِ غلط. اینجا **کل صفحه** را می‌سنجیم،
 * نه فقط یک کامپوننت.
 *
 * اجرا:  node --experimental-vm-modules --test ابزار/آزمایش-اپ-v2.test.mjs
 */

import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { build } from 'esbuild'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

let mod
const scratch = join(root, 'ابزار', '.موقت-اپ-v2')

/** مسیرهای کامپوننت‌ها — یک‌جا، تا باندل و تست روی یک چیز باشند. */
const P = {
  app: join(root, 'src', 'v2', 'App.tsx'),
  nav: join(root, 'src', 'v2', 'components', 'PhaseNav.tsx'),
  section: join(root, 'src', 'v2', 'components', 'PhaseSection.tsx'),
}

before(async () => {
  mkdirSync(scratch, { recursive: true })
  const entry = join(scratch, 'entry.mjs')

  writeFileSync(
    entry,
    `
import { createElement as h, Fragment } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import App from ${JSON.stringify(P.app)}
import { PhaseNav } from ${JSON.stringify(P.nav)}
import { PhaseSection } from ${JSON.stringify(P.section)}

/** ⭐ تکهٔ ۱: خودِ پوسته. */
export function renderApp() {
  return renderToStaticMarkup(h(App))
}

/**
 * ⭐ تکهٔ ۲: درختِ محتوا — **همان چیزی که \`App\` می‌چیند**.
 *
 * ترتیبِ \`<PhaseNav>\` و \`<main>\` عمداً همانِ \`App\` است: در RTL اولین
 * ستون سمت راست می‌افتد، پس فهرست باید اول نوشته شود.
 *
 * تست‌های پایین بررسی می‌کنند که \`App\` هنوز همین پراپ‌ها را می‌دهد.
 */
export function renderTree(props) {
  const { docs, openIds, questions } = props
  const open = docs.filter((d) => openIds.has(d.id))

  return renderToStaticMarkup(
    h(
      Fragment,
      null,
      h(
        'aside',
        null,
        h(PhaseNav, {
          groups: [
            { title: 'شروع کنید', docs: docs.filter((d) => d.kind === 'guide') },
            { title: 'فازها', docs: docs.filter((d) => d.kind === 'phase') },
            { title: 'مرجع', docs: docs.filter((d) => d.kind === 'index') },
          ],
          openIds,
          onToggle: () => {},
          questions,
        }),
      ),
      h(
        'main',
        null,
        ...open.map((d) =>
          h(PhaseSection, {
            key: d.id,
            doc: d,
            questions: questions.get(d.num) ?? [],
          }),
        ),
      ),
    ),
  )
}
`,
    'utf8',
  )

  const result = await build({
    entryPoints: [entry],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    write: false,
    jsx: 'automatic',
    external: ['react', 'react-dom', 'react-dom/server'],
    loader: { '.css': 'empty' },
    // ⚠️ `import.meta.glob` را باید Vite مدیریت کند؛ esbuild آن را
    // نمی‌شناسد. پس یک پلاگینِ کوچک می‌نویسیم که glob را به فایل‌های
    // واقعیِ روی دیسک تبدیل کند — دقیقاً همان کاری که Vite در بیلد می‌کند.
    plugins: [globShim()],
  })

  const bundlePath = join(scratch, 'bundle.mjs')
  writeFileSync(bundlePath, result.outputFiles[0].text, 'utf8')
  mod = await import(pathToFileURL(bundlePath).href)
})

after(() => rmSync(scratch, { recursive: true, force: true }))

/**
 * ⭐ شبیه‌سازیِ `import.meta.glob`.
 *
 * esbuild این را نمی‌فهمد؛ اگر رهایش کنیم، باندل خالی درمی‌آید یا با خطای
 * «not a function» می‌میرد — همان چیزی که نسخهٔ اولِ این شیم داد.
 *
 * ⚠️ قاعده‌ای که اینجا رعایت شده و در نسخهٔ اول نبود:
 * **فقط عبارت `import.meta.glob(...)` عوض می‌شود، نه کلِ فایل.** نسخهٔ اول
 * فایل را از نو می‌ساخت و در نتیجه `loadDocs` و `loadDocIndex` را از بین می‌برد
 * و باندل با خطای «No matching export» می‌افتاد.
 *
 * مسیرها هم دقیقاً مثل Vite ساخته می‌شوند: **نسبت به فایلِ اعلام‌کننده**، نه
 * نسبت به importer. برای همین `docs.ts` (که الگوی `../فازها/*.md` دارد) با
 * کلیدهای `../فازها/…` پر می‌شود و `content.ts` (که الگوی خودش را دارد) با
 * کلیدهای `../../محتوا/پرسش-v2/…`.
 */
function globShim() {
  /** همان شکلی که Vite با `import: 'default'` می‌سازد. */
  const loaderFor = (value) => JSON.stringify(async () => ({ default: value }))

  return {
    name: 'glob-shim',
    setup(b) {
      b.onLoad({ filter: /docs\.ts$/ }, (args) => {
        const phaseDir = join(root, 'فازها')
        const map = {}
        for (const f of readdirSync(phaseDir).filter((f) => f.endsWith('.md'))) {
          map[`../فازها/${f}`] = readFileSync(join(phaseDir, f), 'utf8')
        }
        return patchGlob(args, map, loaderFor)
      })

      b.onLoad({ filter: /v2[\\/]content\.ts$/ }, (args) => {
        const dir = join(root, 'محتوا', 'پرسش-v2')
        const map = {}
        if (listDir(dir)) {
          for (const f of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
            const json = JSON.parse(readFileSync(join(dir, f), 'utf8'))
            map[`../../محتوا/پرسش-v2/${f}`] = json
          }
        }
        return patchGlob(args, map, loaderFor)
      })

      b.onLoad({ filter: /study\.ts$/ }, (args) => {
        const dir = join(root, 'محتوا', 'فازها')
        const map = {}
        if (listDir(dir)) {
          for (const f of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
            const json = JSON.parse(readFileSync(join(dir, f), 'utf8'))
            map[`../محتوا/فازها/${f}`] = json
          }
        }
        return patchGlob(args, map, loaderFor)
      })
    },
  }
}

/** فهرستِ پوشه، یا `null` اگر پوشه نبود. */
function listDir(p) {
  try {
    return readdirSync(p)
  } catch {
    return null
  }
}

/** فقط عبارت glob را با شیءِ آماده عوض می‌کند؛ بقیهٔ فایل دست‌نخورده. */
function patchGlob(args, map, loaderFor) {
  const src = readFileSync(args.path, 'utf8')

  // ⚠️ `Record<string, () => Promise<X>>` دو تا `>` دارد. اگر الگو را
  // `[^>]*>` بگیریم، همان اولی را می‌خورد و یک `>` اضافه می‌ماند که
  // فایل را خراب می‌کند. پس تا `>`ای می‌رویم که **آخرین چیزِ قبل از
  // خطِ بعد** است.
  const patched = src.replace(
    /import\.meta\.glob\([\s\S]*?\)\s*as\s*Record<[\s\S]*?>\s*(?=\n)/,
    '__glob__ as Record<string, () => Promise<any>>',
  )

  if (patched === src) {
    throw new Error(
      `⚠️ الگوی import.meta.glob در ${args.path} پیدا نشد — ` +
        'یعنی ساختارِ فایل عوض شده و این شیم دیگر به کار نمی‌آید',
    )
  }

  const entries = Object.entries(map)
    .map(([k, v]) => `  ${JSON.stringify(k)}: ${loaderFor(v)},`)
    .join('\n')

  return {
    contents:
      `const __glob__: Record<string, () => Promise<any>> = {\n${entries}\n}\n` +
      patched,
    loader: 'ts',
    resolveDir: dirname(args.path),
  }
}

/* ─────────────────────────── دادهٔ واقعی ─────────────────────────── */

/**
 * ⭐ همان کاری که `src/docs.ts` می‌کند.
 *
 * این عمداً کپیِ کوچکی از همان منطق است، نه `import` کردنش — چون `docs.ts`
 * داخلش `import.meta.glob` دارد که فقط Vite می‌فهمد. اگر روزی این منطق عوض
 * شود، این فایل از قالب می‌ماند؛ تستِ `آزمایش-اسناد` هم رفتارِ واقعی را
 * جداگانه می‌سنجد، پس اینجا لازم نیست.
 */
function makeDoc(path) {
  const raw = path.split('/').pop()
  const content = readFileSync(join(root, path), 'utf8')
  const name = raw.replace(/\.md$/, '').replace(/^فاز-[\d۰-۹٠-٩]+-/, '')

  const isGuide = /راهنما|شروع/.test(raw)
  const isPhase = raw.startsWith('فاز-')
  const digits = /[۰-۹٠-٩]/.test(raw)
    ? raw.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    : raw

  let title = ''
  const m = content.match(/^#\s+(.+)$/m)
  if (m) {
    title = m[1].trim()
    title = title.replace(/^فاز\s*[۰-۹٠-٩0-9]+\s*[—–-]\s*/, '')
    title = title.replace(/^\d+\s*[—–-]\s*/, '')
  }

  return {
    id: path,
    num: isGuide ? -1 : isPhase ? Number(digits.match(/(\d+)/)?.[1] ?? 999) : 999,
    title: title || name,
    content,
    path,
    kind: isGuide ? 'guide' : isPhase ? 'phase' : 'index',
    badge: isGuide ? 'راهنما' : isPhase ? '' : title.includes('اسکلت') ? 'اسکلت' : 'نمایه',
  }
}

const allDocs = readdirSync(join(root, 'فازها'))
  .filter((f) => f.endsWith('.md'))
  .sort()
  .map((f) => makeDoc(`فازها/${f}`))

const guide = allDocs.find((d) => d.kind === 'guide')
const index = allDocs.find((d) => d.kind === 'index')
const phase00 = allDocs.find((d) => d.kind === 'phase' && d.num === 0)
const phase03 = allDocs.find((d) => d.kind === 'phase' && d.num === 3)

const qDir = join(root, 'محتوا', 'پرسش-v2')
const questionsByPhase = new Map()
for (const f of listDir(qDir) ?? []) {
  if (!f.endsWith('.json')) continue
  const json = JSON.parse(readFileSync(join(qDir, f), 'utf8'))
  questionsByPhase.set(Number(f.replace(/\D/g, '')), json.questions ?? [])
}

const questions = new Map(
  allDocs.filter((d) => d.num >= 0).map((d) => [d.num, questionsByPhase.get(d.num) ?? []]),
)

const openAll = (docs) => ({ docs, openIds: new Set(docs.map((d) => d.id)), questions })
const attrs = (html) => [...html.matchAll(/([\w-]+)="([^"]*)"/g)].map((x) => x[1])
const idsOf = (html) => [...html.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1])
const hrefsOf = (html) => [...html.matchAll(/href="#([^"]+)"/g)].map((x) => x[1])
const fa = (n) => [...String(n)].map((d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]).join('')

/**
 * ⭐ یک جملهٔ «سالم» از متنِ درس.
 *
 * ⚠️ نه هر خطی می‌شود: خطی که نشانه‌گذاریِ مارک‌داون دارد (`>`, `-`, `*`,
 * `|`, `` ` ``, `#`) در HTML به تگ تبدیل می‌شود و رشتهٔ خامش دیگر پیدا
 * نمی‌شود. اولین تلاشِ ما دقیقاً همین اشتباه را کرد و روی خطی فرود آمد که
 * با `>` شروع می‌شد — پس فیلترها اینجا **شرطی** هستند، نه تزئینی.
 */
function probeOf(doc) {
  for (const raw of doc.content.split('\n')) {
    const line = raw.trim()
    if (line.length < 70 || line.length > 160) continue
    if (/^[-*+>#|`\[\]]/.test(line)) continue
    if (/[*_`[\]|]/.test(line)) continue

    const words = line.split(/\s+/).filter((w) => !/^[)\].,:؛،؟!]+$/.test(w))
    if (words.length < 10) continue

    return words.slice(0, 8).join(' ')
  }
  return ''
}

/* ───────────────────────────── تست‌ها ───────────────────────────── */

describe('⭐ پوستهٔ اپ بالا می‌آید', () => {
  it('رندر می‌شود و صفحه پر است', () => {
    const html = mod.renderApp()
    assert.ok(html.length > 0, 'هیچ HTML تولید نشد')
    assert.ok(html.includes('در حال بارگذاری'), 'حالتِ بارگذاری باید دیده شود')
  })

  it('در رندرِ اول خطایی روی صفحه نیست', () => {
    // ⭐ یک `ErrorBoundary` نداریم؛ پس هر خطای رندر یعنی صفحهٔ سفید.
    // در سرور، تنها راهِ دیدنش همین متنِ خروجی است.
    const html = mod.renderApp()
    assert.equal(
      /Cannot read|is not a function|undefined is not|Error:/.test(html),
      false,
      `رندر خطا داد:\n${html.slice(0, 300)}`,
    )
  })
})

describe('⭐ درختِ محتوا با دادهٔ واقعی', () => {
  const docs = [guide, index].filter(Boolean)

  it('هر فازِ باز، یک کارت می‌سازد', () => {
    const html = mod.renderTree(openAll(docs))
    const panels = idsOf(html).filter((id) => id.startsWith('phase-panel-'))

    assert.ok(panels.length > 0, 'هیچ کارتی رندر نشد')
    assert.equal(
      new Set(panels).size,
      panels.length,
      'شناسهٔ کارت‌ها تکراری است — یعنی یک فاز دو بار رندر شده',
    )
  })

  it('هر آیتمِ فهرست دکمه‌ای با aria-expanded دارد', () => {
    // ⭐ بدون این، صفحه‌خوان نمی‌گوید کدام فاز باز است.
    const html = mod.renderTree(openAll(docs))
    const expanded = attrs(html).filter((a) => a === 'aria-expanded')

    assert.ok(expanded.length > 0, 'هیچ دکمهٔ باز/بسته‌ای رندر نشد')
    assert.ok(
      html.includes('aria-expanded="true"'),
      'باید حداقل یک فازِ باز باشد — همه را باز داده‌ایم',
    )
  })

  it('سرتیترِ هر فاز داخلِ کارتِ خودش است', () => {
    const html = mod.renderTree(openAll([phase00]))
    assert.ok(html.includes(phase00.title), `عنوانِ «${phase00.title}» در صفحه نبود`)
  })

  it('متنِ درس هم می‌آید — نه فقط عنوان', () => {
    const html = mod.renderTree(openAll([phase00]))
    const probe = probeOf(phase00)
    assert.ok(probe, 'نتوانستم از متنِ فاز ۰۰ یک جملهٔ سالم بیرون بکشم')
    assert.ok(html.includes(probe), `بخشی از متن رندر نشد: «${probe}»`)
  })

  it('⭐ فازِ بسته، عنوانش در فهرست می‌ماند ولی محتوایش نمی‌آید', () => {
    // ⭐⭐ این دقیقاً همان چیزی است که کاربر خواست: **فهرست تخت**.
    //
    // اگر فهرست تاشدنی بود، بستنِ فاز یعنی ناپدید شدنش از فهرست — و آن‌وقت
    // کاربر راهِ باز کردنش را گم می‌کرد. این تست هر دو طرف را می‌سنجد:
    // عنوان می‌ماند (فهرست)، متن نمی‌آید (کارت).
    const docs = [phase00, phase03, guide].filter(Boolean)
    const html = mod.renderTree({
      docs,
      openIds: new Set([phase00.id]),
      questions,
    })

    const closed = docs.filter((d) => d.id !== phase00.id)
    for (const d of closed) {
      assert.ok(
        html.includes(d.title),
        `عنوانِ فازِ بسته («${d.title}») از فهرست ناپدید شد`,
      )
      const probe = probeOf(d)
      if (probe) {
        assert.equal(
          html.includes(probe),
          false,
          `متنِ فازِ بستهٔ «${d.title}» رندر شد — یعنی بسته نشده`,
        )
      }
    }

    // ⭐ و فازِ باز، هم عنوان دارد هم متن
    assert.ok(html.includes(probeOf(phase00)), 'فازِ باز باید متنش را داشته باشد')
  })

  it('فهرست برای هر سند یک آیتم دارد — کمتر یا بیشتر نه', () => {
    const docs = [guide, index].filter(Boolean)
    const html = mod.renderTree(openAll(docs))

    // `<li>` هم در فهرست هست و هم در فهرستِ مطالب؛ پس **حداقل** به تعداد
    // اسناد باید باشد. اگر روزی آیتمی حذف شود، این عدد می‌افتد.
    const li = (html.match(/<li/g) ?? []).length
    assert.ok(
      li >= docs.length,
      `فقط ${li} آیتم برای ${docs.length} سند — یکی گم شده`,
    )
  })
})

describe('⭐⭐ چند فاز هم‌زمان — همان کاری که کاربر می‌کند', () => {
  const three = [phase00, phase03, guide].filter(Boolean)

  it('هر سه فاز کنار هم رندر می‌شوند', () => {
    const html = mod.renderTree(openAll(three))
    for (const d of three) {
      assert.ok(html.includes(d.title), `فازِ «${d.title}» رندر نشد`)
    }
  })

  it('⭐⭐ هیچ شناسهٔ تکراری در کل صفحه نیست', () => {
    // ⭐⭐ مهم‌ترین تستِ این فایل.
    //
    // با چند فازِ باز، شناسه‌های لنگر می‌توانند تکرار شوند و آن‌وقت کلیک روی
    // فهرستِ فازِ سوم، سرتیترِ فازِ اول را پیدا می‌کند — بی‌صدا، بدون خطا،
    // فقط لینکِ غلط. `آزمایش-لنگر-واقعی-v2` این را برای `Markdown` تنها
    // می‌گیرد؛ اینجا **کل صفحه** را می‌سنجیم.
    const html = mod.renderTree(openAll(three))
    const ids = idsOf(html)
    const dupes = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))]

    assert.equal(
      dupes.length,
      0,
      `شناسهٔ تکراری در صفحه: ${dupes.slice(0, 6).join('، ')}`,
    )
    assert.ok(ids.length > 100, `فقط ${ids.length} شناسه — محتوا کامل رندر نشده`)
  })

  it('هر لینکِ فهرستِ مطالب، مقصدِ خودش را دارد', () => {
    // اگر مقصد نباشد، کلیک بی‌اثر است — بدترین حالتِ بی‌صدا.
    const html = mod.renderTree(openAll(three))
    const hrefs = hrefsOf(html)
    assert.ok(hrefs.length > 5, `فقط ${hrefs.length} لینکِ داخلی رندر شد`)

    const ids = new Set(idsOf(html))
    const orphans = [...new Set(hrefs.filter((h) => !ids.has(h)))]

    assert.equal(
      orphans.length,
      0,
      `لینک‌هایی که مقصد ندارند: ${orphans.slice(0, 6).join('، ')}`,
    )
  })
})

describe('پرسش‌های تعاملی', () => {
  it('پرسش‌های فازی که فایل دارد، زیرِ متنِ همان فاز می‌آیند', () => {
    const n = (questionsByPhase.get(0) ?? []).length
    if (n === 0) return // فاز ۰۰ هنوز پرسش ندارد؛ تست بی‌موضوع است

    assert.ok(
      mod.renderTree(openAll([phase00])).includes('پرسش‌های تعاملی'),
      'سرتیترِ پرسش‌ها باید رندر شود',
    )
  })

  it('فازی که پرسش ندارد، بخشِ خالیِ پرسش نشان نمی‌دهد', () => {
    if (!index) return
    assert.equal(
      mod.renderTree(openAll([index])).includes('پرسش‌های تعاملی'),
      false,
      'برای سندی که پرسش ندارد، نباید بخشِ پرسش ساخته شود',
    )
  })

  it('شمارِ پرسش در فهرست با تعدادِ واقعی می‌خواند', () => {
    const n = (questionsByPhase.get(0) ?? []).length
    if (n === 0) return

    assert.ok(
      mod.renderTree(openAll([phase00])).includes(fa(n)),
      `شمارِ «${fa(n)}» پرسش در فهرست نبود`,
    )
  })
})

describe('⭐ درختِ تست با درختِ واقعیِ App یکی است', () => {
  // ⭐ این بخش، `renderTree` بالا را به `App` وصل نگه می‌دارد. بدون آن،
  // تست‌ها دربارهٔ درختی حرف می‌زدند که هیچ‌کس در اپ نمی‌بیند.
  const src = stripComments(readFileSync(P.app, 'utf8'))

  it('App همان پراپ‌ها را به PhaseNav می‌دهد', () => {
    assert.match(src, /<PhaseNav[\s\S]*openIds=\{openIds\}/, 'فهرست باید openIds را بگیرد')
    assert.match(src, /onToggle=\{toggle\}/, 'فهرست باید toggle را بگیرد')
    assert.match(src, /questions=\{questions\}/, 'فهرست باید شمارِ پرسش‌ها را بگیرد')
  })

  it('App همان پراپ‌ها را به PhaseSection می‌دهد', () => {
    assert.match(src, /<PhaseSection[\s\S]*doc=\{d\}/, 'کارت باید سندش را بگیرد')
    assert.match(
      src,
      /questions=\{questions\.get\(d\.num\) \?\? \[\]\}/,
      'کارت باید پرسش‌های همان فاز را بگیرد',
    )
  })

  it('App فقط فازهای باز را رندر می‌کند', () => {
    assert.match(
      src,
      /all\.filter\(\(d\) => openIds\.has\(d\.id\)\)/,
      'کارت‌ها باید از همان فهرستِ بازها بیایند',
    )
  })
})

/** تست‌های سورس نباید کامنت‌های فارسی را ببینند — وگرنه هر توضیحی که در
 *  کامنت نوشته شود، تست را سبز می‌کند بی‌آنکه کد آن را داشته باشد. */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1')
}