/**
 * App.tsx — پوستهٔ نسخهٔ ۲
 *
 * ⭐⭐ چیدمان: فهرستِ راست، محتوای وسط.
 *
 *   راست: فهرستِ فازها (تخت، عنوان‌ها زیرِ هم)      وسط: کارتِ فازهای باز
 *
 * دو قانونی که کاربر گفت و این فایل رعایت می‌کند:
 *
 *   ۱) **فهرست همیشه تخت می‌ماند.** عنوان‌ها زیرِ هم، بدون آکاردئون. چون
 *      اگر فهرست هم تاشدنی بود، دو لایهٔ «باز و بسته» داشتیم و معلوم نبود
 *      کدام لایه را کاربر باز کرده.
 *
 *   ۲) **محتوا همیشه وسط است.** کارت‌ها با `mx-auto max-w-[78ch]` وسط‌چین
 *      می‌شوند. عرضِ محدود لازم است چون خطِ بلندِ فارسی چشم را خسته می‌کند.
 *
 * ⭐ باز و بسته شدن چطور کار می‌کند؟
 *
 * `openIds` یک **مجموعه** (Set) است، نه یک رشتهٔ تک. کاربر می‌تواند چند فاز
 * را هم‌زمان باز نگه دارد — مثل چند برگه روی هم. کلیک دوباره روی عنوانِ باز،
 * آن را **می‌بندد** (collapse).
 *
 * ⚠️ هیچ پرشی به بالای صفحه در کار نیست. کلیک روی فهرست فقط محتوا را
 * باز/می‌بندد؛ اسکرول دستِ کاربر است.
 *
 * ⚠️ نکتهٔ مهم: این فایل **هیچ‌چیزِ نسخهٔ ۱ را تغییر نمی‌دهد**. فقط
 * `loadDocs` را از `../docs` می‌خواند — یعنی همان متن، همان فایل.
 */

import { useEffect, useMemo, useState } from 'react'
import { Badge } from './components/ui/badge'
import { PhaseNav } from './components/PhaseNav'
import { PhaseSection, fa } from './components/PhaseSection'
import { loadDocs, loadAllQuestions } from './content'
import type { Doc } from '../types'
import type { Question } from './types'

/** جست‌وجو در عنوان و متن — برای فیلتر کردنِ فهرست. */
function matches(doc: Doc, q: string): boolean {
  if (!q) return true
  return doc.title.includes(q) || doc.content.includes(q)
}

export default function App() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [questions, setQuestions] = useState<Map<number, Question[]>>(new Map())
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  /** ⭐ فازهای باز — مجموعه، چون چندتایی باز می‌مانند. */
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

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
        const first = guide ?? firstPhase ?? loaded[0]
        if (first) setOpenIds(new Set([first.id]))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  const guides = useMemo(() => docs.filter((d) => d.kind === 'guide'), [docs])
  const phases = useMemo(() => docs.filter((d) => d.kind === 'phase'), [docs])
  const indexes = useMemo(() => docs.filter((d) => d.kind === 'index'), [docs])

  /** باز کردن اگر بسته است، بستن اگر باز است. */
  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  // ⭐ فیلترِ جست‌وجو همهٔ گروه‌ها را می‌گیرد
  const filter = (list: Doc[]) => list.filter((d) => matches(d, query))

  /**
   * ⭐ با جست‌وجو، فازهای پیدا‌شده **باز** می‌شوند.
   *
   * بدون این، کاربر «شبکه» را جست‌وجو می‌کرد، فاز را در فهرست می‌دید، و
   * بعد باید کلیک می‌کرد تا محتوا بیاید — یعنی جست‌وجو فقط فهرست را تنگ
   * می‌کرد و کاربر را به مقصد نمی‌رساند.
   */
  const groups = useMemo(() => {
    const mk = (title: string, list: Doc[]) => ({ title, docs: filter(list) })
    return [mk('شروع کنید', guides), mk('فازها', phases), mk('مرجع', indexes)]
  }, [guides, phases, indexes, query])

  /** کارت‌هایی که باید رندر شوند: بازها، به همان ترتیبِ فهرست. */
  const openDocs = useMemo(() => {
    const all = [...guides, ...phases, ...indexes]
    return all.filter((d) => openIds.has(d.id))
  }, [guides, phases, indexes, openIds])

  const totalQuestions = [...questions.values()].reduce((s, v) => s + v.length, 0)
  const visibleCount = groups.reduce((s, g) => s + g.docs.length, 0)

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
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-2.5">
          <h1 className="text-sm font-bold">نقشهٔ راه بک‌اند و مهندسی AI</h1>

          <div className="ms-auto flex min-w-[200px] flex-1 items-center sm:max-w-xs">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جست‌وجو در درس‌ها…"
              aria-label="جست‌وجو در درس‌ها"
              className="w-full rounded-[var(--radius-inner)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]"
            />
          </div>

          <Badge tone="accent">نسخهٔ ۲</Badge>
          <a
            href="/"
            className="text-xs text-[var(--text-muted)] underline-offset-2 hover:underline"
          >
            نسخهٔ ۱
          </a>
        </div>
      </header>

      {/* ⭐ دو ستون. در موبایل ستون‌ها روی هم می‌افتند (`lg:`)، چون
          فهرست و متن در عرضِ کم هر دو شلوغ می‌شوند. */}
      <div className="mx-auto grid max-w-[1500px] items-start gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* ── ستون راست: فهرستِ فازها، تخت ── */}
        <aside className="border-e border-[var(--border)] lg:sticky lg:top-[49px] lg:max-h-[calc(100vh-49px)] lg:overflow-y-auto lg:p-4">
          <PhaseNav
            groups={groups}
            openIds={openIds}
            onToggle={toggle}
            questions={questions}
          />
        </aside>

        {/* ── ستون وسط: کارتِ فازهای باز ── */}
        <main className="min-w-0 px-4 py-6 md:px-8">
          {query && visibleCount === 0 && (
            <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] p-8 text-center">
              <p className="mb-1 text-sm font-bold">چیزی پیدا نشد</p>
              <p className="text-xs text-[var(--text-muted)]">
                برای «{query}» در هیچ فازی چیزی پیدا نشد.
              </p>
            </div>
          )}

          {openDocs.length === 0 && !query && (
            <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] p-8 text-center">
              <p className="mb-1 text-sm font-bold">هنوز فازی باز نشده</p>
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                از فهرستِ کنار صفحه یک فاز را انتخاب کن. می‌توانی چند فاز را
                هم‌زمان باز نگه داری و دوباره روی هرکدام کلیک کنی تا بسته شود.
              </p>
            </div>
          )}

          {/* ⭐ هر کارت وسط می‌ماند و از بقیه فاصله دارد، تا مرزِ فازها
              روشن باشد — وگرنه متن‌ها به هم می‌چسبند و معلوم نمی‌شود کجا
              تمام شده و کجا شروع. */}
          <div className="mx-auto flex max-w-[900px] flex-col gap-6">
            {openDocs.map((d) => (
              <PhaseSection
                key={d.id}
                doc={d}
                questions={questions.get(d.num) ?? []}
              />
            ))}
          </div>

          <footer className="mx-auto mt-12 max-w-[900px] border-t border-[var(--border)] pt-5 text-center text-xs text-[var(--text-faint)]">
            {fa(phases.length)} فاز · {fa(totalQuestions)} پرسشِ تعاملی ·{' '}
            {fa(openDocs.length)} فاز باز
          </footer>
        </main>
      </div>
    </div>
  )
}