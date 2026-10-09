/**
 * Markdown.tsx — رندرر markdown
 *
 * نکته‌ی امنیتی مهم:
 * فایل‌های این پروژه داخلشان مثال <script> دارند (برای آموزش XSS).
 * به همین دلیل rehypeRaw را فعال می‌کنیم تا HTML واقعی رندر شود،
 * و در عین حال highlight.js روی pre>code اجرا می‌شود.
 *
 * چون محتوا فایل‌های محلی خودمان است (نه ورودی کاربر)،
 * اجرای اسکریپت خطری ندارد و برای نمایش درست مثال‌ها لازم است.
 */

import { isValidElement, memo, useMemo, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import type { Settings } from './types'
import { extractHeadings } from './slug'

/** فهرست زبان‌هایی که هایلایت را برایشان می‌خواهیم. */
const LANG_ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  tsx: 'typescript',
  jsx: 'javascript',
  'c++': 'cpp',
  golang: 'go',
  ps1: 'powershell',
}

/** تبدیل نام زبان به نامی که highlight.js می‌شناسد. */
function normalizeLang(lang: string | undefined): string | undefined {
  if (!lang) return undefined
  const key = lang.toLowerCase()
  return LANG_ALIASES[key] ?? key
}

/**
 * استخراج شماره‌ی خط: هر خط کد یک <span> می‌شود.
 * اگر کاربر شماره خط را روشن کرده باشد.
 */
function CodeBlock({
  children,
  className,
  showLineNumbers,
  wrap,
}: {
  children: ReactNode
  className?: string
  showLineNumbers: boolean
  wrap: boolean
}) {
  const langMatch = /language-(\w+)/.exec(className ?? '')
  const lang = langMatch?.[1]

  if (showLineNumbers && typeof children === 'string') {
    const lines = children.split('\n')
    // اگر آخرین خط خالی است (معمولاً به‌خاطر \n انتهایی)، حذفش کن
    if (lines[lines.length - 1] === '') lines.pop()

    return (
      <div className="code-block">
        {lang && <span className="code-lang">{lang}</span>}
        <pre className={wrap ? 'wrap' : undefined}>
          <code className={`code-lines ${className ?? ''}`}>
            {lines.map((line, i) => (
              <span className="code-line" key={i}>
                {line || ' '}
              </span>
            ))}
          </code>
        </pre>
      </div>
    )
  }

  return (
    <div className="code-block">
      {lang && <span className="code-lang">{lang}</span>}
      <pre className={wrap ? 'wrap' : undefined}>
        <code className={className}>{children}</code>
      </pre>
    </div>
  )
}

/** متن قابل‌مشاهده‌ی یک درخت React — فقط برای تشخیص، نه برای نمایش. */
function extractText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (isValidElement(node))
    return extractText((node as { props?: { children?: ReactNode } }).props?.children)
  return ''
}

/**
 * ⭐⭐ جدولِ نگاشتِ «سطرِ سرتیتر ← شناسه».
 *
 * این تنها منبعِ حقیقت است. فهرستِ کنارِ صفحه (`App.tsx`) و رندرر (همین
 * فایل) **هر دو** از همین جدول می‌خوانند، پس جدا افتادنشان ممکن نیست.
 *
 * ⭐⭐ چرا این ساختار، و نه یک شمارندهٔ مشترک؟
 *
 * چون **رندر باید خالص باشد**. نسخهٔ قبل شمارنده را در حین رندر زیاد می‌کرد:
 * هر `Heading` که ساخته می‌شد `nextSlug(text, seen)` را صدا می‌زد و `seen`
 * را عوض می‌کرد. ولی `StrictMode` — که در `main.tsx` هست — رندرِ هر
 * کامپوننت را **دو بار** اجرا می‌کند. پس هر سرتیتر شمارنده را دو بار مصرف
 * می‌کرد و `-1` می‌گرفت، در حالی که فهرستِ کنارِ صفحه چنین پسوندی نداشت:
 *
 *     فهرست:  #۱-از-کجا-شروع-کنم
 *     صفحه:   H2#۱-از-کجا-شروع-کنم-1
 *
 * `getElementById` شکست می‌خورد و کلیک بی‌صدا از کار می‌افتاد.
 *
 * جایگزین: react-markdown به هر سرتیتر `node.position.start.line` می‌دهد،
 * و این شمارهٔ سطر در هر رندری **دقیقاً یکی** است — چه یک بار رندر شود، چه
 * هزار بار. پس یک بار برایِ متن، جدول را می‌سازیم و بعد فقط نگاه می‌کنیم.
 */
function buildHeadingTable(markdown: string): Map<number, string> {
  const byLine = new Map<number, string>()
  for (const h of extractHeadings(markdown)) byLine.set(h.line, h.id)
  return byLine
}

/**
 * ⭐ سرتیترِ دارای لنگر.
 *
 * سه کار می‌کند که بدون آن‌ها فهرستِ کنار صفحه کار نمی‌کند:
 *   ۱) `id` می‌گذارد تا لینکِ `#…` آن را پیدا کند
 *   ۲) تکراری‌ها را با شماره از هم جدا می‌کند (از جدول، نه شمارندهٔ مشترک)
 *   ۳) سرتیترِ هدف را زیرِ نوار ابزار قاپ می‌دهد، وگرنه تا وقتی کاربر اسکرول
 *      دستی نکند، سرتیتر زیرِ نوارِ بالای صفحه گم می‌شود
 */
function Heading({
  level,
  children,
  id: providedId,
  node,
  headings,
  ...props
}: {
  level: 1 | 2 | 3
  children: ReactNode
  id?: string
  node?: { position?: { start?: { line?: number } } }
  /** جدولِ سطر←شناسه که `MarkdownImpl` ساخته است */
  headings: Map<number, string>
} & Record<string, unknown>) {
  const Tag = `h${level}` as const
  const line = node?.position?.start?.line
  const id = providedId ?? (typeof line === 'number' ? headings.get(line) : undefined)

  // اگر سطر را پیدا نکردیم، بی‌صدا لنگرِ غلط نساز — ولی چراغش را روشن کن
  if (id === undefined) {
    console.warn(
      `[سرتیتر] سطر ${String(line)} در جدولِ شناسه‌ها نبود ` +
        `(متن: «${extractText(children).slice(0, 40)}»)`,
    )
  }

  return (
    <Tag
      {...props}
      id={id}
      className={
        typeof props.className === 'string' ? props.className : undefined
      }
    >
      {children}
    </Tag>
  )
}

/**
 * ⭐ تشخیص بلوک داستان.
 *
 * داستان‌ها با ایموجی 🧒 شروع می‌شوند. چون متن فارسی راست‌چین است، این
 * ایموجی همیشه اولین چیزی است که در پاراگرافِ اول می‌آید. پس کافی است
 * نگاه کنیم آیا فرزند اول بلاک با همان ایموجی شروع می‌شود یا نه.
 *
 * نکته‌ی مهم: `children` یک درخت React است، نه رشته — پس نمی‌شود با
 * `startsWith` مستقیم چک کرد. به همین دلیل متن قابل‌مشاهده را از درخت
 * بیرون می‌کشیم و بعد تصمیم می‌گیریم.
 */
function isStoryBlock(children: ReactNode): boolean {
  const text = extractText(children).trimStart()
  return text.startsWith('🧒')
}

interface MarkdownProps {
  content: string
  settings: Settings
}

function MarkdownImpl({ content, settings }: MarkdownProps) {
  /**
   * rehypeHighlight همیشه فعال است، ولی با گزینه‌ی detect مرکلی می‌شود
   * تا زبان‌های ناشناخته هم رنگ شوند.
   */
  const highlightOptions = useMemo(
    () => ({
      detect: true,
      ignoreMissing: true,
    }),
    [],
  )

  /**
   * ⭐⭐ جدولِ شناسه‌ها — یک بار برایِ همین متن، بعد فقط خواندن.
   *
   * وابستگی‌اش `content` است، نه `settings`: با عوض کردنِ فونت یا شماره‌خط،
   * شناسه‌ها نباید دوباره ساخته شوند (و اگر ساخته شوند، باید **یکی** باشند).
   * محاسبه‌اش ارزان است و فقط با متن عوض می‌شود، پس `useMemo` بی‌ضرر است.
   */
  const headings = useMemo(() => buildHeadingTable(content), [content])

  /**
   * تعریف کامپوننت‌های markdown.
   * rehype-highlight قبلاً کلاس‌های hljs-* را روی spanها گذاشته؛
   * اینجا فقط ظاهر بیرونی را تنظیم می‌کنیم.
   */
  const components = useMemo<Partial<Components>>(
    () => ({
      pre: ({ children }) => <>{children}</>,

      /**
       * ⭐ سرتیترها `id` می‌گیرند تا فهرستِ کنار صفحه کار کند.
       *
       * این سه کامپوننت از یک سازندهٔ مشترک استفاده می‌کنند تا شناسهٔ
       * یکسان، شمارشِ تکراری‌ها، و رفتارِ اسکرول در هر سه یکی باشد.
       */
      h1: ({ children, node, ...props }) => (
        <Heading level={1} node={node} headings={headings} {...props}>
          {children}
        </Heading>
      ),
      h2: ({ children, node, ...props }) => (
        <Heading level={2} node={node} headings={headings} {...props}>
          {children}
        </Heading>
      ),
      h3: ({ children, node, ...props }) => (
        <Heading level={3} node={node} headings={headings} {...props}>
          {children}
        </Heading>
      ),

      code: ({ className, children, ...props }) => {
        // اگر والد <pre> باشد، بلوک کد است؛ در غیر این صورت کد درون‌خطی
        const isBlock = className?.includes('language-') ?? false

        if (isBlock) {
          return (
            <CodeBlock
              className={className}
              showLineNumbers={settings.showLineNumbers}
              wrap={settings.codeWrap}
            >
              {children}
            </CodeBlock>
          )
        }

        return (
          <code className={className} {...props}>
            {children}
          </code>
        )
      },

      // جدول‌ها: کلاس مشخص برای استایل‌دهی بهتر
      table: ({ children, ...props }) => (
        <table className={settings.tableBorder ? 'with-border' : ''} {...props}>
          {children}
        </table>
      ),

      /**
       * ⭐ بلوک داستان.
       *
       * در متن، داستان با `> 🧒 **داستان این بخش:** ...` یا
       * `> 🧒 **داستان:** ...` نوشته می‌شود. چون متن فارسی است، ایموجی
       * اولین چیزی است که در پاراگراف می‌آید — پس تشخیصش با شروع‌شدنِ
       * فرزند اول از `🧒` ممکن است، و این کار اجازه می‌دهد بلاک را
       * جدا از نقل‌قول معمولی استایل بدهیم.
       *
       * چرا مهم است؟ چون خواننده باید بفهمد «این داستان است، نه تعریف».
       * مرزِ بصریِ این دو، تنها چیزی است که متن را از حالت تیتر‌وار
       * درمی‌آورد.
       */
      blockquote: ({ children, ...props }) => {
        // پاراگراف اول: اگر با 🧒 شروع شود، این بلاک «داستان» است
        const isStory = isStoryBlock(children)

        return (
          <blockquote {...props} className={isStory ? 'story' : undefined}>
            {isStory ? <span className="story-label" /> : null}
            {children}
          </blockquote>
        )
      },

      // لینک‌های بیرونی در تب جدید باز شوند
      a: ({ href, children, ...props }) => {
        const external = href?.startsWith('http')
        return (
          <a
            href={href}
            {...props}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {children}
          </a>
        )
      },
    }),
    // ⭐⭐ وابستگی‌ها اینجا **کامل** هستند و این خودش نیمی از درستیِ کار است.
    //
    // `components` داخلِ خودش `headings` را می‌بندد. اگر `headings` در
    // وابستگی‌ها نبود، با عوض کردنِ فاز، React بستهٔ کهنه را نگه می‌داشت و
    // سرتیترهای فازِ جدید با جدولِ فازِ قبلی شماره‌گذاری می‌شدند.
    //
    // (این باگ را قبلاً داشتیم و درست شد؛ ولی ریشهٔ اصلیِ به‌هم‌ریختگیِ
    // لنگرها آن بود، نه این. آن یکی جداگانه در `Heading` حل شد.)
    [headings, settings.showLineNumbers, settings.codeWrap, settings.tableBorder],
  )

  return (
    <div className="prose" dir={settings.direction}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeHighlight, highlightOptions]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export const Markdown = memo(MarkdownImpl)

export { normalizeLang }