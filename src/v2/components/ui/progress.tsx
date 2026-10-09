/**
 * progress.tsx — نوار پیشرفت (کامپوننت پایه، به سبک shadcn)
 *
 * ⭐ نکتهٔ راست‌به‌چپ: نوار **از راست** پر می‌شود، چون در صفحهٔ فارسی
 * «پیشروی» یعنی حرکت به سمت چپ نیست. با استفاده از `inset-inline-start`
 * این خودکار و درست می‌شود، و لازم نیست برای حالت چپ‌چین چیزی اضافه کرد.
 */

import { cn } from '../../cn'

export function Progress({
  value,
  max = 100,
  label,
  className,
}: {
  /** مقدار فعلی */
  value: number
  /** سقف (پیش‌فرض ۱۰۰) */
  max?: number
  /** برچسبِ دسترس‌پذیری */
  label?: string
  className?: string
}) {
  // نباید بیرون از ۰..۱ برود، وگرنه نوار می‌شکند
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div
      className={cn(
        'h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]',
        'border border-[var(--border)]',
        className,
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div
        className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}