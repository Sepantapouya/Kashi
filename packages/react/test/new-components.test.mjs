import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import * as K from "../dist/index.js";

const day = new Date(2026, 10, 7); // شنبه ۱۶ آبان ۱۴۰۵

test("QR: نسخه، اندازه، الگوهای ثابت و متن فارسی", () => {
  const m = K.encodeQr("https://kashi.sepantapouya.com", "M");
  assert.equal(m.length, 29, "۳۰ بایت در سطح M نسخهٔ ۳ است (ظرفیت ۴۲ بایت)");
  // نشانگرهای سه گوشه: حلقهٔ بیرونی تیره، حلقهٔ دوم روشن، مرکز تیره
  for (const [x, y] of [[0, 0], [m.length - 7, 0], [0, m.length - 7]]) {
    assert.equal(m[y][x], true);
    assert.equal(m[y + 1][x + 1], false);
    assert.equal(m[y + 3][x + 3], true);
  }
  // خط زمان‌بندی و خانهٔ تیرهٔ ثابت
  for (let i = 8; i < m.length - 8; i++) assert.equal(m[6][i], i % 2 === 0);
  assert.equal(m[m.length - 8][8], true);
  assert.equal(K.encodeQr("سلام", "H").length, 25, "۸ بایت UTF-8؛ نسخهٔ ۱ در سطح H فقط ۷ بایت جا دارد");
  assert.equal(K.encodeQr("x".repeat(3000), "H"), null);
  assert.match(render(h(K.QRCode, { value: "abc" })), /role="img" aria-label="کد QR برای abc"/);
});

test("Scheduler: هفته از شنبه، تعطیلی جمعه، رویدادهای هم‌پوشان کنار هم", () => {
  const ev = (id, h1, h2) => ({ id, title: `رویداد ${id}`, start: new Date(2026, 10, 8, h1), end: new Date(2026, 10, 8, h2) });
  const html = render(h(K.Scheduler, { events: [ev("a", 9, 11), ev("b", 10, 12), ev("c", 13, 14)], date: day, now: day }));
  assert.match(html, /آبان ۱۴۰۵/);
  const heads = [...html.matchAll(/k-sched__weekday">([^<]+)</g)].map((x) => x[1]);
  assert.deepEqual(heads, ["ش", "ی", "د", "س", "چ", "پ", "ج"]);
  assert.match(html, /data-holiday=""[^>]*title="جمعه"/);
  assert.match(html, /--k-sched-col:1;--k-sched-cols:2/);
  assert.match(html, /--k-sched-col:0;--k-sched-cols:1/);
  assert.match(html, /رویداد a<\/span><span class="k-sched__event-time"><span class="k-sr-only">، <\/span>۰۹:۰۰ – ۱۱:۰۰/);
});

test("BusinessHours: پیش‌فرض، خطای بازه و JSON فرم", () => {
  const html = render(h(K.BusinessHours, { name: "h", now: new Date(2026, 10, 7, 10) }));
  assert.match(html, /الان باز است/);
  assert.match(html, /جمعه تعطیل/);
  assert.match(html, /name="h" value="\[\{&quot;open&quot;:true/);
  const bad = render(h(K.BusinessHours, { name: "h", value: [{ open: true, ranges: [{ from: "12:00", to: "10:00" }] }, ...Array(6).fill({ open: false, ranges: [] })] }));
  assert.match(bad, /ساعت پایان باید بعد از شروع باشد/);
  assert.match(bad, /name="h" value=""/);
});

test("Chat: نقش‌ها، وضعیت و دکمه‌ها", () => {
  const html = render(h(K.ChatThread, {}, h(K.ChatMessage, { from: "user", status: "read" }, "سلام"), h(K.ChatMessage, { copyText: "x", onFeedback() {}, feedback: "up" }, "پاسخ")));
  assert.match(html, /role="log"/);
  assert.match(html, /data-from="user"/);
  assert.match(html, /aria-label="خوانده شد"/);
  assert.match(html, /aria-label="پاسخ خوب بود" aria-pressed="true"/);
  assert.match(html, /<span class="k-sr-only">شما: <\/span>/);
});

test("RichText: پاک‌سازی HTML در سرور", () => {
  const out = K.sanitizeRichText('<p>سلام<script>x</script><img src=x onerror=1></p><a href="javascript:1">x</a>');
  assert.doesNotMatch(out, /script|img|javascript|onerror|>x<\/p/);
  assert.equal(K.sanitizeRichText('<p dir="ltr" style="color:red" onclick="x">a <a href="https://k.ir" target="_blank">b</a></p>'), '<p dir="ltr">a <a href="https://k.ir" rel="noopener noreferrer nofollow">b</a></p>');
  assert.match(render(h(K.RichTextEditor, { defaultValue: "<p><b>متن</b></p>" })), /<b>متن<\/b>/);
});

test("StreamingText و CodeBlock", () => {
  assert.match(render(h(K.StreamingText, { text: "سلام دنیا", streaming: true })), /aria-busy="true"/);
  const code = render(h(K.CodeBlock, { code: "const a = 1; // x", language: "ts", lineNumbers: true }));
  assert.match(code, /k-code__t-keyword">const</);
  assert.match(code, /k-code__t-comment">\/\/ x</);
  assert.match(code, /dir="ltr" tabindex="0"/);
});
