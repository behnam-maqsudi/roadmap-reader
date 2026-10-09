/**
 * DataCard.tsx — تمرینِ داده‌ای با **جوابِ قابل‌مشاهده**
 *
 * ⭐⭐ بزرگ‌ترین افزودهٔ آموزشیِ نسخهٔ ۲
 *
 * تمرینِ نسخهٔ ۱ یک صورت‌مسئله + دادهٔ نمونه می‌داد و **هرگز جوابی نداشت**.
 * کاربر می‌رفت، کار می‌کرد، و هیچ‌وقت نمی‌فهمید درست فهمیده یا نه. این
 * بدترین حالتِ ممکن است: آدم مطمئن می‌شود که یاد گرفته، بدون آنکه
 * بازخوردی گرفته باشد.
 *
 * اینجا سه‌مرحله‌ای است و هر مرحله پشتِ یک دکمه پنهان است:
 *   ۱) مسئله را بخوان و روی داده کار کن
 *   ۲) اگر گیر کردی، گام‌های راهنما را باز کن
 *   ۳) جوابِ نهایی را ببین و **با کارِ خودت مقایسه کن**
 *
 * مرحلهٔ ۳ عمداً جدا از مرحلهٔ ۲ است تا کسی که می‌تواند خودش حل کند،
 * جواب را نبیند و لذتِ حل‌کردن را از دست بدهد.
 */

import { useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import type { ExerciseV2 } from '../types'

/** جدولِ دادهٔ نمونه — همان کاری که `Exercises.tsx` نسخهٔ ۱ می‌کرد،
 *  ولی اینجا با ظاهرِ نسخهٔ ۲ و قابلیتِ کپی. */
function DataTable({
  name,
  columns,
  rows,
}: {
  name: string
  columns: string[]
  rows: string[][]
}) {
  return (
    <div className="mb-3 overflow-hidden rounded-[var(--radius-inner)] border border-[var(--border)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5">
        <span className="font-mono text-[0.78rem] font-bold" dir="ltr">
          {name}
        </span>
        <span className="text-[0.72rem] text-[var(--text-faint)]">
          {rows.length} ردیف · {columns.length} ستون
        </span>
      </div>
      <div className="max-h-64 overflow-auto">
        <table className="w-full border-collapse text-[0.82rem]">
          <thead className="sticky top-0">
            <tr>
              {columns.map((c) => (
                <th
                  key={c}
                  className="border-b border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5 text-start font-bold"
                  dir="ltr"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className={r % 2 ? 'bg-[var(--table-stripe)]' : undefined}>
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className="border-b border-[var(--border)] px-2.5 py-1 font-mono"
                    dir="ltr"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ExerciseQ({ q }: { q: ExerciseV2 }) {
  const [stage, setStage] = useState(0) // ۰ = فقط مسئله، ۱ = راهنما، ۲ = جواب

  return (
    <section
      className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
      aria-labelledby={`${q.id}-title`}
    >
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone="warn">تمرین</Badge>
        {q.section && <span className="text-xs text-[var(--text-faint)]">{q.section}</span>}
      </header>

      <h3 id={`${q.id}-title`} className="mb-1.5 text-base font-bold leading-relaxed">
        {q.title}
      </h3>
      <p className="mb-4 text-[0.92rem] leading-relaxed text-[var(--text-muted)]">
        {q.prompt}
      </p>

      <p className="mb-4 rounded-[var(--radius-inner)] border border-[var(--border)] bg-[var(--surface-2)] p-3.5 text-[0.92rem] leading-relaxed">
        <span className="font-bold">سؤال: </span>
        {q.question}
      </p>

      {q.data && <DataTable {...q.data} />}

      {/* ── مرحلهٔ ۲: راهنما ── */}
      {stage >= 1 && (
        <div className="mb-3 rounded-[var(--radius-inner)] border-2 border-[var(--note-bar)] bg-[var(--note-bg)] p-3.5">
          <span className="mb-2 block font-bold text-[var(--note-bar)]">
            💡 گام‌های راهنما
          </span>
          <ol className="flex list-decimal flex-col gap-1.5 ps-5 text-[0.88rem] leading-relaxed">
            {q.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      )}

      {/* ── مرحلهٔ ۳: جواب ── */}
      {stage >= 2 && (
        <div className="mb-3 rounded-[var(--radius-inner)] border-2 border-[var(--ok-bar)] bg-[var(--ok-bg)] p-3.5">
          <span className="mb-2 block font-bold text-[var(--ok-bar)]">
            ✅ جوابِ نمونه
          </span>
          <pre
            dir="ltr"
            className="mb-3 overflow-x-auto rounded-md bg-[var(--code-bg)] p-3 font-mono text-[0.85rem] leading-relaxed"
          >
            {q.solution}
          </pre>
          {q.answerData && <DataTable {...q.answerData} />}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {stage === 0 && (
          <>
            <Button onClick={() => setStage(1)}>نمایش راهنما</Button>
            <Button variant="outline" onClick={() => setStage(2)}>
              جواب را ببین
            </Button>
          </>
        )}
        {stage === 1 && (
          <Button onClick={() => setStage(2)}>حالا جواب را ببین</Button>
        )}
        {stage === 2 && (
          <Button
            variant="outline"
            onClick={() => setStage(0)}
          >
            از اول بخوان و خودت حل کن
          </Button>
        )}
      </div>
    </section>
  )
}