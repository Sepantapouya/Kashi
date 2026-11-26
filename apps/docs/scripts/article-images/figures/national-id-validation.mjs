import { frame, tiles, field, icon } from "../kit.mjs";

const digits = "1234567891".split("");
const fa = (n) => Number(n).toLocaleString("fa-IR");
const box = (d, w, last) => `<div style="display:grid;justify-items:center;gap:10px">
  <span style="display:grid;place-items:center;width:84px;height:84px;border-radius:16px;font-size:38px;font-weight:800;${last ? "background:var(--k-bg-brand);color:#fff" : "background:var(--k-bg-primary);border:1px solid var(--k-border-secondary)"}">${fa(d)}</span>
  <small style="font-size:16px;color:${last ? "var(--k-text-brand)" : "var(--k-text-tertiary)"};font-weight:700">${last ? "کنترل" : "× " + fa(w)}</small></div>`;

export const figures = [
  frame(`<div dir="ltr" style="display:flex;justify-content:center;gap:10px">${digits.map((d, i) => box(d, 10 - i, i === 9)).join("")}</div>
    <p style="margin:0;text-align:center;font-size:18px;line-height:2">جمع حاصل‌ضرب‌ها: <b>۲۱۰</b> · باقی‌مانده بر ۱۱: <b>۱</b> · چون کمتر از ۲ است، رقم کنترل باید <b style="color:var(--k-text-brand)">۱</b> باشد</p>`),
  tiles([
    { icon: "keyboard", title: "رد کردن ارقام فارسی", text: "«۱۲۳۴۵۶۷۸۹۱» نامعتبر اعلام می‌شود چون فقط 0-9 پذیرفته شده", color: "#be123c" },
    { icon: "hash", title: "حذف صفر اول", text: "۰۰۱۲۳۴۵۶۷۸ در type=number یا ستون عددی به ۱۲۳۴۵۶۷۸ تبدیل می‌شود", color: "#c2410c" },
    { icon: "clock", title: "خطای زودهنگام", text: "پیام خطا وقتی کاربر هنوز رقم سوم را تایپ می‌کند", color: "#7c3aed" },
  ]),
  `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
    ${frame(field("کد ملی", "", { hint: "۱۰ رقم، بدون خط تیره", placeholder: "مثل ۰۰۱۲۳۴۵۶۷۸" }), { label: "پیش از تایپ" })}
    ${frame(field("کد ملی", "۱۲۳۴۵۶۷۸۹۱", { addon: `<span style="color:var(--k-text-success)">${icon("check", 18)}</span>`, hint: "کد ملی معتبر است" }), { label: "معتبر" })}
    ${frame(field("کد ملی", "۱۲۳۴۵۶۷۸۹۲", { error: "این کد ملی معتبر نیست؛ رقم‌ها را دوباره بررسی کنید." }), { label: "نامعتبر" })}
  </div>`,
];
