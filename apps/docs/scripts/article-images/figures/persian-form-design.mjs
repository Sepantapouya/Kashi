import { compare, frame, field, btn, icon } from "../kit.mjs";

const ph = (p) => `<div class="k-input"><input class="k-input__control" placeholder="${p}"></div>`;
const section = (title, inner) => `<div style="display:grid;gap:14px"><b style="font-size:17px;color:var(--k-text-brand)">${title}</b>${inner}</div>`;
const optional = (label, val) => `<div class="k-field"><label class="k-label">${label} <span style="color:var(--k-text-tertiary);font-weight:400">(اختیاری)</span></label><div class="k-input"><input class="k-input__control" value="${val}"></div></div>`;

const bankAddon = `<span style="display:inline-flex;align-items:center;gap:6px;font-size:14px;color:var(--k-text-secondary)"><span style="width:22px;height:22px;border-radius:6px;background:#0b6e3f"></span>بانک ملی</span>`;

export const figures = [
  compare(
    frame(`<div class="fx-grid2">${ph("نام")}${ph("نام خانوادگی")}${ph("موبایل")}${ph("ایمیل")}${ph("کد پستی")}${ph("کد معرف")}</div>${btn("ارسال", "secondary")}`),
    frame(field("نام و نام خانوادگی", "سارا محمدی") + field("شماره موبایل", "۰۹۱۲ ۳۴۵ ۶۷۸۹", { hint: "همراه اول", ltr: true }) + optional("کد معرف", "") + btn("ثبت‌نام")),
    { badLabel: "دو ستون، placeholder به‌جای برچسب", goodLabel: "تک‌ستون، برچسب واقعی" },
  ),
  `<div class="fx-grid2">
    ${frame(`<div class="k-field"><label class="k-label">شماره کارت</label><div class="k-input"><input class="k-input__control" dir="ltr" value="6037 9912 3456 7893" style="font-size:20px;letter-spacing:1px"><span class="k-input__addon">${bankAddon}</span></div><p class="k-hint">نام بانک از شش رقم اول تشخیص داده شد</p></div>`, { label: "کارت بانکی" })}
    ${frame(`<div class="k-field"><label class="k-label">شماره شبا</label><div class="k-input" dir="ltr"><span class="k-input__addon" style="font-weight:800">IR</span><input class="k-input__control" dir="ltr" value="82 0540 1026 8002 0817 9090 02" style="font-size:18px"></div><p class="k-hint">بانک پارسیان · ۲۴ رقم بعد از IR</p></div>`, { label: "شبا" })}
  </div>`,
  frame(
    section("اطلاعات تماس", `<div class="fx-grid2">${field("نام و نام خانوادگی", "سارا محمدی")}${field("شماره موبایل", "۰۹۱۲ ۳۴۵ ۶۷۸۹", { ltr: true })}</div>`) +
    `<hr style="border:0;border-top:1px solid var(--k-border-secondary);margin:22px 0">` +
    section("نشانی تحویل", `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">${field("استان", "اصفهان")}${field("شهر", "اصفهان")}${field("کد پستی", "۸۱۴۶۷-۱۳۴۷۸", { ltr: true })}</div>${field("نشانی", "خیابان چهارباغ، کوچهٔ ۱۲")}`) +
    `<hr style="border:0;border-top:1px solid var(--k-border-secondary);margin:22px 0">` +
    section("پرداخت", `<div style="display:flex;gap:12px;align-items:center">${btn("ثبت سفارش و پرداخت", "primary", "lock")}<span class="fx-note">پرداخت امن از درگاه بانکی</span></div>`),
  ),
];
