import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidCardNumber } from "@kashi-ui/persian";
import { K, mount, type } from "./setup.mjs";

const changes = (el) => {
  const list = [];
  el.addEventListener("kashi-change", (e) => list.push(e.detail));
  return list;
};

/** شمارهٔ کارت معتبر بانک ملی با رقم کنترل درست */
const card = (() => {
  for (let i = 0; i < 10; i++) if (isValidCardNumber(`603799123456789${i}`)) return `603799123456789${i}`;
})();
/** شبای معتبر بانک ملی (کد ۰۱۷) با رقم‌های کنترل درست */
const iban = (() => {
  const bban = "0170000000123456789001";
  const mod = BigInt(`${bban}182700`) % 97n;
  return `${String(98n - mod).padStart(2, "0")}${bban}`;
})();

test("ثبت همهٔ عنصرها و بارگذاری بدون خطا در Node", () => {
  for (const tag of K.KASHI_ELEMENTS) assert.ok(customElements.get(tag), tag);
  assert.match(document.head.querySelector("style[data-kashi-elements]").textContent, /@layer kashi\.elements[^}]*kashi-national-id/);
});

test("کد ملی: برچسب پیش‌فرض، ارقام فارسی، فیلد پنهان و خطا پس از ۱۰ رقم", () => {
  const el = mount('<form><kashi-national-id name="nid" required></kashi-national-id></form>').firstElementChild;
  const input = el.querySelector("input.k-input__control");
  assert.equal(el.querySelector("label").textContent, "کد ملی*");
  assert.equal(el.querySelector("label").getAttribute("for"), input.id);
  const log = changes(el);
  type(input, "۰۰۱۳۵۴۲۴۱۹");
  assert.equal(input.value, "۰۰۱۳۵۴۲۴۱۹");
  assert.equal(el.value, "0013542419");
  assert.equal(el.valid, true);
  assert.deepEqual(log.at(-1), { value: "0013542419", valid: true });
  assert.equal(new FormData(el.closest("form")).get("nid"), "0013542419");
  type(input, "0013542418");
  assert.equal(el.querySelector(".k-hint--error").textContent, "کد ملی معتبر نیست.");
  assert.equal(input.getAttribute("aria-invalid"), "true");
  assert.match(input.getAttribute("aria-describedby"), /-error$/);
  assert.equal(input.validationMessage, "کد ملی معتبر نیست.");
});

test("موبایل: +98 به ۰۹، گروه‌بندی و نام اپراتور", () => {
  const el = mount('<kashi-mobile digits="latin"></kashi-mobile>');
  const input = el.querySelector("input");
  const log = changes(el);
  type(input, "+989123456789");
  assert.equal(input.value, "0912 345 6789");
  assert.equal(el.value, "09123456789");
  assert.equal(log.at(-1).operator, "همراه اول");
  assert.equal(el.querySelector(".k-input__meta").textContent, "همراه اول");
});

test("کارت و شبا: نام بانک، IR خودکار و مقدار ارسالی", () => {
  const c = mount('<kashi-card-number bank-logo="false"></kashi-card-number>');
  type(c.querySelector("input"), card);
  assert.equal(c.querySelector(".k-bank").textContent, "بانک ملی");
  assert.equal(c.valid, true);
  const i = mount('<kashi-iban name="sheba" bank-logo="false"></kashi-iban>');
  type(i.querySelector("input"), `IR${iban}`);
  assert.equal(i.value, `IR${iban}`);
  assert.equal(i.valid, true);
  assert.equal(i.querySelector("input[type=hidden]").value, `IR${iban}`);
  assert.match(i.querySelector("input.k-input__control").value, /^IR\d\d \d{4}/);
});

test("مبلغ: هزارگان، به حروف و خطای محدوده پس از خروج", () => {
  const el = mount('<kashi-price max="1000000"></kashi-price>');
  const input = el.querySelector("input.k-input__control");
  type(input, "2500000");
  assert.equal(input.value, "۲٬۵۰۰٬۰۰۰");
  assert.equal(el.valueAsNumber, 2500000);
  assert.equal(el.querySelector(".k-hint").textContent, "دو میلیون و پانصد هزار تومان");
  assert.equal(el.querySelector(".k-hint--error"), null);
  input.dispatchEvent(new Event("blur"));
  assert.equal(el.querySelector(".k-hint--error").textContent, "مبلغ باید حداکثر ۱٬۰۰۰٬۰۰۰ باشد.");
  assert.equal(el.valid, false);
});

test("کد پستی و تغییر value از بیرون", () => {
  const el = mount('<kashi-postal-code value="1193653471"></kashi-postal-code>');
  assert.equal(el.querySelector("input").value, "۱۱۹۳۶-۵۳۴۷۱");
  el.value = "";
  assert.equal(el.querySelector("input").value, "");
  el.setAttribute("label", "کد پستی محل کار");
  assert.equal(el.querySelector("label").textContent, "کد پستی محل کار");
});

test("کد تأیید: خانه‌ها، ارقام فارسی و رویداد kashi-complete", () => {
  const el = mount('<kashi-otp length="4" name="code"></kashi-otp>');
  let done = null;
  el.addEventListener("kashi-complete", (e) => (done = e.detail.value));
  type(el.querySelector(".k-otp__input"), "۱۲۳۴");
  assert.equal(done, "1234");
  assert.deepEqual([...el.querySelectorAll(".k-otp__slot")].map((s) => s.textContent), ["۱", "۲", "۳", "۴"]);
  assert.equal(el.querySelector("input[type=hidden]").value, "1234");
});

test("انتخاب استان روی select بومی", () => {
  const el = mount('<kashi-province-select name="province" value="اصفهان"></kashi-province-select>');
  const select = el.querySelector("select");
  assert.equal(select.name, "province");
  assert.equal(select.value, "اصفهان");
  assert.equal(select.options.length, 32);
});

test("تقویم شمسی: ماه درست، تعطیلی و انتخاب روز", () => {
  const el = mount('<kashi-calendar value="2026-03-21" holidays name="d"></kashi-calendar>');
  assert.equal(el.querySelector("h2").textContent, "فروردین ۱۴۰۵");
  const nowruz = el.querySelector('[data-day="2026-3-21"]');
  assert.match(nowruz.getAttribute("aria-label"), /۱ فروردین ۱۴۰۵، تعطیل: عید نوروز/);
  assert.equal(nowruz.closest("td").getAttribute("aria-selected"), "true");
  const log = changes(el);
  el.querySelector('[data-day="2026-3-25"]').click();
  assert.equal(log.at(-1).value, "2026-03-25");
  assert.equal(el.value, "2026-03-25");
  el.querySelector('[data-nav="next"]').click();
  assert.equal(el.querySelector("h2").textContent, "اردیبهشت ۱۴۰۵");
});

test("انتخاب تاریخ: تایپ شمسی، مقدار میلادی در فرم و باز شدن تقویم", () => {
  const el = mount('<kashi-date-picker name="birth" label="تاریخ تولد"></kashi-date-picker>');
  const input = el.querySelector("input.k-input__control");
  const log = changes(el);
  input.value = "۱۴۰۵/۱/۱";
  input.dispatchEvent(new Event("blur"));
  assert.equal(el.value, "2026-03-21");
  assert.equal(input.value, "۱۴۰۵/۰۱/۰۱");
  assert.equal(log.at(-1).value, "2026-03-21");
  assert.equal(el.querySelector("input[type=hidden]").value, "2026-03-21");
  input.value = "۱۴۰۵/۱۳/۱";
  input.dispatchEvent(new Event("blur"));
  assert.match(el.querySelector(".k-hint--error").textContent, /معتبر نیست/);
  const toggle = el.querySelector(".k-datepicker__toggle");
  toggle.click();
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  el.querySelector('kashi-calendar [data-day="2026-3-22"]').click();
  assert.equal(el.value, "2026-03-22");
  assert.equal(el.querySelector(".k-datepicker__popover"), null);
});

test("نمایش مبلغ، تاریخ و شمارش معکوس", () => {
  const m = mount('<kashi-money value="1250000"></kashi-money>');
  assert.equal(m.querySelector(".k-money__amount").textContent, "۱٬۲۵۰٬۰۰۰");
  assert.equal(m.querySelector(".k-sr-only").textContent, "یک میلیون و دویست و پنجاه هزار تومان");
  const d = mount('<kashi-date datetime="2026-03-21" format="full"></kashi-date>');
  assert.equal(d.textContent, "شنبه ۱ فروردین ۱۴۰۵");
  const c = mount('<kashi-countdown seconds="125" label="ارسال دوباره"></kashi-countdown>');
  assert.equal(c.textContent, "۰۲:۰۵");
  assert.equal(c.querySelector('[role="timer"]').getAttribute("aria-label"), "ارسال دوباره: ۲ دقیقه و ۵ ثانیه");
  c.remove();
});

test("پنجرهٔ گفتگو: ساختار، عنوان و پاورقی", () => {
  mount('<button data-kashi-open="del">حذف</button><kashi-dialog id="del" heading="حذف فایل؟" description="قابل بازگشت نیست." tone="danger"><p>متن</p><div slot="footer"><button data-kashi-close="no">انصراف</button></div></kashi-dialog>');
  const el = document.getElementById("del");
  const d = el.querySelector("dialog");
  assert.equal(d.className, "k-dialog k-dialog--danger");
  assert.equal(d.querySelector(".k-dialog__title").textContent, "حذف فایل؟");
  assert.equal(d.getAttribute("aria-describedby"), d.querySelector(".k-dialog__description").id);
  assert.equal(d.querySelector(".k-dialog__body p").textContent, "متن");
  assert.ok(d.querySelector(".k-dialog__footer [data-kashi-close]"));
  assert.equal(el.id, "del");
});

test("زبانه‌ها از روی data-tab، با کیبورد در راست‌به‌چپ", () => {
  const el = mount('<kashi-tabs label="تنظیمات"><section data-tab="پروفایل">۱</section><section data-tab="امنیت" data-value="security">۲</section></kashi-tabs>');
  const tabs = el.querySelectorAll('[role="tab"]');
  assert.equal(tabs.length, 2);
  assert.equal(el.querySelector('[role="tablist"]').getAttribute("aria-label"), "تنظیمات");
  assert.equal(el.value, "1");
  assert.equal(el.querySelectorAll("section")[1].hidden, true);
  const log = changes(el);
  tabs[0].focus();
  tabs[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
  assert.equal(el.value, "security");
  assert.deepEqual(log.at(-1), { value: "security" });
  assert.equal(el.querySelectorAll("section")[0].hidden, true);
});

test("راهنما و اعلان", async () => {
  const t = mount('<kashi-tooltip content="ذخیرهٔ تغییرات"><button>ذخیره</button></kashi-tooltip>');
  const tip = t.querySelector('[role="tooltip"]');
  assert.equal(t.querySelector("button").getAttribute("aria-describedby"), tip.id);
  assert.equal(tip.hidden, true);
  document.body.innerHTML = '<kashi-toaster placement="top-center"></kashi-toaster>';
  const id = K.toast.success("ذخیره شد", { description: "تغییرات اعمال شد." });
  const li = document.querySelector(".k-toaster--top-center .k-toast--success");
  assert.equal(li.getAttribute("role"), "status");
  assert.equal(li.querySelector(".k-toast__title").textContent, "ذخیره شد");
  K.toast({ id, title: "به‌روز شد" });
  assert.equal(document.querySelectorAll(".k-toast").length, 1);
  K.toast.dismiss(id);
  await new Promise((r) => setTimeout(r, 250));
  assert.equal(document.querySelectorAll(".k-toast").length, 0);
});
