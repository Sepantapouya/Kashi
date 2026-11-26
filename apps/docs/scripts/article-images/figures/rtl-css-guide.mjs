import { compare, frame, code, btn, field, icon } from "../kit.mjs";

const card = (style) => `<div style="display:flex;align-items:center;padding:20px;border:1px solid var(--k-border-secondary);border-radius:16px;background:var(--k-bg-primary)">
  <span style="display:grid;place-items:center;width:48px;height:48px;border-radius:12px;background:var(--k-bg-brand-subtle);color:var(--k-text-brand);${style}">${icon("bell", 24)}</span>
  <span style="display:grid;gap:4px"><b style="font-size:18px">اعلان تازه</b><small style="color:var(--k-text-tertiary);font-size:15px">سفارش شما ارسال شد</small></span></div>`;

export const figures = [
  compare(
    card("margin-left:16px") + `<p class="fx-mono" style="margin:0;color:var(--k-text-error);font-size:16px">margin-left: 16px</p>`,
    card("margin-inline-end:16px") + `<p class="fx-mono" style="margin:0;color:var(--k-text-success);font-size:16px">margin-inline-end: 16px</p>`,
  ),
  compare(
    frame(`<div style="display:flex;flex-direction:row-reverse;gap:12px;justify-content:flex-end">${btn("۱ ذخیره")}${btn("۲ پیش‌نمایش", "secondary")}${btn("۳ انصراف", "tertiary")}</div><p class="fx-note">ترتیب تب: ۱ ← ۲ ← ۳، ولی روی صفحه برعکس دیده می‌شود</p>`),
    frame(`<div style="display:flex;gap:12px">${btn("۱ ذخیره")}${btn("۲ پیش‌نمایش", "secondary")}${btn("۳ انصراف", "tertiary")}</div><p class="fx-note">فلکس معمولی؛ ترتیب دیدن و ترتیب تب یکی است</p>`),
    { badLabel: "row-reverse برای راست‌چین", goodLabel: "فلکس معمولی در dir=rtl" },
  ),
  compare(
    `<p style="margin:0;font-size:20px;line-height:2">پکیج @kashi-ui/react را نصب کنید.</p>` + field("شماره کارت", "6037 9912 3456 7893", { hint: "گروه‌های عدد برعکس دیده می‌شوند" }),
    `<p style="margin:0;font-size:20px;line-height:2">پکیج <bdi class="fx-mono">@kashi-ui/react</bdi> را نصب کنید.</p>` + field("شماره کارت", "6037 9912 3456 7893", { ltr: true, hint: "<bdi>dir=ltr</bdi> روی فیلد، برچسب فارسی" }),
  ),
];
