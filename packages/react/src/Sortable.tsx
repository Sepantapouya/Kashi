"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { cx } from "./cx.js";
import { move, useFlip } from "./dnd.js";
import { useIsomorphicLayoutEffect } from "./utils.js";
import { useKashi } from "./KashiProvider.js";

export interface SortableRenderState {
  /** دستگیرهٔ کشیدن؛ هر جای مورد که بخواهید بگذاریدش */
  handle: ReactNode;
  /** این مورد در حال کشیدن است */
  dragging: boolean;
  index: number;
}

export interface SortableListProps<T> {
  items: T[];
  getId: (item: T) => string;
  /** نام مورد برای صفحه‌خوان، مثل «کار ۳» */
  getLabel: (item: T) => string;
  /** با رها کردن؛ آرایهٔ مرتب تازه */
  onReorder: (items: T[]) => void;
  /** محتوای هر مورد؛ بدون آن متن getLabel با دستگیره نشان داده می‌شود */
  renderItem?: (item: T, state: SortableRenderState) => ReactNode;
  /** نام فهرست برای صفحه‌خوان */
  "aria-label"?: string;
  disabled?: boolean;
  className?: string;
}

const Grip = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    {[6, 10, 14].flatMap((y) => [<circle key={`a${y}`} cx="7.5" cy={y} r="1.3" />, <circle key={`b${y}`} cx="12.5" cy={y} r="1.3" />])}
  </svg>
);

/**
 * فهرست کشیدنی: با ماوس و لمس از دستگیره بکشید، یا با کیبورد: فاصله برای برداشتن، کلیدهای جهت برای حرکت،
 * فاصلهٔ دوباره برای رها کردن و Escape برای لغو. هر حرکت برای صفحه‌خوان اعلام می‌شود.
 */
export function SortableList<T>({ items, getId, getLabel, onReorder, renderItem, "aria-label": ariaLabel, disabled, className }: SortableListProps<T>) {
  const { messages: M, n } = useKashi();
  const S = M.sortable;
  const root = useRef<HTMLUListElement>(null);
  // ترتیب پیش‌نمایش هنگام کشیدن؛ null یعنی همان items
  const [preview, setPreview] = useState<T[] | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [mode, setMode] = useState<"pointer" | "keyboard" | null>(null);
  const [live, setLive] = useState("");
  const drag = useRef<{ id: string; grabY: number; pointer: number } | null>(null);
  const list = preview ?? items;
  useFlip(root, list.map(getId).join("|"));

  const total = n(list.length);
  const say = (fn: (item: string, pos: string, total: string) => string, item: T, pos: number) => setLive(fn(getLabel(item), n(pos + 1), total));

  const finish = (commit: boolean) => {
    const current = preview;
    const it = current?.find((x) => getId(x) === active);
    if (it && current) {
      if (commit) {
        onReorder(current);
        say(S.dropped, it, current.indexOf(it));
      } else setLive(S.cancelled(getLabel(it)));
    }
    const el = active ? root.current?.querySelector<HTMLElement>(`[data-flip="${CSS.escape(active)}"]`) : null;
    if (el) el.style.translate = "";
    drag.current = null;
    setPreview(null);
    setActive(null);
    setMode(null);
  };

  const finishRef = useRef(finish);
  finishRef.current = finish;
  const refocusing = useRef(false);
  useIsomorphicLayoutEffect(() => {
    if (mode !== "keyboard" || !active) return;
    const el = root.current?.querySelector<HTMLElement>(`[data-flip="${CSS.escape(active)}"] .k-sortable__handle`);
    if (el && document.activeElement !== el) el.focus();
    refocusing.current = false;
  }, [preview, mode, active]);
  // اگر فوکوس از فهرست بیرون رفت، جابه‌جایی کیبوردی لغو می‌شود (جابه‌جایی DOM خودش blur موقت می‌سازد)
  const onBlur = () =>
    setTimeout(() => {
      if (!refocusing.current && !root.current?.contains(document.activeElement)) finishRef.current(false);
    }, 0);

  // جای مورد کشیده‌شده زیر اشاره‌گر
  const follow = (clientY: number) => {
    const d = drag.current;
    const el = d && root.current?.querySelector<HTMLElement>(`[data-flip="${CSS.escape(d.id)}"]`);
    if (!d || !el || !preview) return;
    const base = el.getBoundingClientRect().top - (parseFloat(el.style.translate.split(" ")[1] ?? "0") || 0);
    el.style.translate = `0 ${clientY - d.grabY - base}px`;
    // جای تازه: مورد زیر مرکز مورد کشیده‌شده
    const center = clientY - d.grabY + el.offsetHeight / 2;
    const others = Array.from(root.current!.querySelectorAll<HTMLElement>("[data-flip]"));
    let to = 0;
    for (const o of others) {
      if (o === el) continue;
      const r = o.getBoundingClientRect();
      const top = r.top - (parseFloat(o.style.translate.split(" ")[1] ?? "0") || 0);
      if (center > top + r.height / 2) to++;
    }
    const from = preview.findIndex((x) => getId(x) === d.id);
    if (to !== from) setPreview(move(preview, from, to));
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>, item: T) => {
    if (disabled || e.button !== 0) return;
    const el = (e.currentTarget.closest("[data-flip]") as HTMLElement)!;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: getId(item), grabY: e.clientY - el.getBoundingClientRect().top, pointer: e.pointerId };
    setPreview(items);
    setActive(getId(item));
    setMode("pointer");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, item: T) => {
    if (disabled) return;
    const id = getId(item);
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (active === id && mode === "keyboard") finish(true);
      else {
        setPreview(items);
        setActive(id);
        setMode("keyboard");
        say(S.grabbed, item, items.indexOf(item));
      }
      return;
    }
    if (active !== id || mode !== "keyboard" || !preview) return;
    if (e.key === "Escape") {
      e.preventDefault();
      finish(false);
      return;
    }
    const from = preview.findIndex((x) => getId(x) === id);
    const to = e.key === "ArrowUp" || e.key === "ArrowLeft" ? from - 1 : e.key === "ArrowDown" || e.key === "ArrowRight" ? from + 1 : e.key === "Home" ? 0 : e.key === "End" ? preview.length - 1 : -2;
    if (to === -2) return;
    e.preventDefault();
    if (to < 0 || to >= preview.length || to === from) return;
    const next = move(preview, from, to);
    refocusing.current = true;
    setPreview(next);
    say(S.moved, item, to);
  };

  return (
    <>
      <ul ref={root} className={cx("k-sortable", className)} aria-label={ariaLabel} data-dragging={active ? "" : undefined}>
        {list.map((item, index) => {
          const id = getId(item);
          const dragging = active === id;
          const handle = (
            <button
              type="button"
              className="k-sortable__handle"
              aria-label={S.handle(getLabel(item))}
              aria-pressed={dragging && mode === "keyboard"}
              title={S.instructions}
              disabled={disabled}
              onPointerDown={(e) => onPointerDown(e, item)}
              onPointerMove={(e) => drag.current?.pointer === e.pointerId && follow(e.clientY)}
              onPointerUp={(e) => drag.current?.pointer === e.pointerId && finish(true)}
              onPointerCancel={() => drag.current && finish(false)}
              onKeyDown={(e) => onKeyDown(e, item)}
              onBlur={() => mode === "keyboard" && dragging && onBlur()}
            >
              <Grip />
            </button>
          );
          return (
            <li key={id} className="k-sortable__item" data-flip={id} data-dragging={dragging ? "" : undefined} data-mode={dragging ? mode ?? undefined : undefined}>
              {renderItem ? renderItem(item, { handle, dragging, index }) : (<>{handle}<span className="k-sortable__label">{getLabel(item)}</span></>)}
            </li>
          );
        })}
      </ul>
      <span className="k-sr-only" aria-live="assertive">{live}</span>
    </>
  );
}
