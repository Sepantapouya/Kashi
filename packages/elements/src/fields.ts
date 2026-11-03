import { PROVINCES, onlyDigits, toFaDigits } from "@kashi-ui/persian";
import { HTMLBase, define, emit, esc, fieldHTML, setMessages, syncHidden, uid } from "./base.js";

/**
 * کد تأیید یک‌بارمصرف: یک input واقعی (نه شش input جدا)، پس چسباندن، پاک کردن،
 * صفحه‌خوان و پر شدن خودکار کد پیامکی (autocomplete="one-time-code") کار می‌کنند.
 */
export class KashiOtp extends HTMLBase {
  static observedAttributes = ["label", "hint", "error", "length", "digits", "group-after", "size", "disabled", "name", "value", "aria-label"];
  private code = "";
  private caret = 0;
  private rendered = false;
  private key = uid("kashi-otp");
  private input!: HTMLInputElement;

  connectedCallback() {
    if (!this.rendered) this.code = onlyDigits(this.getAttribute("value") ?? "").slice(0, this.length);
    this.render();
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.rendered || old === next) return;
    if (name === "value") {
      this.code = onlyDigits(next ?? "").slice(0, this.length);
      this.paint();
    } else this.render();
  }

  get value() {
    return this.code;
  }
  set value(v: string) {
    this.code = onlyDigits(String(v ?? "")).slice(0, this.length);
    if (this.rendered) this.paint();
  }
  focus(options?: FocusOptions) {
    this.input?.focus(options);
  }
  private get length() {
    const n = Number(this.getAttribute("length"));
    return Number.isInteger(n) && n > 0 ? n : 6;
  }

  private render() {
    const id = this.key;
    const length = this.length;
    const group = Number(this.getAttribute("group-after")) || 0;
    const ariaLabel = this.getAttribute("aria-label");
    const label = this.hasAttribute("label") ? this.getAttribute("label") : ariaLabel ? null : "کد تأیید";
    const slots = Array.from({ length }, (_, i) =>
      `${group && i === group ? '<span class="k-otp__sep" aria-hidden="true"></span>' : ""}<span class="k-otp__slot" aria-hidden="true"></span>`,
    ).join("");
    const control = `<div class="k-otp${this.getAttribute("size") === "sm" ? " k-otp--sm" : ""}"><input id="${id}" class="k-otp__input" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="\\d*" maxlength="${length * 2}"${this.hasAttribute("disabled") ? " disabled" : ""}${!label && ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ""}>${slots}</div>`;
    this.querySelector(":scope > .k-field")?.remove();
    this.insertAdjacentHTML("afterbegin", fieldHTML({ id, label, control }));
    this.input = this.querySelector(".k-otp__input")!;
    this.querySelector(".k-otp")!.addEventListener("click", () => this.input.focus());
    this.input.addEventListener("input", () => {
      const next = onlyDigits(this.input.value).slice(0, this.length);
      const prev = this.code;
      this.code = next;
      this.caret = next.length;
      this.paint();
      if (next !== prev) emit(this, "kashi-change", { value: next });
      if (next.length === this.length && next !== prev) emit(this, "kashi-complete", { value: next });
    });
    const sync = () => {
      this.caret = Math.min(this.input.selectionStart ?? this.code.length, this.length);
      this.paintSlots();
    };
    for (const t of ["select", "keyup", "focus"]) this.input.addEventListener(t, sync);
    this.input.addEventListener("blur", () => this.paintSlots());
    this.rendered = true;
    this.paint();
  }

  private paint() {
    if (this.input.value !== this.code) this.input.value = this.code;
    this.paintSlots();
    const error = this.getAttribute("error");
    this.querySelector(".k-otp")!.classList.toggle("k-otp--invalid", !!error);
    setMessages(this.querySelector(":scope > .k-field")!, this.input, this.key, error, this.getAttribute("hint"));
    syncHidden(this, this.getAttribute("name"), this.code);
  }

  /** فقط خانه‌ها؛ مقدار input را دست نمی‌زند تا تایپ کاربر پیش از رویداد input پاک نشود */
  private paintSlots() {
    const fa = this.getAttribute("digits") !== "latin";
    const focused = this.ownerDocument.activeElement === this.input;
    const active = Math.min(this.caret, this.length - 1);
    this.querySelectorAll<HTMLElement>(".k-otp__slot").forEach((slot, i) => {
      const c = this.code[i] ?? "";
      slot.textContent = fa ? toFaDigits(c) : c;
      slot.toggleAttribute("data-filled", !!c);
      slot.toggleAttribute("data-active", focused && i === active);
    });
  }
}

/** انتخاب استان روی <select> بومی: در گوشی انتخاب‌گر سیستم باز می‌شود و در فرم HTML مستقیم ارسال می‌شود */
export class KashiProvinceSelect extends HTMLBase {
  static observedAttributes = ["label", "hint", "error", "required", "disabled", "name", "value", "placeholder", "size", "show-capital", "aria-label"];
  private rendered = false;
  private key = uid("kashi-prov");
  private select!: HTMLSelectElement;
  private current = "";

  connectedCallback() {
    if (!this.rendered) this.current = this.getAttribute("value") ?? "";
    this.render();
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.rendered || old === next) return;
    if (name === "value") this.value = next ?? "";
    else this.render();
  }
  get value() {
    return this.current;
  }
  set value(v: string) {
    this.current = PROVINCES.some((p) => p.name === v) ? v : "";
    if (this.select) this.select.value = this.current;
  }
  focus(options?: FocusOptions) {
    this.select?.focus(options);
  }

  private render() {
    const id = this.key;
    const ariaLabel = this.getAttribute("aria-label");
    const label = this.hasAttribute("label") ? this.getAttribute("label") : ariaLabel ? null : "استان";
    const required = this.hasAttribute("required");
    const name = this.getAttribute("name");
    const size = this.getAttribute("size");
    const capital = this.getAttribute("show-capital") === "true" || this.getAttribute("show-capital") === "";
    const options = PROVINCES.map((p) =>
      `<option value="${esc(p.name)}"${p.name === this.current ? " selected" : ""}>${esc(p.name)}${capital && p.capital !== p.name ? ` (${esc(p.capital)})` : ""}</option>`,
    ).join("");
    const control = `<div class="k-select${size === "sm" || size === "lg" ? ` k-select--${size}` : ""}"><select id="${id}" class="k-select__control"${name ? ` name="${esc(name)}"` : ""}${required ? " required" : ""}${this.hasAttribute("disabled") ? " disabled" : ""}${!label && ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ""}><option value="" disabled${this.current ? "" : " selected"}>${esc(this.getAttribute("placeholder") ?? "انتخاب استان")}</option>${options}</select></div>`;
    this.querySelector(":scope > .k-field")?.remove();
    this.insertAdjacentHTML("afterbegin", fieldHTML({ id, label, required, control }));
    this.select = this.querySelector("select")!;
    this.select.value = this.current;
    this.select.addEventListener("change", () => {
      this.current = this.select.value;
      emit(this, "kashi-change", { value: this.current, province: PROVINCES.find((p) => p.name === this.current) ?? null });
    });
    this.rendered = true;
    setMessages(this.querySelector(":scope > .k-field")!, this.select, id, this.getAttribute("error"), this.getAttribute("hint"));
  }
}

define("kashi-otp", KashiOtp, "block");
define("kashi-province-select", KashiProvinceSelect, "block");
