import { compare, frame, flow, tiles, btn } from "../kit.mjs";

const layer = (title, text, items, color) => `<div style="display:grid;grid-template-columns:220px 1fr;align-items:center;gap:24px;padding:22px 28px;border:1px solid var(--k-border-secondary);border-radius:18px;background:var(--k-bg-primary)">
  <div><b style="display:block;font-size:20px;color:${color}">${title}</b><small style="color:var(--k-text-tertiary);font-size:15px">${text}</small></div>
  <div class="fx-row">${items}</div></div>`;
const chip = (t) => `<span style="padding:6px 14px;border-radius:10px;background:var(--k-bg-secondary);border:1px solid var(--k-border-secondary);font-size:15px">${t}</span>`;
const dot = (c) => `<span style="width:30px;height:30px;border-radius:50%;background:${c}"></span>`;

export const figures = [
  `<div style="display:grid;gap:14px">
    ${layer("الگوها", "ترکیب کامپوننت‌ها", [chip("فرم ثبت‌نام"), chip("صفحهٔ پرداخت"), chip("داشبورد")].join(""), "#7c3aed")}
    ${layer("کامپوننت‌ها", "قطعه‌های آماده", btn("ذخیره") + btn("انصراف", "secondary") + `<span class="k-badge k-badge--success">فعال</span>`, "#2740ed")}
    ${layer("توکن‌ها", "تصمیم‌های پایه", dot("#0b8077") + dot("#3d5ef8") + dot("#f98307") + chip("فاصله ۱۶") + chip("گردی ۱۲"), "#0b8077")}
  </div>`,
  compare(
    frame(`<div class="fx-row"><button style="padding:10px 22px;border:0;border-radius:6px;background:#16a34a;color:#fff;font:700 16px var(--k-font-sans)">ذخیره</button><button style="padding:12px 18px;border:0;border-radius:14px;background:#15803d;color:#fff;font:500 15px Tahoma">ذخيره</button><button style="padding:8px 26px;border:2px solid #22c55e;border-radius:2px;background:#fff;color:#22c55e;font:600 17px var(--k-font-sans)">ثبت</button></div><p class="fx-note">سه صفحه، سه دکمه، سه سبز</p>`),
    frame(`<div class="fx-row">${btn("ذخیره")}${btn("ذخیره")}${btn("ذخیره")}</div><p class="fx-note">یک کامپوننت، یک توکن رنگ</p>`),
    { badLabel: "بدون دیزاین سیستم", goodLabel: "با دیزاین سیستم" },
  ),
  tiles([
    { icon: "align-right", title: "راست‌به‌چپ", text: "جهت، آیکون و متن دوجهته" },
    { icon: "calendar", title: "تقویم شمسی", text: "تعطیلی‌ها و هفته از شنبه", color: "#2740ed" },
    { icon: "hash", title: "ارقام فارسی", text: "و قیمت به تومان", color: "#c2410c" },
    { icon: "id-card", title: "فرم‌های ایرانی", text: "کد ملی، شبا، پلاک", color: "#7c3aed" },
    { icon: "type", title: "فونت فارسی", text: "وزن کامل، ارقام هم‌عرض", color: "#0f766e" },
    { icon: "pen", title: "فارسی‌نویسی", text: "نیم‌فاصله و لحن", color: "#be123c" },
  ], 3),
];
