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
import { nextSlug } from './slug'

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
                {line || ' '}
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

/**
 * ⭐ سرتیترِ دارای لنگر.
 *
 * سه کار می‌کند که بدون آن‌ها فهرستِ کنار صفحه کار نمی‌کند:
 *   ۱) `id` می‌گذارد تا لینکِ `#…` آن را پیدا کند
 *   ۲) تکراری‌ها را با شماره از هم جدا می‌کند
 *   ۳) سرتیترِ هدف را زیرِ نوار ابزار قاپ می‌دهد، وگرنه تا وقتی کاربر اسکرول
 *      دستی نکند، سرتیتر زیرِ نوارِ بالای صفحه گم می‌شود
 */
function Heading({
  level,
  seen,
  children,
  id: providedId,
  ...props
}: {
  level: 1 | 2 | 3
  seen: Map<string, number>
  children: ReactNode
  id?: string
} & Record<string, unknown>) {
  const Tag = `h${level}` as const
  const text = extractText(children)
  const id = providedId ?? nextSlug(text, seen)

  return (
    <Tag
      {...props}
      id={id}
      className={
        typeof props.className === 'string'
          ? props.className
          : undefined
      }
    >
      {children}
    </Tag>
  )
}

interface MarkdownProps {
  content: string
  settings: Settings
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

/** متن قابل‌مشاهده‌ی یک درخت React — فقط برای تشخیص، نه برای نمایش. */
function extractText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (isValidElement(node)) return extractText((node as { props?: { children?: ReactNode } }).props?.children)
  return ''
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
   * ⭐ شمارنده‌ی سرتیترهای تکراری، به ترتیبِ ظهور در همین سند.
   *
   * چرا به‌جای ماژولی؟ چون هر سند شمارشِ خودش را دارد. اگر ماژولی بود،
   * با عوض کردن فاز، شمارنده‌های فاز قبل می‌ماندند و لنگرهای فاز جدید
   * عددهای بی‌ربط می‌گرفتند.
   */
  const seenSlugs = useMemo(() => new Map<string, number>(), [content])

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
       * این سه کامپوننت قبلاً نداشتند و فهرستِ کنار صفحه غیرکاربردی بود:
       * کاربر روی سرتیتر می‌زد و هیچ اتفاقی نمی‌افتاد، چون مرورگر دنبالِ
       * عنصری می‌گشت که اصلاً در صفحه نبود.
       *
       * هر سه از یک سازنده‌ی مشترک استفاده می‌کنند تا شناسه‌ی یکسان،
       * شمارشِ تکراری‌ها، و رفتارِ اسکرول در هر سه یکی باشد.
       */
      h1: ({ children, ...props }) => <Heading level={1} seen={seenSlugs} {...props}>{children}</Heading>,
      h2: ({ children, ...props }) => <Heading level={2} seen={seenSlugs} {...props}>{children}</Heading>,
      h3: ({ children, ...props }) => <Heading level={3} seen={seenSlugs} {...props}>{children}</Heading>,

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
    [settings.showLineNumbers, settings.codeWrap, settings.tableBorder],
  )

  return (
    <div className="prose" dir={settings.direction}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeHighlight, highlightOptions],
        ]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export const Markdown = memo(MarkdownImpl)

export { normalizeLang }
