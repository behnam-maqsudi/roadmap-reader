/**
 * SettingsModal.tsx — پنجره تنظیمات مطالعه، تایپوگرافی و ظاهر (Screen 3 خروجی Stitch)
 *
 * ویژگی‌ها:
 * - تغییر تم بین ۴ حالت: تاریک تکتونیک، کاغذ روشن، محافظ چشم (سپیا)، و مونوکای سایبر
 * - اسلایدر اندازه قلم و ارگونومی خطوط
 * - نمایش پایدار فونت ایران‌سنس (IRANSans) و وضعیت آفلاین
 * - تنظیم عرض ستون خواندن
 */

import { useState } from 'react'

export interface ReaderSettings {
  theme: 'dark' | 'light' | 'sepia' | 'monokai'
  fontSize: number
  lineHeight: number
  readingWidth: 'standard' | 'wide'
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  settings: ReaderSettings
  onSave: (newSettings: ReaderSettings) => void
}) {
  const [theme, setTheme] = useState(settings.theme)
  const [fontSize, setFontSize] = useState(settings.fontSize)
  const [lineHeight, setLineHeight] = useState(settings.lineHeight)
  const [readingWidth, setReadingWidth] = useState(settings.readingWidth)
  const [activeTab, setActiveTab] = useState<'theme' | 'typography'>('theme')

  if (!isOpen) return null

  const handleApply = () => {
    onSave({
      theme,
      fontSize,
      lineHeight,
      readingWidth,
    })
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="تنظیمات مطالعه و ظاهر"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity"
    >
      <div className="relative w-full max-w-lg rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-pop)] overflow-hidden">
        {/* ── هدر تنظیمات ── */}
        <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[var(--primary)]" />
            <div>
              <h2 className="text-sm font-bold text-[var(--text)]">تنظیمات مطالعه و ظاهر</h2>
              <p className="text-[0.72rem] text-[var(--text-faint)]">
                شخصی‌سازی خوانایی، تایپوگرافی و کنتراست
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text)]"
            aria-label="بستن"
          >
            ✕
          </button>
        </header>

        {/* ── تب‌ها ── */}
        <div className="flex border-b border-[var(--border)] bg-[var(--surface-2)]/60 px-5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`border-b-2 py-2.5 px-3 font-semibold transition-colors ${
              activeTab === 'theme'
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            ظاهر و رنگ‌بندی
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('typography')}
            className={`border-b-2 py-2.5 px-3 font-semibold transition-colors ${
              activeTab === 'typography'
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            تایپوگرافی و ارگونومی
          </button>
        </div>

        {/* ── بدنه تب‌ها ── */}
        <div className="p-5 flex flex-col gap-5">
          {activeTab === 'theme' ? (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-[var(--text-muted)]">
                پوسته دیداری و کنتراست
              </span>
              <div className="grid grid-cols-2 gap-3">
                {/* تاریک تکتونیک */}
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-start transition-all ${
                    theme === 'dark'
                      ? 'border-[var(--primary)] bg-[#090d16] text-[#f8fafc] ring-1 ring-[var(--primary)]'
                      : 'border-[var(--border)] bg-[#0f172a] text-[#94a3b8] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 w-full justify-between">
                    <span className="text-xs font-bold">تاریک تکتونیک</span>
                    {theme === 'dark' && <span className="text-[0.7rem] text-[var(--primary)]">✓</span>}
                  </div>
                  <span className="text-[0.68rem] opacity-75">پیش‌فرض • کنتراست عمیق مهندسی</span>
                </button>

                {/* کاغذ روشن */}
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-start transition-all ${
                    theme === 'light'
                      ? 'border-[var(--primary)] bg-[#ffffff] text-[#0f172a] ring-1 ring-[var(--primary)]'
                      : 'border-[var(--border)] bg-[#f8fafc] text-[#475569] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 w-full justify-between">
                    <span className="text-xs font-bold">کاغذ روشن</span>
                    {theme === 'light' && <span className="text-[0.7rem] text-[var(--primary)]">✓</span>}
                  </div>
                  <span className="text-[0.68rem] opacity-75">روشن روزانه • سفید ملایم</span>
                </button>

                {/* محافظ چشم (سپیا) */}
                <button
                  type="button"
                  onClick={() => setTheme('sepia')}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-start transition-all ${
                    theme === 'sepia'
                      ? 'border-[var(--primary)] bg-[#f4ede0] text-[#3c3429] ring-1 ring-[var(--primary)]'
                      : 'border-[var(--border)] bg-[#fbf7ee] text-[#6b5e4d] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 w-full justify-between">
                    <span className="text-xs font-bold">محافظ چشم (سپیا)</span>
                    {theme === 'sepia' && <span className="text-[0.7rem] text-[var(--primary)]">✓</span>}
                  </div>
                  <span className="text-[0.68rem] opacity-75">گرم و کم‌نور • مطالعه طولانی شب</span>
                </button>

                {/* مونوکای */}
                <button
                  type="button"
                  onClick={() => setTheme('monokai')}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-start transition-all ${
                    theme === 'monokai'
                      ? 'border-[var(--primary)] bg-[#1e1f1c] text-[#f8f8f2] ring-1 ring-[var(--primary)]'
                      : 'border-[var(--border)] bg-[#272822] text-[#a6e22e] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 w-full justify-between">
                    <span className="text-xs font-bold">مونوکای سایبر</span>
                    {theme === 'monokai' && <span className="text-[0.7rem] text-[var(--primary)]">✓</span>}
                  </div>
                  <span className="text-[0.68rem] opacity-75">کنتراست هکری • ترمینال</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* قلم ایران‌سنس */}
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--text)]">قلم فعال: ایران‌سنس (IRANSans)</span>
                  <span className="text-[0.7rem] font-semibold text-[var(--primary)]">
                    ● محلی و آفلاین (WOFF2)
                  </span>
                </div>
                <p className="mt-1 text-[0.72rem] text-[var(--text-faint)]">
                  قلم ایران‌سنس با وزن‌های مختلف مستقیماً از حافظه محلی پروژه بارگذاری می‌شود.
                </p>
              </div>

              {/* اندازه فونت */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[var(--text-muted)]">اندازه قلم متن:</span>
                  <span className="font-mono text-[var(--primary)]">{fontSize} پیکسل</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="22"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="accent-[var(--primary)]"
                />
              </div>

              {/* ارتفاع خطوط */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[var(--text-muted)]">فاصله خطوط (Line-height):</span>
                  <span className="font-mono text-[var(--primary)]">{lineHeight.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="1.6"
                  max="2.2"
                  step="0.05"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(Number(e.target.value))}
                  className="accent-[var(--primary)]"
                />
              </div>

              {/* عرض ستون مطالعه */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-[var(--text-muted)]">عرض ستون مطالعه:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setReadingWidth('standard')}
                    className={`rounded-lg border py-2 px-3 text-center ${
                      readingWidth === 'standard'
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 font-bold text-[var(--primary)]'
                        : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]'
                    }`}
                  >
                    استاندارد (~80ch ارگونومیک)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReadingWidth('wide')}
                    className={`rounded-lg border py-2 px-3 text-center ${
                      readingWidth === 'wide'
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 font-bold text-[var(--primary)]'
                        : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]'
                    }`}
                  >
                    گسترده (تمام صفحه)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── فوتر دکمه اعمال ── */}
        <footer className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface-2)] px-5 py-3.5">
          <span className="text-[0.7rem] text-[var(--text-faint)]">
            وضعیت: تمام فازها و فایل‌ها ۱۰۰٪ آفلاین
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text)] transition-colors"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="rounded-md bg-[var(--primary)] px-4 py-1.5 text-xs font-bold text-[var(--accent-text)] hover:opacity-90 transition-opacity"
            >
              ذخیره و اعمال تنظیمات
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
