/**
 * SettingsPanel.tsx — پنل کنترل تنظیمات
 *
 * تمام اهرم‌های رندر متن اینجا هستند.
 * هر تغییر، یک کلید از Settings را عوض می‌کند.
 */

import type { Settings, ThemeName, FontFamily, CodeTheme } from './types'
import { THEMES, THEME_LABELS, CODE_THEME_LABELS } from './themes'

interface Props {
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
  onReset: () => void
  onClose: () => void
}

/** یک اسلایدر با برچسب و مقدار. */
function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
}) {
  return (
    <div className="setting-row">
      <label className="setting-label">
        <span>{label}</span>
        <span className="setting-value">
          {value}
          {unit}
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
    </div>
  )
}

/** یک کلید تبدیل روشن/خاموش. */
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="switch-row">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className="switch"
        onClick={() => onChange(!checked)}
      />
    </div>
  )
}

/** پیش‌تنظیم‌های آماده — برای تست سریع حالت‌های مختلف. */
const PRESETS: { name: string; patch: Partial<Settings> }[] = [
  {
    name: 'پیش‌فرض',
    patch: {
      fontSize: 17, lineHeight: 1.9, contentWidth: 720,
      fontFamily: 'vazir', letterSpacing: 0, textAlign: 'right',
    },
  },
  {
    name: 'راحت برای چشم',
    patch: { fontSize: 19, lineHeight: 2.1, contentWidth: 680, paragraphSpacing: 1.3 },
  },
  {
    name: 'فشرده (بیشترین متن)',
    patch: { fontSize: 14, lineHeight: 1.65, contentWidth: 900, paragraphSpacing: 0.7 },
  },
  {
    name: 'خواندن کد',
    patch: { fontSize: 15, codeFontSize: 16, contentWidth: 960, showLineNumbers: true, codeWrap: true },
  },
  {
    name: 'نمایش عریض',
    patch: { contentWidth: 1100, fontSize: 15, lineHeight: 1.8 },
  },
]

export function SettingsPanel({ settings, onChange, onReset, onClose }: Props) {
  return (
    <aside className="settings-panel" aria-label="تنظیمات نمایش">
      <div className="settings-header">
        <h2>تنظیمات نمایش</h2>
        <button type="button" className="btn" onClick={onClose} aria-label="بستن">
          ✕
        </button>
      </div>

      {/* ── پیش‌تنظیم‌ها ── */}
      <div className="settings-group">
        <div className="settings-group-title">پیش‌تنظیم سریع</div>
        <div className="preset-row">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              className="preset-btn"
              onClick={() => onChange(p.patch)}
            >
              {p.name}
            </button>
          ))}
        </div>
        <button type="button" className="btn" style={{ width: '100%' }} onClick={onReset}>
          ↺ بازگشت به پیش‌فرض کامل
        </button>
      </div>

      {/* ── پیش‌نمایش زنده ── */}
      <div className="settings-group">
        <div className="settings-group-title">پیش‌نمایش</div>
        <div className="preview">
          <span className="preview-mark">
            این یک متن آزمایشی است که با تغییر تنظیمات، زنده عوض می‌شود.
          </span>{' '}
          متن فارسی و کد{' '}
          <code>const x = 42</code> در کنار هم.
        </div>
      </div>

      {/* ── اندازه و فاصله ── */}
      <div className="settings-group">
        <div className="settings-group-title">اندازه و فاصله</div>

        <Slider
          label="اندازه‌ی متن"
          value={settings.fontSize}
          min={12}
          max={32}
          step={0.5}
          unit="px"
          onChange={(fontSize) => onChange({ fontSize })}
        />
        <Slider
          label="فاصله‌ی خطوط"
          value={settings.lineHeight}
          min={1.2}
          max={2.6}
          step={0.05}
          onChange={(lineHeight) => onChange({ lineHeight })}
        />
        <Slider
          label="فاصله‌ی پاراگراف‌ها"
          value={settings.paragraphSpacing}
          min={0.3}
          max={2.5}
          step={0.05}
          unit="em"
          onChange={(paragraphSpacing) => onChange({ paragraphSpacing })}
        />
        <Slider
          label="عرض محتوا"
          value={settings.contentWidth}
          min={480}
          max={1200}
          step={20}
          unit="px"
          onChange={(contentWidth) => onChange({ contentWidth })}
        />
        <Slider
          label="فاصله‌ی حروف"
          value={settings.letterSpacing}
          min={-0.05}
          max={0.2}
          step={0.005}
          unit="em"
          onChange={(letterSpacing) => onChange({ letterSpacing })}
        />
        <Slider
          label="ضخامت فونت"
          value={settings.fontWeight}
          min={300}
          max={800}
          step={50}
          onChange={(fontWeight) => onChange({ fontWeight })}
        />
        <Slider
          label="حاشیه‌ی محتوا از لبه"
          value={settings.contentPadding}
          min={0}
          max={64}
          step={4}
          unit="px"
          onChange={(contentPadding) => onChange({ contentPadding })}
        />
      </div>

      {/* ── فونت ── */}
      <div className="settings-group">
        <div className="settings-group-title">فونت</div>
        <div className="setting-row">
          <label className="setting-label">
            <span>خانواده‌ی فونت</span>
          </label>
          <select
            className="select"
            value={settings.fontFamily}
            onChange={(e) => onChange({ fontFamily: e.target.value as FontFamily })}
          >
            <option value="vazir">وزیرمتن (پیشنهادی)</option>
            <option value="iransans">ایران‌سنس</option>
            <option value="noto">نوتو عربی</option>
            <option value="system">فونت سیستم</option>
            <option value="serif">سریف</option>
            <option value="mono">مونواسپیس</option>
          </select>
        </div>
        <div className="setting-row">
          <label className="setting-label">
            <span>تراز متن</span>
          </label>
          <select
            className="select"
            value={settings.textAlign}
            onChange={(e) => onChange({ textAlign: e.target.value as Settings['textAlign'] })}
          >
            <option value="right">راست‌چین</option>
            <option value="justify">هم‌تراز (دو طرفه)</option>
            <option value="center">وسط‌چین</option>
            <option value="left">چپ‌چین</option>
          </select>
        </div>
        <Toggle
          label="نمایش جهت چپ‌چین (برای مقایسه)"
          checked={settings.direction === 'ltr'}
          onChange={(v) => onChange({ direction: v ? 'ltr' : 'rtl' })}
        />
      </div>

      {/* ── تم ── */}
      <div className="settings-group">
        <div className="settings-group-title">تم</div>
        <div className="theme-grid">
          {(Object.keys(THEMES) as ThemeName[]).map((name) => (
            <button
              key={name}
              type="button"
              className={`theme-swatch ${settings.theme === name ? 'active' : ''}`}
              onClick={() => onChange({ theme: name })}
              aria-label={THEME_LABELS[name]}
              title={THEME_LABELS[name]}
            >
              <span
                className="theme-swatch-bg"
                style={{ background: THEMES[name].bg }}
              />
              <span
                style={{
                  height: 4,
                  background: THEMES[name].accent,
                }}
              />
              <span className="theme-swatch-label">{THEME_LABELS[name]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── کد ── */}
      <div className="settings-group">
        <div className="settings-group-title">کد</div>

        <Slider
          label="اندازه‌ی کد"
          value={settings.codeFontSize}
          min={10}
          max={24}
          step={0.5}
          unit="px"
          onChange={(codeFontSize) => onChange({ codeFontSize })}
        />
        <Slider
          label="فاصله‌ی بلوک کد"
          value={settings.codeBlockSpacing}
          min={0.4}
          max={3}
          step={0.1}
          unit="em"
          onChange={(codeBlockSpacing) => onChange({ codeBlockSpacing })}
        />
        <div className="setting-row">
          <label className="setting-label">
            <span>رنگ‌بندی کد</span>
          </label>
          <select
            className="select"
            value={settings.codeTheme}
            onChange={(e) => onChange({ codeTheme: e.target.value as CodeTheme })}
          >
            {(Object.keys(CODE_THEME_LABELS) as CodeTheme[]).map((name) => (
              <option key={name} value={name}>
                {CODE_THEME_LABELS[name]}
              </option>
            ))}
          </select>
        </div>

        <Toggle
          label="شماره خط"
          checked={settings.showLineNumbers}
          onChange={(showLineNumbers) => onChange({ showLineNumbers })}
        />
        <Toggle
          label="شکستن خطوط بلند"
          checked={settings.codeWrap}
          onChange={(codeWrap) => onChange({ codeWrap })}
        />
      </div>

      {/* ── چیدمان ── */}
      <div className="settings-group">
        <div className="settings-group-title">چیدمان</div>

        <div className="setting-row">
          <label className="setting-label">
            <span>چیدمان جدول‌ها</span>
          </label>
          <select
            className="select"
            value={settings.tableLayout}
            onChange={(e) => onChange({ tableLayout: e.target.value as Settings['tableLayout'] })}
          >
            <option value="auto">خودکار</option>
            <option value="fixed">عرض ثابت</option>
          </select>
        </div>

        <Toggle
          label="خط زیر سرتیترها"
          checked={settings.headingBorder}
          onChange={(headingBorder) => onChange({ headingBorder })}
        />
        <Toggle
          label="خط دور جدول‌ها"
          checked={settings.tableBorder}
          onChange={(tableBorder) => onChange({ tableBorder })}
        />
        <Toggle
          label="نمایش فهرست محتوا"
          checked={settings.showToc}
          onChange={(showToc) => onChange({ showToc })}
        />
        <Toggle
          label="نمایش فلش‌کارت و تمرین"
          checked={settings.showStudy}
          onChange={(showStudy) => onChange({ showStudy })}
        />
        <Toggle
          label="نمایش نوار ابزار"
          checked={settings.showToolbar}
          onChange={(showToolbar) => onChange({ showToolbar })}
        />
      </div>
    </aside>
  )
}
