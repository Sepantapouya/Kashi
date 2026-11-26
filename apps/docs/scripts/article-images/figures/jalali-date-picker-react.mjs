import { flow, compare, code, frame, field, icon } from "../kit.mjs";

const days = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
// آبان ۱۴۰۵: اول آبان جمعه است (ستون هفتم)
const startCol = 6;
const fa = (n) => n.toLocaleString("fa-IR");
const cells = Array.from({ length: startCol }, () => "<span></span>").join("") + Array.from({ length: 30 }, (_, i) => {
  const d = i + 1, col = (startCol + i) % 7;
  const st = d === 18 ? "background:var(--k-bg-brand);color:#fff;font-weight:800" : col === 6 ? "color:var(--k-text-error)" : "";
  return `<span style="display:grid;place-items:center;height:44px;border-radius:10px;font-size:17px;${st}">${fa(d)}</span>`;
}).join("");

export const figures = [
  flow([
    { icon: "calendar", title: "کاربر انتخاب می‌کند", text: "۱۸ آبان ۱۴۰۵" },
    { icon: "swap", title: "تبدیل", text: "toISODate" },
    { icon: "database", title: "ذخیره در سرور", text: "2026-11-09" },
    { icon: "eye", title: "نمایش دوباره", text: "دوشنبه ۱۸ آبان" },
  ]),
  compare(
    code(`// ایران: UTC+3:30
const d = new Date(2026, 10, 9);
d.toISOString().slice(0, 10);
// "2026-11-08"  ← یک روز عقب!`),
    code(`import { toISODate } from "@kashi-ui/persian";

toISODate(new Date(2026, 10, 9));
// "2026-11-09"  ← همان روز`),
  ),
  `<div style="display:grid;grid-template-columns:380px 1fr;gap:28px;align-items:start">
    ${frame(field("تاریخ نوبت", "۱۴۰۵/۰۸/۱۸", { addon: icon("calendar", 18), hint: "مثل ۱۴۰۵/۰۸/۱۸ تایپ کنید یا از تقویم انتخاب کنید" }))}
    ${frame(`<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:20px">آبان ۱۴۰۵</b><span style="display:flex;gap:8px;color:var(--k-text-tertiary)">${icon("chevron-right", 22)}${icon("chevron-left", 22)}</span></div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center">${days.map((d, i) => `<b style="font-size:15px;color:${i === 6 ? "var(--k-text-error)" : "var(--k-text-tertiary)"}">${d}</b>`).join("")}${cells}</div>`)}
  </div>`,
];
