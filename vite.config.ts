import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

/**
 * ⭐⭐ دو نقطه‌ی ورود، یک پروژه
 *
 * نسخه‌ی ۱ روی «/» می‌ماند و نسخه‌ی ۲ روی «/v2.html». عمداً **دو ورودیِ
 * جدا** ساخته‌ایم، نه یک اپ با مسیریابی، چون:
 *
 *   ۱) نسخه‌ی ۱ باید **دست‌نخورده** بماند. مسیریابی یعنی هر تغییرِ مسیر
 *      می‌توانست لینک‌های قدیمی و تست‌هایش را بشکند.
 *   ۲) دو اپ جدا یعنی اگر نسخه‌ی ۲ خراب شود، نسخه‌ی ۱ همچنان بالا می‌آید.
 *
 * ولی هر دو **همان فایل‌های محتوا** را می‌خوانند (`فازها/*.md`) و هر دو از
 * همان `node_modules` استفاده می‌کنند — پس متن هرگز دو نسخه نمی‌شود.
 *
 * ⚠️ چرا `fileURLToPath` و نه `.pathname`؟
 * چون `package.json` مقدار `"type": "module"` دارد، پس این فایل ESM است و
 * `__dirname` در آن وجود ندارد. و روی ویندوز `URL.pathname` مسیر را به شکل
 * «/E:/learning/...» برمی‌گرداند که برای Rollup غلط است. تنها شکلِ درستِ
 * قابل‌حمل این است.
 *
 * ⚠️ چرا افزودنِ `tailwindcss()` به نسخه‌ی ۱ بی‌خطر است؟
 * چون نسخه‌ی ۱ هیچ فایل `@import "tailwindcss"` ندارد. این افزونه فقط
 * «مرحله‌ی» می‌سازد که فایل‌های Tailwind را می‌شناسد؛ اگر چنین فایلی نباشد،
 * چیزی به CSS نسخه‌ی ۱ اضافه نمی‌شود.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    // markdown ها حجم باندل را زیاد می‌کنند؛ برای دیباگ بهتر است جدا بمانند
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: {
        // نسخه‌ی ۱ — بدون تغییر، همان رفتار قبلی
        main: fileURLToPath(new URL('index.html', import.meta.url)),
        // نسخه‌ی ۲
        v2: fileURLToPath(new URL('v2.html', import.meta.url)),
        // نسخه‌ی ۳ — یادگیری چریکی و پروژه سفیر
        v3: fileURLToPath(new URL('v3.html', import.meta.url)),
      },
    },
  },
})