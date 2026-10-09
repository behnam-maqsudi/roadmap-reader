/**
 * Exercises.tsx — تمرین‌های عملی هر فاز
 *
 * ⭐ چرا این صفحه؟
 * خواندن، حافظه نمی‌سازد. تمرین می‌سازد.
 * هر تمرین یک مسئله‌ی واقعی است که باید خودت حل کنی —
 * و برای سنجش، داده‌ی ساختگی دارد که بتوانی روی آن کار کنی.
 */

import { useState } from 'react'

import type { Exercise, SampleData } from './types'

interface Props {
  exercises: Exercise[]
  done: Record<number, boolean>
  onToggle: (index: number, done: boolean) => void
}

export function Exercises({ exercises, done, onToggle }: Props) {
  const [open, setOpen] = useState<number | null>(null)
  const [showHint, setShowHint] = useState<Record<number, boolean>>({})

  if (exercises.length === 0) return null

  const doneCount = Object.values(done).filter(Boolean).length

  return (
    <div className="exercises">
      <div className="exercises-head">
        <div>
          <span className="study-title">تمرین‌ها</span>
          <span className="study-sub">
            {doneCount} از {exercises.length} انجام شده
          </span>
        </div>
        <div className="study-progress">
          <div className="study-bar">
            <div
              className="study-bar-fill"
              style={{ width: `${(doneCount / exercises.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <ul className="exercise-list">
        {exercises.map((ex, i) => {
          const isDone = !!done[i]
          const isOpen = open === i

          return (
            <li
              key={i}
              className={`exercise ${isDone ? 'done' : ''} ${isOpen ? 'open' : ''}`}
            >
              {/* ── سر تمرین ── */}
              <div className="exercise-row">
                <button
                  type="button"
                  className="exercise-check"
                  onClick={() => onToggle(i, !isDone)}
                  aria-label={isDone ? 'علامت‌زدن به‌عنوان انجام‌نشده' : 'علامت‌زدن به‌عنوان انجام‌شده'}
                  aria-pressed={isDone}
                >
                  {isDone ? '✓' : ''}
                </button>

                <button
                  type="button"
                  className="exercise-title"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className={`level-dot level-${ex.level}`} aria-hidden />
                  {ex.title}
                  <span className="exercise-chevron">{isOpen ? '▴' : '▾'}</span>
                </button>
              </div>

              {/* ── بدنه تمرین ── */}
              {isOpen && (
                <div className="exercise-body">
                  <p className="exercise-prompt">{ex.prompt}</p>

                  {ex.data && <DataTable data={ex.data} />}

                  {ex.hint && (
                    <div className="exercise-hint-wrap">
                      {showHint[i] ? (
                        <p className="exercise-hint">
                          <strong>راهنما:</strong> {ex.hint}
                        </p>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setShowHint((s) => ({ ...s, [i]: true }))}
                        >
                          💡 نمایش راهنما
                        </button>
                      )}
                    </div>
                  )}

                  <div className="exercise-done-criteria">
                    <span className="criteria-label">معیار اتمام</span>
                    {ex.done}
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * جدول داده‌ی ساختگی.
 *
 * ⭐ چرا به‌جای JSON خام، جدول؟
 * داده‌ی ساختاریافته وقتی در جدول باشد، شکلش را بهتر می‌شودی
 * و می‌شود مستقیم روی آن کار کرد (کپی در Excel، مرتب‌سازی ذهنی).
 */
function DataTable({ data }: { data: SampleData }) {
  return (
    <div className="data-block">
      <div className="data-head">
        <span className="data-name">{data.name}</span>
        <span className="data-count muted">
          {data.rows.length} ردیف · {data.columns.length} ستون
        </span>
      </div>
      <div className="data-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {data.columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c}>
                    <code>{cell}</code>
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