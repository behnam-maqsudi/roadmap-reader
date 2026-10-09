/**
 * srs.ts — سیستم تکرار فاصله‌دار (Spaced Repetition)
 *
 * ⭐ چرا این الگوریتم؟
 *
 * منحنی فراموشی انسان خطی نیست — بعد از یادگیری، به‌سرعت افت می‌کند.
 * ایبنگهوس نشان داد بازه‌ی بهینه‌ی مرور، درست قبل از نقطه‌ای است که
 * فراموشی اتفاق می‌افتد. پس فاصله‌ی مرور نباید ثابت باشد؛ باید
 * با هر مرور رشد کند.
 *
 * الگوریتم SM-2 (SuperMemo 2) ایده را به عدد تبدیل می‌کند:
 *
 *   • هر مرور یک «کیفیت» از ۰ تا ۵ می‌گیرد (خودت تعیین می‌کنی چقدر راحت بود)
 *   • کیفیت < ۳ یعنی «فراموش کردم» → فاصله ریست می‌شود
 *   • کیفیت ≥ ۳ یعنی «یادم بود» → فاصله رشد می‌کند
 *   • یک «ضریب سختی» (ease) کم‌کم کالیبره می‌شود: کارت‌های سخت‌تر،
 *     ضریب کوچک‌تر می‌گیرند و زودتر برمی‌گردند
 *
 * نتیجه: هر کارت دقیقاً به اندازه‌ای که لازم است مرور می‌شود — نه بیشتر.
 */

import type { CardProgress } from './types'

/** یک روز بر حسب میلی‌ثانیه */
export const DAY = 86_400_000

/** ضریب سختی اولیه — استاندارد SM-2 */
const INITIAL_EASE = 2.5

/** کمترین ضریب سختی مجاز؛ پایین‌تر از این کارت‌ها هر روز برمی‌گردند */
const MIN_EASE = 1.3

/**
 * کیفیت یک مرور، از دید کاربر.
 *
 * ⭐ این مهم‌ترین بخش رابط کاربری است: کاربر خودش می‌گوید
 * چقدر راحت بود. همین یک قضاوت، کل الگوریتم را می‌راند.
 */
export type Grade = 'again' | 'hard' | 'good' | 'easy'

/** کیفیت هر دکمه در مقیاس SM-2 (۰ تا ۵) */
const GRADE_QUALITY: Record<Grade, number> = {
  again: 1, // اصلاً یادم نبود
  hard: 3, // با مکث یادم آمد
  good: 4, // راحت یادم بود
  easy: 5, // فوری و بدون فکر
}

/** وضعیت اولیه‌ی یک کارت که هنوز مرور نشده. */
export function newCard(): CardProgress {
  return {
    reps: 0,
    interval: 0,
    ease: INITIAL_EASE,
    // همین الان باید مرور شود
    due: Date.now(),
  }
}

/**
 * ⭐ هسته‌ی الگوریتم: یک مرور را ثبت می‌کند و وضعیت بعدی را برمی‌گرداند.
 *
 * ورودی: وضعیت فعلی + دکمه‌ای که کاربر زده
 * خروجی: وضعیت جدید (فاصله‌ی بعدی و زمان سررسید)
 */
export function review(
  progress: CardProgress | undefined,
  grade: Grade,
  now: number = Date.now(),
): CardProgress {
  const p = progress ?? newCard()
  const q = GRADE_QUALITY[grade]

  // ─── حالت «فراموش کردم» ───
  // فاصله ریست می‌شود، ولی کارت حذف نمی‌شود — فردا دوباره می‌آید.
  // (این «ریست به یک روز» رفتار استاندارد SM-2 برای نمره‌ی کمتر از ۳ است.)
  if (q < 3) {
    return {
      reps: 0,
      interval: 1,
      ease: Math.max(MIN_EASE, p.ease - 0.2),
      due: now + DAY,
    }
  }

  // ─── حالت «یادم بود» ───
  let interval: number

  if (p.reps === 0) {
    interval = 1 // اولین مرور موفق: یک روز بعد
  } else if (p.reps === 1) {
    interval = 6 // دومین مرور موفق: یک هفته بعد
  } else {
    // از این به بعد: فاصله با ضریب سختی رشد می‌کند
    interval = Math.round(p.interval * p.ease)
  }

  // ─── دکمه‌های اصلاحی ───
  // «سخت» فاصله را کوتاه‌تر و «آسان» بلندتر می‌کند.
  if (grade === 'hard') interval = Math.max(1, Math.round(interval * 0.6))
  if (grade === 'easy') interval = Math.round(interval * 1.3)

  // ─── کالیبراسیون ضریب سختی ───
  // این همان چیزی است که SM-2 را هوشمند می‌کند:
  // کارتی که بارها «سخت» خورده، ضریبش پایین می‌آید و زودتر برمی‌گردد.
  const easeDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
  const ease = Math.max(MIN_EASE, p.ease + easeDelta)

  return {
    reps: p.reps + 1,
    interval,
    ease,
    due: now + interval * DAY,
  }
}

/** فاصله‌ی مرور بعدی، بر حسب روز — برای نمایش «۳ روز دیگر». */
export function nextInDays(progress: CardProgress | undefined): number {
  const p = progress ?? newCard()
  return Math.max(0, Math.round((p.due - Date.now()) / DAY))
}

/**
 * کارت‌های سررسیدشده، به ترتیب اولویت.
 *
 * ⭐ اولویت‌بندی: کارت‌هایی که هم سررسید شده‌اند و هم بارها «فراموش کردم»
 * خورده‌اند، اول می‌آیند — چون بیشترین احتمال فراموشی را دارند.
 */
export function dueCards<T>(
  items: T[],
  progressOf: (item: T) => CardProgress | undefined,
): T[] {
  const now = Date.now()

  return items
    .filter((item) => (progressOf(item)?.due ?? 0) <= now)
    .sort((a, b) => {
      const pa = progressOf(a)
      const pb = progressOf(b)

      // کارت‌های تازه (بدون سابقه) اول یا آخر؟ اول — چون هنوز هرگز دیده نشده‌اند.
      if (!pa && !pb) return 0
      if (!pa) return -1
      if (!pb) return 1

      // overdue بیشتر ← اول
      const overdueDiff = (pb.due ?? 0) - (pa.due ?? 0)
      if (overdueDiff !== 0) return overdueDiff

      // سپس ضریب سختی پایین‌تر ← اول (سخت‌تر بوده)
      return pa.ease - pb.ease
    })
}

/**
 * خلاصه‌ی پیشرفت برای نمایش در رابط کاربری.
 */
export interface ProgressSummary {
  total: number
  /** هرگز مرور نشده */
  newCards: number
  /** سررسیدشده — الان باید مرور شوند */
  due: number
  /** تقریباً فراموش‌شده (بیش از ۳۰ روز گذشته) */
  forgotten: number
  /** یادگرفته‌شده (بیش از ۲۱ روز فاصله گرفته) */
  learned: number
}

/** خلاصه‌ی وضعیت یک مجموعه کارت. */
export function summarize(
  total: number,
  progressOf: (i: number) => CardProgress | undefined,
): ProgressSummary {
  const now = Date.now()
  const s: ProgressSummary = {
    total,
    newCards: 0,
    due: 0,
    forgotten: 0,
    learned: 0,
  }

  for (let i = 0; i < total; i++) {
    const p = progressOf(i)

    if (!p || p.reps === 0) {
      s.newCards++
      continue
    }
    if (p.due <= now) s.due++
    if (now - p.due > 30 * DAY) s.forgotten++
    if (p.interval >= 21) s.learned++
  }

  return s
}

/** برچسب فارسی فاصله‌ی بعدی، مثل «۳ روز بعد». */
export function humanizeInterval(days: number): string {
  if (days <= 0) return 'الان'
  if (days === 1) return 'فردا'
  if (days < 7) return `${days} روز بعد`
  if (days < 30) return `${Math.round(days / 7)} هفته بعد`
  if (days < 365) return `${Math.round(days / 30)} ماه بعد`
  return `${Math.round(days / 365)} سال بعد`
}