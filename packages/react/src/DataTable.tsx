import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { cx } from "./cx.js";

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** محتوای خانه؛ پیش‌فرض row[key] */
  render?: (row: T) => ReactNode;
  /** مقدار برای مرتب‌سازی؛ پیش‌فرض row[key] */
  sortValue?: (row: T) => string | number;
  sortable?: boolean;
  /** عدد و مبلغ: چپ‌چین در RTL با ارقام هم‌عرض */
  numeric?: boolean;
  /** چینش خانه‌ها؛ numeric خودکار «end» است */
  align?: "start" | "center" | "end";
  width?: string;
  /** پنهان کردن ستون در صفحه‌های باریک */
  hideBelow?: "sm" | "md";
  /** کلاس خانه‌های این ستون */
  className?: string;
}

export type SortState = { key: string; direction: "ascending" | "descending" } | null;

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  /** عنوان جدول (caption)؛ برای صفحه‌خوان ضروری است */
  caption: ReactNode;
  description?: ReactNode;
  /** پنهان کردن عنوان از دید (صفحه‌خوان همچنان می‌خواند) */
  hideCaption?: boolean;
  selectable?: boolean;
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  sort?: SortState;
  defaultSort?: SortState;
  onSortChange?: (sort: SortState) => void;
  /** وقتی ردیفی نیست */
  empty?: ReactNode;
  compact?: boolean;
  /** ردیف‌های راه‌راه */
  striped?: boolean;
  /** سرستون هنگام اسکرول ثابت بماند؛ با maxHeight */
  stickyHeader?: boolean;
  /** بیشترین ارتفاع جدول (مثل "24rem")؛ بیشتر از آن اسکرول می‌خورد */
  maxHeight?: string;
  /** نمایش ردیف‌های اسکلت به‌جای داده */
  loading?: boolean | number;
  /** کلیک روی ردیف؛ برای ناوبری بهتر است در یک خانه لینک واقعی هم بگذارید */
  onRowClick?: (row: T) => void;
  /** محتوای پایین جدول، مثل صفحه‌بندی */
  footer?: ReactNode;
  labels?: { selectAll?: string; selectRow?: (row: T) => string; loading?: string };
  classNames?: { root?: string; table?: string; row?: string; cell?: string; header?: string; footer?: string };
  className?: string;
}

/** جدول داده با مرتب‌سازی (aria-sort)، انتخاب ردیف‌ها و حالت خالی */
export function DataTable<T extends Record<string, unknown>>({
  columns, rows, getRowId, caption, description, hideCaption, selectable, selected, onSelectedChange,
  sort, defaultSort = null, onSortChange, empty, compact, striped, stickyHeader, maxHeight, loading, onRowClick, footer,
  labels = {}, classNames = {}, className,
}: DataTableProps<T>) {
  const id = useId();
  const [innerSort, setInnerSort] = useState<SortState>(defaultSort);
  const [innerSel, setInnerSel] = useState<string[]>([]);
  const activeSort = sort !== undefined ? sort : innerSort;
  const sel = selected ?? innerSel;
  const allRef = useRef<HTMLInputElement>(null);

  const sorted = useMemo(() => {
    if (!activeSort) return rows;
    const col = columns.find((c) => c.key === activeSort.key);
    const val = (r: T) => (col?.sortValue ? col.sortValue(r) : (r[activeSort.key] as string | number));
    const dir = activeSort.direction === "ascending" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "fa")) * dir;
    });
  }, [rows, activeSort, columns]);

  const setSort = (key: string) => {
    const next: SortState =
      activeSort?.key === key && activeSort.direction === "ascending" ? { key, direction: "descending" } : { key, direction: "ascending" };
    if (sort === undefined) setInnerSort(next);
    onSortChange?.(next);
  };
  const setSel = (ids: string[]) => {
    if (selected === undefined) setInnerSel(ids);
    onSelectedChange?.(ids);
  };

  const ids = rows.map(getRowId);
  const all = ids.length > 0 && ids.every((x) => sel.includes(x));
  const some = !all && ids.some((x) => sel.includes(x));
  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = some;
  }, [some]);

  const { selectAll = "انتخاب همهٔ ردیف‌ها", selectRow = () => "انتخاب ردیف", loading: loadingLabel = "در حال بارگذاری" } = labels;
  const loadingRows = loading === true ? 5 : typeof loading === "number" ? loading : 0;
  const cellCls = (c: Column<T>) =>
    cx(c.numeric && "k-table__num", c.align && !c.numeric && `k-table__align-${c.align}`, c.hideBelow && `k-table__hide-${c.hideBelow}`, c.className, classNames.cell) || undefined;
  const colCount = columns.length + (selectable ? 1 : 0);

  return (
    <div
      className={cx("k-table-wrap", stickyHeader && "k-table-wrap--sticky", className, classNames.root)}
      role="region"
      aria-labelledby={`${id}-caption`}
      aria-busy={loadingRows > 0 || undefined}
      tabIndex={0}
      style={maxHeight ? { maxBlockSize: maxHeight } : undefined}
    >
      <table className={cx("k-table", compact && "k-table--compact", striped && "k-table--striped", onRowClick && "k-table--clickable", classNames.table)}>
        <caption id={`${id}-caption`} className={hideCaption ? "k-sr-only" : undefined}>
          <span className="k-table__caption-title">{caption}</span>
          {description && <span className="k-table__caption-desc">{description}</span>}
        </caption>
        <thead>
          <tr>
            {selectable && (
              <th scope="col" className="k-table__check">
                <input ref={allRef} type="checkbox" className="k-checkbox" aria-label={selectAll} checked={all} onChange={() => setSel(all ? [] : ids)} />
              </th>
            )}
            {columns.map((c) => {
              const s = activeSort?.key === c.key ? activeSort.direction : undefined;
              return (
                <th key={c.key} scope="col" aria-sort={c.sortable ? (s ?? "none") : undefined} className={cx(cellCls(c), classNames.header) || undefined} style={c.width ? { inlineSize: c.width } : undefined}>
                  {c.sortable ? <button type="button" className="k-table__sort" onClick={() => setSort(c.key)}>{c.header}</button> : c.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loadingRows > 0 ? (
            Array.from({ length: loadingRows }, (_, i) => (
              <tr key={`sk-${i}`} aria-hidden="true">
                {selectable && <td className="k-table__check"><span className="k-skeleton" style={{ inlineSize: "1.125rem", blockSize: "1.125rem" }} /></td>}
                {columns.map((c) => (
                  <td key={c.key} className={cellCls(c)}><span className="k-skeleton" style={{ inlineSize: `${50 + ((i * 17 + c.key.length * 11) % 40)}%` }} /></td>
                ))}
              </tr>
            ))
          ) : sorted.length === 0 ? (
            <tr className="k-table__empty"><td colSpan={colCount}>{empty ?? <p style={{ padding: "2rem", margin: 0, textAlign: "center" }}>داده‌ای وجود ندارد.</p>}</td></tr>
          ) : (
            sorted.map((r) => {
              const rid = getRowId(r);
              const on = sel.includes(rid);
              return (
                <tr
                  key={rid}
                  aria-selected={selectable ? on : undefined}
                  className={classNames.row}
                  onClick={onRowClick ? (e) => {
                    // کلیک روی چک‌باکس، دکمه یا لینک داخل ردیف را ردیف نگیرد
                    if ((e.target as HTMLElement).closest("a, button, input, label, select, textarea")) return;
                    onRowClick(r);
                  } : undefined}
                >
                  {selectable && (
                    <td className="k-table__check">
                      <input type="checkbox" className="k-checkbox" aria-label={selectRow(r)} checked={on} onChange={() => setSel(on ? sel.filter((x) => x !== rid) : [...sel, rid])} />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className={cellCls(c)}>{c.render ? c.render(r) : (r[c.key] as ReactNode)}</td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {loadingRows > 0 && <span className="k-sr-only" role="status">{loadingLabel}</span>}
      {footer && <div className={cx("k-table__footer", classNames.footer)}>{footer}</div>}
    </div>
  );
}
