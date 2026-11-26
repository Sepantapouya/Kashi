import { compare, code, frame, btn, badge } from "../kit.mjs";

const pair = (a, b) => `<div style="display:grid;grid-template-columns:1fr 40px 1fr;align-items:center;gap:8px;padding:14px 20px;border-bottom:1px solid var(--k-border-secondary)">
  <code class="fx-mono" style="font-size:20px;color:var(--k-text-error);text-decoration:line-through;text-align:center">${a}</code>
  <span style="text-align:center;color:var(--k-text-quaternary)">→</span>
  <code class="fx-mono" style="font-size:20px;color:var(--k-text-success);font-weight:700;text-align:center">${b}</code></div>`;

const card = (t) => `<div data-theme="${t}" style="padding:24px;border-radius:18px;background:var(--k-bg-secondary)"><div style="display:grid;gap:12px;padding:22px;border:1px solid var(--k-border-secondary);border-radius:14px;background:var(--k-bg-primary);color:var(--k-text-primary)">
  <div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:19px">سفارش‌های امروز</b>${badge("۱۲ تازه", "brand")}</div>
  <p style="margin:0;color:var(--k-text-tertiary);font-size:15px">بیشترین فروش: هدفون بی‌سیم</p>${btn("مشاهده")}</div>
  <p class="fx-mono" style="margin:14px 0 0;font-size:13px;color:var(--k-text-tertiary);text-align:left">bg-primary text-primary border-secondary</p></div>`;

export const figures = [
  frame(`<div dir="ltr">${pair("ml-4", "ms-4")}${pair("pr-2", "pe-2")}${pair("left-0", "start-0")}${pair("text-right", "text-start")}${pair("rounded-l-lg", "rounded-s-lg")}</div>`),
  compare(
    code(`<div class="pl-4 rtl:pl-0 rtl:pr-4">
  <span class="ml-2 rtl:ml-0 rtl:mr-2">…</span>
  <p class="text-left rtl:text-right">…</p>
</div>`),
    code(`<div class="ps-4">
  <span class="ms-2">…</span>
  <p class="text-start">…</p>
</div>`),
  ),
  `<div class="fx-grid2">${card("light")}${card("dark")}</div>`,
];
