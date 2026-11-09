import { frame, table, field, alert, btn, icon } from "../kit.mjs";

const part = (n, label, text, color) => `<div style="display:grid;grid-template-columns:40px 1fr;gap:14px;align-items:start"><span style="display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:${color};color:#fff;font-weight:800">${n}</span><div><b style="display:block;font-size:15px;color:${color}">${label}</b><span style="font-size:20px">${text}</span></div></div>`;

const bad = (t) => `<span style="color:var(--k-text-tertiary)">${t}</span>`;
const good = (t) => `<b style="font-weight:600">${t}</b>`;

export const figures = [
  frame(`<div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:center">
    <div class="k-alert k-alert--error" role="alert"><span class="k-alert__icon">${icon("x-circle", 20)}</span><div class="k-alert__content"><p class="k-alert__title">پرداخت انجام نشد</p><p class="k-alert__description">موجودی کارت کافی نیست. کارت دیگری امتحان کنید یا مبلغ کمتری انتخاب کنید.</p><div class="k-alert__actions">${btn("انتخاب کارت دیگر", "secondary")}</div></div></div>
    <div style="display:grid;gap:18px">${part("۱", "چه شد", "پرداخت انجام نشد", "#be123c")}${part("۲", "چرا", "موجودی کارت کافی نیست", "#c2410c")}${part("۳", "حالا چه کنیم", "کارت دیگری امتحان کنید", "#0b8077")}</div>
  </div>`),
  table(["موقعیت", "پیش از این", "بهتر"], [
    ["فرم", bad("ورودی نامعتبر است."), good("شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.")],
    ["ذخیره", bad("خطای ناشناخته رخ داد."), good("ذخیره نشد. اتصال اینترنت را بررسی کنید و دوباره امتحان کنید.")],
    ["پرداخت", bad("تراکنش ناموفق (کد ۵۱)."), good("پرداخت انجام نشد؛ موجودی کارت کافی نیست.")],
    ["آپلود", bad("حجم فایل غیرمجاز."), good("این فایل ۱۲ مگابایت است؛ حداکثر ۵ مگابایت مجاز است.")],
  ]),
  `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px">
    ${frame(field("کد پستی", "۸۱۴۶۷۱", { error: "کد پستی باید ۱۰ رقم باشد." }), { label: "کنار فیلد" })}
    ${frame(alert("ثبت نشد", "سرور پاسخ نداد. اطلاعات شما سر جایش است؛ چند لحظه بعد دوباره بزنید.", "error", "x-circle"), { label: "بالای فرم" })}
    ${frame(`<div style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;background:#111827;color:#fff;box-shadow:0 14px 30px -12px rgb(0 0 0/.4)">${icon("cloud-off", 20)}<span style="flex:1;font-size:15px">ذخیرهٔ خودکار انجام نشد</span><b style="color:#5eead4;font-size:15px">دوباره</b></div>`, { label: "اعلان کوتاه" })}
  </div>`,
];
