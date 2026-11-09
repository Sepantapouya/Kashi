import { tiles, table, icon } from "../kit.mjs";

const y = (t) => `<span style="color:var(--k-text-success);font-weight:700">${t}</span>`;
const m = (t) => `<span style="color:var(--k-text-warning, #b45309);font-weight:600">${t}</span>`;
const n = (t) => `<span style="color:var(--k-text-tertiary)">${t}</span>`;

const node = (t, tone = "q") => `<div style="padding:14px 18px;border-radius:14px;text-align:center;font-size:16px;font-weight:700;${tone === "q" ? "background:var(--k-bg-primary);border:1px solid var(--k-border-secondary)" : "background:var(--k-bg-brand-subtle);color:var(--k-text-brand)"}">${t}</div>`;
const lab = (t) => `<small style="display:block;text-align:center;color:var(--k-text-tertiary);font-size:14px;margin:6px 0">${t}</small>`;

export const figures = [
  tiles([
    { icon: "align-right", title: "راست‌به‌چپ", text: "از پایه یا اضافه‌شده؟" },
    { icon: "calendar", title: "تقویم شمسی", text: "داخلی، افزونه یا هیچ", color: "#2740ed" },
    { icon: "id-card", title: "فیلدهای ایرانی", text: "کد ملی، کارت، شبا، پلاک", color: "#7c3aed" },
    { icon: "type", title: "فونت و ارقام", text: "ارقام فارسی و تومان", color: "#c2410c" },
    { icon: "palette", title: "انعطاف ظاهری", text: "نزدیک شدن به برند شما", color: "#be123c" },
    { icon: "users", title: "بلوغ و جامعه", text: "سابقه و پاسخ‌گویی", color: "#0f766e" },
  ], 3),
  table(["معیار", "MUI", "Ant Design", "shadcn/ui", "کاشی"], [
    ["راست‌به‌چپ", m("با تنظیم تم"), m("با ConfigProvider"), m("بسته به کلاس‌ها"), y("از پایه")],
    ["تقویم شمسی", m("با آداپتور جلالی"), m("با بستهٔ جامعه"), m("با کار اضافه"), y("داخلی")],
    ["فیلدهای ایرانی", n("ندارد"), n("ندارد"), n("ندارد"), y("دارد")],
    ["انعطاف ظاهری", m("متوسط"), m("متوسط"), y("کامل (کد مال شماست)"), y("توکن و تم‌ساز")],
    ["بلوغ و جامعه", y("بسیار زیاد"), y("بسیار زیاد"), y("زیاد"), m("جوان‌تر")],
    ["فریم‌ورک", n("React"), n("React"), n("React"), y("React و وب کامپوننت")],
  ]),
  `<div style="display:grid;gap:4px;max-width:1000px;margin:0 auto">
    ${node("محصول فارسی‌محور است و فرم ایرانی و تاریخ شمسی زیاد دارد؟")}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
      <div>${lab("بله")}${node("کتابخانهٔ فارسی‌محور، مثل کاشی", "a")}</div>
      <div>${lab("نه")}${node("تیم با کتابخانهٔ خاصی آشناست؟")}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div>${lab("بله")}${node("همان را نگه دارید؛ فقط بخش فارسی را اضافه کنید", "a")}</div><div>${lab("نه")}${node("پنل سازمانی: MUI یا Ant · کنترل کامل: shadcn", "a")}</div></div>
      </div>
    </div>
  </div>`,
];
