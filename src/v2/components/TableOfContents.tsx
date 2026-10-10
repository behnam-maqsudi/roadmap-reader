/**
 * TableOfContents.tsx — ریل کانتکست و سرفصل‌های صفحه جاری (ستون چپ)
 *
 * الهام‌گرفته از Context Rail دیزاین‌سیستم Tectonic Obsidian (خروجی Google Stitch):
 * - نمایش سرفصل‌های فاز فعال (H2 و H3)
 * - اسکرول نرم به بخش هدف
 * - نشانگر بخش فعال
 */

import { useEffect, useState } from 'react'

export interface TocHeading {
  id: string
  text: string
  level: number
}

export function TableOfContents({
  headings,
  activeDocTitle,
}: {
  headings: TocHeading[]
  activeDocTitle?: string
}) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      },
    )

    for (const h of headings) {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  return (
    <aside
      aria-label="سرفصل‌های این صفحه"
      className="sticky top-[64px] hidden max-h-[calc(100vh-80px)] w-[240px] shrink-0 overflow-y-auto rounded-[var(--radius-inner)] border border-[var(--border)] bg-[var(--surface)]/70 p-4 backdrop-blur-md xl:block"
    >
      <header className="mb-3 flex items-center justify-between border-b border-[var(--border)] pb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text)]">
          <span className="h-2 w-2 rounded-full bg-[var(--secondary)]" />
          <span>سرفصل‌های این صفحه</span>
        </div>
        <span className="text-[0.68rem] font-mono text-[var(--text-faint)]">
          {headings.length} بخش
        </span>
      </header>

      {activeDocTitle && (
        <p className="mb-3 truncate text-[0.74rem] font-medium text-[var(--text-muted)]" title={activeDocTitle}>
          {activeDocTitle}
        </p>
      )}

      <nav>
        <ul className="flex flex-col gap-1 text-[0.8rem] leading-snug">
          {headings.map((h) => {
            const isActive = activeId === h.id
            return (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className={`block rounded-md py-1.5 transition-all ${
                    h.level === 3 ? 'ps-4 text-[0.76rem]' : 'font-semibold'
                  } ${
                    isActive
                      ? 'border-e-2 border-[var(--primary)] bg-[var(--surface-2)] font-bold text-[var(--primary)] ps-2.5'
                      : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                  }`}
                >
                  {h.text}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
