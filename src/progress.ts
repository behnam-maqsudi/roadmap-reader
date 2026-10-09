/**
 * progress.ts — ذخیره و بازیابی پیشرفت یادگیری
 *
 * چرا جدا از settings.ts؟
 * چون پیشرفت رشد می‌کند و حجمش بزرگ می‌شود (برای هر کارت یک رکورد).
 * تنظیمات کوچک‌اند و هر بار عوض می‌شوند. جدا نگه‌داشتنشان تمیزتر است
 * و اگر یکی خراب شد، دیگری هم از دست نمی‌رود.
 */

import { newCard } from './srs'
import {
  EXERCISES_KEY,
  PROGRESS_KEY,
  SAMPLES_KEY,
  type CardProgress,
} from './types'

/** کل پیشرفت: «شناسه‌ی فاز» → «شماره‌ی کارت» → وضعیت */
export type ProgressMap = Record<string, Record<number, CardProgress>>

/** تمرین‌های انجام‌شده: «شناسه‌ی فاز» → «شماره‌ی تمرین» → true */
export type ExerciseMap = Record<string, Record<number, boolean>>

/**
 * ⭐ خواندن امن از localStorage.
 *
 * دو خطر دارد:
 *  ۱. localStorage در دسترس نباشد (حالت خصوصی مرورگر، SSR)
 *  ۲. داده خراب باشد (کاربر دستی دست زده، یا نسخه‌ی قبلی کد مانده)
 * در هر دو حالت، یک مقدار پیش‌فرض برمی‌گردانیم تا اپ نشکند.
 */
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return (parsed ?? fallback) as T
  } catch {
    // داده خراب است — بی‌سروصدا دور می‌اندازیم و از صفر شروع می‌کنیم
    return fallback
  }
}

/** نوشتن امن در localStorage. */
function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // پر است یا در دسترس نیست — بی‌خیال، کار باید ادامه پیدا کند
  }
}

/** کل پیشرفت را می‌خواند. */
export function loadProgress(): ProgressMap {
  return read<ProgressMap>(PROGRESS_KEY, {})
}

/** وضعیت یک کارت را می‌خواند، یا undefined اگر هرگز مرور نشده. */
export function loadCardProgress(
  docId: string,
  cardIndex: number,
): CardProgress | undefined {
  return loadProgress()[docId]?.[cardIndex]
}

/** همه‌ی پیشرفت را ذخیره می‌کند. */
export function saveProgress(map: ProgressMap): void {
  write(PROGRESS_KEY, map)
}

/** یک مرور را ثبت می‌کند و پیشرفت جدید را برمی‌گرداند. */
export function recordReview(
  map: ProgressMap,
  docId: string,
  cardIndex: number,
  next: CardProgress,
): ProgressMap {
  // کپی‌ی در عمق لازم است تا state تغییر نکند (React به هویت نگاه می‌کند)
  return {
    ...map,
    [docId]: {
      ...(map[docId] ?? {}),
      [cardIndex]: next,
    },
  }
}

/** پیشرفت از پیش‌ساخته — برای تست بدون نیاز به مرور دستی. */
export function seedNewCards(): ProgressMap {
  return {}
}

/** وضعیت اولیه‌ی یک کارت تازه (کاربرد: نمایش «کارت جدید»). */
export function freshCard(): CardProgress {
  return newCard()
}

// ─── تمرین‌ها ───

/** تمرین‌های انجام‌شده را می‌خواند. */
export function loadExercises(): ExerciseMap {
  return read<ExerciseMap>(EXERCISES_KEY, {})
}

/** کل تمرین‌ها را ذخیره می‌کند. */
export function saveExercises(map: ExerciseMap): void {
  write(EXERCISES_KEY, map)
}

/** یک تمرین را علامت‌گذاری می‌کند (انجام شد / لغو). */
export function toggleExercise(
  map: ExerciseMap,
  docId: string,
  index: number,
  done: boolean,
): ExerciseMap {
  return {
    ...map,
    [docId]: {
      ...(map[docId] ?? {}),
      [index]: done,
    },
  }
}

// ─── داده‌های ساختگی ───

/**
 * داده‌ی ساختگی‌هایی که کاربر در تمرین‌ها وارد کرده.
 *
 * ⭐ چرا ذخیره می‌شود؟ تمرین‌های کدنویسی در مرورگر اجرا نمی‌شوند،
 * ولی داده‌ای که کاربر برای تمرین ساخته ارزش نگه‌داشتن دارد —
 * می‌تواند فردا ادامه‌اش بدهد. این کلید جای آن را نگه می‌دارد.
 */
export function loadSamples(): Record<string, unknown> {
  return read<Record<string, unknown>>(SAMPLES_KEY, {})
}

/** داده‌های ساختگی را ذخیره می‌کند. */
export function saveSamples(map: Record<string, unknown>): void {
  write(SAMPLES_KEY, map)
}

/** ⭐ پاک‌کردن کامل پیشرفت — برای دکمه‌ی «شروع از صفر». */
export function clearAll(): void {
  try {
    localStorage.removeItem(PROGRESS_KEY)
    localStorage.removeItem(EXERCISES_KEY)
  } catch {
    // بی‌اهمیت
  }
}