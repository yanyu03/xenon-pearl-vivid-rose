---
name: Folio
source: awesome-design-md / Claude
colors:
  primary: "#cc785c"
  primary-active: "#a9583e"
  ink: "#141413"
  body: "#3d3d3a"
  muted: "#6c6a64"
  hairline: "#e6dfd8"
  canvas: "#faf9f5"
  surface-soft: "#f5f0e8"
  surface-card: "#efe9de"
  surface-dark: "#181715"
  on-primary: "#ffffff"
  on-dark: "#faf9f5"
typography:
  display:
    fontFamily: "Source Serif 4, Noto Serif SC, serif"
  body:
    fontFamily: "Figtree, Noto Sans SC, sans-serif"
  code:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
rounded:
  md: 8px
  lg: 12px
  xl: 16px
spacing:
  md: 16px
  lg: 24px
  xl: 32px
  section: 96px
---

# Folio — DESIGN.md

UI language is taken from **awesome-design-md / Claude**: a warm-canvas
editorial system. Cream paper, serif display, coral as the only loud accent,
and dark navy bands for product/code surfaces. This is a personal studio
journal, not a SaaS marketing site.

## 1. Visual Theme

The page should feel like a well-printed notebook left open on a desk.
Default surface is tinted cream (`#faf9f5`), never pure white. Headlines are
literary serif at large sizes with tight tracking. Body is a humanist sans.
Coral (`#cc785c`) is reserved for primary actions, active nav, and links —
never as a full-page wash.

Alternate a cream canvas with cream-card bands (`#efe9de`) and occasional
dark navy (`#181715`) chapters (footer, code, “正在做”). No decorative
gradients, no glassmorphism, no purple.

## 2. Color Roles

- **Canvas** `#faf9f5` — page floor
- **Ink** `#141413` — headlines, nav, strong UI
- **Body** `#3d3d3a` — running text
- **Muted** `#6c6a64` — dates, captions, bylines
- **Hairline** `#e6dfd8` — 1px rules
- **Surface card** `#efe9de` — feature cards, comment wells
- **Primary** `#cc785c` — CTA, links, progress, focus
- **Surface dark** `#181715` — footer, code windows, inverted bands

## 3. Type

- Display: Source Serif 4 / Noto Serif SC, weight 400, tracking −0.03em
- UI / body: Figtree / Noto Sans SC, 16px, line-height 1.55–1.7
- Article body: 18–19px, ~65ch measure, `text-wrap: pretty`
- Mono: IBM Plex Mono, code only
- Kickers: 12px, weight 500, +0.12em tracking, uppercase for Latin only

## 4. Components

- Primary button: coral fill, white label, 8px radius, 12×20 padding, 40–44px tall
- Secondary: canvas fill, ink label, hairline border
- Cards: cream-card fill, 12px radius, 24–32px padding, hairline or none
- Inputs: 8px radius, hairline, coral focus ring
- Nav: 64px, canvas, no shadow, hairline bottom
- Footer: dark navy, cream type

## 5. Layout

- Max page width 1120px, article 680px
- Section padding ~64–96px desktop, 40–48px mobile
- Home: masthead → featured essay → work grid → note rows → dark “now” band
- StoryStream-like note list: hairline rows, date on the left rail on desktop

## 6. Depth

Flat. Hairlines do the work of shadows. Cards may use a 1px ink/6% ring.
Images get an inset 1px outline at 10% ink.

## 7. Do / Don't

Do: cream paper, one coral accent, large quiet serif, real photographs,
generous measure, Chinese + Latin in the same rhythm.

Don't: purple AI-slop gradients, emoji as icons, gray placeholder boxes,
Inter-on-white SaaS chrome, drop shadows under every card, dark-mode toggle
(cream is the product).
