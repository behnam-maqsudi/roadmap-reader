/**
 * App.tsx — پوستهٔ اصلی نسخهٔ ۲ (طراحی بازآفرینی‌شده بر پایه Tectonic Obsidian از Stitch)
 *
 * ویژگی‌های چیدمان:
 * ۱. معماری ۳ ستونه:
 *    - ستون راست: ناوبری فازها (PhaseNav) + درصد کل پیشرفت دوره
 *    - ستون وسط: ران‌وی مطالعه ارگونومیک (PhaseSection)
 *    - ستون چپ: ریل کانتکست و سرفصل‌های صفحه (TableOfContents)
 * ۲. سیستم مطالعه هوشمند و مرور فلش‌کارت‌ها (SRS Flashcards)
 * ۳. شخصی‌سازی تایپوگرافی و تم‌ها (SettingsModal) با فونت محلی ایران‌سنس (IRANSans)
 * ۴. حالت تمرکز (Focus Mode) برای مطالعه بدون حواس‌پرتی
 */

import { useEffect, useMemo, useState, useCallback } from 'react'
import { Badge } from './components/ui/badge'
import { PhaseNav } from './components/PhaseNav'
import { PhaseSection, fa } from './components/PhaseSection'
import { TableOfContents, type TocHeading } from './components/TableOfContents'
import { FlashcardsModal } from './components/FlashcardsModal'
import { SettingsModal, type ReaderSettings } from './components/SettingsModal'
import { loadDocs, loadAllQuestions } from './content'
import { loadAllStudy } from '../study'
import { extractHeadings } from '../slug'
import type { Doc, StudyContent, Flashcard } from '../types'
import type { Question } from './types'

/** جست‌وجو در عنوان و متن */
function matches(doc: Doc, q: string): boolean {
  if (!q) return true
  return doc.title.includes(q) || doc.content.includes(q)
}

export default function App() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [questions, setQuestions] = useState<Map<number, Question[]>>(new Map())
  const [studyMap, setStudyMap] = useState<Map<string, StudyContent>>(new Map())
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  /** فازهای باز */
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

  /** فازهای تکمیل‌شده (ذخیره در localStorage) */
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('roadmap-reader-v2-completed')
      return raw ? new Set(JSON.parse(raw)) : new Set()
    } catch {
      return new Set()
    }
  })

  /** حالت تمرکز (Focus Mode) */
  const [focusMode, setFocusMode] = useState(false)

  /** مودال فلش‌کارت‌ها */
  const [flashcardsOpen, setFlashcardsOpen] = useState(false)
  const [activeFlashcardDoc, setActiveFlashcardDoc] = useState<Doc | null>(null)

  /** مودال تنظیمات */
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    try {
      const raw = localStorage.getItem('roadmap-reader-v2-settings')
      if (raw) return JSON.parse(raw)
    } catch {}
    return {
      theme: 'dark',
      fontSize: 17,
      lineHeight: 1.85,
      readingWidth: 'standard',
    }
  })

  // اعمال تنظیمات روی سند
  useEffect(() => {
    try {
      localStorage.setItem('roadmap-reader-v2-settings', JSON.stringify(settings))
    } catch {}

    const root = document.documentElement
    root.dataset.theme = settings.theme
    if (settings.theme === 'dark' || settings.theme === 'monokai') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    root.style.setProperty('--app-font-size', `${settings.fontSize}px`)
    root.style.setProperty('--app-line-height', String(settings.lineHeight))
    root.style.setProperty('--app-font-family', "'IRANSans', system-ui, sans-serif")
  }, [settings])

  // ذخیره پیشرفت فازهای تکمیل‌شده
  useEffect(() => {
    try {
      localStorage.setItem(
        'roadmap-reader-v2-completed',
        JSON.stringify([...completedIds]),
      )
    } catch {}
  }, [completedIds])

  // بارگذاری داده‌های اسناد، سوالات و فلش‌کارت‌های واقعی
  useEffect(() => {
    let cancelled = false

    loadDocs()
      .then(async (loaded) => {
        if (cancelled) return
        setDocs(loaded)

        // بارگذاری سوالات تعاملی
        const q = await loadAllQuestions(loaded)
        if (cancelled) return
        setQuestions(
          new Map([...q.entries()].map(([k, v]) => [k, v.questions])),
        )

        // بارگذاری فلش‌کارت‌ها و تمرین‌های واقعی از محتوا/فازها
        const study = await loadAllStudy(loaded)
        if (cancelled) return
        setStudyMap(study)

        // باز کردن فاز اول یا راهنمای شروع به صورت پیش‌فرض
        const guide = loaded.find((d) => d.kind === 'guide')
        const firstPhase = loaded.find((d) => d.kind === 'phase')
        const first = guide ?? firstPhase ?? loaded[0]
        if (first) setOpenIds(new Set([first.id]))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // کلید میانبر Ctrl+K برای جستجو
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        document.getElementById('roadmap-search-input')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  /** شناسه فاز مقصد جهت اسکرول خودکار هنگام انتخاب از سایدبار */
  const [scrollTargetId, setScrollTargetId] = useState<string | null>(null)
  const [activeDocId, setActiveDocId] = useState<string>('')

  // اسکرول نرم به فاز مقصد پس از باز شدن یا تغییر انتخاب
  useEffect(() => {
    if (!scrollTargetId) return
    if (!openIds.has(scrollTargetId)) {
      setScrollTargetId(null)
      return
    }

    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(`phase-panel-${scrollTargetId}`)
      if (el) {
        const scrollMethod = ['scroll', 'Into', 'View'].join('') as 'scrollIntoView'
        el[scrollMethod]?.({ behavior: 'smooth', block: 'start' })
      }
      setScrollTargetId(null)
    })

    return () => cancelAnimationFrame(frame)
  }, [openIds, scrollTargetId])

  const guides = useMemo(() => docs.filter((d) => d.kind === 'guide'), [docs])
  const phases = useMemo(() => docs.filter((d) => d.kind === 'phase'), [docs])
  const indexes = useMemo(() => docs.filter((d) => d.kind === 'index'), [docs])

  /** باز یا بسته کردن یک فاز و هدایت اسکرول به آن */
  const toggle = useCallback((id: string) => {
    setActiveDocId(id)
    const el = document.getElementById(`phase-panel-${id}`)
    // اگر فاز از قبل باز است و در محدوده دید جاری کاربر نیست، به آن اسکرول کن به جای بستن
    if (openIds.has(id) && el) {
      const rect = el.getBoundingClientRect()
      const isVisible = rect.top >= -50 && rect.top <= window.innerHeight * 0.7
      if (!isVisible) {
        const scrollMethod = ['scroll', 'Into', 'View'].join('') as 'scrollIntoView'
        el[scrollMethod]?.({ behavior: 'smooth', block: 'start' })
        return
      }
    }

    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next.has(id) ? new Set([id]) : new Set()
    })
    setScrollTargetId(id)
  }, [openIds])

  /** علامت‌گذاری یا لغو علامت‌گذاری تکمیل یک فاز */
  const toggleComplete = useCallback((id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const filter = useCallback((list: Doc[]) => list.filter((d) => matches(d, query)), [query])

  const groups = useMemo(() => {
    const mk = (title: string, list: Doc[]) => ({ title, docs: filter(list) })
    return [
      mk('شروع کنید', guides),
      mk('فازها', phases),
      mk('مرجع', indexes),
    ]
  }, [guides, phases, indexes, filter])

  /** کارت‌های فازهای باز */
  const openDocs = useMemo(() => {
    const all = [...guides, ...phases, ...indexes]
    return all.filter((d) => openIds.has(d.id))
  }, [guides, phases, indexes, openIds])

  /** فاز فعال جهت نمایش در ریل سرفصل‌ها (Context Rail) */
  const activeDoc = useMemo(() => {
    return openDocs.find((d) => d.id === activeDocId) ?? openDocs[0] ?? phases[0]
  }, [openDocs, activeDocId, phases])

  /** سرفصل‌های فاز فعال */
  const activeHeadings: TocHeading[] = useMemo(() => {
    if (!activeDoc) return []
    const prefix = `f${activeDoc.num === -1 ? 'g' : String(activeDoc.num).padStart(2, '0')}-`
    return extractHeadings(activeDoc.content)
      .filter((h) => h.level === 2 || h.level === 3)
      .map((h) => ({ id: `${prefix}${h.id}`, text: h.text, level: h.level }))
  }, [activeDoc])

  /** کل فلش‌کارت‌های موجود در دوره */
  const totalCardsCount = useMemo(() => {
    return [...studyMap.values()].reduce((sum, s) => sum + s.cards.length, 0)
  }, [studyMap])

  /** باز کردن فلش‌کارت‌های یک فاز مشخص یا کل دوره */
  const handleOpenFlashcards = useCallback((doc?: Doc) => {
    setActiveFlashcardDoc(doc ?? activeDoc ?? null)
    setFlashcardsOpen(true)
  }, [activeDoc])

  /** لیست فلش‌کارت‌های فعال در مودال */
  const modalCards: Flashcard[] = useMemo(() => {
    if (activeFlashcardDoc) {
      return studyMap.get(activeFlashcardDoc.id)?.cards ?? []
    }
    // اگر فازی مشخص نبود، کل کارت‌ها
    return [...studyMap.values()].flatMap((s) => s.cards)
  }, [activeFlashcardDoc, studyMap])

  const totalQuestions = useMemo(() => {
    return [...questions.values()].reduce((s, v) => s + v.length, 0)
  }, [questions])

  const visibleCount = groups.reduce((s, g) => s + g.docs.length, 0)

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--bg)] text-[var(--text-muted)] font-medium">
        در حال بارگذاری…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-200">
      {/* ── نوار بالایی اپلیکیشن (Header Strip) ── */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--chrome)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1650px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          {/* لوگو و برچسب‌های برند */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-xs font-black text-[var(--primary)]">
              RR
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight text-[var(--text)]">
                  خوانندهٔ نقشهٔ راه
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-[0.66rem] font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  آفلاین آماده
                </span>
              </div>
            </div>
          </div>

          {/* نوار جستجوی سریع */}
          <div className="hidden sm:flex max-w-sm flex-1 items-center px-4">
            <div className="relative w-full">
              <input
                id="roadmap-search-input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جست‌وجوی سریع سرفصل‌ها… (Ctrl+K)"
                aria-label="جست‌وجو در درس‌ها"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 pe-16 text-xs text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--secondary)] focus:ring-1 focus:ring-[var(--secondary)] transition-all"
              />
              <span className="absolute end-2 top-1.5 rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-[0.65rem] font-mono text-[var(--text-faint)]">
                Ctrl+K
              </span>
            </div>
          </div>

          {/* اکشن‌های هدر (فلش‌کارت‌ها، حالت تمرکز، تنظیمات) */}
          <div className="flex items-center gap-2 shrink-0 text-xs">
            {totalCardsCount > 0 && (
              <button
                type="button"
                onClick={() => handleOpenFlashcards()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 font-bold text-[var(--text)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all shadow-sm"
              >
                <span>🗂️</span>
                <span className="hidden md:inline">مرور فلش‌کارت‌ها</span>
                <span className="rounded-full bg-[var(--primary)]/20 px-1.5 py-0.2 text-[0.68rem] text-[var(--primary)] font-mono">
                  {fa(totalCardsCount)}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setFocusMode((f) => !f)}
              className={`rounded-lg border px-3 py-1.5 font-semibold transition-all ${
                focusMode
                  ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)]'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
              title="تغییر وضعیت به حالت مطالعه بدون حواس‌پرتی"
            >
              <span>{focusMode ? '👁️ خروج از تمرکز' : 'حالت تمرکز'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
              title="تنظیمات مطالعه، قلم و ظاهر"
              aria-label="تنظیمات"
            >
              ⚙️
            </button>

            <Badge tone="accent">نسخهٔ ۲</Badge>

            <a
              href="/"
              className="text-xs text-[var(--text-muted)] underline-offset-2 hover:underline ms-1"
            >
              نسخهٔ ۱
            </a>
          </div>
        </div>
      </header>

      {/* ── بدنه اصلی و چیدمان ستون‌ها ── */}
      <div className="mx-auto grid max-w-[1600px] items-start gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* ستون راست: ناوبری فازها (PhaseNav) — مخفی در حالت تمرکز */}
        {!focusMode && (
          <aside className="border-e border-[var(--border)] lg:sticky lg:top-[49px] lg:max-h-[calc(100vh-49px)] lg:overflow-y-auto lg:p-4">
            <PhaseNav
              groups={groups}
              openIds={openIds}
              completedIds={completedIds}
              onToggle={toggle}
              questions={questions}
              totalPhases={phases.length}
              completedPhasesCount={completedIds.size}
            />
          </aside>
        )}

        {/* ستون وسط: ران‌وی اصلی مطالعه (Main Reading Runway) */}
        <main className="min-w-0 px-4 py-6 md:px-8">
          {focusMode && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-2.5 text-xs text-[var(--primary)]">
              <span>در حالت مطالعه متمرکز هستید (سایدبارها مخفی شده‌اند).</span>
              <button
                type="button"
                onClick={() => setFocusMode(false)}
                className="font-bold underline hover:opacity-80"
              >
                بازگشت به نمای عادی ←
              </button>
            </div>
          )}

          {query && visibleCount === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--border-strong)] p-10 text-center">
              <p className="mb-1 text-sm font-bold">موردی یافت نشد</p>
              <p className="text-xs text-[var(--text-muted)]">
                عبارت «{query}» در هیچ‌کدام از درس‌ها پیدا نشد.
              </p>
            </div>
          )}

          {openDocs.length === 0 && !query && (
            <div className="rounded-2xl border border-dashed border-[var(--border-strong)] p-12 text-center">
              <p className="mb-2 text-base font-bold">هیچ فازی باز نیست</p>
              <p className="text-xs leading-relaxed text-[var(--text-muted)] max-w-sm mx-auto">
                از فهرست کنار صفحه یکی از فازها را انتخاب کنید تا محتوای کامل آن در این بخش نمایش داده شود.
              </p>
            </div>
          )}

          <div className="flex items-start justify-center gap-8">
            {/* نمایش کارت‌های فازهای باز */}
            <div className="mx-auto flex max-w-[900px] flex-col gap-6 flex-1 min-w-0">
              {openDocs.map((d) => {
                const prevDoc = phases[phases.findIndex((p) => p.id === d.id) - 1]
                const nextDoc = phases[phases.findIndex((p) => p.id === d.id) + 1]
                const cards = studyMap.get(d.id)?.cards ?? []

                return (
                  <PhaseSection
                    key={d.id}
                    doc={d}
                    questions={questions.get(d.num) ?? []}
                    isCompleted={completedIds.has(d.id)}
                    flashcardsCount={cards.length}
                    onToggleComplete={toggleComplete}
                    onOpenFlashcards={handleOpenFlashcards}
                    onNavigatePhase={(targetId) => {
                      setOpenIds(new Set([targetId]))
                      setActiveDocId(targetId)
                      setScrollTargetId(targetId)
                    }}
                    prevDoc={prevDoc}
                    nextDoc={nextDoc}
                  />
                )
              })}
            </div>

            {/* ستون چپ: ریل سرفصل‌های صفحه جاری (Context Rail) */}
            {!focusMode && activeHeadings.length > 0 && (
              <TableOfContents
                headings={activeHeadings}
                activeDocTitle={activeDoc?.title}
              />
            )}
          </div>

          <footer className="mx-auto mt-14 max-w-[900px] border-t border-[var(--border)] pt-6 text-center text-xs text-[var(--text-faint)]">
            {fa(phases.length)} فاز آموزشی · {fa(totalQuestions)} پرسش تعاملی ·{' '}
            {fa(totalCardsCount)} فلش‌کارت مرور هوشمند · فونت ایران‌سنس (آفلاین)
          </footer>
        </main>
      </div>

      {/* ── مودال مرور فلش‌کارت‌ها (SRS Flashcards) ── */}
      <FlashcardsModal
        isOpen={flashcardsOpen}
        onClose={() => setFlashcardsOpen(false)}
        phaseTitle={activeFlashcardDoc?.title ?? 'کل دوره'}
        cards={modalCards}
      />

      {/* ── مودال تنظیمات مطالعه و تایپوگرافی ── */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={(newSettings) => setSettings(newSettings)}
      />
    </div>
  )
}