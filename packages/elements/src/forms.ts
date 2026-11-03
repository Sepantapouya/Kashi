import {
  PLATE_LETTERS, fixKeyboardLayout, fixPersianText, formatNumber, formatPlate, formatTime, isValidPlate, looksLikeWrongLayout,
  onlyDigits, parseTime, plateType, toFaDigits, type Plate, type Time,
} from "@kashi-ui/persian";
import { HTMLBase, afterParse, bool, define, emit, esc, fieldHTML, setMessages, syncHidden, uid } from "./base.js";
import { searchText, type ComboboxOption } from "./combobox.js";

const CHECK = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 10.5 3.2 3L15 7"/></svg>';
const X = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 8 8M14 6l-8 8"/></svg>';

/** چند فیلد پنهان هم‌نام، برای ارسال چند مقدار */
function hiddenList(host: Element, name: string | null, values: string[]) {
  host.querySelectorAll(":scope > input[type=hidden][data-kashi-value]").forEach((el) => el.remove());
  if (!name) return;
  for (const v of values) host.insertAdjacentHTML("beforeend", `<input type="hidden" data-kashi-value name="${esc(name)}" value="${esc(v)}">`);
}

/** گزینه‌ها از فرزندان <option> (با data-description) */
function readOptions(host: Element): ComboboxOption[] {
  const out = [...host.querySelectorAll<HTMLOptionElement>(":scope > option")].map((el) => ({
    value: el.value, label: el.textContent?.trim() ?? el.value, description: el.dataset.description, disabled: el.disabled,
    selected: el.hasAttribute("selected"),
  }));
  host.querySelectorAll(":scope > option").forEach((el) => el.remove());
  return out;
}

/**
 * انتخاب چندتایی با جستجو: انتخاب‌ها به‌شکل برچسب، با Backspace حذف آخرین، ↑↓ و Enter برای انتخاب.
 * گزینه‌ها از <option> (selected برای انتخاب اولیه) یا element.options.
 */
export class KashiMultiSelect extends HTMLBase {
  static observedAttributes = ["label", "hint", "error", "placeholder", "max", "disabled", "name", "aria-label"];
  private list: ComboboxOption[] | null = null;
  private chosen: string[] = [];
  private query = "";
  private active = -1;
  private isOpen = false;
  private valueSet = false;
  private key = uid("kashi-multi");
  private input!: HTMLInputElement;
  private box!: HTMLElement;
  private listbox!: HTMLUListElement;

  connectedCallback() {
    afterParse(() => {
      if (!this.isConnected) return;
      if (this.list === null) {
        const opts = readOptions(this) as (ComboboxOption & { selected?: boolean })[];
        this.list = opts;
        if (!this.valueSet) this.chosen = opts.filter((o) => o.selected).map((o) => o.value);
      }
      this.render();
    });
  }
  disconnectedCallback() {
    document.removeEventListener("pointerdown", this.onOutside);
  }
  attributeChangedCallback(_n: string, old: string | null, next: string | null) {
    if (this.box && old !== next) this.render();
  }

  get options(): ComboboxOption[] {
    return this.list ?? [];
  }
  set options(o: ComboboxOption[]) {
    this.list = [...o];
    if (this.box) this.paint();
  }
  /** مقدار گزینه‌های انتخاب‌شده */
  get value(): string[] {
    return [...this.chosen];
  }
  set value(v: string[]) {
    this.valueSet = true;
    this.chosen = [...v];
    if (this.box) this.paint();
  }

  private render() {
    const id = this.key;
    const ariaLabel = this.getAttribute("aria-label");
    const label = this.hasAttribute("label") ? this.getAttribute("label") : ariaLabel ? null : "انتخاب";
    const off = this.hasAttribute("disabled");
    const control = `<div class="k-combobox k-multiselect"><div class="k-tag-input"><input id="${id}" class="k-tag-input__control" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${id}-list" autocomplete="off"${off ? " disabled" : ""}${!label && ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ""}></div><ul id="${id}-list" role="listbox" aria-multiselectable="true" class="k-listbox" hidden style="inset-block-start: calc(100% + 6px)"${label ? ` aria-label="${esc(label)}"` : ""}></ul><span id="${id}-count" class="k-sr-only"></span><span class="k-sr-only" aria-live="polite"></span></div>`;
    this.querySelector(":scope > .k-field")?.remove();
    this.insertAdjacentHTML("afterbegin", fieldHTML({ id, label, control }));
    this.input = this.querySelector(".k-tag-input__control")!;
    this.box = this.querySelector(".k-tag-input")!;
    this.listbox = this.querySelector(".k-listbox")!;
    this.box.addEventListener("click", (e) => {
      const rm = (e.target as Element).closest<HTMLElement>("[data-remove]");
      if (rm) this.set(this.chosen.filter((v) => v !== rm.dataset.remove), `${this.labelOf(rm.dataset.remove!)} حذف شد`);
      else if ((e.target as Element).closest("[data-clear]")) this.set([], "همه حذف شد");
      this.input.focus();
    });
    this.input.addEventListener("input", () => {
      this.query = this.input.value;
      this.active = 0;
      this.open();
    });
    this.input.addEventListener("focus", () => this.open());
    this.input.addEventListener("keydown", (e) => this.onKey(e));
    this.listbox.addEventListener("pointerdown", (e) => e.preventDefault());
    this.listbox.addEventListener("click", (e) => {
      const li = (e.target as Element).closest<HTMLElement>('[role="option"]');
      if (li) this.toggle(this.filtered()[Number(li.dataset.i)]);
    });
    this.paint();
  }

  private labelOf(v: string) {
    return this.options.find((o) => o.value === v)?.label ?? v;
  }
  private filtered() {
    const q = searchText(this.query.trim());
    return this.options.filter((o) => !q || [o.label, o.description ?? ""].some((t) => searchText(t).includes(q)));
  }
  private get full() {
    const max = Number(this.getAttribute("max"));
    return !!max && this.chosen.length >= max;
  }

  private toggle(o: ComboboxOption | undefined) {
    if (!o || o.disabled) return;
    const on = this.chosen.includes(o.value);
    if (!on && this.full) return this.announce(`حداکثر ${toFaDigits(Number(this.getAttribute("max")))} مورد`);
    this.query = "";
    this.input.value = "";
    this.set(on ? this.chosen.filter((v) => v !== o.value) : [...this.chosen, o.value], `${o.label} ${on ? "حذف شد" : "انتخاب شد"}`);
  }

  private set(next: string[], message: string) {
    this.chosen = next;
    this.paint();
    this.announce(message);
    emit(this, "kashi-change", { value: [...next] });
  }
  private announce(t: string) {
    this.querySelector(".k-multiselect > .k-sr-only[aria-live]")!.textContent = t;
  }

  private open() {
    if (this.hasAttribute("disabled")) return;
    this.isOpen = true;
    this.listbox.hidden = false;
    this.input.setAttribute("aria-expanded", "true");
    this.querySelector(".k-combobox")!.setAttribute("data-open", "");
    document.addEventListener("pointerdown", this.onOutside);
    this.paintList();
  }
  private close() {
    this.isOpen = false;
    this.listbox.hidden = true;
    this.input.setAttribute("aria-expanded", "false");
    this.input.removeAttribute("aria-activedescendant");
    this.querySelector(".k-combobox")!.removeAttribute("data-open");
    document.removeEventListener("pointerdown", this.onOutside);
  }
  private onOutside = (e: PointerEvent) => {
    if (!this.contains(e.target as Node)) this.close();
  };

  private onKey(e: KeyboardEvent) {
    const list = this.filtered();
    const en = list.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
    const move = (d: number) => {
      if (!en.length) return;
      this.active = en[(en.indexOf(this.active) + d + en.length) % en.length];
      this.paintList();
    };
    if (e.key === "ArrowDown") {
      e.preventDefault();
      this.isOpen ? move(1) : this.open();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.isOpen ? move(-1) : this.open();
    } else if (e.key === "Enter" && this.isOpen && list[this.active]) {
      e.preventDefault();
      this.toggle(list[this.active]);
    } else if (e.key === "Escape" && this.isOpen) {
      e.preventDefault();
      this.close();
    } else if (e.key === "Backspace" && !this.input.value && this.chosen.length) {
      const last = this.chosen.at(-1)!;
      this.set(this.chosen.slice(0, -1), `${this.labelOf(last)} حذف شد`);
    }
  }

  private paint() {
    const off = this.hasAttribute("disabled");
    this.box.querySelectorAll(".k-badge, [data-clear]").forEach((el) => el.remove());
    const badges = this.chosen.map((v) => `<span class="k-badge k-badge--brand${off ? "" : " k-badge--removable"}">${esc(this.labelOf(v))}${off ? "" : `<button type="button" class="k-badge__remove" data-remove="${esc(v)}" aria-label="حذف ${esc(this.labelOf(v))}">${X}</button>`}</span>`).join("");
    this.input.insertAdjacentHTML("beforebegin", badges);
    if (this.chosen.length > 1 && !off) this.box.insertAdjacentHTML("beforeend", `<button type="button" class="k-input__action" data-clear aria-label="پاک کردن همه">${X}</button>`);
    this.input.placeholder = this.chosen.length ? "" : (this.getAttribute("placeholder") ?? "");
    this.querySelector(`#${this.key}-count`)!.textContent = `${toFaDigits(this.chosen.length)} مورد انتخاب شده`;
    const error = this.getAttribute("error");
    this.box.toggleAttribute("data-invalid", !!error);
    setMessages(this.querySelector(":scope > .k-field")!, this.input, this.key, error, this.getAttribute("hint"), `${this.key}-count`);
    hiddenList(this, this.getAttribute("name"), this.chosen);
    if (this.isOpen) this.paintList();
  }

  private paintList() {
    const list = this.filtered();
    const q = searchText(this.query.trim());
    const full = this.full;
    const mark = (t: string) => {
      const i = q ? searchText(t).indexOf(q) : -1;
      return i < 0 ? esc(t) : `${esc(t.slice(0, i))}<mark>${esc(t.slice(i, i + q.length))}</mark>${esc(t.slice(i + q.length))}`;
    };
    this.listbox.innerHTML = list.length
      ? list.map((o, i) => {
          const on = this.chosen.includes(o.value);
          return `<li id="${this.key}-list-${i}" data-i="${i}" role="option" aria-selected="${on}"${o.disabled || (!on && full) ? ' aria-disabled="true"' : ""}${i === this.active ? " data-active" : ""} class="k-option k-option--check"><span class="k-multiselect__box" aria-hidden="true">${on ? CHECK : ""}</span><span class="k-option__body"><span>${mark(o.label)}</span>${o.description ? `<span class="k-option__desc">${esc(o.description)}</span>` : ""}</span></li>`;
        }).join("")
      : '<li class="k-listbox__empty" role="presentation">نتیجه‌ای پیدا نشد.</li>';
    const act = this.active >= 0 ? this.listbox.querySelector<HTMLElement>(`[data-i="${this.active}"]`) : null;
    if (act) {
      this.input.setAttribute("aria-activedescendant", act.id);
      act.scrollIntoView?.({ block: "nearest" });
    } else this.input.removeAttribute("aria-activedescendant");
  }
}

/** اسلایدر روی input range بومی؛ با range دو دستگیره برای بازه (min و max) */
export class KashiSlider extends HTMLBase {
  static observedAttributes = ["label", "min", "max", "step", "value", "range", "show-value", "marks", "unit", "disabled", "name"];
  private lo = 0;
  private hi = 0;
  private valueSet = false;
  private rendered = false;
  private key = uid("kashi-slider");

  connectedCallback() {
    if (!this.rendered && !this.valueSet) this.readValue(this.getAttribute("value"));
    this.render();
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.rendered || old === next) return;
    if (name === "value") this.readValue(next);
    this.render();
  }
  private num(a: string, d: number) {
    const v = this.getAttribute(a);
    return v === null || v === "" || Number.isNaN(Number(v)) ? d : Number(v);
  }
  private get min() {
    return this.num("min", 0);
  }
  private get max() {
    return this.num("max", 100);
  }
  private get isRange() {
    return this.hasAttribute("range");
  }
  private readValue(v: string | null) {
    const parts = (v ?? "").split(/[,،]/).map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n) && String(n) !== "");
    if (this.isRange) [this.lo, this.hi] = [parts[0] ?? this.min, parts[1] ?? this.max];
    else [this.lo, this.hi] = [this.min, parts[0] ?? this.min];
  }
  /** عدد، یا در حالت range آرایهٔ [کمینه، بیشینه] */
  get value(): number | [number, number] {
    return this.isRange ? [this.lo, this.hi] : this.hi;
  }
  set value(v: number | [number, number]) {
    this.valueSet = true;
    this.readValue(Array.isArray(v) ? v.join(",") : String(v));
    if (this.rendered) this.render();
  }

  private fmt(n: number) {
    const unit = this.getAttribute("unit");
    return `${formatNumber(n)}${unit ? ` ${unit}` : ""}`;
  }

  private render() {
    const label = this.getAttribute("label");
    const range = this.isRange;
    const name = this.getAttribute("name");
    const off = this.hasAttribute("disabled");
    const pct = (n: number) => `${((n - this.min) / (this.max - this.min)) * 100}%`;
    const input = (which: "lo" | "hi") => {
      const v = which === "lo" ? this.lo : this.hi;
      const n = name ? (range ? `${name}_${which === "lo" ? "min" : "max"}` : name) : "";
      return `<input type="range" class="k-slider__input" data-which="${which}" min="${this.min}" max="${this.max}" step="${this.num("step", 1)}" value="${v}"${off ? " disabled" : ""}${n ? ` name="${esc(n)}"` : ""}${range ? ` aria-label="${which === "lo" ? "حداقل" : "حداکثر"}${label ? ` ${esc(label)}` : ""}"` : label ? ` aria-labelledby="${this.key}-label"` : ""} aria-valuetext="${esc(this.fmt(v))}">`;
    };
    const marks = (this.getAttribute("marks") ?? "").split(/[,،]/).map((s) => s.trim()).filter(Boolean).map(Number);
    const showValue = this.getAttribute("show-value") !== "false";
    this.innerHTML = `<div class="k-slider"${range ? ' data-range=""' : ""}>${label || showValue ? `<div class="k-slider__head">${label ? `<span class="k-label" id="${this.key}-label">${esc(label)}</span>` : ""}${showValue ? `<span class="k-slider__value" aria-hidden="true">${esc(range ? `${this.fmt(this.lo)} تا ${this.fmt(this.hi)}` : this.fmt(this.hi))}</span>` : ""}</div>` : ""}<div class="k-slider__track" style="--_from: ${range ? pct(this.lo) : "0%"}; --_to: ${pct(this.hi)}"><span class="k-slider__fill" aria-hidden="true"></span>${range ? input("lo") : ""}${input("hi")}</div>${marks.length ? `<div class="k-slider__marks" aria-hidden="true">${marks.map((m) => `<span>${esc(this.fmt(m))}</span>`).join("")}</div>` : ""}</div>`;
    this.rendered = true;
    this.querySelectorAll<HTMLInputElement>(".k-slider__input").forEach((el) =>
      el.addEventListener("input", () => {
        const n = Number(el.value);
        // دستگیره‌ها از روی هم رد نمی‌شوند
        if (!range) this.hi = n;
        else if (el.dataset.which === "lo") this.lo = Math.min(n, this.hi);
        else this.hi = Math.max(n, this.lo);
        el.value = String(el.dataset.which === "lo" ? this.lo : this.hi);
        el.setAttribute("aria-valuetext", this.fmt(Number(el.value)));
        const track = this.querySelector<HTMLElement>(".k-slider__track")!;
        track.style.setProperty("--_from", range ? pct(this.lo) : "0%");
        track.style.setProperty("--_to", pct(this.hi));
        const out = this.querySelector(".k-slider__value");
        if (out) out.textContent = range ? `${this.fmt(this.lo)} تا ${this.fmt(this.hi)}` : this.fmt(this.hi);
        emit(this, "kashi-change", { value: this.value });
      }),
    );
  }
}

/** گروه چیپ برای فیلتر: هر فرزند <button> (با data-value، data-count) یک چیپ است؛ با single فقط یکی */
export class KashiChipGroup extends HTMLBase {
  static observedAttributes = ["label", "single", "name"];
  private built = false;

  connectedCallback() {
    afterParse(() => this.isConnected && !this.built && this.build());
  }
  attributeChangedCallback() {
    if (!this.built) return;
    const label = this.getAttribute("label");
    if (label) this.setAttribute("aria-label", label);
    this.sync(false);
  }
  /** مقدار چیپ‌های روشن */
  get value(): string[] {
    return [...this.querySelectorAll<HTMLButtonElement>('.k-chip[aria-pressed="true"]')].map((b) => b.dataset.value ?? "");
  }
  set value(v: string[]) {
    this.querySelectorAll<HTMLButtonElement>(".k-chip").forEach((b) => b.setAttribute("aria-pressed", String(v.includes(b.dataset.value ?? ""))));
    this.sync(false);
  }

  private build() {
    this.built = true;
    this.classList.add("k-chips");
    this.setAttribute("role", "group");
    const label = this.getAttribute("label");
    if (label) this.setAttribute("aria-label", label);
    this.querySelectorAll<HTMLButtonElement>(":scope > button").forEach((b) => {
      b.type = "button";
      b.classList.add("k-chip");
      b.dataset.value ||= b.textContent?.trim() ?? "";
      b.setAttribute("aria-pressed", String(b.hasAttribute("data-pressed") || b.getAttribute("aria-pressed") === "true"));
      b.insertAdjacentHTML("afterbegin", '<svg class="k-chip__check" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 10.5 3.2 3L15 7"/></svg>');
      if (b.dataset.count) b.insertAdjacentHTML("beforeend", `<span class="k-chip__count">${toFaDigits(b.dataset.count)}</span>`);
    });
    this.addEventListener("click", (e) => {
      const b = (e.target as Element).closest<HTMLButtonElement>(".k-chip");
      if (!b || b.disabled) return;
      const on = b.getAttribute("aria-pressed") !== "true";
      if (bool(this, "single")) this.querySelectorAll(".k-chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", String(on));
      this.sync(true);
    });
    this.sync(false);
  }
  private sync(fire: boolean) {
    hiddenList(this, this.getAttribute("name"), this.value);
    if (fire) emit(this, "kashi-change", { value: this.value });
  }
}

const RULES: [string, (p: string) => boolean][] = [
  [`حداقل ${toFaDigits(8)} نویسه`, (p) => p.length >= 8],
  ["حروف بزرگ و کوچک انگلیسی", (p) => /[a-z]/.test(p) && /[A-Z]/.test(p)],
  ["دست‌کم یک عدد", (p) => /\d/.test(p)],
  ["دست‌کم یک نماد، مثل ! یا @", (p) => /[^A-Za-z0-9\s؀-ۿ]/.test(p)],
];

/** قدرت رمز زیر فیلد رمز؛ با for="شناسهٔ فیلد" به آن وصل می‌شود و با هر تایپ به‌روز می‌شود */
export class KashiPasswordStrength extends HTMLBase {
  static observedAttributes = ["for", "show-rules"];
  private target: HTMLInputElement | null = null;

  connectedCallback() {
    afterParse(() => {
      if (!this.isConnected) return;
      this.attach();
      this.render("");
    });
  }
  disconnectedCallback() {
    this.target?.removeEventListener("input", this.onInput);
  }
  attributeChangedCallback() {
    if (this.isConnected) {
      this.attach();
      this.render(this.target?.value ?? "");
    }
  }
  private attach() {
    this.target?.removeEventListener("input", this.onInput);
    const id = this.getAttribute("for");
    const el = id ? document.getElementById(id) : null;
    this.target = el instanceof HTMLInputElement ? el : (el?.querySelector("input") ?? null);
    this.target?.addEventListener("input", this.onInput);
    if (this.target) {
      this.id ||= uid("kashi-strength");
      const by = (this.target.getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean);
      if (!by.includes(this.id)) this.target.setAttribute("aria-describedby", [...by, this.id].join(" "));
    }
  }
  private onInput = () => this.render(this.target?.value ?? "");

  /** امتیاز ۰ تا ۴ */
  score(password: string) {
    const n = RULES.filter(([, t]) => t(password)).length;
    return password ? Math.max(1, Math.round((n / RULES.length) * 4)) : 0;
  }

  private render(p: string) {
    const score = this.score(p);
    const levels = ["ضعیف", "متوسط", "خوب", "قوی"];
    const persian = /[؀-ۿ]/.test(p);
    this.innerHTML = `<div class="k-strength" data-score="${score}"><div class="k-strength__bars" aria-hidden="true">${"<span class=\"k-strength__bar\"></span>".repeat(4)}</div><p class="k-strength__label" aria-live="polite" style="margin: 0">${score ? `قدرت رمز: <strong>${levels[score - 1]}</strong>` : ""}</p>${persian ? '<p class="k-hint k-hint--error" role="alert">رمز حروف فارسی دارد؛ شاید صفحه‌کلید روی فارسی مانده است.</p>' : ""}${this.getAttribute("show-rules") === "false" ? "" : `<ul class="k-strength__rules">${RULES.map(([label, t]) => {
      const met = t(p);
      return `<li class="k-strength__rule"${met ? ' data-met=""' : ""}>${met ? CHECK : '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="2.5" fill="currentColor"/></svg>'}<span>${label}<span class="k-sr-only">${met ? "، رعایت شده" : "، رعایت نشده"}</span></span></li>`;
    }).join("")}</ul>`}</div>`;
  }
}

/** پایهٔ فیلد متنی ساده با برچسب، راهنما و خطا، برای فیلدهای متنی فارسی */
abstract class TextField extends HTMLBase {
  protected key = uid("kashi-text");
  protected control!: HTMLInputElement | HTMLTextAreaElement;
  protected rendered = false;
  protected valueSet = false;
  protected text = "";
  protected abstract multiline: boolean;
  protected abstract defaultLabel: string;
  protected abstract hint(): string | null;

  connectedCallback() {
    if (!this.rendered && !this.valueSet) this.text = this.getAttribute("value") ?? "";
    this.render();
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.rendered || old === next) return;
    if (name === "value") this.value = next ?? "";
    else this.render();
  }
  get value() {
    return this.text;
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
    const label = this.hasAttribute("label") ? this.getAttribute("label") : ariaLabel ? null : this.defaultLabel;
    const name = this.getAttribute("name");
    const common = `id="${id}" class="k-input__control" dir="auto"${name ? ` name="${esc(name)}"` : ""}${this.hasAttribute("required") ? " required" : ""}${this.hasAttribute("disabled") ? " disabled" : ""} placeholder="${esc(this.getAttribute("placeholder") ?? "")}"${!label && ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ""}`;
    const control = this.multiline
      ? `<div class="k-input k-input--textarea"><textarea ${common} rows="${Number(this.getAttribute("rows")) || 4}"></textarea></div>`
      : `<div class="k-input"><input ${common}></div>`;
    this.querySelector(":scope > .k-field")?.remove();
    this.insertAdjacentHTML("afterbegin", fieldHTML({ id, label, required: this.hasAttribute("required"), control }));
    this.control = this.querySelector(".k-input__control")!;
    this.control.value = this.text;
    this.control.addEventListener("input", () => {
      this.text = this.control.value;
      this.paint();
      emit(this, "kashi-change", { value: this.text });
    });
    this.rendered = true;
    this.paint();
  }

  /** راهنمای زیر فیلد؛ HTML ساخته‌شده توسط زیرکلاس */
  protected paint() {
    const field = this.querySelector(":scope > .k-field")!;
    setMessages(field, this.control, this.key, this.getAttribute("error"), null);
    const html = this.hint();
    field.querySelector(".k-field__hint-row[data-extra]")?.remove();
    if (html) {
      field.insertAdjacentHTML("beforeend", `<div class="k-field__hint-row" data-extra><div class="k-field__hints"><p class="k-hint" id="${this.key}-hint">${html}</p></div></div>`);
      const by = (this.control.getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean);
      this.control.setAttribute("aria-describedby", [...by, `${this.key}-hint`].join(" "));
    }
  }

  protected replace(next: string) {
    this.text = next;
    this.control.value = next;
    this.paint();
    this.control.focus();
    emit(this, "kashi-change", { value: next });
  }
}

const KINDS = { arabic: "حرف عربی", zwnj: "نیم‌فاصله", punctuation: "علامت", digits: "رقم", spacing: "فاصله" } as const;

/** متن چندخطی با ویرایش نگارشی: ی و ک عربی، نیم‌فاصله، علامت‌ها و ارقام را می‌شمارد و با یک دکمه اصلاح می‌کند */
export class KashiPersianTextarea extends TextField {
  static observedAttributes = ["label", "hint", "error", "placeholder", "required", "disabled", "name", "value", "rows", "fix-on-blur", "fix-digits", "aria-label"];
  protected multiline = true;
  protected defaultLabel = "متن";
  protected render() {
    super.render();
    this.control.addEventListener("blur", () => {
      const r = this.result();
      if (bool(this, "fix-on-blur") && r.count) this.replace(r.text);
    });
    this.addEventListener("click", (e) => {
      if ((e.target as Element).closest("[data-fix]")) this.replace(this.result().text);
    });
  }
  private result() {
    return fixPersianText(this.text, { digits: this.getAttribute("fix-digits") !== "false" });
  }
  protected hint() {
    if (!this.text.trim()) return this.getAttribute("hint") ? esc(this.getAttribute("hint")) : null;
    const r = this.result();
    if (!r.count) return '<span class="k-textfix" data-state="clean"><span class="k-textfix__text">نگارش متن درست است.</span></span>';
    const summary = (Object.keys(KINDS) as (keyof typeof KINDS)[]).filter((k) => r.fixes[k]).map((k) => `${toFaDigits(r.fixes[k])} ${KINDS[k]}`).join("، ");
    return `<span class="k-textfix" data-state="fix"><span class="k-textfix__text">${toFaDigits(r.count)} مورد قابل اصلاح: ${summary}</span><button type="button" class="k-btn k-btn--tertiary k-btn--xs" data-fix>اصلاح نگارش</button></span>`;
  }
}

/** فیلد متنی که متن تایپ‌شده با صفحه‌کلید انگلیسی را تشخیص می‌دهد و نسخهٔ فارسی‌اش را پیشنهاد می‌کند («sghl» ← «سلام») */
export class KashiKeyboardFix extends TextField {
  static observedAttributes = ["label", "hint", "error", "placeholder", "required", "disabled", "name", "value", "suggest", "aria-label"];
  protected multiline = false;
  protected defaultLabel = "متن";
  protected render() {
    super.render();
    this.addEventListener("click", (e) => {
      if ((e.target as Element).closest("[data-fix]")) this.replace(fixKeyboardLayout(this.text));
    });
  }
  protected hint() {
    const t = this.text;
    const latin = /[a-z]/i.test(t) && !/[؀-ۿ]/.test(t);
    const show = this.getAttribute("suggest") === "always" ? latin : looksLikeWrongLayout(t);
    if (!show) return this.getAttribute("hint") ? esc(this.getAttribute("hint")) : null;
    return `<span class="k-kbfix" role="status">منظورتان <button type="button" class="k-kbfix__btn" data-fix>«${esc(fixKeyboardLayout(t))}»</button> بود؟</span>`;
  }
}

const toMin = (t: Time) => t.hours * 60 + t.minutes;
const fromMin = (m: number): Time => ({ hours: Math.floor(m / 60), minutes: m % 60 });
const CLOCK = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M10 6v4l2.5 2"/></svg>';

/** ساعت ۲۴ساعته: ۹:۳۰، ۰۹۳۰ و ارقام فارسی را می‌فهمد؛ ↑↓ با گام step دقیقه */
export class KashiTimeInput extends HTMLBase {
  static observedAttributes = ["label", "hint", "error", "value", "min", "max", "step", "digits", "required", "disabled", "name", "placeholder", "aria-label"];
  private current: string | null = null;
  private invalid: false | "format" | "range" = false;
  private valueSet = false;
  private rendered = false;
  private key = uid("kashi-time");
  private input!: HTMLInputElement;

  connectedCallback() {
    if (!this.rendered && !this.valueSet) this.current = this.normal(this.getAttribute("value"));
    this.render();
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.rendered || old === next) return;
    if (name === "value") this.value = next ?? "";
    else this.render();
  }
  /** ساعت به شکل HH:MM، یا رشتهٔ خالی */
  get value() {
    return this.current ?? "";
  }
  set value(v: string) {
    this.valueSet = true;
    this.current = this.normal(v);
    this.invalid = false;
    if (this.rendered) this.paint();
  }
  private normal(v: string | null) {
    const t = v ? parseTime(v) : null;
    return t ? formatTime(t) : null;
  }
  private show(s: string | null) {
    return s ? (this.getAttribute("digits") === "latin" ? s : toFaDigits(s)) : "";
  }
  private get lo() {
    const t = parseTime(this.getAttribute("min") ?? "");
    return t ? toMin(t) : 0;
  }
  private get hi() {
    const t = parseTime(this.getAttribute("max") ?? "");
    return t ? toMin(t) : 24 * 60 - 1;
  }

  private render() {
    const id = this.key;
    const ariaLabel = this.getAttribute("aria-label");
    const label = this.hasAttribute("label") ? this.getAttribute("label") : ariaLabel ? null : "ساعت";
    const fa = this.getAttribute("digits") !== "latin";
    const control = `<div class="k-input"><input id="${id}" class="k-input__control" type="text" inputmode="numeric" dir="ltr" autocomplete="off" placeholder="${esc(this.getAttribute("placeholder") ?? (fa ? "۰۹:۳۰" : "09:30"))}"${this.hasAttribute("required") ? " required" : ""}${this.hasAttribute("disabled") ? " disabled" : ""}${!label && ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ""}><span class="k-input__addon">${CLOCK}</span></div>`;
    this.querySelector(":scope > .k-field")?.remove();
    this.insertAdjacentHTML("afterbegin", fieldHTML({ id, label, required: this.hasAttribute("required"), control }));
    this.input = this.querySelector("input.k-input__control")!;
    this.input.addEventListener("blur", () => this.commitText());
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.commitText();
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();
      const step = Number(this.getAttribute("step")) || 15;
      const base = parseTime(this.input.value) ?? parseTime(this.current ?? "") ?? fromMin(this.lo);
      const m = toMin(base);
      // به نزدیک‌ترین گام بعدی یا قبلی می‌پرد
      const next = e.key === "ArrowUp" ? Math.floor(m / step) * step + step : Math.ceil(m / step) * step - step;
      this.commit(fromMin(Math.min(this.hi, Math.max(this.lo, next))));
    });
    this.rendered = true;
    this.paint();
  }
  private commitText() {
    const t = this.input.value.trim();
    if (!t) return this.commit(null);
    const p = parseTime(t);
    if (!p) this.invalid = "format";
    else if (toMin(p) < this.lo || toMin(p) > this.hi) this.invalid = "range";
    else return this.commit(p);
    this.paint(false);
  }
  private commit(t: Time | null) {
    const v = t ? formatTime(t) : null;
    const changed = v !== this.current;
    this.current = v;
    this.invalid = false;
    this.paint();
    if (changed) emit(this, "kashi-change", { value: v ?? "" });
  }
  private paint(syncText = true) {
    if (syncText) this.input.value = this.show(this.current);
    const msg = this.invalid === "range"
      ? `ساعت باید بین ${this.show(formatTime(fromMin(this.lo)))} و ${this.show(formatTime(fromMin(this.hi)))} باشد.`
      : this.invalid ? "ساعت معتبر نیست؛ آن را به شکل ۰۹:۳۰ وارد کنید." : null;
    this.input.setCustomValidity(msg ?? "");
    setMessages(this.querySelector(":scope > .k-field")!, this.input, this.key, this.getAttribute("error") || msg, this.getAttribute("hint"));
    syncHidden(this, this.getAttribute("name"), this.current ?? "");
  }
}

const EMPTY_PLATE: Plate = { first: "", letter: "", middle: "", region: "" };

/** پلاک خودرو با چهار بخش (۱۲ ب ۳۴۵ ایران ۶۷)؛ فوکوس خودکار به بخش بعد و رنگ بر اساس نوع پلاک */
export class KashiPlateInput extends HTMLBase {
  static observedAttributes = ["label", "hint", "error", "name", "disabled", "value"];
  private plate: Plate = { ...EMPTY_PLATE };
  private touched = false;
  private valueSet = false;
  private rendered = false;
  private key = uid("kashi-plate");

  connectedCallback() {
    if (!this.rendered && !this.valueSet) this.plate = this.parse(this.getAttribute("value"));
    this.render();
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.rendered || old === next) return;
    if (name === "value") this.value = this.parse(next);
    else this.render();
  }
  /** «12-ب-345-67» */
  private parse(v: string | null): Plate {
    const [first = "", letter = "", middle = "", region = ""] = (v ?? "").split("-");
    return { first: onlyDigits(first), letter, middle: onlyDigits(middle), region: onlyDigits(region) };
  }
  get value(): Plate {
    return { ...this.plate };
  }
  set value(p: Plate) {
    this.valueSet = true;
    this.plate = { ...EMPTY_PLATE, ...p };
    if (this.rendered) this.render();
  }
  get valid() {
    return isValidPlate(this.plate);
  }

  private render() {
    const k = this.key;
    const p = this.plate;
    const off = this.hasAttribute("disabled") ? " disabled" : "";
    const seg = (key: keyof Plate, len: number, aria: string, cls = "", first = false) =>
      `<input${first ? ` id="${k}-first"` : ""} class="k-plate__seg ${cls}" data-key="${key}" data-len="${len}" inputmode="numeric" autocomplete="off" aria-label="${aria}" placeholder="${toFaDigits("0".repeat(len))}" value="${toFaDigits(p[key])}"${off}>`;
    const label = this.getAttribute("label") ?? "پلاک خودرو";
    const control = `<div class="k-plate" role="group" aria-label="${esc(label)}" data-type="${plateType(p.letter)}"><span class="k-plate__flag" aria-hidden="true"><span class="k-plate__flag-colors"></span>I.R.<br>IRAN</span>${seg("first", 2, "دو رقم اول پلاک", "", true)}<select class="k-plate__letter" data-key="letter" aria-label="حرف پلاک"${off}><option value="">–</option>${PLATE_LETTERS.map((l) => `<option value="${l}"${l === p.letter ? " selected" : ""}>${l === "ه" ? "هـ" : l}</option>`).join("")}</select>${seg("middle", 3, "سه رقم پلاک", "k-plate__seg--3")}<span class="k-plate__region"><span class="k-plate__region-label" aria-hidden="true">ایران</span>${seg("region", 2, "کد استان")}</span></div><span class="k-sr-only" aria-live="polite"></span>`;
    this.querySelector(":scope > .k-field")?.remove();
    this.insertAdjacentHTML("afterbegin", fieldHTML({ id: `${k}-first`, label, control }));
    const parts = [...this.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-key]")];
    parts.forEach((el, i) => {
      el.addEventListener(el instanceof HTMLSelectElement ? "change" : "input", () => {
        const key = el.dataset.key as keyof Plate;
        if (el instanceof HTMLSelectElement) {
          this.plate.letter = el.value;
          if (el.value) parts[i + 1]?.focus();
        } else {
          const len = Number(el.dataset.len);
          const all = onlyDigits(el.value);
          // تایپ سریع یا چسباندن: رقم‌های اضافهٔ بخش سه‌رقمی به کد استان می‌روند
          if (key === "middle" && all.length > len) this.plate.region = (this.plate.region + all.slice(len)).slice(0, 2);
          this.plate[key] = all.slice(0, len);
          el.value = toFaDigits(this.plate[key]);
          if (this.plate[key].length === len) parts[i + 1]?.focus();
        }
        this.paint();
        emit(this, "kashi-change", { value: this.value, valid: this.valid });
      });
      el.addEventListener("keydown", (e) => {
        if ((e as KeyboardEvent).key === "Backspace" && !(el as HTMLInputElement).value) parts[i - 1]?.focus();
      });
    });
    const group = this.querySelector(".k-plate")!;
    group.addEventListener("focusout", (e) => {
      if (!group.contains((e as FocusEvent).relatedTarget as Node)) {
        this.touched = true;
        this.paint();
      }
    });
    this.rendered = true;
    this.paint();
  }

  private paint() {
    const p = this.plate;
    const group = this.querySelector<HTMLElement>(".k-plate")!;
    const region = this.querySelector<HTMLInputElement>('[data-key="region"]')!;
    if (region.value !== toFaDigits(p.region)) region.value = toFaDigits(p.region);
    group.dataset.type = plateType(p.letter);
    const complete = p.first.length === 2 && !!p.letter && p.middle.length === 3 && p.region.length === 2;
    const showInvalid = (this.touched || complete) && Object.values(p).some(Boolean) && !this.valid;
    const error = this.getAttribute("error") || (showInvalid ? "پلاک خودرو معتبر نیست." : null);
    group.toggleAttribute("data-invalid", !!error);
    setMessages(this.querySelector(":scope > .k-field")!, group, this.key, error, this.getAttribute("hint"));
    this.querySelector(".k-field > .k-sr-only")!.textContent = this.valid ? formatPlate(p) : "";
    const name = this.getAttribute("name");
    this.querySelectorAll(":scope > input[type=hidden]").forEach((el) => el.remove());
    if (name) for (const key of ["first", "letter", "middle", "region"] as const) this.insertAdjacentHTML("beforeend", `<input type="hidden" name="${esc(`${name}_${key}`)}" value="${esc(p[key])}">`);
  }
}

const PENCIL = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m13.5 3.5 3 3L7 16H4v-3Z"/></svg>';

/**
 * ویرایش درجا: متن با کلیک یا Enter به فیلد تبدیل می‌شود، Enter ثبت و Esc انصراف.
 * رویداد kashi-save با detail.value؛ برای ذخیرهٔ سمت سرور event.detail.wait(promise) را صدا بزنید.
 */
export class KashiInlineEdit extends HTMLBase {
  static observedAttributes = ["value", "label", "placeholder"];
  private text = "";
  private editing = false;
  private valueSet = false;
  private rendered = false;
  /** اعتبارسنجی؛ پیام خطا یا undefined */
  validate?: (value: string) => string | undefined;

  connectedCallback() {
    if (!this.rendered && !this.valueSet) this.text = this.getAttribute("value") ?? this.textContent?.trim() ?? "";
    this.render();
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.rendered || old === next) return;
    if (name === "value") this.text = next ?? "";
    if (!this.editing) this.render();
  }
  get value() {
    return this.text;
  }
  set value(v: string) {
    this.valueSet = true;
    this.text = String(v ?? "");
    if (this.rendered && !this.editing) this.render();
  }

  private render(focus = false) {
    const label = this.getAttribute("label") ?? "متن";
    this.rendered = true;
    this.editing = false;
    this.innerHTML = `<span class="k-inline-edit"><button type="button" class="k-inline-edit__view" aria-label="${esc(`${label}: ${this.text || "خالی"}، ویرایش`)}">${this.text ? esc(this.text) : `<span class="k-inline-edit__placeholder">${esc(this.getAttribute("placeholder") ?? "خالی")}</span>`}${PENCIL}</button></span>`;
    const view = this.querySelector("button")!;
    view.addEventListener("click", () => this.edit());
    if (focus) view.focus();
  }

  private edit(error?: string, draft = this.text) {
    this.editing = true;
    const label = this.getAttribute("label") ?? "متن";
    const errId = uid("kashi-ie-err");
    this.innerHTML = `<span class="k-inline-edit"><span class="k-field" style="gap: 4px"><span class="k-input"${error ? ' data-state="invalid"' : ""}><input class="k-input__control" aria-label="${esc(label)}" placeholder="${esc(this.getAttribute("placeholder") ?? "")}"${error ? ` aria-invalid="true" aria-describedby="${errId}"` : ""}></span>${error ? `<span class="k-hint k-hint--error" id="${errId}">${esc(error)}</span>` : ""}</span><span class="k-inline-edit__actions"><button type="button" class="k-btn k-btn--primary k-btn--icon k-btn--sm" data-save aria-label="ثبت">${CHECK}</button><button type="button" class="k-btn k-btn--secondary k-btn--icon k-btn--sm" data-cancel aria-label="انصراف">${X}</button></span></span>`;
    const input = this.querySelector<HTMLInputElement>("input")!;
    input.value = draft;
    input.focus();
    input.select();
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.commit(input.value);
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.render(true);
      }
    });
    this.querySelector("[data-save]")!.addEventListener("click", () => this.commit(input.value));
    this.querySelector("[data-cancel]")!.addEventListener("click", () => this.render(true));
  }

  private async commit(raw: string) {
    const v = raw.trim();
    const err = this.validate?.(v);
    if (err) return this.edit(err, raw);
    if (v === this.text) return this.render(true);
    const prev = this.text;
    let pending: Promise<unknown> | null = null;
    emit(this, "kashi-save", { value: v, wait: (p: Promise<unknown>) => (pending = p) });
    this.text = v;
    if (pending) {
      this.querySelector<HTMLButtonElement>("[data-save]")?.setAttribute("aria-busy", "true");
      try {
        await pending;
      } catch {
        this.text = prev;
        return this.edit("ذخیره نشد؛ دوباره امتحان کنید.", raw);
      }
    }
    this.render(true);
    emit(this, "kashi-change", { value: v });
  }
}

define("kashi-multi-select", KashiMultiSelect, "block");
define("kashi-slider", KashiSlider, "block");
define("kashi-chip-group", KashiChipGroup);
define("kashi-password-strength", KashiPasswordStrength, "block");
define("kashi-persian-textarea", KashiPersianTextarea, "block");
define("kashi-keyboard-fix", KashiKeyboardFix, "block");
define("kashi-time-input", KashiTimeInput, "block");
define("kashi-plate-input", KashiPlateInput, "block");
define("kashi-inline-edit", KashiInlineEdit);
