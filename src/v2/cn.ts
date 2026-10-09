/**
 * cn.ts — ادغامِ کلاس‌های شرطی
 *
 * ⭐ چرا این فایل جدا از بقیه است؟
 * چون نسخهٔ ۱ چنین ابزاری ندارد و **نباید** پیدایش کند. این تنها فایلِ
 * «زیرساختی» نسخهٔ ۲ است که شاید بقیهٔ پروژه هم بخواهد از آن استفاده کند.
 *
 * `tailwind-merge` لازم است چون دو کلاسِ هم‌خانواده (مثلاً `p-2` و `p-4`)
 * باید **آخری** برنده شود. بدون آن، CSS به ترتیبِ نوشته در فایل حل می‌شود
 * و کلاس‌های شرطی شکننده می‌شوند.
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}