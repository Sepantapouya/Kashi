import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { toFaDigits } from "@kashi-ui/persian";
import { cx } from "./cx.js";

export interface SplitterProps {
  /** دقیقاً دو فرزند: پنل ابتدا و پنل انتها */
  children: [ReactNode, ReactNode];
  /** «horizontal» کنار هم، «vertical» زیر هم @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /** اندازهٔ پنل اول به درصد */
  size?: number;
  defaultSize?: number;
  onSizeChange?: (percent: number) => void;
  /** @default 15 */
  min?: number;
  /** @default 85 */
  max?: number;
  /** نام دستگیره، مثل «اندازهٔ فهرست فایل‌ها» @default «تغییر اندازهٔ پنل‌ها» */
  label?: string;
  /** ارتفاع ظرف در حالت افقی */
  height?: string;
  className?: string;
}

/** دو پنل با مرز قابل‌کشیدن؛ با کیبورد: ←→ (یا ↑↓) پنج درصد، Home/End کمینه و بیشینه */
export function Splitter({ children, orientation = "horizontal", size, defaultSize = 40, onSizeChange, min = 15, max = 85, label = "تغییر اندازهٔ پنل‌ها", height, className }: SplitterProps) {
  const [inner, setInner] = useState(defaultSize);
  const current = size ?? inner;
  const [dragging, setDragging] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const vertical = orientation === "vertical";
  const set = (p: number) => {
    const v = Math.round(Math.min(max, Math.max(min, p)) * 10) / 10;
    if (size === undefined) setInner(v);
    onSizeChange?.(v);
  };
  const fromPointer = (e: PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    if (vertical) return set(((e.clientY - r.top) / r.height) * 100);
    // در RTL پنل اول سمت راست است
    const rtl = getComputedStyle(box.current!).direction === "rtl";
    set(((rtl ? r.right - e.clientX : e.clientX - r.left) / r.width) * 100);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const keys: Record<string, number> = vertical
      ? { ArrowUp: -5, ArrowDown: 5 }
      : { ArrowLeft: rtl ? 5 : -5, ArrowRight: rtl ? -5 : 5 };
    if (e.key in keys) set(current + keys[e.key]);
    else if (e.key === "Home") set(min);
    else if (e.key === "End") set(max);
    else return;
    e.preventDefault();
  };
  return (
    <div
      ref={box}
      className={cx("k-splitter", vertical && "k-splitter--vertical", className)}
      data-dragging={dragging ? "" : undefined}
      style={{ blockSize: height } as CSSProperties}
    >
      <div className="k-splitter__pane" style={vertical ? { blockSize: `${current}%` } : { inlineSize: `${current}%` }}>{children[0]}</div>
      <div
        className="k-splitter__handle"
        role="separator"
        tabIndex={0}
        aria-orientation={vertical ? "horizontal" : "vertical"}
        aria-valuenow={current}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={`${toFaDigits(Math.round(current))}٪`}
        aria-label={label}
        data-dragging={dragging ? "" : undefined}
        onKeyDown={onKey}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
        }}
        onPointerMove={(e) => dragging && fromPointer(e)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onDoubleClick={() => set(defaultSize)}
      />
      <div className="k-splitter__pane">{children[1]}</div>
    </div>
  );
}
