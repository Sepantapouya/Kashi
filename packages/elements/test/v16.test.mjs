// بهبودهای ۱.۶ در وب کامپوننت‌ها
import { test } from "node:test";
import assert from "node:assert/strict";
import { mount } from "./setup.mjs";

test("kashi-carousel: تصویرهای کوچک از data-thumb، پخش خودکار، نمای بزرگ و محو شدن", () => {
  const car = mount('<kashi-carousel label="عکس‌ها" effect="fade" autoplay="4000" lightbox><div data-thumb="a.jpg">۱</div><div data-thumb="b.jpg">۲</div><div data-thumb="c.jpg">۳</div></kashi-carousel>');
  assert.ok(car.querySelector(".k-carousel--fade"));
  assert.equal(car.querySelectorAll(".k-carousel__thumb img").length, 3);
  assert.equal(car.querySelector(".k-carousel__thumb").getAttribute("aria-current"), "true");
  assert.ok(car.querySelector(".k-carousel__progress-bar"));
  const play = car.querySelector('[data-act="play"]');
  assert.ok(play.getAttribute("aria-label"));
  play.click();
  assert.equal(play.getAttribute("aria-pressed"), String(play.getAttribute("aria-label") === "پخش خودکار اسلایدها"));
  // در محو شدن فقط اسلاید فعال دیده می‌شود و بقیه inert اند
  const slides = car.querySelectorAll(".k-carousel__slide");
  assert.ok(slides[0].hasAttribute("data-active"));
  assert.ok(slides[1].hasAttribute("inert"));
  car.querySelectorAll(".k-carousel__thumb")[2].click();
  assert.ok(slides[2].hasAttribute("data-active"));
  assert.ok(slides[0].hasAttribute("inert"));
  assert.ok(car.querySelector('[data-act="expand"]'));
});

test("kashi-tooltip در لایهٔ بالایی (popover)", () => {
  const t = mount('<kashi-tooltip content="ذخیرهٔ تغییرات"><button>ذخیره</button></kashi-tooltip>');
  assert.equal(t.querySelector('[role="tooltip"]').getAttribute("popover"), "manual");
});

test("kashi-input variant=code و kashi-file-upload با required", () => {
  const i = mount('<kashi-input label="کد" variant="code" placeholder="مثلاً ABCD"></kashi-input>');
  assert.ok(i.querySelector(".k-input--code"));
  assert.equal(i.querySelector("input").getAttribute("spellcheck"), "false");
  const f = mount('<kashi-file-upload name="docs" required></kashi-file-upload>');
  assert.ok(f.querySelector('input[type=file][name="docs"][required]'));
});
