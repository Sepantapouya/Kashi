import { test } from "node:test";
import assert from "node:assert/strict";
import { createTheme, fontFace, fontStack } from "../dist/index.js";

test("fontStack: نام تنها با فونت‌های جایگزین کامل می‌شود", () => {
  assert.equal(fontStack("IRANSans"), 'IRANSans, "Vazirmatn", Tahoma, system-ui, sans-serif');
  assert.equal(fontStack("Yekan Bakh"), '"Yekan Bakh", "Vazirmatn", Tahoma, system-ui, sans-serif');
  assert.equal(fontStack('"Inter", "Estedad", sans-serif'), '"Inter", "Estedad", sans-serif'); // فهرست کامل دست‌نخورده
});

test("fontFace: فونت ثابت و متغیر، قالب از پسوند", () => {
  const css = fontFace({ family: "Yekan Bakh", src: ["/fonts/YekanBakh.woff2", "/fonts/YekanBakh.woff"], weight: 700 });
  assert.match(css, /font-family: "Yekan Bakh";/);
  assert.match(css, /url\("\/fonts\/YekanBakh.woff2"\) format\("woff2"\),\s+url\("\/fonts\/YekanBakh.woff"\) format\("woff"\)/);
  assert.match(css, /font-weight: 700;/);
  assert.match(css, /font-display: swap;/);
  assert.match(fontFace({ family: "Estedad", src: "/f/Estedad[wght].ttf", weight: "100 900" }), /format\("truetype"\);\n  font-weight: 100 900;/);
});

test("createTheme: فونت پولی خودمیزبان + فونت عنوان + ضریب اندازه", () => {
  const css = createTheme({
    fonts: [{ family: "IRANSansX", src: "/fonts/IRANSansX.woff2", weight: "100 900" }],
    fontFamily: "IRANSansX",
    displayFontFamily: "Lalezar",
    textScale: 0.95,
  });
  // @font-face بیرون از انتخاب‌گر و پیش از آن
  assert.ok(css.indexOf("@font-face") < css.indexOf(":root {"));
  assert.match(css, /--k-font-sans: IRANSansX, "Vazirmatn", Tahoma, system-ui, sans-serif;/);
  assert.match(css, /--k-font-display: Lalezar, var\(--k-font-sans\);/);
  assert.match(css, /--k-text-scale: 0.95;/);
});

test("createTheme: بدون گزینه خروجی خالی است", () => {
  assert.equal(createTheme(), "");
});
