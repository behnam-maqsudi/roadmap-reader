/**
 * Flashcards.tsx — مرور فلش‌کارت با تکرار فاصله‌دار
 *
 * ⭐ چرا این صفحه وجود دارد؟
 * خواندن متن حس یادگیری می‌دهد ولی حافظه نمی‌سازد.
 * این صفحه مجبورت می‌کند جواب را از سرت بیرون بیاوری — و همین
 * «بازیابی فعال» است، تنها چیزی که واقعاً یادت می‌ماند.
 *
 * جریان کار:
 *   ۱. کارت سررسیدشده نشان داده می‌شود
 *   ۲. اول سوال، بعد «نمایش پاسخ»
 *   ۳. کاربر خودش می‌گوید چقدر راحت بود
 *   ۴. الگوریتم SM-2 فاصله‌ی بعدی را حساب می‌کند
 */

import { useMemo, useState, useCallback } from 'react'

import {
  review,
  dueCards,
  summarize,
  nextInDays,
  humanizeInterval,
  type Grade,
} from './srs'
import type { CardProgress, Flashcard } from './types'

interface Props {
  cards: Flashcard[]
  progress: Record<number, CardProgress>
  onGrade: (cardIndex: number, next: CardProgress) => void
  /** تمرین بعدی — برای «کارت تمام شد، برو تمرین» */
  onFinish: () => void
}

export function Flashcards({ cards, progress, onGrade, onFinish }: Props) {
  const [revealed, setRevealed] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const progressOf = useCallback(
    (c: Flashcard) => progress[c.n],
    [progress],
  )

  // کارت‌های سررسیدشده، مرتب‌شده با اولویت بیشترین احتمال فراموشی
  const queue = useMemo(
    () => dueCards(cards, progressOf),
    [cards, progressOf],
  )

  const stats = useMemo(
    () => summarize(cards.length, (i) => progress[cards[i]?.n]),
    [cards, progress],
  )

  if (cards.length === 0) return null

  const current = showAll ? cards[0] : queue[0]

  // ─── همه مرور شده‌اند ───
  if (!current) {
    const nextUp = cards
      .map((c) => nextInDays(progressOf(c)))
      .filter((d) => d > 0)
      .sort((a, b) => a - b)[0]

    return (
      <div className="study-panel">
        <div className="study-done">
          <div className="study-done-icon">✓</div>
          <h3>برای امروز تمام شد</h3>
          <p className="muted">
            {stats.learned} کارت یادگرفته‌شده، {stats.due} کارت سررسید.
            {nextUp ? ` کارت بعدی ${humanizeInterval(nextUp)} می‌آید.` : ''}
          </p>
          <div className="study-stats">
            <Stat label="کل" value={stats.total} />
            <Stat label="یادگرفته" value={stats.learned} tone="good" />
            <Stat label="در جریان" value={stats.total - stats.newCards - stats.learned} />
            <Stat label="جدید" value={stats.newCards} />
          </div>
          <div className="study-actions">
            <button type="button" className="btn" onClick={onFinish}>
              برو به تمرین‌ها
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setShowAll(true)
                setRevealed(false)
              }}
            >
              مرور همه‌ی کارت‌ها
            </button>
          </div>
        </div>
      </div>
    )
  }

  const card = current
  const p = progressOf(card)
  const isNew = !p || p.reps === 0

  function grade(g: Grade) {
    onGrade(card.n, review(p, g))
    setRevealed(false)
  }

  return (
    <div className="study-panel">
      <div className="study-head">
        <div>
          <span className="study-title">مرور کارت‌ها</span>
          <span className="study-sub">
            {showAll ? 'مرور آزاد' : `${queue.length} کارت سررسید`}
          </span>
        </div>
        <div className="study-progress">
          <span>{stats.learned} از {stats.total} یادگرفته</span>
          <div className="study-bar">
            <div
              className="study-bar-fill"
              style={{ width: `${(stats.learned / stats.total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── کارت ── */}
      <div className={`flashcard ${revealed ? 'revealed' : ''}`}>
        <div className="flashcard-inner">
          <div className="flashcard-side">
            <span className={`chip ${isNew ? 'chip-new' : ''}`}>
              {isNew ? 'کارت جدید' : humanizeInterval(nextInDays(p))}
            </span>
            <span className="flashcard-count">
              کارت {cards.indexOf(card) + 1} از {cards.length}
            </span>
          </div>

          {/* سوال همیشه هست */}
          <p className="flashcard-front">{card.front}</p>

          {/* جواب فقط بعد از «نمایش پاسخ» */}
          {revealed ? (
            <div className="flashcard-back">
              <div className="flashcard-divider" />
              <p>{card.back}</p>
            </div>
          ) : (
            <p className="flashcard-hint-text">
              اول جواب را خودت بگو، بعد پاسخ را ببین.
            </p>
          )}
        </div>
      </div>

      {/* ── دکمه‌ها ── */}
      {!revealed ? (
        <button
          type="button"
          className="btn btn-primary btn-wide"
          onClick={() => setRevealed(true)}
        >
          نمایش پاسخ
          <kbd>Space</kbd>
        </button>
      ) : (
        <>
          <p className="grade-label">چقدر راحت بود؟</p>
          <div className="grade-row">
            <button type="button" className="grade-btn grade-again" onClick={() => grade('again')}>
              <strong>فراموش کردم</strong>
              <span>فردا</span>
            </button>
            <button type="button" className="grade-btn grade-hard" onClick={() => grade('hard')}>
              <strong>سخت بود</strong>
              <span>زود برمی‌گردد</span>
            </button>
            <button type="button" className="grade-btn grade-good" onClick={() => grade('good')}>
              <strong>یادم بود</strong>
              <span>عادی</span>
            </button>
            <button type="button" className="grade-btn grade-easy" onClick={() => grade('easy')}>
              <strong>خیلی آسان</strong>
              <span>دیرتر برمی‌گردد</span>
            </button>
          </div>
        </>
      )}

      <div className="study-foot">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setShowAll((v) => !v)
            setRevealed(false)
          }}
        >
          {showAll ? 'فقط کارت‌های سررسید' : 'مرور همه'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onFinish}>
          تمرین‌های این فاز
        </button>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: 'good'
}) {
  return (
    <div className={`stat ${tone ?? ''}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}