/**
 * types.ts — انواع مشترک پروژه
 */

/** تم‌های موجود. هر تم یک مجموعه متغیر CSS تعریف می‌کند. */
export type ThemeName =
  | 'light'
  | 'dark'
  | 'sepia' // کاغذ کهنه — برای مطالعه‌ی طولانی
  | 'nord' // تم سرد و کم‌کنتراست
  | 'dracula' // تم تیره با رنگ‌های اشباع
  | 'high-contrast' // برای خوانایی حداکثری
  | 'solarized-light'

/** خانواده‌ی فونت متن. */
export type FontFamily =
  | 'vazir' // وزیرمتن — بهینه برای فارسی
  | 'iransans' // ایران‌سنس
  | 'noto' // Noto Sans Arabic
  | 'system' // فونت سیستم
  | 'serif' // سریف — برای متن بلند
  | 'mono' // مونواسپیس

/** حالت نمایش کد.
 *
 *  ⭐ `'auto'` یعنی «همراهِ تم صفحه حرکت کن»: تم روشن → گیت‌هاب روشن،
 *  تم تیره → گیت‌هاب تاریک. بدون این، کاربرِ تم تیره با کدِ رنگ‌آمیزی‌شده
 *  به رنگ لایت می‌ماند و متن عملاً ناخوانا می‌شود.
 *  بقیه‌ی گزینه‌ها انتخاب صریح کاربر‌اند و روی تم صفحه اثر نمی‌گذارند. */
export type CodeTheme =
  | 'auto'
  | 'github'
  | 'github-dark'
  | 'atom-one-dark'
  | 'vs'
  | 'monokai'

/** تنظیمات کامل کاربر. هر چیزی که UI دارد، اینجا هم هست. */
export interface Settings {
  // ─── متن ───
  /** اندازه‌ی پایه‌ی متن (px). همه‌ی اندازه‌های دیگر نسبت به این است. */
  fontSize: number
  /** فاصله‌ی خطوط (unitless، مثل line-height در CSS) */
  lineHeight: number
  /** فاصله‌ی بین پاراگراف‌ها (em) */
  paragraphSpacing: number
  /** عرض کل محتوا. عدد بزرگ‌تر = خطوط بلندتر و خسته‌کننده‌تر */
  contentWidth: number
  fontFamily: FontFamily
  /** ضخامت فونت (400..700) */
  fontWeight: number
  /** فاصله‌ی حروف (em). برای فارسی گاهی کمی منفی بهتر است */
  letterSpacing: number
  /** تراز متن */
  textAlign: 'right' | 'justify' | 'left' | 'center'
  /** جهت متن (برای مقایسه‌ی چپ‌چین/راست‌چین) */
  direction: 'rtl' | 'ltr'

  // ─── کد ───
  codeFontSize: number
  codeTheme: CodeTheme
  /** نمایش شماره خط در بلوک‌های کد */
  showLineNumbers: boolean
  /** حداکثر عرض بلوک کد؛ اگر true، اسکرول افقی می‌خورد */
  codeWrap: boolean
  /** فاصله‌ی بیرونی بلوک کد (em) */
  codeBlockSpacing: number

  // ─── ظاهر ───
  theme: ThemeName
  /** فاصله‌ی بیرونی محتوا از لبه‌ها */
  contentPadding: number
  /** نمایش جدول‌های محتوا در کنار صفحه */
  showToc: boolean
  /** ⭐ نمایش پنل فلش‌کارت و تمرین هر فاز */
  showStudy: boolean
  /** نمایش نوار ابزار شناور بالا */
  showToolbar: boolean
  /** حاشیه‌ی خطوط جدول */
  tableBorder: boolean

  // ─── رفتار ───
  /** فاصله‌ی ستون‌های جدول برای متن بلند */
  tableLayout: 'auto' | 'fixed'
  /** ارتفاع خط تیره‌ی جداکنندهٔ سرتیترها */
  headingBorder: boolean
}

/** کلیدهای ذخیره در localStorage. */
export const STORAGE_KEY = 'roadmap-reader-settings'

/** دسته‌ی سند در فهرست کنار صفحه.
 *
 *  ⭐ چرا لازم شد؟ دو فایلِ نمایه (اسکلت و نقشه‌ی کامل) قبلاً شماره‌ی ۹۹۹
 *  می‌گرفتند و تهِ فهرست، پشت‌سرهم و بی‌برچسب دیده می‌شدند — کاربر نمی‌دانست
 *  کدام را باید بخواند. حالا هر دسته جدا و با برچسب خودش نمایش داده می‌شود. */
export type DocKind = 'guide' | 'phase' | 'index'

/** یک فاز از نقشه‌ی راه. */
export interface Doc {
  /** نام فایل بدون پسوند، مثلاً «فاز-۰۵-پایگاه‌داده» */
  id: string
  /** شماره‌ی فاز به‌صورت عدد؛ برای نمایه‌ها ۹۹۹ */
  num: number
  /** عنوان استخراج‌شده از خط اول */
  title: string
  /** محتوای خام markdown */
  content: string
  /** مسیر نسبی برای نمایش */
  path: string
  /** دسته‌ی سند — تعیین می‌کند در کدام بخش از فهرست بنشیند */
  kind: DocKind
  /** برچسب کوتاه کنار عنوان در فهرست (مثل «راهنما» یا «نمایه») */
  badge: string
}

// ═══════════════════════════════════════════════════════════════
//  سیستم یادگیری: فلش‌کارت، تمرین، داده‌ی نمونه
// ═══════════════════════════════════════════════════════════════

/**
 * فلش‌کارت بر پایه‌ی «بازیابی فعال» (Active Recall).
 *
 * چرا این روش؟ خواندن دوباره حس یادگیری می‌دهد ولی یادآوری نمی‌سازد.
 * تلاش برای یادآوریِ یک پاسخ، حافظه را چند برابر محکم‌تر می‌کند.
 */
export interface Flashcard {
  /** شماره‌ی کارت در فاز */
  n: number
  /** روی کارت: سوال */
  front: string
  /** پشت کارت: جواب */
  back: string
}

/**
 * داده‌ی ساختگی برای تمرین‌ها.
 * عمداً «واقعی‌نما» است: اسم‌ها و ایمیل‌ها شبیه داده‌ی واقعی‌اند تا تمرین
 * حس واقعی داشته باشد، ولی هیچ‌کدام متعلق به کسی واقعی نیستند.
 */
export interface SampleData {
  /** نام چیزی که این داده است، مثلاً «جدول users» */
  name: string
  /** ستون‌ها */
  columns: string[]
  /** چند ردیف نمونه */
  rows: string[][]
}

/** یک تمرین عملی برای انجام‌دادن. */
export interface Exercise {
  /** عنوان تمرین */
  title: string
  /** صورت مسئله */
  prompt: string
  /** داده‌ی اولیه‌ای که تمرین با آن شروع می‌شود */
  data?: SampleData
  /** نکته‌ی راهنما — نه جواب کامل */
  hint?: string
  /** معیار اتمام: از کجا بفهمم تمام شد */
  done: string
  /** سختی */
  level: 1 | 2 | 3
}

/**
 * وضعیت یادگیری یک کارت — همان چیزی که الگوریتم SM-2 نگه می‌دارد.
 *
 * ⭐ SM-2 بر پایه‌ی منحنی فراموشی ایبنگهوس است:
 * کارتی که سخت بوده زودتر برمی‌گردد، کارتی که آسان بوده دیرتر.
 */
export interface CardProgress {
  /** تعداد مرورهای موفق */
  reps: number
  /** فاصله تا مرور بعدی، بر حسب روز */
  interval: number
  /** ضریب سختی؛ هرچه بزرگ‌تر، فاصله‌ها سریع‌تر رشد می‌کنند */
  ease: number
  /** زمان آخرین مرور */
  due: number
}

/** کلیدهای ذخیره در localStorage. */
export const PROGRESS_KEY = 'roadmap-reader-progress'
export const SAMPLES_KEY = 'roadmap-reader-samples'
export const EXERCISES_KEY = 'roadmap-reader-exercises'

/** کل مجموعه‌ی محتوای یادگیریِ یک فاز. */
export interface StudyContent {
  /** شناسه‌ی فاز */
  docId: string
  cards: Flashcard[]
  exercises: Exercise[]
}
