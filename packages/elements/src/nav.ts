import { normalizePersian, toFaDigits } from "@kashi-ui/persian";
import { afterParse, bool, define, emit, esc, HTMLBase, msg, num, uid } from "./base.js";

const search = (s: string) => normalizePersian(s, { digits: "latin" }).toLowerCase();
const items = (menu: Element) => [...menu.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])')];
const SEARCH = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="9" r="5.5"/><path d="m13.5 13.5 3 3"/></svg>';
const CHEVRON = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 5 5 5-5 5"/></svg>';

export interface CommandItem {
  id: string;
  label: string;
  group?: string;
  description?: string;
  shortcut?: string;
  keywords?: string[];
  href?: string;
}

/**
 * پالت فرمان با Ctrl+K یا ⌘K: جستجو بین دستورها و صفحه‌ها با ↑↓ و Enter.
 * دستورها از فرزندان <a href> یا <button data-value> (با data-group، data-description، data-shortcut، data-keywords)
 * یا element.items؛ انتخاب هر دستور بدون href رویداد kashi-select می‌فرستد.
 */
export class KashiCommandPalette extends HTMLBase {
  static observedAttributes = ["placeholder", "label", "shortcut"];
  private list: CommandItem[] | null = null;
  private dialog: HTMLDialogElement | null = null;
  private query = "";
  private active = 0;
  private opener: Element | null = null;
  private key = uid("kashi-cmd");

  connectedCallback() {
    afterParse(() => {
      if (!this.isConnected) return;
      if (this.list === null) this.list = this.readItems();
      if (!this.dialog) this.build();
      document.addEventListener("keydown", this.onShortcut);
    });
  }
  disconnectedCallback() {
    document.removeEventListener("keydown", this.onShortcut);
  }

  get items(): CommandItem[] {
    return this.list ?? [];
  }
  set items(v: CommandItem[]) {
    this.list = [...v];
    if (this.dialog?.open) this.paint();
  }

  private readItems(): CommandItem[] {
    const out = [...this.querySelectorAll<HTMLElement>(":scope > a, :scope > button")].map((el, i) => ({
      id: el.dataset.value ?? `${i}`,
      label: el.textContent?.trim() ?? "",
      group: el.dataset.group,
      description: el.dataset.description,
      shortcut: el.dataset.shortcut,
      keywords: el.dataset.keywords?.split(/[,،]\s*/),
      href: el instanceof HTMLAnchorElement ? el.getAttribute("href") ?? undefined : undefined,
    }));
    this.querySelectorAll(":scope > a, :scope > button").forEach((el) => el.remove());
    return out;
  }

  private onShortcut = (e: KeyboardEvent) => {
    if (this.getAttribute("shortcut") === "false") return;
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K" || e.code === "KeyK")) {
      e.preventDefault();
      if (this.dialog?.open) this.close();
      else this.show();
    }
  };

  private build() {
    const d = document.createElement("dialog");
    d.className = "k-dialog k-command";
    const M = msg();
    const title = this.getAttribute("label") ?? M.command.title;
    d.setAttribute("aria-label", title);
    d.innerHTML = `<div class="k-input"><span class="k-input__addon">${SEARCH}</span><input class="k-input__control" type="text" role="combobox" aria-expanded="true" aria-controls="${this.key}-list" aria-autocomplete="list" aria-label="${esc(title)}" placeholder="${esc(this.getAttribute("placeholder") ?? M.command.placeholder)}" autocomplete="off"></div><ul id="${this.key}-list" role="listbox" aria-label="${esc(title)}" class="k-listbox k-listbox--inline k-command__list"></ul><div class="k-command__footer" aria-hidden="true"><span><kbd class="k-kbd">↑</kbd><kbd class="k-kbd">↓</kbd>${esc(M.command.navigate)}</span><span><kbd class="k-kbd">Enter</kbd>${esc(M.command.select)}</span><span><kbd class="k-kbd">Esc</kbd>${esc(M.common.close)}</span></div><span class="k-sr-only" aria-live="polite"></span>`;
    this.append(d);
    this.dialog = d;
    const input = d.querySelector("input")!;
    input.addEventListener("input", () => {
      this.query = input.value;
      this.active = 0;
      this.paint();
    });
    input.addEventListener("keydown", (e) => {
      const n = this.filtered().length;
      if (!n) return;
      if (e.key === "ArrowDown") this.active = (this.active + 1) % n;
      else if (e.key === "ArrowUp") this.active = (this.active - 1 + n) % n;
      else if (e.key === "Home") this.active = 0;
      else if (e.key === "End") this.active = n - 1;
      else if (e.key === "Enter") return this.run(this.filtered()[this.active]);
      else return;
      e.preventDefault();
      this.paint();
    });
    const list = d.querySelector("ul")!;
    list.addEventListener("pointerdown", (e) => e.preventDefault());
    list.addEventListener("click", (e) => {
      const li = (e.target as Element).closest<HTMLElement>('[role="option"]');
      if (li) this.run(this.filtered()[Number(li.dataset.i)]);
    });
    d.addEventListener("click", (e) => e.target === d && this.close());
    d.addEventListener("close", () => (this.opener as HTMLElement | null)?.focus?.());
  }

  private filtered() {
    const q = search(this.query.trim());
    return this.items.filter((it) => !q || [it.label, it.description ?? "", ...(it.keywords ?? [])].some((t) => search(t).includes(q)));
  }

  /** باز کردن پالت */
  show() {
    if (!this.dialog) return;
    this.opener = document.activeElement;
    this.query = "";
    this.active = 0;
    this.dialog.querySelector("input")!.value = "";
    this.dialog.showModal?.();
    this.paint();
    this.dialog.querySelector("input")!.focus();
  }
  close() {
    if (this.dialog?.open) this.dialog.close();
  }

  private run(it: CommandItem | undefined) {
    if (!it) return;
    this.close();
    if (it.href) location.href = it.href;
    else emit(this, "kashi-select", { value: it.id, item: it });
  }

  private paint() {
    const d = this.dialog!;
    const list = this.filtered();
    const q = search(this.query.trim());
    const mark = (t: string) => {
      const i = q ? search(t).indexOf(q) : -1;
      return i < 0 ? esc(t) : `${esc(t.slice(0, i))}<mark>${esc(t.slice(i, i + q.length))}</mark>${esc(t.slice(i + q.length))}`;
    };
    let last: string | undefined;
    d.querySelector("ul")!.innerHTML = list.length
      ? list.map((it, i) => {
          const header = it.group && it.group !== last ? `<li role="presentation" class="k-listbox__group">${esc(it.group)}</li>` : "";
          last = it.group;
          return `${header}<li id="${this.key}-list-${i}" data-i="${i}" role="option" aria-selected="${i === this.active}"${i === this.active ? " data-active" : ""} class="k-option"><span class="k-option__body"><span>${mark(it.label)}</span>${it.description ? `<span class="k-option__desc">${esc(it.description)}</span>` : ""}</span>${it.shortcut ? `<span class="k-menu__shortcut" aria-hidden="true">${esc(it.shortcut)}</span>` : ""}</li>`;
        }).join("")
      : `<li role="presentation" class="k-listbox__empty">${esc(msg().command.empty)}</li>`;
    const input = d.querySelector("input")!;
    if (list.length) input.setAttribute("aria-activedescendant", `${this.key}-list-${this.active}`);
    else input.removeAttribute("aria-activedescendant");
    d.querySelector<HTMLElement>(`#${this.key}-list-${this.active}`)?.scrollIntoView?.({ block: "nearest" });
    d.querySelector(":scope > .k-sr-only")!.textContent = this.query ? msg().common.results(num(this, list.length)) : "";
  }
}

/**
 * منوی راست‌کلیک: محتوای عنصر ناحیهٔ کلیک است و گزینه‌ها داخل یک <div data-menu> (همان گزینه‌های kashi-dropdown-menu).
 * با راست‌کلیک، کلید ContextMenu یا Shift+F10 باز می‌شود؛ انتخاب گزینه رویداد kashi-select می‌فرستد.
 */
export class KashiContextMenu extends HTMLBase {
  static observedAttributes = ["label"];
  private menu: HTMLUListElement | null = null;
  private returnTo: HTMLElement | null = null;
  private key = uid("kashi-ctx");

  connectedCallback() {
    afterParse(() => this.isConnected && !this.menu && this.build());
  }
  disconnectedCallback() {
    document.removeEventListener("pointerdown", this.onOutside);
  }

  private build() {
    const source = this.querySelector(":scope > [data-menu]");
    this.classList.add("k-context-area");
    this.setAttribute("aria-haspopup", "menu");
    this.setAttribute("aria-describedby", `${this.key}-hint`);
    const menu = document.createElement("ul");
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", this.getAttribute("label") ?? msg().contextMenu.label);
    menu.className = "k-menu k-menu--context";
    menu.hidden = true;
    for (const el of [...(source?.children ?? [])] as HTMLElement[]) {
      const li = document.createElement("li");
      if (el.tagName === "HR") {
        li.setAttribute("role", "separator");
        li.className = "k-menu__separator";
      } else if (el.hasAttribute("data-label")) {
        li.setAttribute("role", "presentation");
        li.className = "k-menu__label";
        li.textContent = el.textContent;
      } else {
        li.setAttribute("role", "none");
        el.setAttribute("role", "menuitem");
        el.tabIndex = -1;
        el.classList.add("k-menu__item");
        if (el.dataset.tone === "danger") el.classList.add("k-menu__item--danger");
        if (el instanceof HTMLButtonElement) el.type = "button";
        el.innerHTML = `<span>${el.innerHTML}</span>${el.dataset.shortcut ? `<span class="k-menu__shortcut" aria-hidden="true">${esc(el.dataset.shortcut)}</span>` : ""}`;
        li.append(el);
      }
      menu.append(li);
    }
    source?.remove();
    this.insertAdjacentHTML("beforeend", `<span id="${this.key}-hint" class="k-sr-only">${esc(msg().contextMenu.hint)}</span>`);
    this.append(menu);
    this.menu = menu;
    this.addEventListener("contextmenu", (e) => {
      if (menu.contains(e.target as Node)) return;
      e.preventDefault();
      this.openAt(e.clientX, e.clientY);
    });
    this.addEventListener("keydown", (e) => {
      if (menu.contains(e.target as Node)) return this.onMenuKey(e);
      if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
        e.preventDefault();
        const r = (document.activeElement as HTMLElement).getBoundingClientRect();
        this.openAt(r.left + r.width / 2, r.top + r.height / 2);
      }
    });
    menu.addEventListener("click", (e) => {
      const item = (e.target as Element).closest<HTMLElement>('[role="menuitem"]');
      if (!item) return;
      emit(this, "kashi-select", { value: item.dataset.value ?? item.textContent?.trim() ?? "" });
      this.close(item.tagName !== "A");
    });
  }

  private openAt(x: number, y: number) {
    const menu = this.menu!;
    this.returnTo = (document.activeElement as HTMLElement) ?? this;
    menu.hidden = false;
    // در لایهٔ بالای صفحه (popover) تا داخل ظرف‌های overflow بریده نشود؛ مرورگرهای قدیمی بدون آن
    const pop = menu as unknown as { showPopover?: () => void };
    if (pop.showPopover) {
      if (!menu.hasAttribute("popover")) menu.setAttribute("popover", "manual");
      if (!menu.matches(":popover-open")) pop.showPopover();
    }
    const r = menu.getBoundingClientRect();
    const rtl = getComputedStyle(this).direction === "rtl";
    let nx = rtl ? x - r.width : x;
    if (nx < 8) nx = rtl ? x : 8;
    nx = Math.max(8, Math.min(nx, innerWidth - r.width - 8));
    const ny = Math.max(8, Math.min(y + r.height > innerHeight - 8 ? y - r.height : y, innerHeight - r.height - 8));
    menu.style.setProperty("--_x", `${nx}px`);
    menu.style.setProperty("--_y", `${ny}px`);
    items(menu)[0]?.focus({ preventScroll: true });
    document.addEventListener("pointerdown", this.onOutside);
    setTimeout(() => addEventListener("scroll", this.onScroll, { passive: true, once: true }), 150);
  }

  close(focusBack = true) {
    const menu = this.menu;
    if (!menu || menu.hidden) return;
    const pop = menu as unknown as { hidePopover?: () => void };
    if (menu.matches?.(":popover-open")) pop.hidePopover?.();
    menu.hidden = true;
    document.removeEventListener("pointerdown", this.onOutside);
    removeEventListener("scroll", this.onScroll);
    if (focusBack) this.returnTo?.focus();
  }
  private onOutside = (e: PointerEvent) => {
    if (!this.menu?.contains(e.target as Node)) this.close(false);
  };
  private onScroll = () => this.close(false);

  private onMenuKey(e: KeyboardEvent) {
    const list = items(this.menu!);
    const i = list.indexOf(document.activeElement as HTMLElement);
    const go = (j: number) => list[(j + list.length) % list.length]?.focus();
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(list.length - 1);
    else if (e.key === "Escape") this.close();
    else if (e.key === "Tab") return this.close(false);
    else return;
    e.preventDefault();
  }
}

const ARROW = (next: boolean) => `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-k-mirror=""><path d="${next ? "m8 5 5 5-5 5" : "m12 5-5 5 5 5"}"/></svg>`;

/** اسلایدر محتوا با اسکرول بومی: هر فرزند یک اسلاید؛ per-view تعداد اسلاید در هر نما، کلیدهای جهت و نقطه‌ها */
export class KashiCarousel extends HTMLBase {
  static observedAttributes = ["label", "per-view", "dots"];
  private track: HTMLElement | null = null;
  private index = 0;
  private io: IntersectionObserver | null = null;
  private key = uid("kashi-carousel");

  connectedCallback() {
    afterParse(() => this.isConnected && !this.track && this.build());
  }
  disconnectedCallback() {
    this.io?.disconnect();
  }

  private get perView() {
    return Math.max(1, Number(this.getAttribute("per-view")) || 1);
  }
  private get slides() {
    return [...(this.track?.children ?? [])] as HTMLElement[];
  }
  private get pages() {
    return Math.max(1, this.slides.length - this.perView + 1);
  }

  private build() {
    const M = msg();
    const label = this.getAttribute("label") ?? M.carousel.slider;
    const children = [...this.children];
    const section = document.createElement("section");
    section.className = "k-carousel";
    section.setAttribute("aria-roledescription", M.carousel.slider);
    section.setAttribute("aria-label", label);
    section.style.setProperty("--k-carousel-per-view", String(this.perView));
    const track = document.createElement("div");
    track.className = "k-carousel__track";
    track.tabIndex = 0;
    track.setAttribute("aria-live", "polite");
    children.forEach((c, i) => {
      const s = document.createElement("div");
      s.className = "k-carousel__slide";
      s.setAttribute("role", "group");
      s.setAttribute("aria-roledescription", M.carousel.slide);
      s.setAttribute("aria-label", M.carousel.slideOf(num(this, i + 1), num(this, children.length)));
      s.id = `${this.key}-s${i}`;
      s.append(c);
      track.append(s);
    });
    section.append(track);
    this.replaceChildren(section);
    this.track = track;
    if (this.pages > 1) {
      const dots = this.getAttribute("dots") !== "false";
      section.insertAdjacentHTML("beforeend", `<div class="k-carousel__bar">${dots ? `<ul class="k-carousel__dots" aria-label="${esc(M.carousel.slides(label))}">${Array.from({ length: this.pages }, (_, i) => `<li><button type="button" class="k-carousel__dot" data-go="${i}" aria-label="${esc(M.carousel.slideOf(num(this, i + 1), num(this, this.pages)))}" aria-controls="${this.key}-s${i}"></button></li>`).join("")}</ul>` : "<span></span>"}<div class="k-carousel__nav"><button type="button" class="k-btn k-btn--secondary k-btn--icon k-btn--sm" data-step="-1" aria-label="${esc(M.common.prev)}">${ARROW(false)}</button><button type="button" class="k-btn k-btn--secondary k-btn--icon k-btn--sm" data-step="1" aria-label="${esc(M.common.next)}">${ARROW(true)}</button></div></div>`);
      section.querySelector(".k-carousel__bar")!.addEventListener("click", (e) => {
        const b = (e.target as Element).closest<HTMLElement>("button");
        if (!b) return;
        this.go(b.dataset.go !== undefined ? Number(b.dataset.go) : this.index + Number(b.dataset.step));
      });
    }
    track.addEventListener("keydown", (e) => {
      const rtl = getComputedStyle(track).direction === "rtl";
      const step = ({ ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1 } as Record<string, number>)[e.key];
      if (step) {
        e.preventDefault();
        this.go(this.index + step);
      } else if (e.key === "Home") this.go(0);
      else if (e.key === "End") this.go(this.pages - 1);
    });
    if (typeof IntersectionObserver !== "undefined") {
      this.io = new IntersectionObserver((entries) => {
        const vis = entries.filter((x) => x.isIntersecting && x.intersectionRatio > 0.6).map((x) => this.slides.indexOf(x.target as HTMLElement));
        if (vis.length) this.setIndex(Math.min(...vis));
      }, { root: track, threshold: [0.6, 1] });
      this.slides.forEach((s) => this.io!.observe(s));
    }
    this.setIndex(0);
  }

  /** رفتن به اسلاید n (از صفر) */
  go(n: number) {
    const i = Math.max(0, Math.min(this.pages - 1, n));
    const el = this.slides[i];
    const t = this.track;
    if (!el || !t) return;
    const rtl = getComputedStyle(t).direction === "rtl";
    const offset = rtl ? -(t.getBoundingClientRect().right - el.getBoundingClientRect().right) + t.scrollLeft : el.getBoundingClientRect().left - t.getBoundingClientRect().left + t.scrollLeft;
    t.scrollTo?.({ left: offset });
    this.setIndex(i);
  }
  private setIndex(i: number) {
    const changed = i !== this.index;
    this.index = i;
    this.querySelectorAll(".k-carousel__dot").forEach((d, k) => d.setAttribute("aria-current", String(k === i)));
    const [prev, next] = this.querySelectorAll<HTMLButtonElement>("[data-step]");
    if (prev) prev.disabled = i === 0;
    if (next) next.disabled = i >= this.pages - 1;
    if (changed) emit(this, "kashi-change", { index: i });
  }
}

export interface TreeNode {
  id: string;
  label: string;
  meta?: string;
  disabled?: boolean;
  children?: TreeNode[];
}

/**
 * نمای درختی با الگوی Tree در WAI-ARIA. ساختار از یک فهرست تودرتوی معمولی (<ul><li data-id>…<ul>…</ul></li></ul>)
 * یا element.items؛ ↑↓ حرکت، جهت داخل باز کردن (در RTL فلش چپ)، Enter انتخاب.
 */
export class KashiTreeView extends HTMLBase {
  static observedAttributes = ["label", "selected", "expanded"];
  private nodes: TreeNode[] | null = null;
  private open = new Set<string>();
  private sel: string | null = null;
  private focusId: string | null = null;
  private built = false;

  connectedCallback() {
    afterParse(() => {
      if (!this.isConnected) return;
      if (this.nodes === null) {
        const ul = this.querySelector(":scope > ul");
        this.nodes = ul ? this.parse(ul) : [];
      }
      if (!this.built) {
        this.sel = this.getAttribute("selected");
        for (const id of (this.getAttribute("expanded") ?? "").split(/[,،]/).map((s) => s.trim()).filter(Boolean)) this.open.add(id);
        this.built = true;
      }
      this.render();
    });
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.built || old === next) return;
    if (name === "selected") this.sel = next;
    this.render();
  }

  get items(): TreeNode[] {
    return this.nodes ?? [];
  }
  set items(v: TreeNode[]) {
    this.nodes = v;
    if (this.built) this.render();
  }
  /** شناسهٔ گرهٔ انتخاب‌شده */
  get value() {
    return this.sel ?? "";
  }

  private parse(ul: Element): TreeNode[] {
    return [...ul.children].filter((li) => li.tagName === "LI").map((li, i) => {
      const sub = li.querySelector(":scope > ul");
      const label = [...li.childNodes].filter((n) => n !== sub).map((n) => n.textContent).join("").trim();
      const el = li as HTMLElement;
      return { id: el.dataset.id ?? `${label}-${i}`, label, meta: el.dataset.meta, disabled: el.hasAttribute("data-disabled"), children: sub ? this.parse(sub) : undefined };
    });
  }

  private visible() {
    const out: { node: TreeNode; parent: string | null }[] = [];
    const walk = (ns: TreeNode[], parent: string | null) => {
      for (const n of ns) {
        out.push({ node: n, parent });
        if (n.children?.length && this.open.has(n.id)) walk(n.children, n.id);
      }
    };
    walk(this.items, null);
    return out;
  }

  private render(focus = false) {
    const vis = this.visible();
    const current = this.focusId && vis.some((v) => v.node.id === this.focusId) ? this.focusId : this.sel && vis.some((v) => v.node.id === this.sel) ? this.sel : vis[0]?.node.id;
    const html = (ns: TreeNode[], level: number): string => ns.map((n) => {
      const kids = !!n.children?.length;
      const open = this.open.has(n.id);
      return `<li role="treeitem" data-id="${esc(n.id)}" class="k-tree__item" aria-level="${level}"${kids ? ` aria-expanded="${open}"` : ""} aria-selected="${this.sel === n.id}"${n.disabled ? ' aria-disabled="true"' : ""} tabindex="${current === n.id ? 0 : -1}"><div class="k-tree__row">${kids ? `<span class="k-tree__toggle" aria-hidden="true">${CHEVRON}</span>` : '<span class="k-tree__spacer"></span>'}<span class="k-tree__label">${esc(n.label)}</span>${n.meta ? `<span class="k-tree__meta">${esc(n.meta)}</span>` : ""}</div>${kids && open ? `<ul role="group">${html(n.children!, level + 1)}</ul>` : ""}</li>`;
    }).join("");
    this.innerHTML = `<ul role="tree" class="k-tree"${this.getAttribute("label") ? ` aria-label="${esc(this.getAttribute("label"))}"` : ""}>${html(this.items, 1)}</ul>`;
    const tree = this.querySelector<HTMLElement>("ul")!;
    tree.addEventListener("click", (e) => {
      const li = (e.target as Element).closest<HTMLElement>('[role="treeitem"]');
      if (!li || !(e.target as Element).closest(".k-tree__row")) return;
      const node = this.find(li.dataset.id!);
      if (!node) return;
      if (node.children?.length) this.toggle(node.id);
      this.focusId = node.id;
      this.choose(node);
    });
    tree.addEventListener("keydown", (e) => this.onKey(e));
    if (focus && current) [...this.querySelectorAll<HTMLElement>("[data-id]")].find((el) => el.dataset.id === current)?.focus();
  }

  private find(id: string, ns = this.items): TreeNode | null {
    for (const n of ns) {
      if (n.id === id) return n;
      const hit = n.children && this.find(id, n.children);
      if (hit) return hit;
    }
    return null;
  }
  private toggle(id: string, open = !this.open.has(id)) {
    if (open) this.open.add(id);
    else this.open.delete(id);
    emit(this, "kashi-expand", { expanded: [...this.open] });
  }
  private choose(n: TreeNode) {
    if (!n.disabled) {
      this.sel = n.id;
      emit(this, "kashi-change", { value: n.id, node: n });
    }
    this.render(true);
  }

  private onKey(e: KeyboardEvent) {
    const vis = this.visible();
    const cur = (document.activeElement as HTMLElement)?.dataset?.id;
    const i = vis.findIndex((v) => v.node.id === cur);
    const v = vis[i];
    if (!v) return;
    const rtl = getComputedStyle(this).direction === "rtl";
    const kids = !!v.node.children?.length;
    const open = this.open.has(v.node.id);
    const focus = (id: string) => {
      this.focusId = id;
      this.render(true);
    };
    if (e.key === "ArrowDown") vis[i + 1] && focus(vis[i + 1].node.id);
    else if (e.key === "ArrowUp") vis[i - 1] && focus(vis[i - 1].node.id);
    else if (e.key === "Home") focus(vis[0].node.id);
    else if (e.key === "End") focus(vis[vis.length - 1].node.id);
    else if (e.key === (rtl ? "ArrowLeft" : "ArrowRight")) {
      if (kids && !open) {
        this.toggle(v.node.id, true);
        focus(v.node.id);
      } else if (kids) focus(v.node.children![0].id);
    } else if (e.key === (rtl ? "ArrowRight" : "ArrowLeft")) {
      if (kids && open) {
        this.toggle(v.node.id, false);
        focus(v.node.id);
      } else if (v.parent) focus(v.parent);
    } else if (e.key === "Enter" || e.key === " ") {
      this.focusId = v.node.id;
      this.choose(v.node);
    } else return;
    e.preventDefault();
  }
}

export interface TourStep {
  target: string;
  title: string;
  content: string;
}

/**
 * تور معرفی: کارت راهنما کنار هر بخش صفحه با برجسته کردن آن. مراحل از فرزندان <div data-target="#id" data-title="…">متن</div>
 * یا element.steps؛ با element.start() یا دکمه‌ای با data-kashi-tour="شناسهٔ تور" شروع می‌شود.
 */
export class KashiTour extends HTMLBase {
  private list: TourStep[] | null = null;
  private i = 0;
  private spot: HTMLElement | null = null;
  private card: HTMLElement | null = null;
  private returnTo: HTMLElement | null = null;
  private key = uid("kashi-tour");

  connectedCallback() {
    afterParse(() => {
      if (!this.isConnected || this.list !== null) return;
      this.list = [...this.querySelectorAll<HTMLElement>(":scope > [data-target]")].map((el) => ({ target: el.dataset.target!, title: el.dataset.title ?? "", content: el.textContent?.trim() ?? "" }));
      this.replaceChildren();
    });
  }
  disconnectedCallback() {
    this.stop(false);
  }
  get steps(): TourStep[] {
    return this.list ?? [];
  }
  set steps(v: TourStep[]) {
    this.list = [...v];
  }

  /** شروع تور از مرحلهٔ اول */
  start() {
    if (!this.steps.length) return;
    this.returnTo = document.activeElement as HTMLElement;
    this.i = 0;
    addEventListener("scroll", this.place, { passive: true });
    addEventListener("resize", this.place);
    this.show();
  }
  /** پایان تور */
  stop(focusBack = true) {
    this.spot?.remove();
    this.card?.remove();
    this.spot = this.card = null;
    removeEventListener("scroll", this.place);
    removeEventListener("resize", this.place);
    if (focusBack) this.returnTo?.focus?.();
  }

  private show() {
    const s = this.steps[this.i];
    const n = this.steps.length;
    const last = this.i === n - 1;
    if (!this.card) {
      this.card = document.createElement("div");
      this.card.className = "k-tour__card";
      this.card.setAttribute("role", "dialog");
      this.card.setAttribute("aria-modal", "false");
      this.card.setAttribute("aria-labelledby", `${this.key}-t`);
      this.card.setAttribute("aria-describedby", `${this.key}-b`);
      this.card.tabIndex = -1;
      this.card.addEventListener("click", (e) => {
        const b = (e.target as Element).closest<HTMLElement>("[data-act]");
        if (!b) return;
        const act = b.dataset.act;
        if (act === "skip") this.stop();
        else if (act === "prev") this.step(-1);
        else if (act === "next") this.step(1);
        else if (act === "done") {
          this.stop();
          emit(this, "kashi-finish", {});
        }
      });
      this.card.addEventListener("keydown", (e) => {
        const rtl = getComputedStyle(this.card!).direction === "rtl";
        if (e.key === "Escape") this.stop();
        else if (e.key === (rtl ? "ArrowLeft" : "ArrowRight") && this.i < this.steps.length - 1) this.step(1);
        else if (e.key === (rtl ? "ArrowRight" : "ArrowLeft") && this.i > 0) this.step(-1);
      });
      document.body.append(this.card);
    }
    this.card.innerHTML = `<span class="k-tour__step">${esc(msg().tour.step(num(this, this.i + 1), num(this, n)))}</span><p class="k-tour__title" id="${this.key}-t">${esc(s.title)}</p><p class="k-tour__body" id="${this.key}-b">${esc(s.content)}</p><div class="k-tour__actions"><button type="button" class="k-btn k-btn--link k-tour__skip" data-act="skip">${esc(msg().tour.skip)}</button><span class="k-tour__progress" aria-hidden="true">${this.steps.map((_, k) => `<span${k <= this.i ? ' data-on=""' : ""}></span>`).join("")}</span>${this.i > 0 ? '<button type="button" class="k-btn k-btn--secondary k-btn--sm" data-act="prev">${esc(msg().common.prev)}</button>' : ""}<button type="button" class="k-btn k-btn--primary k-btn--sm" data-act="${last ? "done" : "next"}">${esc(last ? msg().tour.done : msg().common.next)}</button></div>`;
    const el = document.querySelector<HTMLElement>(s.target);
    const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView?.({ block: "center", behavior: reduce ? "auto" : "smooth" });
    this.place();
    setTimeout(this.place, 400);
    this.card.focus({ preventScroll: true });
  }
  private step(d: number) {
    this.i = Math.max(0, Math.min(this.steps.length - 1, this.i + d));
    this.show();
  }

  private place = () => {
    const card = this.card;
    if (!card) return;
    const el = document.querySelector<HTMLElement>(this.steps[this.i].target);
    const rect = el?.getBoundingClientRect() ?? null;
    if (rect) {
      if (!this.spot) {
        this.spot = document.createElement("div");
        this.spot.className = "k-tour__spot";
        this.spot.setAttribute("aria-hidden", "true");
        document.body.append(this.spot);
      }
      Object.assign(this.spot.style, { top: `${rect.top - 6}px`, left: `${rect.left - 6}px`, inlineSize: `${rect.width + 12}px`, blockSize: `${rect.height + 12}px` });
    } else {
      this.spot?.remove();
      this.spot = null;
    }
    const c = card.getBoundingClientRect();
    if (!rect) {
      Object.assign(card.style, { top: `${innerHeight / 2 - c.height / 2}px`, left: `${innerWidth / 2 - c.width / 2}px` });
      return;
    }
    const below = rect.bottom + 12 + c.height < innerHeight;
    const top = below ? rect.bottom + 12 : Math.max(12, rect.top - 12 - c.height);
    const left = Math.min(innerWidth - c.width - 12, Math.max(12, rect.left + rect.width / 2 - c.width / 2));
    Object.assign(card.style, { top: `${top}px`, left: `${left}px` });
  };
}

/**
 * دو پنل با جداکنندهٔ قابل کشیدن: دو فرزند اول پنل‌ها هستند؛ با کیبورد ←→ (یا ↑↓ در حالت vertical) و دوبار کلیک برای اندازهٔ اولیه.
 */
export class KashiSplitter extends HTMLBase {
  static observedAttributes = ["size", "min", "max", "orientation", "label", "height"];
  private current = 40;
  private built = false;
  private dragging = false;

  connectedCallback() {
    afterParse(() => {
      if (!this.isConnected || this.built) return;
      this.current = this.num("size", 40);
      this.build();
    });
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.built || old === next) return;
    if (name === "size") this.set(Number(next) || 40, false);
    else this.decorate();
  }
  /** اندازهٔ پنل اول به درصد */
  get value() {
    return this.current;
  }
  set value(v: number) {
    this.set(v, false);
  }
  private num(a: string, d: number) {
    const v = Number(this.getAttribute(a));
    return Number.isFinite(v) && this.getAttribute(a) !== null ? v : d;
  }
  private get vertical() {
    return this.getAttribute("orientation") === "vertical";
  }

  private build() {
    const [a, b] = [...this.children];
    const box = document.createElement("div");
    const pa = document.createElement("div");
    pa.className = "k-splitter__pane";
    if (a) pa.append(a);
    const handle = document.createElement("div");
    handle.className = "k-splitter__handle";
    handle.setAttribute("role", "separator");
    handle.tabIndex = 0;
    const pb = document.createElement("div");
    pb.className = "k-splitter__pane";
    if (b) pb.append(b);
    box.append(pa, handle, pb);
    this.replaceChildren(box);
    this.built = true;
    handle.addEventListener("pointerdown", (e) => {
      handle.setPointerCapture?.(e.pointerId);
      this.dragging = true;
      box.toggleAttribute("data-dragging", true);
      handle.toggleAttribute("data-dragging", true);
    });
    handle.addEventListener("pointermove", (e) => {
      if (!this.dragging) return;
      const r = box.getBoundingClientRect();
      if (this.vertical) return this.set(((e.clientY - r.top) / r.height) * 100);
      const rtl = getComputedStyle(box).direction === "rtl";
      this.set(((rtl ? r.right - e.clientX : e.clientX - r.left) / r.width) * 100);
    });
    const end = () => {
      this.dragging = false;
      box.removeAttribute("data-dragging");
      handle.removeAttribute("data-dragging");
    };
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
    handle.addEventListener("dblclick", () => this.set(this.num("size", 40)));
    handle.addEventListener("keydown", (e) => {
      const rtl = getComputedStyle(handle).direction === "rtl";
      const keys: Record<string, number> = this.vertical ? { ArrowUp: -5, ArrowDown: 5 } : { ArrowLeft: rtl ? 5 : -5, ArrowRight: rtl ? -5 : 5 };
      if (e.key in keys) this.set(this.current + keys[e.key]);
      else if (e.key === "Home") this.set(this.num("min", 15));
      else if (e.key === "End") this.set(this.num("max", 85));
      else return;
      e.preventDefault();
    });
    this.decorate();
  }

  private decorate() {
    const box = this.firstElementChild as HTMLElement;
    box.className = `k-splitter${this.vertical ? " k-splitter--vertical" : ""}`;
    const h = this.getAttribute("height");
    box.style.blockSize = h ?? "";
    const handle = box.querySelector<HTMLElement>(".k-splitter__handle")!;
    handle.setAttribute("aria-orientation", this.vertical ? "horizontal" : "vertical");
    handle.setAttribute("aria-valuemin", String(this.num("min", 15)));
    handle.setAttribute("aria-valuemax", String(this.num("max", 85)));
    handle.setAttribute("aria-label", this.getAttribute("label") ?? msg().splitter.label);
    this.paint();
  }

  private set(p: number, fire = true) {
    const v = Math.round(Math.min(this.num("max", 85), Math.max(this.num("min", 15), p)) * 10) / 10;
    const changed = v !== this.current;
    this.current = v;
    if (this.built) this.paint();
    if (fire && changed) emit(this, "kashi-change", { value: v });
  }
  private paint() {
    const box = this.firstElementChild as HTMLElement;
    const pane = box.querySelector<HTMLElement>(".k-splitter__pane")!;
    pane.style.inlineSize = this.vertical ? "" : `${this.current}%`;
    pane.style.blockSize = this.vertical ? `${this.current}%` : "";
    const handle = box.querySelector<HTMLElement>(".k-splitter__handle")!;
    handle.setAttribute("aria-valuenow", String(this.current));
    handle.setAttribute("aria-valuetext", msg().common.percent(num(this, Math.round(this.current))));
  }
}

/**
 * منوی کناری: همان HTML منوی کناری کاشی (تب HTML صفحهٔ آن) را داخلش بگذارید؛ زیرمنوها
 * (دکمه با aria-controls) با کلیک باز و بسته می‌شوند و با collapsed فقط آیکون‌ها می‌مانند.
 */
export class KashiSideNav extends HTMLBase {
  static observedAttributes = ["collapsed"];
  private built = false;

  connectedCallback() {
    afterParse(() => {
      if (!this.isConnected || this.built) return;
      this.built = true;
      this.addEventListener("click", (e) => {
        const b = (e.target as Element).closest<HTMLButtonElement>("button[aria-controls][aria-expanded]");
        if (!b || !this.contains(b)) return;
        const sub = document.getElementById(b.getAttribute("aria-controls")!);
        const open = b.getAttribute("aria-expanded") !== "true";
        b.setAttribute("aria-expanded", String(open));
        if (sub) sub.hidden = !open;
        emit(this, "kashi-toggle", { id: sub?.id ?? "", open });
      });
      this.decorate();
    });
  }
  attributeChangedCallback() {
    if (this.built) this.decorate();
  }
  private decorate() {
    const nav = this.querySelector(".k-sidenav");
    const collapsed = bool(this, "collapsed");
    nav?.classList.toggle("k-sidenav--collapsed", collapsed);
    // در حالت جمع‌شده، نام هر گزینه برای صفحه‌خوان و راهنمای موس
    this.querySelectorAll<HTMLElement>(".k-sidenav__item").forEach((it) => {
      const text = it.querySelector(".k-sidenav__text")?.textContent?.trim();
      if (!text) return;
      if (collapsed) {
        it.setAttribute("aria-label", text);
        it.setAttribute("title", text);
      } else {
        it.removeAttribute("aria-label");
        it.removeAttribute("title");
      }
    });
  }
}

// دکمه‌هایی که بدون JavaScript تور یا پالت فرمان را باز می‌کنند: data-kashi-tour="شناسه" و data-kashi-command="شناسه"
if (typeof document !== "undefined") {
  document.addEventListener("click", (e) => {
    const t = e.target as Element | null;
    const tb = t?.closest?.("[data-kashi-tour]");
    const tour = tb ? (document.getElementById(tb.getAttribute("data-kashi-tour")!) as KashiTour | null) : null;
    if (tour?.start) tour.start();
    const cb = t?.closest?.("[data-kashi-command]");
    const palette = cb ? (document.getElementById(cb.getAttribute("data-kashi-command")!) as KashiCommandPalette | null) : null;
    if (palette?.show) palette.show();
  });
}

define("kashi-command-palette", KashiCommandPalette, "contents");
define("kashi-context-menu", KashiContextMenu, "block");
define("kashi-carousel", KashiCarousel, "block");
define("kashi-tree-view", KashiTreeView, "block");
define("kashi-tour", KashiTour, "contents");
define("kashi-splitter", KashiSplitter, "block");
define("kashi-side-nav", KashiSideNav, "block");
