import { CITIES, PROVINCES, getCities, normalizePersian, toFaDigits } from "@kashi-ui/persian";
import { afterParse, define, emit, esc, fieldHTML, HTMLBase, msg, num, setMessages, syncHidden, uid } from "./base.js";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  /** نام گروه برای دسته‌بندی گزینه‌ها */
  group?: string;
  /** کلمه‌های اضافه برای جستجو، مثل نام انگلیسی */
  keywords?: string[];
}

/** متن یکدست برای جستجو: ي/ی، ك/ک، ارقام، حروف کوچک */
export const searchText = (s: string) => normalizePersian(s, { digits: "latin" }).toLowerCase();

/** بیشترین تعداد گزینهٔ رسم‌شده؛ برای فهرست‌های بلند مثل ۱۲۰۰ شهر، بقیه با تایپ پیدا می‌شوند */
const MAX_RENDER = 300;
const CHEVRON = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 8 4 4 4-4"/></svg>';
const CHECK = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 10.5 3.2 3L15 7"/></svg>';

/**
 * جستجو و انتخاب با الگوی Combobox در WAI-ARIA: تایپ فهرست را فیلتر می‌کند، ↑↓ حرکت، Enter انتخاب،
 * Esc بستن (و در حالت بسته، پاک کردن). جستجو «علي» و «علی» را یکی می‌داند.
 * گزینه‌ها از فرزندان <option> (با data-description و <optgroup>) یا ویژگی options با JavaScript.
 */
export class KashiCombobox extends HTMLBase {
  static observedAttributes = ["label", "hint", "error", "placeholder", "required", "disabled", "name", "value", "empty-message", "aria-label"];
  protected selected: ComboboxOption | null = null;
  protected query = "";
  private list: ComboboxOption[] | null = null;
  private filtered: ComboboxOption[] = [];
  private typing = false;
  private isOpen = false;
  private active = -1;
  private rendered = false;
  protected valueSet = false;
  protected key = uid("kashi-combo");
  protected input!: HTMLInputElement;
  private listbox!: HTMLUListElement;
  private live!: HTMLElement;
  /** برچسب پیش‌فرض وقتی label داده نشود */
  protected get defaultLabel(): string | null {
    return null;
  }
  protected get defaultPlaceholder(): string {
    return "";
  }

  connectedCallback() {
    afterParse(() => {
      if (!this.isConnected) return;
      if (!this.rendered) {
        if (this.list === null) this.list = this.readOptions();
        if (Object.prototype.hasOwnProperty.call(this, "value")) {
          const v = (this as { value?: string }).value;
          delete (this as { value?: unknown }).value;
          this.value = v ?? "";
        } else if (!this.valueSet) {
          const v = this.getAttribute("value");
          this.selected = v ? this.find(v) : null;
          this.query = this.selected?.label ?? "";
        }
      }
      this.render();
    });
  }
  disconnectedCallback() {
    document.removeEventListener("pointerdown", this.onOutside);
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.rendered || old === next) return;
    if (name === "value") this.value = next ?? "";
    else this.render();
  }

  /** گزینه‌ها با JavaScript: [{ value, label, description?, group?, keywords?, disabled? }] */
  get options(): ComboboxOption[] {
    return this.list ?? [];
  }
  set options(list: ComboboxOption[]) {
    this.list = [...list];
    if (this.selected) this.selected = this.find(this.selected.value);
    if (this.rendered) this.sync();
  }
  /** مقدار گزینهٔ انتخاب‌شده، یا رشتهٔ خالی */
  get value(): string {
    return this.selected?.value ?? "";
  }
  set value(v: string) {
    this.valueSet = true;
    this.selected = v ? this.find(v) : null;
    this.query = this.selected?.label ?? "";
    this.typing = false;
    if (this.rendered) this.sync();
  }
  /** گزینهٔ انتخاب‌شده با همهٔ اطلاعاتش */
  get selectedOption(): ComboboxOption | null {
    return this.selected;
  }
  focus(options?: FocusOptions) {
    this.input?.focus(options);
  }

  private readOptions(): ComboboxOption[] {
    const out: ComboboxOption[] = [];
    for (const el of [...this.querySelectorAll<HTMLOptionElement>(":scope > option, :scope > optgroup > option")]) {
      const group = el.parentElement?.tagName === "OPTGROUP" ? (el.parentElement.getAttribute("label") ?? undefined) : undefined;
      out.push({
        value: el.value,
        label: el.textContent?.trim() ?? el.value,
        description: el.dataset.description,
        keywords: el.dataset.keywords?.split(/[,،]\s*/),
        disabled: el.disabled,
        group,
      });
    }
    for (const el of [...this.querySelectorAll(":scope > option, :scope > optgroup")]) el.remove();
    return out;
  }

  /** گزینه‌های قابل نمایش برای این جستجو؛ زیرکلاس‌ها (شهر) گزینهٔ «شهر دیگر» اضافه می‌کنند */
  protected source(_query: string): ComboboxOption[] {
    return this.options;
  }
  protected accepts(o: ComboboxOption, query: string): boolean {
    const q = searchText(query.trim());
    if (!q) return true;
    return [o.label, o.description ?? "", ...(o.keywords ?? [])].some((t) => searchText(t).includes(q));
  }
  protected find(value: string): ComboboxOption | null {
    return this.source("").find((o) => o.value === value) ?? null;
  }
  /** اطلاعات رویداد kashi-change */
  protected detail(): Record<string, unknown> {
    return { value: this.value, option: this.selected };
  }

  private render() {
    const id = this.key;
    const ariaLabel = this.getAttribute("aria-label");
    const label = this.hasAttribute("label") ? this.getAttribute("label") : ariaLabel ? null : this.defaultLabel;
    const required = this.hasAttribute("required");
    const disabled = this.hasAttribute("disabled");
    const listId = `${id}-list`;
    const control = `<div class="k-combobox"><div class="k-input"${disabled ? ' data-state="disabled"' : ""}><input id="${id}" class="k-input__control" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${listId}" autocomplete="off" placeholder="${esc(this.getAttribute("placeholder") ?? this.defaultPlaceholder)}"${required ? " required" : ""}${disabled ? " disabled" : ""}${!label && ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ""}><button type="button" tabindex="-1" class="k-input__action k-combobox__toggle" aria-label="${esc(msg().combobox.toggle)}"${disabled ? " disabled" : ""}>${CHEVRON}</button></div><ul id="${listId}" role="listbox" class="k-listbox" hidden style="inset-block-start: calc(100% + 6px)"${label ? ` aria-label="${esc(label)}"` : ` aria-labelledby="${id}"`}></ul><span class="k-sr-only" aria-live="polite"></span></div>`;
    this.querySelector(":scope > .k-field")?.remove();
    this.insertAdjacentHTML("afterbegin", fieldHTML({ id, label, required, control }));
    this.input = this.querySelector("input.k-input__control")!;
    this.listbox = this.querySelector(".k-listbox")!;
    this.live = this.querySelector(".k-combobox > .k-sr-only")!;
    this.isOpen = false;
    this.input.addEventListener("input", () => {
      this.query = this.input.value;
      this.typing = true;
      this.active = -1;
      this.open(false);
      emit(this, "kashi-input", { query: this.query });
    });
    this.input.addEventListener("keydown", (e) => this.onKey(e));
    this.input.addEventListener("click", () => !this.isOpen && this.open());
    this.input.addEventListener("blur", (e) => {
      if (this.contains(e.relatedTarget as Node)) return;
      this.close();
    });
    this.querySelector(".k-combobox__toggle")!.addEventListener("click", () => {
      if (this.isOpen) this.close();
      else {
        this.typing = false;
        this.open();
        this.input.focus();
      }
    });
    this.listbox.addEventListener("pointerdown", (e) => e.preventDefault()); // فوکوس در فیلد بماند
    this.listbox.addEventListener("click", (e) => {
      const li = (e.target as Element).closest<HTMLElement>('[role="option"]');
      if (!li || li.getAttribute("aria-disabled") === "true") return;
      this.commit(this.filtered[Number(li.dataset.i)]);
    });
    this.listbox.addEventListener("pointermove", (e) => {
      const li = (e.target as Element).closest<HTMLElement>('[role="option"]');
      if (li && li.getAttribute("aria-disabled") !== "true" && Number(li.dataset.i) !== this.active) this.setActive(Number(li.dataset.i));
    });
    this.rendered = true;
    this.sync();
  }

  /** متن فیلد، فیلد پنهان، خطا و فهرست را با وضعیت فعلی هماهنگ می‌کند */
  protected sync() {
    if (!this.typing && this.input.value !== this.query) this.input.value = this.query;
    setMessages(this.querySelector(":scope > .k-field")!, this.input, this.key, this.getAttribute("error"), this.getAttribute("hint"));
    this.syncHidden();
    if (this.isOpen) this.renderList();
  }
  protected syncHidden() {
    syncHidden(this, this.getAttribute("name"), this.value);
  }

  private enabled() {
    return this.filtered.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
  }

  private open(reset = true, at: "first" | "last" | "selected" = "selected") {
    if (this.hasAttribute("disabled")) return;
    this.isOpen = true;
    this.input.setAttribute("aria-expanded", "true");
    this.listbox.hidden = false;
    this.toggleAttribute("data-open", true);
    this.querySelector(".k-combobox")!.setAttribute("data-open", "");
    this.filter();
    if (reset) {
      const en = this.enabled();
      const sel = this.filtered.findIndex((o) => o.value === this.selected?.value);
      this.active = at === "last" ? (en.at(-1) ?? -1) : at === "first" || sel < 0 ? (en[0] ?? -1) : sel;
    }
    this.renderList();
    document.addEventListener("pointerdown", this.onOutside);
  }

  close() {
    if (!this.rendered) return;
    this.isOpen = false;
    this.input.setAttribute("aria-expanded", "false");
    this.input.removeAttribute("aria-activedescendant");
    this.listbox.hidden = true;
    this.querySelector(".k-combobox")!.removeAttribute("data-open");
    this.live.textContent = "";
    document.removeEventListener("pointerdown", this.onOutside);
    // متن نیمه‌کاره به گزینهٔ انتخاب‌شده برمی‌گردد
    if (this.typing) {
      this.typing = false;
      this.query = this.selected?.label ?? "";
      this.input.value = this.query;
    }
  }

  private onOutside = (e: PointerEvent) => {
    if (!this.contains(e.target as Node)) this.close();
  };

  private filter() {
    const all = this.source(this.typing ? this.query : "");
    this.filtered = this.typing ? all.filter((o) => this.accepts(o, this.query)) : all;
  }

  private renderList() {
    const q = this.typing ? searchText(this.query.trim()) : "";
    const mark = (text: string) => {
      const i = q ? searchText(text).indexOf(q) : -1;
      return i < 0 ? esc(text) : `${esc(text.slice(0, i))}<mark>${esc(text.slice(i, i + q.length))}</mark>${esc(text.slice(i + q.length))}`;
    };
    const listId = `${this.key}-list`;
    let last: string | undefined;
    const shown = this.filtered.slice(0, MAX_RENDER);
    const items = shown.map((o, i) => {
      const header = o.group && o.group !== last ? `<li role="presentation" class="k-listbox__group">${esc(o.group)}</li>` : "";
      last = o.group;
      const on = o.value === this.selected?.value;
      return `${header}<li id="${listId}-${i}" data-i="${i}" role="option" aria-selected="${on}"${o.disabled ? ' aria-disabled="true"' : ""}${i === this.active ? " data-active" : ""} class="k-option"><span class="k-option__body"><span>${mark(o.label)}</span>${o.description ? `<span class="k-option__desc">${esc(o.description)}</span>` : ""}</span>${on ? `<span class="k-option__check">${CHECK}</span>` : ""}</li>`;
    });
    if (!this.filtered.length) items.push(`<li class="k-listbox__empty" role="presentation">${esc(this.getAttribute("empty-message") ?? msg().common.noResults)}</li>`);
    if (this.filtered.length > MAX_RENDER) items.push(`<li class="k-listbox__empty" role="presentation">${esc(msg().combobox.more(num(this, this.filtered.length - MAX_RENDER)))}</li>`);
    this.listbox.innerHTML = items.join("");
    this.live.textContent = this.typing ? msg().common.results(num(this, this.filtered.length)) : "";
    this.setActive(this.active);
  }

  private setActive(i: number) {
    this.active = i;
    this.listbox.querySelector("[data-active]")?.removeAttribute("data-active");
    const li = i >= 0 ? this.listbox.querySelector<HTMLElement>(`[data-i="${i}"]`) : null;
    if (li) {
      li.setAttribute("data-active", "");
      li.scrollIntoView?.({ block: "nearest" });
      this.input.setAttribute("aria-activedescendant", li.id);
    } else this.input.removeAttribute("aria-activedescendant");
  }

  private move(delta: number) {
    const en = this.enabled().filter((i) => i < MAX_RENDER);
    if (!en.length) return;
    const pos = en.indexOf(this.active);
    this.setActive(en[(pos + delta + en.length) % en.length]);
  }

  private onKey(e: KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      this.isOpen ? this.move(1) : this.open(true, e.altKey ? "selected" : "first");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.isOpen ? this.move(-1) : this.open(true, "last");
    } else if (e.key === "Enter" && this.isOpen && this.active >= 0) {
      e.preventDefault();
      this.commit(this.filtered[this.active]);
    } else if (e.key === "Escape") {
      if (this.isOpen) {
        e.preventDefault();
        this.close();
      } else if (this.input.value) {
        e.preventDefault();
        this.commit(null);
      }
    } else if ((e.key === "Home" || e.key === "End") && this.isOpen) {
      e.preventDefault();
      const en = this.enabled();
      this.setActive((e.key === "Home" ? en[0] : en.at(-1)) ?? -1);
    }
  }

  protected commit(o: ComboboxOption | null) {
    const changed = (o?.value ?? null) !== (this.selected?.value ?? null);
    this.selected = o;
    this.query = o?.label ?? "";
    this.typing = false;
    this.input.value = this.query;
    this.close();
    this.sync();
    if (changed) emit(this, "kashi-change", this.detail());
  }
}

/** انتخاب یکی از ۳۱ استان با جستجو؛ با نام مرکز استان هم پیدا می‌شود (مثلاً «مشهد») */
export class KashiProvinceSelect extends KashiCombobox {
  static observedAttributes = [...KashiCombobox.observedAttributes, "show-capital"];
  protected get defaultLabel() {
    return msg().province.label;
  }
  protected get defaultPlaceholder() {
    return msg().province.search;
  }
  protected source(): ComboboxOption[] {
    const capital = this.getAttribute("show-capital") !== "false";
    return PROVINCES.map((p) => ({ value: p.name, label: p.name, description: capital ? msg().province.capital(p.capital) : undefined, keywords: [p.capital] }));
  }
  protected detail() {
    return { value: this.value, province: PROVINCES.find((p) => p.name === this.value) ?? null };
  }
}

const SEP = "|";
// «علی آباد»، «علی‌آباد» و «علیآباد» یکی‌اند
const loose = (s: string) => searchText(s).replace(/[\s‌]/g, "");

/**
 * انتخاب شهر با جستجو؛ با province فقط شهرهای همان استان، بدون آن همهٔ ۱۲۰۰+ شهر ایران با نام استان.
 * شهری که در فهرست نیست (شهرهای تازه‌تأسیس) با همان نام تایپ‌شده پذیرفته می‌شود، مگر allow-custom="false".
 */
export class KashiCitySelect extends KashiCombobox {
  static observedAttributes = [...KashiCombobox.observedAttributes, "province", "allow-custom"];
  protected get defaultLabel() {
    return msg().city.label;
  }
  protected get defaultPlaceholder() {
    return this.placeholderText();
  }
  private custom: string | null = null;

  get province(): string | null {
    return this.getAttribute("province") || null;
  }
  set province(p: string | null) {
    if (p) this.setAttribute("province", p);
    else this.removeAttribute("province");
  }
  /** نام شهر */
  get value(): string {
    return this.selected ? this.selected.value.split(SEP)[1] : "";
  }
  set value(city: string) {
    this.valueSet = true;
    this.custom = null;
    const list = this.source("");
    const p = this.province;
    let o = city ? (list.find((x) => x.label === city && (!p || x.value.startsWith(`${p}${SEP}`))) ?? null) : null;
    if (city && !o) {
      this.custom = city;
      o = { value: `custom${SEP}${city}`, label: city, description: msg().city.outside };
    }
    this.selected = o;
    this.query = o?.label ?? "";
    if (this.isConnected && this.querySelector(".k-combobox")) this.sync();
  }
  protected find(value: string) {
    // مقدار ورودی نام شهر است؛ setter بالا آن را پیدا می‌کند
    this.value = value;
    return this.selected;
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (name !== "province") return super.attributeChangedCallback(name, old, next);
    if (old === next) return;
    if (this.selected) {
      // شهر فقط وقتی می‌ماند که در استان تازه هم باشد
      const city = this.value;
      if (!next || !getCities(next).includes(city)) {
        this.selected = null;
        this.query = "";
        this.custom = null;
      } else this.selected = { value: `${next}${SEP}${city}`, label: city };
    }
    // بدون ساختن دوبارهٔ فیلد، تا فوکوس و متن کاربر از دست نرود
    if (this.querySelector(".k-combobox")) {
      this.input.placeholder = this.getAttribute("placeholder") ?? this.placeholderText();
      this.input.value = this.query;
      this.sync();
    }
  }
  connectedCallback() {
    super.connectedCallback();
  }
  private placeholderText() {
    return this.province ? msg().city.search : msg().city.hint;
  }
  protected source(query: string): ComboboxOption[] {
    const p = this.province;
    const list: ComboboxOption[] = p
      ? getCities(p).map((c) => ({ value: `${p}${SEP}${c}`, label: c }))
      : Object.entries(CITIES).flatMap(([prov, cities]) => cities.map((c) => ({ value: `${prov}${SEP}${c}`, label: c, description: prov })));
    if (this.custom) list.unshift({ value: `custom${SEP}${this.custom}`, label: this.custom, description: msg().city.outside });
    const q = query.trim();
    if (this.getAttribute("allow-custom") !== "false" && q && q !== this.custom && !list.some((o) => loose(o.label) === loose(q)))
      list.push({ value: `custom${SEP}${q}`, label: q, description: msg().city.custom });
    return list;
  }
  protected accepts(o: ComboboxOption, q: string) {
    return o.value.startsWith(`custom${SEP}`) || [o.label, o.description ?? ""].some((t) => loose(t).includes(loose(q)));
  }
  protected commit(o: ComboboxOption | null) {
    this.custom = o?.value.startsWith(`custom${SEP}`) ? o.label : null;
    super.commit(o);
  }
  protected detail() {
    const [p] = this.selected ? this.selected.value.split(SEP) : [null];
    return { value: this.value, province: p === "custom" ? null : p };
  }
}

define("kashi-combobox", KashiCombobox, "block");
define("kashi-province-select", KashiProvinceSelect, "block");
define("kashi-city-select", KashiCitySelect, "block");
