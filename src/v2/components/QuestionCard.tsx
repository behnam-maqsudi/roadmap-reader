/**
 * QuestionCard.tsx — پرسش چندگزینه‌ای
 *
 * ⭐⭐ چرا این مهم‌ترین بخشِ آموزشیِ نسخهٔ ۲ است
 *
 * در نسخهٔ ۱، تمرین یک «مسئله + گاهی یک راهنما» بود و **هرگز جوابی نداشت**.
 * یعنی کاربر نمی‌توانست بفهمد درست فهمیده یا نه — و این بدترین حالتِ یادگیری
 * است، چون آدم فکر می‌کند فهمیده.
 *
 * اینجا هر گزینه یک `why` دارد: اگر کاربر **غلط** را بزند، دقیقاً همان
 * اشتباهِ او برایش توضیح داده می‌شود، نه اینکه فقط بگویند «غلط بود». این
 * چیزی است که پرسش را از آزمون به درس تبدیل می‌کند.
 */

import { useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import type { ChoiceQuestion } from '../types'

export function ChoiceQ({ q }: { q: ChoiceQuestion }) {
  const [chosen, setChosen] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)

  const isCorrect = checked && chosen === q.correct

  return (
    <section
      className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
      aria-labelledby={`${q.id}-title`}
    >
      {/* ── سر: تیتر و برچسب ── */}
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone="note">پرسش</Badge>
        {q.section && <span className="text-xs text-[var(--text-faint)]">{q.section}</span>}
      </header>

      <h3 id={`${q.id}-title`} className="mb-1.5 text-base font-bold leading-relaxed">
        {q.title}
      </h3>
      <p className="mb-4 text-[0.92rem] leading-relaxed text-[var(--text-muted)]">
        {q.prompt}
      </p>

      {/* ── گزینه‌ها ── */}
      <ul className="mb-4 flex flex-col gap-2" role="radiogroup" aria-label={q.title}>
        {q.options.map((opt, i) => {
          const picked = chosen === i
          const showResult = checked

          // حالت‌بندی فقط بعد از «بررسی» رنگ می‌گیرد، تا کاربر بتواند
          // قبل از دیدن جواب، خودش فکر کند.
          const tone = !showResult
            ? picked
              ? 'border-[var(--accent)] bg-[var(--surface-2)]'
              : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]'
            : i === q.correct
              ? 'border-[var(--ok-bar)] bg-[var(--ok-bg)]'
              : picked
                ? 'border-[var(--bad-bar)] bg-[var(--bad-bg)]'
                : 'border-[var(--border)] bg-[var(--surface)] opacity-60'

          return (
            <li key={i}>
              <button
                type="button"
                role="radio"
                aria-checked={picked}
                disabled={checked}
                onClick={() => setChosen(i)}
                className={`flex w-full items-start gap-3 rounded-[var(--radius-inner)] border-2 px-3.5 py-2.5 text-start text-[0.92rem] leading-relaxed transition-all ${tone}`}
              >
                <span
                  aria-hidden
                  className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-[var(--border-strong)] text-xs font-bold"
                >
                  {showResult && i === q.correct ? '✓' : showResult && picked ? '✕' : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  {opt.text}
                </span>
              </button>

              {/* ⭐ توضیحِ گزینه — فقط بعد از بررسی نمایش داده می‌شود */}
              {showResult && (picked || i === q.correct) && (
                <p
                  className={`mt-1.5 flex items-start gap-2 ps-11 text-[0.85rem] leading-relaxed ${
                    i === q.correct
                      ? 'text-[var(--ok-bar)]'
                      : 'text-[var(--bad-bar)]'
                  }`}
                >
                  <span aria-hidden className="font-bold">
                    {i === q.correct ? '✓' : '✕'}
                  </span>
                  <span>{opt.why}</span>
                </p>
              )}
            </li>
          )
        })}
      </ul>

      {/* ── نتیجه ── */}
      {checked && (
        <div
          className={`mb-3 rounded-[var(--radius-inner)] border-2 p-3.5 text-[0.9rem] leading-relaxed ${
            isCorrect
              ? 'border-[var(--ok-bar)] bg-[var(--ok-bg)]'
              : 'border-[var(--warn-bar)] bg-[var(--warn-bg)]'
          }`}
          role="status"
        >
          <span className="font-bold">
            {isCorrect ? 'آفرین، درست است! ' : 'این بار درست نشد. '}
          </span>
          <span>{q.because}</span>
        </div>
      )}

      <div className="flex gap-2">
        {!checked ? (
          <Button onClick={() => setChecked(true)} disabled={chosen === null}>
            بررسی پاسخ
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={() => { setChecked(false); setChosen(null) }}>
              دوباره تلاش کن
            </Button>
            {!isCorrect && chosen !== null && (
              <Button
                variant="ghost"
                onClick={() => { setChecked(false); setChosen(q.correct) }}
              >
                جواب درست را ببین
              </Button>
            )}
          </>
        )}
      </div>
    </section>
  )
}