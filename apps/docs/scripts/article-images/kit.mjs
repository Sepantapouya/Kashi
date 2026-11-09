// ابزار ساخت تصویرهای مقاله‌ها: هر تصویر یک تکه HTML با کلاس‌های واقعی کاشی است که در Chrome عکس گرفته می‌شود.
import { iconSvg } from "../../../../packages/icons/dist/index.js";

export const icon = (name, size = 20) => { const s = iconSvg(name, { size }); if (!s) throw new Error(`آیکون ناشناخته: ${name}`); return s; };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** قاب ساده با عنوان کوچک بالا */
export const frame = (inner, { label, width } = {}) =>
  `<div class="fx-frame"${width ? ` style="width:${width}px"` : ""}>${label ? `<div class="fx-label">${label}</div>` : ""}${inner}</div>`;

/** مقایسهٔ نادرست و درست، کنار هم */
export const compare = (bad, good, { badLabel = "نادرست", goodLabel = "درست" } = {}) => `
<div class="fx-compare">
  <div class="fx-side fx-side--good"><div class="fx-tag fx-tag--good">${icon("check", 16)}${goodLabel}</div><div class="fx-side__body">${good}</div></div>
  <div class="fx-side fx-side--bad"><div class="fx-tag fx-tag--bad">${icon("close", 16)}${badLabel}</div><div class="fx-side__body">${bad}</div></div>
</div>`;

/** پنل کد تیره، چپ‌به‌راست */
export const code = (src, { title } = {}) => {
  // یک گذر: رشته، توضیح و کلیدواژه با هم پیدا می‌شوند تا برچسب‌های رنگ داخل هم نیفتند
  const KW = new Set(["import", "from", "export", "const", "let", "return", "function", "if", "else", "new", "await", "async", "true", "false"]);
  const hl = src.replace(/(\/\/[^\n]*)|("[^"\n]*"|'[^'\n]*'|`[^`\n]*`)|([A-Za-z_]+)|([^])/g, (m, c, str, w) => {
    if (c) return `<i class="c">${esc(c)}</i>`;
    if (str) return `<i class="s">${esc(str)}</i>`;
    if (w) return KW.has(w) ? `<i class="k">${w}</i>` : w;
    return esc(m);
  });
  return `<div class="fx-code">${title ? `<div class="fx-code__bar"><span></span><span></span><span></span><b>${title}</b></div>` : ""}<pre>${hl}</pre></div>`;
};

/** جریان چند مرحله‌ای با فلش (راست‌به‌چپ) */
export const flow = (steps) => `<div class="fx-flow">${steps.map((s, i) => `${i ? `<span class="fx-arrow">${icon("arrow-left", 22)}</span>` : ""}<div class="fx-step"><span class="fx-step__ic">${icon(s.icon, 22)}</span><b>${s.title}</b>${s.text ? `<small><bdi>${s.text}</bdi></small>` : ""}</div>`).join("")}</div>`;

/** فیلد کاشی */
export const field = (label, value, { hint, error, addon, ltr, placeholder } = {}) => `
<div class="k-field">
  <label class="k-label">${label}</label>
  <div class="k-input">${addon ? `<span class="k-input__addon">${addon}</span>` : ""}<input class="k-input__control" value="${value ?? ""}" ${placeholder ? `placeholder="${placeholder}"` : ""} ${error ? 'aria-invalid="true"' : ""} ${ltr ? 'dir="ltr"' : ""}></div>
  ${error ? `<p class="k-hint k-hint--error">${error}</p>` : hint ? `<p class="k-hint">${hint}</p>` : ""}
</div>`;

export const btn = (text, variant = "primary", ic) => `<button class="k-btn k-btn--${variant} k-btn--md">${ic ? icon(ic, 18) : ""}${text}</button>`;
export const badge = (text, tone = "neutral", dot) => `<span class="k-badge k-badge--${tone}">${dot ? '<span class="k-badge__dot"></span>' : ""}${text}</span>`;
export const alert = (title, desc, tone = "info", ic = "info") => `<div class="k-alert k-alert--${tone}" role="status"><span class="k-alert__icon">${icon(ic, 20)}</span><div class="k-alert__content"><p class="k-alert__title">${title}</p>${desc ? `<p class="k-alert__description">${desc}</p>` : ""}</div></div>`;

/** جدول کوچک */
export const table = (head, rows, { num = [] } = {}) => `<div class="k-table-wrap"><table class="k-table"><thead><tr>${head.map((h, i) => `<th${num.includes(i) ? ' class="k-table__num"' : ""}>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${num.includes(i) ? ' class="k-table__num"' : ""}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

/** ردیف چند کارت کوچک با عنوان و متن */
export const tiles = (items, cols = items.length) => `<div class="fx-tiles" style="grid-template-columns:repeat(${cols},1fr)">${items.map((t) => `<div class="fx-tile">${t.icon ? `<span class="fx-tile__ic" style="${t.color ? `--c:${t.color}` : ""}">${icon(t.icon, 22)}</span>` : ""}${t.big ? `<b class="fx-tile__big">${t.big}</b>` : ""}<b>${t.title}</b>${t.text ? `<small>${t.text}</small>` : ""}</div>`).join("")}</div>`;

/** نمودار میله‌ای ساده */
export const bars = (data, { unit = "", max } = {}) => {
  const m = max ?? Math.max(...data.map((d) => d.value));
  return `<div class="fx-bars">${data.map((d) => `<div class="fx-bar"><small>${d.display ?? d.value}${unit}</small><i style="block-size:${(d.value / m) * 100}%;${d.color ? `background:${d.color}` : ""}"></i><b>${d.label}</b></div>`).join("")}</div>`;
};

/** متن نمونه با برجسته‌سازی */
export const sample = (html, { size = 28, ltr } = {}) => `<div class="fx-sample" style="font-size:${size}px"${ltr ? ' dir="ltr"' : ""}>${html}</div>`;

export const CSS = `
* { box-sizing: border-box; }
html, body { margin: 0; }
body { font-family: var(--k-font-sans); background: transparent; }
.fig { position: relative; width: 1200px; padding: 48px; background: radial-gradient(600px 300px at 100% 0%, color-mix(in srgb, var(--k-bg-brand) 7%, transparent), transparent), var(--k-bg-secondary); color: var(--k-text-primary); }
.fig > * + * { margin-top: 24px; }
.fx-frame { padding: 32px; border: 1px solid var(--k-border-secondary); border-radius: 20px; background: var(--k-bg-primary); box-shadow: 0 12px 32px -18px rgb(0 0 0 / .18); }
.fx-frame > * + * { margin-top: 18px; }
.fx-label { display: inline-flex; padding: 4px 12px; border-radius: 999px; background: var(--k-bg-brand-subtle); color: var(--k-text-brand); font-size: 14px; font-weight: 700; }
.fx-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.fx-side { overflow: hidden; border: 1px solid var(--k-border-secondary); border-radius: 20px; background: var(--k-bg-primary); }
.fx-side--good { border-color: color-mix(in srgb, var(--k-text-success) 45%, var(--k-border-secondary)); }
.fx-side--bad { border-color: color-mix(in srgb, var(--k-text-error) 40%, var(--k-border-secondary)); }
.fx-tag { display: flex; align-items: center; gap: 8px; padding: 12px 24px; font-weight: 800; font-size: 16px; }
.fx-tag--good { background: var(--k-bg-success-subtle); color: var(--k-text-success); }
.fx-tag--bad { background: var(--k-bg-error-subtle); color: var(--k-text-error); }
.fx-side__body { padding: 28px; }
.fx-side__body > * + * { margin-top: 16px; }
.fx-code { overflow: hidden; border-radius: 18px; background: #0d1117; box-shadow: 0 16px 40px -20px rgb(0 0 0 / .5); }
.fx-code__bar { display: flex; align-items: center; gap: 7px; padding: 12px 18px; border-bottom: 1px solid #21262d; direction: ltr; }
.fx-code__bar span { width: 11px; height: 11px; border-radius: 50%; background: #30363d; }
.fx-code__bar b { margin-left: 10px; color: #8b949e; font: 600 13px Menlo, monospace; }
.fx-code pre { margin: 0; padding: 22px 26px; direction: ltr; text-align: left; color: #e6edf3; font: 17px/1.75 Menlo, monospace; white-space: pre-wrap; }
.fx-code i { font-style: normal; } .fx-code .k { color: #ff7b72; } .fx-code .s { color: #a5d6ff; } .fx-code .c { color: #8b949e; }
.fx-flow { display: flex; align-items: stretch; justify-content: center; gap: 12px; }
.fx-step { flex: 1; display: grid; justify-items: center; align-content: start; gap: 8px; padding: 24px 16px; border: 1px solid var(--k-border-secondary); border-radius: 18px; background: var(--k-bg-primary); text-align: center; }
.fx-step b { font-size: 18px; } .fx-step small { color: var(--k-text-tertiary); font-size: 14px; line-height: 1.8; }
.fx-step__ic { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 14px; background: var(--k-bg-brand-subtle); color: var(--k-text-brand); }
.fx-arrow { display: grid; place-items: center; color: var(--k-text-quaternary); }
.fx-tiles { display: grid; gap: 18px; }
.fx-tile { display: grid; align-content: start; gap: 8px; padding: 24px; border: 1px solid var(--k-border-secondary); border-radius: 18px; background: var(--k-bg-primary); }
.fx-tile b { font-size: 18px; } .fx-tile small { color: var(--k-text-tertiary); font-size: 14px; line-height: 1.8; }
.fx-tile__ic { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 12px; background: color-mix(in srgb, var(--c, var(--k-bg-brand)) 14%, transparent); color: var(--c, var(--k-text-brand)); }
.fx-tile__big { font-size: 34px !important; letter-spacing: -0.02em; }
.fx-bars { display: flex; align-items: flex-end; gap: 20px; height: 300px; padding: 24px 28px 0; }
.fx-bar { flex: 1; display: grid; grid-template-rows: auto 1fr auto; justify-items: center; gap: 8px; height: 100%; }
.fx-bar i { align-self: end; width: 100%; border-radius: 10px 10px 4px 4px; background: linear-gradient(180deg, color-mix(in srgb, var(--k-bg-brand) 70%, #38bdf8), var(--k-bg-brand)); }
.fx-bar small { color: var(--k-text-secondary); font-weight: 700; font-size: 15px; } .fx-bar b { font-size: 15px; color: var(--k-text-secondary); padding-bottom: 4px; }
.fx-sample { line-height: 1.9; }
.fx-sample mark { padding: 0 4px; border-radius: 6px; background: color-mix(in srgb, #fbbf24 35%, transparent); color: inherit; }
.fx-sample s { color: var(--k-text-error); text-decoration-thickness: 2px; }
.fx-row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.fx-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.fx-note { color: var(--k-text-tertiary); font-size: 15px; line-height: 1.9; }
.fx-mono { font-family: Menlo, monospace; direction: ltr; unicode-bidi: isolate; }
`;
