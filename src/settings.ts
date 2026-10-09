/**
 * settings.ts — مقادیر پیش‌فرض، اعتبارسنجی، و ذخیره‌سازی
 *
 * نکته‌ی مهم: هر کلید اینجا باید یک متغیر CSS متناظر در styles.css داشته باشد.
 * اگر کلیدی اضافه کردی، فراموش نکن متغیرش را هم بسازی.
 */

import type { Settings } from './types'
import { STORAGE_KEY } from './types'

export const DEFAULT_SETTINGS: Settings = {
  // متن
  fontSize: 17,
  lineHeight: 1.9,
  paragraphSpacing: 1.1,
  contentWidth: 720,
  fontFamily: 'vazir',
  fontWeight: 400,
  letterSpacing: 0,
  textAlign: 'right',
  direction: 'rtl',

  // کد
  codeFontSize: 14,
  // ⭐ 'auto' = رنگ کد با تم صفحه می‌رود (تم تیره → کد تاریک).
  // پیش‌فرض قبلاً 'github' بود و روی تم تیره متن را ناخوانا می‌کرد.
  codeTheme: 'auto',
  showLineNumbers: false,
  codeWrap: false,
  codeBlockSpacing: 1.4,

  // ظاهر
  theme: 'light',
  contentPadding: 24,
  showToc: true,
  showStudy: true,
  showToolbar: true,
  tableBorder: true,

  // رفتار
  tableLayout: 'auto',
  headingBorder: true,
}

/** محدوده‌ی مجاز هر عدد — برای جلوگیری از شکستن چیدمان */
const LIMITS = {
  fontSize: [12, 32],
  lineHeight: [1.2, 2.6],
  paragraphSpacing: [0.3, 2.5],
  contentWidth: [480, 1200],
  fontWeight: [300, 800],
  letterSpacing: [-0.05, 0.2],
  codeFontSize: [10, 24],
  contentPadding: [0, 64],
  codeBlockSpacing: [0.4, 3],
} as const

/** نام فونت‌های متن — باید با CSS هماهنگ باشد */
export const FONT_STACKS: Record<Settings['fontFamily'], string> = {
  vazir: "'Vazirmatn', system-ui, sans-serif",
  iransans: "'IRANSans', system-ui, sans-serif",
  noto: "'Noto Sans Arabic', 'Segoe UI', sans-serif",
  system: "system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif",
  serif: "'Vazirmatn', Georgia, 'Times New Roman', serif",
  mono: "'JetBrains Mono', 'Cascadia Code', Consolas, monospace",
}

type NumericKey = {
  [K in keyof Settings]: Settings[K] extends number ? K : never
}[keyof Settings]

/** یک عدد را به محدوده‌ی مجازش برمی‌گرداند */
function clamp(value: number, key: NumericKey): number {
  const [min, max] = LIMITS[key]
  return Math.min(Math.max(value, min), max)
}

/** یک رشته را به یکی از گزینه‌های مجاز تبدیل می‌کند */
function coerce<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback
}

const THEMES = [
  'light', 'dark', 'sepia', 'nord',
  'dracula', 'high-contrast', 'solarized-light',
] as const

const FAMILIES = ['vazir', 'iransans', 'noto', 'system', 'serif', 'mono'] as const

// ⭐ 'auto' اول است و پیش‌فرض هم هست: تم کد با تم صفحه هماهنگ می‌ماند.
const CODE_THEMES = [
  'auto',
  'github',
  'github-dark',
  'atom-one-dark',
  'vs',
  'monokai',
] as const

/**
 * تنظیمات ذخیره‌شده را می‌خواند و با مقادیر پیش‌فرض ادغام می‌کند.
 * اگر کلیدی نامعتبر باشد، به مقدار پیش‌فرض برمی‌گردد.
 */
export function loadSettings(): Settings {
  const base = { ...DEFAULT_SETTINGS }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base

    const saved = JSON.parse(raw) as Partial<Settings>

    const s: Settings = {
      // اعداد
      fontSize: typeof saved.fontSize === 'number' ? clamp(saved.fontSize, 'fontSize') : base.fontSize,
      lineHeight: typeof saved.lineHeight === 'number' ? clamp(saved.lineHeight, 'lineHeight') : base.lineHeight,
      paragraphSpacing: typeof saved.paragraphSpacing === 'number' ? clamp(saved.paragraphSpacing, 'paragraphSpacing') : base.paragraphSpacing,
      contentWidth: typeof saved.contentWidth === 'number' ? clamp(saved.contentWidth, 'contentWidth') : base.contentWidth,
      fontWeight: typeof saved.fontWeight === 'number' ? clamp(saved.fontWeight, 'fontWeight') : base.fontWeight,
      letterSpacing: typeof saved.letterSpacing === 'number' ? clamp(saved.letterSpacing, 'letterSpacing') : base.letterSpacing,
      codeFontSize: typeof saved.codeFontSize === 'number' ? clamp(saved.codeFontSize, 'codeFontSize') : base.codeFontSize,
      contentPadding: typeof saved.contentPadding === 'number' ? clamp(saved.contentPadding, 'contentPadding') : base.contentPadding,
      codeBlockSpacing: typeof saved.codeBlockSpacing === 'number' ? clamp(saved.codeBlockSpacing, 'codeBlockSpacing') : base.codeBlockSpacing,

      // رشته‌ها (با اعتبارسنجی)
      fontFamily: coerce(saved.fontFamily, FAMILIES, base.fontFamily),
      textAlign: coerce(saved.textAlign, ['right', 'justify', 'left', 'center'] as const, base.textAlign),
      direction: coerce(saved.direction, ['rtl', 'ltr'] as const, base.direction),
      theme: coerce(saved.theme, THEMES, base.theme),
      codeTheme: coerce(saved.codeTheme, CODE_THEMES, base.codeTheme),
      tableLayout: coerce(saved.tableLayout, ['auto', 'fixed'] as const, base.tableLayout),

      // بولی‌ها
      showLineNumbers: typeof saved.showLineNumbers === 'boolean' ? saved.showLineNumbers : base.showLineNumbers,
      codeWrap: typeof saved.codeWrap === 'boolean' ? saved.codeWrap : base.codeWrap,
      showToc: typeof saved.showToc === 'boolean' ? saved.showToc : base.showToc,
      showStudy: typeof saved.showStudy === 'boolean' ? saved.showStudy : base.showStudy,
      showToolbar: typeof saved.showToolbar === 'boolean' ? saved.showToolbar : base.showToolbar,
      tableBorder: typeof saved.tableBorder === 'boolean' ? saved.tableBorder : base.tableBorder,
      headingBorder: typeof saved.headingBorder === 'boolean' ? saved.headingBorder : base.headingBorder,
    }

    return s
  } catch {
    // اگر JSON خراب بود، به پیش‌فرض برگرد
    return base
  }
}

/** تنظیمات را ذخیره می‌کند. اگر شکست خورد، بی‌صدا رد می‌شود. */
export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // حالت مرور خصوصی یا quota پر — مهم نیست
  }
}
