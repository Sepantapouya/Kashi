import { compare, frame, flow, icon } from "../kit.mjs";

const tok = (name, val, sw) => `<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border:1px solid var(--k-border-secondary);border-radius:12px;background:var(--k-bg-primary)">
  ${sw ? `<span style="width:28px;height:28px;border-radius:8px;background:${sw};flex:none"></span>` : ""}
  <span style="display:grid;gap:2px"><code class="fx-mono" style="font-size:15px;font-weight:700">${name}</code><small class="fx-mono" style="color:var(--k-text-tertiary);font-size:13px">${val}</small></span></div>`;
const tier = (title, color, items) => `<div style="display:grid;grid-template-columns:150px 1fr;gap:20px;align-items:center"><b style="font-size:19px;color:${color}">${title}</b><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">${items}</div></div>`;
const arrow = `<div style="padding-inline-start:170px;color:var(--k-text-quaternary)">${icon("arrow-down", 22)}</div>`;

const names = (list) => `<ul style="margin:0;padding:0;list-style:none;display:grid;gap:10px">${list.map((n) => `<li class="fx-mono" style="padding:12px 16px;border-radius:10px;background:var(--k-bg-secondary);font-size:17px;text-align:left">${n}</li>`).join("")}</ul>`;

export const figures = [
  frame(
    tier("کامپوننت", "#7c3aed", tok("--k-btn-height-md", "2.5rem") + tok("--k-btn-radius", "var(--k-radius-md)") + tok("--k-input-border", "var(--k-border-input)")) + arrow +
    tier("معنایی", "#2740ed", tok("--k-bg-brand", "var(--k-brand-600)", "#0b8077") + tok("--k-text-error", "light: anar-700 · dark: anar-400", "#b91c1c") + tok("--k-bg-primary", "light: shab-0 · dark: shab-1000", "linear-gradient(90deg,#fff 50%,#0a0c0f 50%)")) + arrow +
    tier("پایه", "#0b8077", tok("--k-firoozeh-600", "#0b8077", "#0b8077") + tok("--k-brand-600", "var(--k-firoozeh-600)", "#0b8077") + tok("--k-space-4", "1rem")),
  ),
  compare(
    names(["--green-2", "--big-padding", "--color-red-error", "--btn-blue-hover", "--radius13"]),
    names(["--k-text-success", "--k-space-6", "--k-text-error", "--k-bg-brand-hover", "--k-radius-lg"]),
    { badLabel: "اسم بر اساس ظاهر", goodLabel: "اسم بر اساس نقش، ترتیب ثابت" },
  ),
  flow([
    { icon: "file-code", title: "منبع واحد", text: "tokens.json" },
    { icon: "code", title: "متغیرهای CSS", text: "--k-bg-brand" },
    { icon: "pen-tool", title: "متغیرهای فیگما", text: "bg / brand" },
    { icon: "check", title: "همیشه یکی", text: "طراحی = کد" },
  ]),
];
