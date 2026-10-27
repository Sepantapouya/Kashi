import { useState, type ReactNode } from "react";
import { toFaDigits } from "@kashi-ui/persian";
import { cx } from "./cx.js";

/** صفحه‌هایی که نمایش داده می‌شوند؛ null یعنی «…» */
export function pageRange(page: number, total: number, siblings = 1): (number | null)[] {
  const out: (number | null)[] = [];
  const from = Math.max(2, page - siblings);
  const to = Math.min(total - 1, page + siblings);
  out.push(1);
  if (from > 2) out.push(from === 3 ? 2 : null);
  for (let p = from; p <= to; p++) out.push(p);
  if (to < total - 1) out.push(to === total - 2 ? total - 1 : null);
  if (total > 1) out.push(total);
  return out;
}

export interface PaginationProps {
  page: number;
  total: number;
  onChange?: (page: number) => void;
  /** برای صفحه‌بندی با لینک (بهتر برای SEO)؛ در این حالت onChange لازم نیست */
  getHref?: (page: number) => string;
  /** تعداد صفحه‌های کنار صفحهٔ فعلی @default 1 */
  siblings?: number;
  /** متن خلاصه، مثل «نمایش ۱ تا ۱۰ از ۹۷» */
  summary?: ReactNode;
  /** @default "fa" */
  digits?: "fa" | "latin";
  /** تعداد ردیف در هر صفحه؛ با onPageSizeChange فهرست انتخاب نمایش داده می‌شود */
  pageSize?: number;
  /** @default [10, 20, 50, 100] */
  pageSizes?: number[];
  onPageSizeChange?: (size: number) => void;
  /** فیلد «برو به صفحه» برای فهرست‌های طولانی */
  jumper?: boolean;
  labels?: { nav?: string; prev?: string; next?: string; page?: (n: string) => string; perPage?: string; jump?: string };
  className?: string;
}

const Chevron = ({ dir }: { dir: "prev" | "next" }) => (
  <svg data-k-mirror="" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === "prev" ? "m12 5-5 5 5 5" : "m8 5 5 5-5 5"} />
  </svg>
);

/** صفحه‌بندی با ارقام فارسی؛ صفحهٔ فعلی با aria-current="page" */
export function Pagination({
  page, total, onChange, getHref, siblings = 1, summary, digits = "fa", pageSize, pageSizes = [10, 20, 50, 100], onPageSizeChange, jumper, labels = {}, className,
}: PaginationProps) {
  const n = (v: number) => (digits === "fa" ? toFaDigits(v) : String(v));
  const { nav = "صفحه‌بندی", prev = "قبلی", next = "بعدی", page: pageLabel = (x) => `صفحهٔ ${x}`, perPage = "در هر صفحه", jump = "برو به صفحه" } = labels;
  const [jumpText, setJumpText] = useState("");
  // تابع معمولی، نه کامپوننت: تا دکمه‌ها با هر رندر دوباره ساخته نشوند و فوکوس کیبورد حفظ شود
  const item = ({ to, children, current, disabled, aria, className: c }: { to: number; children: ReactNode; current?: boolean; disabled?: boolean; aria?: string; className: string }) =>
    getHref && !disabled ? (
      <a className={c} href={getHref(to)} aria-current={current ? "page" : undefined} aria-label={aria}>{children}</a>
    ) : (
      <button type="button" className={c} disabled={disabled} aria-current={current ? "page" : undefined} aria-label={aria} onClick={() => onChange?.(to)}>{children}</button>
    );
  return (
    <nav className={cx("k-pagination", className)} aria-label={nav}>
      {item({ to: page - 1, disabled: page <= 1, className: "k-btn k-btn--secondary k-btn--sm", children: <><Chevron dir="prev" />{prev}</> })}
      {summary && <span className="k-pagination__summary">{summary}</span>}
      <ul className="k-pagination__pages" role="list">
        {pageRange(page, total, siblings).map((p, i) => (
          <li key={i}>
            {p === null ? (
              <span className="k-pagination__ellipsis" aria-hidden="true">…</span>
            ) : (
              item({ to: p, current: p === page, aria: pageLabel(n(p)), className: "k-pagination__page", children: n(p) })
            )}
          </li>
        ))}
      </ul>
      {item({ to: page + 1, disabled: page >= total, className: "k-btn k-btn--secondary k-btn--sm", children: <>{next}<Chevron dir="next" /></> })}
      {(onPageSizeChange || (jumper && onChange)) && (
        <div className="k-pagination__tools">
          {onPageSizeChange && (
            <label className="k-pagination__tool">
              <span className="k-select k-select--sm">
                <select className="k-select__control" value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
                  {pageSizes.map((sz) => <option key={sz} value={sz}>{n(sz)}</option>)}
                </select>
              </span>
              <span>{perPage}</span>
            </label>
          )}
          {jumper && onChange && (
            <form
              className="k-pagination__tool"
              onSubmit={(e) => {
                e.preventDefault();
                const to = Number(jumpText.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/\D/g, ""));
                if (to >= 1 && to <= total) onChange(to);
                setJumpText("");
              }}
            >
              <label className="k-pagination__tool">
                <span>{jump}</span>
                <span className="k-input k-input--sm k-pagination__jump"><input className="k-input__control" inputMode="numeric" dir="ltr" value={jumpText} placeholder={n(page)} aria-label={`${jump}، از ${n(1)} تا ${n(total)}`} onChange={(e) => setJumpText(e.target.value)} /></span>
              </label>
            </form>
          )}
        </div>
      )}
    </nav>
  );
}
