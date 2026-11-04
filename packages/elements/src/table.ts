import { normalizePersian, toFaDigits } from "@kashi-ui/persian";
import { afterParse, bool, define, emit, esc, HTMLBase, msg, num, uid } from "./base.js";
import { cellNumber } from "./controls.js";

export interface TableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  numeric?: boolean;
  /** متن سلول؛ پیش‌فرض مقدار row[key] */
  format?: (value: unknown, row: Record<string, unknown>) => string;
}

const search = (s: string) => normalizePersian(s, { digits: "latin" }).toLowerCase();

/**
 * جدول داده با مرتب‌سازی، انتخاب ردیف و جستجو. دو راه:
 * ۱) یک <table> معمولی داخلش بگذارید: ستون‌های th[data-sort] مرتب‌شدنی‌اند (data-numeric برای عدد) و tr[data-id] شناسهٔ ردیف است.
 * ۲) یا با JavaScript: element.columns = [...] و element.rows = [...].
 * بدون JavaScript همان جدول معمولی با ظاهر کاشی دیده می‌شود.
 */
export class KashiDataTable extends HTMLBase {
  static observedAttributes = ["selectable", "searchable", "compact", "striped", "sticky-header", "caption", "name"];
  private cols: TableColumn[] | null = null;
  private data: Record<string, unknown>[] | null = null;
  private table: HTMLTableElement | null = null;
  private sort: { index: number; dir: "ascending" | "descending" } | null = null;
  private query = "";
  private key = uid("kashi-table");
  /** شناسهٔ ردیف در حالت JavaScript @default row.id */
  getRowId: (row: Record<string, unknown>) => string = (r) => String(r.id ?? "");

  connectedCallback() {
    afterParse(() => this.isConnected && this.setup());
  }
  attributeChangedCallback(_n: string, old: string | null, next: string | null) {
    if (this.table && old !== next) this.setup();
  }

  /** ستون‌ها در حالت JavaScript */
  get columns(): TableColumn[] {
    return this.cols ?? [];
  }
  set columns(c: TableColumn[]) {
    this.cols = c;
    if (this.isConnected && this.data) this.setup();
  }
  /** ردیف‌ها در حالت JavaScript */
  get rows(): Record<string, unknown>[] {
    return this.data ?? [];
  }
  set rows(r: Record<string, unknown>[]) {
    this.data = r;
    if (this.isConnected && this.cols) this.setup();
  }
  /** شناسهٔ ردیف‌های انتخاب‌شده */
  get selected(): string[] {
    return [...this.querySelectorAll<HTMLTableRowElement>('tbody tr[aria-selected="true"]')].map((tr) => tr.dataset.id ?? "");
  }

  private setup() {
    if (this.cols && this.data) this.buildFromData();
    let table = this.querySelector<HTMLTableElement>(":scope table");
    if (!table) return;
    const wrap = table.closest(".k-table-wrap") ?? this.wrap(table);
    wrap.className = `k-table-wrap${bool(this, "sticky-header") ? " k-table-wrap--sticky" : ""}`;
    table.classList.add("k-table");
    table.classList.toggle("k-table--compact", bool(this, "compact"));
    table.classList.toggle("k-table--striped", bool(this, "striped"));
    const caption = table.querySelector("caption");
    if (caption) {
      caption.id ||= `${this.key}-caption`;
      wrap.setAttribute("aria-labelledby", caption.id);
    }
    this.table = table;
    this.decorateHeader();
    this.decorateRows();
    this.searchBox();
    this.apply();
  }

  private wrap(table: HTMLTableElement) {
    const w = document.createElement("div");
    w.setAttribute("role", "region");
    w.tabIndex = 0;
    table.before(w);
    w.append(table);
    return w;
  }

  private buildFromData() {
    const cols = this.cols!;
    const caption = this.getAttribute("caption") ?? "";
    const cell = (c: TableColumn, r: Record<string, unknown>) => (c.format ? c.format(r[c.key], r) : String(r[c.key] ?? ""));
    const html = `<table>${caption ? `<caption><span class="k-table__caption-title">${esc(caption)}</span></caption>` : ""}<thead><tr>${cols.map((c) => `<th scope="col"${c.sortable ? " data-sort" : ""}${c.numeric ? " data-numeric" : ""}>${esc(c.header)}</th>`).join("")}</tr></thead><tbody>${this.data!.map((r) => `<tr data-id="${esc(this.getRowId(r))}">${cols.map((c) => `<td>${esc(cell(c, r))}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    this.querySelector(":scope > .k-table-wrap, :scope > table")?.remove();
    this.insertAdjacentHTML("beforeend", html);
  }

  private decorateHeader() {
    const t = this.table!;
    const ths = this.headCells();
    ths.forEach((th, i) => {
      if (th.classList.contains("k-table__check")) return;
      th.scope ||= "col";
      if (th.hasAttribute("data-numeric")) th.classList.add("k-table__num");
      if (!th.hasAttribute("data-sort") || th.querySelector(".k-table__sort")) return;
      th.setAttribute("aria-sort", "none");
      const b = document.createElement("button");
      b.type = "button";
      b.className = "k-table__sort";
      b.append(...th.childNodes);
      th.append(b);
      // شمارهٔ ستون همین حالا ثابت می‌شود؛ ستون چک‌باکس ممکن است بعداً اول ردیف اضافه شود
      const idx = this.dataIndex(i);
      b.addEventListener("click", () => {
        this.sort = this.sort?.index === idx && this.sort.dir === "ascending" ? { index: idx, dir: "descending" } : { index: idx, dir: "ascending" };
        this.apply();
        emit(this, "kashi-sort", { column: idx, direction: this.sort.dir });
      });
    });
    // ستون عددی: سلول‌های همان ستون هم چپ‌چین عددی می‌شوند
    const numeric = ths.map((th) => th.hasAttribute("data-numeric"));
    for (const tr of this.bodyRows()) [...tr.children].forEach((td, i) => numeric[i] && td.classList.add("k-table__num"));

    const selectable = bool(this, "selectable");
    const head = this.headRow();
    const existing = head?.querySelector(".k-table__check");
    if (selectable && head && !existing) {
      const th = document.createElement("th");
      th.scope = "col";
      th.className = "k-table__check";
      th.innerHTML = '<input type="checkbox" class="k-checkbox" aria-label="${esc(msg().table.selectAll)}">';
      head.prepend(th);
      th.querySelector("input")!.addEventListener("change", (e) => {
        const on = (e.target as HTMLInputElement).checked;
        this.visibleRows().forEach((tr) => this.setRow(tr, on));
        this.selectionChanged();
      });
    } else if (!selectable && existing) existing.remove();
  }

  private headRow() {
    return this.table!.querySelector<HTMLTableRowElement>(":scope > thead > tr");
  }
  private headCells() {
    return [...(this.headRow()?.children ?? [])] as HTMLTableCellElement[];
  }
  private bodyRows() {
    return [...this.table!.querySelectorAll<HTMLTableRowElement>(":scope > tbody > tr")];
  }

  /** شمارهٔ ستون بدون ستون چک‌باکس */
  private dataIndex(i: number) {
    return this.headRow()?.querySelector(".k-table__check") ? i - 1 : i;
  }
  private offset() {
    return this.headRow()?.querySelector(".k-table__check") ? 1 : 0;
  }

  private decorateRows() {
    const selectable = bool(this, "selectable");
    const rows = this.bodyRows();
    rows.forEach((tr, i) => {
      tr.dataset.id ||= String(i + 1);
      tr.dataset.order ||= String(i);
      const cell = tr.querySelector(".k-table__check");
      if (selectable && !cell) {
        const td = document.createElement("td");
        td.className = "k-table__check";
        const label = tr.children[0]?.textContent?.trim();
        td.innerHTML = `<input type="checkbox" class="k-checkbox" aria-label="${esc(label ? msg().table.selectNamed(label) : msg().table.selectRow)}">`;
        tr.prepend(td);
        tr.setAttribute("aria-selected", "false");
        td.querySelector("input")!.addEventListener("change", (e) => {
          this.setRow(tr, (e.target as HTMLInputElement).checked);
          this.selectionChanged();
        });
      } else if (!selectable && cell) {
        cell.remove();
        tr.removeAttribute("aria-selected");
      }
    });
    this.selectionChanged(false);
  }

  private setRow(tr: HTMLTableRowElement, on: boolean) {
    tr.setAttribute("aria-selected", String(on));
    const box = tr.querySelector<HTMLInputElement>(".k-table__check input");
    if (box) box.checked = on;
  }

  private selectionChanged(fire = true) {
    const all = this.headRow()?.querySelector<HTMLInputElement>(".k-table__check input");
    const rows = this.visibleRows();
    const on = rows.filter((tr) => tr.getAttribute("aria-selected") === "true").length;
    if (all) {
      all.checked = rows.length > 0 && on === rows.length;
      all.indeterminate = on > 0 && on < rows.length;
    }
    const name = this.getAttribute("name");
    this.querySelectorAll(":scope > input[type=hidden]").forEach((el) => el.remove());
    if (name) for (const id of this.selected) this.insertAdjacentHTML("beforeend", `<input type="hidden" name="${esc(name)}" value="${esc(id)}">`);
    if (fire) emit(this, "kashi-change", { selected: this.selected });
  }

  private visibleRows() {
    return this.bodyRows().filter((tr) => !tr.hidden && !tr.classList.contains("k-table__empty"));
  }

  private searchBox() {
    const existing = this.querySelector(":scope > .k-table-search");
    if (!bool(this, "searchable")) return existing?.remove();
    if (existing) return;
    const id = `${this.key}-search`;
    const box = document.createElement("div");
    box.className = "k-table-search k-field";
    box.style.marginBlockEnd = "var(--k-space-3)";
    box.innerHTML = `<div class="k-input k-input--sm"><input id="${id}" class="k-input__control" type="search" placeholder="${esc(msg().table.search)}" aria-label="${esc(msg().table.search)}"></div><span class="k-sr-only" aria-live="polite"></span>`;
    this.prepend(box);
    const input = box.querySelector("input")!;
    input.addEventListener("input", () => {
      this.query = input.value;
      this.apply();
      box.querySelector(".k-sr-only")!.textContent = msg().table.rows(num(this, this.visibleRows().length));
    });
  }

  /** مرتب‌سازی و جستجو را روی ردیف‌ها اعمال می‌کند */
  private apply() {
    const t = this.table!;
    const body = t.querySelector<HTMLTableSectionElement>(":scope > tbody");
    if (!body) return;
    const off = this.offset();
    const rows = this.bodyRows().filter((tr) => !tr.classList.contains("k-table__empty"));
    const ths = this.headCells();
    ths.forEach((th, i) => {
      if (!th.hasAttribute("aria-sort")) return;
      th.setAttribute("aria-sort", this.sort && this.sort.index === i - off ? this.sort.dir : "none");
    });
    let ordered = rows.sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order));
    if (this.sort) {
      const { index, dir } = this.sort;
      const numeric = ths[index + off]?.hasAttribute("data-numeric");
      const val = (tr: HTMLTableRowElement) => {
        const td = tr.children[index + off] as HTMLElement | undefined;
        const text = td?.dataset.value ?? td?.textContent?.trim() ?? "";
        return numeric ? cellNumber(text) : text;
      };
      const k = dir === "ascending" ? 1 : -1;
      ordered = [...ordered].sort((a, b) => {
        const x = val(a), y = val(b);
        return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "fa")) * k;
      });
    }
    const q = search(this.query.trim());
    for (const tr of ordered) {
      tr.hidden = !!q && !search(tr.textContent ?? "").includes(q);
      body.append(tr);
    }
    body.querySelector(".k-table__empty")?.remove();
    if (q && !this.visibleRows().length) {
      const cols = ths.length;
      body.insertAdjacentHTML("beforeend", `<tr class="k-table__empty"><td colspan="${cols}"><p style="padding: 2rem; margin: 0; text-align: center">${esc(msg().common.noResults)}</p></td></tr>`);
    }
    this.selectionChanged(false);
  }
}

define("kashi-data-table", KashiDataTable, "block");
