import { compare, btn, badge, icon } from "../kit.mjs";

const order = `<div style="display:grid;gap:14px;padding:24px;border:1px solid var(--k-border-secondary);border-radius:18px;background:var(--k-bg-primary);color:var(--k-text-primary)">
  <div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:20px">سفارش #۴۸۲۱</b>${badge("ارسال شد", "success", true)}</div>
  <p style="margin:0;color:var(--k-text-tertiary);font-size:16px;line-height:1.9">۳ کالا · تحویل تا پنجشنبه ۲۱ آبان</p>
  <div style="display:flex;gap:10px">${btn("پیگیری مرسوله")}${btn("فاکتور", "secondary")}</div></div>`;

const themed = (t, inner) => `<div data-theme="${t}" style="padding:28px;border-radius:20px;background:var(--k-bg-secondary)">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;color:var(--k-text-secondary);font-weight:700">${icon(t === "dark" ? "moon" : "sun", 18)}${t === "dark" ? "تیره" : "روشن"}</div>${inner}</div>`;

const naive = `<div style="padding:28px;border-radius:20px;background:#000;filter:none">
  <div style="display:grid;gap:14px;padding:24px;border:1px solid #fff;border-radius:18px;background:#000;color:#fff">
    <div style="display:flex;justify-content:space-between"><b style="font-size:20px">سفارش #۴۸۲۱</b><span style="padding:2px 12px;border-radius:99px;background:#0f0;color:#000;font-weight:700">ارسال شد</span></div>
    <p style="margin:0;color:#fff;font-size:16px">۳ کالا · تحویل تا پنجشنبه ۲۱ آبان</p>
    <div style="display:flex;gap:10px"><span style="padding:10px 18px;border-radius:8px;background:#f47f88;color:#000;font-weight:700">پیگیری مرسوله</span></div></div></div>`;

const chart = (t) => themed(t, `<div style="display:flex;align-items:flex-end;gap:14px;height:170px;padding:16px;border-radius:14px;background:var(--k-bg-primary)">${[40, 65, 52, 80, 70, 95].map((h) => `<i style="flex:1;height:${h}%;border-radius:8px 8px 3px 3px;background:var(--k-bg-brand)"></i>`).join("")}</div>`);

export const figures = [
  `<div class="fx-grid2">${themed("light", order)}${themed("dark", order)}</div>`,
  compare(naive, themed("dark", order), { badLabel: "برعکس‌شده: سیاه مطلق و رنگ تند", goodLabel: "تنظیم‌شده با توکن" }),
  `<div class="fx-grid2">${chart("light")}${chart("dark")}</div>`,
];
