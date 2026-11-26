import { frame, code, btn, icon } from "../kit.mjs";

const word = (txt, label, tone) => `<div style="display:grid;justify-items:center;gap:14px;padding:30px 20px;border:1px solid var(--k-border-secondary);border-radius:18px;background:var(--k-bg-primary)">
  <span style="font-size:52px;font-weight:700">${txt}</span>
  <span class="k-badge k-badge--${tone}">${label}</span></div>`;

export const figures = [
  `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
    ${word("می خواهید", "فاصلهٔ کامل: دو تکه", "error")}
    ${word("میخواهید", "بدون فاصله: چسبیده", "error")}
    ${word("می‌خواهید", "نیم‌فاصله: درست", "success")}
  </div>`,
  frame(`
    <div class="k-field"><label class="k-label">عنوان آگهی</label>
      <textarea class="k-input__control" style="min-height:80px;padding:12px 14px;border:1px solid var(--k-border-input);border-radius:10px;font:18px/1.9 var(--k-font-sans);width:100%">مي خواهم دوچرخه هاي قديمي را بفروشم 2 عدد</textarea></div>
    <div style="display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:12px;background:var(--k-bg-warning-subtle, #fff7e6)">
      <span style="color:var(--k-text-warning)">${icon("magic-wand", 22)}</span>
      <span style="flex:1;font-size:16px">۵ مورد قابل‌اصلاح: ۲ نیم‌فاصله، ۲ حرف عربی و ۱ رقم انگلیسی</span>
      ${btn("اصلاح همه", "secondary")}
    </div>
    <p style="margin:0;font-size:18px;line-height:1.9">پیش‌نمایش: <b>می‌خواهم دوچرخه‌های قدیمی را بفروشم ۲ عدد</b></p>`, { label: "پیشنهاد اصلاح، نه تغییر بی‌صدا" }),
  `<div class="fx-grid2">${code(`{
  "delete": "می·خواهید حذف کنید؟",
  "saved": "تغییرها ذخیره شد"
}`, { title: "fa.json · درست (· = نیم‌فاصله)" })}${code(`{
  "delete": "می خواهید حذف کنید؟",
  "saved": "تغییر ها ذخیره شد"
}`, { title: "fa.json · بعد از کپی از ورد" })}</div>`,
];
