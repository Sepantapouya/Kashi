import { formatNumber, normalizePersian, onlyDigits, toEnDigits, toFaDigits } from "@kashi-ui/persian";
import { bool, define, digitsOf, emit, esc, fieldHTML, HTMLBase, msg, num, setMessages, uid } from "./base.js";

const REMOVE = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 8 8M14 6l-8 8"/></svg>';

/** چند فیلد پنهان با یک name، برای ارسال چند مقدار در فرم HTML */
function syncHiddenList(host: Element, name: string | null, values: string[]) {
  host.querySelectorAll(":scope > input[type=hidden][data-kashi-value]").forEach((el) => el.remove());
  if (!name) return;
  for (const v of values) {
    const h = document.createElement("input");
    h.type = "hidden";
    h.name = name;
    h.value = v;
    h.dataset.kashiValue = "";
    host.append(h);
  }
}

/**
 * فیلد برچسب: با Enter، «,» یا «،» اضافه، با Backspace حذف آخرین، و چسباندن چند مورد با هم.
 * با name هر برچسب یک فیلد پنهان هم‌نام در فرم است.
 */
export class KashiTagInput extends HTMLBase {
  static observedAttributes = ["label", "hint", "error", "placeholder", "disabled", "name", "value", "max", "tone", "allow-duplicates", "aria-label"];
  private tags: string[] = [];
  private localError: string | null = null;
  private rendered = false;
  private valueSet = false;
  private key = uid("kashi-tags");
  private input!: HTMLInputElement;
  /** اعتبارسنجی هر برچسب؛ پیام خطا یا undefined */
  validate?: (tag: string) => string | undefined;

  connectedCallback() {
    if (!this.rendered && !this.valueSet) this.tags = this.parse(this.getAttribute("value"));
    this.render();
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.rendered || old === next) return;
    if (name === "value") this.value = this.parse(next);
    else this.render();
  }
  private parse(v: string | null) {
    return (v ?? "").split(/[,،]/).map((s) => s.trim()).filter(Boolean);
  }

  /** برچسب‌ها به‌شکل آرایه */
  get value(): string[] {
    return [...this.tags];
  }
  set value(v: string[] | string) {
    this.valueSet = true;
    this.tags = Array.isArray(v) ? [...v] : this.parse(v);
    if (this.rendered) this.paint();
  }
  focus(options?: FocusOptions) {
    this.input?.focus(options);
  }

  private render() {
    const id = this.key;
    const ariaLabel = this.getAttribute("aria-label");
    const label = this.hasAttribute("label") ? this.getAttribute("label") : ariaLabel ? null : msg().tagInput.label;
    const control = `<div class="k-tag-input"><input id="${id}" class="k-tag-input__control"${this.hasAttribute("disabled") ? " disabled" : ""}${!label && ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ""}></div><span class="k-sr-only" aria-live="polite"></span>`;
    this.querySelector(":scope > .k-field")?.remove();
    this.insertAdjacentHTML("afterbegin", fieldHTML({ id, label, control }));
    this.input = this.querySelector(".k-tag-input__control")!;
    const box = this.querySelector(".k-tag-input")!;
    box.addEventListener("click", (e) => {
      const rm = (e.target as Element).closest<HTMLElement>(".k-badge__remove");
      if (rm) this.removeAt(Number(rm.dataset.i));
      else this.input.focus();
    });
    this.input.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === "," || e.key === "،") && this.input.value.trim()) {
        e.preventDefault();
        this.add([this.input.value]);
      } else if (e.key === "Backspace" && !this.input.value && this.tags.length) this.removeAt(this.tags.length - 1);
    });
    this.input.addEventListener("input", () => {
      this.localError = null;
      // صفحه‌کلید موبایل و IME رویداد کلید نمی‌فرستند؛ جداکننده را در متن هم پیدا کن
      const parts = this.input.value.split(/[,،\n\t]/);
      if (parts.length > 1) {
        const rest = parts.pop() ?? "";
        this.add(parts);
        if (rest && !this.localError) this.input.value = rest;
      } else this.paintMessages();
    });
    this.input.addEventListener("blur", () => this.input.value.trim() && this.add([this.input.value]));
    this.rendered = true;
    this.paint();
  }

  private add(raw: string[]) {
    const max = Number(this.getAttribute("max")) || Infinity;
    const dup = bool(this, "allow-duplicates");
    let next = [...this.tags];
    let added = "";
    for (const r of raw) {
      const t = normalizePersian(r).trim();
      if (!t) continue;
      const err = next.length >= max ? msg().common.max(num(this, max)) : !dup && next.includes(t) ? msg().tagInput.duplicate : this.validate?.(t);
      if (err) {
        this.localError = err;
        this.commit(next, added);
        this.input.value = t;
        return;
      }
      next = [...next, t];
      added = msg().common.added(t);
    }
    this.localError = null;
    this.input.value = "";
    this.commit(next, added);
  }

  private removeAt(i: number) {
    const t = this.tags[i];
    this.commit(this.tags.filter((_, j) => j !== i), msg().common.removed(t));
    this.input.focus();
  }

  private commit(next: string[], announce: string) {
    const changed = next.join("\u0000") !== this.tags.join("\u0000");
    this.tags = next;
    this.paint();
    if (announce) this.querySelector(".k-field > .k-sr-only")!.textContent = announce;
    if (changed) emit(this, "kashi-change", { value: [...next] });
  }

  private paint() {
    const box = this.querySelector(".k-tag-input")!;
    box.querySelectorAll(".k-badge").forEach((b) => b.remove());
    const tone = this.getAttribute("tone") ?? "brand";
    const off = this.hasAttribute("disabled");
    const badges = this.tags.map((t, i) => `<span class="k-badge${tone !== "neutral" ? ` k-badge--${esc(tone)}` : ""}${off ? "" : " k-badge--removable"}">${esc(t)}${off ? "" : `<button type="button" class="k-badge__remove" data-i="${i}" aria-label="${esc(msg().common.remove(t))}">${REMOVE}</button>`}</span>`).join("");
    this.input.insertAdjacentHTML("beforebegin", badges);
    this.input.placeholder = this.tags.length ? "" : (this.getAttribute("placeholder") ?? "");
    this.paintMessages();
    syncHiddenList(this, this.getAttribute("name"), this.tags);
  }
  private paintMessages() {
    const error = this.getAttribute("error") || this.localError;
    this.querySelector(".k-tag-input")!.toggleAttribute("data-invalid", !!error);
    setMessages(this.querySelector(":scope > .k-field")!, this.input, this.key, error, this.getAttribute("hint"));
  }
}

const MINUS = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 10h10"/></svg>';
const PLUS = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M10 5v10M5 10h10"/></svg>';

/** فیلد عدد با دکمه‌های − و +، ارقام فارسی، جداکنندهٔ هزارگان و کلیدهای ↑↓ و PageUp/PageDown */
export class KashiNumberInput extends HTMLBase {
  static observedAttributes = ["label", "hint", "error", "value", "min", "max", "step", "thousands", "digits", "unit", "disabled", "name", "aria-label"];
  private current: number | null = null;
  private rendered = false;
  private valueSet = false;
  private key = uid("kashi-num");
  private input!: HTMLInputElement;

  connectedCallback() {
    if (!this.rendered && !this.valueSet) this.current = this.num(this.getAttribute("value")) ?? null;
    this.render();
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.rendered || old === next) return;
    if (name === "value") this.value = next === null || next === "" ? null : Number(next);
    else this.render();
  }

  get value(): number | null {
    return this.current;
  }
  set value(v: number | null) {
    this.valueSet = true;
    this.current = v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v);
    if (this.rendered) this.paint();
  }
  focus(options?: FocusOptions) {
    this.input?.focus(options);
  }

  private num(v: string | null) {
    return v === null || v === "" || Number.isNaN(Number(v)) ? undefined : Number(v);
  }
  private get min() {
    return this.num(this.getAttribute("min"));
  }
  private get max() {
    return this.num(this.getAttribute("max"));
  }
  private clamp(n: number) {
    return Math.min(this.max ?? Infinity, Math.max(this.min ?? -Infinity, n));
  }
  private show(n: number | null) {
    if (n === null) return "";
    const s = this.hasAttribute("thousands") ? formatNumber(n, { digits: "latin" }) : String(n);
    return digitsOf(this) === "latin" ? s : toFaDigits(s).replace(/,/g, "٬");
  }

  private render() {
    const id = this.key;
    const ariaLabel = this.getAttribute("aria-label");
    const label = this.hasAttribute("label") ? this.getAttribute("label") : ariaLabel ? null : msg().numberInput.label;
    const disabled = this.hasAttribute("disabled");
    const unit = this.getAttribute("unit");
    const control = `<div class="k-number"><div class="k-input"${disabled ? ' data-state="disabled"' : ""}><button type="button" class="k-number__step" data-step="-1" tabindex="-1" aria-label="${esc(msg().numberInput.decrement)}"${disabled ? " disabled" : ""}>${MINUS}</button><input id="${id}" class="k-input__control" type="text" inputmode="decimal" role="spinbutton" dir="ltr"${disabled ? " disabled" : ""}${!label && ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ""}>${unit ? `<span class="k-input__addon">${esc(unit)}</span>` : ""}<button type="button" class="k-number__step" data-step="1" tabindex="-1" aria-label="${esc(msg().numberInput.increment)}"${disabled ? " disabled" : ""}>${PLUS}</button></div></div>`;
    this.querySelector(":scope > .k-field")?.remove();
    this.insertAdjacentHTML("afterbegin", fieldHTML({ id, label, control }));
    this.input = this.querySelector("input.k-input__control")!;
    this.querySelectorAll<HTMLButtonElement>(".k-number__step").forEach((b) => b.addEventListener("click", () => this.bump(Number(b.dataset.step))));
    this.input.addEventListener("input", () => {
      const raw = this.input.value;
      const d = onlyDigits(raw);
      // هنگام تایپ محدود نمی‌شود تا عدد نیمه‌کاره پاک نشود؛ محدودسازی در blur و دکمه‌ها
      this.set(d ? (/^\s*[-−]/.test(raw) ? -1 : 1) * Number(d) : null, false);
    });
    this.input.addEventListener("blur", () => {
      if (this.current !== null && this.current !== this.clamp(this.current)) this.set(this.clamp(this.current));
      else this.paint();
    });
    this.input.addEventListener("keydown", (e) => {
      const keys: Record<string, () => void> = {
        ArrowUp: () => this.bump(1),
        ArrowDown: () => this.bump(-1),
        PageUp: () => this.bump(10),
        PageDown: () => this.bump(-10),
        Home: () => this.min !== undefined && this.set(this.min),
        End: () => this.max !== undefined && this.set(this.max),
      };
      if (!keys[e.key]) return;
      e.preventDefault();
      keys[e.key]();
    });
    this.rendered = true;
    this.paint();
  }

  private bump(k: number) {
    const step = this.num(this.getAttribute("step")) ?? 1;
    this.set(this.clamp((this.current ?? this.min ?? 0) + k * step));
  }

  private set(n: number | null, repaint = true) {
    const changed = n !== this.current;
    this.current = n;
    if (repaint) this.paint();
    else this.paintState();
    if (changed) emit(this, "kashi-change", { value: n });
  }

  private paint() {
    const shown = this.show(this.current);
    if (this.input.value !== shown) this.input.value = shown;
    this.paintState();
  }
  private paintState() {
    const el = this.input;
    const c = this.current;
    for (const [a, v] of [["aria-valuenow", c], ["aria-valuemin", this.min], ["aria-valuemax", this.max]] as const) {
      if (v === null || v === undefined) el.removeAttribute(a);
      else el.setAttribute(a, String(v));
    }
    if (c === null) el.removeAttribute("aria-valuetext");
    else el.setAttribute("aria-valuetext", this.show(c));
    const off = this.hasAttribute("disabled");
    const [dec, inc] = this.querySelectorAll<HTMLButtonElement>(".k-number__step");
    dec.disabled = off || (this.min !== undefined && (c ?? 0) <= this.min);
    inc.disabled = off || (this.max !== undefined && (c ?? 0) >= this.max);
    setMessages(this.querySelector(":scope > .k-field")!, el, this.key, this.getAttribute("error"), this.getAttribute("hint"));
    syncHiddenList(this, this.getAttribute("name"), [c === null ? "" : String(c)]);
  }
}

const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3L2.8 9.5l6.4-.8z"/><path class="k-rating__half" fill="none" d="M12 2.8v14.3l-5.7 3.1 1.2-6.3L2.8 9.5l6.4-.8z"/></svg>';

/** امتیاز ستاره‌ای روی رادیوهای بومی؛ با readonly فقط نمایش (با نیم‌ستاره برای امتیاز اعشاری) */
export class KashiRating extends HTMLBase {
  static observedAttributes = ["value", "max", "readonly", "show-value", "size", "label", "name", "disabled"];
  private current = 0;
  private valueSet = false;
  private key = uid("kashi-rate");

  connectedCallback() {
    if (!this.valueSet) this.current = Number(this.getAttribute("value")) || 0;
    this.render();
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (old === next || !this.isConnected) return;
    if (name === "value") this.current = Number(next) || 0;
    this.render();
  }
  get value() {
    return this.current;
  }
  set value(v: number) {
    this.valueSet = true;
    this.current = Number(v) || 0;
    if (this.isConnected) this.render();
  }

  private render() {
    const max = Number(this.getAttribute("max")) || 5;
    const label = this.getAttribute("label") ?? msg().rating.label;
    const faNum = (x: number) => num(this, x).replace(".", msg().common.decimal);
    const size = this.getAttribute("size");
    const cls = `k-rating${size === "sm" || size === "lg" ? ` k-rating--${size}` : ""}`;
    const c = this.current;
    const stars = Array.from({ length: max }, (_, i) => i + 1);
    const valueHtml = this.hasAttribute("show-value") ? `<span class="k-rating__value" aria-hidden="true">${faNum(c)}</span>` : "";
    if (this.hasAttribute("readonly")) {
      this.innerHTML = `<span class="${cls}" data-readonly="" role="img" aria-label="${esc(`${label}: ${msg().common.of(faNum(c), faNum(max))}`)}">${stars.map((n) => `<span class="k-rating__star"${n <= Math.floor(c) ? ' data-filled=""' : ""}${n === Math.ceil(c) && c % 1 >= 0.25 ? ' data-half=""' : ""}>${STAR}</span>`).join("")}${valueHtml}</span>`;
      return;
    }
    const name = this.getAttribute("name") ?? this.key;
    const off = this.hasAttribute("disabled");
    this.innerHTML = `<fieldset class="${cls}"><legend class="k-sr-only">${esc(label)}</legend>${stars.map((n) => `<label class="k-rating__star"${n <= c ? ' data-filled=""' : ""}><input type="radio" class="k-sr-only" name="${esc(name)}" value="${n}"${c === n ? " checked" : ""}${off ? " disabled" : ""} aria-label="${esc(msg().common.of(faNum(n), faNum(max)))}">${STAR}</label>`).join("")}${valueHtml}</fieldset>`;
    const fs = this.querySelector("fieldset")!;
    const fill = (upto: number) => fs.querySelectorAll(".k-rating__star").forEach((s, i) => s.toggleAttribute("data-filled", i + 1 <= upto));
    fs.addEventListener("change", (e) => {
      this.current = Number((e.target as HTMLInputElement).value);
      fill(this.current);
      emit(this, "kashi-change", { value: this.current });
    });
    fs.addEventListener("pointerover", (e) => {
      const star = (e.target as Element).closest(".k-rating__star");
      if (star && !off) fill([...fs.querySelectorAll(".k-rating__star")].indexOf(star) + 1);
    });
    fs.addEventListener("pointerleave", () => fill(this.current));
  }
}

/** شماره‌های صفحه: ۱ … ۴ ۵ ۶ … ۲۰ */
export function pageRange(page: number, total: number, siblings = 1): (number | null)[] {
  const out: (number | null)[] = [1];
  const from = Math.max(2, page - siblings);
  const to = Math.min(total - 1, page + siblings);
  if (from > 2) out.push(from === 3 ? 2 : null);
  for (let p = from; p <= to; p++) out.push(p);
  if (to < total - 1) out.push(to === total - 2 ? total - 1 : null);
  if (total > 1) out.push(total);
  return out;
}
const chevron = (d: string) => `<svg data-k-mirror="" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

/**
 * صفحه‌بندی. با href (مثل "?page={page}") لینک می‌سازد و با رفتن به صفحهٔ دیگر صفحه عوض می‌شود؛
 * بدون آن دکمه است و رویداد kashi-change با شمارهٔ صفحه می‌فرستد.
 */
export class KashiPagination extends HTMLBase {
  static observedAttributes = ["page", "total", "siblings", "href", "digits", "label", "summary"];
  connectedCallback() {
    this.render();
  }
  attributeChangedCallback(_n: string, old: string | null, next: string | null) {
    if (old !== next && this.isConnected) this.render();
  }
  get page() {
    return Math.max(1, Number(this.getAttribute("page")) || 1);
  }
  set page(p: number) {
    this.setAttribute("page", String(p));
  }
  get total() {
    return Math.max(1, Number(this.getAttribute("total")) || 1);
  }

  private render() {
    const page = Math.min(this.page, this.total), total = this.total;
    const n = (v: number) => (digitsOf(this) === "latin" ? String(v) : toFaDigits(v));
    const href = this.getAttribute("href");
    const focused = this.contains(document.activeElement) ? (document.activeElement as HTMLElement).dataset.to : null;
    const item = (to: number, body: string, cls: string, { current = false, disabled = false, aria = "" } = {}) =>
      href && !disabled
        ? `<a class="${cls}" href="${esc(href.replace("{page}", String(to)))}" data-to="${to}"${current ? ' aria-current="page"' : ""}${aria ? ` aria-label="${esc(aria)}"` : ""}>${body}</a>`
        : `<button type="button" class="${cls}" data-to="${to}"${disabled ? " disabled" : ""}${current ? ' aria-current="page"' : ""}${aria ? ` aria-label="${esc(aria)}"` : ""}>${body}</button>`;
    const summary = this.getAttribute("summary");
    this.innerHTML = `<nav class="k-pagination" aria-label="${esc(this.getAttribute("label") ?? msg().pagination.nav)}">${item(page - 1, `${chevron("m12 5-5 5 5 5")}${esc(msg().common.prev)}`, "k-btn k-btn--secondary k-btn--sm", { disabled: page <= 1 })}${summary ? `<span class="k-pagination__summary">${esc(summary)}</span>` : ""}<ul class="k-pagination__pages" role="list">${pageRange(page, total, Number(this.getAttribute("siblings") ?? 1)).map((p) => `<li>${p === null ? '<span class="k-pagination__ellipsis" aria-hidden="true">…</span>' : item(p, n(p), "k-pagination__page", { current: p === page, aria: msg().pagination.page(n(p)) })}</li>`).join("")}</ul>${item(page + 1, `${esc(msg().common.next)}${chevron("m8 5 5 5-5 5")}`, "k-btn k-btn--secondary k-btn--sm", { disabled: page >= total })}</nav>`;
    this.querySelector("nav")!.addEventListener("click", (e) => {
      const b = (e.target as Element).closest<HTMLButtonElement>("button[data-to]");
      if (!b || b.disabled) return;
      const to = Number(b.dataset.to);
      this.setAttribute("page", String(to));
      emit(this, "kashi-change", { page: to });
      // فوکوس روی شمارهٔ صفحهٔ تازه بماند
      this.querySelector<HTMLElement>(`.k-pagination__page[data-to="${to}"]`)?.focus();
    });
    if (focused) this.querySelector<HTMLElement>(`[data-to="${focused}"]`)?.focus();
  }
}

/** تبدیل متن سلول به عدد برای مرتب‌سازی: «۱٬۲۵۰٬۰۰۰ تومان» → 1250000 */
export const cellNumber = (text: string) => {
  const t = toEnDigits(text).replace(/[٬,\s]/g, "").replace("٫", ".").replace("−", "-");
  const m = t.match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : NaN;
};

define("kashi-tag-input", KashiTagInput, "block");
define("kashi-number-input", KashiNumberInput, "block");
define("kashi-rating", KashiRating);
define("kashi-pagination", KashiPagination, "block");
