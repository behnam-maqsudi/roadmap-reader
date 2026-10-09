/**
 * App.tsx — کامپوننت اصلی
 *
 * وظیفه‌ها:
 * ۱. بارگذاری اسناد
 * ۲. نگه‌داری تنظیمات و ذخیره‌ی آن‌ها
 * ۳. اعمال تنظیمات به‌صورت متغیر CSS روی <html>
 * ۴. نمایش نوار ابزار، فهرست، و محتوا
 * ۵. نگه‌داری پیشرفت یادگیری (فلش‌کارت و تمرین)
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

import { Markdown } from './Markdown'
import { SettingsPanel } from './SettingsPanel'
import { Flashcards } from './Flashcards'
import { Exercises } from './Exercises'
import { loadDocs } from './docs'
import { extractHeadings } from './slug'
import { loadAllStudy } from './study'
import {
  loadProgress,
  saveProgress,
  loadExercises,
  saveExercises,
  recordReview,
  toggleExercise,
  type ProgressMap,
  type ExerciseMap,
} from './progress'
import { loadSettings, saveSettings, FONT_STACKS, DEFAULT_SETTINGS } from './settings'
import { THEMES, resolveCodeTheme } from './themes'
import { STORAGE_KEY, type Doc, type Settings, type CardProgress, type StudyContent } from './types'

/**
 * ⭐ فاصله‌ای که سرتیترِ هدف از بالای ظرفِ اسکرول فاصله می‌گیرد.
 *
 * نوارِ ابزارِ بالای صفحه چسبان است و روی متن می‌افتد. اگر این فاصله را
 * ندهیم، سرتیتر دقیقاً زیرِ نوار گم می‌شود و خواننده فکر می‌کند به بخشِ
 * اشتباهی رفته — یعنی اسکرول انجام شده ولی **اشتباه به نظر می‌رسد**.
 * با `styles.css` هم‌خوان است: `scroll-margin-block-start: 4.5rem`.
 */
const STICKY_OFFSET = 72

/**
 * ⭐ نزدیک‌ترین ظرفِ قابلِ اسکرولِ بالای یک عنصر.
 *
 * چرا لازم است؟ `scrollIntoView` خودش ظرف را پیدا می‌کند، ولی گاهی
 * اشتباه می‌کند و کلیک بی‌اثر به نظر می‌رسد. اینجا خودمان پیدا
 * می‌کنیم تا:
 *
 *   ۱) قابلِ **اندازه‌گیری** باشد (تست بتواند بسنجد)
 *   ۲) با هر چیدمانی که بعداً عوض شود خودش را تطبیق دهد
 *
 * اگر هیچ ظرفی نبود (یعنی خودِ پنجره اسکرول می‌خورد) `null` برمی‌گرداند
 * و فراخوان با `window` انجام می‌شود.
 */
function findScrollParent(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el.parentElement

  while (node && node !== document.body && node !== document.documentElement) {
    // فقط عنصری که *واقعاً* اسکرول می‌خورد — نه فقط `overflow` متفاوت
    const style = getComputedStyle(node)
    const scrolls = /(auto|scroll|overlay)/.test(style.overflowY)
    if (scrolls && node.scrollHeight > node.clientHeight) return node
    node = node.parentElement
  }

  return null
}

export default function App() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [currentId, setCurrentId] = useState<string>('')
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [panelOpen, setPanelOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // ── پیشرفت یادگیری ──
  // جدا از تنظیمات: این‌ها رشد می‌کنند و هرگز «تنظیم» نیستند.
  const [progress, setProgress] = useState<ProgressMap>(loadProgress)
  const [doneExercises, setDoneExercises] = useState<ExerciseMap>(loadExercises)

  // ── محتوای یادگیری همه‌ی فازها ──
  const [study, setStudy] = useState<Map<string, StudyContent>>(new Map())

  // ── بارگذاری اسناد ──
  useEffect(() => {
    let cancelled = false

    loadDocs()
      .then(async (loaded) => {
        if (cancelled) return
        setDocs(loaded)
        // محتوای یادگیری را هم یک‌جا بار می‌کنیم تا شمارنده‌ی فازها
        // بدون تأخیر (و بدون ۱۴ درخواست جدا) کار کند.
        const all = await loadAllStudy(loaded)
        if (cancelled) return
        setStudy(all)
        // ⭐ پیش‌فرض: راهنمای شروع، نه فاز ۰۰.
        // قبلاً مستقیم فاز ۰۰ باز می‌شد و کاربر نمی‌دانست از کجا باید
        // شروع کند یا ترتیب چیست. راهنما دقیقاً همان را توضیح می‌دهد.
        const guide = loaded.find((d) => d.kind === 'guide')
        const firstPhase = loaded.find((d) => d.kind === 'phase')
        setCurrentId((guide ?? firstPhase ?? loaded[0])?.id ?? '')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // ── ذخیره‌ی تنظیمات ──
  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  // ── ذخیره‌ی پیشرفت یادگیری ──
  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  useEffect(() => {
    saveExercises(doneExercises)
  }, [doneExercises])

  /** یک مرور کارت را ثبت می‌کند. */
  const onGrade = useCallback(
    (cardIndex: number, next: CardProgress) => {
      if (!currentId) return
      setProgress((p) => recordReview(p, currentId, cardIndex, next))
    },
    [currentId],
  )

  /** یک تمرین را علامت‌گذاری می‌کند. */
  const onToggleExercise = useCallback(
    (index: number, done: boolean) => {
      if (!currentId) return
      setDoneExercises((m) => toggleExercise(m, currentId, index, done))
    },
    [currentId],
  )

  /**
   * ⭐ اعمال تنظیمات به‌صورت متغیر CSS روی <html>.
   * این کار باعث می‌شود کل صفحه (نه فقط محتوا) با هم هماهنگ شود،
   * و نیازی به پاس دادن props به تک‌تک اجزا نیست.
   */
  useEffect(() => {
    const root = document.documentElement

    // ── متغیرهای متن ──
    root.style.setProperty('--font-size', `${settings.fontSize}px`)
    root.style.setProperty('--line-height', String(settings.lineHeight))
    root.style.setProperty('--paragraph-spacing', `${settings.paragraphSpacing}em`)
    root.style.setProperty('--content-width', `${settings.contentWidth}px`)
    root.style.setProperty('--code-font-size', `${settings.codeFontSize}px`)
    root.style.setProperty('--content-padding', `${settings.contentPadding}px`)
    root.style.setProperty('--code-block-spacing', `${settings.codeBlockSpacing}em`)
    root.style.setProperty('--font-family', FONT_STACKS[settings.fontFamily])
    root.style.setProperty('--font-weight', String(settings.fontWeight))
    root.style.setProperty('--letter-spacing', `${settings.letterSpacing}em`)
    root.style.setProperty('--text-align', settings.textAlign)

    // خط زیر سرتیترها فقط وقتی روشن باشد
    root.style.setProperty(
      '--heading-border-width',
      settings.headingBorder ? '1px' : '0',
    )

    // ── جهت متن ──
    root.setAttribute('dir', settings.direction)

    // ── رنگ‌های تم ──
    const theme = THEMES[settings.theme]
    const cssVars: [keyof typeof theme, string][] = [
      ['bg', '--bg'],
      ['surface', '--surface'],
      ['chrome', '--chrome'],
      ['text', '--text'],
      ['textMuted', '--text-muted'],
      ['textFaint', '--text-faint'],
      ['link', '--link'],
      ['linkHover', '--link-hover'],
      ['border', '--border'],
      ['borderStrong', '--border-strong'],
      ['codeBg', '--code-bg'],
      ['codeText', '--code-text'],
      ['codeInlineBg', '--code-inline-bg'],
      ['tableStripe', '--table-stripe'],
      ['tableMuted', '--table-muted'],
      ['accent', '--accent'],
      ['accentHover', '--accent-hover'],
      ['accentText', '--accent-text'],
    ]

    for (const [key, cssVar] of cssVars) {
      root.style.setProperty(cssVar, theme[key])
    }

    // برای رنگ‌بندی highlight.js
    root.dataset.codeTheme = resolveCodeTheme(settings.codeTheme, settings.theme)
  }, [settings])

  // ── اعمال رنگ‌بندی highlight.js ──
  useEffect(() => {
    // ⭐ رنگ‌های نحو کاملاً محلی‌اند (highlight-themes.css). نسخه‌ی قبلی
    // فایل CSS تم را از CDN می‌آورد، که دو مشکل داشت:
    //   ۱) رنگ‌های آن سخت‌افزاری‌اند، پس تم تیره را نمی‌فهمید و متن
    //      تیره روی زمینه‌ی تیره می‌افتاد؛
    //   ۲) چون CDN است، در نبود اینترنت کد اصلاً رنگ نمی‌گرفت.
    //
    // ⭐ و 'auto' یعنی تم کد با تم صفحه می‌رود: تم تیره → گیت‌هاب تاریک.
    //    بدون این، کاربر تم تیره با رنگ‌آمیزی لایتِ کد می‌ماند و متن
    //    کد عملاً ناخوانا می‌شود (-background روشن، متن تیره-روی-تیره).
    document.documentElement.dataset.codeTheme = resolveCodeTheme(
      settings.codeTheme,
      settings.theme,
    )
  }, [settings.codeTheme, settings.theme])

  // ── میان‌بر صفحه‌کلید ──
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // ⭐ فقط وقتی در فیلد متن نیستیم
      const target = e.target as HTMLElement | null
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT'

      if (typing) return

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case '=':
          case '+':
            e.preventDefault()
            setSettings((s) => ({ ...s, fontSize: Math.min(s.fontSize + 1, 32) }))
            break
          case '-':
            e.preventDefault()
            setSettings((s) => ({ ...s, fontSize: Math.max(s.fontSize - 1, 12) }))
            break
          case '0':
            e.preventDefault()
            setSettings((s) => ({ ...DEFAULT_SETTINGS, theme: s.theme }))
            break
        }
      }

      if (e.key === 'Escape') setPanelOpen(false)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /** یک بخش از تنظیمات را به‌روز می‌کند. */
  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }))
  }, [])

  /** بازگشت به پیش‌فرض — ولی تم را نگه می‌دارد. */
  const reset = useCallback(() => {
    setSettings((s) => {
      const fresh = loadSettings()
      return { ...fresh, theme: s.theme, codeTheme: s.codeTheme }
    })
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // ── اسناد فیلترشده بر اساس جستجو ──
  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return docs
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q),
    )
  }, [docs, search])

  /**
   * ⭐ تقسیم فهرست به سه دسته.
   *
   * قبلاً همه در یک ردیف می‌آمدند و دو فایلِ نمایه (شماره‌ی ۹۹۹) تهِ فهرست
   * شبیه هم دیده می‌شدند: «نقشه‌ی راه تسلط بر بک‌اند و مه…» — دو بار، پشت‌سرهم.
   * حالا هر دسته جدا و با برچسب خودش است.
   */
  const { guides, phases, indexes } = useMemo(() => {
    const guides: { id: string; title: string; badge: string }[] = []
    const phases: { id: string; title: string; num: number }[] = []
    const indexes: { id: string; title: string; badge: string }[] = []

    for (const d of filteredDocs) {
      if (d.kind === 'guide') guides.push({ id: d.id, title: d.title, badge: d.badge })
      else if (d.kind === 'index') indexes.push({ id: d.id, title: d.title, badge: d.badge })
      else phases.push({ id: d.id, title: d.title, num: d.num })
    }

    return { guides, phases, indexes }
  }, [filteredDocs])

  const current = docs.find((d) => d.id === currentId)

  /** محتوای یادگیری همین فاز */
  const currentStudy = current ? study.get(current.id) : undefined

  /** پیشرفت کارت‌های همین فاز */
  const cardProgress = useMemo(
    () => (current ? (progress[current.id] ?? {}) : {}),
    [progress, current],
  )

  const exerciseDone = useMemo(
    () => (current ? (doneExercises[current.id] ?? {}) : {}),
    [doneExercises, current],
  )

  /**
   * ⭐ شمارنده‌ی سررسید در نوار فازها.
   * می‌گوید کدام فاز امروز کار دارد — بدون باز کردنش.
   */
  const dueByDoc = useMemo(() => {
    const now = Date.now()
    const map = new Map<string, number>()

    for (const [docId, s] of study) {
      if (s.cards.length === 0) continue
      const p = progress[docId] ?? {}
      const n = s.cards.filter((c) => (p[c.n]?.due ?? 0) <= now).length
      if (n > 0) map.set(docId, n)
    }

    return map
  }, [study, progress])

  // ── فهرست محتوا از سرتیترهای همین سند ──
  //
  // ⭐⭐ این و رندرر (`Markdown.tsx`) از **یک تابع** می‌خوانند:
  // `extractHeadings`. قبلاً هر دو منطقِ خودشان را داشتند و همین باعث
  // می‌شد که شناسه‌هایشان از هم جدا بیفتند و کلیک روی فهرست بی‌اثر شود.
  // حالا جدا افتادنشان ساختاری ممکن نیست.
  const toc = useMemo(
    () =>
      current
        ? extractHeadings(current.content)
            .filter((h) => h.level <= 3)
            .map(({ id, text, level }) => ({ id, text, level }))
        : [],
    [current],
  )

  if (loading) {
    return (
      <div className="app" style={{ padding: '4rem', textAlign: 'center' }}>
        در حال بارگذاری…
      </div>
    )
  }

  return (
    <div className="app">
      {/* ── نوار ابزار ── */}
      {settings.showToolbar && (
        <header className="toolbar">
          <span className="toolbar-title">
            نقشه‌ی راه بک‌اند و مهندسی AI
          </span>

          <input
            type="search"
            className="select"
            style={{ maxWidth: 220 }}
            placeholder="جستجو…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="جستجو در فازها"
          />

          <div className="toolbar-spacer" />

          {/* کنترل سریع اندازه — بدون باز کردن پنل */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.8rem',
            }}
          >
            <button
              type="button"
              className="btn btn-icon"
              onClick={() =>
                update({ fontSize: Math.max(settings.fontSize - 1, 12) })
              }
              aria-label="کوچک‌تر"
              title="کوچک‌تر (Ctrl+−)"
            >
              −
            </button>
            <span
              className="setting-value"
              style={{ minWidth: '3.2rem', textAlign: 'center' }}
            >
              {settings.fontSize}px
            </span>
            <button
              type="button"
              className="btn btn-icon"
              onClick={() =>
                update({ fontSize: Math.min(settings.fontSize + 1, 32) })
              }
              aria-label="بزرگ‌تر"
              title="بزرگ‌تر (Ctrl++)"
            >
              +
            </button>
          </div>

          <button
            type="button"
            className={`btn ${panelOpen ? 'active' : ''}`}
            onClick={() => setPanelOpen((v) => !v)}
            aria-expanded={panelOpen}
          >
            ⚙ تنظیمات
          </button>
        </header>
      )}

      {/* ==========================================================================
          ⭐ چیدمان سه‌ستون

          راست: فازها و سرتیترها   وسط: متن درس   چپ: تمرین و فلش‌کارت

          چرا این چیدمان؟ چون چشم آدم سه کار می‌خواهد هم‌زمان انجام بدهد:
          بداند کجاست (راست)، بخواند (وسط)، و تمرین کند (چپ).
          اگر تمرین پایین متن بود، برای دیدنش باید اسکرول می‌کردی.
          ========================================================================== */}
      <div className="layout">
        {/* ── ستون راست: فازها + سرتیترها ── */}
        <aside className="col-toc" aria-label="فهرست فازها و مطالب">
          <div className="col-inner">
            {/* فهرست فازها — بالای ستون، بدون نوار افقی بالای صفحه

                ⭐ چرا سه بخش جدا؟ قبلاً دو فایلِ نمایه با شماره‌ی ۹۹۹ تهِ فهرست
                می‌نشستند و دو تایی شبیه هم دیده می‌شدند: «نقشه‌ی راه تسلط بر بک‌اند…».
                حالا هر دسته برچسب خودش را دارد و کاربر می‌داند کدام را می‌خواند. */}
            <nav className="phase-list" aria-label="فهرست">
              <h4 className="col-title">فهرست</h4>

              {/* ── ۱. راهنمای شروع (همیشه اول) ── */}
              {guides.length > 0 && !search.trim() && (
                <>
                  <h5 className="phase-group">شروع کنید</h5>
                  <ul className="phase-list-inner">
                    {guides.map((d) => (
                      <li key={d.id}>
                        <button
                          type="button"
                          className={`phase-chip phase-chip-guide ${d.id === currentId ? 'active' : ''}`}
                          onClick={() => {
                            setCurrentId(d.id)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          aria-current={d.id === currentId ? 'page' : undefined}
                        >
                          <span className="phase-num">{d.badge}</span>
                          <span className="phase-name">{d.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* ── ۲. سرتیترهای همین فاز ──
                  ⭐ چرا بالای فازها؟ چون فهرستِ فازها ثابت است و تغییر نمی‌کند،
                  ولی وقتی داخلِ یک فازی، چیزی که کاربر لازم دارد «رفتن به
                  بخشِ همین فاز» است. آن را بالا می‌آوریم تا با یک چشم پیدا شود. */}
              {settings.showToc && toc.length > 2 && (
                <>
                  <h5 className="phase-group">
                    بخش‌های این فاز
                    {current ? ` — ${current.title}` : ''}
                  </h5>
                  <ul className="toc-list toc-list-top">
                    {toc.map((h, i) => (
                      <li
                        key={`${h.id}-${i}`}
                        className={`toc-level-${h.level}`}
                      >
                        <a
                          href={`#${h.id}`}
                          onClick={(e) => {
                            // ⭐ جلوی رفتارِ پیش‌فرضِ مرورگر را می‌گیریم تا
                            // بتوانیم دقیقاً روی همان سرتیتر بنشانیم و از زیرِ
                            // نوارِ بالای صفحه بیرون بیاید.
                            e.preventDefault()
                            const el = document.getElementById(h.id)
                            if (!el) {
                              // ⚠️ نباید بی‌صدا رد شویم. اگر لنگری گم شود،
                              // کاربر باید بفهمد که این یک اشکال است، نه اینکه
                              // فکر کند صفحه خراب است.
                              console.warn(
                                `[فهرست] سرتیتری با id="${h.id}" پیدا نشد ` +
                                  `(متن: «${h.text}»)`,
                              )
                              return
                            }

                            el.scrollIntoView({ behavior: 'smooth', block: 'start' })

                            // ⭐⭐ اینجاست که خودِ اسکرول انجام می‌شد و باز
                            // هم انجام می‌شود — ولی یک چیزِ دیگر هم هست که
                            // اصلاً به اسکرول ربطی ندارد و همان چیزی است که
                            // کاربر را می‌آزارَد:
                            //
                            // `.col-main` (ستونِ متن) خودش یک ظرفِ اسکرولِ
                            // جداگانه است? نه — ولی اگر روزی چنین شد،
                            // `scrollIntoView` فقط نزدیک‌ترین ظرفِ قابلِ
                            // اسکرول را می‌جوشاند و ممکن است آن یکی باشد.
                            //
                            // پس روش را صریح و قابلِ اندازه‌گیری می‌کنیم:
                            // اول می‌فهمیم کدام عنصر واقعاً اسکرول می‌شود،
                            // بعد مختصات را حساب می‌کنیم، بعد اسکرول می‌کنیم.
                            // اگر روزی چیدمان عوض شد، این کد خودش را
                            // تطبیق می‌دهد و لازم نیست حدس بزنیم.
                            const scroller = findScrollParent(el)
                            if (scroller) {
                              const top =
                                el.getBoundingClientRect().top -
                                scroller.getBoundingClientRect().top +
                                scroller.scrollTop -
                                STICKY_OFFSET

                              scroller.scrollTo({ top, behavior: 'smooth' })
                            } else {
                              window.scrollTo({
                                top:
                                  window.scrollY +
                                  el.getBoundingClientRect().top -
                                  STICKY_OFFSET,
                                behavior: 'smooth',
                              })
                            }

                            // نشانی را هم عوض می‌کنیم تا دکمه‌ی «برگشت» مرورگر کار کند
                            window.history.replaceState(null, '', `#${h.id}`)
                          }}
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* ── ۳. فازهای درس ── */}
              {phases.length > 0 && (
                <>
                  <h5 className="phase-group">
                    فازها {search.trim() ? '(جستجو)' : ''}
                  </h5>
                  <ul className="phase-list-inner">
                    {phases.map((d) => {
                      const due = dueByDoc.get(d.id) ?? 0
                      return (
                        <li key={d.id}>
                          <button
                            type="button"
                            className={`phase-chip ${d.id === currentId ? 'active' : ''}`}
                            onClick={() => {
                              setCurrentId(d.id)
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            aria-current={d.id === currentId ? 'page' : undefined}
                            aria-label={
                              due > 0
                                ? `فاز ${d.num}، ${d.title} — ${due} کارت آماده‌ی مرور`
                                : `فاز ${d.num}، ${d.title}`
                            }
                          >
                            <span className="phase-num">{d.num}</span>
                            <span className="phase-name">{d.title}</span>
                            {due > 0 && (
                              <span className="phase-due" aria-hidden>
                                {due}
                              </span>
                            )}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}

              {/* ── ۳. نمایه‌ها و مرجع ──
                  قبلاً این دو تهِ فهرست، بدون برچسب و کنار هم دیده می‌شدند. */}
              {indexes.length > 0 && (
                <>
                  <h5 className="phase-group">مرجع و نقشه</h5>
                  <ul className="phase-list-inner">
                    {indexes.map((d) => (
                      <li key={d.id}>
                        <button
                          type="button"
                          className={`phase-chip phase-chip-ref ${d.id === currentId ? 'active' : ''}`}
                          onClick={() => {
                            setCurrentId(d.id)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          aria-current={d.id === currentId ? 'page' : undefined}
                        >
                          <span className="phase-num">{d.badge}</span>
                          <span className="phase-name">{d.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {filteredDocs.length === 0 && (
                <li className="phase-empty">نتیجه‌ای پیدا نشد</li>
              )}
            </nav>
          </div>
        </aside>

        {/* ── ستون وسط: متن درس ── */}
        <main className="col-main">
          {current ? (
            <Markdown content={current.content} settings={settings} />
          ) : (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              سندی یافت نشد
            </div>
          )}
        </main>

        {/* ── ستون چپ: تمرین و فلش‌کارت ── */}
        <aside className="col-study" aria-label="تمرین و مرور">
          <div className="col-inner">
            {settings.showStudy && currentStudy && currentStudy.cards.length > 0 && (
              <Flashcards
                cards={currentStudy.cards}
                progress={cardProgress}
                onGrade={onGrade}
                onFinish={() =>
                  document
                    .getElementById('exercises')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              />
            )}

            {settings.showStudy && currentStudy && currentStudy.exercises.length > 0 && (
              <div id="exercises">
                <Exercises
                  exercises={currentStudy.exercises}
                  done={exerciseDone}
                  onToggle={onToggleExercise}
                />
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── پنل تنظیمات ── */}
      {panelOpen && (
        <SettingsPanel
          settings={settings}
          onChange={update}
          onReset={reset}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </div>
  )
}
