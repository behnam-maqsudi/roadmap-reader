// server.js — سنگ‌بنای پروژه سفیر (نسخه ۳: گام اول)

// ۱. فراخوانی فریم‌ورک Fastify همراه با فعال‌سازی لاگر رنگی
const fastify = require("fastify")({
  logger: true, // تمام درخواست‌های رسیده را در ترمینال چاپ می‌کند
});

// ۲. مسیر تست سلامت (Health Check): آیا سرور بیدار است؟
fastify.get("/health", async (request, reply) => {
  return {
    status: "healthy",
    service: "Safir Core Assistant",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
});

// ۳. مسیر دریافت پیام چت از مشتری (Chat Endpoint)
fastify.post("/api/chat", async (request, reply) => {
  const body = request.body;

  // اعتبارسنجی ساده: آیا پیامی ارسال شده است؟
  if (!body || !body.message || body.message.trim() === "") {
    reply.status(400); // خطای اشتباه مشتری
    return {
      success: false,
      error: "متن پیام نمی‌تواند خالی باشد!",
    };
  }

  const userMessage = body.message;
  const userName = body.name || "کاربر گرامی";

  // در این فاز پاسخ تلفنچی شبیه‌سازی می‌شود تا بعداً در فاز ۵ به مغز LLM وصل شود
  const botReply = `درود ${userName}! پیام شما («${userMessage}») در سامانه سفیر دریافت شد. هم‌اکنون در حال بررسی درخواستت هستم.`;

  return {
    success: true,
    reply: botReply,
    receivedAt: new Date().toISOString(),
  };
});

// ۴. مسیر استعلام وضعیت سفارش بر اساس شماره (GET with URL Parameter)
fastify.get("/api/orders/:id", async (request, reply) => {
  const orderId = request.params.id;

  // دیتابیس ساختگی موقت برای تمرین فاز اول
  const fakeDatabase = {
    101: { item: "هدفون گیمینگ", status: "تحویل پست داده شد", city: "تهران" },
    102: {
      item: "کتاب طراحی سیستم",
      status: "در حال بسته‌بندی در انبار",
      city: "اصفهان",
    },
    103: {
      item: "ماگ سفالی برنامه‌نویسی",
      status: "تحویل داده شده به خریدار",
      city: "شیراز",
    },
  };

  const foundOrder = fakeDatabase[orderId];

  if (!foundOrder) {
    reply.status(404);
    return {
      success: false,
      error: `سفارشی با شناسه ${orderId} پیدا نشد!`,
    };
  }

  return {
    success: true,
    orderId: orderId,
    details: foundOrder,
  };
});

fastify.post("/api/orders/:id/cancel", async (req, reply) => {
  const orderId = req.params.id;
  const fakeDatabase = {
    101: { item: "هدفون گیمینگ", status: "تحویل پست داده شد", city: "تهران" },
    102: {
      item: "کتاب طراحی سیستم",
      status: "در حال بسته‌بندی در انبار",
      city: "اصفهان",
    },
    103: {
      item: "ماگ سفالی برنامه‌نویسی",
      status: "تحویل داده شده به خریدار",
      city: "شیراز",
    },
  };

  const foundOrder = fakeDatabase[orderId];

  if (!foundOrder) {
    reply.status(404);
    return {
      success: false,
      error: `سفارشی با شناسه ${orderId} پیدا نشد!`,
    };
  }

  fakeDatabase[orderId].status = "لغو شده";

  return {
    success: true,
    message: `سفارش ${orderId} به دلیل «انصراف از خرید» لغو گردید.`,
    data: fakeDatabase[orderId],
  };
});

fastify.post("/api/chat-messages", async (req, replay) => {
  const defaultAnswers = [
    "پیام شما به واحد پشتیبانی ارجاع شد.",
    "سفیر در حال بررسی درخواست شما در پایگاه انبار است.",
    "از شکیبایی شما سپاسگزاریم، نتیجه به زودی ارسال می‌شود.",
  ];

  return {
    success: true,
    message: defaultAnswers[Math.floor(Math.random() * 3)],
  };
});

// ۵. روشن کردن موتور سرور روی پورت ۳۰۰۰
const startServer = async () => {
  try {
    const address = await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log(
      `\n🚀 سرور سفیر با موفقیت روی آدرس ${address} به پرواز درآمد!\n`,
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();
