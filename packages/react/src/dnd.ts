"use client";

import { useRef, type RefObject } from "react";
import { useIsomorphicLayoutEffect } from "./utils.js";

const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * حرکت نرم موارد پس از جابه‌جایی (FLIP): جای قبلی هر [data-flip] را به خاطر می‌سپارد و
 * پس از هر تغییر ترتیب، از جای قبلی به جای تازه می‌لغزاندش. موردی که دستی کشیده می‌شود ([data-dragging]) حرکت نمی‌گیرد.
 */
export function useFlip(root: RefObject<HTMLElement | null>, key: unknown) {
  const last = useRef(new Map<string, DOMRect>());
  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-flip]"));
    const next = new Map<string, DOMRect>();
    for (const it of items) {
      const id = it.dataset.flip!;
      const prev = last.current.get(id);
      const style = it.style.translate;
      it.style.transition = "none";
      if (!it.hasAttribute("data-dragging")) it.style.translate = "";
      const rect = it.getBoundingClientRect();
      next.set(id, rect);
      if (!prev || it.hasAttribute("data-dragging") || reduced()) {
        if (it.hasAttribute("data-dragging")) it.style.translate = style;
        it.style.transition = "";
        continue;
      }
      const dx = prev.left - rect.left;
      const dy = prev.top - rect.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
        it.style.transition = "";
        continue;
      }
      it.style.translate = `${dx}px ${dy}px`;
      void it.offsetWidth;
      it.style.transition = "";
      it.style.translate = "";
    }
    last.current = next;
  }, [key]);
}

/** جهت صفحه برای کلیدهای چپ و راست */
export const isRtl = (el: Element | null) => !!el && getComputedStyle(el).direction === "rtl";

/** جابه‌جایی یک عضو آرایه */
export function move<T>(list: T[], from: number, to: number): T[] {
  const next = list.slice();
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}
