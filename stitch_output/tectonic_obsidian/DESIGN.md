---
name: Tectonic Obsidian
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#e29100'
  on-tertiary-container: '#523200'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 46px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 29px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 24px
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 22px
  label-code-bold:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 22px
  label-meta:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 2rem
  margin-sm: 1rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an immersive, distraction-free technical workspace tailored for deep engineering immersion across backend systems, distributed architectures, and machine learning pipelines. Combining the precision engineering aesthetic of high-tier developer interfaces with the typographic grace required for complex right-to-left (Persian/Farsi) bilingual technical prose, it balances dense functional utility with effortless legibility.

### Personality & Emotional Response
- **Surgical Precision:** Every border, line number, and node badge communicates order and deterministic structure.
- **Deep Cognitive Calm:** Eliminates noise through slate depth, allowing readers to sustain concentration through multi-chapter architectural roadmaps.
- **Bi-Directional Fluency:** Treats Persian typography and Latin technical syntax as equal first-class citizens, preventing visual hierarchy collapse when alternating scripts inline.

### Visual Aesthetic
The style synthesizes modern technical minimalism with architectural tonal layering:
- Crisp 1px hairline borders (`rgba(255, 255, 255, 0.08)`) over layered charcoal strata.
- Subdued surfaces that elevate interactive cards and code containers without heavy drop-shadow clutter.
- Vibrant, terminal-inspired semantic accents (emerald, electric cyan, amber, and crimson) applied with surgical moderation against dark slate ground.

## Colors

The palette is engineered around dark-slate visual ergonomics, preventing eye strain during prolonged technical reading while delivering instant scanability through terminal-grade accents.

### Color Tiers & Semantic Distribution
- **Backgrounds & Surfaces:**
  - `Surface Base`: `#090D16` (deepest slate canvas for primary reader background).
  - `Surface Layer 1`: `#0F172A` (navigation sidebars, sticky headers, table of contents).
  - `Surface Layer 2`: `#1E293B` (interactive cards, callout containers, terminal headers).
  - `Surface Layer 3`: `#283548` (hover states, modal overlays, active tab highlights).
- **Brand & Accents:**
  - `Primary Emerald (#10B981)`: Milestones achieved, core architecture highlights, verified backend components, success states.
  - `Secondary Electric Cyan (#06B6D4)`: Active path lines, AI pipeline triggers, live execution nodes, interactive links.
  - `Tertiary Amber (#F59E0B)`: Prerequisite warnings, distributed systems caveats, latency overhead notices.
  - `Destructive Crimson (#EF4444)`: Breaking changes, anti-patterns, deprecation flags.
- **Content & Text:**
  - `Text Primary`: `#F8FAFC` (crisp paper white, optimized for long-form readability).
  - `Text Secondary`: `#94A3B8` (subtitles, secondary metadata, structural labels).
  - `Text Muted`: `#64748B` (line numbers, directional arrows, disabled state cues).
  - `Border Subtle`: `rgba(255, 255, 255, 0.07)` (hairline structural division).

## Typography

Typographic scale and rhythm are calculated for dual Persian/Latin balance, optimizing line heights to accommodate non-Latin ascenders and descenders without awkward clipping.

### Bi-Directional & RTL Implementation
- **Persian Typography Mapping:** Where localized runtimes are present, substitute Latin sans fonts seamlessly with `Vazirmatn` or `Shabnam` at equivalent weights. Body line height must maintain a generous `1.8` ratio to prevent overlapping glyph marks (e.g., tanween, tashdeed).
- **Code & Syntax:** Code snippets, terminal blocks, inline tokens, and math/vector logic always render in `JetBrains Mono` and enforce strict Left-To-Right (`dir="ltr"`) embedding even within RTL paragraphs.
- **Reading Length:** Prose containers must enforce an optical maximum width of `75ch` to `80ch` to maximize reading endurance.

## Layout & Spacing

The structural layout utilizes a persistent 3-column architectural reference workspace designed for technical learning:

### Grid Architecture
- **Sidebar (Module Navigation & Tree):** Fixed 280px width on desktop (docked right in RTL mode, docked left in LTR mode).
- **Main Reading Runway:** Fluid content container locked between `640px` minimum and `880px` maximum width (~80ch), centered within available space.
- **Context Rail (Page Outline & Roadmap Miniprogress):** 240px width tracking current section completion and interactive jump targets.

### Responsive Breakpoints
- **Desktop (>= 1280px):** 3-column layout active with fixed dual rails and fluid center runway.
- **Tablet (768px – 1279px):** Context rail collapses into an expandable pill drawer. Sidebar transforms into an off-canvas drawer.
- **Mobile (< 768px):** Full-bleed single-column layout. Gutter shrinks to `1rem`, outer margins to `1rem`. Reading column occupies full width with `space-md` safe inline padding.

### Directional Mirroring
All logical layout properties (`margin-inline-start`, `padding-inline-end`) must automatically flip across `[dir="rtl"]` without manual utility overrides.

## Elevation & Depth

Visual hierarchy is achieved through meticulous surface luminosity and hairline separation rather than heavy skeuomorphic cast shadows.

### Elevation Levels
- **Ground (`Surface Base`):** Deep canvas (#090D16). Holds base technical reading text. Zero elevation.
- **Layer 1 (Card & Module Shells):** Elevated using `Surface Layer 1` (#0F172A) with a crisp 1px ghost border: `border: 1px solid rgba(255, 255, 255, 0.08)`.
- **Layer 2 (Hover Nodes & Code Blocks):** Elevated using `Surface Layer 2` (#1E293B) complemented by subtle ambient glow: `box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5)`.
- **Layer 3 (Overlays, Command Palettes, Popovers):** Elevated using `Surface Layer 3` (#283548), surrounded by `border: 1px solid rgba(255, 255, 255, 0.14)` and deep directional diffusion: `box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.8)`.

### Accent Backlights
Interactive node completion or active steps feature a subtle, colored radial halo (`rgba(16, 185, 129, 0.12)` for backend tracks, `rgba(6, 182, 212, 0.12)` for AI tracks) behind the active container to signal focus state.

## Shapes

The design system maintains a refined, technical silhouette via restrained corner geometry (Soft: 0.25rem to 0.75rem).

- **Buttons & Interactive Tags:** `0.375rem` (6px) for an intentional, tool-grade feel.
- **Cards, Code Blocks & Callouts:** `0.5rem` (8px) corner radius, reinforcing crisp alignment with 1px borders.
- **Status Badges & Roadmap Pill Trackers:** Fully rounded pill curves (`9999px`) to create distinction between content surfaces and atomic status indicators.

## Components

### Buttons
- **Primary:** High-contrast emerald fill (`#10B981`) with rich dark text (`#090D16`), weight 600. On hover, background transitions to `#34D399` with a subtle emerald focus ring (`0 0 0 2px #090D16, 0 0 0 4px #10B981`).
- **Secondary / Ghost:** Transparent background with subtle border (`1px solid rgba(255, 255, 255, 0.12)`), text `#F8FAFC`. On hover, fills with `Surface Layer 2`.

### Code Blocks & Terminal Snippets
- **Surface:** Wrapped in a dedicated slate container (`#0B1120`) bordered with `rgba(255, 255, 255, 0.08)`.
- **Header:** Features a top bar displaying language syntax, file path, and an inline one-click copy button.
- **Direction:** Strictly LTR (`direction: ltr; text-align: left;`) regardless of document language. Font: `JetBrains Mono` at `13px` with `line-height: 22px`.

### Callout Blocks
Bordered boxes with a `3px` solid accent stripe along the inline-start edge (right edge in RTL, left edge in LTR):
- **Architecture Note (Cyan):** Background `rgba(6, 182, 212, 0.05)`, border `rgba(6, 182, 212, 0.2)`.
- **Performance Warning (Amber):** Background `rgba(245, 158, 11, 0.05)`, border `rgba(245, 158, 11, 0.2)`.
- **System Failure / Anti-Pattern (Crimson):** Background `rgba(239, 68, 68, 0.05)`, border `rgba(239, 68, 68, 0.2)`.

### Roadmap Progression Nodes
- **State Badges:** Pill-shaped tags (`font-family: JetBrains Mono; font-size: 11px; padding: 2px 8px`).
  - *Completed:* Emerald text with `rgba(16, 185, 129, 0.12)` background.
  - *In Progress:* Cyan text with `rgba(6, 182, 212, 0.12)` background and pulsing dot.
  - *Optional / Advanced:* Slate text with `rgba(148, 163, 184, 0.1)` background.

### Input Fields & Search (Command Palette)
- Dark inset backgrounds (`#0F172A`), placeholder `#64748B`, active input border `#06B6D4`. Supports unified shortcut pills (e.g., `⌘K` or `Ctrl + K`) docked on the inline end.