/**
 * PhaseNav.tsx — فهرستِ فازها در ستونِ راست
 *
 * ⭐⭐ سه تصمیمِ این فایل
 *
 * ۱) **فهرست فقط عنوان است، نه محتوا.**
 *    این فهرست با «باز/بسته بودن» چیزی کاری ندارد. کلیک روی هر عنوان
 *    فقط به `App` می‌گوید «این فاز را در ستونِ وسط باز کن». یعنی فهرست و
 *    محتوا **دو چیزِ جدا** هستند و هیچ‌کدام دیگری را نمی‌بلعند.
 *
 *    این برعکسِ آکاردئونِ قبلی است، و عمداً: آن یکی محتوا را **زیرِ خودش در
 *    همان ستون** باز می‌کرد. این یکی محتوا را در ستونِ وسط می‌گذارد و فهرست
 *    همیشه یک ستونِ باریک و مرتب می‌ماند.
 *
 * ۲) **عنوان‌ها زیرِ هم، بدون آکاردئون.** کاربر صریح گفت «آیتم‌ها را زیر هم
 *    بنویس» — یعنی یک فهرستِ تخت. اگر اینجا هم آکاردئون بود، دو لایهٔ باز و
 *    بسته می‌شد و معلوم نبود کدام لایه باز است.
 *
 * ۳) **باز بودنِ چندتایی.** کاربر می‌تواند چند فاز را هم‌زمان باز بگذارد؛
 *    مثل چند برگه که روی هم می‌مانند. `openIds` یک **مجموعه** است نه یک
 *    رشتهٔ واحد، و کلیک روی عنوانِ باز آن را **می‌بندد** (collapse).
 *
 * ⚠️ دسترسی‌پذیری: هر آیتم یک `aria-expanded` دارد و `aria-controls` به
 * کارتِ متنش اشاره می‌کند. کاربری که با کیبورد Tab/Enter می‌آید دقیقاً
 * همان کاری را می‌کند که با ماوس.
 */

import { Badge } from './ui/badge'
import { fa, phaseColor } from './PhaseSection'
import type { Doc } from '../types'
import type { Question } from '../types'

/** رنگِ نقطهٔ کنارِ عنوان — همان رنگِ فاز در سرتیتر و کارت. */
export function PhaseNav({
  groups,
  openIds,
  onToggle,
  questions,
}: {
  /** گروه‌ها به ترتیبِ نمایش، مثل «شروع کنید» و «فازها» */
  groups: { title: string; docs: Doc[] }[]
  /** شناسهٔ فازهای باز — مجموعه، چون چندتایی باز می‌مانند */
  openIds: Set<string>
  onToggle: (id: string) => void
  questions: Map<number, Question[]>
}) {
  if (groups.every((g) => g.docs.length === 0)) {
    return (
      <p className="px-3 py-4 text-center text-sm text-[var(--text-faint)]">
        چیزی برای نمایش نیست
      </p>
    )
  }

  return (
    <nav aria-label="فهرست فازها" className="flex flex-col gap-6">
      {groups.map((group) =>
        group.docs.length === 0 ? null : (
          <section key={group.title}>
            <h2 className="mb-2 px-3 text-[0.7rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">
              {group.title}
            </h2>

            {/* ⭐ فهرستِ تخت: عنوان‌ها زیرِ هم، بدون لایهٔ تاشدنیِ دیگر */}
            <ul className="flex flex-col gap-0.5">
              {group.docs.map((d) => {
                const isOpen = openIds.has(d.id)
                const n = questions.get(d.num)?.length ?? 0

                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => onToggle(d.id)}
                      aria-expanded={isOpen}
                      aria-controls={`phase-panel-${d.id}`}
                      className={`flex w-full items-center gap-2.5 rounded-[var(--radius-inner)] px-3 py-2 text-start text-[0.87rem] leading-snug transition-colors ${
                        isOpen
                          ? 'bg-[var(--surface-2)] font-bold text-[var(--text)]'
                          : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                      }`}
                    >
                      {/* نقطهٔ رنگیِ فاز — همین رنگ در سرتیترِ کارت هم می‌آید */}
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          background: phaseColor(d.num),
                          opacity: isOpen ? 1 : 0.55,
                        }}
                      />
                      <span className="min-w-0 flex-1">{d.title}</span>
                      {n > 0 && <Badge tone="neutral">{fa(n)}</Badge>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ),
      )}
    </nav>
  )
}