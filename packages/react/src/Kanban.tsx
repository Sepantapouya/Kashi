"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { cx } from "./cx.js";
import { isRtl, useFlip } from "./dnd.js";
import { useIsomorphicLayoutEffect } from "./utils.js";
import { useKashi } from "./KashiProvider.js";

export interface KanbanColumn<T> {
  id: string;
  title: ReactNode;
  /** نام ستون برای صفحه‌خوان، اگر title متن ساده نیست */
  label?: string;
  items: T[];
  /** سقف کارت (WIP)؛ بیشتر از آن ستون هشدار می‌گیرد */
  limit?: number;
  /** رنگ نشانگر ستون، مثل "var(--k-chart-3)" */
  color?: string;
}

export interface KanbanCardState {
  handle: ReactNode;
  dragging: boolean;
}

export interface KanbanProps<T> {
  columns: KanbanColumn<T>[];
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  /** با رها کردن کارت؛ ستون‌ها با ترتیب تازه */
  onChange: (columns: KanbanColumn<T>[]) => void;
  /** محتوای کارت */
  renderCard?: (item: T, state: KanbanCardState) => ReactNode;
  /** دکمهٔ «افزودن» پایین هر ستون */
  onAdd?: (columnId: string) => void;
  /** متن دکمهٔ افزودن */
  addLabel?: string;
  "aria-label"?: string;
  className?: string;
}

type Pos = { col: number; index: number };
const Grip = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    {[6, 10, 14].flatMap((y) => [<circle key={`a${y}`} cx="7.5" cy={y} r="1.3" />, <circle key={`b${y}`} cx="12.5" cy={y} r="1.3" />])}
  </svg>
);
const Plus = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true"><path d="M10 5v10M5 10h10" /></svg>;
const tr = (el: HTMLElement) => {
  const [x = "0", y = "0"] = el.style.translate.split(" ");
  return [parseFloat(x) || 0, parseFloat(y) || 0];
};

/**
 * تابلوی کانبان: کارت‌ها را بین ستون‌ها بکشید، یا با کیبورد: فاصله برای برداشتن، بالا و پایین در ستون،
 * چپ و راست بین ستون‌ها (در راست‌به‌چپ، چپ یعنی ستون بعد)، فاصله برای رها کردن و Escape برای لغو.
 */
export function Kanban<T>({ columns, getId, getLabel, onChange, renderCard, onAdd, addLabel, "aria-label": ariaLabel, className }: KanbanProps<T>) {
  const { messages: M, n } = useKashi();
  const K = M.kanban;
  const root = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<KanbanColumn<T>[] | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [mode, setMode] = useState<"pointer" | "keyboard" | null>(null);
  const [live, setLive] = useState("");
  const drag = useRef<{ id: string; gx: number; gy: number; pointer: number; sx: number; sy: number; started: boolean } | null>(null);
  const cols = preview ?? columns;
  useFlip(root, cols.map((c) => c.items.map(getId).join(",")).join("|"));

  const colName = (c: KanbanColumn<T>) => c.label ?? (typeof c.title === "string" ? c.title : c.id);
  const find = (list: KanbanColumn<T>[], id: string): Pos => {
    for (let col = 0; col < list.length; col++) {
      const index = list[col].items.findIndex((x) => getId(x) === id);
      if (index >= 0) return { col, index };
    }
    return { col: -1, index: -1 };
  };
  const relocate = (list: KanbanColumn<T>[], from: Pos, to: Pos) => {
    const next = list.map((c) => ({ ...c, items: c.items.slice() }));
    const [it] = next[from.col].items.splice(from.index, 1);
    next[to.col].items.splice(to.index, 0, it);
    return next;
  };
  const cardEl = (id: string) => root.current?.querySelector<HTMLElement>(`[data-flip="${CSS.escape(id)}"]`) ?? null;

  const finish = (commit: boolean) => {
    const id = active;
    if (id && preview) {
      const p = find(preview, id);
      const item = preview[p.col]?.items[p.index];
      if (item !== undefined) {
        if (commit) {
          onChange(preview);
          setLive(K.dropped(getLabel(item), colName(preview[p.col]), n(p.index + 1)));
        } else setLive(K.cancelled(getLabel(item)));
      }
    }
    if (id) {
      const el = cardEl(id);
      if (el) el.style.translate = "";
    }
    drag.current = null;
    setPreview(null);
    setActive(null);
    setMode(null);
  };
  const finishRef = useRef(finish);
  finishRef.current = finish;
  // کارتی که به ستون دیگر می‌رود دوباره ساخته می‌شود و فوکوس لحظه‌ای از دست می‌رود؛ در این فاصله blur لغو نکند
  const refocusing = useRef(false);
  // پس از هر جابه‌جایی کیبوردی، فوکوس همان لحظه (پیش از کلید بعدی) به دستگیرهٔ کارت برمی‌گردد
  useIsomorphicLayoutEffect(() => {
    if (mode !== "keyboard" || !active) return;
    const el = cardEl(active)?.querySelector<HTMLElement>(".k-kanban__handle");
    if (el && document.activeElement !== el) el.focus();
    refocusing.current = false;
  }, [preview, mode, active]);

  const follow = (x: number, y: number) => {
    const d = drag.current;
    if (!d) return;
    if (!d.started) {
      if (Math.hypot(x - d.sx, y - d.sy) < 5) return;
      d.started = true;
      setPreview(columns);
      setActive(d.id);
      setMode("pointer");
      return;
    }
    const el = cardEl(d.id);
    const list = preview;
    if (!el || !list) return;
    const [tx, ty] = tr(el);
    const r = el.getBoundingClientRect();
    el.style.translate = `${x - d.gx - (r.left - tx)}px ${y - d.gy - (r.top - ty)}px`;
    // ستون زیر اشاره‌گر
    const colEls = Array.from(root.current!.querySelectorAll<HTMLElement>(".k-kanban__col"));
    let col = colEls.findIndex((c) => {
      const b = c.getBoundingClientRect();
      return x >= b.left && x <= b.right;
    });
    if (col < 0) return;
    const center = y - d.gy + el.offsetHeight / 2;
    let index = 0;
    for (const o of Array.from(colEls[col].querySelectorAll<HTMLElement>("[data-flip]"))) {
      if (o === el) continue;
      const b = o.getBoundingClientRect();
      if (center > b.top - tr(o)[1] + b.height / 2) index++;
    }
    const from = find(list, d.id);
    if (from.col !== col || from.index !== index) setPreview(relocate(list, from, { col, index }));
  };

  const followRef = useRef(follow);
  followRef.current = follow;

  // رویدادها روی window گوش داده می‌شوند، نه روی کارت: کارتی که به ستون دیگر می‌رود دوباره ساخته می‌شود و pointer capture از دست می‌رود
  const onPointerDown = (e: PointerEvent<HTMLElement>, item: T) => {
    if (e.button !== 0 || drag.current) return;
    const t = e.target as HTMLElement;
    if (t.closest("a, input, textarea, select, button:not(.k-kanban__handle), [contenteditable]")) return;
    const r = e.currentTarget.getBoundingClientRect();
    const pid = e.pointerId;
    drag.current = { id: getId(item), gx: e.clientX - r.left, gy: e.clientY - r.top, pointer: pid, sx: e.clientX, sy: e.clientY, started: false };
    const move = (ev: globalThis.PointerEvent) => {
      if (ev.pointerId !== pid) return;
      if (drag.current?.started) ev.preventDefault();
      followRef.current(ev.clientX, ev.clientY);
    };
    const stop = (ev: globalThis.PointerEvent, cancel = false) => {
      if (ev.pointerId !== pid) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", onCancel);
      if (drag.current?.started) finishRef.current(!cancel);
      else drag.current = null;
    };
    const up = (ev: globalThis.PointerEvent) => stop(ev);
    const onCancel = (ev: globalThis.PointerEvent) => stop(ev, true);
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", onCancel);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, item: T) => {
    const id = getId(item);
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (active === id && mode === "keyboard") finish(true);
      else {
        const p = find(columns, id);
        setPreview(columns);
        setActive(id);
        setMode("keyboard");
        setLive(K.grabbed(getLabel(item), colName(columns[p.col])));
      }
      return;
    }
    if (active !== id || mode !== "keyboard" || !preview) return;
    if (e.key === "Escape") {
      e.preventDefault();
      finish(false);
      return;
    }
    const from = find(preview, id);
    const rtl = isRtl(root.current);
    const nextCol = rtl ? "ArrowLeft" : "ArrowRight";
    const prevCol = rtl ? "ArrowRight" : "ArrowLeft";
    let to: Pos | null = null;
    if (e.key === "ArrowUp" && from.index > 0) to = { col: from.col, index: from.index - 1 };
    else if (e.key === "ArrowDown" && from.index < preview[from.col].items.length - 1) to = { col: from.col, index: from.index + 1 };
    else if (e.key === nextCol && from.col < preview.length - 1) to = { col: from.col + 1, index: Math.min(from.index, preview[from.col + 1].items.length) };
    else if (e.key === prevCol && from.col > 0) to = { col: from.col - 1, index: Math.min(from.index, preview[from.col - 1].items.length) };
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    if (!to) return;
    const next = relocate(preview, from, to);
    refocusing.current = true;
    setPreview(next);
    setLive(K.moved(getLabel(item), colName(next[to.col]), n(to.index + 1)));
  };

  return (
    <div ref={root} className={cx("k-kanban", className)} role="group" aria-label={ariaLabel ?? K.label} data-dragging={active ? "" : undefined}>
      {cols.map((c, ci) => {
        const over = c.limit !== undefined && c.items.length > c.limit;
        const headId = `k-kanban-${c.id}`;
        return (
          <section key={c.id} className="k-kanban__col" aria-labelledby={headId} data-over={over ? "" : undefined} data-target={active && find(cols, active).col === ci ? "" : undefined}>
            <header className="k-kanban__head">
              {c.color && <span className="k-kanban__dot" style={{ background: c.color }} aria-hidden="true" />}
              <h3 className="k-kanban__title" id={headId}>{c.title}</h3>
              <span className="k-kanban__count" aria-label={K.count(n(c.items.length))}>
                {n(c.items.length)}{c.limit !== undefined ? `/${n(c.limit)}` : ""}
              </span>
            </header>
            <ul className="k-kanban__list">
              {c.items.map((item) => {
                const id = getId(item);
                const dragging = active === id;
                const handle = (
                  <button
                    type="button"
                    className="k-kanban__handle"
                    aria-label={`${getLabel(item)}${M.common.list}${colName(c)}`}
                    aria-pressed={dragging && mode === "keyboard"}
                    aria-describedby={`${headId}-hint`}
                    onKeyDown={(e) => onKeyDown(e, item)}
                    onBlur={() =>
                      mode === "keyboard" && dragging &&
                      setTimeout(() => {
                        if (!refocusing.current && !root.current?.contains(document.activeElement)) finishRef.current(false);
                      }, 0)
                    }
                  >
                    <Grip />
                  </button>
                );
                return (
                  <li
                    key={id}
                    className="k-kanban__card"
                    data-flip={id}
                    data-dragging={dragging ? "" : undefined}
                    data-mode={dragging ? mode ?? undefined : undefined}
                    onPointerDown={(e) => onPointerDown(e, item)}
                  >
                    {renderCard ? renderCard(item, { handle, dragging }) : (<>{handle}<span className="k-kanban__label">{getLabel(item)}</span></>)}
                  </li>
                );
              })}
              {c.items.length === 0 && <li className="k-kanban__empty">{K.empty}</li>}
            </ul>
            {onAdd && (
              <button type="button" className="k-kanban__add" onClick={() => onAdd(c.id)}>
                <Plus />
                {addLabel ?? K.add}
              </button>
            )}
            <span id={`${headId}-hint`} hidden>{K.instructions}</span>
          </section>
        );
      })}
      <span className="k-sr-only" aria-live="assertive">{live}</span>
    </div>
  );
}
