import { toFaDigits } from "@kashi-ui/persian";
import { HTMLBase, ICONS, afterParse, bool, define, emit, esc, fieldHTML, setMessages, uid } from "./base.js";

const EYE = (off: boolean) => `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.8 10S4.8 4.5 10 4.5 18.2 10 18.2 10 15.2 15.5 10 15.5 1.8 10 1.8 10Z"/><circle cx="10" cy="10" r="2.5"/>${off ? '<path d="m3 3 14 14"/>' : ""}</svg>`;
const X = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="m6 6 8 8M14 6l-8 8"/></svg>';

/** ویژگی‌هایی که مستقیم روی input یا textarea داخلی می‌روند */
const PASS = ["name", "placeholder", "autocomplete", "inputmode", "maxlength", "minlength", "pattern", "min", "max", "step", "dir", "spellcheck"];

/**
 * فیلد متنی کاشی با برچسب، راهنما و خطا؛ با clearable دکمهٔ پاک کردن، با type="password" دکمهٔ نمایش رمز،
 * با show-count شمارندهٔ نویسه («۱۲ / ۱۰۰» با maxlength) و با loading اسپینر. input واقعی داخل عنصر است و با name مستقیم در فرم ارسال می‌شود.
 */
export class KashiInput extends HTMLBase {
  static observedAttributes = ["label", "hint", "error", "type", "required", "disabled", "readonly", "clearable", "revealable", "show-count", "loading", "size", "optional", "aria-label", "value", ...PASS];
  protected multiline = false;
  protected key = uid("kashi-input");
  protected control!: HTMLInputElement | HTMLTextAreaElement;
  private text = "";
  private revealed = false;
  private rendered = false;
  private valueSet = false;

  connectedCallback() {
    if (!this.rendered && !this.valueSet) this.text = this.getAttribute("value") ?? "";
    this.render();
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.rendered || old === next) return;
    if (name === "value") this.value = next ?? "";
    else {
      this.text = this.control.value;
      this.render();
    }
  }
  get value() {
    return this.rendered ? this.control.value : this.text;
  }
  set value(v: string) {
    this.valueSet = true;
    this.text = String(v ?? "");
    if (this.rendered) {
      this.control.value = this.text;
      this.paint();
    }
  }
  focus(options?: FocusOptions) {
    this.control?.focus(options);
  }

  protected render() {
    const id = this.key;
    const ariaLabel = this.getAttribute("aria-label");
    const label = this.getAttribute("label");
    const type = this.getAttribute("type") ?? "text";
    const size = this.getAttribute("size");
    const disabled = this.hasAttribute("disabled");
    const attrs = PASS.map((a) => (this.hasAttribute(a) ? ` ${a}="${esc(this.getAttribute(a))}"` : "")).join("");
    const flags = `${this.hasAttribute("required") ? " required" : ""}${disabled ? " disabled" : ""}${this.hasAttribute("readonly") ? " readonly" : ""}${!label && ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ""}`;
    const control = this.multiline
      ? `<textarea id="${id}" class="k-input__control" rows="${Number(this.getAttribute("rows")) || 4}"${attrs}${flags}></textarea>`
      : `<input id="${id}" class="k-input__control" type="${esc(type === "password" && this.revealed ? "text" : type)}"${attrs}${flags}>`;
    const box = `<div class="k-input${this.multiline ? " k-input--textarea" : ""}${bool(this, "autoresize") ? " k-input--autoresize" : ""}${size === "sm" || size === "lg" ? ` k-input--${size}` : ""}" data-size="${size ?? "md"}"${disabled ? ' data-state="disabled"' : ""}>${control}<span class="k-input__end"></span></div>`;
    const optional = this.getAttribute("optional");
    this.querySelector(":scope > .k-field")?.remove();
    this.insertAdjacentHTML("afterbegin", fieldHTML({ id, label, required: this.hasAttribute("required"), optional: optional === null ? null : optional || "اختیاری", control: box }));
    this.control = this.querySelector(".k-input__control")!;
    this.control.value = this.text;
    this.control.addEventListener("input", () => {
      this.paint();
      emit(this, "kashi-change", { value: this.control.value });
    });
    this.querySelector(".k-input__end")!.addEventListener("click", (e) => {
      const b = (e.target as Element).closest<HTMLButtonElement>("button");
      if (!b) return;
      if (b.dataset.act === "clear") {
        this.control.value = "";
        this.control.dispatchEvent(new Event("input", { bubbles: true }));
        this.control.focus();
        emit(this, "kashi-clear", {});
      } else if (b.dataset.act === "reveal") {
        this.revealed = !this.revealed;
        (this.control as HTMLInputElement).type = this.revealed ? "text" : "password";
        this.paint();
        b.focus();
      }
    });
    this.rendered = true;
    this.paint();
  }

  /** دکمه‌های انتهای فیلد، شمارنده و پیام‌ها */
  private paint() {
    const el = this.control;
    const len = el.value.length;
    const off = this.hasAttribute("disabled") || this.hasAttribute("readonly");
    const end = this.querySelector<HTMLElement>(".k-input__end")!;
    const password = !this.multiline && this.getAttribute("type") === "password" && this.getAttribute("revealable") !== "false";
    end.innerHTML = [
      bool(this, "loading") ? '<span class="k-input__addon"><span class="k-spinner k-spinner--sm" role="status" aria-label="در حال بررسی"></span></span>' : "",
      bool(this, "clearable") && len > 0 && !off ? `<button type="button" class="k-input__action" data-act="clear" aria-label="پاک کردن">${X}</button>` : "",
      password ? `<button type="button" class="k-input__action" data-act="reveal" aria-label="${this.revealed ? "پنهان کردن رمز" : "نمایش رمز"}" aria-pressed="${this.revealed}">${EYE(this.revealed)}</button>` : "",
    ].join("");
    end.style.display = end.innerHTML ? "contents" : "none";
    const field = this.querySelector<HTMLElement>(":scope > .k-field")!;
    const countId = `${this.key}-count`;
    setMessages(field, el, this.key, this.getAttribute("error"), this.getAttribute("hint"), bool(this, "show-count") ? countId : null);
    if (bool(this, "show-count")) {
      const max = Number(this.getAttribute("maxlength")) || 0;
      let row = field.querySelector(":scope > .k-field__hint-row");
      if (!row) {
        row = document.createElement("div");
        row.className = "k-field__hint-row";
        row.innerHTML = '<div class="k-field__hints"></div>';
        field.append(row);
      }
      row.insertAdjacentHTML("beforeend", `<span class="k-counter" id="${countId}"${max && len > max ? ' data-over=""' : ""}>${max ? `${toFaDigits(len)} / ${toFaDigits(max)}` : toFaDigits(len)}</span>`);
    }
  }
}

/** متن چندخطی کاشی؛ همان ویژگی‌های kashi-input به‌اضافهٔ rows و autoresize (ارتفاع خودکار) */
export class KashiTextarea extends KashiInput {
  static observedAttributes = [...KashiInput.observedAttributes, "rows", "autoresize"];
  protected multiline = true;
}

/**
 * نوار اطلاعیهٔ بالای صفحه با tone (brand، warning یا error) و دکمهٔ بستن (dismissible).
 * عنصرهای slot="actions" کنار متن و slot="icon" پیش از آن می‌آیند؛ با remember="کلید" بستن در همین مرورگر یادش می‌ماند.
 */
export class KashiBanner extends HTMLBase {
  static observedAttributes = ["tone", "flush", "label", "dismissible", "close-label"];
  private box: HTMLElement | null = null;

  connectedCallback() {
    afterParse(() => {
      if (!this.isConnected || this.box) return;
      const key = this.getAttribute("remember");
      if (key && this.read(key)) {
        this.hidden = true;
        return;
      }
      this.build();
    });
  }
  attributeChangedCallback() {
    if (this.box) this.decorate();
  }

  private read(key: string) {
    try {
      return localStorage.getItem(`kashi-banner:${key}`) === "closed";
    } catch {
      return false;
    }
  }

  private build() {
    const icon = this.querySelector(":scope > [slot='icon']");
    const actions = [...this.querySelectorAll(":scope > [slot='actions']")];
    const rest = [...this.childNodes].filter((n) => n !== icon && !actions.includes(n as Element));
    const box = document.createElement("div");
    box.setAttribute("role", "region");
    if (icon) {
      icon.removeAttribute("slot");
      const s = document.createElement("span");
      s.className = "k-banner__icon";
      s.setAttribute("aria-hidden", "true");
      s.append(icon);
      box.append(s);
    }
    const text = document.createElement("p");
    text.className = "k-banner__text";
    text.append(...rest);
    box.append(text);
    if (actions.length) {
      const a = document.createElement("div");
      a.className = "k-banner__actions";
      for (const el of actions) {
        el.removeAttribute("slot");
        a.append(el);
      }
      box.append(a);
    }
    this.replaceChildren(box);
    this.box = box;
    this.decorate();
  }

  private decorate() {
    const box = this.box!;
    const tone = this.getAttribute("tone");
    box.className = `k-banner${tone && tone !== "neutral" ? ` k-banner--${tone}` : ""}${bool(this, "flush") ? " k-banner--flush" : ""}`;
    box.setAttribute("aria-label", this.getAttribute("label") ?? "اطلاعیه");
    box.querySelector(".k-banner__close")?.remove();
    if (bool(this, "dismissible")) {
      box.insertAdjacentHTML("beforeend", `<button type="button" class="k-btn k-btn--tertiary k-btn--icon k-btn--sm k-banner__close" aria-label="${esc(this.getAttribute("close-label") ?? "بستن اطلاعیه")}">${ICONS.close}</button>`);
      box.querySelector(".k-banner__close")!.addEventListener("click", () => this.close());
    }
  }

  /** بستن اطلاعیه؛ با preventDefault روی رویداد kashi-close جلوی بستن گرفته می‌شود */
  close() {
    const ev = new CustomEvent("kashi-close", { bubbles: true, cancelable: true, detail: {} });
    if (!this.dispatchEvent(ev)) return;
    this.hidden = true;
    const key = this.getAttribute("remember");
    if (key) {
      try {
        localStorage.setItem(`kashi-banner:${key}`, "closed");
      } catch { /* حالت خصوصی */ }
    }
  }
}

define("kashi-input", KashiInput, "block");
define("kashi-textarea", KashiTextarea, "block");
define("kashi-banner", KashiBanner, "block");
