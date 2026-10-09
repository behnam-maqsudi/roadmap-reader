/**
 * Markdown.tsx — رندررِ نسخهٔ ۲
 *
 * ⭐⭐ قاعدهٔ طلایی: شناسهٔ سرتیترها از **همان** تابعی می‌آید که نسخهٔ ۱
 * استفاده می‌کند.
 *
 * یعنی `extractHeadings` را از `../slug` import می‌کنیم — عیناً همان فایلی که
 * فهرستِ کنارِ صفحهٔ نسخهٔ ۱ و تست‌هایش (`آزمایش-لنگر`) به آن تکیه می‌کنند.
 * اگر اینجا منطقِ تازه‌ای می‌نوشتیم، فهرست و متن جدا می‌افتادند و کلیک روی
 * سرتیتر بی‌صدا از کار می‌افتاد — همان باگی که قبلاً داشتیم.
 *
 * ⚠️ `extractHeadings` همچنان در `src/slug.js` می‌ماند و **دست نمی‌خورد**؛
 * فقط import می‌شود.
 */

import { isValidElement, memo, useMemo, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import { extractHeadings } from '../slug'
import { detectCallout, splitTitle } from './callout'

/** متنِ قابل‌مشاهدهٔ یک درخت React — برای تشخیص، نه نمایش. */
function textOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement(node))
    return textOf((node as { props?: { children?: ReactNode } }).props?.children)
  return ''
}

/**
 * ⭐⭐ ساختِ جدولِ «سطر ← شناسه» برای سرتیترها.
 *
 * چرا با `node.position.start.line` و نه یک شمارندهٔ مشترک؟ چون رندر باید
 * **خالص** باشد. `StrictMode` رندر را دو بار اجرا می‌کند؛ اگر شمارنده در
 * حین رندر زیاد شود، هر سرتیتر شماره را دو بار مصرف می‌کند و شناسه‌هایش با
 * فهرستِ کنار صفحه نمی‌خواند. شمارهٔ سطر در هر رندری دقیقاً یکی است.
 *
 * ⭐⭐⭐ چرا `prefix`؟
 *
 * `extractHeadings` فقط **داخلِ یک سند** تکراری‌ها را شماره‌گذاری می‌کند.
 * ولی در چیدمانِ آکاردئونی، چند فاز هم‌زمان بازند و هرکدام سرتیترِ
 * «منابع» و «جمع‌بندی» دارند. بدون پیشوند، ده تا `id="منابع"` در صفحه می‌شد و
 * `getElementById` همیشه **اولی** را برمی‌گرداند — یعنی فهرستِ هر فاز به
 * سرتیترِ فازِ اول می‌پرید. پیشوند، شناسه را سراسری یکتا می‌کند.
 *
 * پیشوند از خودِ سند می‌آید (نه از شمارنده‌ای که در رندر زیاد می‌شود)، پس
 * رندرِ دوباره دقیقاً همان شناسه‌ها را می‌سازد و لنگرها نمی‌شکنند.
 */
function buildHeadingTable(markdown: string, prefix: string): Map<number, string> {
  const byLine = new Map<number, string>()
  for (const h of extractHeadings(markdown)) byLine.set(h.line, `${prefix}${h.id}`)
  return byLine
}

function Heading({
  level,
  children,
  id,
  node,
  headings,
}: {
  level: 1 | 2 | 3 | 4
  children: ReactNode
  id?: string
  node?: { position?: { start?: { line?: number } } }
  headings: Map<number, string>
}) {
  const Tag = `h${level}` as const
  const line = node?.position?.start?.line
  const anchor = id ?? (typeof line === 'number' ? headings.get(line) : undefined)

  if (anchor === undefined) {
    console.warn(
      `[v2 سرتیتر] سطر ${String(line)} در جدولِ شناسه‌ها نبود ` +
        `(متن: «${textOf(children).slice(0, 40)}»)`,
    )
  }

  return (
    <Tag id={anchor}>
      {children}
      {anchor && level >= 2 && level <= 3 && (
        // ⭐ لنگرِ قابل‌کلیک، تا خواننده بتواند نشانیِ همین بخش را بردارد
        <a href={`#${anchor}`} className="heading-anchor" aria-label="پیوند به این بخش">
          #
        </a>
      )}
    </Tag>
  )
}

/**
 * ⭐⭐ تشخیصِ نمودارِ متنی.
 *
 * در محتوا ۱۸ بلوک ```text وجود دارد که نمودارِ جریان و معماری‌اند (مثل
 * نمودارِ Circuit Breaker). در نسخهٔ ۱ اینها فقط متنِ مونواسپیسِ یکدست بودند
 * و با کدِ واقعی قاطی می‌شدند.
 *
 * تشخیص: خطِ اولِ بلوک شامل پیکان (`→ ← ↔ ↓ ↑`) یا خط‌کش (`─ ━ │ ├ └`)
 * باشد. اینها در کدِ واقعیِ درس تقریباً نیستند، ولی در نمودار هست.
 */
function looksLikeDiagram(text: string): boolean {
  const head = text.split('\n').slice(0, 3).join('\n')
  return /[→←↔↑↓▸▹▶]|[─━│┌┐└┘├┤┬┴┼]/.test(head)
}

/**
 * ⭐⭐ کارتِ آموزشی — قلبِ «جذاب‌تر شدنِ» نسخهٔ ۲.
 *
 * اینجا همان چیزی است که در نسخهٔ ۱ نبود: هر نقل‌قولِ ایموجی‌دار (🧒 💡 🔑 ⚠️
 * 🔴 ⛔ …) به‌جای یک بلوکِ خاکستریِ بی‌هویت، یک **کارتِ رنگی با تیتر**
 * می‌شود. خواننده با یک نگاه می‌فهمد این «نکته» است یا «هشدار» یا
 * «اشتباه مرگبار».
 *
 * ساختار:
 *   <aside class="callout callout-note">
 *     <div class="callout-icon">💡</div>
 *     <div>
 *       <span class="callout-title">قاعدهٔ کلیدی</span>
 *       <div class="callout-body">…</div>
 *     </div>
 *   </aside>
 */
function Callout({
  kind,
  label,
  icon,
  title,
  children,
}: {
  kind: string
  label: string
  icon: string
  title: string | null
  children: ReactNode
}) {
  return (
    <aside className={`callout callout-${kind}`}>
      <div className="callout-icon" aria-hidden>
        {icon}
      </div>
      <div className="min-w-0">
        <span className="callout-title">{title ?? label}</span>
        <div className="callout-body">{children}</div>
      </div>
    </aside>
  )
}

function MarkdownImpl({ content, anchorPrefix = '' }: { content: string; anchorPrefix?: string }) {
  const highlightOptions = useMemo(() => ({ detect: true, ignoreMissing: true }), [])
  const headings = useMemo(
    () => buildHeadingTable(content, anchorPrefix),
    [content, anchorPrefix],
  )

  const components = useMemo<Partial<Components>>(
    () => ({
      // `pre` را حذف می‌کنیم تا `code` بتواند خودش ظرفِ کامل را بسازد
      pre: ({ children }) => <>{children}</>,

      h1: ({ children, node }) => (
        <Heading level={1} node={node} headings={headings}>
          {children}
        </Heading>
      ),
      h2: ({ children, node }) => (
        <Heading level={2} node={node} headings={headings}>
          {children}
        </Heading>
      ),
      h3: ({ children, node }) => (
        <Heading level={3} node={node} headings={headings}>
          {children}
        </Heading>
      ),
      h4: ({ children, node }) => (
        <Heading level={4} node={node} headings={headings}>
          {children}
        </Heading>
      ),

      code: ({ className, children }) => {
        const lang = /language-(\w+)/.exec(className ?? '')?.[1]
        const isBlock = Boolean(lang)

        if (!isBlock) {
          return <code className="code-inline">{children}</code>
        }

        const raw = textOf(children).replace(/\n$/, '')
        const isDiagram = lang === 'text' && looksLikeDiagram(raw)

        // ⭐ نمودارِ متنی: ظاهرِ جدا، با برچسب، تا معلوم باشد «این را باید کشید»
        if (isDiagram) {
          return (
            <figure className="diagram">
              <figcaption className="diagram-label">نمودار</figcaption>
              <pre>
                <code className={className}>{children}</code>
              </pre>
            </figure>
          )
        }

        return (
          <div className="code-block">
            {lang && lang !== 'text' && (
              <span className="absolute top-1.5 end-2 text-[0.7rem] font-semibold text-faint select-none">
                {lang}
              </span>
            )}
            <pre>
              <code className={className}>{children}</code>
            </pre>
          </div>
        )
      },

      /**
       * ⭐⭐ نقطهٔ اصلی: نقل‌قول → کارتِ آموزشی.
       *
       * اول متنِ قابل‌مشاهده را درمی‌آوریم (چون `children` درختِ React است،
       * نه رشته، پس `startsWith` مستقیم کار نمی‌کند)، بعد نوعِ کارت را
       * تشخیص می‌دهیم. اگر کارت بود، تیتر را جدا و بدنه را رندر می‌کنیم.
       *
       * اگر کارت نبود، `plain` برمی‌گردانیم و همان ظاهرِ نقل‌قولِ معمولی
       * حفظ می‌شود — پس هیچ متنی در نسخهٔ ۲ گم یا بدشکل نمی‌شود.
       */
      blockquote: ({ children }) => {
        const text = textOf(children)
        const spec = detectCallout(text)

        if (!spec) {
          return <blockquote>{children}</blockquote>
        }

        const emojiMatch = text.trimStart().match(
          /^[\s\u{200B}]*([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F000}-\u{1F0FF}][\u{FE0F}\u{20E3}️‍\u{1F3FB}-\u{1F3FF}]*)/u,
        )
        const icon = emojiMatch?.[1] ?? '•'

        // ⭐ تیتر از `**…:**` جدا می‌شود تا کارت عنوانِ واقعی داشته باشد،
        // ولی اگر متن تیتر نداشت، عنوانِ پیش‌فرضِ همان نوع می‌آید.
        const { title, rest } = splitTitle(restWithoutEmoji(text, emojiMatch))
        const body = rest.trim() ? renderBody(rest) : children

        return (
          <Callout kind={spec.kind} label={spec.label} icon={icon} title={title}>
            {body}
          </Callout>
        )
      },

      // لینک بیرونی در تب تازه باز می‌شود
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
    [headings],
  )

  return (
    <div className="prose" dir="rtl">
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

/** حذفِ ایموجیِ اول از متن، تا `splitTitle` روی متنِ درست کار کند. */
function restWithoutEmoji(text: string, m: RegExpMatchArray | null): string {
  if (!m) return text
  return text.trimStart().slice(m[0].length)
}

/**
 * رندرِ بدنهٔ کارت از روی متنِ بدونِ تیتر.
 *
 * چرا دوباره markdown را اجرا می‌کنیم؟ چون `children` درختِ Reactِ آماده
 * است و تیتر از آن بیرون کشیده شده — ولی درخت، متنِ خام ندارد که بتوان
 * دوباره از آن markdown ساخت. پس تنها راه، رندرِ دوبارهٔ همان متن است.
 * `components` خالی است تا بلوکِ تازه، استایلِ پیش‌فرضِ markdown را بگیرد
 * و دوباره وارد حالتِ کارتش نشود (بازگشتِ بی‌نهایت).
 */
function renderBody(rest: string): ReactNode {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        p: ({ children: c }) => <p>{c}</p>,
      }}
    >
      {rest}
    </ReactMarkdown>
  )
}

export const Markdown = memo(MarkdownImpl)