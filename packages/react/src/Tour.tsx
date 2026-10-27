import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { toFaDigits } from "@kashi-ui/persian";

export interface TourStep {
  /** CSS selector عنصری که این مرحله دربارهٔ آن است، مثل "#export-btn" */
  target: string;
  title: ReactNode;
  content: ReactNode;
}

export interface TourProps {
  steps: TourStep[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** پس از آخرین مرحله */
  onFinish?: () => void;
  labels?: { next?: string; prev?: string; done?: string; skip?: string; step?: (n: number, total: number) => string };
}

/**
 * راهنمای قدم‌به‌قدم برای آشنایی با محصول: بخش هر مرحله روشن و بقیه کم‌رنگ می‌شود.
 * Esc می‌بندد، ←→ بین مرحله‌ها و فوکوس پس از پایان به جای قبلی برمی‌گردد.
 */
export function Tour({ steps, open, onOpenChange, onFinish, labels = {} }: TourProps) {
  const id = useId();
  const { next = "بعدی", prev = "قبلی", done = "تمام", skip = "رد کردن", step: stepLabel = (n, t) => `مرحلهٔ ${toFaDigits(n)} از ${toFaDigits(t)}` } = labels;
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const [cardPos, setCardPos] = useState({ top: 0, left: 0 });
  const returnTo = useRef<HTMLElement | null>(null);
  const s = steps[i];

  useEffect(() => {
    if (open) {
      returnTo.current = document.activeElement as HTMLElement;
      setI(0);
    } else returnTo.current?.focus?.();
  }, [open]);

  // جای عنصر هدف را دنبال می‌کند
  useLayoutEffect(() => {
    if (!open || !s) return;
    const el = document.querySelector<HTMLElement>(s.target);
    if (!el) return setRect(null);
    el.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    const update = () => setRect(el.getBoundingClientRect());
    update();
    const t = setTimeout(update, 400);
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => {
      clearTimeout(t);
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, [open, i, s?.target]);

  // کارت زیر عنصر، یا بالای آن اگر جا نباشد
  useLayoutEffect(() => {
    if (!open || !card.current) return;
    const c = card.current.getBoundingClientRect();
    if (!rect) return setCardPos({ top: innerHeight / 2 - c.height / 2, left: innerWidth / 2 - c.width / 2 });
    const below = rect.bottom + 12 + c.height < innerHeight;
    const top = below ? rect.bottom + 12 : Math.max(12, rect.top - 12 - c.height);
    const left = Math.min(innerWidth - c.width - 12, Math.max(12, rect.left + rect.width / 2 - c.width / 2));
    setCardPos({ top, left });
    card.current.focus({ preventScroll: true });
  }, [rect, open, i]);

  if (!open || !s) return null;
  const last = i === steps.length - 1;
  const finish = () => {
    onOpenChange(false);
    onFinish?.();
  };
  return (
    <>
      {rect && <div className="k-tour__spot" aria-hidden="true" style={{ top: rect.top - 6, left: rect.left - 6, inlineSize: rect.width + 12, blockSize: rect.height + 12 }} />}
      <div
        ref={card}
        className="k-tour__card"
        role="dialog"
        aria-modal="false"
        aria-labelledby={`${id}-t`}
        aria-describedby={`${id}-b`}
        tabIndex={-1}
        style={{ top: cardPos.top, left: cardPos.left }}
        onKeyDown={(e) => {
          if (e.key === "Escape") onOpenChange(false);
          const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
          if (e.key === (rtl ? "ArrowLeft" : "ArrowRight") && !last) setI(i + 1);
          if (e.key === (rtl ? "ArrowRight" : "ArrowLeft") && i > 0) setI(i - 1);
        }}
      >
        <span className="k-tour__step">{stepLabel(i + 1, steps.length)}</span>
        <p className="k-tour__title" id={`${id}-t`}>{s.title}</p>
        <p className="k-tour__body" id={`${id}-b`}>{s.content}</p>
        <div className="k-tour__actions">
          <button type="button" className="k-btn k-btn--link k-tour__skip" onClick={() => onOpenChange(false)}>{skip}</button>
          <span className="k-tour__progress" aria-hidden="true">{steps.map((_, k) => <span key={k} data-on={k <= i ? "" : undefined} />)}</span>
          {i > 0 && <button type="button" className="k-btn k-btn--secondary k-btn--sm" onClick={() => setI(i - 1)}>{prev}</button>}
          <button type="button" className="k-btn k-btn--primary k-btn--sm" onClick={() => (last ? finish() : setI(i + 1))}>{last ? done : next}</button>
        </div>
      </div>
    </>
  );
}
