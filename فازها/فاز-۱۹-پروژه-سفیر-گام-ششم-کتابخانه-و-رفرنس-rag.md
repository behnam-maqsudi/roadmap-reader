# فاز ۱۹ — پروژه سفیر: گام ششم (کتابخانه و رفرنس — RAG و جستجوی معنایی وکتور با pgvector)

> 🧒 **داستان کل فاز:**  
> فرض کن در شرکت سفیر، یک دانشجوی نخبه پزشکی را برای پاسخگویی به تلفن‌ها استخدام کرده‌ایم.  
> اگر بیمار زنگ بزند و دارویی بپرسد، آیا دانشجو باید تمام ۵ هزار صفحه کتاب قطور داروشناسی، کاتالوگ ۴ هزار کالای انبار و آیین‌نامه قوانین شرکت را کلمه‌به‌کلمه حفظ کند؟  
> حفظ کردن این همه کتاب در مغز (آموزش مدل یا Fine-tuning) هم ماه‌ها طول می‌کشد، هم میلیون‌ها تومان هزینه دارد، و از همه بدتر: اگر فردا صبح قانون مرجوعی کالا عوض شود، دانشجو هنوز اطلاعات قدیمی را در ذهن دارد و به مشتری دروغ می‌گوید (**توهم مدل یا Hallucination**)!  
> در دنیای واقعی دانشجو چه کار می‌کند؟ **آزمون کتاب‌باز (Open-Book Exam)**!  
> وقتی مشتری زنگ می‌زند و سوال می‌پرسد، دانشجو تلفن را یک لحظه نگه می‌دارد، فهرست کتاب قوانین را ورق می‌زند، دقیقاً همان یک پاراگراف قانون مربوطه را پیدا می‌کند، می‌خواند و عین حقیقت را به مشتری جواب می‌دهد!  
> به این فرآیند جادویی در هوش مصنوعی مدرن می‌گویند **RAG (تولید متن با تقویت بازیابی اطلاعات)**. در این ایستگاه، با تجهیز دیتابیس PostgreSQL به افزونه **pgvector**، متن‌ها را به **آدرس‌های برداری (Vector Embeddings)** تبدیل می‌کنیم تا سیستم نه بر اساس تطابق کلمات، بلکه بر اساس **معنا و مفهوم**، دقیق‌ترین قوانین شرکت را به هوش مصنوعی تحویل دهد.

---

## 🗺️ نقشه‌ی این مأموریت

| ایستگاه | مسئله‌ای که حل می‌کند | خروجی ملموس |
|:---|:---|:---|
| **۱. جعبه‌ابزار و اکستنشن pgvector** | فعال‌سازی پایگاه برداری روی همان PostgreSQL موجود بدون نیاز به دیتابیس اضافی | راه‌اندازی pgvector و مدل امبدینگ لوکال با Ollama |
| **۲. الفبای RAG به زبان ۵ ساله** | تفاوت جستجوی متنی با جستجوی معنایی، وکتور چیست و فاصله کسینوسی چگونه کار می‌کند؟ | درک شهودی مفهوم امبدینگ و نحوه جلوگیری از توهم مدل |
| **۳. مدل‌سازی جدول اسناد و قوانین** | ایجاد جدول `KnowledgeDocument` در Prisma با ستون برداری | آماده‌سازی فضای ذخیره‌سازی دانش سازمانی |
| **۴. ایندکس اسناد و تولید امبدینگ** | تبدیل قوانین سفیر به اعداد اعشاری و ذخیره در دیتابیس | اسکریپت سیدینگ اسناد و محاسبه بردارها |
| **۵. روت پاسخگویی هوشمند RAG در سفیر** | دریافت سوال، جستجوی نزدیک‌ترین اسناد و تولید پاسخ مستند | روت `POST /api/ai/ask-faq` با ذکر منبع دقیق |
| **۶. راستی‌آزمایی در Bruno** | آزمایش پرسش‌های مفهومی و اطمینان از استناد به قوانین | ۵ تست زنده برای جستجوی معنایی و راستی‌آزمایی |
| **۷. تمرین‌های تثبیت و چالش چریکی** | تکه‌تکه کردن هوشمند (Chunking) و شاخص HNSW | ارتقای دقت جستجو در میان هزاران سند |

---

## ۱. 🧰 جعبه‌ابزار مأموریت (دانلود قبل از شروع کار آفلاین)

برای این ایستگاه به افزونه برداری دیتابیس و یک مدل سبک تولید امبدینگ نیاز داریم:

### ۱. اکستنشن `pgvector` در PostgreSQL
- **چرا نیاز داریم:** افزونه‌ای متن‌باز و بی‌نظیر که PostgreSQL معمولی شما را به یک پایگاه داده برداری (Vector DB) قدرتمند تبدیل می‌کند. نیازی به نصب Pinecone یا Qdrant جداگانه نیست!
- **روش فعال‌سازی در PostgreSQL:**
  کافیست یک‌بار در ترمینال یا pgAdmin این دستور SQL را اجرا کنی:
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```
- اگر از داکر استفاده می‌کنی، ایمیج رسمی آماده pgvector:
  ```bash
  docker run --name safir-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d pgvector/pgvector:pg16
  ```

### ۲. مدل تولید بردار متنی (Embedding Model) در Ollama
- **چرا نیاز داریم:** امبدینگ‌ها مدل‌های سبکی هستند که متن را به آرایه‌ای از اعداد (مثلاً بردار ۳۸۴ یا ۷۶۸ بعدی) تبدیل می‌کنند.
- **دستور دانلود مدل امبدینگ فوق‌سریع در Ollama (یک‌بار قبل از قطعی اینترنت):**
  ```bash
  ollama pull all-minilm
  # یا مدل قدرتمند nomic:
  # ollama pull nomic-embed-text
  ```
- **تست تولید بردار در ترمینال:**
  ```bash
  curl http://localhost:11434/api/embeddings -d '{
    "model": "all-minilm",
    "prompt": "سلام سفیر"
  }'
  ```

---

## ۲. الفبای RAG و جستجوی معنایی به زبان ۵ ساله

> 🧒 **داستان این بخش:** فرض کن در یک نقشه بزرگ جغرافیایی، هر کلمه یا جمله یک خانه دارد. خانه‌هایی که معنایشان به هم شبیه است (مثل «ماشین»، «اتومبیل» و «خودرو») در یک کوچه بغل هم هستند، اما خانه کلمه «قورباغه» در یک شهر دیگر است!  
> وقتی مشتری می‌پرسد «می‌خوام جنسم رو پس بدم»، امبدینگ آدرس این سوال را روی نقشه پیدا می‌کند و می‌بیند در نیم‌متری خانه «قوانین بازگشت کالا تا ۷ روز» قرار دارد! حتی با این‌که کلمه «مرجوعی» یا «۷ روز» در سوال مشتری نبود!

---

### ۲.۱. تفاوت جستجوی سنتی کلمه‌ای با جستجوی معنایی

| نوع جستجو | ورودی کاربر | در دیتابیس چه اتفاقی می‌افتد؟ | نتیجه |
|:---|:---|:---|:---|
| **سنتی (LIKE / FullText)** | «می‌خوام بسته‌م رو پس بفرستم» | دنبال عین کلمه «پس بفرستم» می‌گردد | **صفر نتیجه!** (چون در قانون نوشته شده: «مرجوعی کالا») |
| **معنایی (Vector Search)** | «می‌خوام بسته‌م رو پس بفرستم» | بردار مفهومی سوال با بردار قوانین مقایسه می‌شود (فاصله کسینوسی) | **تطابق ۹۶٪ با سند «شرایط مرجوعی کالا»!** |

---

### ۲.۲. چرخه حیات ۴ مرحله‌ای RAG

```
[۱. سوال مشتری] ───> [۲. تبدیل به بردار] ───> [۳. جستجو در pgvector]
                                                      │
                                                      ▼
                                            [یافتن ۲ سند مرتبط قوانین]
                                                      │
                                                      ▼
[پاسخ دقیق و مستند] <─── [۴. ارسال سوال + قوانین به LLM]
```

---

## ۳. ارتقای نقشه دیتابیس (`prisma/schema.prisma`)

جدول اسناد دانشنامه سفیر را با ستون برداری به اسکیما اضافه می‌کنیم:

```prisma
// اضافه شدن به انتهای prisma/schema.prisma

model KnowledgeDocument {
  id        String   @id @default(uuid())
  title     String
  content   String
  category  String   @default("RULES")
  createdAt DateTime @default(now())

  // ستون بردار با طول ۳۸۴ (مربوط به مدل all-minilm)
  // با Unsupported برای تعریف مستقیم در PostgreSQL
  embedding Unsupported("vector(384)")?
}
```

پس از ویرایش فایل اسکیما، دستورات مایگریشن و تولید کلاینت را در ترمینال اجرا کن:
```bash
npx prisma migrate dev --name add_knowledge_documents
npx prisma generate
```

---

## ۴. کدهای سرور سفیر (`server.js`) مجهز به موتور RAG

```javascript
// server.js — نسخه ۳: گام ششم (کتابخانه و رفرنس — RAG با pgvector و مدل زبانی)

require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { OpenAI } = require('openai');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const openai = new OpenAI({
  baseURL: process.env.AI_BASE_URL || 'http://localhost:11434/v1',
  apiKey: process.env.AI_API_KEY || 'ollama-local-offline'
});

const CHAT_MODEL = process.env.AI_MODEL_NAME || 'qwen2.5:0.5b';
const EMBED_MODEL = process.env.EMBED_MODEL_NAME || 'all-minilm';

// تابع کمکی برای تبدیل متن به بردار اعشاری با Ollama / OpenAI
async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: EMBED_MODEL,
    input: text
  });
  return response.data[0].embedding;
}

// ۱. نبض سلامت و بررسی اکستنشن pgvector
fastify.get('/health', async (request, reply) => {
  try {
    const ext = await prisma.$queryRaw`SELECT extname FROM pg_extension WHERE extname = 'vector'`;
    return {
      status: 'healthy',
      service: 'Safir Knowledge Engine (RAG)',
      pgvector: ext.length > 0 ? 'enabled' : 'not found',
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    reply.status(500);
    return { status: 'unhealthy', error: err.message };
  }
});

// ۲. روت ثبت سند جدید در دانشنامه و تولید خودکار امبدینگ
fastify.post('/api/knowledge/documents', async (request, reply) => {
  const { title, content, category } = request.body || {};

  if (!title || !content) {
    reply.status(400);
    return { success: false, error: 'عنوان و متن سند الزامی است.' };
  }

  // تولید بردار عددی متن سند
  const embedding = await getEmbedding(`${title}: ${content}`);
  const vectorString = `[${embedding.join(',')}]`;

  // ثبت در PostgreSQL با کست مستقیم به نوع vector
  await prisma.$executeRawUnsafe(`
    INSERT INTO "KnowledgeDocument" ("id", "title", "content", "category", "embedding", "createdAt")
    VALUES (gen_random_uuid(), $1, $2, $3, $4::vector, NOW())
  `, title, content, category || 'RULES', vectorString);

  reply.status(201);
  return {
    success: true,
    message: 'سند با موفقیت در پایگاه برداری ذخیره و ایندکس شد.',
    title
  };
});

// ۳. روت جستجوی معنایی خالص (Semantic Search) بر پایه شباهت کسینوسی
fastify.post('/api/knowledge/semantic-search', async (request, reply) => {
  const { query, limit = 2 } = request.body || {};

  if (!query) {
    reply.status(400);
    return { success: false, error: 'عبارت جستجو الزامی است.' };
  }

  const queryEmbedding = await getEmbedding(query);
  const vectorString = `[${queryEmbedding.join(',')}]`;

  // استفاده از عملگر <=> (Cosine Distance) در pgvector
  // فاصله کمتر یعنی شباهت بیشتر!
  const results = await prisma.$queryRawUnsafe(`
    SELECT "id", "title", "content", "category",
           1 - ("embedding" <=> $1::vector) AS "similarity"
    FROM "KnowledgeDocument"
    WHERE "embedding" IS NOT NULL
    ORDER BY "embedding" <=> $1::vector ASC
    LIMIT $2
  `, vectorString, limit);

  return { success: true, count: results.length, matches: results };
});

// ۴. شاهکار ماجرا: روت پاسخگویی به سوالات بر اساس RAG
fastify.post('/api/ai/ask-faq', async (request, reply) => {
  const { question } = request.body || {};

  if (!question || question.trim() === '') {
    reply.status(400);
    return { success: false, error: 'متن سوال الزامی است.' };
  }

  const startTime = Date.now();

  // گام ۱: تولید بردار سوال مشتری
  const questionEmbedding = await getEmbedding(question);
  const vectorString = `[${questionEmbedding.join(',')}]`;

  // گام ۲: واکشی ۲ پاراگراف مرتبط‌ترین قوانین از pgvector
  const relevantDocs = await prisma.$queryRawUnsafe(`
    SELECT "title", "content", 1 - ("embedding" <=> $1::vector) AS "similarity"
    FROM "KnowledgeDocument"
    WHERE "embedding" IS NOT NULL
    ORDER BY "embedding" <=> $1::vector ASC
    LIMIT 2
  `, vectorString);

  // ترکیب اسناد پیدا شده به عنوان زمینه (Context)
  const contextText = relevantDocs
    .map(doc => `[منبع: ${doc.title}]\n${doc.content}`)
    .join('\n\n');

  // گام ۳: پرسش از مدل زبانی با شرط پاسخِ صرفاً مستند به متن
  const prompt = `تو دستیار رسمی پشتیبانی مشتریان سامانه لجستیک «سفیر» هستی.
وظیفه داری به سوال مشتری تنها و تنها بر اساس «اسناد و قوانین رسمی» زیر پاسخ دهی.
اگر پاسخ سوال در اسناد زیر وجود ندارد، به صراحت بگو «اطلاعاتی در این مورد در قوانین ثبت نشده است» و هرگز از خودت اطلاعات نساز!

اسناد و قوانین معتبر شرکت:
${contextText || 'هیچ سندی یافت نشد.'}

سوال مشتری:
${question}`;

  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: 'system', content: 'پاسخ‌های تو باید مؤدبانه، کوتاه، دقیق و کاملاً مستند به اسناد ارائه شده باشد.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1 // دمای صفر برای دقت حداکثری و حذف خیال‌بافی
  });

  const answer = completion.choices[0].message.content;
  const elapsed = Date.now() - startTime;

  return {
    success: true,
    responseTimeMs: elapsed,
    answer,
    sourcesUsed: relevantDocs.map(d => ({ title: d.title, similarity: Number(d.similarity).toFixed(2) }))
  };
});

fastify.listen({ port: 3000, host: '0.0.0.0' }).then(addr => {
  console.log(`📚 دانشنامه هوشمند سفیر با قدرت pgvector و RAG روی ${addr} به پرواز درآمد!`);
});
```

---

## ۵. سناریوهای راستی‌آزمایی با ابزار Bruno

این ۵ سناریو را برای مشاهده جادوی جستجوی معنایی و پاسخ‌های ۱۰۰٪ مستند آزمایش کن:

### تست ۱: نبض سلامت و اعتبارسنجی نصب بودن اکستنشن vector
- **متد:** `GET`
- **آدرس:** `http://localhost:3000/health`
- **پاسخ مورد انتظار:**
  ```json
  {
    "status": "healthy",
    "service": "Safir Knowledge Engine (RAG)",
    "pgvector": "enabled"
  }
  ```

---

### تست ۲: ثبت قانون جدید در دانشنامه (`POST /api/knowledge/documents`)
- **متد:** `POST`
- **آدرس:** `http://localhost:3000/api/knowledge/documents`
- **بدنه ارسال (JSON):**
  ```json
  {
    "title": "قانون تعویض و مرجوعی کالا",
    "content": "مشتریان گرامی می‌توانند تا ۷ روز پس از دریافت بسته، در صورتی که پلمب بسته باز نشده باشد، درخواست عودت وجه یا تعویض ثبت نمایند. هزینه پیک بازگشت بر عهده شرکت سفیر است.",
    "category": "RULES"
  }
  ```
- **پاسخ:**
  ```json
  {
    "success": true,
    "message": "سند با موفقیت در پایگاه برداری ذخیره و ایندکس شد.",
    "title": "قانون تعویض و مرجوعی کالا"
  }
  ```

---

### تست ۳: جستجوی معنایی بدون مدل زبانی (`POST /api/knowledge/semantic-search`)
- **متد:** `POST`
- **آدرس:** `http://localhost:3000/api/knowledge/semantic-search`
- **بدنه ارسال (JSON):**
  ```json
  {
    "query": "اگر جنس رو نپسندیدم چی کار کنم؟"
  }
  ```
- **نکته:** دقت کن که در کوئری بالا اصلاً واژه «مرجوعی» یا «۷ روز» نیامده، اما pgvector با شباهت بیش از ۹۰٪ سند مرجوعی را پیدا می‌کند!
- **پاسخ:**
  ```json
  {
    "success": true,
    "count": 1,
    "matches": [
      {
        "title": "قانون تعویض و مرجوعی کالا",
        "similarity": "0.91"
      }
    ]
  }
  ```

---

### تست ۴: پاسخ کامل RAG همراه با استناد به ماده قانونی (`POST /api/ai/ask-faq`)
- **متد:** `POST`
- **آدرس:** `http://localhost:3000/api/ai/ask-faq`
- **بدنه ارسال (JSON):**
  ```json
  {
    "question": "تا چند روز فرصت دارم بستم رو پس بدم و پول پیک با کیه؟"
  }
  ```
- **پاسخ:**
  ```json
  {
    "success": true,
    "responseTimeMs": 420,
    "answer": "شما تا ۷ روز پس از تحویل کالا (به شرط باز نشدن پلمب) مهلت مرجوعی دارید و هزینه پیک برگشت نیز کاملاً بر عهده شرکت سفیر می‌باشد.",
    "sourcesUsed": [
      {
        "title": "قانون تعویض و مرجوعی کالا",
        "similarity": "0.93"
      }
    ]
  }
  ```

---

### تست ۵: آزمون ضدگلوله در برابر توهم مدل (سوال نامربوط)
- **متد:** `POST`
- **آدرس:** `http://localhost:3000/api/ai/ask-faq`
- **بدنه ارسال (JSON):**
  ```json
  {
    "question": "پایتخت کشور استرالیا کجاست؟"
  }
  ```
- **پاسخ مورد انتظار:** مدل اجازه ندارد اطلاعات عمومی بگوید، چون در قوانین سفیر نیست:
  ```json
  {
    "success": true,
    "answer": "پاسخ این سوال در اسناد و قوانین رسمی سفیر یافت نشد.",
    "sourcesUsed": []
  }
  ```

---

## ۶. تمرین‌های تثبیت و چالش چریکی

1. **چالش تکه‌تکه کردن هوشمند متن (Text Chunking):**  
   اگر فایل PDF قوانین ۳۰ صفحه باشد، کل آن در یک رکورد جا نمی‌شود. چطور متن را به تکه‌های ۳۰۰ کلمه‌ای با هم‌پوشانی (Overlap) ۵۰ کلمه‌ای برش دهیم تا هیچ مفهومی در مرز قطعه‌ها گم نشود؟
2. **چالش شاخص‌گذاری HNSW برای دیتابیس‌های میلیونی:**  
   کوئری بدون ایندکس در ۱ میلیون رکورد زمان‌بر است. با دستور زیر یک شاخص گرافی HNSW روی ستون وکتور بساز و سرعت جستجو را زیر ۳ میلی‌ثانیه نگه‌دار:
   ```sql
   CREATE INDEX ON "KnowledgeDocument" USING hnsw (embedding vector_cosine_ops);
   ```
