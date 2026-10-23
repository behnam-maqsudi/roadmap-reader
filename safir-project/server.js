// server.js — نسخه ۳: گام دوم (اتصال به دیتابیس پایدار با Prisma)

// const fastify = require("fastify")({ logger: true });
// const { PrismaClient } = require("@prisma/client");

// // ایجاد نمونه از کلاینت دیتابیس
// const prisma = new PrismaClient();

require("dotenv").config(); // لود کردن متغیرهای محیطی از فایل .env
const fastify = require("fastify")({ logger: true });
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg"); // <--- اضافه شد

// ایجاد کانکشن دیتابیس با آداپتور نسخه 7
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter }); // <--- آداپتور به کلاینت پاس داده شد

// ۱. بررسی وضعیت سلامت و ارتباط با دیتابیس
fastify.get("/health", async (request, reply) => {
  try {
    // یک کوئری بسیار سبک برای تست اتصال زنده دیتابیس
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: "healthy",
      database: "connected (PostgreSQL)",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    reply.status(500);
    return {
      status: "unhealthy",
      database: "disconnected",
      error: err.message,
    };
  }
});

// ۲. مسیر دریافت پیام چت و ذخیره ابدی در پایگاه داده
fastify.post("/api/chat", async (request, reply) => {
  const body = request.body;

  if (!body || !body.message || body.message.trim() === "") {
    reply.status(400);
    return { success: false, error: "متن پیام نمی‌تواند خالی باشد!" };
  }

  const userMessage = body.message.trim();
  const userName = body.name || "کاربر ناشناس";
  const userPhone = body.phone || "09000000000";

  try {
    // الف) اگر مشتری با این شماره قبلاً ثبت نشده، پیدایش کن یا بسازش (upsert)
    const customer = await prisma.customer.upsert({
      where: { phone: userPhone },
      update: { name: userName },
      create: { name: userName, phone: userPhone },
    });

    // ب) پیام کاربر را در جدول پیام‌های دیتابیس ذخیره کن
    const savedUserMsg = await prisma.chatMessage.create({
      data: {
        sender: "کاربر",
        content: userMessage,
        customerId: customer.id,
      },
    });

    // ج) پاسخ دستیار سفیر را تولید و ذخیره کن
    const botReply = `درود ${customer.name}! پیام شما («${userMessage}») در سامانه ثبت شد و در پایگاه داده ذخیره گردید.`;

    const savedBotMsg = await prisma.chatMessage.create({
      data: {
        sender: "سفیر (سیستم)",
        content: botReply,
        customerId: customer.id,
      },
    });

    return {
      success: true,
      customerId: customer.id,
      userMessageId: savedUserMsg.id,
      reply: botReply,
      createdAt: savedBotMsg.createdAt,
    };
  } catch (err) {
    fastify.log.error(err);
    reply.status(500);
    return { success: false, error: "خطا در ذخیره‌سازی داده در پایگاه داده" };
  }
});

// ۳. مسیر استعلام وضعیت سفارش از دیتابیس بر اساس شماره پیگیری
fastify.get("/api/orders/:orderNumber", async (request, reply) => {
  const { orderNumber } = request.params;

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: String(orderNumber) },
      include: {
        customer: {
          select: { name: true, phone: true },
        },
      },
    });

    if (!order) {
      reply.status(404);
      return {
        success: false,
        error: `سفارشی با شماره پیگیری ${orderNumber} در دیتابیس یافت نشد!`,
      };
    }

    return {
      success: true,
      order: {
        number: order.orderNumber,
        item: order.itemTitle,
        status: order.status,
        city: order.city,
        customerName: order.customer.name,
        customerPhone: order.customer.phone,
        updatedAt: order.updatedAt,
      },
    };
  } catch (err) {
    fastify.log.error(err);
    reply.status(500);
    return { success: false, error: "خطا در واکشی اطلاعات سفارش" };
  }
});

fastify.patch("/api/orders/:orderNumber", async (request, reply) => {
  const { orderNumber } = request.params;

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: String(orderNumber) },
    });

    if (!order) {
      reply.status(404);
      return {
        success: false,
        error: `سفارشی با شماره پیگیری ${orderNumber} در دیتابیس یافت نشد!`,
      };
    }

    // Update the order status and other fields here if needed
    await prisma.order.update({
      where: { orderNumber: String(orderNumber) },
      data: {
        status: "تحویل انبار داده شد",
        updatedAt: new Date(), // Assuming you want to update the last updated date
      },
    });

    return {
      success: true,
      message: `سفارش با شماره ${orderNumber} به اتمام رسیده است`,
      order: order,
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      // Handle specific error scenarios
      if (error.code === "P2003") {
        return { success: false, error: "مشتری مورد نظر یافت نشد" };
      }
    }

    fastify.log.error(error);
    reply.status(500);
    return { success: false, error: "خطا در ویرایش سفارش" };
  }
});

// ۴. مسیر ثبت سفارش جدید در دیتابیس (برای تست و اضافه کردن محصول)
fastify.post("/api/orders", async (request, reply) => {
  const { orderNumber, itemTitle, city, customerPhone, customerName } =
    request.body || {};

  if (!orderNumber || !itemTitle || !customerPhone) {
    reply.status(400);
    return {
      success: false,
      error: "شماره سفارش، نام کالا و تلفن مشتری الزامی هستند.",
    };
  }

  try {
    // ۱. پیدا کردن یا ساخت مشتری
    const customer = await prisma.customer.upsert({
      where: { phone: customerPhone },
      update: {},
      create: { name: customerName || "مشتری جدید", phone: customerPhone },
    });

    // ۲. ثبت سفارش متصل به آن مشتری
    const newOrder = await prisma.order.create({
      data: {
        orderNumber: String(orderNumber),
        itemTitle: itemTitle,
        city: city || "نامشخص",
        customerId: customer.id,
      },
    });

    reply.status(201); // 201 Created
    return {
      success: true,
      message: "سفارش با موفقیت در دیتابیس پایدار ذخیره شد.",
      order: newOrder,
    };
  } catch (err) {
    if (err.code === "P2002") {
      reply.status(409); // Conflict - تکراری
      return {
        success: false,
        error: "این شماره سفارش قبلاً در دیتابیس ثبت شده است!",
      };
    }
    fastify.log.error(err);
    reply.status(500);
    return { success: false, error: "خطای سیستمی در ثبت سفارش" };
  }
});

// ۵. روشن کردن موتور سرور روی پورت ۳۰۰۰
const startServer = async () => {
  try {
    const address = await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log(
      `\n🚀 سرور سفیر با اتصال زنده به دیتابیس روی ${address} بیدار شد!\n`,
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();
