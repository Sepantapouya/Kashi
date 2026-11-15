"use client";

import { useEffect, useRef, type RefObject } from "react";

const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * باز و بسته کردن <dialog> بومی با showModal و انیمیشن خروج:
 * هنگام بستن data-closing می‌گیرد، پایان انیمیشن را صبر می‌کند و بعد close() می‌شود؛
 * فوکوس به عنصری که پنجره را باز کرده برمی‌گردد. با «کاهش حرکت» فوراً بسته می‌شود.
 */
export function useModalDialog(ref: RefObject<HTMLDialogElement | null>, open: boolean) {
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open) {
      if (d.open && !d.hasAttribute("data-closing")) return;
      d.removeAttribute("data-closing");
      if (!d.open) {
        opener.current = document.activeElement;
        d.showModal();
      }
      return;
    }
    if (!d.open) return;
    // اول بسته شود، بعد نشانهٔ بستن برداشته شود؛ برعکسش یک فریم انیمیشن ورود را دوباره اجرا می‌کرد (پرش هنگام بستن)
    const finish = () => {
      if (d.open) d.close();
      d.removeAttribute("data-closing");
    };
    if (reduced()) return finish();
    d.setAttribute("data-closing", "");
    // پشتیبان: اگر انیمیشنی اجرا نشد (مثلاً در مرورگر قدیمی) باز هم بسته شود
    const t = setTimeout(finish, 320);
    const end = (e: AnimationEvent) => {
      // رویداد ::backdrop (کوتاه‌تر) و انیمیشن فرزندها را نادیده بگیر؛ فقط پایان حرکت خود پنجره
      if (e.target !== d || e.pseudoElement) return;
      clearTimeout(t);
      finish();
    };
    d.addEventListener("animationend", end, { once: true });
    return () => {
      clearTimeout(t);
      d.removeEventListener("animationend", end);
    };
  }, [open, ref]);

  /** پس از بسته شدن واقعی فراخوانده شود */
  const restoreFocus = () => (opener.current as HTMLElement | null)?.focus?.();
  return { restoreFocus };
}
