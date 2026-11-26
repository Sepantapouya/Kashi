import { frame, table, icon } from "../kit.mjs";

const big = (t) => `<span style="font-size:30px;font-weight:700">${t}</span>`;
const cp = (t) => `<code class="fx-mono" style="font-size:15px;color:var(--k-text-tertiary)">${t}</code>`;

const searchBox = (q) => `<div class="k-input k-input--lg"><span class="k-input__addon">${icon("search", 20)}</span><input class="k-input__control" value="${q}" style="font-size:20px"></div>`;
const result = (title, meta) => `<div style="display:grid;gap:4px;padding:14px 18px;border-radius:12px;background:var(--k-bg-secondary)"><b style="font-size:18px">${title}</b><small style="color:var(--k-text-tertiary);font-size:14px">${meta}</small></div>`;

export const figures = [
  table(["فارسی (درست)", "یونیکد", "شبیهش", "یونیکد"], [
    [big("ی"), cp("U+06CC"), big("ي"), cp("U+064A")],
    [big("ک"), cp("U+06A9"), big("ك"), cp("U+0643")],
    [big("۴۵۶"), cp("U+06F4…"), big("٤٥٦"), cp("U+0664…")],
    [big("می‌خواهم"), cp("ZWNJ U+200C"), big("می خواهم"), cp("Space U+0020")],
  ]),
  frame(`${searchBox("كتاب هاي برنامه نويسي")}<p class="fx-note">۳ نتیجه، با وجود «ك» و «ي» عربی و فاصلهٔ کامل</p>
    ${result("<mark style=\"background:color-mix(in srgb,#fbbf24 35%,transparent);border-radius:4px\">کتاب‌های</mark> برنامه‌نویسی برای شروع", "فهرست · ۱۸ آبان")}
    ${result("بهترین <mark style=\"background:color-mix(in srgb,#fbbf24 35%,transparent);border-radius:4px\">کتاب‌های</mark> برنامه‌نویسی وب", "مقاله · ۱۲ آبان")}`),
  frame(`${searchBox("sghl")}
    <div style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:12px;background:var(--k-bg-brand-subtle);font-size:18px">${icon("keyboard", 22)}<span>آیا منظورتان <b style="color:var(--k-text-brand)">سلام</b> بود؟ زبان صفحه‌کلید انگلیسی بود.</span></div>
    <p class="fx-note">پیشنهاد، نه تغییر خودکار؛ شاید کاربر واقعاً دنبال یک کلمهٔ انگلیسی بوده است.</p>`),
];
