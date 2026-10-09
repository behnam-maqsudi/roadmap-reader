/**
 * card.tsx — کارت (کامپوننت پایه، به سبک shadcn)
 *
 * ⭐ این کارت، واحدِ ساختِ کلِ چیدمانِ نسخهٔ ۲ است: بخش‌های درس، پرسش‌ها،
 * فلش‌کارت‌ها و کارت‌های تمرین همگی از همین ساخته می‌شوند. یعنی گوشه‌های
 * گرد، سایه و فاصلهٔ داخلی همه‌جا یکی است.
 */

import { forwardRef } from 'react'
import { cn } from '../../cn'

export const Card = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { tone?: 'plain' | 'raised' }
>(({ className, tone = 'plain', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-[var(--radius-card)] border border-[var(--border)]',
      tone === 'raised'
        ? 'bg-[var(--surface)] shadow-[var(--shadow-card)]'
        : 'bg-[var(--surface)]',
      className,
    )}
    {...props}
  />
))
Card.displayName = 'Card'

export const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center gap-2 p-4 pb-2', className)} {...props} />
))
CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-base font-bold leading-tight', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

export const CardBody = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-4 pt-2', className)} {...props} />
))
CardBody.displayName = 'CardBody'

export const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-2 border-t border-[var(--border)] p-3', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'