/**
 * slug.d.ts — نوع‌های `slug.js`
 *
 * فایلِ اصلی عمداً JavaScript است تا تستِ `node --test` بتواند همان کدِ
 * پروژه را اجرا کند و مطمئن شود فهرستِ کنار صفحه و رندرر یک شناسه می‌سازند.
 * این فایل نوع‌ها را برمی‌گرداند تا TypeScript همچنان کامل type-check شود.
 */

/** تبدیل عنوان به شناسه‌ی متناسب با URL، مثل GitHub. */
export declare function slugify(text: string): string

/**
 * یک گام از شماره‌گذاریِ سرتیترهای تکراری.
 *
 * @param text متنِ سرتیتر
 * @param seen شمارنده‌ی همان سند — بین فراخوانی‌ها زنده می‌ماند
 */
export declare function nextSlug(text: string, seen: Map<string, number>): string

/**
 * شناسه‌های یکتا برای فهرستی از سرتیترها، هم‌ترتیب با ورودی.
 *
 * @param headings متنِ سرتیترها، به همان ترتیبی که در سند آمده‌اند
 */
export declare function buildSlugs(headings: string[]): string[]

/** یک سرتیترِ پیدا‌شده در متن، همراه با جایش. */
export interface Heading {
  /** متنِ سرتیتر، بدون `#` و بدون فاصله‌های اضافه */
  text: string
  /** سطحش: ۱ تا ۶ (`#` تا `######`) */
  level: number
  /**
   * شمارهٔ سطر در متنِ اصلی، از ۱.
   *
   * ⭐ این عدد **ثابت** است — به رندر ربطی ندارد. به همین دلیل است که
   * رندرر می‌تواند به‌جای شمارندهٔ مشترک (که در `StrictMode` دو بار شمرده
   * می‌شد) از آن استفاده کند.
   */
  line: number
  /** شناسهٔ یکتا برای لنگر — با همان قاعده‌ای که فهرستِ کنار صفحه می‌سازد */
  id: string
}

/**
 * تنها جایی که سرتیترهای یک سند از متن درمی‌آیند.
 *
 * `App.tsx` (فهرستِ کنارِ صفحه) و `Markdown.tsx` (رندرر) هر دو از همین
 * می‌خوانند؛ برای همین شناسه‌هایشان نمی‌تواند از هم جدا بیفتد.
 */
export declare function extractHeadings(markdown: string): Heading[]
