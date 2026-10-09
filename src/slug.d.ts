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
