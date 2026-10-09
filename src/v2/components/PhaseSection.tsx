/**
 * PhaseSection.tsx — کارتِ محتوای یک فاز
 *
 * ⭐⭐ چرا این فایل جدا از `App.tsx`؟
 *
 * یک فاز سه چیز با خود دارد که همیشه با هم می‌آیند و جدا شدنشان فقط دردسر
 * می‌سازد:
 *
 *   ۱) سرتیرش — همان چیزی که در فهرستِ راست کلیک می‌شود
 *   ۲) متن و فهرستِ مطالبِ خودش
 *   ۳) پرسش‌های خودش
 *
 * اگر این‌ها را در `App` جدا نگه داریم، دوباره همان مشکلِ نسخهٔ اول برمی‌گردد:
 * متن یک جا، پرسش‌ها یک جای دیگر، و «کدام فاز باز است» یک متغیرِ سراسری.
 * اینجا هر سه داخلِ **همان** کارت زندگی می‌کنند، پس هیچ‌وقت از هم جدا نمی‌افتند.
 *
 * ⚠️ این فایل به نسخهٔ ۱ چیزی نمی‌فروشد؛ فقط از `../docs` و `../slug`
 * می‌خواند.
 */

import { useMemo } from 'react'
import { Badge } from './ui/badge'
import { Markdown } from '../Markdown'
import { ChoiceQ } from './QuestionCard'
import { PredictQ } from './PredictCard'
import { ExerciseQ } from './DataCard'
import { extractHeadings } from '../../slug'
import type { Doc } from '../types'
import type { Question } from '../types'

/** رنگِ اختصاصیِ هر فاز — کل رابط با آن عوض می‌شود. */
export function phaseColor(num: number): string {
  if (num < 0) return 'var(--phase-guide)'
  return `var(--phase-${Math.min(num, 13)})`
}

/** اعدادِ فارسی، چون متنِ درس فارسی است. */
const FA: Record<string, string> = {
  '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
  '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
}
export const fa = (n: number | string) =>
  String(n).replace(/\d/g, (d) => FA[d] ?? d)

/** برچسبِ کوتاه زیرِ عنوان: «فاز ۳۰» یا «راهنما» یا «نمایه». */
function badgeOf(d: Doc): string {
  if (d.kind === 'phase') return `فاز ${fa(d.num)}`
  return d.badge || 'نمایه'
}

/** فهرستِ مطالبِ همین فاز — از همان تابعِ نسخهٔ ۱. */
function useToc(content: string, prefix: string) {
  return useMemo(
    () =>
      extractHeadings(content)
        .filter((h) => h.level === 2 || h.level === 3)
        .map(({ id, text, level }) => ({ id: `${prefix}${id}`, text, level })),
    [content, prefix],
  )
}

/** لیستِ پرسش‌های یک فاز — با یک سرتیتر و شمارش. */
function QuestionList({ questions }: { questions: Question[] }) {
  if (questions.length === 0) return null

  return (
    <section aria-label="پرسش‌های این فاز" className="flex flex-col gap-4">
      <header className="flex items-center gap-2">
        <h3 className="text-sm font-bold">پرسش‌های تعاملی</h3>
        <Badge tone="accent">{fa(questions.length)} پرسش</Badge>
      </header>
      {questions.map((q) => (
        <QuestionRow key={q.id} q={q} />
      ))}
    </section>
  )
}

/**
 * انتخابِ کامپوننت بر اساس `kind`.
 *
 * ⭐ دلیلِ جدا بودنش: `kind` یک رشتهٔ آزاد است، پس TypeScript نمی‌تواند ثابت
 * کند که `q` از نوع درست است. این الگو، همان بررسی را در زمانِ اجرا انجام
 * می‌دهد و کامپوننت‌ها هم امضای دقیق خودشان را نگه می‌دارند.
 */
function QuestionRow({ q }: { q: Question }) {
  switch (q.kind) {
    case 'choice':
      return <ChoiceQ q={q} />
    case 'predict':
      return <PredictQ q={q} />
    default:
      return <ExerciseQ q={q} />
  }
}

/** فهرستِ مطالبِ یک فاز، درونِ کارتِ خودش. */
function Toc({ items }: { items: { id: string; text: string; level: number }[] }) {
  if (items.length < 2) return null

  return (
    <nav
      aria-label="مطالب این فاز"
      className="mb-6 rounded-[var(--radius-inner)] border border-[var(--border)] bg-[var(--surface-2)] p-4"
    >
      <h3 className="mb-2 text-[0.72rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">
        مطالب این فاز
      </h3>
      <ul className="flex flex-col gap-0.5">
        {items.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block rounded-md py-1 text-[0.84rem] leading-snug text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)] ${
                h.level === 3 ? 'ps-4' : 'font-semibold'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * ⭐ کارتِ محتوای یک فاز — فقط وقتی در فهرست باز شده رندر می‌شود.
 *
 * این کامپوننت **دیگر آکاردئون نیست**. آکاردئون در `ui/accordion.tsx` هست و
 * دست‌نخورده می‌ماند (کامپوننتِ پایه است)، ولی چیدمانِ فعلی خواسته‌ی دیگری
 * دارد: فهرستِ راست تخت می‌ماند و محتوا اینجا، در ستونِ وسط، باز می‌شود.
 *
 * ⭐ ترتیبِ محتوا و دلیلش:
 *
 *   سرتیتر → فهرستِ مطالب → متن → پرسش‌ها
 *
 * فهرست بالای متن است چون خواننده اول می‌خواهد بداند این فاز از چه چیزهایی
 * حرف می‌زند و بعد تصمیم بگیرد کجا بنشیند. پرسش‌ها پایین‌اند چون برای دیدنشان
 * باید متن را خوانده باشی — اگر بالا بود، آدم قبل از خواندن جواب می‌داد و
 * یادگیری از دست می‌رفت.
 */
export function PhaseSection({ doc, questions }: { doc: Doc; questions: Question[] }) {
  /**
   * ⭐ پیشوندِ لنگرها — یکتا در کل صفحه.
   *
   * چرا لازم است؟ چون چند فاز هم‌زمان بازند و هر فاز سرتیترِ «منابع» و
   * «جمع‌بندی» خودش را دارد. بدون این پیشوند، شناسه‌های تکراری می‌شدند و
   * کلیک روی فهرستِ فازِ سوم، سرتیترِ فازِ اول را پیدا می‌کرد.
   *
   * از `num` ساخته می‌شود (نه شمارندهٔ رندر)، پس در هر رندر یکسان است و
   * لنگرها با رندرِ دوباره نمی‌شکنند.
   */
  const anchorPrefix = `f${doc.num === -1 ? 'g' : String(doc.num).padStart(2, '0')}-`
  const toc = useToc(doc.content, anchorPrefix)
  const color = phaseColor(doc.num)

  return (
    <article
      id={`phase-panel-${doc.id}`}
      aria-labelledby={`phase-panel-${doc.id}-title`}
      className="scroll-mt-20 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]"
    >
      {/* ── سرتیترِ کارت ── */}
      <header className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] bg-[var(--surface-2)] px-5 py-4 sm:px-7">
        {doc.kind === 'phase' && (
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[0.75rem] text-[0.8rem] font-bold text-white"
            style={{ background: color }}
          >
            {fa(doc.num)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2
            id={`phase-panel-${doc.id}-title`}
            className="text-lg font-bold leading-snug"
          >
            {doc.title}
          </h2>
          <p className="mt-0.5 text-[0.78rem] text-[var(--text-faint)]">
            {badgeOf(doc)} · {fa(toc.length)} بخش · {fa(questions.length)} پرسش
          </p>
        </div>
      </header>

      {/* ⭐ `mx-auto max-w-[78ch]` یعنی محتوا همیشه وسط می‌ماند.
          عرضِ محدود هم لازم است: خطِ بلندِ فارسی چشم را خسته می‌کند و
          برگشتنِ چشم به خطِ بعد سخت می‌شود. */}
      <div className="mx-auto max-w-[78ch] px-5 py-6 sm:px-7 sm:py-8">
        <Toc items={toc} />
        <Markdown content={doc.content} anchorPrefix={anchorPrefix} />

        {questions.length > 0 && (
          <div className="mt-10 border-t border-[var(--border)] pt-6">
            <QuestionList questions={questions} />
          </div>
        )}
      </div>
    </article>
  )
}