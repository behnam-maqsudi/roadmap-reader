/**
 * App.tsx — پوستهٔ نسخهٔ ۲
 *
 * ⭐ چیدمان سه‌ستون، مثل نسخهٔ ۱ ولی با نقش‌های روشن‌تر:
 *
 *   راست: فهرست فازها      وسط: متنِ درس (کارت‌های رنگی)      چپ: پرسش‌ها
 *
 * چرا پرسش‌ها جدا و در چپ؟ چون سه کارِ متفاوت‌اند و نباید قاطی شوند:
 * «کجا هستم» / «چه می‌خوانم» / «فهمیدم یا نه». در نسخهٔ ۱ تمرین‌ها در همان
 * ستونِ چپِ فلش‌کارت بودند و هر دو با هم بار می‌شدند.
 *
 * ⚠️ نکتهٔ مهم: این فایل **هیچ‌چیزِ نسخهٔ ۱ را تغییر نمی‌دهد**. فقط
 * `loadDocs` را از `../docs` می‌خواند — یعنی همان متن، همان فایل.
 */

import { useEffect, useMemo, useState } from 'react'
import { Markdown } from './Markdown'
import { ChoiceQ } from './components/QuestionCard'
import { PredictQ } from './components/PredictCard'
import { ExerciseQ } from './components/DataCard'
import { Progress } from './components/ui/progress'
import { Badge } from './components/ui/badge'
import { loadDocs, loadAllQuestions } from './content'
import { extractHeadings } from '../slug'
import type { Doc } from '../types'
import type { Question } from './types'

/** رنگِ اختصاصیِ هر فاز — کل رابط با آن عوض می‌شود. */
function phaseColor(num: number): string {
  if (num < 0) return 'var(--phase-guide)'
  return `var(--phase-${Math.min(num, 13)})`
}

/** اعدادِ فارسی، چون متنِ درس فارسی است. */
const FA: Record<string, string> = {
  '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
  '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
}
const fa = (n: number | string) => String(n).replace(/\d/g, (d) => FA[d] ?? d)

export default function App() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [currentId, setCurrentId] = useState('')
  const [questions, setQuestions] = useState<Map<number, Question[]>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    loadDocs()
      .then(async (loaded) => {
        if (cancelled) return
        setDocs(loaded)

        const q = await loadAllQuestions(loaded)
        if (cancelled) return
        setQuestions(
          new Map([...q.entries()].map(([k, v]) => [k, v.questions])),
        )

        // ⭐ مثل نسخهٔ ۱، راهنمای شروع باز می‌شود نه فاز ۰۰
        const guide = loaded.find((d) => d.kind === 'guide')
        const firstPhase = loaded.find((d) => d.kind === 'phase')
        setCurrentId((guide ?? firstPhase ?? loaded[0])?.id ?? '')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  const current = docs.find((d) => d.id === currentId)

  const guides = useMemo(() => docs.filter((d) => d.kind === 'guide'), [docs])
  const phases = useMemo(() => docs.filter((d) => d.kind === 'phase'), [docs])
  const indexes = useMemo(() => docs.filter((d) => d.kind === 'index'), [docs])

  /** فهرستِ مطالبِ همین فاز — از همان تابعِ نسخهٔ ۱. */
  const toc = useMemo(() => {
    if (!current) return []
    return extractHeadings(current.content)
      .filter((h) => h.level === 2 || h.level === 3)
      .map(({ id, text, level }) => ({ id, text, level }))
  }, [current])

  const currentQuestions = current ? (questions.get(current.num) ?? []) : []

  /** تعدادِ پرسش‌های همین فاز. */
  const total = currentQuestions.length

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-[var(--text-muted)]">
        در حال بارگذاری…
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* ── نوار بالا ── */}
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--chrome)]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1800px] items-center gap-3 px-4 py-2.5">
          <span
            className="h-6 w-1.5 rounded-full"
            style={{ background: current ? phaseColor(current.num) : 'var(--accent)' }}
            aria-hidden
          />
          <h1 className="text-sm font-bold">نقشهٔ راه بک‌اند و مهندسی AI</h1>
          <Badge tone="accent" className="ms-auto">
            نسخهٔ ۲
          </Badge>
          <a
            href="/"
            className="text-xs text-[var(--text-muted)] underline-offset-2 hover:underline"
          >
            نسخهٔ ۱
          </a>
        </div>
      </header>

      <div
        className="mx-auto grid max-w-[1800px] grid-cols-1 items-start gap-0 lg:grid-cols-[270px_minmax(0,1fr)_380px]"
      >
        {/* ── ستون راست: فهرست ── */}
        <aside className="sticky top-[49px] max-h-[calc(100vh-49px)] overflow-y-auto border-e border-[var(--border)] p-4">
          <PhaseGroup title="شروع کنید" docs={guides} currentId={currentId} onPick={setCurrentId} questions={questions} />
          {current && toc.length > 1 && (
            <div className="mt-6">
              <h3 className="mb-2 text-[0.72rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">
                مطالبِ این فاز
              </h3>
              <ul className="flex flex-col gap-0.5">
                {toc.map((h, i) => (
                  <li key={`${h.id}-${i}`}>
                    <a
                      href={`#${h.id}`}
                      className={`block rounded-md py-1 text-[0.82rem] leading-snug text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] ${
                        h.level === 3 ? 'ps-4' : 'font-semibold'
                      }`}
                      dir="rtl"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <PhaseGroup title="فازها" docs={phases} currentId={currentId} onPick={setCurrentId} questions={questions} />
          <PhaseGroup title="مرجع" docs={indexes} currentId={currentId} onPick={setCurrentId} questions={questions} />
        </aside>

        {/* ── ستون وسط: متنِ درس ── */}
        <main className="min-w-0 px-5 py-6 md:px-8">
          {current ? (
            <>
              <header className="mb-5 flex items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                  style={{ background: phaseColor(current.num) }}
                >
                  {current.kind === 'phase' ? `فاز ${fa(current.num)}` : current.badge}
                </span>
              </header>
              <Markdown content={current.content} />
            </>
          ) : (
            <p className="text-[var(--text-muted)]">سندی یافت نشد.</p>
          )}
        </main>

        {/* ── ستون چپ: پرسش‌ها ── */}
        <aside className="sticky top-[49px] max-h-[calc(100vh-49px)] overflow-y-auto border-s border-[var(--border)] p-4">
          {currentQuestions.length > 0 ? (
            <div className="flex flex-col gap-4">
              <div className="mb-1">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-bold">پرسش‌های تعاملی</span>
                  <span className="text-xs text-[var(--text-faint)]">
                    {fa(total)} پرسش
                  </span>
                </div>
                <Progress value={0} max={total || 1} label="پیشرفت پرسش‌ها" />
              </div>

              {currentQuestions.map((q) => {
                if (q.kind === 'choice') return <ChoiceQ key={q.id} q={q} />
                if (q.kind === 'predict') return <PredictQ key={q.id} q={q} />
                return <ExerciseQ key={q.id} q={q} />
              })}
            </div>
          ) : (
            <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] p-5 text-center">
              <p className="mb-1 text-sm font-bold">هنوز پرسشی برای این فاز نیست</p>
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                پرسش‌های تعاملی برای فازهای ۰۰ تا ۰۲ نوشته شده‌اند. بقیهٔ فازها
                فعلاً فقط متن و فلش‌کارت دارند.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

/** یک گروه از فهرست (راهنما / فازها / مرجع). */
function PhaseGroup({
  title,
  docs,
  currentId,
  onPick,
  questions,
}: {
  title: string
  docs: Doc[]
  currentId: string
  onPick: (id: string) => void
  questions: Map<number, Question[]>
}) {
  if (docs.length === 0) return null

  return (
    <div className="mb-5">
      <h3 className="mb-2 text-[0.72rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">
        {title}
      </h3>
      <ul className="flex flex-col gap-1">
        {docs.map((d) => {
          const n = questions.get(d.num)?.length ?? 0
          const active = d.id === currentId

          return (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => {
                  onPick(d.id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-start text-[0.86rem] leading-snug transition-colors ${
                  active
                    ? 'bg-[var(--surface-2)] font-bold text-[var(--text)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
                }`}
              >
                {d.kind === 'phase' && (
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-[0.7rem] font-bold text-white"
                    style={{ background: phaseColor(d.num) }}
                  >
                    {fa(d.num)}
                  </span>
                )}
                <span className="min-w-0 flex-1">{d.title}</span>
                {n > 0 && <Badge tone="accent">{fa(n)}</Badge>}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}