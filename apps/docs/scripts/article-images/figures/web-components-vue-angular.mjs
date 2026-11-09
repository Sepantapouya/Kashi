import { code, field, icon, frame } from "../kit.mjs";

const fw = (name, color, ic) => `<div style="display:grid;justify-items:center;gap:10px;padding:22px;border:1px solid var(--k-border-secondary);border-radius:18px;background:var(--k-bg-primary)"><span style="display:grid;place-items:center;width:54px;height:54px;border-radius:14px;background:color-mix(in srgb,${color} 15%,transparent);color:${color}">${icon(ic, 26)}</span><b class="fx-mono" style="font-size:18px">${name}</b></div>`;

export const figures = [
  `<div style="display:grid;grid-template-columns:1fr 1.3fr 1fr;align-items:center;gap:28px">
    <div style="display:grid;gap:18px">${fw("Vue", "#16a34a", "code")}${fw("Svelte", "#ea580c", "code")}</div>
    <div style="display:grid;gap:14px;justify-items:center;padding:30px;border-radius:24px;background:var(--k-bg-brand);color:#fff;box-shadow:0 24px 50px -24px var(--k-bg-brand)">
      ${icon("calendar", 44)}<b class="fx-mono" style="font-size:20px">&lt;kashi-date-picker&gt;</b><span style="opacity:.85">یک پیاده‌سازی، همه‌جا</span></div>
    <div style="display:grid;gap:18px">${fw("Angular", "#dc2626", "code")}${fw("HTML", "#2563eb", "file-code")}</div>
  </div>`,
  `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
    ${code(`<kashi-mobile
  :value="mobile"
  @kashi-change="
    mobile = $event.detail.value
  " />`, { title: "Vue" })}
    ${code(`<kashi-mobile
  value={mobile}
  on:kashi-change={(e) =>
    (mobile = e.detail.value)}
/>`, { title: "Svelte" })}
    ${code(`<kashi-mobile
  [value]="mobile"
  (kashi-change)="
    mobile = $event.detail.value
  " />`, { title: "Angular" })}
  </div>`,
  `<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:center">
    ${frame(`<div class="k-field"><label class="k-label">شماره کارت</label><div class="k-input"><input class="k-input__control" dir="ltr" value="6037 9912 3456 7893" style="font-size:20px"><span class="k-input__addon" style="font-size:14px">بانک ملی</span></div><p class="k-hint">&lt;kashi-card-number&gt;</p></div>`)}
    ${code(`// kashi-change
{
  value: "6037991234567893",
  valid: true,
  bank: "بانک ملی"
}`, { title: "Console" })}
  </div>`,
];
