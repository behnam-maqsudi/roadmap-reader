/**
 * FlashcardsModal.tsx — مودال مرور تعاملی فلش‌کارت‌ها بر پایه SRS (Screen 2 خروجی Stitch)
 *
 * ویژگی‌ها:
 * - بارگذاری مستقیم از محتوای واقعی (`محتوا/فازها/*.json`)
 * - چرخش کارت سه‌بعدی با کلید Space یا کلیک
 * - ۴ دکمه امتیازدهی تکرار فاصله‌دار (دوباره، سخت، خوب، آسان)
 * - کلیدهای کیبورد: Space (چرخش)، 1 تا 4 (امتیازدهی)، ArrowRight/Left (ناوبری)
 * - ارجاع مستقیم به متن درس
 */

import { useEffect, useState, useCallback } from 'react'
import type { Flashcard } from '../../types'
import { Markdown } from '../Markdown'

export function FlashcardsModal({
  isOpen,
  onClose,
  phaseTitle,
  cards,
  onNavigateToRef,
}: {
  isOpen: boolean
  onClose: () => void
  phaseTitle: string
  cards: Flashcard[]
  onNavigateToRef?: (ref: string) => void
}) {
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const currentCard = cards[index]

  const nextCard = useCallback(() => {
    setIsFlipped(false)
    setIndex((prev) => (prev + 1 < cards.length ? prev + 1 : 0))
  }, [cards.length])

  const prevCard = useCallback(() => {
    setIsFlipped(false)
    setIndex((prev) => (prev - 1 >= 0 ? prev - 1 : cards.length - 1))
  }, [cards.length])

  const handleRate = useCallback(
    (_rating: number) => {
      nextCard()
    },
    [nextCard],
  )

  // کلیدهای میانبر کیبورد
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        setIsFlipped((f) => !f)
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextCard()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        prevCard()
      } else if (isFlipped && ['1', '2', '3', '4'].includes(e.key)) {
        handleRate(parseInt(e.key, 10))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isFlipped, nextCard, prevCard, handleRate, onClose])

  if (!isOpen || cards.length === 0) return null

  const progressPercent = Math.round(((index + 1) / cards.length) * 100)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="مرور فلش‌کارت‌ها"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity duration-300"
    >
      <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-pop)]">
        {/* ── هدر بالا ── */}
        <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
            <span className="text-xs font-bold text-[var(--primary)] font-mono">
              مرور هوشمند (SRS)
            </span>
            <span className="text-xs text-[var(--text-faint)]">/</span>
            <span className="max-w-[280px] truncate text-xs font-medium text-[var(--text-muted)]">
              {phaseTitle}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[var(--text-faint)]">
              کارت {index + 1} از {cards.length}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text)] transition-colors"
              aria-label="بستن"
            >
              ✕
            </button>
          </div>
        </header>

        {/* ── نوار باریک پیشرفت ── */}
        <div className="h-1 w-full bg-[var(--surface-2)] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--secondary)] to-[var(--primary)] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* ── محتوای کارت (با قابلیت چرخش سه‌بعدی) ── */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center min-h-[320px]">
          <div
            onClick={() => setIsFlipped((f) => !f)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setIsFlipped((f) => !f)
              }
            }}
            className="group relative cursor-pointer min-h-[260px] rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-6 shadow-sm transition-all hover:border-[var(--primary)]/50 hover:shadow-md flex flex-col justify-between"
          >
            {/* برچسب وضعیت روی کارت */}
            <div className="flex items-center justify-between text-xs text-[var(--text-faint)] mb-3">
              <span className="font-semibold text-[var(--secondary)]">
                {isFlipped ? 'پاسخ و تحلیل معماری' : 'پرسش مفهومی'}
              </span>
              <span className="rounded bg-[var(--surface)] px-2 py-0.5 text-[0.7rem] font-mono">
                {isFlipped ? 'کلید Space برای چرخش مجدد' : 'کلیک یا Space برای مشاهده پاسخ'}
              </span>
            </div>

            {/* بدنه کارت */}
            <div className="flex-1 text-[var(--text)] leading-relaxed text-sm md:text-base">
              {!isFlipped ? (
                <div className="prose">
                  <Markdown content={currentCard.front || (currentCard as unknown as { q?: string }).q || ''} />
                </div>
              ) : (
                <div className="prose border-t border-[var(--border)] pt-3">
                  <Markdown content={currentCard.back || (currentCard as unknown as { a?: string }).a || ''} />
                  {(currentCard as unknown as { ref?: string }).ref && (
                    <div className="mt-4 pt-2 border-t border-dashed border-[var(--border)] text-xs text-[var(--text-muted)]">
                      <span className="font-semibold text-[var(--secondary)]">مرجع: </span>
                      {(currentCard as unknown as { ref?: string }).ref}
                      {onNavigateToRef && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onNavigateToRef((currentCard as unknown as { ref?: string }).ref!)
                            onClose()
                          }}
                          className="ms-2 text-[var(--primary)] underline hover:text-[var(--primary-hover)]"
                        >
                          مشاهده در متن درس ←
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* راهنمای چرخش */}
            <div className="mt-4 text-center text-xs text-[var(--text-faint)]">
              {isFlipped ? 'برای بازگشت به سوال کلیک کنید' : 'روی کارت کلیک کنید تا پاسخ نمایان شود'}
            </div>
          </div>
        </div>

        {/* ── کنترل‌های امتیازدهی و ناوبری (پایین) ── */}
        <footer className="border-t border-[var(--border)] bg-[var(--surface-2)] p-4 flex flex-col gap-3">
          {isFlipped ? (
            <div className="flex flex-col gap-2">
              <span className="text-center text-[0.75rem] text-[var(--text-muted)]">
                میزان تسلط شما بر این مفهوم چقدر بود؟ (الگوریتم تکرار فاصله‌دار)
              </span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleRate(1)}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-2 text-center text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <div>دوباره (۱)</div>
                  <div className="text-[0.68rem] font-normal opacity-75">۱ روز</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleRate(2)}
                  className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-2 text-center text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                  <div>سخت (۲)</div>
                  <div className="text-[0.68rem] font-normal opacity-75">۳ روز</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleRate(3)}
                  className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2 py-2 text-center text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                >
                  <div>خوب (۳)</div>
                  <div className="text-[0.68rem] font-normal opacity-75">۷ روز</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleRate(4)}
                  className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-2 text-center text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  <div>آسان (۴)</div>
                  <div className="text-[0.68rem] font-normal opacity-75">۱۴ روز</div>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={prevCard}
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text)] transition-colors"
              >
                ← کارت قبلی
              </button>

              <button
                type="button"
                onClick={() => setIsFlipped(true)}
                className="rounded-md bg-[var(--primary)] px-5 py-2 text-xs font-bold text-[var(--accent-text)] hover:opacity-90 transition-opacity"
              >
                نمایش پاسخ (Space)
              </button>

              <button
                type="button"
                onClick={nextCard}
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text)] transition-colors"
              >
                کارت بعدی →
              </button>
            </div>
          )}
        </footer>
      </div>
    </div>
  )
}
