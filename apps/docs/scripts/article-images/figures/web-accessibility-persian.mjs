import { compare, frame, code, field, btn, badge } from "../kit.mjs";

const sampleRow = (color, ratio, pass) => `<div style="display:grid;grid-template-columns:1fr 140px 120px;align-items:center;gap:20px;padding:18px 24px;border-bottom:1px solid var(--k-border-secondary)">
  <span style="font-size:22px;color:${color}">سفارش شما فردا ارسال می‌شود.</span>
  <b style="font-size:20px">${ratio} به ۱</b>${pass ? badge("قبول", "success", true) : badge("رد", "error", true)}</div>`;

const login = (focus) => `<div style="display:grid;gap:16px">
  <div class="k-field"><label class="k-label">ایمیل</label><div class="k-input" style="${focus ? "border-color:var(--k-border-brand);box-shadow:0 0 0 4px color-mix(in srgb,var(--k-bg-brand) 25%,transparent)" : ""}"><input class="k-input__control" dir="ltr" value="sara@example.com"></div></div>
  <div class="k-field"><label class="k-label">رمز عبور</label><div class="k-input"><input class="k-input__control" type="password" value="12345678"></div></div>
  ${btn("ورود")}</div>`;

export const figures = [
  frame(sampleRow("#c4c9cf", "۱٫۷", false) + sampleRow("#6b7280", "۴٫۸", true) + sampleRow("#1f2937", "۱۴٫۷", true)),
  compare(frame(login(false) + `<p class="fx-note">فوکوس روی فیلد ایمیل است، ولی دیده نمی‌شود</p>`), frame(login(true) + `<p class="fx-note">حلقهٔ فوکوس با کنتراست کافی</p>`), { badLabel: "outline: none", goodLabel: "focus-visible" }),
  `<div class="fx-grid2">${frame(field("شماره موبایل", "۰۹۱۲۳۴", { error: "شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود." }))}${code(`<label for="mobile">شماره موبایل</label>
<input id="mobile"
  inputmode="tel"
  aria-invalid="true"
  aria-describedby="mobile-err">
<p id="mobile-err">…</p>`)}</div>`,
];
