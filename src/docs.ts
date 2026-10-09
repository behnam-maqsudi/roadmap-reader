/**
 * docs.ts — بارگذاری فایل‌های markdown
 *
 * چرا import.meta.glob و نه fetch؟
 * چون با glob، محتوا داخل باندل قرار می‌گیرد و در build پروداکشن
 * بدون سرور هم کار می‌کند. با fetch، اپ باید روی یک سرور باشد.
 *
 * الگو: ?raw یعنی محتوای فایل به‌صورت رشته‌ی خام وارد شود.
 *
 * ⭐ نکته‌ی مسیر: فایل‌های markdown در پوشه‌ی «فازها» در ریشه‌ی پروژه هستند،
 * نه داخل src. این glob مسیر نسبی به **ریشه‌ی پروژه** را می‌گیرد.
 */

import type { Doc, DocKind } from './types'

/**
 * همه‌ی فایل‌های .md در پوشه‌ی «فازها» (ریشه‌ی پروژه) + ریشه.
 * اگر فایل جدیدی اضافه کردی، خودکار اینجا ظاهر می‌شود.
 *
 * ../../ از src/ به ریشه می‌رسد.
 */
const rawModules = import.meta.glob(['../فازها/*.md', '../*.md'], {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

/** نام فایل‌ها در پروژه. */
const files = Object.keys(rawModules)

/**
 * تبدیل ارقام فارسی/عربی به لاتین.
 * نام فایل‌های ما «فاز-۰۵-...» دارند که ارقامشان فارسی است.
 */
const PERSIAN_DIGITS: Record<string, string> = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
}

/** ارقام فارسی/عربی را به لاتین تبدیل می‌کند. */
function toLatinDigits(s: string): string {
  return s.replace(/[۰-۹٠-٩]/g, (d) => PERSIAN_DIGITS[d] ?? d)
}

/**
 * شماره‌ی فاز را از نام فایل بیرون می‌کشد.
 *
 * ⭐ فقط فایل‌های «فاز-…» شماره‌ی فاز دارند. فایل‌های نمایه مثل
 * «01-نقشه-راه-اسکلت.md» هم عدد دارند ولی فاز نیستند، پس ۹۹۹ می‌گیرند
 * تا آخر فهرست بنشینند.
 */
function extractNum(path: string): number {
  const name = toLatinDigits(path.split('/').pop() ?? '')
  // ⭐ راهنما شماره‌ی -۱ می‌گیرد تا در هر ترتیبی اول بیفتد
  if (/راهنما|شروع/.test(name)) return -1
  if (!name.startsWith('فاز-')) return 999
  const match = name.match(/(\d+)/)
  return match ? Number(match[1]) : 999
}

/**
 * ⭐ دسته‌ی سند را از نام فایل می‌فهمد.
 *
 * سه دسته داریم و هر کدام برچسب و جای خودش را در فهرست دارند:
 *
 * - **راهنما** — فایل‌های «راهنما» و «شروع». اینها درس نیستند؛ تابلوی راهنمای
 *   مسیرند، پس بالای فهرست می‌نشینند و پیش‌فرض باز می‌شوند.
 * - **فاز** — فایل‌های «فاز-…». درس‌های اصلی.
 * - **نمایه** — «نقشه-راه-…». فهرست و اسکلت کلی؛ مرجع‌اند، نه مسیر خواندن.
 *
 * قبلاً این سه دسته در یک ردیف می‌آمدند و دو نمایه‌ی پشت‌سرهم شبیه هم دیده
 * می‌شدند. جداسازی، ابهام را برداشت.
 */
function extractKind(path: string): DocKind {
  const name = toLatinDigits(path.split('/').pop() ?? '')
  if (/راهنما|شروع/.test(name)) return 'guide'
  if (name.startsWith('فاز-')) return 'phase'
  return 'index'
}

/**
 * ⭐ برچسبِ کوتاه کنار عنوان در فهرست.
 *
 * برای فازها خودِ شماره کافی است، پس برچسب خالی می‌ماند. برای دو دسته‌ی دیگر
 * یک نشان لازم است تا کاربر بداند دارد چه می‌خواند.
 */
function badgeFor(kind: DocKind, title: string): string {
  if (kind === 'guide') return 'راهنما'
  if (kind === 'index') return title.includes('اسکلت') ? 'اسکلت' : 'نمایه'
  return ''
}

/** عنوان را از خط اول فایل (# عنوان) بیرون می‌کشد. */
function extractTitle(content: string, fallback: string): string {
  const m = content.match(/^#\s+(.+)$/m)
  if (!m) return fallback

  let title = m[1].trim()
  // اگر عنوان خودش شماره‌ی فاز داشته باشد، تکرارش را پاک کن
  title = title.replace(/^فاز\s*[۰-۹۰-۹0-9]+\s*[—–-]\s*/, '')
  title = title.replace(/^\d+\s*[—–-]\s*/, '')
  return title || fallback
}

/** نام فایل را خوانا می‌کند: «فاز-۰۵-پایگاه‌داده» → «پایگاه‌داده» */
function readableName(path: string): string {
  const raw = path.split('/').pop() ?? ''
  const name = raw.replace(/\.md$/, '')
  return name.replace(/^فاز-[\d۰-۹٠-٩]+-/, '') || name
}

/**
 * همه‌ی اسناد را می‌سازد و به ترتیب شماره‌ی فاز مرتب می‌کند.
 */
export async function loadDocs(): Promise<Doc[]> {
  const entries = await Promise.all(
    files.map(async (path) => {
      const loader = rawModules[path]
      const content = await loader()
      const name = readableName(path)
      const kind = extractKind(path)
      const title = extractTitle(content, name)

      return {
        id: path,
        num: extractNum(path),
        title,
        content,
        path,
        kind,
        badge: badgeFor(kind, title),
      } satisfies Doc
    }),
  )

  // فایل‌های نمایه (۰۱ و ۰۲) شماره‌ی فاز ندارند؛ آخر می‌روند
  // a.path کلید یکتا است، پس این مرتب‌سازی همیشه پایدار است
  return entries.sort((a, b) => a.num - b.num || a.path.localeCompare(b.path))
}

/** فقط فهرست عنوان‌ها — بدون محتوا، برای نوار کناری و فهرست. */
export async function loadDocIndex(): Promise<Omit<Doc, 'content'>[]> {
  const docs = await loadDocs()
  return docs.map(({ content: _content, ...rest }) => rest)
}
