/**
 * PredictCard.tsx — پرسشِ «خروجیِ این کد چیست؟»
 *
 * ⭐⭐ چرا این نوع پرسش از بقیه مهم‌تر است
 *
 * خواندنِ کد حسِ «فهمیدن» می‌دهد ولی آن را ثابت نمی‌کند. آدم کدِ
 * Event Loop را می‌خواند و مطمئن است ترتیب را می‌داند — ولی تا خروجی را
 * **خودش پیش‌بینی نکند**، آن فهم از دست می‌رود.
 *
 * اینجا کاربر باید خروجی را انتخاب کند و تازه بعد جواب واقعی را ببیند.
 * هر گزینهٔ غلط یک **دامِ رایج** است با توضیحِ اینکه چرا ذهنِ او به آن‌جا
 * می‌رود — و همین، اشتباه را به نکته‌ای ماندگار تبدیل می‌کند.
 *
 * ⚠️ نکتهٔ ساختاری: گزینهٔ درست **دستی در آرایهٔ دام‌ها نیست**؛ از
 * `q.output` ساخته و به ابتدای فهرست اضافه می‌شود. اگر درست را دستی
 * می‌گذاشتیم، یک جابه‌جایی در ویرایش بعدی کل پرسش را غلط می‌کرد و
 * هیچ خطایی هم نمی‌داد.
 */

import { useMemo, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import type { PredictQuestion } from '../types'

export function PredictQ({ q }: { q: PredictQuestion }) {
  const [chosen, setChosen] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)

  /** گزینهٔ درست همیشه اندیس صفر است — بقیه‌اش دام‌اند. */
  const options = useMemo(
    () => [
      { text: q.output, why: q.why },
      ...q.traps,
    ],
    [q.output, q.why, q.traps],
  )

  const isCorrect = checked && chosen === 0

  return (
    <section
      className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
      aria-labelledby={`${q.id}-title`}
    >
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone="key">پیش‌بینی خروجی</Badge>
        {q.section && <span className="text-xs text-[var(--text-faint)]">{q.section}</span>}
      </header>

      <h3 id={`${q.id}-title`} className="mb-1.5 text-base font-bold leading-relaxed">
        {q.title}
      </h3>
      <p className="mb-4 text-[0.92rem] leading-relaxed text-[var(--text-muted)]">
        {q.prompt}
      </p>

      {/* ── قطعه‌کد ── */}
      {/* بعضی پیش‌بینی‌ها کد ندارند (مثلاً پرسش‌های تصمیمِ معماری)، پس
          بلوک فقط وقتی رسم می‌شود که واقعاً `code` داشته باشد. */}
      {q.code && (
        <div className="code-block mb-4" dir="ltr">
          {q.lang && (
            <span className="absolute top-1.5 end-2 text-[0.7rem] font-semibold text-[var(--text-faint)] select-none">
              {q.lang}
            </span>
          )}
          <pre>
            <code>{q.code}</code>
          </pre>
        </div>
      )}

      <p className="mb-2 text-sm font-bold">{q.question}</p>

      {/* ── گزینه‌های خروجی ── */}
      <ul className="mb-4 flex flex-col gap-2" role="radiogroup" aria-label={q.question}>
        {options.map((opt, i) => {
          const picked = chosen === i
          const tone = !checked
            ? picked
              ? 'border-[var(--accent)] bg-[var(--surface-2)]'
              : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]'
            : i === 0
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
                className={`w-full rounded-[var(--radius-inner)] border-2 px-3.5 py-2 text-start transition-all ${tone}`}
              >
                {q.code ? (
                  /* خروجیِ کد: مونواسپیس، چپ‌به‌راست، بدون شکستنِ خط */
                  <pre dir="ltr" className="m-0 font-mono text-[0.85rem] leading-relaxed">
                    {opt.text}
                  </pre>
                ) : (
                  /* پاسخِ متنی: راست‌به‌راست، با حفظِ خط‌بندیِ سطرها */
                  <span className="block whitespace-pre-wrap text-[0.9rem] leading-relaxed">
                    {opt.text}
                  </span>
                )}
              </button>

              {checked && (picked || i === 0) && (
                <p
                  className={`mt-1.5 flex items-start gap-2 ps-3 text-[0.85rem] leading-relaxed ${
                    i === 0 ? 'text-[var(--ok-bar)]' : 'text-[var(--bad-bar)]'
                  }`}
                >
                  <span aria-hidden className="font-bold">
                    {i === 0 ? '✓' : '✕'}
                  </span>
                  <span>{opt.why}</span>
                </p>
              )}
            </li>
          )
        })}
      </ul>

      {checked && (
        <div
          role="status"
          className={`rounded-[var(--radius-inner)] border-2 p-3.5 text-[0.9rem] leading-relaxed ${
            isCorrect
              ? 'border-[var(--ok-bar)] bg-[var(--ok-bg)]'
              : 'border-[var(--note-bar)] bg-[var(--note-bg)]'
          }`}
        >
          {isCorrect ? (
            <>
              <span className="font-bold">آفرین! درست پیش‌بینی کردی. </span>
              <span>{q.why}</span>
            </>
          ) : (
            <>
              <span className="font-bold">
                خروجیِ واقعی این بود (گزینهٔ اول). دام‌های رایج را بالا ببین.
              </span>
            </>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {!checked ? (
          <Button onClick={() => setChecked(true)} disabled={chosen === null}>
            بررسی پیش‌بینی
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => { setChecked(false); setChosen(null) }}
          >
            دوباره تلاش کن
          </Button>
        )}
      </div>
    </section>
  )
}