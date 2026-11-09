import { compare, frame, code, icon } from "../kit.mjs";

const crumb = (sep) => `<div style="display:flex;align-items:center;gap:8px;font-size:17px;color:var(--k-text-secondary)">خانه<span style="color:var(--k-text-quaternary)">${icon(sep, 16)}</span>محصولات<span style="color:var(--k-text-quaternary)">${icon(sep, 16)}</span><b style="color:var(--k-text-primary)">هدفون</b></div>`;
const nav = (next, prev) => `<div style="display:flex;justify-content:space-between;gap:12px">
  <button class="k-btn k-btn--secondary k-btn--md">${icon(prev, 18)}قبلی</button>
  <button class="k-btn k-btn--primary k-btn--md">ادامه${icon(next, 18)}</button></div>`;

const cell = (name, label) => `<div style="display:grid;justify-items:center;gap:8px;padding:16px 8px;border-radius:14px;background:var(--k-bg-secondary)">${icon(name, 36)}<small style="font-size:14px;color:var(--k-text-secondary)">${label}</small></div>`;
const group = (title, tone, items) => `<div style="display:grid;gap:14px;padding:24px;border:1px solid var(--k-border-secondary);border-radius:18px;background:var(--k-bg-primary)">
  <b style="font-size:18px;color:var(--k-text-${tone})">${title}</b>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">${items.map(([n, l]) => cell(n, l)).join("")}</div></div>`;

export const figures = [
  compare(
    frame(crumb("chevron-right") + nav("arrow-right", "arrow-left")),
    frame(crumb("chevron-left") + nav("arrow-left", "arrow-right")),
    { badLabel: "فلش‌ها مثل رابط انگلیسی", goodLabel: "فلش‌ها در جهت جریان فارسی" },
  ),
  `<div class="fx-grid2">
    ${group("قرینه می‌شوند: جهت جریان", "brand", [["arrow-left", "بعدی"], ["chevron-left", "زیرمنو"], ["send", "ارسال"], ["undo", "واگرد"], ["align-right", "تراز ابتدا"], ["skip-next", "بعدی"], ["logout", "خروج"], ["reply", "پاسخ"]])}
    ${group("ثابت می‌مانند: اشیا، زمان، نماد", "secondary", [["search", "جستجو"], ["clock", "ساعت"], ["check", "تیک"], ["lock", "قفل"], ["play", "پخش"], ["refresh", "به‌روزرسانی"], ["trending-up", "صعودی"], ["camera", "دوربین"]])}
  </div>`,
  `<div style="display:grid;grid-template-columns:1.1fr 1fr;gap:24px;align-items:center">
    ${code(`import { Icon } from "@kashi-ui/icons/react";

<Icon name="arrow-left" />
<Icon name="arrow-right" mirror />`, { title: "Pager.tsx" })}
    <div style="display:grid;gap:16px">
      ${frame(`<div class="fx-label">fa · rtl</div>${nav("arrow-left", "arrow-right")}`)}
      <div dir="ltr">${frame(`<div class="fx-label">en · ltr</div><div style="display:flex;justify-content:space-between;gap:12px"><button class="k-btn k-btn--secondary k-btn--md">${icon("arrow-left", 18)}Back</button><button class="k-btn k-btn--primary k-btn--md">Next${icon("arrow-right", 18)}</button></div>`)}</div>
    </div>
  </div>`,
];
