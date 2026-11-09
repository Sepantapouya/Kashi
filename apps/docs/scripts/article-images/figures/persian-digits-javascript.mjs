import { frame, flow } from "../kit.mjs";

const row = (name, ds, code, hl) => `<div style="display:grid;grid-template-columns:200px 1fr 220px;align-items:center;gap:20px;padding:18px 24px;border-bottom:1px solid var(--k-border-secondary)">
  <b style="font-size:19px">${name}</b>
  <span style="font-size:36px;letter-spacing:6px;direction:ltr;text-align:left">${ds.split("").map((d, i) => [4, 5, 6].includes(i) && hl ? `<span style="color:var(--k-text-brand)">${d}</span>` : d).join("")}</span>
  <code class="fx-mono" style="font-size:16px;color:var(--k-text-tertiary)">${code}</code></div>`;

const list = (items) => `<ul style="margin:0;padding:0;list-style:none;display:grid;gap:12px">${items.map(([t, ex]) => `<li style="display:flex;justify-content:space-between;gap:16px;padding:14px 18px;border-radius:12px;background:var(--k-bg-secondary);font-size:17px"><span>${t}</span><b>${ex}</b></li>`).join("")}</ul>`;

export const figures = [
  frame(row("انگلیسی", "0123456789", "U+0030–0039") + row("فارسی", "۰۱۲۳۴۵۶۷۸۹", "U+06F0–06F9", true) + row("عربی", "٠١٢٣٤٥٦٧٨٩", "U+0660–0669", true)),
  flow([
    { icon: "keyboard", title: "ورودی کاربر", text: "<bdi dir=ltr>۰۹۱۲-۳۴۵ ٦٧٨٩</bdi>" },
    { icon: "swap", title: "یکسان‌سازی", text: "09123456789" },
    { icon: "check", title: "اعتبارسنجی و ذخیره", text: "با رقم لاتین" },
    { icon: "eye", title: "نمایش", text: "<bdi dir=ltr>۰۹۱۲ ۳۴۵ ۶۷۸۹</bdi>" },
  ]),
  `<div class="fx-grid2">${frame(list([["قیمت", "۱٬۲۵۰٬۰۰۰ تومان"], ["تاریخ", "۱۸ آبان ۱۴۰۵"], ["تعداد", "۱۲ سفارش"], ["درصد", "۱۸٪"]]), { label: "رقم فارسی: محتوای خواندنی" })}${frame(list([["کد تخفیف", "NOROOZ1405"], ["شبا برای کپی", "IR82 0540 …"], ["نسخه", "v2.1.0"], ["ایمیل", "ali92@mail.com"]]), { label: "رقم لاتین: کد و چیزهای کپی‌شدنی" })}</div>`,
];
