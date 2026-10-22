# 🧰 راهنمای جامع نرم‌افزارها و پیکربندی اختصاصی درایو E (بدون اشغال درایو C)

> ⚠️ **توجه ویژه به پر بودن درایو C:**  
> اگر برنامه‌ها و مدل‌های هوش مصنوعی را به صورت پیش‌فرض نصب کنی، ویندوز آن‌ها را در درایو C (پوشه AppData یا Users) ذخیره می‌کند و درایو C فوراً پر می‌شود و خطای کمبود فضا می‌دهد!  
> در این راهنما تمام ترفندهای انتقال داده‌ها و مدل‌ها به **درایو E** آمده است تا هیچ فضایی از درایو C اشغال نشود.

---

## 📂 ساختار پوشه‌ها در درایو E

پیشنهاد می‌کنیم این ساختار منظم را در درایو E پیاده‌سازی کنی:

```
E:\
├── learning\
│   └── safir-project\          <-- تمام کدها، تمرین‌ها و node_modules پروژه اینجا قرار می‌گیرد
│       ├── server.js
│       ├── prisma\
│       └── package.json
│
├── ollama-models\              <-- محل ذخیره مدل‌های هوش مصنوعی (برای نجات درایو C)
└── tools-installers\           <-- فایل‌های نصبی یا پرتابل برنامه‌ها
```

---

## ۱. نرم‌افزارهای اصلی سیستم (لینک دانلود مستقیم)

| نرم‌افزار | لینک رسمی دریافت | نکته مهم در نصب |
|:---|:---|:---|
| **Node.js LTS** | [دانلود Node.js نسخه ویندوز](https://nodejs.org/en/download) | در مرحله انتخاب مسیر نصب، مسیر را بگذار: `E:\Program Files\nodejs` |
| **Bruno (API Client)** | [دانلود کلاینت Bruno](https://www.usebruno.com/downloads) | نسخه Windows x64 Installer را دریافت و نصب کن. |
| **Ollama (هوش مصنوعی)** | [دانلود Ollama ویندوز](https://ollama.com/download/windows) | **خیلی مهم:** قبل از دانلود مدل‌ها، دستور انتقال مدل به درایو E را بزن (بخش ۲). |
| **Git for Windows** | [دانلود Git ویندوز](https://git-scm.com/download/win) | مسیر نصب را در صورت تمایل روی درایو E تنظیم کن. |
| **VS Code** | [دانلود VS Code](https://code.visualstudio.com/Download) | ادیتور سبک کد. |

---

## ۲. 🚨 ترفندهای حیاتی برای نجات درایو C

### ۲.۱. هدایت دانلود مدل‌های Ollama به درایو E (حیاتی!)
اگر این کار را نکنی، هر مدلی که دانلود می‌کنی چند گیگابایت از درایو C را پر می‌کند.  
یک پنجره PowerShell باز کن و این دستور را اجرا کن:

```powershell
# ۱. ایجاد پوشه مدل‌ها در درایو E
New-Item -ItemType Directory -Path "E:\ollama-models" -Force

# ۲. ثبت متغیر سیستمی و دائمی برای Ollama
[Environment]::SetEnvironmentVariable("OLLAMA_MODELS", "E:\ollama-models", "User")
```

> پس از اجرای این دستور، یک بار برنامه Ollama را ببند و دوباره باز کن (یا سیستم را ری‌استارت کن). از این به بعد تمام مدل‌ها روی درایو E دانلود می‌شوند!

### ۲.۲. هدایت کش NPM به درایو E
برای اینکه پکیج‌های npm درایو C را پر نکنند:
```powershell
npm config set cache "E:\.npm-cache" --global
```

---

## ۳. دیتابیس PostgreSQL و Redis بدون نیاز به داکر روی درایو C

اگر درایو C پر است، نصب Docker Desktop ممکن است فضای زیادی (بین ۱۰ تا ۳۰ گیگابایت برای فایل WSL2 vhdx) روی درایو C اشغال کند.  
**بهترین و سبک‌ترین راه‌حل جایگزین:**

### الف) دیتابیس PostgreSQL روی درایو E:
1. از سایت [EnterpriseDB](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) نصاب PostgreSQL 16 ویندوز را دانلود کن.
2. موقع نصب، گزینه **Installation Directory** و **Data Directory** را روی درایو E تنظیم کن:
   - مسیر نصب: `E:\PostgreSQL\16`
   - مسیر داده‌ها (Data): `E:\PostgreSQL\data`
3. به این ترتیب تمام جداول و داده‌ها بدون اشغال حتی ۱ مگابایت در درایو C، روی درایو E ذخیره می‌شوند.

### ب) ردیس (Redis) سبک و محلی برای ویندوز:
- دانلود نسخه سبک و پرتابل ردیس برای ویندوز: [Redis-x64 Releases](https://github.com/tporadowski/redis/releases)
- فایل زیپ را دانلود و در پوشه `E:\Redis` اکسترکت کن. با دو بار کلیک روی `redis-server.exe` ردیس فوراً روشن می‌شود.

---

## ۴. لیست مدل‌های سبک آفلاین Ollama

در ترمینال PowerShell دستورات زیر را برای دانلود مدل‌ها اجرا کن (این مدل‌ها مستقیماً وارد `E:\ollama-models` می‌شوند):

```bash
# مدل اصلی چت، JSON و اجرای ابزارها (۴۰۰ مگابایت):
ollama run qwen2.5:0.5b

# مدل امبدینگ برداری برای RAG و سرچ معنایی (۲۷۰ مگابایت):
ollama pull nomic-embed-text
```

---

## ۵. آماده‌سازی پوشه پروژه و تمرینات در درایو E

برای ساخت پوشه تمیز پروژه سفیر و نصب پکیج‌ها:

```powershell
# ۱. ورود به پوشه کاربری در درایو E
cd E:\learning

# ۲. ساخت پوشه پروژه سفیر
New-Item -ItemType Directory -Path "safir-project" -Force
cd safir-project

# ۳. ایجاد package.json اولیه
npm init -y

# ۴. نصب یک‌جای تمام پکیج‌های ۸ گانه در درایو E
npm install fastify @fastify/jwt @fastify/helmet @fastify/rate-limit prisma @prisma/client bcrypt ioredis bullmq openai zod pg
npm install -D pino-pretty
```

تمام فایل‌های `node_modules` داخل همین پوشه در درایو E ایجاد می‌شوند و درایو C کاملاً دست‌نخورده باقی می‌ماند!
