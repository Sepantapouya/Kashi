import { formatJalali, formatMoney, formatRelative, fromISODate, numberToWords, rialToToman, toFaDigits, tomanToRial } from "@kashi-ui/persian";
import { HTMLBase, define, emit, esc } from "./base.js";

/** «2026-03-21» به نیمه‌شب محلی، و بقیهٔ قالب‌ها (با ساعت) با Date */
const parseDateTime = (text: string | null): Date | null => {
  if (!text) return null;
  const d = fromISODate(text.trim()) ?? new Date(text);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** پایهٔ عناصر نمایشی: با هر تغییر ویژگی دوباره رسم می‌شوند */
abstract class Display extends HTMLBase {
  protected abstract render(): void;
  connectedCallback() {
    this.render();
  }
  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }
}

/** نمایش مبلغ با تومان یا ریال، حالت خلاصه (۱٫۲ میلیون) و مبلغ به حروف برای صفحه‌خوان */
export class KashiMoney extends Display {
  static observedAttributes = ["value", "unit", "from", "compact", "digits", "signed", "words", "size"];
  protected render() {
    const value = Number(this.getAttribute("value") ?? 0);
    const unit = this.getAttribute("unit") === "rial" ? "rial" : "toman";
    const from = this.getAttribute("from") === "rial" ? "rial" : this.getAttribute("from") === "toman" ? "toman" : unit;
    const compact = this.hasAttribute("compact");
    const digits = this.getAttribute("digits") === "latin" ? "latin" : "fa";
    const signed = this.hasAttribute("signed");
    const size = this.getAttribute("size") ?? "md";
    const n = from === unit ? value : from === "rial" ? rialToToman(value) : tomanToRial(value);
    const amount = formatMoney(n, { unit, compact, digits, showUnit: false });
    const full = formatMoney(n, { unit, compact });
    const unitText = full.endsWith("همت") ? null : unit === "toman" ? "تومان" : "ریال";
    const spoken = this.getAttribute("words") !== "false" && Number.isSafeInteger(Math.round(n))
      ? `${numberToWords(Math.round(n))} ${unit === "toman" ? "تومان" : "ریال"}`
      : null;
    const tone = signed ? (n > 0 ? "positive" : n < 0 ? "negative" : null) : null;
    const hide = spoken ? ' aria-hidden="true"' : "";
    this.innerHTML = `<data value="${n}" class="k-money k-money--${esc(size)}"${tone ? ` data-tone="${tone}"` : ""}${spoken ? ` title="${esc(spoken)}"` : ""}><span class="k-money__amount"${hide}>${signed && n > 0 ? "+" : ""}${esc(amount)}</span>${unitText ? `<span class="k-money__unit"${hide}>${unitText}</span>` : ""}${spoken ? `<span class="k-sr-only">${n < 0 ? "" : signed && n > 0 ? "مثبت " : ""}${esc(spoken)}</span>` : ""}</data>`;
  }
}

/** تاریخ شمسی در یک <time> معنایی؛ مثل «۱ فروردین ۱۴۰۵» */
export class KashiDate extends Display {
  static observedAttributes = ["datetime", "format", "digits"];
  protected render() {
    const d = parseDateTime(this.getAttribute("datetime"));
    if (!d) {
      this.textContent = "";
      return;
    }
    const f = this.getAttribute("format");
    const style = f === "numeric" || f === "full" ? f : "long";
    const digits = this.getAttribute("digits") === "latin" ? "latin" : "fa";
    this.innerHTML = `<time datetime="${esc(this.getAttribute("datetime"))}">${esc(formatJalali(d, { style, digits }))}</time>`;
  }
}

/** «۵ دقیقه پیش» که خودش به‌روز می‌شود؛ تاریخ کامل شمسی در title */
export class KashiRelativeTime extends Display {
  static observedAttributes = ["datetime", "digits", "refresh"];
  private timer: ReturnType<typeof setInterval> | undefined;
  connectedCallback() {
    super.connectedCallback();
    clearInterval(this.timer);
    this.timer = setInterval(() => this.render(), Number(this.getAttribute("refresh")) || 60_000);
  }
  disconnectedCallback() {
    clearInterval(this.timer);
  }
  protected render() {
    const d = parseDateTime(this.getAttribute("datetime"));
    if (!d) {
      this.textContent = "";
      return;
    }
    const digits = this.getAttribute("digits") === "latin" ? "latin" : "fa";
    this.innerHTML = `<time datetime="${d.toISOString()}" title="${esc(formatJalali(d, { style: "full", digits }))}">${esc(formatRelative(d, { digits }))}</time>`;
  }
}

const pad = (n: number) => String(n).padStart(2, "0");

/** شمارش معکوس با ارقام فارسی؛ در پایان رویداد kashi-complete را می‌فرستد */
export class KashiCountdown extends HTMLBase {
  static observedAttributes = ["to", "seconds", "variant", "digits", "label"];
  private end = 0;
  private timer: ReturnType<typeof setInterval> | undefined;
  private done = false;

  connectedCallback() {
    this.restart();
  }
  disconnectedCallback() {
    clearInterval(this.timer);
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.isConnected || old === next) return;
    if (name === "to" || name === "seconds") this.restart();
    else this.render();
  }
  /** شروع دوباره از ابتدا، مثلاً پس از ارسال دوبارهٔ کد */
  restart() {
    const to = parseDateTime(this.getAttribute("to"));
    this.end = to ? to.getTime() : Date.now() + (Number(this.getAttribute("seconds")) || 0) * 1000;
    this.done = false;
    clearInterval(this.timer);
    this.render();
    this.timer = setInterval(() => this.render(), 1000);
  }
  /** ثانیه‌های باقی‌مانده */
  get remaining() {
    return Math.max(0, Math.ceil((this.end - Date.now()) / 1000));
  }

  private render() {
    const left = this.remaining;
    const d = Math.floor(left / 86400), h = Math.floor((left % 86400) / 3600), m = Math.floor((left % 3600) / 60), s = left % 60;
    const fa = this.getAttribute("digits") !== "latin";
    const f = (x: string | number) => (fa ? toFaDigits(String(x)) : String(x));
    const spoken = [d && `${f(d)} روز`, h && `${f(h)} ساعت`, m && `${f(m)} دقیقه`, `${f(s)} ثانیه`].filter(Boolean).join(" و ");
    const label = this.getAttribute("label");
    const aria = esc(label ? `${label}: ${spoken}` : spoken);
    const doneAttr = left === 0 ? ' data-done=""' : "";
    if (this.getAttribute("variant") === "blocks") {
      const units: [number, string][] = [...(d ? [[d, "روز"] as [number, string]] : []), [h, "ساعت"], [m, "دقیقه"], [s, "ثانیه"]];
      this.innerHTML = `<div role="timer" aria-label="${aria}" class="k-countdown k-countdown--blocks"${doneAttr}>${units.map(([v, name]) => `<span class="k-countdown__unit" aria-hidden="true"><span class="k-countdown__num">${f(pad(v))}</span><span class="k-countdown__name">${name}</span></span>`).join("")}</div>`;
    } else {
      const clock = (d ? `${d}:` : "") + (h || d ? `${pad(h)}:` : "") + `${pad(m)}:${pad(s)}`;
      this.innerHTML = `<span role="timer" aria-label="${aria}" class="k-countdown"${doneAttr} dir="ltr"><span aria-hidden="true">${f(clock)}</span></span>`;
    }
    if (left === 0) {
      clearInterval(this.timer);
      if (!this.done) {
        this.done = true;
        emit(this, "kashi-complete", {});
      }
    }
  }
}

define("kashi-money", KashiMoney);
define("kashi-date", KashiDate);
define("kashi-relative-time", KashiRelativeTime);
define("kashi-countdown", KashiCountdown);
