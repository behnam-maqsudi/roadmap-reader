/**
 * button.tsx — دکمه (کامپوننت پایه، به سبک shadcn)
 *
 * ⭐ چرا خودمان نوشتیم و از رجیستری shadcn نگرفتیم؟
 *
 * ۱) `shadcn init` به اینترنت وصل می‌شود و از ui.shadcn.com دانلود می‌کند.
 *    این پروژه **آفلاین** است؛ کاری که به شبکه نیاز داشته باشد، جایی ندارد.
 * ۲) نسخهٔ ۲ نباید حتی یک بایت به نسخهٔ ۱ وابسته باشد. این کامپوننت‌ها
 *    **همان کدی** هستند که shadcn تولید می‌کند، فقط دستی در پروژه نگه‌داری
 *    می‌شوند (که دقیقاً فلسفهٔ خودِ shadcn هم هست: مالکِ کد، شما هستید).
 *
 * `cva` (class-variance-authority) چیست؟ الگوی «تنوعِ کنترل‌شده»: به‌جای
 * اینکه هر جا کلاس‌های دلخواه بنویسیم، یک‌بار تعریف می‌کنیم چه
 * variantهایی وجود دارند و چه کلاسی هرکدام دارد. نتیجه: ظاهرِ دکمه‌ها در
 * کل اپ **یکدست** می‌ماند و تغییر دادنش یک‌جا انجام می‌شود.
 */

import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../cn'

const buttonVariants = cva(
  // پایهٔ مشترک همهٔ دکمه‌ها
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[0.6rem] ' +
    'font-semibold transition-all duration-150 select-none ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 ' +
    'disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--accent)] text-[var(--accent-text)] shadow-[var(--shadow-sm)] ' +
          'hover:bg-[var(--accent-hover)] active:translate-y-px',
        outline:
          'border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] ' +
          'hover:bg-[var(--surface-2)]',
        ghost:
          'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
        subtle:
          'bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--border)]',
      },
      size: {
        sm: 'h-8 px-3 text-[0.82rem]',
        md: 'h-10 px-4 text-[0.9rem]',
        lg: 'h-12 px-6 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

export { buttonVariants }