import { frame, icon } from "../kit.mjs";

const card = "6037991234567893".split("").map(Number);
const cells = card.map((d, i) => {
  const dbl = i % 2 === 0;
  let v = dbl ? d * 2 : d; if (v > 9) v -= 9;
  return `<div style="display:grid;justify-items:center;gap:6px">
    <span style="display:grid;place-items:center;width:52px;height:56px;border-radius:12px;font:800 26px var(--k-font-sans);${dbl ? "background:var(--k-bg-brand-subtle);color:var(--k-text-brand)" : "background:var(--k-bg-primary);border:1px solid var(--k-border-secondary)"}">${d}</span>
    <small style="font:600 15px var(--k-font-sans);color:${dbl ? "var(--k-text-brand)" : "var(--k-text-tertiary)"}">${dbl ? "×۲" : "·"}</small>
    <b style="font-size:17px">${v}</b></div>`;
});
const sum = card.reduce((s, d, i) => { let v = i % 2 === 0 ? d * 2 : d; if (v > 9) v -= 9; return s + v; }, 0);

const seg = (t, label, bg) => `<div style="display:grid;justify-items:center;gap:8px"><span class="fx-mono" style="padding:10px 14px;border-radius:12px;background:color-mix(in srgb, ${bg} 16%, transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb, ${bg} 40%, transparent);color:${bg};font-size:24px;font-weight:700">${t}</span><small style="font-size:15px;color:var(--k-text-secondary)">${label}</small></div>`;

const cardField = (val, ok) => `<div class="k-field"><label class="k-label">شماره کارت</label><div class="k-input"><input class="k-input__control" dir="ltr" value="${val}" style="font-size:19px" ${ok ? "" : 'aria-invalid="true"'}>${ok ? `<span class="k-input__addon" style="font-size:14px">بانک ملی</span>` : ""}</div>${ok ? `<p class="k-hint">${icon("check", 14)} شماره معتبر است</p>` : `<p class="k-hint k-hint--error">این شماره کارت معتبر نیست؛ رقم‌ها را دوباره بررسی کنید.</p>`}</div>`;
const ibanField = (val, ok) => `<div class="k-field"><label class="k-label">شماره شبا</label><div class="k-input" dir="ltr"><span class="k-input__addon" style="font-weight:800">IR</span><input class="k-input__control" dir="ltr" value="${val}" style="font-size:17px" ${ok ? "" : 'aria-invalid="true"'}></div>${ok ? `<p class="k-hint">بانک پارسیان</p>` : `<p class="k-hint k-hint--error">این شماره شبا معتبر نیست؛ آن را با اپ بانک مقایسه کنید.</p>`}</div>`;

export const figures = [
  frame(`<div dir="ltr" style="display:flex;justify-content:center;gap:6px">${cells.join("")}</div>
    <p style="margin:0;text-align:center;font-size:19px">جمع: <b>${sum.toLocaleString("fa-IR")}</b> · بر ۱۰ بخش‌پذیر است، پس شماره معتبر است</p>`),
  frame(`<div dir="ltr" style="display:flex;justify-content:center;gap:12px">${seg("IR", "کشور", "#fde68a")}${seg("82", "رقم کنترل", "#fecaca")}${seg("054", "بانک (پارسیان)", "#bfdbfe")}${seg("0102680020817909002", "شمارهٔ حساب", "#e5e7eb")}</div>
    <div dir="ltr" style="display:flex;align-items:center;justify-content:center;gap:14px;font-size:18px"><code class="fx-mono">0540102680020817909002<b style="color:#b45309">1827</b><b style="color:#be123c">82</b></code><span>mod 97 = <b style="color:var(--k-text-success)">1</b></span></div>
    <p class="fx-note" style="text-align:center">چهار نویسهٔ اول به انتها می‌روند و I و R به ۱۸ و ۲۷ تبدیل می‌شوند</p>`),
  `<div class="fx-grid2">${frame(cardField("6037 9912 3456 7893", true) + ibanField("82 0540 1026 8002 0817 9090 02", true), { label: "معتبر" })}${frame(cardField("6037 9912 3456 7894", false) + ibanField("82 0540 1026 8002 0817 9090 03", false), { label: "نامعتبر" })}</div>`,
];
