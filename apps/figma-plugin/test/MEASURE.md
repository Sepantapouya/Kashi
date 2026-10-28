# به‌روزرسانی اندازه‌های مرجع CSS

`css-metrics.json` اندازه‌های واقعی هر کلاس `k-` است که در مرورگر از سایت مستندات (تم تیره) گرفته شده و تست `figma:test` گره‌های فیگما را با آن مقایسه می‌کند.

وقتی CSS کامپوننتی عوض شد:

1. سایت را اجرا کنید: `npm run docs` (پورت 4400).
2. در کنسول مرورگر روی یکی از صفحه‌های `/docs/`، اسکریپت زیر را اجرا کنید. همهٔ صفحه‌های مستندات را در iframe باز می‌کند و برای هر ترکیب کلاس، اولین نمونهٔ دیده‌شده را اندازه می‌گیرد.
3. خروجی را در `test/css-metrics.json` بگذارید و `npm run figma:test` را بزنید. اختلاف‌ها با `PARITY_REPORT=1` فهرست می‌شوند.

```js
const urls = [...new Set([...document.querySelectorAll('a[href^="/docs/"]')].map((a) => a.getAttribute("href")))];
const load = (url) => new Promise((res) => { const f = document.createElement("iframe"); f.style.cssText = "position:fixed;left:0;top:0;width:1280px;height:1000px;opacity:0"; f.src = url; f.onload = () => setTimeout(() => res(f), 1200); document.body.appendChild(f); });
const data = {};
for (const u of urls) {
  const f = await load(u); const d = f.contentDocument, w = f.contentWindow;
  d.documentElement.setAttribute("data-theme", "dark");
  for (const el of d.querySelectorAll('main [class*="k-"]')) {
    const key = [...el.classList].filter((c) => c.startsWith("k-")).sort().join(" ");
    const r = el.getBoundingClientRect(); if (!key || r.width < 1 || data[key]) continue;
    const cs = w.getComputedStyle(el);
    data[key] = { page: u, w: +r.width.toFixed(1), h: +r.height.toFixed(1), pt: cs.paddingTop, pr: cs.paddingRight, pb: cs.paddingBottom, pl: cs.paddingLeft, rad: cs.borderTopLeftRadius, gap: cs.gap, fs: cs.fontSize, fw: cs.fontWeight, lh: cs.lineHeight, bg: cs.backgroundColor, color: cs.color, bw: [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].join("/"), bc: cs.borderTopColor, sh: cs.boxShadow };
  }
  f.remove();
}
copy(JSON.stringify(data));
```

کلاس‌هایی که در مستندات در حالت پیش‌فرض دیده نمی‌شوند (مثل دکمهٔ xs قرمز یا بج outline کوچک) با ساختن همان عنصر در حالت تمیز اندازه‌گیری شده‌اند (`page: "synthetic"`).
