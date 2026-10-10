/**
 * PhaseSection.tsx — کارت محتوای یک فاز و ران‌وی مطالعه (Screen 1 خروجی Stitch)
 *
 * ویژگی‌ها:
 * - هدر سند به سبک Tectonic Obsidian: بردکرامب، برچسب فاز، تخمین زمان مطالعه و پیچیدگی
 * - نوار اقدام سریع: دکمه باز کردن فلش‌کارت‌های این فاز + پرش به سوالات
 * - رندر محتوای مارک‌داون واقعی پروژه با کدهای ترمینالی و کال‌اوت‌ها
 * - سوالات و تمرین‌های تعاملی
 * - کارت پایان فاز: ثبت وضعیت تکمیل و ناوبری به فاز قبل و بعد
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
  if (num < 0) return 'var(--primary)'
  return `var(--phase-${Math.min(num, 13)})`
}

/** اعدادِ فارسی */
const FA: Record<string, string> = {
  '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
  '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
}
export const fa = (n: number | string) =>
  String(n).replace(/\d/g, (d) => FA[d] ?? d)

/** برچسبِ کوتاه زیرِ عنوان: «فاز ۳۰» یا «راهنما» یا «نمایه». */
function badgeOf(d: Doc): string {
  if (d.kind === 'phase') return `فاز ${fa(d.num)}`
  return d.badge || 'راهنمای دوره'
}

/** تخمین سطح پیچیدگی */
function complexityOf(num: number): string {
  if (num < 0) return 'مقدمه و شروع'
  if (num <= 2) return 'مقدماتی و پایه‌ها'
  if (num <= 8) return 'متوسط و پروداکشن'
  return 'معماری ارشد و پیشرفته'
}

/** فهرستِ مطالبِ همین فاز */
function useToc(content: string, prefix: string) {
  return useMemo(
    () =>
      extractHeadings(content)
        .filter((h) => h.level === 2 || h.level === 3)
        .map(({ id, text, level }) => ({ id: `${prefix}${id}`, text, level })),
    [content, prefix],
  )
}

/** لیست پرسش‌های تعاملی */
function QuestionList({ questions, id }: { questions: Question[]; id: string }) {
  if (questions.length === 0) return null

  return (
    <section id={id} aria-label="پرسش‌های این فاز" className="flex flex-col gap-4 scroll-mt-24">
      <header className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
          <h3 className="text-sm font-bold text-[var(--text)]">پرسش‌های تعاملی</h3>
        </div>
        <Badge tone="accent">{fa(questions.length)} پرسش تعاملی</Badge>
      </header>
      {questions.map((q) => (
        <QuestionRow key={q.id} q={q} />
      ))}
    </section>
  )
}

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

export function PhaseSection({
  doc,
  questions,
  isCompleted = false,
  flashcardsCount = 0,
  onToggleComplete,
  onOpenFlashcards,
  onNavigatePhase,
  prevDoc,
  nextDoc,
}: {
  doc: Doc
  questions: Question[]
  isCompleted?: boolean
  flashcardsCount?: number
  onToggleComplete?: (id: string) => void
  onOpenFlashcards?: (doc: Doc) => void
  onNavigatePhase?: (id: string) => void
  prevDoc?: Doc
  nextDoc?: Doc
}) {
  const anchorPrefix = `f${doc.num === -1 ? 'g' : String(doc.num).padStart(2, '0')}-`
  const toc = useToc(doc.content, anchorPrefix)
  const color = phaseColor(doc.num)

  // محاسبه تقریبی زمان مطالعه
  const words = doc.content.trim().split(/\s+/).length
  const estimatedMinutes = Math.max(10, Math.round(words / 170))
  const complexity = complexityOf(doc.num)

  return (
    <article
      id={`phase-panel-${doc.id}`}
      aria-labelledby={`phase-panel-${doc.id}-title`}
      className="scroll-mt-20 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]"
    >
      {/* ── هدر بالایی سند (Tectonic Obsidian) ── */}
      <header className="flex flex-col gap-3.5 border-b border-[var(--border)] bg-[var(--surface-2)]/60 px-5 py-5 sm:px-8">
        {/* نوار بردکرامب و متادیتا */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-faint)]">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-[var(--text-muted)]">نقشه راه بک‌اند و هوش مصنوعی</span>
            <span>/</span>
            <span className="text-[var(--secondary)] font-semibold">{badgeOf(doc)}</span>
          </div>

          <div className="flex items-center gap-2">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[0.7rem] font-bold text-emerald-400">
                <span>✓</span>
                <span>تکمیل‌شده</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-[0.7rem] font-bold text-cyan-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>در حال مطالعه</span>
              </span>
            )}
          </div>
        </div>

        {/* عنوان فاز */}
        <div className="flex items-start gap-3.5 pt-1">
          {doc.kind === 'phase' && (
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold text-white shadow-sm mt-0.5"
              style={{ background: color }}
            >
              {fa(doc.num)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h1
              id={`phase-panel-${doc.id}-title`}
              className="text-xl sm:text-2xl font-black leading-snug tracking-tight text-[var(--text)]"
            >
              {doc.title}
            </h1>
          </div>
        </div>

        {/* نوار متادیتا: زمان مطالعه، سطح، تاییدیه */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <span>⏱️</span>
            <span>زمان تخمینی مطالعه: <strong className="text-[var(--text)]">{fa(estimatedMinutes)} دقیقه</strong></span>
          </div>
          <span className="text-[var(--border-strong)]">•</span>
          <div className="flex items-center gap-1.5">
            <span>📊</span>
            <span>سطح: <strong className="text-[var(--secondary)]">{complexity}</strong></span>
          </div>
          <span className="text-[var(--border-strong)]">•</span>
          <div className="flex items-center gap-1.5">
            <span>🛡️</span>
            <span className="text-emerald-400 font-semibold">تأییدیه مهندسی SRE & AI</span>
          </div>
        </div>

        {/* نوار اقدام سریع (دکمه‌های فلش‌کارت، تمرین‌ها و...) */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[var(--border)]/60">
          {flashcardsCount > 0 && onOpenFlashcards && (
            <button
              type="button"
              onClick={() => onOpenFlashcards(doc)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3.5 py-1.5 text-xs font-bold text-[var(--accent-text)] hover:opacity-90 transition-opacity shadow-sm"
            >
              <span>🗂️</span>
              <span>فلش‌کارت‌های این فاز ({fa(flashcardsCount)} کارت)</span>
            </button>
          )}

          {questions.length > 0 && (
            <a
              href={`#phase-panel-${doc.id}-questions`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-3)] transition-colors"
            >
              <span>✍️</span>
              <span>تمرین‌های تعاملی ({fa(questions.length)} تسک)</span>
            </a>
          )}

          <span className="ms-auto text-[0.72rem] text-[var(--text-faint)]">
            {fa(toc.length)} سرتیتر
          </span>
        </div>
      </header>

      {/* ── ستون اصلی محتوا (ارگونومی خواندن ~78ch) ── */}
      <div className="mx-auto max-w-[78ch] px-5 py-6 sm:px-8 sm:py-8">
        <div className="prose">
          <Markdown content={doc.content} anchorPrefix={anchorPrefix} />
        </div>

        {/* بخش پرسش‌های تعاملی */}
        {questions.length > 0 && (
          <div className="mt-12 border-t border-[var(--border)] pt-8">
            <QuestionList
              id={`phase-panel-${doc.id}-questions`}
              questions={questions}
            />
          </div>
        )}

        {/* ── کارت اتمام فاز و ناوبری (Screen 1 Footer) ── */}
        <section className="mt-14 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/70 p-6 text-center">
          <div className="mx-auto max-w-md flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[var(--primary)]/15 border border-[var(--primary)]/30 grid place-items-center text-lg">
              {isCompleted ? '🏆' : '🎯'}
            </div>
            <h3 className="text-base font-bold text-[var(--text)]">
              {isCompleted
                ? `تبریک! این فاز را به پایان رسانده‌اید.`
                : `آیا مباحث و تمرین‌های ${badgeOf(doc)} را به پایان رساندید؟`}
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              با علامت‌گذاری به عنوان تکمیل‌شده، پیشرفت دوره شما به‌روزرسانی شده و کارت فاز سبز می‌شود.
            </p>

            {onToggleComplete && (
              <button
                type="button"
                onClick={() => onToggleComplete(doc.id)}
                className={`mt-2 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-sm ${
                  isCompleted
                    ? 'border border-[var(--border)] bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text)]'
                    : 'bg-[var(--primary)] text-[var(--accent-text)] hover:opacity-95 hover:scale-[1.02]'
                }`}
              >
                <span>{isCompleted ? 'لغو وضعیت تکمیل' : '✓ علامت‌گذاری به عنوان تکمیل‌شده'}</span>
              </button>
            )}
          </div>

          {/* کارت‌های ناوبری به فاز قبل و بعد */}
          {(prevDoc || nextDoc) && (
            <div className="mt-6 pt-5 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-3 text-start">
              {prevDoc ? (
                <button
                  type="button"
                  onClick={() => onNavigatePhase?.(prevDoc.id)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 hover:border-[var(--secondary)] transition-all group"
                >
                  <div className="text-[0.7rem] text-[var(--text-faint)]">← فاز قبلی</div>
                  <div className="mt-0.5 text-xs font-bold text-[var(--text)] truncate group-hover:text-[var(--secondary)]">
                    {prevDoc.title}
                  </div>
                </button>
              ) : <div />}

              {nextDoc && (
                <button
                  type="button"
                  onClick={() => onNavigatePhase?.(nextDoc.id)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 hover:border-[var(--primary)] transition-all group text-end"
                >
                  <div className="text-[0.7rem] text-[var(--text-faint)]">فاز بعدی →</div>
                  <div className="mt-0.5 text-xs font-bold text-[var(--text)] truncate group-hover:text-[var(--primary)]">
                    {nextDoc.title}
                  </div>
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </article>
  )
}