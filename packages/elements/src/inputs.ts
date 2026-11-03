import {
  formatCardNumber, formatIban, formatLandline, formatMobile, formatNumber, formatPostalCode,
  getBankByCard, getBankByIban, getLandlineProvince, getMobileOperator,
  isValidCardNumber, isValidIban, isValidLandline, isValidLegalId, isValidMobile, isValidNationalId, isValidPostalCode,
  normalizeLandline, normalizeMobile, numberToWords, onlyDigits, toFaDigits, type Bank,
} from "@kashi-ui/persian";
import { HTMLBase, bool, define, emit, esc, fieldHTML, setMessages, syncHidden, uid } from "./base.js";

const fa = (s: string) => toFaDigits(s);

/** موقعیت مکان‌نما پس از n رقم در متن قالب‌بندی‌شده */
function caretAfter(text: string, n: number): number {
  if (n === 0) return text.search(/[0-9۰-۹]/) === -1 ? text.length : text.search(/[0-9۰-۹]/);
  let seen = 0;
  for (let i = 0; i < text.length; i++) if (/[0-9۰-۹]/.test(text[i]) && ++seen === n) return i + 1;
  return text.length;
}

/** آنچه در انتهای فیلد نمایش داده می‌شود: نام اپراتور، استان، بانک یا واحد پول */
type Meta = { text: string; bank?: Bank } | null;

interface Kind {
  label: string;
  maxDigits: number;
  format: (raw: string) => string;
  normalize?: (digits: string) => string;
  /** معتبر بودن مقدار کامل */
  valid: (raw: string) => boolean;
  invalidMessage: string;
  placeholder: { fa: string; latin: string };
  digits: "fa" | "latin";
  type?: "text" | "tel";
  inputMode?: "numeric" | "tel";
  autocomplete?: string;
  meta?: (raw: string, host: Element) => Meta;
  /** مقداری که در فرم ارسال می‌شود */
  submit?: (raw: string) => string;
  /** اطلاعات اضافهٔ رویداد kashi-change */
  detail?: (raw: string) => Record<string, unknown>;
}

/**
 * پایهٔ فیلدهای عددی فارسی: ارقام فارسی و لاتین را می‌پذیرد، قالب می‌دهد، مکان‌نما را سر جایش نگه می‌دارد،
 * پس از خروج از فیلد یا کامل شدن مقدار، خطا را نشان می‌دهد و مقدار خام را با name در فرم می‌فرستد.
 */
export abstract class KashiDigitsInput extends HTMLBase {
  static observedAttributes = ["label", "hint", "error", "placeholder", "required", "disabled", "readonly", "digits", "invalid-message", "name", "value", "size", "aria-label", "show-meta", "bank-logo"];
  protected abstract kind: Kind;
  protected raw = "";
  private touched = false;
  /** مقدار با ویژگی value پیش از وصل شدن به صفحه گذاشته شده (مثلاً Vue) */
  private valueSet = false;
  private rendered = false;
  private key = uid("kashi-in");
  protected input!: HTMLInputElement;
  private logoSlug: string | null = null;

  connectedCallback() {
    if (!this.rendered && !this.valueSet) this.raw = this.clean(this.getAttribute("value") ?? "");
    // مقداری که فریم‌ورک پیش از ثبت عنصر روی ویژگی value گذاشته
    if (Object.prototype.hasOwnProperty.call(this, "value")) {
      const v = (this as { value?: unknown }).value;
      delete (this as { value?: unknown }).value;
      this.raw = this.clean(String(v ?? ""));
    }
    this.render();
  }

  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.rendered || old === next) return;
    if (name === "value") this.setRaw(this.clean(next ?? ""), false);
    else this.render();
  }

  /** مقداری که در فرم ارسال می‌شود (ارقام لاتین) */
  get value(): string {
    return this.kind.submit ? this.kind.submit(this.raw) : this.raw;
  }
  set value(v: string) {
    this.valueSet = true;
    this.setRaw(this.clean(String(v ?? "")), false);
  }
  /** آیا مقدار کامل و معتبر است */
  get valid(): boolean {
    return this.isValid();
  }
  protected isValid(): boolean {
    return this.kind.valid(this.raw);
  }
  focus(options?: FocusOptions) {
    this.input?.focus(options);
  }

  protected clean(text: string): string {
    const k = this.kind;
    return (k.normalize ?? ((d: string) => d))(onlyDigits(text)).slice(0, k.maxDigits);
  }

  private get digits(): "fa" | "latin" {
    const d = this.getAttribute("digits");
    return d === "fa" || d === "latin" ? d : this.kind.digits;
  }

  private shown(): string {
    const f = this.kind.format(this.raw);
    return this.digits === "fa" ? fa(f) : f;
  }

  private render() {
    const k = this.kind;
    const id = this.key;
    const ariaLabel = this.getAttribute("aria-label");
    const label = this.hasAttribute("label") ? this.getAttribute("label") : ariaLabel ? null : k.label;
    const size = this.getAttribute("size");
    const required = this.hasAttribute("required");
    const disabled = this.hasAttribute("disabled");
    const placeholder = this.getAttribute("placeholder") ?? k.placeholder[this.digits];
    const control = `<div class="k-input${size === "sm" || size === "lg" ? ` k-input--${size}` : ""}" data-size="${size ?? "md"}"${disabled ? ' data-state="disabled"' : ""}><input id="${id}" class="k-input__control" type="${k.type ?? "text"}" inputmode="${k.inputMode ?? "numeric"}" autocomplete="${k.autocomplete ?? "off"}" dir="ltr" spellcheck="false" placeholder="${esc(placeholder)}"${required ? " required" : ""}${disabled ? " disabled" : ""}${this.hasAttribute("readonly") ? " readonly" : ""}${!label && ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ""}></div>`;
    this.querySelector(":scope > .k-field")?.remove();
    this.insertAdjacentHTML("afterbegin", fieldHTML({ id, label, required, control }));
    this.input = this.querySelector("input.k-input__control")!;
    this.input.addEventListener("input", () => this.onInput());
    this.input.addEventListener("blur", () => {
      this.touched = true;
      this.paint();
    });
    this.rendered = true;
    this.paint();
  }

  private onInput() {
    const el = this.input;
    const before = el.value.slice(0, el.selectionStart ?? el.value.length);
    const next = this.clean(el.value);
    const caret = Math.min(onlyDigits(before).length, next.length);
    this.setRaw(next, true);
    if (el.ownerDocument.activeElement === el) {
      const pos = caretAfter(el.value, caret);
      el.setSelectionRange(pos, pos);
    }
  }

  private setRaw(next: string, user: boolean) {
    const changed = next !== this.raw;
    this.raw = next;
    if (!this.rendered) return;
    this.paint();
    if (user && changed) emit(this, "kashi-change", { value: this.value, valid: this.isValid(), ...this.kind.detail?.(this.raw) });
  }

  /** پیام خطای فعلی؛ فیلد مبلغ آن را برای محدوده بازنویسی می‌کند */
  protected invalidText(touched: boolean): string | null {
    const show = this.raw.length > 0 && (touched || this.raw.length === this.kind.maxDigits) && !this.isValid();
    return show ? (this.getAttribute("invalid-message") ?? this.kind.invalidMessage) : null;
  }
  protected hintText(): string | null {
    return this.getAttribute("hint");
  }

  private paint() {
    const el = this.input;
    const shown = this.shown();
    if (el.value !== shown) el.value = shown;
    const box = el.parentElement!;
    // نشان انتهای فیلد
    box.querySelector(":scope > .k-input__addon")?.remove();
    const meta = bool(this, "show-meta", true) ? this.kind.meta?.(this.raw, this) : null;
    const metaId = `${this.key}-meta`;
    if (meta) {
      const addon = document.createElement("span");
      addon.className = "k-input__addon";
      addon.innerHTML = meta.bank
        ? `<span class="k-bank" id="${metaId}">${esc(meta.text)}</span>`
        : `<span class="k-input__meta" id="${metaId}">${esc(meta.text)}</span>`;
      box.append(addon);
      if (meta.bank && bool(this, "bank-logo", true)) this.loadLogo(meta.bank, addon.firstElementChild as HTMLElement);
    }
    const error = this.getAttribute("error") || this.invalidText(this.touched);
    // اعتبارسنجی بومی فرم: فرم با مقدار نامعتبر ارسال نمی‌شود
    el.setCustomValidity(this.raw && !this.isValid() ? (this.invalidText(true) ?? "") : "");
    setMessages(this.querySelector(":scope > .k-field")!, el, this.key, error, this.hintText(), meta ? metaId : null);
    syncHidden(this, this.getAttribute("name"), this.raw ? this.value : "");
  }

  /** لوگوی بانک فقط هنگام نیاز بارگذاری می‌شود تا حجم اولیه کم بماند */
  private loadLogo(bank: Bank, badge: HTMLElement) {
    this.logoSlug = bank.slug;
    import("@kashi-ui/bank-logos")
      .then((m) => {
        const uri = m.bankLogoDataUri(bank.slug);
        if (!uri || this.logoSlug !== bank.slug || !badge.isConnected) return;
        const img = document.createElement("img");
        img.className = "k-bank__logo";
        img.src = uri;
        img.alt = "";
        img.width = img.height = 24;
        badge.prepend(img);
      })
      .catch(() => {});
  }
}

/** کد ملی: ۱۰ رقم با بررسی رقم کنترل */
export class KashiNationalId extends KashiDigitsInput {
  protected kind: Kind = {
    label: "کد ملی",
    maxDigits: 10,
    format: (d) => d,
    valid: (d) => isValidNationalId(d),
    invalidMessage: "کد ملی معتبر نیست.",
    placeholder: { fa: "۰۰۰۰۰۰۰۰۰۰", latin: "0000000000" },
    digits: "fa",
  };
}

/** شناسهٔ ملی شرکت‌ها: ۱۱ رقم با بررسی رقم کنترل */
export class KashiLegalId extends KashiDigitsInput {
  protected kind: Kind = {
    label: "شناسهٔ ملی شرکت",
    maxDigits: 11,
    format: (d) => d,
    valid: (d) => isValidLegalId(d),
    invalidMessage: "شناسهٔ ملی معتبر نیست.",
    placeholder: { fa: "۰۰۰۰۰۰۰۰۰۰۰", latin: "00000000000" },
    digits: "fa",
  };
}

/** موبایل: +98 و 0098 را به 09 تبدیل می‌کند، گروه‌بندی و تشخیص اپراتور */
export class KashiMobile extends KashiDigitsInput {
  protected kind: Kind = {
    label: "شمارهٔ موبایل",
    maxDigits: 11,
    normalize: normalizeMobile,
    format: formatMobile,
    valid: (d) => isValidMobile(d),
    invalidMessage: "شماره موبایل معتبر نیست.",
    placeholder: { fa: "۰۹۱۲ ۳۴۵ ۶۷۸۹", latin: "0912 345 6789" },
    digits: "fa",
    type: "tel",
    inputMode: "tel",
    autocomplete: "tel-national",
    meta: (d) => {
      const op = getMobileOperator(d);
      return op ? { text: op.name } : null;
    },
    detail: (d) => ({ operator: getMobileOperator(d)?.name ?? null }),
  };
}

/** تلفن ثابت با پیش‌شماره و نام استان */
export class KashiLandline extends KashiDigitsInput {
  protected kind: Kind = {
    label: "تلفن ثابت",
    maxDigits: 11,
    normalize: normalizeLandline,
    format: formatLandline,
    valid: (d) => isValidLandline(d),
    invalidMessage: "شمارهٔ تلفن ثابت معتبر نیست.",
    placeholder: { fa: "۰۲۱ ۸۸۷۷ ۶۶۵۵", latin: "021 8877 6655" },
    digits: "fa",
    type: "tel",
    inputMode: "tel",
    autocomplete: "tel-national",
    meta: (d) => {
      const p = getLandlineProvince(d);
      return p ? { text: p } : null;
    },
    detail: (d) => ({ province: getLandlineProvince(d) }),
  };
}

/** شمارهٔ کارت بانکی: گروه‌بندی چهارتایی، نام و لوگوی بانک، بررسی Luhn */
export class KashiCardNumber extends KashiDigitsInput {
  protected kind: Kind = {
    label: "شمارهٔ کارت",
    maxDigits: 16,
    format: formatCardNumber,
    valid: (d) => isValidCardNumber(d),
    invalidMessage: "شماره کارت معتبر نیست.",
    placeholder: { fa: "۰۰۰۰ ۰۰۰۰ ۰۰۰۰ ۰۰۰۰", latin: "0000 0000 0000 0000" },
    digits: "fa",
    autocomplete: "cc-number",
    meta: (d) => {
      const bank = getBankByCard(d);
      return bank ? { text: bank.name, bank } : null;
    },
    detail: (d) => ({ bank: getBankByCard(d)?.name ?? null }),
  };
}

/** شمارهٔ شبا: IR خودکار، گروه‌بندی، نام و لوگوی بانک و بررسی رقم‌های کنترل */
export class KashiIban extends KashiDigitsInput {
  protected kind: Kind = {
    label: "شمارهٔ شبا",
    maxDigits: 24,
    format: (d) => formatIban(d),
    valid: (d) => isValidIban(d),
    invalidMessage: "شماره شبا معتبر نیست.",
    placeholder: { fa: "IR00 0000 0000 0000 0000 0000 00", latin: "IR00 0000 0000 0000 0000 0000 00" },
    digits: "latin",
    meta: (d) => {
      const bank = getBankByIban(d);
      return bank ? { text: bank.name, bank } : null;
    },
    submit: (d) => (d ? `IR${d}` : ""),
    detail: (d) => ({ bank: getBankByIban(d)?.name ?? null }),
  };
  protected clean(text: string): string {
    return super.clean(text.replace(/^\s*IR/i, ""));
  }
}

/** کد پستی ۱۰ رقمی با قالب ۱۲۳۴۵-۶۷۸۹۰ */
export class KashiPostalCode extends KashiDigitsInput {
  protected kind: Kind = {
    label: "کد پستی",
    maxDigits: 10,
    format: formatPostalCode,
    valid: (d) => isValidPostalCode(d),
    invalidMessage: "کد پستی معتبر نیست.",
    placeholder: { fa: "۱۲۳۴۵-۶۷۸۹۰", latin: "12345-67890" },
    digits: "fa",
    autocomplete: "postal-code",
  };
}

/** مبلغ: جداکنندهٔ هزارگان، واحد پول و مبلغ به حروف زیر فیلد */
export class KashiPrice extends KashiDigitsInput {
  static observedAttributes = [...KashiDigitsInput.observedAttributes, "unit", "min", "max", "show-words"];
  protected kind: Kind = {
    label: "مبلغ",
    maxDigits: 15,
    normalize: (d) => d.replace(/^0+(?=\d)/, ""),
    format: (d) => (d ? formatNumber(d, { digits: "latin" }).replace(/,/g, "٬") : ""),
    valid: () => this.inRange(),
    invalidMessage: "",
    placeholder: { fa: "۰", latin: "0" },
    digits: "fa",
    meta: (_d, host) => {
      const unit = host.getAttribute("unit") ?? "تومان";
      return unit ? { text: unit } : null;
    },
    detail: (d) => ({ value: d ? Number(d) : null }),
  };
  /** مبلغ به شکل عدد، یا null برای فیلد خالی */
  get valueAsNumber(): number | null {
    return this.raw ? Number(this.raw) : null;
  }
  private num(name: string): number | undefined {
    const v = this.getAttribute(name);
    return v === null || v === "" || Number.isNaN(Number(v)) ? undefined : Number(v);
  }
  private inRange(): boolean {
    if (!this.raw) return true;
    const n = Number(this.raw), min = this.num("min"), max = this.num("max");
    return !((min !== undefined && n < min) || (max !== undefined && n > max));
  }
  protected invalidText(touched: boolean): string | null {
    if (!touched || this.inRange()) return null;
    const custom = this.getAttribute("invalid-message");
    if (custom) return custom;
    const min = this.num("min"), max = this.num("max");
    const f = (n: number) => fa(formatNumber(n));
    return `مبلغ باید ${min !== undefined ? `حداقل ${f(min)}` : ""}${min !== undefined && max !== undefined ? " و " : ""}${max !== undefined ? `حداکثر ${f(max)}` : ""} باشد.`;
  }
  protected hintText(): string | null {
    if (this.raw && bool(this, "show-words", true)) {
      const unit = this.getAttribute("unit") ?? "تومان";
      return `${numberToWords(Number(this.raw))}${unit ? ` ${unit}` : ""}`;
    }
    return this.getAttribute("hint");
  }
}

define("kashi-national-id", KashiNationalId, "block");
define("kashi-legal-id", KashiLegalId, "block");
define("kashi-mobile", KashiMobile, "block");
define("kashi-landline", KashiLandline, "block");
define("kashi-card-number", KashiCardNumber, "block");
define("kashi-iban", KashiIban, "block");
define("kashi-postal-code", KashiPostalCode, "block");
define("kashi-price", KashiPrice, "block");
