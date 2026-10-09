/**
 * study.ts — بارگذاری محتوای یادگیری (کارت + تمرین)
 *
 * ⭐ چرا JSON جدا از markdown؟
 *  ۱. کارت‌ها داده‌ی ساختاریافته‌اند، نه متن آزاد — الگوریتم تکرار فاصله‌دار
 *     به فیلدهای مشخص (front/back) نیاز دارد.
 *  ۲. جدا بودنشان یعنی می‌توان بعداً از اپلیکیشن تولیدشان کرد
 *     بدون دست‌زدن به محتوای درس.
 *  ۳. هر فاز فقط کارت‌های خودش را دارد؛ نیازی به پارس‌کردن متن نیست.
 *
 * ⭐ چرا async؟
 * Vite برای هر فایل JSON یک تابع بارگذاری می‌سازد و همه را lazy
 * import می‌کند — یعنی فقط فایل‌هایی که واقعاً صدا زده شوند در باندل
 * بارگذاری می‌شوند. برای ۱۴ فاز با ۲۰۵ کارت، این تفاوت محسوس است.
 */

import type { Doc, Flashcard, Exercise, StudyContent } from './types'

interface RawStudy {
  cards: Omit<Flashcard, 'n'>[]
  exercises: Exercise[]
}

const modules = import.meta.glob('../محتوا/فازها/*.json', {
  import: 'default',
}) as Record<string, () => Promise<RawStudy>>

/** کلید پیش‌فرض برای فازی که محتوا ندارد. */
const EMPTY: StudyContent = { docId: '', cards: [], exercises: [] }

/**
 * محتوای یادگیری یک سند را می‌دهد.
 *
 * اگر فازی هنوز محتوایی نداشته باشد، آرایه‌ی خالی می‌گیرد —
 * اپ نباید به‌خاطر این بشکند.
 */
export async function studyFor(doc: Doc): Promise<StudyContent> {
  const key = `فاز-${toPersianDigits(String(doc.num).padStart(2, '0'))}`
  const load = modules[`../محتوا/فازها/${key}.json`]

  if (!load) return { ...EMPTY, docId: doc.id }

  const raw = await load()

  return {
    docId: doc.id,
    // شماره‌گذاری خودکار — لازم است چون کلید ذخیره‌سازی همین است
    cards: (raw.cards ?? []).map((c, i) => ({ ...c, n: i })),
    exercises: raw.exercises ?? [],
  }
}

/** همه‌ی محتوای یادگیری را یک‌جا بار می‌کند (برای شمارنده‌ی فازها). */
export async function loadAllStudy(
  docs: Doc[],
): Promise<Map<string, StudyContent>> {
  const entries = await Promise.all(
    docs.map(async (d) => [d.id, await studyFor(d)] as const),
  )
  return new Map(entries)
}

const PERSIAN: Record<string, string> = {
  '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
  '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
}

/** «05» → «۰۵» تا با نام فایل‌های فارسی جور دربیاید. */
function toPersianDigits(s: string): string {
  return s.replace(/\d/g, (d) => PERSIAN[d] ?? d)
}

/** آیا این فاز محتوای یادگیری دارد؟ (بدون بارگذاری محتوا) */
export function hasStudy(doc: Doc): boolean {
  const key = `فاز-${toPersianDigits(String(doc.num).padStart(2, '0'))}`
  return `../محتوا/فازها/${key}.json` in modules
}