# 🚀 کارگاه تمرینات و سرور پروژه «سفیر» (درایو E)

این پوشه، کارگاه زندهٔ تو برای نوشتن کدهای هر ۸ ایستگاه پروژه سفیر است.  
تمام بسته‌های `node_modules` و داده‌ها داخل همین پوشه در درایو E ذخیره می‌شوند تا **درایو C حتی ۱ مگابایت هم پر نشود**.

---

## 🧭 ایستگاه‌ها و فایل‌های سرور

- **ایستگاه ۱:** `server.js` (تلفنچی رستوران - Fastify)
- **ایستگاه ۲:** `prisma/schema.prisma` (جداول مشتریان و سفارشات)
- **ایستگاه ۳:** احراز هویت با JWT
- **ایستگاه ۴:** `worker.js` (صف انبار BullMQ و کش Redis)
- **ایستگاه ۵:** اتصال به Ollama و خروجی ساختاریافته Zod
- **ایستگاه ۶:** پایگاه برداری pgvector و RAG
- **ایستگاه ۷:** ایجنت خودمختار با Function Calling
- **ایستگاه ۸:** `server.prod.js` و تنظیمات Docker / امنیت

---

## ⚡ دستور نصب پکیج‌ها در همین پوشه:

```bash
npm install fastify @fastify/jwt @fastify/helmet @fastify/rate-limit prisma @prisma/client bcrypt ioredis bullmq openai zod pg
npm install -D pino-pretty
```

---

## 🏃 اجرای سرور:

```bash
node server.js
# یا با ری‌استارت خودکار هنگام تغییر فایل‌ها:
npm run dev
```
