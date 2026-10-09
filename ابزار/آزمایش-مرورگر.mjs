/**
 * آزمایش-مرورگر.mjs — آیا کلیک روی فهرست، در مرورگرِ واقعی اسکرول می‌کند؟
 *
 * ⭐⭐ چرا این ابزار وجود دارد؟
 *
 * همهٔ تست‌های دیگر روی `renderToStaticMarkup` کار می‌کنند — یعنی متن را
 * به رشته تبدیل می‌کنند و انتزاعی بررسیش می‌کنند. ولی **هیچ‌کدام مرورگر را
 * روشن نمی‌کنند**. یعنی این‌ها نمی‌گویند:
 *
 *   - لنگرها واقعاً در DOM هستند یا فقط در یک رشته؟
 *   - کلیکِ واقعی (با رویدادِ مرورگر) اسکرول می‌کند یا نه؟
 *   - سرتیتر بعد از اسکرول، زیرِ نوارِ چسبان گم نشده؟
 *   - `StrictMode` رندر را دوبار اجرا می‌کند — و شناسه‌ها را خراب می‌کند؟
 *
 * این ابزار دقیقاً همان چیزی را می‌سنجد که کاربر می‌بیند.
 *
 * ⭐ چرا Chrome را مستقیم می‌راند و نه با یک کتابخانه؟
 *
 * چون پروژه هیچ وابستگیِ جدیدی نباید اضافه کند. Chrome خودش پروتکلِ
 * `devtools` را روی یک پورت باز می‌کند؛ با `WebSocket` (که در Node ۲۴ هست)
 * می‌شود مستقیم فرمان داد. این کار نه `puppeteer` می‌خواهد، نه `playwright`.
 */

import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
]

const APP_URL = process.argv[2] ?? 'http://localhost:5174/'
const DEBUG_PORT = 9411

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** راه‌اندازیِ Chrome و برگرداندنِ نشانیِ صفحه. */
async function launch() {
  const exe = CHROME_CANDIDATES.find((p) => existsSync(p))
  if (!exe) {
    console.error(
      '❌ Chrome پیدا نشد. مسیرهای امتحان‌شده:\n   ' +
        CHROME_CANDIDATES.join('\n   '),
    )
    process.exit(2)
  }

  const profile = mkdtempSync(join(tmpdir(), 'cdp-'))
  const chrome = spawn(
    exe,
    [
      '--headless=new',
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${profile}`,
      '--window-size=1600,1000',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      APP_URL,
    ],
    { stdio: 'ignore' },
  )

  let page
  for (let i = 0; i < 100 && !page; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json()
      page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
    } catch {
      /* هنوز بالا نیامده */
    }
    if (!page) await sleep(200)
  }

  if (!page) {
    chrome.kill()
    throw new Error('Chrome بالا نیامد')
  }

  return { chrome, profile, wsUrl: page.webSocketDebuggerUrl }
}

/** یک نشستِ ساده روی پروتکلِ devtools. */
async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl)
  await new Promise((res, rej) => {
    ws.onopen = res
    ws.onerror = () => rej(new Error('اتصال به Chrome برقرار نشد'))
  })

  let id = 0
  const pending = new Map()
  const consoleLines = []

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data)

    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = msg.params.args
        .map((a) => a.value ?? a.description ?? '')
        .join(' ')
      consoleLines.push(`[${msg.params.type}] ${text}`)
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      consoleLines.push(
        '[exception] ' + (msg.params.exceptionDetails.exception?.description ?? ''),
      )
    }

    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result)
    }
  }

  const send = (method, params = {}) => {
    const myId = ++id
    ws.send(JSON.stringify({ id: myId, method, params }))
    return new Promise((res, rej) => pending.set(myId, { res, rej }))
  }

  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    if (r.exceptionDetails) {
      return { __error: r.exceptionDetails.exception?.description ?? 'unknown' }
    }
    return r.result.value
  }

  await send('Runtime.enable')
  await send('Page.enable')
  await sleep(4000) // صبر تا اپ کامل بالا بیاید و فونت‌ها بنشینند

  return { ws, send, evaluate, consoleLines, close: () => ws.close() }
}

// ── بررسی‌ها ─────────────────────────────────────────────────────────────

const checks = []
function check(name, ok, detail = '') {
  checks.push({ name, ok, detail })
  console.log(`${ok ? '  ✔' : '  ✖'} ${name}${detail ? ` — ${detail}` : ''}`)
}

console.log(`\nمرورگر روی ${APP_URL}\n${'─'.repeat(60)}`)

const { chrome, profile, wsUrl } = await launch()
const s = await connect(wsUrl)

try {
  // ── ۱) اصلاً اپ بالا آمده؟ ──
  const booted = await s.evaluate(`!!document.querySelector('.toc-list-top a')`)
  check('اپ بالا آمده و فهرست دارد', booted === true)
  if (booted !== true) {
    // ⭐ بدون این، خطا بی‌صدا گم می‌شود و فکر می‌کنیم اپ خراب است.
    const url = await s.evaluate('location.href')
    const ready = await s.evaluate('document.readyState')
    const root = await s.evaluate('!!document.getElementById("root")')
    console.log('\nتشخیص:')
    console.log('  نشانی:  ', url)
    console.log('  آماده؟  ', ready)
    console.log('  #root؟  ', root)
    if (booted && booted.__error) console.log('  خطای اجرا:', booted.__error)
    console.log('\nکنسول:\n' + (s.consoleLines.slice(0, 10).join('\n') || '(خالی)'))
    throw new Error('اپ بارگذاری نشد')
  }

  // ── ۲) ⭐ هر لینکِ فهرست، یک عنصرِ واقعی در DOM دارد؟ ──
  const links = await s.evaluate(`(() => {
    const as = [...document.querySelectorAll('.toc-list-top a')]
    const missing = []
    for (const a of as) {
      const id = decodeURIComponent(a.getAttribute('href') || '').slice(1)
      if (!document.getElementById(id)) {
        missing.push({ id, text: a.textContent.slice(0, 40) })
      }
    }
    return { total: as.length, missing }
  })()`)

  check(
    `هر ${links.total} لینکِ فهرست، سرتیترش را در صفحه دارد`,
    links.missing.length === 0,
    links.missing.length ? `${links.missing.length} لینک گم است: ${links.missing.slice(0, 3).map((m) => m.id).join(' | ')}` : '',
  )

  // ── ۳) ⭐ کلیکِ واقعی، اسکرولِ واقعی می‌سازد؟ ──
  const clickResult = await s.evaluate(`(() => {
    const links = [...document.querySelectorAll('.toc-list-top a')]
    // هدف را یک سرتیترِ پایینِ صفحه انتخاب می‌کنیم تا اسکرول معنا داشته باشد
    const candidates = links.map(a => {
      const id = decodeURIComponent(a.getAttribute('href') || '').slice(1)
      const el = document.getElementById(id)
      return { a, id, el, top: el ? el.getBoundingClientRect().top : 0 }
    })
    const target = candidates.filter(c => c.el && c.top > 400).pop()
                     ?? candidates.filter(c => c.el).pop()
    if (!target) return { skipped: 'هیچ سرتیتری پیدا نشد' }

    const winBefore = window.scrollY
    target.a.click()
    return {
      clicked: target.id,
      text: target.a.textContent.slice(0, 40),
      winBefore,
      hashAfter: location.hash,
    }
  })()`)

  await sleep(1500) // صبر برای تمام شدنِ اسکرولِ نرم

  const scrollResult = await s.evaluate(`(() => {
    const id = decodeURIComponent(location.hash.slice(1))
    const el = document.getElementById(id)
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    return {
      winAfter: window.scrollY,
      maxScroll,
      hash: location.hash,
      found: !!el,
      // ⭐ سرتیترِ هدف باید در نوارِ دید باشد، نه زیرِ نوارِ چسبان
      topInViewport: el ? Math.round(el.getBoundingClientRect().top) : null,
      headingText: el ? el.textContent.slice(0, 40) : null,
      // ⭐⭐ و اینکه آیا صفحه ته کلید خورده است.
      //
      // اگر به ته رسیده باشیم، مرورگر *نمی‌تواند* سرتیتر را بالا بیاورد —
      // چون پایین‌تر از این هم محتوا نیست. پس سرتیتر پایین می‌ماند و این
      // **اشکال نیست**. آزمونِ درست، این است: آیا سرتیتر جایی هست که
      // کاربر بتواند بخواندش؟
      atBottom: window.scrollY >= maxScroll - 2,
      innerHeight: window.innerHeight,
    }
  })()`)

  const moved = scrollResult.winAfter !== clickResult.winBefore
  check(
    'کلیک روی فهرست، صفحه را اسکرول می‌کند',
    moved && scrollResult.found,
    `scrollY: ${clickResult.winBefore} → ${scrollResult.winAfter}` +
      (scrollResult.found ? '' : ' — ولی عنصر پیدا نشد!'),
  )

  // ⭐ معیار: سرتیتر باید **در نما** باشد. اگر صفحه ته کلید خورده، سرتیتر
  // می‌تواند پایین‌تر بنشیند — ولی نباید **بالای** نوارِ چسبان گم شود.
  const headingVisible =
    scrollResult.found &&
    scrollResult.topInViewport > 0 &&
    scrollResult.topInViewport < scrollResult.innerHeight

  check(
    'سرتیترِ هدف در نما قرار گرفت (زیرِ نوارِ چسبان گم نشد)',
    headingVisible,
    `فاصله از بالای پنجره: ${scrollResult.topInViewport}px` +
      (scrollResult.atBottom ? ' — صفحه ته کلید خورده، پس این درست است' : '') +
      (scrollResult.headingText ? ` — «${scrollResult.headingText}»` : ''),
  )

  // ── ۳ب) ⭐ و یک بررسیِ سخت‌گیرانه‌تر روی فاصلهٔ نوار ──
  //
  // وقتی صفحه ته کلید نخورده، سرتیتر باید **دقیقاً** زیرِ نوارِ ابزار بنشیند.
  // نه خیلی بالا (زیرِ نوار گم می‌شود)، نه خیلی پایین (چشم گم می‌کند).
  //
  // برای همین سراغِ یک فازِ بلند می‌رویم — راهنمای شروع کوتاه است و سرتیترهای
  // میانی‌اش به ته صفحه می‌خورند و آزمون را بی‌معنا می‌کنند.
  await s.evaluate(`(async () => {
    const sleep = (ms) => new Promise(r => setTimeout(r, ms))
    const phases = [...document.querySelectorAll('.phase-list-inner a, .phase-list-inner button')]
    // بلندترین فاز را پیدا می‌کنیم: همان که بیشترین سرتیتر را دارد
    let best = null, bestCount = 0
    for (const p of phases) {
      p.click(); await sleep(500)
      const n = document.querySelectorAll('.toc-list-top a').length
      if (n > bestCount) { bestCount = n; best = p }
    }
    best?.click(); await sleep(600)
    return true
  })()`)

  const offset = await s.evaluate(`(() => {
    const links = [...document.querySelectorAll('.toc-list-top a')]
    const cands = links.map(a => {
      const id = decodeURIComponent(a.getAttribute('href') || '').slice(1)
      const el = document.getElementById(id)
      return { a, id, el, top: el ? el.getBoundingClientRect().top : 0 }
    }).filter(c => c.el)
    if (!cands.length) return { skipped: true }

    // سرتیتری که نه اولِ صفحه است و نه آن‌قدر پایین که ته کلید بخورد
    const mid = cands.filter(c => c.top > 900 && c.top < 3000)
    if (!mid.length) return { skipped: 'سرتیترِ میانی نبود', total: cands.length }

    mid[0].a.click()
    return { id: mid[0].id, total: cands.length }
  })()`)

  if (!offset.skipped) {
    await sleep(1500)

    const pos = await s.evaluate(`(() => {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)))
      const bar = document.querySelector('.toolbar')
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      return {
        headingTop: el ? Math.round(el.getBoundingClientRect().top) : null,
        barHeight: bar ? Math.round(bar.getBoundingClientRect().height) : null,
        atBottom: window.scrollY >= maxScroll - 2,
      }
    })()`)

    check(
      'سرتیتر درست زیرِ نوارِ ابزار می‌نشیند (نه پشتش، نه خیلی پایین)',
      pos.headingTop !== null &&
        pos.barHeight !== null &&
        pos.headingTop >= pos.barHeight - 4 &&
        pos.headingTop < pos.barHeight + 60,
      `سرتیتر ${pos.headingTop}px، نوارِ ابزار ${pos.barHeight}px` +
        (pos.atBottom ? ' (ولی ته کلید خورده)' : ''),
    )
  } else {
    check('سرتیترِ میانی برای سنجشِ فاصله پیدا شد', false, 'پیدا نشد')
  }

  // ── ۴) نشانیِ URL هم عوض شد؟ ──
  check(
    'نشانیِ URL با کلیک هماهنگ شد (دکمهٔ برگشت کار می‌کند)',
    scrollResult.hash.length > 1,
    scrollResult.hash.slice(0, 60),
  )

  // ── ۵) عوض کردنِ فاز، لنگرها را خراب نمی‌کند؟ ──
  //
  // ⭐ مقایسه باید **فازِ ثابتی** باشد: همان فاز، اول و بعد.
  // بررسیِ فاصلهٔ نوار (۳ب) فاز را عوض کرده، پس «قبل» را همین‌جا و
  // همین لحظه می‌گیریم، نه از ابتدای اجرا.
  const phaseSwitch = await s.evaluate(`(async () => {
    const sleep = (ms) => new Promise(r => setTimeout(r, ms))
    const phases = [...document.querySelectorAll('.phase-list-inner a, .phase-list-inner button')]
    const idsOf = () => [...document.querySelectorAll('.prose h1[id], .prose h2[id], .prose h3[id]')]
                       .map(h => h.id).join('|')

    const home = phases[0]

    // ⭐ اول صریحاً به فازِ خانه برمی‌گردیم و صبر می‌کنیم تا رندر بنشیند.
    // بررسیِ ۳ب فاز را عوض کرده، پس بدون این «قبل» از یک حالتِ ناپایدار
    // گرفته می‌شد و تست الکی قرمز می‌شد.
    home.click(); await sleep(900)

    const before = idsOf()
    const nBefore = before ? before.split('|').length : 0

    // همهٔ فازها را یکی‌یکی می‌گردیم و به همان فازِ اول برمی‌گردیم.
    for (let i = 1; i < phases.length; i++) {
      phases[i].click(); await sleep(450)
      home.click();    await sleep(450)
    }

    // ⭐⭐ بعد از آخرین کلیک، صبر می‌کنیم تا رندر تمام شود.
    // کلیک‌ها پشتِ سر هم می‌آیند و اگر زود بسنجیم، رندرِ نیمه‌کاره را
    // با رندرِ کامل مقایسه می‌کنیم.
    await sleep(1200)

    const after = idsOf()
    const same = before === after

    // ⭐ جزئیاتِ اولین اختلاف — تا وقتی قرمز شد، بدانیم *چرا*
    let firstDiff = null
    if (!same) {
      const a = before.split('|'), b = after.split('|')
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if (a[i] !== b[i]) { firstDiff = { i, before: a[i], after: b[i] }; break }
      }
    }

    return { stable: same, count: phases.length, nBefore, nAfter: after ? after.split('|').length : 0, firstDiff }
  })()`)

  check(
    `رفت‌وبرگشت بین ${phaseSwitch.count} فاز، شناسه‌ها را ثابت نگه می‌دارد`,
    phaseSwitch.stable === true,
    phaseSwitch.stable
      ? `${phaseSwitch.nBefore} شناسه، بدون تغییر`
      : `شناسه‌ها عوض شدند (${phaseSwitch.nBefore} → ${phaseSwitch.nAfter}). ` +
        (phaseSwitch.firstDiff
          ? `اولین اختلاف در #${phaseSwitch.firstDiff.i}: «${phaseSwitch.firstDiff.before}» → «${phaseSwitch.firstDiff.after}»`
          : 'تعداد شناسه‌ها فرق دارد'),
  )

  // ── ۶) کنسول باید تمیز باشد ──
  const noisy = s.consoleLines.filter(
    (l) => !l.includes('[vite]') && !l.includes('DevTools') && !l.startsWith('[log]'),
  )
  check('کنسول بدون هشدار و خطاست', noisy.length === 0, noisy.slice(0, 3).join(' ⏐ '))
} finally {
  s.close()
  chrome.kill()
  try {
    rmSync(profile, { recursive: true, force: true })
  } catch {
    /* بی‌اهمیت */
  }
}

// ── نتیجه ──
const failed = checks.filter((c) => !c.ok)
console.log(`${'─'.repeat(60)}`)
console.log(`${checks.length - failed.length}/${checks.length} بررسی موفق\n`)

process.exit(failed.length === 0 ? 0 : 1)