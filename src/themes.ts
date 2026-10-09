/**
 * themes.ts — تعریف تم‌ها
 *
 * هر تم، مجموعه‌ای از متغیرهای CSS است که در styles.css مصرف می‌شوند.
 * برای افزودن تم جدید: یک رنگ اضافه کن + در THEMES اضافه‌اش کن.
 */

import type { CodeTheme, ThemeName } from './types'

/** رنگ‌های یک تم. هر آنچه متن به آن نیاز دارد اینجاست. */
export interface ThemeColors {
  /** پس‌زمینه‌ی کل صفحه */
  bg: string
  /** پس‌زمینه‌ی کارت/محیط‌های برجسته */
  surface: string
  /** پس‌زمینه‌ی نوار ابزار */
  chrome: string
  /** رنگ متن اصلی */
  text: string
  /** متن کم‌رنگ‌تر (توضیحات، شماره‌ها) */
  textMuted: string
  /** متن بسیار کم‌رنگ (حاشیه، خط جداکننده‌ی کم‌اهمیت) */
  textFaint: string

  /** رنگ لینک */
  link: string
  /** رنگ لینک در حالت hover */
  linkHover: string

  /** خط جداکننده‌ها */
  border: string
  /** خط پررنگ‌تر، برای سرتیترها */
  borderStrong: string

  /** پس‌زمینه‌ی کد */
  codeBg: string
  /** رنگ متن کد */
  codeText: string
  /** پس‌زمینه‌ی کد inline */
  codeInlineBg: string

  /** پس‌زمینه‌ی سلول‌های جدول (یک‌درمیان) */
  tableStripe: string
  /** رنگ متن کم‌رنگ در جدول */
  tableMuted: string

  /** رنگ تأکید (مثل دکمه‌ی فعال) */
  accent: string
  /** پس‌زمینه‌ی hover روی دکمه */
  accentHover: string
  /** متن روی رنگ تأکید */
  accentText: string
}

/**
 * هر تم یک مجموعه‌ی کامل از رنگ‌ها دارد.
 * نکته: تم روشن باید روی «کاغذ» کار کند (متن تیره)، تم تاریک روی «صفحه» (متن روشن).
 */
export const THEMES: Record<ThemeName, ThemeColors> = {
  light: {
    bg: '#ffffff',
    surface: '#f8f9fa',
    chrome: '#ffffff',
    text: '#1f2328',
    textMuted: '#59636e',
    textFaint: '#8c959f',
    link: '#0969da',
    linkHover: '#0550ae',
    border: '#d1d9e0',
    borderStrong: '#b8c0c8',
    codeBg: '#f6f8fa',
    codeText: '#1f2328',
    codeInlineBg: 'rgba(129,139,152,0.14)',
    tableStripe: '#f6f8fa',
    tableMuted: '#59636e',
    accent: '#0969da',
    accentHover: '#0550ae',
    accentText: '#ffffff',
  },

  dark: {
    bg: '#0d1117',
    surface: '#161b22',
    chrome: '#010409',
    text: '#e6edf3',
    textMuted: '#9198a1',
    textFaint: '#6e7681',
    link: '#4493f8',
    linkHover: '#58a6ff',
    border: '#30363d',
    borderStrong: '#444c56',
    codeBg: '#161b22',
    codeText: '#e6edf3',
    codeInlineBg: 'rgba(110,118,129,0.4)',
    tableStripe: '#161b22',
    tableMuted: '#9198a1',
    accent: '#238636',
    accentHover: '#2ea043',
    accentText: '#ffffff',
  },

  sepia: {
    bg: '#f4ecd8',
    surface: '#ece2cc',
    chrome: '#e8dcc4',
    text: '#3b3223',
    textMuted: '#6b5f4b',
    textFaint: '#8a7c63',
    link: '#8a5a2b',
    linkHover: '#6b4420',
    border: '#d5c8a8',
    borderStrong: '#c0b088',
    codeBg: '#e9dfc7',
    codeText: '#3b3223',
    codeInlineBg: 'rgba(107,95,75,0.16)',
    tableStripe: '#ece2cc',
    tableMuted: '#6b5f4b',
    accent: '#8a5a2b',
    accentHover: '#6b4420',
    accentText: '#f4ecd8',
  },

  nord: {
    bg: '#2e3440',
    surface: '#3b4252',
    chrome: '#292e39',
    text: '#eceff4',
    textMuted: '#b8c1d1',
    textFaint: '#8793a5',
    link: '#88c0d0',
    linkHover: '#8fbcbb',
    border: '#434c5e',
    borderStrong: '#4c566a',
    codeBg: '#2e3440',
    codeText: '#e5e9f0',
    codeInlineBg: 'rgba(94,129,172,0.2)',
    tableStripe: '#3b4252',
    tableMuted: '#b8c1d1',
    accent: '#88c0d0',
    accentHover: '#8fbcbb',
    accentText: '#2e3440',
  },

  dracula: {
    bg: '#282a36',
    surface: '#343746',
    chrome: '#21222c',
    text: '#f8f8f2',
    textMuted: '#c8c3e0',
    textFaint: '#9b96c4',
    link: '#8be9fd',
    linkHover: '#bd93f9',
    border: '#44475a',
    borderStrong: '#6272a4',
    codeBg: '#282a36',
    codeText: '#f8f8f2',
    codeInlineBg: 'rgba(98,114,164,0.28)',
    tableStripe: '#343746',
    tableMuted: '#c8c3e0',
    accent: '#bd93f9',
    accentHover: '#ff79c6',
    accentText: '#282a36',
  },

  'high-contrast': {
    bg: '#000000',
    surface: '#0a0a0a',
    chrome: '#000000',
    text: '#ffffff',
    textMuted: '#d0d0d0',
    textFaint: '#a0a0a0',
    link: '#00ffff',
    linkHover: '#ffff00',
    border: '#666666',
    borderStrong: '#999999',
    codeBg: '#0a0a0a',
    codeText: '#ffffff',
    codeInlineBg: 'rgba(255,255,255,0.16)',
    tableStripe: '#0a0a0a',
    tableMuted: '#d0d0d0',
    accent: '#ffff00',
    accentHover: '#00ffff',
    accentText: '#000000',
  },

  'solarized-light': {
    bg: '#fdf6e3',
    surface: '#eee8d5',
    chrome: '#f4ecd8',
    text: '#073642',
    textMuted: '#586e75',
    textFaint: '#93a1a1',
    link: '#268bd2',
    linkHover: '#1a6f9e',
    border: '#eee8d5',
    borderStrong: '#ddd6c1',
    codeBg: '#eee8d5',
    codeText: '#073642',
    codeInlineBg: 'rgba(147,161,161,0.2)',
    tableStripe: '#eee8d5',
    tableMuted: '#586e75',
    accent: '#268bd2',
    accentHover: '#1a6f9e',
    accentText: '#fdf6e3',
  },
}

/** نام فارسی تم‌ها برای نمایش در UI. */
export const THEME_LABELS: Record<ThemeName, string> = {
  light: 'روشن',
  dark: 'تاریک',
  sepia: 'کاغذی',
  nord: 'نورد',
  dracula: 'دراکولا',
  'high-contrast': 'کنتراست بالا',
  'solarized-light': 'سولاریز روشن',
}

/** نام فارسی تم‌های کد. */
export const CODE_THEME_LABELS: Record<CodeTheme, string> = {
  auto: 'خودکار (هماهنگ با تم صفحه)',
  github: 'گیت‌هاب',
  'github-dark': 'گیت‌هاب تاریک',
  'atom-one-dark': 'اتم تاریک',
  vs: 'ویژوال استودیو',
  monokai: 'موناکای',
}

/** کدام تم‌ها تیره‌اند — برای تنظیم خودکار رنگ اسکرول‌بار و موارد مشابه. */
export function isDarkTheme(theme: ThemeName): boolean {
  return ['dark', 'nord', 'dracula', 'high-contrast'].includes(theme)
}

/** تم‌های کدی که ذاتاً برای زمینه‌ی روشن‌اند. */
const LIGHT_CODE_THEMES: readonly CodeTheme[] = ['github', 'vs']
/** تم‌های کدی که ذاتاً برای زمینه‌ی تیره‌اند. */
const DARK_CODE_THEMES: readonly CodeTheme[] = ['github-dark', 'atom-one-dark', 'monokai']

/**
 * ⭐ تم کدی که واقعاً باید اعمال شود.
 *
 * قاعده: **رنگِ سینتکس باید هم‌-polarity زمینه باشد.**
 *
 * ترکیب سینتکسِ روشن با زمینه‌ی تیره (یا برعکس) هیچ حالتِ خوانایی
 * ندارد — این تنها چیزی است که کنتراست را می‌شکند. پس حتی اگر کاربر
 * تم کد را آگاهانه انتخاب کرده باشد، اگر با زمینه‌ی تم صفحه ناسازگار
 * باشد به تم هم‌جنس برمی‌گردد. این «سلیقه» را بازنویسی نمی‌کند، فقط
 * حالتِ ناخوانا را ممکن نمی‌کند.
 *
 * `auto` یعنی «هماهنگ با تم صفحه» — تم روشن → گیت‌هاب روشن،
 * تم تیره → گیت‌هاب تاریک.
 */
export function resolveCodeTheme(
  codeTheme: CodeTheme,
  uiTheme: ThemeName,
): Exclude<CodeTheme, 'auto'> {
  const dark = isDarkTheme(uiTheme)

  if (codeTheme === 'auto') return dark ? 'github-dark' : 'github'

  // انتخاب صریح کاربر را فقط در صورت ناسازگاری اصلاح می‌کنیم
  if (dark && LIGHT_CODE_THEMES.includes(codeTheme)) return 'github-dark'
  if (!dark && DARK_CODE_THEMES.includes(codeTheme)) return 'github'

  return codeTheme as Exclude<CodeTheme, 'auto'>
}
