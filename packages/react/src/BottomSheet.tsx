"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { cx } from "./cx.js";
import { CloseIcon } from "./icons.js";
import { useKashi } from "./KashiProvider.js";
import { useModalDialog } from "./modal.js";

export interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** پنهان کردن عنوان از دید (صفحه‌خوان همچنان می‌خواند) */
  hideTitle?: boolean;
  /**
   * ارتفاع‌های ایست به نسبت ارتفاع صفحه، از کوچک به بزرگ (مثل [0.5, 0.9]).
   * بدون آن، برگه به اندازهٔ محتواست (حداکثر ۹۰٪) و کشیدن فقط برای بستن است.
   */
  snapPoints?: number[];
  /** ایست اولیه (اندیس snapPoints) @default 0 */
  defaultSnap?: number;
  /** ایست فعلی (کنترل‌شده) */
  snap?: number;
  onSnapChange?: (index: number) => void;
  /** دکمه‌های پایین برگه */
  footer?: ReactNode;
  /** بستن با کلیک روی پس‌زمینه و کشیدن به پایین @default true */
  dismissible?: boolean;
  /** دکمهٔ بستن در سربرگ @default false (دستگیره و Esc کافی‌اند) */
  showClose?: boolean;
  closeLabel?: string;
  className?: string;
  children?: ReactNode;
}

/** فاصله‌ای که بعد از آن، کشیدن به پایین برگه را می‌بندد (نسبت به ارتفاع برگه) */
const CLOSE_RATIO = 0.3;
/** سرعت پرتاب (پیکسل بر میلی‌ثانیه) که بدون توجه به فاصله می‌بندد یا ایست را عوض می‌کند */
const FLING = 0.6;

/**
 * برگهٔ پایین برای گوشی روی <dialog> بومی: با دستگیره بالا و پایین کشیده می‌شود،
 * روی ارتفاع‌های تعیین‌شده می‌ایستد و با کشیدن به پایین یا Esc بسته می‌شود.
 * دستگیره با کیبورد هم کار می‌کند: Enter ایست بعدی، جهت‌های بالا و پایین تغییر ارتفاع.
 */
export function BottomSheet({
  open, onOpenChange, title, description, hideTitle, snapPoints, defaultSnap = 0, snap, onSnapChange,
  footer, dismissible = true, showClose = false, closeLabel, className, children,
}: BottomSheetProps) {
  const { messages: M } = useKashi();
  closeLabel ??= M.common.close;
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const { restoreFocus } = useModalDialog(ref, open);
  const points = snapPoints?.length ? snapPoints : null;
  const [innerSnap, setInnerSnap] = useState(defaultSnap);
  const current = Math.min(snap ?? innerSnap, (points?.length ?? 1) - 1);
  const drag = useRef<{ y: number; t: number; h: number; dy: number; v: number } | null>(null);

  const setSnap = (i: number) => {
    if (snap === undefined) setInnerSnap(i);
    onSnapChange?.(i);
  };

  // هر بار باز شدن از ایست اولیه شروع شود
  useEffect(() => {
    if (open && snap === undefined) setInnerSnap(defaultSnap);
  }, [open, snap, defaultSnap]);

  const style = points ? ({ "--k-sheet-height": `${points[current] * 100}dvh` } as Record<string, string>) : undefined;

  const onPointerDown = (e: RPointerEvent<HTMLElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest(".k-dialog__close")) return;
    const d = ref.current;
    if (!d) return;
    drag.current = { y: e.clientY, t: e.timeStamp, h: d.getBoundingClientRect().height, dy: 0, v: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    d.setAttribute("data-dragging", "");
  };
  const onPointerMove = (e: RPointerEvent<HTMLElement>) => {
    const s = drag.current;
    const d = ref.current;
    if (!s || !d) return;
    const dy = e.clientY - s.y;
    const dt = Math.max(1, e.timeStamp - s.t);
    s.v = (dy - s.dy) / dt;
    s.dy = dy;
    s.t = e.timeStamp;
    // بالا کشیدن فقط تا بزرگ‌ترین ایست؛ بیشتر از آن با مقاومت
    const maxUp = points ? (points[points.length - 1] * innerHeight) - s.h : 0;
    const y = dy < 0 ? -Math.min(-dy, Math.max(0, maxUp)) - Math.max(0, -dy - Math.max(0, maxUp)) * 0.15 : dy;
    d.style.translate = `0 ${y}px`;
  };
  const onPointerUp = () => {
    const s = drag.current;
    const d = ref.current;
    drag.current = null;
    if (!s || !d) return;
    d.removeAttribute("data-dragging");
    d.style.translate = "";
    const target = s.h - s.dy; // ارتفاع مطلوب کاربر
    if (dismissible && (s.dy > s.h * CLOSE_RATIO || (s.v > FLING && s.dy > 24))) {
      if (!points || current === 0 || s.v > FLING * 1.5 || target < points[0] * innerHeight * 0.6) {
        d.style.translate = `0 ${Math.max(0, s.dy)}px`;
        onOpenChange(false);
        return;
      }
    }
    if (!points) return;
    let next = current;
    if (Math.abs(s.v) > FLING) next = Math.max(0, Math.min(points.length - 1, current + (s.v < 0 ? 1 : -1)));
    else next = points.reduce((best, p, i) => (Math.abs(p * innerHeight - target) < Math.abs(points[best] * innerHeight - target) ? i : best), 0);
    if (next !== current) setSnap(next);
  };

  const onHandleKey = (e: RKeyboardEvent) => {
    if (!points) return;
    if (e.key === "ArrowUp" && current < points.length - 1) { e.preventDefault(); setSnap(current + 1); }
    if (e.key === "ArrowDown" && current > 0) { e.preventDefault(); setSnap(current - 1); }
  };
  const expanded = points ? current === points.length - 1 : undefined;

  return (
    <dialog
      ref={ref}
      data-placement="bottom"
      className={cx("k-dialog k-dialog--bottom k-sheet", points && "k-sheet--snap", className)}
      style={style}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-desc` : undefined}
      onClose={() => {
        if (ref.current) ref.current.style.translate = "";
        if (open) onOpenChange(false);
        restoreFocus();
      }}
      onCancel={(e) => {
        e.preventDefault();
        onOpenChange(false);
      }}
      onClick={(e) => {
        if (dismissible && e.target === ref.current) onOpenChange(false);
      }}
    >
      <div className="k-sheet__grab" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        {points ? (
          <button
            type="button"
            className="k-sheet__handle"
            aria-label={expanded ? M.sheet.collapse : M.sheet.expand}
            aria-expanded={expanded}
            onClick={() => setSnap(expanded ? 0 : current + 1)}
            onKeyDown={onHandleKey}
          />
        ) : (
          <span className="k-sheet__handle" aria-hidden="true" />
        )}
        <div className={cx("k-dialog__header k-sheet__header", hideTitle && !showClose && "k-sheet__header--hidden")}>
          <div className={cx("k-dialog__heading", hideTitle && "k-sr-only")}>
            <h2 className="k-dialog__title" id={`${id}-title`}>{title}</h2>
            {description && <p className="k-dialog__description" id={`${id}-desc`}>{description}</p>}
          </div>
          {showClose && (
            <button type="button" className="k-btn k-btn--tertiary k-btn--icon k-btn--sm k-dialog__close" aria-label={closeLabel} onClick={() => onOpenChange(false)}>
              <CloseIcon />
            </button>
          )}
        </div>
      </div>
      <div className="k-dialog__body k-sheet__body">{children}</div>
      {footer && <div className="k-dialog__footer k-sheet__footer">{footer}</div>}
    </dialog>
  );
}
