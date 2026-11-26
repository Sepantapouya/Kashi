import { frame, table, icon } from "../kit.mjs";

const stat = (label, value, change, up, ic) => `<div style="display:grid;gap:8px;padding:20px;border:1px solid var(--k-border-secondary);border-radius:16px;background:var(--k-bg-primary)">
  <div style="display:flex;align-items:center;gap:10px;color:var(--k-text-secondary);font-size:15px"><span style="display:grid;place-items:center;width:34px;height:34px;border-radius:10px;border:1px solid var(--k-border-secondary)">${icon(ic, 18)}</span>${label}</div>
  <b style="font-size:28px;letter-spacing:-0.02em">${value}</b>
  <span style="font-size:14px;color:var(--k-text-tertiary)"><b style="color:var(--k-text-${up ? "success" : "error"})">${change} ${up ? "↑" : "↓"}</b> نسبت به ماه قبل</span></div>`;

const months = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان"];
const vals = [38, 42, 41, 47, 52, 50, 56, 61];
const W = 1000, H = 260, pad = 30;
const pts = vals.map((v, i) => [W - pad - (i * (W - 2 * pad)) / (vals.length - 1), H - pad - ((v - 30) / 35) * (H - 2 * pad)]);
const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
const area = `${line} L${pts.at(-1)[0]} ${H - pad} L${pts[0][0]} ${H - pad} Z`;
const chart = `<svg viewBox="0 0 ${W} ${H + 30}" style="width:100%">
  ${[0, 1, 2, 3].map((i) => `<line x1="${pad}" x2="${W - pad}" y1="${pad + i * ((H - 2 * pad) / 3)}" y2="${pad + i * ((H - 2 * pad) / 3)}" stroke="var(--k-border-secondary)"/>`).join("")}
  <path d="${area}" fill="color-mix(in srgb, var(--k-bg-brand) 14%, transparent)"/><path d="${line}" fill="none" stroke="var(--k-bg-brand)" stroke-width="3"/>
  ${pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="var(--k-bg-primary)" stroke="var(--k-bg-brand)" stroke-width="2.5"/>`).join("")}
  ${pts.map((p, i) => `<text x="${p[0]}" y="${H + 18}" text-anchor="middle" font-size="15" fill="var(--k-text-tertiary)" font-family="Vazirmatn">${months[i]}</text>`).join("")}
  <text x="${pts[0][0] - 6}" y="${pts[0][1] - 16}" text-anchor="middle" font-size="14" fill="var(--k-text-error)" font-family="Vazirmatn">نوروز</text>
</svg>`;

export const figures = [
  frame(`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">${stat("فروش این ماه", "۱۸۴ میلیون", "۱۲٫۴٪", true, "wallet")}${stat("سفارش‌ها", "۱٬۲۴۸", "۸٫۱٪", true, "cart")}${stat("نرخ تبدیل", "۳٫۸٪", "۰٫۶٪", false, "target")}${stat("کاربر فعال", "۱۲٬۴۴۰", "۲٫۴٪", true, "users")}</div>
    <div style="height:110px;border-radius:14px;background:linear-gradient(180deg,color-mix(in srgb,var(--k-bg-brand) 10%,transparent),transparent);border:1px dashed var(--k-border-secondary);display:grid;place-items:center;color:var(--k-text-tertiary)">نمودار روند</div>
    <div style="height:70px;border-radius:14px;border:1px dashed var(--k-border-secondary);display:grid;place-items:center;color:var(--k-text-tertiary)">جدول جزئیات</div>`),
  frame(`<div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:20px">درآمد ماهانهٔ ۱۴۰۵</b><span style="color:var(--k-text-tertiary)">میلیون تومان</span></div>${chart}`),
  table(["سفارش", "مشتری", "تاریخ", "وضعیت", "مبلغ (تومان)"], [
    ["#۴۸۲۱", "سارا محمدی", "۱۸ آبان", `<span class="k-badge k-badge--success"><span class="k-badge__dot"></span>ارسال شد</span>`, "۱٬۲۵۰٬۰۰۰"],
    ["#۴۸۲۰", "علی رضایی", "۱۸ آبان", `<span class="k-badge k-badge--warning"><span class="k-badge__dot"></span>در حال آماده‌سازی</span>`, "۸۹٬۰۰۰"],
    ["#۴۸۱۹", "مریم صادقی", "۱۷ آبان", `<span class="k-badge k-badge--success"><span class="k-badge__dot"></span>ارسال شد</span>`, "۱۱٬۴۰۰٬۰۰۰"],
    ["#۴۸۱۸", "رضا کریمی", "۱۷ آبان", `<span class="k-badge k-badge--error"><span class="k-badge__dot"></span>لغو شد</span>`, "۴۵۶٬۰۰۰"],
  ], { num: [4] }),
];
