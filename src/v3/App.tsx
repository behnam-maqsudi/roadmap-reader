/**
 * App.tsx — محیط اختصاصی نسخه ۳ با کنترل کامل روی ظاهر، قلم، رنگ‌بندی و چیدمان ارگونومیک
 */
import { useEffect, useMemo, useState } from 'react'
import { loadDocs } from '../docs'
import { extractHeadings } from '../slug'
import { Markdown } from '../v2/Markdown'
import type { Doc } from '../types'

interface V3Settings {
  theme: 'dark' | 'sepia' | 'light' | 'nord' | 'monokai'
  fontFamily: 'iransans' | 'vazirmatn' | 'system'
  fontSize: number
  lineHeight: number
  readingWidth: 'compact' | 'standard' | 'wide' | 'full'
}

const DEFAULT_SETTINGS: V3Settings = {
  theme: 'dark',
  fontFamily: 'iransans',
  fontSize: 17,
  lineHeight: 1.95,
  readingWidth: 'standard',
}

interface Station {
  id: number
  title: string
  subtitle: string
  product: string
  status: 'active' | 'upcoming'
}

const STATIONS: Station[] = [
  {
    id: 1,
    title: 'تلفنچی رستوران',
    subtitle: 'سرور وب و چت خام',
    product: 'وب‌سرور زنده Fastify با قابلیت تبادل پیام و تست با Bruno',
    status: 'active',
  },
  {
    id: 2,
    title: 'دفترچه تلفن و بایگانی',
    subtitle: 'دیتابیس و مدل‌سازی داده',
    product: 'ثبت محصولات، تیکت‌ها و سفارشات در PostgreSQL با Prisma',
    status: 'active',
  },
  {
    id: 3,
    title: 'کارت شناسایی و نگهبان',
    subtitle: 'احراز هویت و مجوزها',
    product: 'سیستم ورود امن و تفکیک مشتری عادی از مدیر پشتیبانی با JWT',
    status: 'active',
  },
  {
    id: 4,
    title: 'کمد حافظه و صف انبار',
    subtitle: 'کش و صف پردازش غیرهمگام',
    product: 'کش کردن سوالات تکراری و صف پردازش کارهای سنگین با Redis & BullMQ',
    status: 'active',
  },
  {
    id: 5,
    title: 'مغز متفکر',
    subtitle: 'اتصال به مدل‌های زبانی',
    product: 'پاسخگویی هوشمند به پیام‌ها در قالب JSON ساختاریافته',
    status: 'active',
  },
  {
    id: 6,
    title: 'کتابخانه و رفرنس',
    subtitle: 'بازیابی اطلاعات و وکتور',
    product: 'جستجوی معنایی در کاتالوگ و قوانین با pgvector (RAG)',
    status: 'upcoming',
  },
  {
    id: 7,
    title: 'دست‌به‌آچار شدن',
    subtitle: 'ایجنت‌های خودمختار و ابزارها',
    product: 'پیگیری و ویرایش وضعیت سفارشات در دیتابیس توسط مدل (Function Calling)',
    status: 'upcoming',
  },
  {
    id: 8,
    title: 'ضدگلوله کردن',
    subtitle: 'امنیت، مانیتورینگ و کانتینر',
    product: 'کانتینرسازی با Docker، گاردریل امنیتی و مانیتورینگ هزینه در پروداکشن',
    status: 'upcoming',
  },
]

const SERVER_CODE = `// server.js — سنگ‌بنای پروژه سفیر (نسخه ۳: گام اول)

const fastify = require('fastify')({
  logger: true // لاگ رنگی تمام درخواست‌های رسیده در ترمینال
});

// ۱. مسیر تست سلامت (Health Check): آیا سرور بیدار است؟
fastify.get('/health', async (request, reply) => {
  return {
    status: 'healthy',
    service: 'Safir Core Assistant',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };
});

// ۲. مسیر دریافت پیام چت از مشتری (Chat Endpoint)
fastify.post('/api/chat', async (request, reply) => {
  const body = request.body;

  // اعتبارسنجی ساده: آیا پیامی ارسال شده است؟
  if (!body || !body.message || body.message.trim() === '') {
    reply.status(400); // خطای اشتباه مشتری
    return {
      success: false,
      error: 'متن پیام نمی‌تواند خالی باشد!'
    };
  }

  const userMessage = body.message;
  const userName = body.name || 'کاربر گرامی';

  const botReply = \`درود \${userName}! پیام شما («\${userMessage}») در سامانه سفیر دریافت شد. هم‌اکنون در حال بررسی درخواستت هستم.\`;

  return {
    success: true,
    reply: botReply,
    receivedAt: new Date().toISOString()
  };
});

// ۳. مسیر استعلام وضعیت سفارش بر اساس شماره (GET with URL Parameter)
fastify.get('/api/orders/:id', async (request, reply) => {
  const orderId = request.params.id;

  const fakeDatabase = {
    '101': { item: 'هدفون گیمینگ', status: 'تحویل پست داده شد', city: 'تهران' },
    '102': { item: 'کتاب طراحی سیستم', status: 'در حال بسته‌بندی در انبار', city: 'اصفهان' },
    '103': { item: 'ماگ سفالی برنامه‌نویسی', status: 'تحویل داده شده به خریدار', city: 'شیراز' }
  };

  const foundOrder = fakeDatabase[orderId];

  if (!foundOrder) {
    reply.status(404);
    return {
      success: false,
      error: \`سفارشی با شناسه \${orderId} پیدا نشد!\`
    };
  }

  return {
    success: true,
    orderId: orderId,
    details: foundOrder
  };
});

// ۴. روشن کردن موتور سرور روی پورت ۳۰۰۰
const startServer = async () => {
  try {
    const address = await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log(\`\\n🚀 سرور سفیر با موفقیت روی آدرس \${address} به پرواز درآمد!\\n\`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();`

const BRUNO_TESTS = [
  {
    id: 1,
    title: 'تست ۱: نبض سرور (Health Check)',
    method: 'GET',
    url: 'http://localhost:3000/health',
    status: '200 OK',
    body: null,
    expected: `{
  "status": "healthy",
  "service": "Safir Core Assistant",
  "uptime": 14.52,
  "timestamp": "2026-10-15T00:15:00.000Z"
}`,
  },
  {
    id: 2,
    title: 'تست ۲: ارسال پیام چت موفق',
    method: 'POST',
    url: 'http://localhost:3000/api/chat',
    status: '200 OK',
    body: `{
  "name": "بهنام",
  "message": "سلام سفیر! وضعیت بسته‌ام رو چک کن"
}`,
    expected: `{
  "success": true,
  "reply": "درود بهنام! پیام شما («سلام سفیر! وضعیت بسته‌ام رو چک کن») در سامانه سفیر دریافت شد...",
  "receivedAt": "2026-10-15T00:16:12.123Z"
}`,
  },
  {
    id: 3,
    title: 'تست ۳: خطای پیام خالی (اعتبارسنجی ورودی)',
    method: 'POST',
    url: 'http://localhost:3000/api/chat',
    status: '400 Bad Request',
    body: `{
  "name": "بهنام",
  "message": ""
}`,
    expected: `{
  "success": false,
  "error": "متن پیام نمی‌تواند خالی باشد!"
}`,
  },
  {
    id: 4,
    title: 'تست ۴: استعلام سفارش موجود',
    method: 'GET',
    url: 'http://localhost:3000/api/orders/101',
    status: '200 OK',
    body: null,
    expected: `{
  "success": true,
  "orderId": "101",
  "details": {
    "item": "هدفون گیمینگ",
    "status": "تحویل پست داده شد",
    "city": "تهران"
  }
}`,
  },
  {
    id: 5,
    title: 'تست ۵: استعلام سفارش ناموجود',
    method: 'GET',
    url: 'http://localhost:3000/api/orders/999',
    status: '404 Not Found',
    body: null,
    expected: `{
  "success": false,
  "error": "سفارشی با شناسه 999 پیدا نشد!"
}`,
  },
]

const STATION2_SCHEMA = `// prisma/schema.prisma — نقشه بایگانی پایگاه داده سفیر

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Customer {
  id        String   @id @default(uuid())
  name      String
  phone     String   @unique
  createdAt DateTime @default(now())

  orders    Order[]
  messages  ChatMessage[]
}

model Order {
  id          String   @id @default(uuid())
  orderNumber String   @unique
  itemTitle   String
  status      String   @default("ثبت اولیه")
  city        String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id])
}

model ChatMessage {
  id        String   @id @default(uuid())
  sender    String
  content   String
  createdAt DateTime @default(now())

  customerId String?
  customer   Customer? @relation(fields: [customerId], references: [id])
}`

const STATION2_SERVER_CODE = `// server.js — نسخه ۳: گام دوم (اتصال به دیتابیس با Prisma)

const fastify = require('fastify')({ logger: true });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ۱. نبض سرور و تست اتصال زنده دیتابیس
fastify.get('/health', async (request, reply) => {
  try {
    await prisma.$queryRaw\`SELECT 1\`;
    return {
      status: 'healthy',
      database: 'connected (PostgreSQL)',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    reply.status(500);
    return { status: 'unhealthy', database: 'disconnected', error: err.message };
  }
});

// ۲. مسیر دریافت پیام چت و ذخیره ابدی در دیتابیس
fastify.post('/api/chat', async (request, reply) => {
  const { message, name, phone } = request.body || {};

  if (!message || message.trim() === '') {
    reply.status(400);
    return { success: false, error: 'متن پیام نمی‌تواند خالی باشد!' };
  }

  const customer = await prisma.customer.upsert({
    where: { phone: phone || '09000000000' },
    update: { name: name || 'کاربر گرامی' },
    create: { name: name || 'کاربر گرامی', phone: phone || '09000000000' }
  });

  const savedMsg = await prisma.chatMessage.create({
    data: { sender: 'کاربر', content: message.trim(), customerId: customer.id }
  });

  const botReply = \`درود \${customer.name}! پیام شما در پایگاه داده سفیر ثبت شد.\`;
  await prisma.chatMessage.create({
    data: { sender: 'سفیر (سیستم)', content: botReply, customerId: customer.id }
  });

  return { success: true, customerId: customer.id, reply: botReply };
});

// ۳. مسیر استعلام وضعیت سفارش از دیتابیس
fastify.get('/api/orders/:orderNumber', async (request, reply) => {
  const { orderNumber } = request.params;
  const order = await prisma.order.findUnique({
    where: { orderNumber: String(orderNumber) },
    include: { customer: { select: { name: true, phone: true } } }
  });

  if (!order) {
    reply.status(404);
    return { success: false, error: \`سفارشی با شماره پیگیری \${orderNumber} یافت نشد!\` };
  }

  return { success: true, order };
});

// ۴. مسیر ثبت سفارش جدید در دیتابیس
fastify.post('/api/orders', async (request, reply) => {
  const { orderNumber, itemTitle, city, customerPhone, customerName } = request.body || {};
  if (!orderNumber || !itemTitle || !customerPhone) {
    reply.status(400);
    return { success: false, error: 'شماره سفارش، نام کالا و تلفن الزامی هستند.' };
  }

  const customer = await prisma.customer.upsert({
    where: { phone: customerPhone },
    update: {},
    create: { name: customerName || 'مشتری جدید', phone: customerPhone }
  });

  const newOrder = await prisma.order.create({
    data: {
      orderNumber: String(orderNumber),
      itemTitle,
      city: city || 'نامشخص',
      customerId: customer.id
    }
  });

  reply.status(201);
  return { success: true, order: newOrder };
});

fastify.listen({ port: 3000, host: '0.0.0.0' }).then(addr => {
  console.log(\`🚀 سرور سفیر با اتصال دیتابیس روی \${addr} بیدار شد!\`);
});`

const STATION2_BRUNO_TESTS = [
  {
    id: 1,
    title: 'تست ۱: نبض سرور و اتصال به PostgreSQL',
    method: 'GET',
    url: 'http://localhost:3000/health',
    status: '200 OK',
    body: null,
    expected: `{
  "status": "healthy",
  "database": "connected (PostgreSQL)",
  "uptime": 2.14,
  "timestamp": "2026-10-15T01:00:00.000Z"
}`,
  },
  {
    id: 2,
    title: 'تست ۲: ثبت سفارش در پایگاه داده (201 Created)',
    method: 'POST',
    url: 'http://localhost:3000/api/orders',
    status: '201 Created',
    body: `{
  "orderNumber": "2001",
  "itemTitle": "کیت رباتیک هوشمند سفیر",
  "city": "مشهد",
  "customerName": "بهنام",
  "customerPhone": "09121112233"
}`,
    expected: `{
  "success": true,
  "message": "سفارش با موفقیت در دیتابیس پایدار ذخیره شد.",
  "order": {
    "orderNumber": "2001",
    "itemTitle": "کیت رباتیک هوشمند سفیر",
    "status": "ثبت اولیه"
  }
}`,
  },
  {
    id: 3,
    title: 'تست ۳: استعلام سفارش واقعی و رابطه مشتری (200 OK)',
    method: 'GET',
    url: 'http://localhost:3000/api/orders/2001',
    status: '200 OK',
    body: null,
    expected: `{
  "success": true,
  "order": {
    "number": "2001",
    "item": "کیت رباتیک هوشمند سفیر",
    "status": "ثبت اولیه",
    "customerName": "بهنام",
    "customerPhone": "09121112233"
  }
}`,
  },
  {
    id: 4,
    title: 'تست ۴: ثبت پیام چت در جدول ChatMessage',
    method: 'POST',
    url: 'http://localhost:3000/api/chat',
    status: '200 OK',
    body: `{
  "name": "بهنام",
  "phone": "09121112233",
  "message": "سلام سفیر! وضعیت بسته‌ام رو چک کن"
}`,
    expected: `{
  "success": true,
  "customerId": "c1...",
  "reply": "درود بهنام! پیام شما در پایگاه داده سفیر ثبت شد."
}`,
  },
]

const STATION3_SCHEMA = `// prisma/schema.prisma — مدل کاربران با رمز عبور و نقش‌ها

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  CUSTOMER  // مشتری عادی
  ADMIN     // مدیر سیستم و پشتیبانی
}

model Customer {
  id        String   @id @default(uuid())
  name      String
  phone     String   @unique
  password  String                        // رمز عبور هش‌شده با bcrypt
  role      Role     @default(CUSTOMER)   // نقش کاربر
  createdAt DateTime @default(now())

  orders    Order[]
  messages  ChatMessage[]
}

model Order {
  id          String   @id @default(uuid())
  orderNumber String   @unique
  itemTitle   String
  status      String   @default("ثبت اولیه")
  city        String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id])
}

model ChatMessage {
  id        String   @id @default(uuid())
  sender    String
  content   String
  createdAt DateTime @default(now())

  customerId String?
  customer   Customer? @relation(fields: [customerId], references: [id])
}`

const STATION3_SERVER_CODE = `// server.js — نسخه ۳: گام سوم (احراز هویت JWT و تفکیک نقش‌ها با Fastify)

const fastify = require('fastify')({ logger: true });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ثبت پلاگین JWT
fastify.register(require('@fastify/jwt'), {
  secret: 'SAFIR_SUPER_SECRET_KEY_2026_OFFLINE_SECURE'
});

// هوک کمکی نگهبان: اعتبارسنجی لاگین بودن کاربر
fastify.decorate('authenticate', async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401);
    return reply.send({ success: false, error: 'برای دسترسی باید ابتدا لاگین کنی!' });
  }
});

// هوک کمکی نگهبان: بررسی دسترسی ادمین
fastify.decorate('requireAdmin', async function (request, reply) {
  if (!request.user || request.user.role !== 'ADMIN') {
    reply.status(403);
    return reply.send({ success: false, error: 'تنها مدیران (ADMIN) اجازه این عملیات را دارند!' });
  }
});

// ۱. ثبت‌نام کاربر جدید
fastify.post('/api/auth/register', async (request, reply) => {
  const { name, phone, password, role } = request.body || {};
  if (!phone || !password || password.length < 6) {
    reply.status(400);
    return { success: false, error: 'شماره تماس و رمز عبور (حداقل ۶ کاراکتر) الزامی است.' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const customer = await prisma.customer.create({
      data: {
        name: name || 'کاربر جدید',
        phone,
        password: hashedPassword,
        role: role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER'
      }
    });

    reply.status(201);
    return { success: true, user: { id: customer.id, name: customer.name, role: customer.role } };
  } catch (err) {
    if (err.code === 'P2002') {
      reply.status(409);
      return { success: false, error: 'شماره تماس تکراری است!' };
    }
    reply.status(500);
    return { success: false, error: 'خطای سرور در ثبت‌نام' };
  }
});

// ۲. ورود و دریافت توکن JWT
fastify.post('/api/auth/login', async (request, reply) => {
  const { phone, password } = request.body || {};
  const user = await prisma.customer.findUnique({ where: { phone } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    reply.status(401);
    return { success: false, error: 'شماره تماس یا رمز عبور اشتباه است!' };
  }

  const token = fastify.jwt.sign({
    id: user.id,
    phone: user.phone,
    name: user.name,
    role: user.role
  });

  return { success: true, token, user: { name: user.name, role: user.role } };
});

// ۳. روت چت محافظت‌شده با مچ‌بند JWT
fastify.post('/api/chat', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  const { message } = request.body || {};
  const currentUser = request.user; // استخراج‌شده از توکن

  const savedMsg = await prisma.chatMessage.create({
    data: { sender: 'کاربر', content: message.trim(), customerId: currentUser.id }
  });

  const botReply = \`درود \${currentUser.name}! هویت شما با مچ‌بند JWT تأیید شد.\`;
  return { success: true, reply: botReply, messageId: savedMsg.id };
});

// ۴. تغییر وضعیت سفارش (فقط ADMIN)
fastify.patch(
  '/api/orders/:orderNumber/status',
  { preHandler: [fastify.authenticate, fastify.requireAdmin] },
  async (request, reply) => {
    const { orderNumber } = request.params;
    const { status } = request.body || {};

    const updated = await prisma.order.update({
      where: { orderNumber: String(orderNumber) },
      data: { status }
    });

    return { success: true, message: 'وضعیت سفارش توسط مدیر تغییر یافت.', order: updated };
  }
);

fastify.listen({ port: 3000, host: '0.0.0.0' }).then(addr => {
  console.log(\`🛡️ سرور سفیر همراه با گیت نگهبانی JWT روی \${addr} بیدار شد!\`);
});`

const STATION3_BRUNO_TESTS = [
  {
    id: 1,
    title: 'تست ۱: ثبت‌نام مدیر در سامانه (201 Created)',
    method: 'POST',
    url: 'http://localhost:3000/api/auth/register',
    status: '201 Created',
    body: `{
  "name": "مدیر پشتیبانی سفیر",
  "phone": "09129990000",
  "password": "adminSecret123",
  "role": "ADMIN"
}`,
    expected: `{
  "success": true,
  "user": {
    "name": "مدیر پشتیبانی سفیر",
    "role": "ADMIN"
  }
}`,
  },
  {
    id: 2,
    title: 'تست ۲: ورود و دریافت مچ‌بند JWT (200 OK)',
    method: 'POST',
    url: 'http://localhost:3000/api/auth/login',
    status: '200 OK',
    body: `{
  "phone": "09129990000",
  "password": "adminSecret123"
}`,
    expected: `{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6...",
  "user": {
    "role": "ADMIN"
  }
}`,
  },
  {
    id: 3,
    title: 'تست ۳: تست نگهبان — رد درخواست بدون توکن (401 Unauthorized)',
    method: 'POST',
    url: 'http://localhost:3000/api/chat',
    status: '401 Unauthorized',
    body: `{
  "message": "سلام من یک غریبه‌ام بدون کارت!"
}`,
    expected: `{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "No Authorization was found in request.headers"
}`,
  },
  {
    id: 4,
    title: 'تست ۴: تغییر وضعیت سفارش توسط مدیر با توکن (200 OK)',
    method: 'PATCH',
    url: 'http://localhost:3000/api/orders/2001/status',
    status: '200 OK',
    body: `{
  "status": "تحویل راننده پیک داده شد"
}`,
    expected: `{
  "success": true,
  "message": "وضعیت سفارش توسط مدیر تغییر یافت.",
  "order": {
    "orderNumber": "2001",
    "status": "تحویل راننده پیک داده شد"
  }
}`,
  },
]

const STATION4_SERVER_CODE = `// server.js — نسخه ۳: گام چهارم (کمد حافظه Redis و صف انبار BullMQ)

const fastify = require('fastify')({ logger: true });
const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');
const { Queue } = require('bullmq');

const prisma = new PrismaClient();

// ۱. اتصال به حافظه رم پرسرعت Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null // ضروری برای BullMQ
});

// ۲. ساخت صف نوتیفیکیشن‌ها در ردیس با BullMQ
const notificationQueue = new Queue('safirNotifications', { connection: redis });

// نبض سلامت (بررسی وضعیت Postgres و Redis)
fastify.get('/health', async (request, reply) => {
  try {
    await prisma.$queryRaw\`SELECT 1\`;
    const redisPing = await redis.ping();
    return {
      status: 'healthy',
      database: 'connected (PostgreSQL)',
      cache: \`connected (Redis PING: \${redisPing})\`,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    reply.status(500);
    return { status: 'unhealthy', error: err.message };
  }
});

// ۳. استعلام وضعیت سفارش با الگوی Cache-Aside (زیر ۱ میلی‌ثانیه در Hit)
fastify.get('/api/orders/:orderNumber', async (request, reply) => {
  const { orderNumber } = request.params;
  const cacheKey = \`order:\${orderNumber}\`;
  const startTime = Date.now();

  // الف) اول ردیس را چک کن!
  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    const elapsed = Date.now() - startTime;
    reply.header('X-Cache-Status', 'HIT');
    return {
      success: true,
      source: 'CACHE (Redis)',
      responseTimeMs: elapsed,
      order: JSON.parse(cachedData)
    };
  }

  // ب) نبود (Cache Miss) -> دیتابیس را بخوان
  const order = await prisma.order.findUnique({
    where: { orderNumber: String(orderNumber) },
    include: { customer: { select: { name: true, phone: true } } }
  });

  if (!order) {
    reply.status(404);
    return { success: false, error: \`سفارشی با شماره \${orderNumber} پیدا نشد!\` };
  }

  // ج) در ردیس با انقضای ۳۰۰ ثانیه‌ای ذخیره کن
  await redis.setex(cacheKey, 300, JSON.stringify(order));
  const elapsed = Date.now() - startTime;
  reply.header('X-Cache-Status', 'MISS');

  return {
    success: true,
    source: 'DATABASE (PostgreSQL)',
    responseTimeMs: elapsed,
    order
  };
});

// ۴. تغییر وضعیت سفارش: باطل‌سازی کش قدیمی + انداختن کار پیامک در صف انبار
fastify.patch('/api/orders/:orderNumber/status', async (request, reply) => {
  const { orderNumber } = request.params;
  const { status } = request.body || {};

  if (!status) {
    reply.status(400);
    return { success: false, error: 'وضعیت جدید الزامی است.' };
  }

  // بروزرسانی در پایگاه داده
  const updatedOrder = await prisma.order.update({
    where: { orderNumber: String(orderNumber) },
    data: { status }
  });

  // ۱. گام طلایی: باطل‌سازی کش کهنه در Redis!
  await redis.del(\`order:\${orderNumber}\`);

  // ۲. فرستادن کار سنگین اطلاع‌رسانی به صف BullMQ (پاسخ آنی به کلاینت)
  const job = await notificationQueue.add('order-status-changed', {
    orderNumber: updatedOrder.orderNumber,
    newStatus: updatedOrder.status,
    timestamp: new Date().toISOString()
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  });

  return {
    success: true,
    message: 'وضعیت آپدیت شد، کش باطل گردید و کار پیامک به صف رفت.',
    order: updatedOrder,
    jobId: job.id
  };
});

// ۵. پیگیری وضعیت پیشرفت جاب در صف توسط کلاینت
fastify.get('/api/jobs/:id', async (request, reply) => {
  const { id } = request.params;
  const job = await notificationQueue.getJob(id);

  if (!job) {
    reply.status(404);
    return { success: false, error: 'جاب یافت نشد.' };
  }

  const state = await job.getState();
  return {
    id: job.id,
    name: job.name,
    state,
    result: job.returnvalue,
    failedReason: job.failedReason
  };
});

fastify.listen({ port: 3000, host: '0.0.0.0' }).then(addr => {
  console.log(\`⚡ سرور سفیر مجهز به کمد Redis و صف BullMQ روی \${addr} به پرواز درآمد!\`);
});`

const STATION4_WORKER_CODE = `// worker.js — کارگر خستگی‌ناپذیر سفیر در پس‌زمینه (اجرا با node worker.js)

const { Worker } = require('bullmq');
const Redis = require('ioredis');

const connection = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null
});

console.log('👷 کارگر پردازش سفیر بیدار شد و در حال شنود صف safirNotifications است...');

const worker = new Worker('safirNotifications', async (job) => {
  console.log(\`\\n📥 [شروع جاب #\${job.id}] \${job.name}\`);
  console.log('📦 داده‌های ورودی:', job.data);

  if (job.name === 'order-status-changed') {
    // شبیه‌سازی ۲ ثانیه کار زمان‌بر: صدور فاکتور PDF و ارسال پیامک
    console.log('⏳ در حال تولید فاکتور PDF و اتصال به وب‌سرویس پیامک...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log(\`✅ پیامک تغییر وضعیت به شماره مشتری سفارش \${job.data.orderNumber} ارسال شد!\`);

    return {
      sentSms: true,
      deliveredAt: new Date().toISOString(),
      details: \`پیامک به شماره خریدار سفارش \${job.data.orderNumber} مخابره شد.\`
    };
  }

  return { processed: true };
}, { connection });

worker.on('completed', (job, returnvalue) => {
  console.log(\`🎉 جاب #\${job.id} با موفقیت پایان یافت. نتیجه:\`, returnvalue);
});

worker.on('failed', (job, err) => {
  console.error(\`❌ خطا در اجرای جاب #\${job.id}:\`, err.message);
});`

const STATION4_BRUNO_TESTS = [
  {
    id: 1,
    title: 'تست ۱: نبض سلامت دوگانه سرور، PostgreSQL و Redis',
    method: 'GET',
    url: 'http://localhost:3000/health',
    status: '200 OK',
    body: null,
    expected: `{
  "status": "healthy",
  "database": "connected (PostgreSQL)",
  "cache": "connected (Redis PING: PONG)",
  "uptime": 4.12,
  "timestamp": "2026-10-15T01:30:00.000Z"
}`,
  },
  {
    id: 2,
    title: 'تست ۲: استعلام اول سفارش (Cache Miss — خواندن از دیسک DB در 45ms)',
    method: 'GET',
    url: 'http://localhost:3000/api/orders/2001',
    status: '200 OK',
    body: null,
    expected: `{
  "success": true,
  "source": "DATABASE (PostgreSQL)",
  "responseTimeMs": 42,
  "order": {
    "orderNumber": "2001",
    "itemTitle": "کیت رباتیک هوشمند سفیر",
    "status": "ثبت اولیه"
  }
}`,
  },
  {
    id: 3,
    title: 'تست ۳: استعلام دوم سفارش (Cache Hit — خواندن از رم Redis در 1ms!)',
    method: 'GET',
    url: 'http://localhost:3000/api/orders/2001',
    status: '200 OK',
    body: null,
    expected: `{
  "success": true,
  "source": "CACHE (Redis)",
  "responseTimeMs": 1,
  "order": {
    "orderNumber": "2001",
    "itemTitle": "کیت رباتیک هوشمند سفیر",
    "status": "ثبت اولیه"
  }
}`,
  },
  {
    id: 4,
    title: 'تست ۴: تغییر وضعیت سفارش، ابطال کش و ارسال کار به صف BullMQ (200 OK)',
    method: 'PATCH',
    url: 'http://localhost:3000/api/orders/2001/status',
    status: '200 OK',
    body: `{
  "status": "تحویل راننده پیک داده شد"
}`,
    expected: `{
  "success": true,
  "message": "وضعیت آپدیت شد، کش باطل گردید و کار پیامک به صف رفت.",
  "jobId": "1",
  "order": {
    "orderNumber": "2001",
    "status": "تحویل راننده پیک داده شد"
  }
}`,
  },
  {
    id: 5,
    title: 'تست ۵: رهگیری پیشرفت جاب در صف توسط کلاینت (State: completed)',
    method: 'GET',
    url: 'http://localhost:3000/api/jobs/1',
    status: '200 OK',
    body: null,
    expected: `{
  "id": "1",
  "name": "order-status-changed",
  "state": "completed",
  "result": {
    "sentSms": true,
    "details": "پیامک به شماره خریدار سفارش 2001 مخابره شد."
  }
}`,
  },
]

const STATION5_SERVER_CODE = `// server.js — نسخه ۳: گام پنجم (مغز متفکر — اتصال به LLM با خروجی معتبر JSON)

const fastify = require('fastify')({ logger: true });
const { PrismaClient } = require('@prisma/client');
const { OpenAI } = require('openai');
const { z } = require('zod');

const prisma = new PrismaClient();

// ۱. کلاینت هوش مصنوعی (سازگار با Ollama لوکال روی پورت 11434 یا OpenAI ابری)
const openai = new OpenAI({
  baseURL: process.env.AI_BASE_URL || 'http://localhost:11434/v1',
  apiKey: process.env.AI_API_KEY || 'ollama-local-offline'
});

const AI_MODEL = process.env.AI_MODEL_NAME || 'qwen2.5:0.5b';

// ۲. فرم سخت‌گیرانه Zod برای اعتبارسنجی خروجی مدل زبانی
const AiAnalysisSchema = z.object({
  intent: z.enum(['TRACK_ORDER', 'COMPLAINT', 'GENERAL_QUESTION', 'CANCEL_ORDER']),
  orderNumber: z.string().nullable(),
  sentiment: z.enum(['HAPPY', 'NEUTRAL', 'ANGRY']),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  suggestedReply: z.string().min(5)
});

// نبض سلامت و بررسی ارتباط با موتور هوش مصنوعی
fastify.get('/health', async (request, reply) => {
  let aiStatus = 'disconnected';
  try {
    const models = await openai.models.list();
    aiStatus = \`connected (مدل فعال: \${AI_MODEL})\`;
  } catch (err) {
    aiStatus = \`offline (\${err.message})\`;
  }

  return {
    status: 'healthy',
    service: 'Safir Core + AI Brain',
    aiEngine: aiStatus,
    timestamp: new Date().toISOString()
  };
});

// ۳. روت تحلیل هوشمند پیام‌های ورودی مشتری با خروجی تضمین‌شده JSON
fastify.post('/api/ai/analyze-message', async (request, reply) => {
  const { message } = request.body || {};

  if (!message || message.trim() === '') {
    reply.status(400);
    return { success: false, error: 'متن پیام مشتری الزامی است!' };
  }

  const startTime = Date.now();

  try {
    // صدا زدن مدل با response_format روی json_object
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: \`تو هوش مصنوعی تحلیل‌گر سامانه تدارکات و لجستیک «سفیر» هستی.
وظیفه تو این است که پیام خریدار را خوانده و دقیقاً یک آبجکت معتبر JSON با این فیلدها بسازی:
- "intent": یکی از مقادیر ["TRACK_ORDER", "COMPLAINT", "GENERAL_QUESTION", "CANCEL_ORDER"]
- "orderNumber": رشته شماره سفارش اگر در پیام ذکر شده بود، در غیر این صورت مقدار null
- "sentiment": یکی از مقادیر ["HAPPY", "NEUTRAL", "ANGRY"]
- "urgency": یکی از مقادیر ["LOW", "MEDIUM", "HIGH"]
- "suggestedReply": یک پاسخ کوتاه، بسیار محترمانه و صمیمی به زبان فارسی برای مشتری

مهم: هیچ متنی جز ساختار JSON خروجی نده!\`
        },
        {
          role: 'user',
          content: \`پیام مشتری: "\${message}"\`
        }
      ],
      temperature: 0.1 // دمای پایین برای پاسخ قطعی و جلوگیری از خیال‌بافی
    });

    const rawContent = response.choices[0].message.content;
    const parsedJson = JSON.parse(rawContent);

    // اعتبارسنجی قطعی با Zod
    const validatedData = AiAnalysisSchema.parse(parsedJson);
    const elapsed = Date.now() - startTime;

    // ذخیره سابقه چت و نیت در دیتابیس
    await prisma.chatMessage.create({
      data: {
        sender: 'کاربر',
        content: \`[تحلیل AI: نیت=\${validatedData.intent} | حس=\${validatedData.sentiment}] \${message}\`
      }
    });

    return {
      success: true,
      analysisTimeMs: elapsed,
      ai: validatedData
    };
  } catch (err) {
    request.log.error(err);
    reply.status(500);
    return {
      success: false,
      error: 'خطا در تحلیل پیام توسط مغز متفکر',
      details: err.message
    };
  }
});

fastify.listen({ port: 3000, host: '0.0.0.0' }).then(addr => {
  console.log(\`🧠 مغز متفکر سفیر با اتصال به مدل زبانی روی \${addr} آغاز به کار کرد!\`);
});`

const STATION5_BRUNO_TESTS = [
  {
    id: 1,
    title: 'تست ۱: نبض سلامت سرور و اتصال به مدل هوش مصنوعی (Local Ollama / OpenAI)',
    method: 'GET',
    url: 'http://localhost:3000/health',
    status: '200 OK',
    body: null,
    expected: `{
  "status": "healthy",
  "service": "Safir Core + AI Brain",
  "aiEngine": "connected (مدل فعال: qwen2.5:0.5b)",
  "timestamp": "2026-10-15T01:35:00.000Z"
}`,
  },
  {
    id: 2,
    title: 'تست ۲: استخراج شماره سفارش و نیت پیگیری (Intent: TRACK_ORDER)',
    method: 'POST',
    url: 'http://localhost:3000/api/ai/analyze-message',
    status: '200 OK',
    body: `{
  "message": "سلام خسته نباشید، وضعیت سفارش ۲۰۰۱ من چی شد؟ قرار بود امروز برسه مشهد."
}`,
    expected: `{
  "success": true,
  "analysisTimeMs": 284,
  "ai": {
    "intent": "TRACK_ORDER",
    "orderNumber": "2001",
    "sentiment": "NEUTRAL",
    "urgency": "MEDIUM",
    "suggestedReply": "درود! سفارش شماره ۲۰۰۱ شما در حال بررسی است و به زودی وضعیت دقیق ارسال به مشهد را به شما اعلام می‌کنیم."
  }
}`,
  },
  {
    id: 3,
    title: 'تست ۳: تشخیص مشتری شاکی و لحن عصبانی (Sentiment: ANGRY & Priority: HIGH)',
    method: 'POST',
    url: 'http://localhost:3000/api/ai/analyze-message',
    status: '200 OK',
    body: `{
  "message": "چرا تلفنتون رو جواب نمی‌دید؟ سه روزه پول دادم ولی هیچ بسته‌ای نیومده! خیلی بی‌مسئولیت هستید!"
}`,
    expected: `{
  "success": true,
  "analysisTimeMs": 310,
  "ai": {
    "intent": "COMPLAINT",
    "orderNumber": null,
    "sentiment": "ANGRY",
    "urgency": "HIGH",
    "suggestedReply": "کاربر گرامی، از تاخیر پیش‌آمده عمیقاً پوزش می‌خواهیم. تیم پشتیبانی سفیر اولویت بالایی به پیگیری پیام شما داده و در اسرع وقت مشکل را حل خواهد کرد."
  }
}`,
  },
  {
    id: 4,
    title: 'تست ۴: سوال عمومی درباره ساعات کاری (Intent: GENERAL_QUESTION)',
    method: 'POST',
    url: 'http://localhost:3000/api/ai/analyze-message',
    status: '200 OK',
    body: `{
  "message": "شعبه مرکزی سفیر در روزهای پنجشنبه تا چه ساعتی باز است؟"
}`,
    expected: `{
  "success": true,
  "analysisTimeMs": 240,
  "ai": {
    "intent": "GENERAL_QUESTION",
    "orderNumber": null,
    "sentiment": "NEUTRAL",
    "urgency": "LOW",
    "suggestedReply": "ساعت کاری شعبه مرکزی سفیر در روزهای پنجشنبه از ساعت ۸ صبح تا ۱۴ بعدازظهر می‌باشد."
  }
}`,
  },
  {
    id: 5,
    title: 'تست ۵: اعتبارسنجی داده‌های تایپ‌سیف توسط بازرس Zod (خروجی ۱۰۰٪ معتبر)',
    method: 'POST',
    url: 'http://localhost:3000/api/ai/analyze-message',
    status: '200 OK',
    body: `{
  "message": "می‌خوام سفارشم رو کنسل کنم، پشیمون شدم."
}`,
    expected: `{
  "success": true,
  "ai": {
    "intent": "CANCEL_ORDER",
    "orderNumber": null,
    "sentiment": "NEUTRAL",
    "urgency": "HIGH",
    "suggestedReply": "درخواست انصراف شما دریافت شد. همکاران پشتیبانی جهت عودت وجه با شما تماس خواهند گرفت."
  }
}`,
  },
]


export default function App() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStationId, setSelectedStationId] = useState<number>(1)
  const [activeTab, setActiveTab] = useState<'reader' | 'toolbox' | 'bruno' | 'code'>('reader')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // پنل‌های کناری جمع‌شونده (برای جلوگیری از شلوغی)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [tocOpen, setTocOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // تنظیمات کاربر (با ذخیره در localStorage)
  const [settings, setSettings] = useState<V3Settings>(() => {
    try {
      const saved = localStorage.getItem('roadmap-reader-v3-settings')
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
    } catch {}
    return DEFAULT_SETTINGS
  })

  // اعمال تنظیمات روی تگ html و استایل‌ها
  useEffect(() => {
    try {
      localStorage.setItem('roadmap-reader-v3-settings', JSON.stringify(settings))
    } catch {}

    const root = document.documentElement
    root.dataset.theme = settings.theme
    if (settings.theme === 'dark' || settings.theme === 'monokai') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // تنظیم فونت
    let fontStack = "'IRANSans', system-ui, sans-serif"
    if (settings.fontFamily === 'vazirmatn') {
      fontStack = "'Vazirmatn', system-ui, sans-serif"
    } else if (settings.fontFamily === 'system') {
      fontStack = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }

    root.style.setProperty('--v3-font-family', fontStack)
    root.style.setProperty('--app-font-family', fontStack)
    root.style.setProperty('--app-font-size', `${settings.fontSize}px`)
    root.style.setProperty('--app-line-height', String(settings.lineHeight))
    document.body.style.fontFamily = fontStack
  }, [settings])

  useEffect(() => {
    loadDocs().then((d) => {
      setDocs(d)
      setLoading(false)
    })
  }, [])

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // یافتن سند مربوط به ایستگاه انتخاب‌شده
  const activeDoc = useMemo(() => {
    if (selectedStationId === 0) {
      return docs.find((d) => d.path.includes('03-نقشه-راه-چریکی')) ?? null
    }
    if (selectedStationId === 2) {
      return docs.find((d) => d.path.includes('فاز-۱۵')) ?? docs.find((d) => d.title.includes('دفترچه')) ?? null
    }
    if (selectedStationId === 3) {
      return docs.find((d) => d.path.includes('فاز-۱۶')) ?? docs.find((d) => d.title.includes('نگهبان')) ?? null
    }
    if (selectedStationId === 4) {
      return docs.find((d) => d.path.includes('فاز-۱۷')) ?? docs.find((d) => d.title.includes('انبار')) ?? null
    }
    if (selectedStationId === 5) {
      return docs.find((d) => d.path.includes('فاز-۱۸')) ?? docs.find((d) => d.title.includes('متفکر')) ?? null
    }
    return docs.find((d) => d.path.includes('فاز-۱۴')) ?? docs.find((d) => d.title.includes('تلفنچی')) ?? null
  }, [docs, selectedStationId])

  // استخراج تیترهای فهرست
  const headings = useMemo(() => {
    if (!activeDoc) return []
    return extractHeadings(activeDoc.content).filter((h) => h.level === 2 || h.level === 3)
  }, [activeDoc])

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(`v3-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // عرض ستون مطالعه
  const readingWidthClass = useMemo(() => {
    switch (settings.readingWidth) {
      case 'compact':
        return 'max-w-2xl' // 672px
      case 'standard':
        return 'max-w-3xl' // 768px - استاندارد کتابی
      case 'wide':
        return 'max-w-5xl' // 1024px
      case 'full':
        return 'max-w-none'
      default:
        return 'max-w-3xl'
    }
  }, [settings.readingWidth])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg,#090d16)] text-[var(--text-muted,#94a3b8)] font-medium">
        در حال بارگذاری…
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-200 flex flex-col"
      style={{ fontSize: `${settings.fontSize}px`, lineHeight: settings.lineHeight }}
    >
      {/* ── نوار بالای صفحه (مینیمال و تمیز) ── */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md px-4 py-2.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* سمت راست: دکمه منو + لوگو */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                sidebarOpen
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
              title="نمایش یا پنهان کردن فهرست ایستگاه‌ها"
            >
              <span>☰</span>
              <span className="hidden sm:inline">ایستگاه‌ها</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-[var(--text)]">
                سفیر
              </span>
              <span className="text-xs text-[var(--text-muted)] hidden md:inline">
                / {selectedStationId === 0
                  ? 'نقشه راه کلان'
                  : `ایستگاه ${selectedStationId}: ${STATIONS.find((s) => s.id === selectedStationId)?.title ?? ''}`}
              </span>
            </div>
          </div>

          {/* وسط: تب‌های روان کارگاهی برای مأموریت‌های فعال */}
          {(selectedStationId >= 1 && selectedStationId <= 5) && (
            <div className="flex items-center gap-1 bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border)] text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('reader')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'reader'
                    ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                📖 متن درس
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('toolbox')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'toolbox'
                    ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                🧰 جعبه‌ابزار
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bruno')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'bruno'
                    ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                🧪 تست با Bruno
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'code'
                    ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                💻 کد سرور
              </button>
            </div>
          )}

          {/* سمت چپ: دکمه تنظیمات + سرفصل‌ها + سوییچر نسخه */}
          <div className="flex items-center gap-2">
            {headings.length > 0 && activeTab === 'reader' && (
              <button
                type="button"
                onClick={() => setTocOpen((v) => !v)}
                className={`hidden lg:flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  tocOpen
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
                title="نمایش سرفصل‌های این بخش"
              >
                <span>📑</span>
                <span>سرفصل‌ها</span>
              </button>
            )}

            {/* کنترل سریع اندازه قلم */}
            <div className="hidden sm:flex items-center gap-0.5 border border-[var(--border)] rounded-lg bg-[var(--surface-2)] p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSettings((s) => ({ ...s, fontSize: Math.max(s.fontSize - 1, 13) }))}
                className="px-2 py-1 rounded hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]"
                title="کوچک‌تر کردن متن"
              >
                A−
              </button>
              <span className="px-1 font-mono text-[0.7rem] text-[var(--text-faint)]">
                {settings.fontSize}
              </span>
              <button
                type="button"
                onClick={() => setSettings((s) => ({ ...s, fontSize: Math.min(s.fontSize + 1, 26) }))}
                className="px-2 py-1 rounded hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]"
                title="بزرگ‌تر کردن متن"
              >
                A+
              </button>
            </div>

            {/* دکمه باز کردن پنجره تنظیمات کامل */}
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-bold text-[var(--text)] hover:border-[var(--primary)] transition-all shadow-sm"
              title="تنظیم رنگ‌بندی، فونت و ظاهر"
            >
              <span>⚙️</span>
              <span className="hidden sm:inline">تنظیمات ظاهر</span>
            </button>

            {/* سوییچر نسخه‌ها */}
            <div className="flex items-center gap-1 text-[0.7rem] font-bold border-s border-[var(--border)] ps-2 ms-1">
              <a
                href="/index.html"
                className="rounded px-2 py-1 text-[var(--text-faint)] hover:text-[var(--text)] transition-colors"
                title="نسخه ۱ (اسکلت)"
              >
                v1
              </a>
              <a
                href="/v2.html"
                className="rounded px-2 py-1 text-[var(--text-faint)] hover:text-[var(--text)] transition-colors"
                title="نسخه ۲ (تکنیکال)"
              >
                v2
              </a>
              <span className="rounded bg-[var(--primary)]/15 text-[var(--primary)] px-2 py-1">
                v3
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── بدنه اصلی چیدمان ── */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-start gap-8 p-4 sm:p-6">
        {/* ── ستون کناری: ایستگاه‌های دوره (قابلیت بستن برای عدم شلوغی) ── */}
        {sidebarOpen && (
          <aside className="w-72 shrink-0 flex flex-col gap-3 sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto pe-1">
            <div className="flex items-center justify-between text-xs text-[var(--text-faint)] px-1">
              <span className="font-bold">ایستگاه‌های نسخه ۳</span>
              <span>{STATIONS.filter((s) => s.status === 'active').length} از {STATIONS.length} آماده مطالعه</span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedStationId(0)}
              className={`rounded-xl p-3 text-right text-xs transition-all border ${
                selectedStationId === 0
                  ? 'border-[var(--primary)] bg-[var(--surface-2)] text-[var(--text)] font-bold shadow-sm'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              🗺️ مانیفست و نقشه راه چریکی
            </button>

            <nav className="flex flex-col gap-1.5">
              {STATIONS.map((st) => {
                const isActive = selectedStationId === st.id
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStationId(st.id)}
                    className={`rounded-xl p-3 text-right transition-all border flex flex-col gap-1 ${
                      isActive
                        ? 'border-[var(--primary)] bg-[var(--surface-2)] shadow-sm'
                        : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}>
                        ایستگاه {st.id}: {st.title}
                      </span>
                      {st.status === 'active' ? (
                        <span className="text-[0.62rem] font-bold text-[var(--primary)] bg-[var(--primary)]/15 px-1.5 py-0.5 rounded">
                          فعال
                        </span>
                      ) : (
                        <span className="text-[0.6rem] text-[var(--text-faint)]">به‌زودی</span>
                      )}
                    </div>
                    <span className="text-[0.72rem] text-[var(--text-muted)]">{st.subtitle}</span>
                  </button>
                )
              })}
            </nav>
          </aside>
        )}

        {/* ── ستون میانی: ران‌وی آرام و ارگونومیک مطالعه ── */}
        <main className="flex-1 min-w-0 flex flex-col items-center">
          <div className={`w-full ${readingWidthClass}`}>
            {selectedStationId === 1 ? (
              <>
                {/* تب ۱: متن اصلی درس با تایپوگرافی خوش‌خوان */}
                {activeTab === 'reader' && activeDoc && (
                  <article className="prose">
                    <Markdown content={activeDoc.content} anchorPrefix="v3-" />
                  </article>
                )}

                {/* تب ۲: جعبه‌ابزار و پیش‌نیازها */}
                {activeTab === 'toolbox' && (
                  <div className="flex flex-col gap-6 py-2">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-6">
                      <h2 className="text-base font-bold text-[var(--text)] mb-2 flex items-center gap-2">
                        <span>🧰</span>
                        <span>جعبه‌ابزار مأموریت ۱ (دانلود و ذخیره قبل از قطعی اینترنت)</span>
                      </h2>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        این نرم‌افزارها و پکیج‌ها را هم‌اکنون بررسی و در سیستمت آماده داشته باش تا بدون نیاز به اینترنت بتوانی کدهایت را اجرا و تست کنی:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Node.js */}
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm text-[var(--text)]">۱. موتور اجرای Node.js LTS</h3>
                            <span className="rounded bg-emerald-500/15 text-emerald-500 text-[0.65rem] px-2 py-0.5 font-bold">ضروری</span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
                            برای اجرای وب‌سرور جاوااسکریپت روی ویندوز.
                          </p>
                          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2.5 font-mono text-xs text-[var(--primary)] flex items-center justify-between">
                            <span>node -v</span>
                            <button
                              onClick={() => copyToClipboard('node -v', 'cmd-node')}
                              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
                            >
                              {copiedKey === 'cmd-node' ? 'کپی شد!' : 'کپی'}
                            </button>
                          </div>
                        </div>
                        <a
                          href="https://nodejs.org/en/download"
                          target="_blank"
                          rel="noreferrer"
                          className="text-center rounded-xl bg-[var(--surface-2)] hover:bg-[var(--primary)] hover:text-white text-[var(--text)] font-bold text-xs py-2.5 transition-all border border-[var(--border)]"
                        >
                          دریافت نسخه LTS ویندوز ↗
                        </a>
                      </div>

                      {/* Bruno */}
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm text-[var(--text)]">۲. ابزار تست ای‌پی‌آی Bruno</h3>
                            <span className="rounded bg-cyan-500/15 text-cyan-500 text-[0.65rem] px-2 py-0.5 font-bold">نصب داری ✓</span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
                            کلاینت کامپیوتر برای شبیه‌سازی ارسال درخواست‌های HTTP و دیدن خروجی سرور.
                          </p>
                          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2.5 text-xs text-[var(--text-muted)]">
                            روی سیستم ویندوزت نصب است و آماده به کار می‌باشد.
                          </div>
                        </div>
                        <a
                          href="https://www.usebruno.com/downloads"
                          target="_blank"
                          rel="noreferrer"
                          className="text-center rounded-xl bg-[var(--surface-2)] hover:bg-[var(--primary)] hover:text-white text-[var(--text)] font-bold text-xs py-2.5 transition-all border border-[var(--border)]"
                        >
                          صفحه دانلود Bruno ↗
                        </a>
                      </div>

                      {/* Fastify */}
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between gap-4 md:col-span-2">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm text-[var(--text)]">۳. پکیج Fastify (دانلود و کش در npm)</h3>
                            <span className="rounded bg-amber-500/15 text-amber-500 text-[0.65rem] px-2 py-0.5 font-bold">کش کردن در سیستم</span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
                            دستور زیر را در ترمینال بزن تا کتابخانه Fastify دانلود شده و در سیستم ویندوز کش بماند:
                          </p>
                          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 font-mono text-xs text-[var(--text)] flex items-center justify-between">
                            <span>npm install fastify</span>
                            <button
                              onClick={() => copyToClipboard('npm install fastify', 'cmd-fastify')}
                              className="rounded bg-[var(--surface-3)] px-3 py-1 text-xs font-sans text-[var(--text)] hover:bg-[var(--primary)] hover:text-white"
                            >
                              {copiedKey === 'cmd-fastify' ? 'کپی شد! ✓' : 'کپی دستور'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* تب ۳: میز تست Bruno */}
                {activeTab === 'bruno' && (
                  <div className="flex flex-col gap-5 py-2">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                      <h2 className="text-sm font-bold text-[var(--text)] mb-1">سناریوهای ۵ گانه تست با Bruno</h2>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        ابتدا با <code className="font-mono text-[var(--primary)]">node server.js</code> سرور را روشن کن، سپس این درخواست‌ها را در Bruno بساز:
                      </p>
                    </div>

                    <div className="flex flex-col gap-4">
                      {BRUNO_TESTS.map((t) => (
                        <div key={t.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-3 shadow-sm">
                          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded px-2 py-0.5 text-xs font-black ${
                                  t.method === 'GET' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-blue-500/15 text-blue-500'
                                }`}
                              >
                                {t.method}
                              </span>
                              <span className="font-bold text-xs text-[var(--text)]">{t.title}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-[var(--primary)] bg-[var(--surface-2)] px-2 py-1 rounded border border-[var(--border)]">
                              Status: {t.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between bg-[var(--surface-2)] p-2.5 rounded-xl border border-[var(--border)] font-mono text-xs text-[var(--text)]">
                            <span>{t.url}</span>
                            <button
                              onClick={() => copyToClipboard(t.url, `url-${t.id}`)}
                              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] font-sans"
                            >
                              {copiedKey === `url-${t.id}` ? 'کپی شد!' : 'کپی آدرس'}
                            </button>
                          </div>

                          {t.body && (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                                <span>بدنه ارسال (Body - JSON):</span>
                                <button
                                  onClick={() => copyToClipboard(t.body!, `body-${t.id}`)}
                                  className="text-[var(--primary)] hover:underline text-[0.72rem]"
                                >
                                  {copiedKey === `body-${t.id}` ? 'کپی شد! ✓' : 'کپی بدنه'}
                                </button>
                              </div>
                              <pre className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)] font-mono text-xs text-[var(--text)] overflow-x-auto text-left" dir="ltr">
                                <code>{t.body}</code>
                              </pre>
                            </div>
                          )}

                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-[var(--text-muted)]">پاسخ سرور:</span>
                            <pre className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)] font-mono text-xs text-[var(--text-muted)] overflow-x-auto text-left" dir="ltr">
                              <code>{t.expected}</code>
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* تب ۴: کد آماده سرور Fastify */}
                {activeTab === 'code' && (
                  <div className="flex flex-col gap-4 py-2">
                    <div className="flex items-center justify-between bg-[var(--surface-2)] border border-[var(--border)] p-4 rounded-2xl">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-[var(--text)]">فایل کامل server.js</span>
                        <span className="text-xs text-[var(--text-muted)]">موقعیت فایل: C:\safir-project\server.js</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(SERVER_CODE, 'code-all')}
                        className="rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white hover:opacity-90 shadow-sm transition-all"
                      >
                        {copiedKey === 'code-all' ? 'کپی شد! ✓' : 'کپی کامل کد'}
                      </button>
                    </div>

                    <div className="terminal-window my-2">
                      <div className="terminal-header">
                        <div className="terminal-dots">
                          <span className="terminal-dot terminal-dot-red" />
                          <span className="terminal-dot terminal-dot-yellow" />
                          <span className="terminal-dot terminal-dot-green" />
                        </div>
                        <span className="font-mono text-xs text-[var(--text-muted)]">server.js</span>
                      </div>
                      <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono" dir="ltr">
                        <code>{SERVER_CODE}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </>
            ) : selectedStationId === 2 ? (
              <>
                {/* تب ۱: متن اصلی درس ایستگاه ۲ با تایپوگرافی خوش‌خوان */}
                {activeTab === 'reader' && activeDoc && (
                  <article className="prose">
                    <Markdown content={activeDoc.content} anchorPrefix="v3-" />
                  </article>
                )}

                {/* تب ۲: جعبه‌ابزار و پیش‌نیازهای دیتابیس */}
                {activeTab === 'toolbox' && (
                  <div className="flex flex-col gap-6 py-2">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-6">
                      <h2 className="text-base font-bold text-[var(--text)] mb-2 flex items-center gap-2">
                        <span>🧰</span>
                        <span>جعبه‌ابزار مأموریت ۲ (PostgreSQL و Prisma)</span>
                      </h2>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        برای ساخت بایگانی پایدار، این نرم‌افزارها و کتابخانه‌ها را در سیستمت آماده کن:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* PostgreSQL */}
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm text-[var(--text)]">۱. پایگاه داده PostgreSQL</h3>
                            <span className="rounded bg-emerald-500/15 text-emerald-500 text-[0.65rem] px-2 py-0.5 font-bold">پایگاه داده اصلی</span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
                            پایگاه داده رابطه‌ای متن‌باز و استاندارد جهانی برای ذخیره ابدی جداول.
                          </p>
                          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2.5 font-mono text-xs text-[var(--primary)] flex items-center justify-between">
                            <span>psql --version</span>
                            <button
                              onClick={() => copyToClipboard('psql --version', 'cmd-psql')}
                              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] font-sans"
                            >
                              {copiedKey === 'cmd-psql' ? 'کپی شد!' : 'کپی'}
                            </button>
                          </div>
                        </div>
                        <a
                          href="https://www.enterprisedb.com/downloads/postgres-postgresql-downloads"
                          target="_blank"
                          rel="noreferrer"
                          className="text-center rounded-xl bg-[var(--surface-2)] hover:bg-[var(--primary)] hover:text-white text-[var(--text)] font-bold text-xs py-2.5 transition-all border border-[var(--border)]"
                        >
                          دریافت PostgreSQL ویندوز ↗
                        </a>
                      </div>

                      {/* Prisma Studio */}
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm text-[var(--text)]">۲. میز کار Prisma Studio</h3>
                            <span className="rounded bg-cyan-500/15 text-cyan-500 text-[0.65rem] px-2 py-0.5 font-bold">بصری و آفلاین</span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
                            مشاهده و ویرایش مستقیم رکوردهای دیتابیس در محیط وب لوکال مانند اکسل.
                          </p>
                          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2.5 font-mono text-xs text-[var(--text)] flex items-center justify-between">
                            <span>npx prisma studio</span>
                            <button
                              onClick={() => copyToClipboard('npx prisma studio', 'cmd-studio')}
                              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] font-sans"
                            >
                              {copiedKey === 'cmd-studio' ? 'کپی شد!' : 'کپی'}
                            </button>
                          </div>
                        </div>
                        <div className="text-center rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)] text-xs py-2.5 border border-[var(--border)]">
                          روی پورت ۵۵۵۵ لوکال اجرا می‌شود
                        </div>
                      </div>

                      {/* Prisma packages */}
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between gap-4 md:col-span-2">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm text-[var(--text)]">۳. نصب Prisma CLI و Prisma Client</h3>
                            <span className="rounded bg-amber-500/15 text-amber-500 text-[0.65rem] px-2 py-0.5 font-bold">دستور نصب</span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
                            دستورات زیر را در پوشه پروژه اجرا کن تا کلاینت و موتور تایپ‌سیف دیتابیس نصب شوند:
                          </p>
                          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 font-mono text-xs text-[var(--text)] flex items-center justify-between">
                            <span>npm install prisma --save-dev && npm install @prisma/client</span>
                            <button
                              onClick={() => copyToClipboard('npm install prisma --save-dev && npm install @prisma/client', 'cmd-prisma')}
                              className="rounded bg-[var(--surface-3)] px-3 py-1 text-xs font-sans text-[var(--text)] hover:bg-[var(--primary)] hover:text-white"
                            >
                              {copiedKey === 'cmd-prisma' ? 'کپی شد! ✓' : 'کپی دستور'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* تب ۳: میز تست Bruno */}
                {activeTab === 'bruno' && (
                  <div className="flex flex-col gap-5 py-2">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                      <h2 className="text-sm font-bold text-[var(--text)] mb-1">سناریوهای تست اتصال و پایداری داده در دیتابیس</h2>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        این ۴ تست را برای اطمینان از ثبت واقعی در PostgreSQL انجام بده:
                      </p>
                    </div>

                    <div className="flex flex-col gap-4">
                      {STATION2_BRUNO_TESTS.map((t) => (
                        <div key={t.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-3 shadow-sm">
                          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded px-2 py-0.5 text-xs font-black ${
                                  t.method === 'GET' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-blue-500/15 text-blue-500'
                                }`}
                              >
                                {t.method}
                              </span>
                              <span className="font-bold text-xs text-[var(--text)]">{t.title}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-[var(--primary)] bg-[var(--surface-2)] px-2 py-1 rounded border border-[var(--border)]">
                              Status: {t.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between bg-[var(--surface-2)] p-2.5 rounded-xl border border-[var(--border)] font-mono text-xs text-[var(--text)]">
                            <span>{t.url}</span>
                            <button
                              onClick={() => copyToClipboard(t.url, `st2-url-${t.id}`)}
                              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] font-sans"
                            >
                              {copiedKey === `st2-url-${t.id}` ? 'کپی شد!' : 'کپی آدرس'}
                            </button>
                          </div>

                          {t.body && (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                                <span>بدنه ارسال (Body - JSON):</span>
                                <button
                                  onClick={() => copyToClipboard(t.body!, `st2-body-${t.id}`)}
                                  className="text-[var(--primary)] hover:underline text-[0.72rem]"
                                >
                                  {copiedKey === `st2-body-${t.id}` ? 'کپی شد! ✓' : 'کپی بدنه'}
                                </button>
                              </div>
                              <pre className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)] font-mono text-xs text-[var(--text)] overflow-x-auto text-left" dir="ltr">
                                <code>{t.body}</code>
                              </pre>
                            </div>
                          )}

                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-[var(--text-muted)]">پاسخ دیتابیس:</span>
                            <pre className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)] font-mono text-xs text-[var(--text-muted)] overflow-x-auto text-left" dir="ltr">
                              <code>{t.expected}</code>
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* تب ۴: کدهای Prisma و سرور */}
                {activeTab === 'code' && (
                  <div className="flex flex-col gap-6 py-2">
                    {/* نقشه schema.prisma */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between bg-[var(--surface-2)] border border-[var(--border)] p-3 rounded-2xl">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-[var(--text)]">۱. نقشه دیتابیس (prisma/schema.prisma)</span>
                          <span className="text-xs text-[var(--text-muted)]">۳ مدل: Customer, Order, ChatMessage</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(STATION2_SCHEMA, 'code-schema')}
                          className="rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 shadow-sm transition-all"
                        >
                          {copiedKey === 'code-schema' ? 'کپی شد! ✓' : 'کپی اسکیما'}
                        </button>
                      </div>

                      <div className="terminal-window my-1">
                        <div className="terminal-header">
                          <div className="terminal-dots">
                            <span className="terminal-dot terminal-dot-red" />
                            <span className="terminal-dot terminal-dot-yellow" />
                            <span className="terminal-dot terminal-dot-green" />
                          </div>
                          <span className="font-mono text-xs text-[var(--text-muted)]">schema.prisma</span>
                        </div>
                        <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono" dir="ltr">
                          <code>{STATION2_SCHEMA}</code>
                        </pre>
                      </div>
                    </div>

                    {/* کدهای server.js */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between bg-[var(--surface-2)] border border-[var(--border)] p-3 rounded-2xl">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-[var(--text)]">۲. کدهای متصل به Prisma در server.js</span>
                          <span className="text-xs text-[var(--text-muted)]">جایگزینی متغیر موقت با دیتابیس پایدار</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(STATION2_SERVER_CODE, 'code-st2-server')}
                          className="rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 shadow-sm transition-all"
                        >
                          {copiedKey === 'code-st2-server' ? 'کپی شد! ✓' : 'کپی کد سرور'}
                        </button>
                      </div>

                      <div className="terminal-window my-1">
                        <div className="terminal-header">
                          <div className="terminal-dots">
                            <span className="terminal-dot terminal-dot-red" />
                            <span className="terminal-dot terminal-dot-yellow" />
                            <span className="terminal-dot terminal-dot-green" />
                          </div>
                          <span className="font-mono text-xs text-[var(--text-muted)]">server.js (Prisma Edition)</span>
                        </div>
                        <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono" dir="ltr">
                          <code>{STATION2_SERVER_CODE}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : selectedStationId === 3 ? (
              <>
                {/* تب ۱: متن اصلی درس ایستگاه ۳ با تایپوگرافی خوش‌خوان */}
                {activeTab === 'reader' && activeDoc && (
                  <article className="prose">
                    <Markdown content={activeDoc.content} anchorPrefix="v3-" />
                  </article>
                )}

                {/* تب ۲: جعبه‌ابزار و پیش‌نیازهای امنیت و JWT */}
                {activeTab === 'toolbox' && (
                  <div className="flex flex-col gap-6 py-2">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-6">
                      <h2 className="text-base font-bold text-[var(--text)] mb-2 flex items-center gap-2">
                        <span>🧰</span>
                        <span>جعبه‌ابزار مأموریت ۳ (امنیت، هش پسورد و توکن JWT)</span>
                      </h2>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        این دو کتابخانه سبک را برای محاسبات ریاضی رمزنگاری و صدور مچ‌بندهای دیجیتال نصب کن:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* bcryptjs */}
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm text-[var(--text)]">۱. پکیج bcryptjs (چرخ‌گوشت پسورد)</h3>
                            <span className="rounded bg-emerald-500/15 text-emerald-500 text-[0.65rem] px-2 py-0.5 font-bold">هش یک‌طرفه</span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
                            تبدیل پسورد خام کاربر به رشته امن ۶۰ کاراکتری غیرقابل بازگشت.
                          </p>
                          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2.5 font-mono text-xs text-[var(--primary)] flex items-center justify-between">
                            <span>npm install bcryptjs</span>
                            <button
                              onClick={() => copyToClipboard('npm install bcryptjs', 'cmd-bcrypt')}
                              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] font-sans"
                            >
                              {copiedKey === 'cmd-bcrypt' ? 'کپی شد!' : 'کپی'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* @fastify/jwt */}
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm text-[var(--text)]">۲. پکیج @fastify/jwt (مچ‌بند دیجیتال)</h3>
                            <span className="rounded bg-cyan-500/15 text-cyan-500 text-[0.65rem] px-2 py-0.5 font-bold">صدور و اعتبارسنجی</span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
                            امضای دیجیتال پی‌لود هویت با کلید محرمانه سرور و اعتبارسنجی آنی در هر ریکوئست.
                          </p>
                          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2.5 font-mono text-xs text-[var(--text)] flex items-center justify-between">
                            <span>npm install @fastify/jwt</span>
                            <button
                              onClick={() => copyToClipboard('npm install @fastify/jwt', 'cmd-jwt')}
                              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] font-sans"
                            >
                              {copiedKey === 'cmd-jwt' ? 'کپی شد!' : 'کپی'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* تب ۳: میز تست Bruno */}
                {activeTab === 'bruno' && (
                  <div className="flex flex-col gap-5 py-2">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                      <h2 className="text-sm font-bold text-[var(--text)] mb-1">سناریوهای تست احراز هویت، خطای ۴۰۱ و دسترسی ADMIN</h2>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        جریان کامل ثبت‌نام، دریافت توکن، سد نگهبان بدون توکن، و تغییر وضعیت سفارش را تست کن:
                      </p>
                    </div>

                    <div className="flex flex-col gap-4">
                      {STATION3_BRUNO_TESTS.map((t) => (
                        <div key={t.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-3 shadow-sm">
                          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded px-2 py-0.5 text-xs font-black ${
                                  t.method === 'GET'
                                    ? 'bg-emerald-500/15 text-emerald-500'
                                    : t.method === 'PATCH'
                                    ? 'bg-purple-500/15 text-purple-500'
                                    : 'bg-blue-500/15 text-blue-500'
                                }`}
                              >
                                {t.method}
                              </span>
                              <span className="font-bold text-xs text-[var(--text)]">{t.title}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-[var(--primary)] bg-[var(--surface-2)] px-2 py-1 rounded border border-[var(--border)]">
                              Status: {t.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between bg-[var(--surface-2)] p-2.5 rounded-xl border border-[var(--border)] font-mono text-xs text-[var(--text)]">
                            <span>{t.url}</span>
                            <button
                              onClick={() => copyToClipboard(t.url, `st3-url-${t.id}`)}
                              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] font-sans"
                            >
                              {copiedKey === `st3-url-${t.id}` ? 'کپی شد!' : 'کپی آدرس'}
                            </button>
                          </div>

                          {t.body && (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                                <span>بدنه ارسال (Body - JSON):</span>
                                <button
                                  onClick={() => copyToClipboard(t.body!, `st3-body-${t.id}`)}
                                  className="text-[var(--primary)] hover:underline text-[0.72rem]"
                                >
                                  {copiedKey === `st3-body-${t.id}` ? 'کپی شد! ✓' : 'کپی بدنه'}
                                </button>
                              </div>
                              <pre className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)] font-mono text-xs text-[var(--text)] overflow-x-auto text-left" dir="ltr">
                                <code>{t.body}</code>
                              </pre>
                            </div>
                          )}

                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-[var(--text-muted)]">پاسخ سرور:</span>
                            <pre className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)] font-mono text-xs text-[var(--text-muted)] overflow-x-auto text-left" dir="ltr">
                              <code>{t.expected}</code>
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* تب ۴: کدهای سرور و اسکیما */}
                {activeTab === 'code' && (
                  <div className="flex flex-col gap-6 py-2">
                    {/* اسکیما */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between bg-[var(--surface-2)] border border-[var(--border)] p-3 rounded-2xl">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-[var(--text)]">۱. اسکیما با ستون‌های password و role</span>
                          <span className="text-xs text-[var(--text-muted)]">فایل prisma/schema.prisma</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(STATION3_SCHEMA, 'code-st3-schema')}
                          className="rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 shadow-sm transition-all"
                        >
                          {copiedKey === 'code-st3-schema' ? 'کپی شد! ✓' : 'کپی اسکیما'}
                        </button>
                      </div>

                      <div className="terminal-window my-1">
                        <div className="terminal-header">
                          <div className="terminal-dots">
                            <span className="terminal-dot terminal-dot-red" />
                            <span className="terminal-dot terminal-dot-yellow" />
                            <span className="terminal-dot terminal-dot-green" />
                          </div>
                          <span className="font-mono text-xs text-[var(--text-muted)]">schema.prisma</span>
                        </div>
                        <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono" dir="ltr">
                          <code>{STATION3_SCHEMA}</code>
                        </pre>
                      </div>
                    </div>

                    {/* کدهای سرور */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between bg-[var(--surface-2)] border border-[var(--border)] p-3 rounded-2xl">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-[var(--text)]">۲. سرور Fastify با نگه‌بان JWT و کنترل نقش‌ها</span>
                          <span className="text-xs text-[var(--text-muted)]">فایل server.js</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(STATION3_SERVER_CODE, 'code-st3-server')}
                          className="rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 shadow-sm transition-all"
                        >
                          {copiedKey === 'code-st3-server' ? 'کپی شد! ✓' : 'کپی کد سرور'}
                        </button>
                      </div>

                      <div className="terminal-window my-1">
                        <div className="terminal-header">
                          <div className="terminal-dots">
                            <span className="terminal-dot terminal-dot-red" />
                            <span className="terminal-dot terminal-dot-yellow" />
                            <span className="terminal-dot terminal-dot-green" />
                          </div>
                          <span className="font-mono text-xs text-[var(--text-muted)]">server.js (JWT Guard)</span>
                        </div>
                        <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono" dir="ltr">
                          <code>{STATION3_SERVER_CODE}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : selectedStationId === 4 ? (
              <>
                {/* تب ۱: متن اصلی درس ایستگاه ۴ با تایپوگرافی خوش‌خوان */}
                {activeTab === 'reader' && activeDoc && (
                  <article className="prose">
                    <Markdown content={activeDoc.content} anchorPrefix="v3-" />
                  </article>
                )}

                {/* تب ۲: جعبه‌ابزار و پیش‌نیازهای Redis و BullMQ */}
                {activeTab === 'toolbox' && (
                  <div className="flex flex-col gap-6 py-2">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-6">
                      <h2 className="text-base font-bold text-[var(--text)] mb-2 flex items-center gap-2">
                        <span>🧰</span>
                        <span>جعبه‌ابزار مأموریت ۴ (کمد حافظه Redis و صف پردازش BullMQ)</span>
                      </h2>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        این سرویس‌ها و پکیج‌ها را آماده کن تا سیستم کش سریع و صف‌های بدون معطلی را در سیستمت داشته باشی:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Redis */}
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm text-[var(--text)]">۱. موتور پایگاه داده Redis ویندوز</h3>
                            <span className="rounded bg-emerald-500/15 text-emerald-500 text-[0.65rem] px-2 py-0.5 font-bold">پورت 6379</span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
                            پایگاه داده درون‌حافظه‌ای RAM برای کش مافوق‌صوت و نگهداری صف‌ها.
                          </p>
                          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2.5 font-mono text-xs text-[var(--primary)] flex items-center justify-between">
                            <span>redis-cli ping</span>
                            <button
                              onClick={() => copyToClipboard('redis-cli ping', 'cmd-redis-ping')}
                              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] font-sans"
                            >
                              {copiedKey === 'cmd-redis-ping' ? 'کپی شد!' : 'کپی'}
                            </button>
                          </div>
                        </div>
                        <a
                          href="https://github.com/tporadowski/redis/releases"
                          target="_blank"
                          rel="noreferrer"
                          className="text-center rounded-xl bg-[var(--surface-2)] hover:bg-[var(--primary)] hover:text-white text-[var(--text)] font-bold text-xs py-2.5 transition-all border border-[var(--border)]"
                        >
                          دانلود فایل زیپ پرتابل ردیس ویندوز ↗
                        </a>
                      </div>

                      {/* ioredis */}
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm text-[var(--text)]">۲. پکیج کلاینت ioredis</h3>
                            <span className="rounded bg-cyan-500/15 text-cyan-500 text-[0.65rem] px-2 py-0.5 font-bold">درایور پرسرعت</span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
                            درایور قدرتمند اتصال پایدار Node.js به سرور ردیس.
                          </p>
                          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2.5 font-mono text-xs text-[var(--text)] flex items-center justify-between">
                            <span>npm install ioredis</span>
                            <button
                              onClick={() => copyToClipboard('npm install ioredis', 'cmd-ioredis')}
                              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] font-sans"
                            >
                              {copiedKey === 'cmd-ioredis' ? 'کپی شد!' : 'کپی'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* BullMQ */}
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between gap-4 md:col-span-2">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm text-[var(--text)]">۳. پکیج موتور صف BullMQ</h3>
                            <span className="rounded bg-amber-500/15 text-amber-500 text-[0.65rem] px-2 py-0.5 font-bold">مدیریت جاب‌ها</span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
                            سیستم صف حرفه‌ای برای اجرای پردازش‌های پس‌زمینه، پیامک و تسک‌های سنگین با قابلیت Retry.
                          </p>
                          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 font-mono text-xs text-[var(--text)] flex items-center justify-between">
                            <span>npm install bullmq</span>
                            <button
                              onClick={() => copyToClipboard('npm install bullmq', 'cmd-bullmq')}
                              className="rounded bg-[var(--surface-3)] px-3 py-1 text-xs font-sans text-[var(--text)] hover:bg-[var(--primary)] hover:text-white"
                            >
                              {copiedKey === 'cmd-bullmq' ? 'کپی شد! ✓' : 'کپی دستور'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* تب ۳: میز تست Bruno */}
                {activeTab === 'bruno' && (
                  <div className="flex flex-col gap-5 py-2">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                      <h2 className="text-sm font-bold text-[var(--text)] mb-1">سناریوهای تست کمد حافظه، Cache Hit/Miss و صف BullMQ</h2>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        این ۵ سناریو را برای مشاهده سرعت زیر ۲ میلی‌ثانیه‌ای کش و رهگیری جاب‌های صف آزمایش کن:
                      </p>
                    </div>

                    <div className="flex flex-col gap-4">
                      {STATION4_BRUNO_TESTS.map((t) => (
                        <div key={t.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-3 shadow-sm">
                          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded px-2 py-0.5 text-xs font-black ${
                                  t.method === 'GET'
                                    ? 'bg-emerald-500/15 text-emerald-500'
                                    : t.method === 'PATCH'
                                    ? 'bg-purple-500/15 text-purple-500'
                                    : 'bg-blue-500/15 text-blue-500'
                                }`}
                              >
                                {t.method}
                              </span>
                              <span className="font-bold text-xs text-[var(--text)]">{t.title}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-[var(--primary)] bg-[var(--surface-2)] px-2 py-1 rounded border border-[var(--border)]">
                              Status: {t.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between bg-[var(--surface-2)] p-2.5 rounded-xl border border-[var(--border)] font-mono text-xs text-[var(--text)]">
                            <span>{t.url}</span>
                            <button
                              onClick={() => copyToClipboard(t.url, `st4-url-${t.id}`)}
                              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] font-sans"
                            >
                              {copiedKey === `st4-url-${t.id}` ? 'کپی شد!' : 'کپی آدرس'}
                            </button>
                          </div>

                          {t.body && (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                                <span>بدنه ارسال (Body - JSON):</span>
                                <button
                                  onClick={() => copyToClipboard(t.body!, `st4-body-${t.id}`)}
                                  className="text-[var(--primary)] hover:underline text-[0.72rem]"
                                >
                                  {copiedKey === `st4-body-${t.id}` ? 'کپی شد! ✓' : 'کپی بدنه'}
                                </button>
                              </div>
                              <pre className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)] font-mono text-xs text-[var(--text)] overflow-x-auto text-left" dir="ltr">
                                <code>{t.body}</code>
                              </pre>
                            </div>
                          )}

                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-[var(--text-muted)]">پاسخ سرور:</span>
                            <pre className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)] font-mono text-xs text-[var(--text-muted)] overflow-x-auto text-left" dir="ltr">
                              <code>{t.expected}</code>
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* تب ۴: کدهای سرور و کارگر صف */}
                {activeTab === 'code' && (
                  <div className="flex flex-col gap-6 py-2">
                    {/* کدهای سرور اصلی */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between bg-[var(--surface-2)] border border-[var(--border)] p-3 rounded-2xl">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-[var(--text)]">۱. کدهای سرور اصلی با کش Redis و صف BullMQ</span>
                          <span className="text-xs text-[var(--text-muted)]">فایل server.js</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(STATION4_SERVER_CODE, 'code-st4-server')}
                          className="rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 shadow-sm transition-all"
                        >
                          {copiedKey === 'code-st4-server' ? 'کپی شد! ✓' : 'کپی کد سرور'}
                        </button>
                      </div>

                      <div className="terminal-window my-1">
                        <div className="terminal-header">
                          <div className="terminal-dots">
                            <span className="terminal-dot terminal-dot-red" />
                            <span className="terminal-dot terminal-dot-yellow" />
                            <span className="terminal-dot terminal-dot-green" />
                          </div>
                          <span className="font-mono text-xs text-[var(--text-muted)]">server.js (Cache & Queue)</span>
                        </div>
                        <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono" dir="ltr">
                          <code>{STATION4_SERVER_CODE}</code>
                        </pre>
                      </div>
                    </div>

                    {/* کدهای کارگر worker.js */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between bg-[var(--surface-2)] border border-[var(--border)] p-3 rounded-2xl">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-[var(--text)]">۲. کدهای کارگر پس‌زمینه (Worker Process)</span>
                          <span className="text-xs text-[var(--text-muted)]">فایل مستقل worker.js (اجرا با node worker.js)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(STATION4_WORKER_CODE, 'code-st4-worker')}
                          className="rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 shadow-sm transition-all"
                        >
                          {copiedKey === 'code-st4-worker' ? 'کپی شد! ✓' : 'کپی کد کارگر'}
                        </button>
                      </div>

                      <div className="terminal-window my-1">
                        <div className="terminal-header">
                          <div className="terminal-dots">
                            <span className="terminal-dot terminal-dot-red" />
                            <span className="terminal-dot terminal-dot-yellow" />
                            <span className="terminal-dot terminal-dot-green" />
                          </div>
                          <span className="font-mono text-xs text-[var(--text-muted)]">worker.js (Background Processor)</span>
                        </div>
                        <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono" dir="ltr">
                          <code>{STATION4_WORKER_CODE}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : selectedStationId === 5 ? (
              <>
                {/* تب ۱: متن اصلی درس ایستگاه ۵ با تایپوگرافی خوش‌خوان */}
                {activeTab === 'reader' && activeDoc && (
                  <article className="prose">
                    <Markdown content={activeDoc.content} anchorPrefix="v3-" />
                  </article>
                )}

                {/* تب ۲: جعبه‌ابزار و پیش‌نیازهای هوش مصنوعی و Zod */}
                {activeTab === 'toolbox' && (
                  <div className="flex flex-col gap-6 py-2">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-6">
                      <h2 className="text-base font-bold text-[var(--text)] mb-2 flex items-center gap-2">
                        <span>🧰</span>
                        <span>جعبه‌ابزار مأموریت ۵ (هوش مصنوعی آفلاین Ollama، SDK و بازرس Zod)</span>
                      </h2>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        این سه ابزار را برای اجرای مدل‌های زبانی روی ویندوز و قفل کردن خروجی‌ها در قالب معتبر JSON آماده کن:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Ollama */}
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm text-[var(--text)]">۱. موتور اجرای مدل زبانی Ollama</h3>
                            <span className="rounded bg-emerald-500/15 text-emerald-500 text-[0.65rem] px-2 py-0.5 font-bold">۱۰۰٪ آفلاین</span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
                            اجرای مدل‌های سبک Llama و Qwen روی ویندوز بدون اینترنت روی پورت ۱۱۴۳۴.
                          </p>
                          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2.5 font-mono text-xs text-[var(--primary)] flex items-center justify-between">
                            <span>ollama run qwen2.5:0.5b</span>
                            <button
                              onClick={() => copyToClipboard('ollama run qwen2.5:0.5b', 'cmd-ollama')}
                              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] font-sans"
                            >
                              {copiedKey === 'cmd-ollama' ? 'کپی شد!' : 'کپی'}
                            </button>
                          </div>
                        </div>
                        <a
                          href="https://ollama.com/download"
                          target="_blank"
                          rel="noreferrer"
                          className="text-center rounded-xl bg-[var(--surface-2)] hover:bg-[var(--primary)] hover:text-white text-[var(--text)] font-bold text-xs py-2.5 transition-all border border-[var(--border)]"
                        >
                          دانلود نرم‌افزار رایگان Ollama ویندوز ↗
                        </a>
                      </div>

                      {/* openai package */}
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm text-[var(--text)]">۲. پکیج رسمی ارتباطی OpenAI</h3>
                            <span className="rounded bg-cyan-500/15 text-cyan-500 text-[0.65rem] px-2 py-0.5 font-bold">استاندارد جهانی</span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
                            کلاینت یکپارچه برای اتصال هم به Ollama لوکال و هم سرویس‌های ابری.
                          </p>
                          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2.5 font-mono text-xs text-[var(--text)] flex items-center justify-between">
                            <span>npm install openai</span>
                            <button
                              onClick={() => copyToClipboard('npm install openai', 'cmd-openai')}
                              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] font-sans"
                            >
                              {copiedKey === 'cmd-openai' ? 'کپی شد!' : 'کپی'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Zod */}
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between gap-4 md:col-span-2">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm text-[var(--text)]">۳. پکیج اعتبارسنجی اسکیما Zod</h3>
                            <span className="rounded bg-amber-500/15 text-amber-500 text-[0.65rem] px-2 py-0.5 font-bold">تایپ‌سیف و بازرسی</span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
                            تضمین این‌که هوش مصنوعی هرگز دیتای ناقص، کلید اشتباه یا فرمت غیرمنتظره به برنامه ندهد.
                          </p>
                          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 font-mono text-xs text-[var(--text)] flex items-center justify-between">
                            <span>npm install zod</span>
                            <button
                              onClick={() => copyToClipboard('npm install zod', 'cmd-zod')}
                              className="rounded bg-[var(--surface-3)] px-3 py-1 text-xs font-sans text-[var(--text)] hover:bg-[var(--primary)] hover:text-white"
                            >
                              {copiedKey === 'cmd-zod' ? 'کپی شد! ✓' : 'کپی دستور'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* تب ۳: میز تست Bruno */}
                {activeTab === 'bruno' && (
                  <div className="flex flex-col gap-5 py-2">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                      <h2 className="text-sm font-bold text-[var(--text)] mb-1">سناریوهای تست تحلیل پیام، استخراج نیت و اعتبارسنجی Zod</h2>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        این ۵ سناریو را برای مشاهده تحلیل هوشمند، تشخیص لحن خشم و خروجی ۱۰۰٪ ساختاریافته آزمایش کن:
                      </p>
                    </div>

                    <div className="flex flex-col gap-4">
                      {STATION5_BRUNO_TESTS.map((t) => (
                        <div key={t.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-3 shadow-sm">
                          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded px-2 py-0.5 text-xs font-black ${
                                  t.method === 'GET' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-blue-500/15 text-blue-500'
                                }`}
                              >
                                {t.method}
                              </span>
                              <span className="font-bold text-xs text-[var(--text)]">{t.title}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-[var(--primary)] bg-[var(--surface-2)] px-2 py-1 rounded border border-[var(--border)]">
                              Status: {t.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between bg-[var(--surface-2)] p-2.5 rounded-xl border border-[var(--border)] font-mono text-xs text-[var(--text)]">
                            <span>{t.url}</span>
                            <button
                              onClick={() => copyToClipboard(t.url, `st5-url-${t.id}`)}
                              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] font-sans"
                            >
                              {copiedKey === `st5-url-${t.id}` ? 'کپی شد!' : 'کپی آدرس'}
                            </button>
                          </div>

                          {t.body && (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                                <span>بدنه ارسال (Body - JSON):</span>
                                <button
                                  onClick={() => copyToClipboard(t.body!, `st5-body-${t.id}`)}
                                  className="text-[var(--primary)] hover:underline text-[0.72rem]"
                                >
                                  {copiedKey === `st5-body-${t.id}` ? 'کپی شد! ✓' : 'کپی بدنه'}
                                </button>
                              </div>
                              <pre className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)] font-mono text-xs text-[var(--text)] overflow-x-auto text-left" dir="ltr">
                                <code>{t.body}</code>
                              </pre>
                            </div>
                          )}

                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-[var(--text-muted)]">پاسخ سرور و هوش مصنوعی:</span>
                            <pre className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)] font-mono text-xs text-[var(--text-muted)] overflow-x-auto text-left" dir="ltr">
                              <code>{t.expected}</code>
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* تب ۴: کدهای سرور متصل به هوش مصنوعی */}
                {activeTab === 'code' && (
                  <div className="flex flex-col gap-6 py-2">
                    <div className="flex items-center justify-between bg-[var(--surface-2)] border border-[var(--border)] p-3 rounded-2xl">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-[var(--text)]">کدهای کامل سرور با اتصال به مدل زبانی و اسکیما Zod</span>
                        <span className="text-xs text-[var(--text-muted)]">فایل server.js (AI Engine Edition)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(STATION5_SERVER_CODE, 'code-st5-server')}
                        className="rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 shadow-sm transition-all"
                      >
                        {copiedKey === 'code-st5-server' ? 'کپی شد! ✓' : 'کپی کد سرور'}
                      </button>
                    </div>

                    <div className="terminal-window my-1">
                      <div className="terminal-header">
                        <div className="terminal-dots">
                          <span className="terminal-dot terminal-dot-red" />
                          <span className="terminal-dot terminal-dot-yellow" />
                          <span className="terminal-dot terminal-dot-green" />
                        </div>
                        <span className="font-mono text-xs text-[var(--text-muted)]">server.js (AI Brain)</span>
                      </div>
                      <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono" dir="ltr">
                        <code>{STATION5_SERVER_CODE}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </>
            ) : selectedStationId === 0 && activeDoc ? (
              <article className="prose">
                <Markdown content={activeDoc.content} anchorPrefix="v3-" />
              </article>
            ) : (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center flex flex-col items-center justify-center gap-4 my-8">
                <span className="text-4xl">🚧</span>
                <h3 className="font-bold text-base text-[var(--text)]">
                  ایستگاه {selectedStationId}: {STATIONS.find((s) => s.id === selectedStationId)?.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-md leading-relaxed">
                  محتوای این ایستگاه در گام بعد اضافه خواهد شد. ابتدا مأموریت ۱ را کامل کن و نتیجه را در عمل بسنج!
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedStationId(1)}
                  className="rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition-all"
                >
                  بازگشت به مأموریت ۱
                </button>
              </div>
            )}
          </div>
        </main>

        {/* ── ستون چپ: سرفصل‌های شناور TOC ── */}
        {tocOpen && headings.length > 0 && activeTab === 'reader' && (
          <aside className="w-64 shrink-0 hidden lg:flex flex-col gap-2 sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3 text-xs font-bold text-[var(--text-muted)]">
                <span>سرفصل‌های بخش</span>
                <button
                  type="button"
                  onClick={() => setTocOpen(false)}
                  className="text-[var(--text-faint)] hover:text-[var(--text)]"
                >
                  ✕
                </button>
              </div>
              <ul className="flex flex-col gap-1.5 text-xs">
                {headings.map((h, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => scrollToHeading(h.id)}
                      className={`text-right text-[0.75rem] transition-colors line-clamp-1 block w-full hover:text-[var(--primary)] ${
                        h.level === 3 ? 'pe-3 text-[var(--text-faint)]' : 'font-semibold text-[var(--text-muted)]'
                      }`}
                    >
                      {h.text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>

      {/* ── مودال تنظیمات کامل ظاهر، رنگ‌ها و قلم ── */}
      {settingsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] shadow-2xl overflow-hidden p-6 flex flex-col gap-5">
            {/* سربرگ مودال */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[var(--text)]">تنظیمات مطالعه و ظاهر</h3>
                <p className="text-[0.72rem] text-[var(--text-faint)]">کنترل کامل روی تم‌ها، فونت، اندازه و خوانایی</p>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
              >
                ✕
              </button>
            </div>

            {/* بخش ۱: تم و پالت رنگی */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[var(--text)]">پالت رنگی و تم:</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                {[
                  { id: 'dark', label: '🌙 تیره مدرن', bg: '#090d16', text: '#f8fafc' },
                  { id: 'sepia', label: '📜 کاغذی / سپیا', bg: '#fbf0d9', text: '#433422' },
                  { id: 'light', label: '☀️ سفید مینیمال', bg: '#f8fafc', text: '#0f172a' },
                  { id: 'nord', label: '❄️ نورد خنک', bg: '#2e3440', text: '#eceff4' },
                  { id: 'monokai', label: '⚡ مونوکای سایبر', bg: '#1e1f1c', text: '#f8f8f2' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, theme: t.id as any }))}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      settings.theme === t.id
                        ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/30 font-bold'
                        : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                    }`}
                    style={{ background: t.bg, color: t.text }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* بخش ۲: انتخاب فونت */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[var(--text)]">قلم (فونت متن):</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                {[
                  { id: 'iransans', label: 'ایران‌سنس' },
                  { id: 'vazirmatn', label: 'وزیرمتن' },
                  { id: 'system', label: 'سیستم (پیش‌فرض)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, fontFamily: f.id as any }))}
                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                      settings.fontFamily === f.id
                        ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)] font-bold'
                        : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* بخش ۳: اندازه قلم و فاصله خطوط */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--text)]">اندازه قلم:</span>
                  <span className="font-mono text-[var(--primary)] font-bold">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="13"
                  max="24"
                  step="1"
                  value={settings.fontSize}
                  onChange={(e) => setSettings((s) => ({ ...s, fontSize: Number(e.target.value) }))}
                  className="w-full accent-[var(--primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--text)]">فاصله خطوط:</span>
                  <span className="font-mono text-[var(--primary)] font-bold">{settings.lineHeight}</span>
                </div>
                <input
                  type="range"
                  min="1.6"
                  max="2.4"
                  step="0.05"
                  value={settings.lineHeight}
                  onChange={(e) => setSettings((s) => ({ ...s, lineHeight: Number(e.target.value) }))}
                  className="w-full accent-[var(--primary)]"
                />
              </div>
            </div>

            {/* بخش ۴: عرض ستون مطالعه */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[var(--text)]">عرض کادر متن (ارگونومی چشم):</label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {[
                  { id: 'compact', label: 'فشرده' },
                  { id: 'standard', label: 'استاندارد' },
                  { id: 'wide', label: 'عریض' },
                  { id: 'full', label: 'تمام‌صفحه' },
                ].map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, readingWidth: w.id as any }))}
                    className={`py-1.5 rounded-lg border text-center transition-all ${
                      settings.readingWidth === w.id
                        ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)] font-bold'
                        : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* دکمه بستن و تایید */}
            <div className="flex justify-end pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-xl bg-[var(--primary)] px-5 py-2 text-xs font-bold text-white shadow hover:opacity-90 transition-all"
              >
                ذخیره و تایید
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
