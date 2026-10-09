/**
 * main.tsx — نقطهٔ ورودِ نسخهٔ ۲
 *
 * ⭐ عمداً هیچ‌کدام از فایل‌های نسخهٔ ۱ را `import` نمی‌کند.
 *
 * نسخهٔ ۱ (`src/main.tsx`) سه چیز را import می‌کند:
 *   · `./styles.css`  ← CSS سراسری نسخهٔ ۱، شامل `body { … }`
 *   · `./highlight-themes.css`
 *   · `./study.css`
 *
 * اگر حتی یکی از این‌ها را اینجا import می‌کردیم، چون هر دو صفحه یک
 * `<html>` مشترک دارند، استایل‌های نسخهٔ ۱ به نسخهٔ ۲ هم نشت می‌کرد (و
 * برعکس). یعنی «فقط یک پله را عوض کن» کلِ چیدمانِ هر دو نسخه را به‌هم
 * می‌ریخت. پس نسخهٔ ۲ **CSS خودش را دارد** و فقط فایل‌های منطقیِ
 * بی‌طرف (مثل `docs.ts` و `slug.js`) را قرض می‌گیرد.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import './styles.css'
import './highlight.css'

const container = document.getElementById('root')
if (!container) throw new Error('#root not found')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)