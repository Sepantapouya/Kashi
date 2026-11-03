import { HTMLBase, afterParse, define, emit, esc, uid } from "./base.js";

const CHECK = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 10.5 3.2 3L15 7"/></svg>';
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

const items = (menu: Element) => [...menu.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])')];

/**
 * منوی کشویی با الگوی Menu Button در WAI-ARIA. اولین فرزند دکمهٔ بازکننده است و بقیه گزینه‌ها:
 * <button> (با data-value، data-shortcut، data-tone="danger"، data-checked، disabled)، <a href>، <hr> برای جداکننده
 * و هر عنصر data-label برای عنوان گروه. ↑↓ حرکت، Home/End، پرش با حرف اول، Esc بستن.
 */
export class KashiDropdownMenu extends HTMLBase {
  static observedAttributes = ["label", "align"];
  private menu: HTMLUListElement | null = null;
  private trigger: HTMLElement | null = null;
  private key = uid("kashi-menu");

  connectedCallback() {
    afterParse(() => this.isConnected && !this.menu && this.build());
  }
  disconnectedCallback() {
    document.removeEventListener("pointerdown", this.onOutside);
  }
  attributeChangedCallback() {
    if (this.menu) this.decorate();
  }

  get open() {
    return !!this.menu && !this.menu.hidden;
  }

  private build() {
    const [trigger, ...rest] = [...this.children] as HTMLElement[];
    if (!trigger) return;
    this.classList.add("k-menu-anchor");
    this.trigger = trigger;
    trigger.id ||= `${this.key}-trigger`;
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", "false");
    const menu = document.createElement("ul");
    menu.id = `${this.key}-menu`;
    menu.setAttribute("role", "menu");
    menu.hidden = true;
    for (const el of rest) {
      const li = document.createElement("li");
      if (el.tagName === "HR") {
        li.setAttribute("role", "separator");
        li.className = "k-menu__separator";
        el.remove();
      } else if (el.hasAttribute("data-label")) {
        li.setAttribute("role", "presentation");
        li.className = "k-menu__label";
        li.textContent = el.textContent;
        el.remove();
      } else {
        li.setAttribute("role", "none");
        const checkable = el.hasAttribute("data-checked");
        el.setAttribute("role", checkable ? "menuitemcheckbox" : "menuitem");
        el.tabIndex = -1;
        el.classList.add("k-menu__item");
        if (el.dataset.tone === "danger") el.classList.add("k-menu__item--danger");
        if (el instanceof HTMLButtonElement) {
          el.type = "button";
          // دکمهٔ غیرفعال فوکوس‌پذیر می‌ماند تا صفحه‌خوان آن را بخواند
          if (el.disabled) {
            el.disabled = false;
            el.setAttribute("aria-disabled", "true");
          }
        }
        const text = el.innerHTML;
        el.innerHTML = `${checkable ? `<span class="k-menu__check" aria-hidden="true"></span>` : ""}<span>${text}</span>${el.dataset.shortcut ? `<span class="k-menu__shortcut" aria-hidden="true">${esc(el.dataset.shortcut)}</span>` : ""}`;
        if (checkable) this.paintCheck(el);
        li.append(el);
      }
      menu.append(li);
    }
    this.append(menu);
    this.menu = menu;
    this.decorate();

    trigger.addEventListener("click", () => (this.open ? this.close(false) : this.show("first")));
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        this.show(e.key === "ArrowUp" ? "last" : "first");
      }
    });
    menu.addEventListener("keydown", (e) => this.onKey(e));
    menu.addEventListener("click", (e) => {
      const item = (e.target as Element).closest<HTMLElement>('[role^="menuitem"]');
      if (!item || item.getAttribute("aria-disabled") === "true") return;
      if (item.getAttribute("role") === "menuitemcheckbox") {
        item.dataset.checked = String(item.dataset.checked !== "true");
        this.paintCheck(item);
      }
      emit(this, "kashi-select", { value: item.dataset.value ?? item.textContent?.trim() ?? "", checked: item.dataset.checked === undefined ? undefined : item.dataset.checked === "true" });
      if (item.getAttribute("role") === "menuitem") this.close(item.tagName !== "A");
    });
  }

  private paintCheck(el: HTMLElement) {
    const on = el.dataset.checked === "true";
    el.setAttribute("aria-checked", String(on));
    el.querySelector(".k-menu__check")!.innerHTML = on ? CHECK : "";
  }

  private decorate() {
    const label = this.getAttribute("label");
    this.menu!.className = `k-menu${this.getAttribute("align") === "end" ? " k-menu--end" : ""}`;
    if (label) {
      this.menu!.setAttribute("aria-label", label);
      this.menu!.removeAttribute("aria-labelledby");
    } else {
      this.menu!.setAttribute("aria-labelledby", this.trigger!.id);
      this.menu!.removeAttribute("aria-label");
    }
  }

  /** باز کردن منو و فوکوس روی اولین یا آخرین گزینه */
  show(focus: "first" | "last" = "first") {
    if (!this.menu) return;
    this.menu.hidden = false;
    this.trigger!.setAttribute("aria-expanded", "true");
    this.trigger!.setAttribute("aria-controls", this.menu.id);
    const list = items(this.menu);
    (focus === "last" ? list.at(-1) : list[0])?.focus();
    document.addEventListener("pointerdown", this.onOutside);
  }

  /** بستن منو؛ با focusTrigger فوکوس به دکمهٔ بازکننده برمی‌گردد */
  close(focusTrigger = true) {
    if (!this.menu || this.menu.hidden) return;
    this.menu.hidden = true;
    this.trigger!.setAttribute("aria-expanded", "false");
    this.trigger!.removeAttribute("aria-controls");
    document.removeEventListener("pointerdown", this.onOutside);
    if (focusTrigger) this.trigger!.focus();
  }

  private onOutside = (e: PointerEvent) => {
    if (!this.contains(e.target as Node)) this.close(false);
  };

  private onKey(e: KeyboardEvent) {
    const list = items(this.menu!);
    const i = list.indexOf(document.activeElement as HTMLElement);
    const go = (j: number) => list[(j + list.length) % list.length]?.focus();
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(list.length - 1);
    else if (e.key === "Escape") this.close();
    else if (e.key === "Tab") return this.close(false);
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      // پرش با حرف اول
      const k = e.key.toLowerCase();
      const rest = [...list.slice(i + 1), ...list.slice(0, i + 1)];
      rest.find((el) => el.textContent?.trim().toLowerCase().startsWith(k))?.focus();
    } else return;
    e.preventDefault();
  }
}

/**
 * پنجرهٔ کوچک غیرمدال کنار یک دکمه؛ اولین فرزند دکمهٔ بازکننده است و بقیه محتوای پنجره.
 * فوکوس به اولین عنصر قابل فوکوس داخل آن می‌رود، Esc می‌بندد و فوکوس را به دکمه برمی‌گرداند.
 */
export class KashiPopover extends HTMLBase {
  static observedAttributes = ["heading", "placement", "label"];
  private panel: HTMLDivElement | null = null;
  private trigger: HTMLElement | null = null;
  private key = uid("kashi-pop");

  connectedCallback() {
    afterParse(() => this.isConnected && !this.panel && this.build());
  }
  disconnectedCallback() {
    document.removeEventListener("pointerdown", this.onOutside);
  }
  attributeChangedCallback() {
    if (this.panel) this.decorate();
  }

  get open() {
    return !!this.panel && !this.panel.hidden;
  }
  set open(v: boolean) {
    if (v) this.show();
    else this.close(false);
  }

  private build() {
    const [trigger, ...rest] = [...this.childNodes].filter((n) => n.nodeType === 1 || n.textContent?.trim()) as HTMLElement[];
    if (!trigger) return;
    this.classList.add("k-popover-anchor");
    this.trigger = trigger;
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-expanded", "false");
    const panel = document.createElement("div");
    panel.id = `${this.key}-panel`;
    panel.setAttribute("role", "dialog");
    panel.tabIndex = -1;
    panel.hidden = true;
    panel.innerHTML = `<p class="k-popover__title" id="${this.key}-title"></p><div class="k-popover__body"></div>`;
    panel.querySelector(".k-popover__body")!.append(...rest);
    this.append(panel);
    this.panel = panel;
    this.decorate();
    trigger.addEventListener("click", () => (this.open ? this.close(false) : this.show()));
    panel.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        this.close(true);
      }
    });
    panel.addEventListener("focusout", (e) => {
      const next = e.relatedTarget as Node | null;
      if (next && !this.contains(next)) this.close(false);
    });
  }

  private decorate() {
    const p = this.panel!;
    const [side, align] = (this.getAttribute("placement") ?? "bottom-start").split("-");
    p.className = ["k-popover", side === "top" && "k-popover--top", align === "end" && "k-popover--end"].filter(Boolean).join(" ");
    const heading = this.getAttribute("heading");
    const title = p.querySelector<HTMLElement>(".k-popover__title")!;
    title.textContent = heading ?? "";
    title.hidden = !heading;
    if (heading) {
      p.setAttribute("aria-labelledby", title.id);
      p.removeAttribute("aria-label");
    } else {
      p.removeAttribute("aria-labelledby");
      p.setAttribute("aria-label", this.getAttribute("label") ?? "");
    }
  }

  show() {
    if (!this.panel || this.open) return;
    this.panel.hidden = false;
    this.trigger!.setAttribute("aria-expanded", "true");
    this.trigger!.setAttribute("aria-controls", this.panel.id);
    (this.panel.querySelector<HTMLElement>(`.k-popover__body :is(${FOCUSABLE})`) ?? this.panel).focus();
    document.addEventListener("pointerdown", this.onOutside);
    emit(this, "kashi-open", {});
  }

  close(focusTrigger = true) {
    if (!this.panel || this.panel.hidden) return;
    this.panel.hidden = true;
    this.trigger!.setAttribute("aria-expanded", "false");
    this.trigger!.removeAttribute("aria-controls");
    document.removeEventListener("pointerdown", this.onOutside);
    if (focusTrigger) this.trigger!.focus();
    emit(this, "kashi-close", {});
  }

  private onOutside = (e: PointerEvent) => {
    if (!this.contains(e.target as Node)) this.close(false);
  };
}

define("kashi-dropdown-menu", KashiDropdownMenu);
define("kashi-popover", KashiPopover);
