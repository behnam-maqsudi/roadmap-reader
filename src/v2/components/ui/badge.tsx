/**
 * badge.tsx — برچسب (کامپوننت پایه، به سبک shadcn)
 *
 * برای وضعیت‌ها و شمارنده‌ها: «۳ کارت آماده»، «سخت»، «فاز ۰۴».
 */

import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 ' +
    'text-[0.72rem] font-bold leading-tight whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]',
        accent: 'border-transparent bg-[var(--accent)] text-[var(--accent-text)]',
        ok: 'border-[var(--ok-bar)] bg-[var(--ok-bg)] text-[var(--ok-bar)]',
        bad: 'border-[var(--bad-bar)] bg-[var(--bad-bg)] text-[var(--bad-bar)]',
        warn: 'border-[var(--warn-bar)] bg-[var(--warn-bg)] text-[var(--warn-bar)]',
        note: 'border-[var(--note-bar)] bg-[var(--note-bg)] text-[var(--note-bar)]',
        key: 'border-[var(--key-bar)] bg-[var(--key-bg)] text-[var(--key-bar)]',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ tone }), className)} {...props} />
  ),
)
Badge.displayName = 'Badge'