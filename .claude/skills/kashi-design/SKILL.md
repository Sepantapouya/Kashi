---
name: kashi-design
description: Design rules for everything visual in Kashi (کاشی), the Persian RTL design system — docs site pages, homepage sections, header and menus, Figma plugin panel, promo images for the Telegram channel and channel post copy. Use it whenever you design, redesign or "make better" any Kashi page, section, component demo, image or announcement, and before you call such work done.
---

# Kashi design

Kashi is an open-source, RTL-first, dark-first Persian design system (monorepo `~/Desktop/kashi`, site kashi.sepantapouya.com, packages `@kashi-ui/*`). Its maintainer, Sepanta Pouya, is a senior product designer: he judges work visually, notices a few pixels of overflow, and his most common feedback is **"too crowded, make it better"** and **"دقت کن" (look closer)**. Design for that eye.

## 1. Principles (from his feedback)

1. **Calm over complete.** When something feels busy, remove before you restyle: fewer links, fewer cards, shorter captions, more space. Group secondary items behind one control (the header "ابزارها" menu replaced 4 links). A promo image gets at most two visuals besides the copy.
2. **One line per caption.** Captions and stat labels must fit on one line at the target width. Rewrite them shorter ("رایگان، حتی تجاری") instead of letting them wrap.
3. **Enterprise but warm.** Clear value, real numbers, standards and guarantees; never playful clutter. Persian copy is natural and confident, not translated-sounding.
4. **Live, not static.** Prefer demos that use real Kashi tokens/components so they follow the theme (swatches, previews, live GitHub stats) over screenshots or hard-coded colors.
5. **Honest claims only.** No fake customers, logos, testimonials, or "many of you asked" unless true. Say "دانلود" not "کاربر" for npm numbers (most are bots). Claim "اولین" only after a web search finds no competitor, and say what you searched.
6. **Design is not done until verified** (section 6). Measure overflow with a script; don't trust a quick look.

## 2. Visual system

- **Tokens only**: colors, radius, shadow, spacing via `var(--k-…)` (`--k-bg-primary|secondary|tertiary|elevated|hover`, `--k-text-primary…quaternary|brand|success|error|warning|info`, `--k-border-primary|secondary|brand`, `--k-bg-brand-subtle`, `--k-radius-sm…2xl|full`, `--k-shadow-xs…2xl`, `--k-space-*`). Never hard-code a color in site CSS except decorative gradients/glows.
- **Dark first, both themes**: default is dark; light is `[data-theme="light"]`. Every new section must look right in both.
- **Brand**: firoozeh teal (`--k-text-brand`, base `#0fa89b`, button `#0b8077`). Accent gradient for one highlighted word: `linear-gradient(90deg, #3d8bf0, #2fd3c0)` (or `#38bdf8 → brand` for Tailwind topics). Persian palette names: فیروزه، لاجورد، زعفران، انار، پسته، شب.
- **Type**: Vazirmatn everywhere; monospace (`--k-font-mono`, Menlo in images) only for code, package names and commands. Big display numbers: no `tabular-nums` (Persian digits look spaced out), use `letter-spacing: -0.02em`.
- **Motif**: the 8-point Kashi star tile (logo, faint background pattern at ~5% opacity), soft radial teal/blue glows, subtle grid or dot backgrounds in hero cards.
- **Recurring section pattern** on the homepage: kicker with Persian number (`۰۱ قابلیت‌ها`) → h2 → lead; alternate `band` / `band--alt` backgrounds; renumber and re-alternate when inserting a section.
- **Cards**: `border: 1px solid var(--k-border-secondary)`, radius lg/xl, `bg-primary` on `bg-secondary` bands (and vice versa); highlighted card gets `border-brand` + soft ring.

## 3. RTL and bidi — the bugs that keep coming back

Check every one of these before showing work:

- **Latin titles inside RTL** (`Tailwind`, `MCP`): never put `dir="auto"` on them — it left-aligns them. Keep the parent RTL.
- **Persian comma between Latin words** (`Claude، Cursor و Copilot`) renders in the wrong order. Rephrase (`کاشی در دستیار هوش مصنوعی شما`) or isolate each name.
- **LTR snippets in RTL text** (versions, package names, `v0.21.0 · MIT`): wrap in `<bdi dir="ltr">`. Don't put `dir="ltr"` on a flex item that also carries a `::before` separator — the separator flips side.
- **Persian inside monospace code** shows disconnected letters: wrap the Persian string in a span with Vazirmatn.
- **Inherited `white-space: nowrap`**: `.site-nav a` is nowrap, so anything rendered as a link inside the nav (menu items) must reset `white-space: normal` and `min-inline-size: 0`.
- **Charts/SVG**: time runs right-to-left; Persian date labels in SVG `<text>` can reorder — prefer plain Persian digits plus one axis caption.
- **Numbers**: format with `toLocaleString("fa-IR")` or `toFaDigits`; Persian decimal separator `٫`, thousands `٬`.
- **Directional icons** (arrows) mirror in RTL; use logical CSS (`inset-inline-*`, `margin-inline-*`, `ms-/ps-` in Tailwind).
- **Order of comparison cards**: in RTL the first card is on the right — put "before/بدون" first so it reads before → after.

## 4. Site building blocks

- **Docs page content stays in MDX text.** The MCP server (`@kashi-ui/mcp`) and `/llms.txt` are generated from `apps/docs/src/pages/docs/**/*.mdx`; `.astro` pages and JSX components are invisible to them. For a designed docs page, keep the guide as MDX and add visuals as Astro components with a `part` prop (see `components/TwKit.astro`), fed by package data (e.g. `@kashi-ui/tailwind/tokens.json`) so they stay correct on every release. Keep a short text version of anything only shown visually.
- **Designed standalone pages** (`docs/figma.astro`, `docs/ai.astro`) follow: hero card (eyebrow pill, title with gradient phrase, lead, copyable command, live mock on the other side) → stats row → sections → FAQ with `<details>` and a CSS chevron.
- **Copy buttons**: the global handler in `layouts/Base.astro` reacts to any `[data-copy]`. Do not reuse the `.copy-btn` class outside `CodeBlock` — it is `position: absolute`.
- **Header**: four primary links + "ابزارها" menu (theme builder, Tailwind, Figma plugin, MCP) with icon + one-line description; no version badge. Add new tools to the menu, not as new top-level links.
- **Live GitHub stats**: elements with `data-gh="stars|clones|uniques"` are filled by `scripts/github-stats.ts` — stars live from the GitHub API, clones from the `stats` branch (GitHub computes clones daily and its cron is unreliable, so never promise "hourly"); the homepage also reads them at build time so numbers show without JS.
- **A new component or feature must show up everywhere a visitor looks, not only on its own page.** He found the Iran map missing from `/docs/persian/` although its page and sidebar link existed. When you add one, go through every listing and update each one that applies:
  - sidebar entry in `apps/docs/src/data/nav.ts`, with the "جدید" badge
  - gallery cards: a slug in the right category of `CATEGORIES` in `components/Gallery.astro` (`components` → `/docs/components/`, `persian` → `/docs/persian/`; add a category if none fits) and a small inert preview in `components/Previews.tsx`, sized with a `pv-*` class
  - homepage (`pages/index.astro`) and the header "ابزارها" menu, when it is a headline feature or a tool
  - search, llms and MCP pick up the MDX page by themselves; the shadcn registry (`data/registry.ts`, served at `/r/`) picks up every file in `packages/react/src`, and the install page list needs a Persian name in `FA_NAME` (`components/InstallKit.astro`) only when the file has no docs page of its own
  - web components: if the component has a `<kashi-*>` version in `packages/elements`, add an entry to `apps/docs/src/data/elements.ts` (page path → tags, npm module, live HTML sample, note, attributes, events/JS). That one entry drives the «وب کامپوننت» tab of the install card under the page title (`components/PageInstall.astro`: React / shadcn / وب کامپوننت tabs, remembered tab and package manager; it also moves the page's first `import … from "@kashi-ui/react"` block into the React tab), the «وب کامپوننت» section at the end of the page with install (CDN + npm module import), live demo, attributes and events (`components/ElementSection.astro`, added by `layouts/Docs.astro`, also in the TOC), and the same text in llms.txt and the MCP server (`elementMarkdown` in `packages/mcp/src/docs-to-md.mjs`). Install and reference belong on the component's own page, not on the general page: `pages/docs/web-components.mdx` is only setup, one sample, the list table (component → tags → npm module) and the shared guides (forms, events, frameworks). Also add the tag to `packages/elements/README.md` and to `KASHI_ELEMENTS` + `HTMLElementTagNameMap` in `packages/elements/src/index.ts`; `test/docs.test.mjs` fails if any of these is missing or the element count on the page is wrong

  Then open each listing in the browser and check that the card is there and its preview renders.
- **Web components (`@kashi-ui/elements`) follow the React components.** A change to the behaviour or markup of a React component that has a `<kashi-*>` twin (Persian inputs, OTP, province, calendar/date picker, money, date, relative time, countdown, dialog, tabs, tooltip, toast, copy button) goes into the element too, in the same commit, so both render the same `k-*` markup and Persian texts. The full list of twins is `data/elements.ts`; the React-only ones are listed at the end of `web-components.mdx` — when one gets an element, take it off that list. For an interactive new component, ask whether it should also get an element; CSS-only components don't need one (their HTML tab is enough).
  - Light DOM only (no Shadow DOM) so `@kashi-ui/css`, themes and user CSS apply; tags start with `kashi-`; values from attributes, the raw value submitted through `name` (hidden input), invalid values blocked with `setCustomValidity`, changes reported as a bubbling `kashi-change` event.
  - Never name a class member after an `HTMLElement`/`Element` property or method (`id`, `popover`, `hidden`, `title`, `matches`, `closest`…): it silently breaks the element's own attribute or the DOM API. Use names like `key`, `pop`, `accepts`. `tsc` catches most of these; read its errors.
  - Values a framework sets before the element is on the page (Vue sets `.value` first, inserts later) must survive the first render: setters set a `valueSet` flag and `connectedCallback` reads the attribute only when it is false.
  - Rebuilding the inner markup on an attribute change loses focus and typed text; for attributes that change during use (like `province` on the city select), update in place instead.
  - Composite elements (address form) are built from other elements; a module that uses another element's tag imports that module for its side effect, so the per-module imports (`@kashi-ui/elements/map.js`) work alone.
  - Read children only via `afterParse()` (a non-module script in `<head>` connects the element before its children exist).
  - Docs demos: `<Demo lang="html" code={…}>` with the same markup as the slot, and `<ElementsScript />` once on the page.
  - Tests: `packages/elements/test` runs in happy-dom; `npm run build -w @kashi-ui/elements && npm test -w @kashi-ui/elements`. Also try the real page in the browser: keyboard, form submit and both themes.
- **Component page format** (shared components, never per page):
  - props and CSS variables go through `<Props>` / `<Vars>`: two columns, name on the right, then description, the type split into one chip per union member (`lib/split-type.ts`) and the default. Don't hand-write prop tables in Markdown.
  - demo code longer than ten lines collapses to eight per tab (React and HTML are measured separately) with «نمایش همهٔ کد»; keep demo code short anyway.
  - headings get a hover link icon (`.h-anchor`); use `##` for sections, `###`/`####` inside them — every level has its own top margin.
  - code fences start and end without blank lines.
  - «جدید» badges in `nav.ts`: only the last few additions (about five). Remove the oldest when adding one, or the badge stops meaning anything.
- **Icons**: use `iconSvg(name)` from `@kashi-ui/icons`; check a name exists before using it (e.g. there is no `figma` icon — use `pen-tool`).

## 5. Promo images and channel posts

Images (1280×720 layout, rendered at 2× = 2560×1440):

- Start from `assets/promo-template.html` in this skill. Copy `Vazirmatn.woff2` from `packages/css/dist/fonts/` next to it; inline Kashi icons with `iconSvg`.
- Layout: **right** = logo, pill (`تازه` + package name), h1 with one gradient word, one short lead, command box, footer (url + `@sepantapouya_ux` pill). **Left** = at most two visuals (e.g. a big before/after, one row of color dots, one chat mock). Lots of empty space.
- Render: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --user-data-dir="$TMPDIR/kchrome" --force-device-scale-factor=2 --window-size=1280,720 --virtual-time-budget=3000 --screenshot=out.png file://…/page.html`. Delete the old PNG first (Chrome can silently keep it), then open the PNG and check: nothing overlaps the footer, headline doesn't touch the left column, Persian in code is connected, labels/numbers read in the right order, no claim is inflated.
- Save to `~/Desktop/kashi-<topic>/` with `post.txt` next to the image, and send the PNG to the user.

Channel posts (Persian, friendly colloquial): hook line with emoji → the problem in one or two sentences → 3–5 emoji bullets with concrete names/classes → the key promise (e.g. free stays free/MIT, nothing copied) → install command → link → invitation to try + `@sepantapouya_ux` → hashtags (`#کاشی #دیزاین_سیستم …`). Flag any sentence that might not be literally true.

## 6. Verification checklist

Run before saying a design is done:

1. **Widths**: desktop 1440, mid 1030–1100 (header crowding), mobile 375 (use the browser pane's mobile preset; headless Chrome can't go below ~500px).
2. **Overflow script**: list elements whose rect exceeds the viewport or their container, and text whose `scrollWidth > clientWidth`; for wrapped text measure with a `Range`. Ignore intentional scrollers (code, palette tables, decorative glows).
3. **Both themes**: toggle `[data-theme-toggle]`, then toggle back.
4. **Headless screenshots of long pages**: pass `--force-prefers-reduced-motion`, otherwise scroll-reveal sections stay blurred.
5. **Keyboard** for anything interactive: Enter/arrows/Escape, focus returns, focus ring visible.
6. **Build**: `npx astro build` in `apps/docs`; if MDX changed, `npm run build -w @kashi-ui/mcp && npm test -w @kashi-ui/mcp`.
7. Show proof (screenshot or measured numbers) and say what was not checked.

## 7. Working with Sepanta

- Reply in Persian, short steps, plain language (he is a designer, not a developer); give terminal commands one per block, and remind that they must run inside `~/Desktop/kashi`.
- Commit when work is done; **push only when he says so** (each time). He publishes to npm himself (`npm login`, then `npx changeset publish` with "skip 2fa for 5 minutes"); new or very large packages can take up to an hour to appear on npm.
- His other machine pushes often: pull/rebase before committing a release or pushing.
