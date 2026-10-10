/**
 * PhaseNav.tsx — فهرست فازها و نوار پیشرفت دوره در ستون راست (Screen 1 خروجی Stitch)
 *
 * ویژگی‌ها:
 * - نوار کل پیشرفت دوره با درصد زنده
 * - فهرست تخت فازها
 * - برچسب‌های وضعیت: تکمیل (سبز زمردی)، در حال مطالعه (فیروزه‌ای چشمک‌زن)، خوانده‌نشده (کم‌رنگ)
 * - شمارنده پرسش‌ها و فلش‌کارت‌ها
 */

import { Badge } from './ui/badge'
import { fa, phaseColor } from './PhaseSection'
import type { Doc } from '../types'
import type { Question } from '../types'

export function PhaseNav({
  groups,
  openIds,
  completedIds = new Set(),
  onToggle,
  questions,
  totalPhases = 0,
  completedPhasesCount = 0,
}: {
  groups: { title: string; docs: Doc[] }[]
  openIds: Set<string>
  completedIds?: Set<string>
  onToggle: (id: string) => void
  questions: Map<number, Question[]>
  totalPhases?: number
  completedPhasesCount?: number
}) {
  const percent = totalPhases > 0 ? Math.round((completedPhasesCount / totalPhases) * 100) : 0

  return (
    <nav aria-label="فهرست فازها" className="flex flex-col gap-5">
      {/* ── کارت پیشرفت کل دوره ── */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-[var(--text-muted)]">پیشرفت کل دوره:</span>
          <span className="font-mono text-[var(--primary)] font-bold">{fa(percent)}٪</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--surface-3)] overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--secondary)] to-[var(--primary)] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[0.72rem] text-[var(--text-faint)]">
          <span>{fa(completedPhasesCount)} از {fa(totalPhases)} فاز تکمیل شده</span>
          {percent === 100 && <span className="text-[var(--primary)] font-bold">🎉 دوره تکمیل شد!</span>}
        </div>
      </section>

      {/* ── گروه‌های فازها ── */}
      {groups.every((g) => g.docs.length === 0) ? (
        <p className="px-3 py-4 text-center text-sm text-[var(--text-faint)]">
          چیزی برای نمایش نیست
        </p>
      ) : (
        groups.map((group) =>
          group.docs.length === 0 ? null : (
            <section key={group.title}>
              <h2 className="mb-2 px-2 text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-faint)]">
                {group.title}
              </h2>

              <ul className="flex flex-col gap-1">
                {group.docs.map((d) => {
                  const isOpen = openIds.has(d.id)
                  const isCompleted = completedIds.has(d.id)
                  const n = questions.get(d.num)?.length ?? 0

                  return (
                    <li key={d.id}>
                      <button
                        type="button"
                        onClick={() => onToggle(d.id)}
                        aria-expanded={isOpen}
                        aria-controls={`phase-panel-${d.id}`}
                        className={`group flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-start transition-all ${
                          isOpen
                            ? 'bg-[var(--surface-2)] font-bold text-[var(--text)] border-r-2 border-[var(--primary)] ring-1 ring-[var(--secondary)]/40 shadow-sm'
                            : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]/70 hover:text-[var(--text)]'
                        }`}
                      >
                        {/* نقطه رنگی فاز */}
                        <span
                          aria-hidden
                          className="h-2.5 w-2.5 shrink-0 rounded-full transition-transform group-hover:scale-110 mt-1.5"
                          style={{
                            background: phaseColor(d.num),
                            opacity: isOpen || isCompleted ? 1 : 0.45,
                          }}
                        />

                        {/* عنوان فاز — متن کامل در دو یا سه خط بدون بریدگی */}
                        <span className="min-w-0 flex-1 whitespace-normal break-words leading-relaxed text-[0.84rem]">
                          {d.title}
                        </span>

                        {/* آیکون تیک برای تکمیل + شمارنده پرسش‌ها بدون برچسب متنی */}
                        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                          {isCompleted && (
                            <span className="text-emerald-400 text-xs font-bold shrink-0" title="تکمیل‌شده">
                              ✓
                            </span>
                          )}
                          {n > 0 && <Badge tone="neutral">{fa(n)}</Badge>}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ),
        )
      )}
    </nav>
  )
}