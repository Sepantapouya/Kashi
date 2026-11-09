import { useEffect, useLayoutEffect, type Ref, type RefCallback } from "react";

export { toFaDigits } from "@kashi-ui/persian";

/** چند ref را یکی می‌کند */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as { current: T | null }).current = node;
    }
  };
}

export function isDev(): boolean {
  return typeof process !== "undefined" && process.env.NODE_ENV !== "production";
}

/** useLayoutEffect در مرورگر، useEffect در سرور؛ تا در Next.js و رندر سمت سرور هشدار ندهد */
export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const deprecations = new Set<string>();
/**
 * هشدار یک‌باره برای قابلیت منسوخ، فقط در حالت توسعه (سیاست تغییرات: /docs/versioning/).
 * deprecate("Button.kind", "prop ‏kind منسوخ است؛ از variant استفاده کنید. در ۲.۰ حذف می‌شود.")
 */
export function deprecate(id: string, message: string) {
  if (!isDev() || deprecations.has(id)) return;
  deprecations.add(id);
  console.warn(`[kashi] منسوخ: ${message}`);
}

export type TipPlacement = "top" | "bottom" | "start" | "end";

/**
 * راهنما را در لایهٔ بالایی مرورگر (Popover API) و با position: fixed کنار عنصر می‌گذارد تا overflow: hidden
 * هیچ والدی آن را نبرد. اگر سمت خواسته‌شده جا نداشته باشد، به سمت مقابل می‌رود و داخل صفحه می‌ماند.
 * در RTL «start» سمت راست است. مرورگر بدون Popover API همان position: fixed را می‌گیرد.
 */
export function placeTip(anchor: HTMLElement, tip: HTMLElement, placement: TipPlacement = "top") {
  const pop = tip as HTMLElement & { showPopover?: () => void };
  tip.setAttribute("data-placed", "");
  try {
    if (pop.showPopover && !tip.matches(":popover-open")) pop.showPopover();
  } catch { /* بدون پشتیبانی کامل Popover */ }
  const a = anchor.getBoundingClientRect();
  const t = tip.getBoundingClientRect();
  const rtl = getComputedStyle(anchor).direction === "rtl";
  const gap = 8, m = 8, W = document.documentElement.clientWidth || innerWidth, H = innerHeight;
  type Side = "top" | "bottom" | "left" | "right";
  let side: Side = placement === "top" || placement === "bottom" ? placement : (placement === "start") !== rtl ? "left" : "right";
  const room: Record<Side, number> = { top: a.top - gap - m, bottom: H - a.bottom - gap - m, left: a.left - gap - m, right: W - a.right - gap - m };
  const opposite: Record<Side, Side> = { top: "bottom", bottom: "top", left: "right", right: "left" };
  const need = side === "top" || side === "bottom" ? t.height : t.width;
  if (room[side] < need && room[opposite[side]] > room[side]) side = opposite[side];
  let x: number, y: number;
  if (side === "top" || side === "bottom") {
    x = Math.min(Math.max(a.left + a.width / 2 - t.width / 2, m), W - t.width - m);
    y = side === "top" ? a.top - gap - t.height : a.bottom + gap;
  } else {
    y = Math.min(Math.max(a.top + a.height / 2 - t.height / 2, m), H - t.height - m);
    x = side === "left" ? a.left - gap - t.width : a.right + gap;
  }
  tip.dataset.side = side;
  const px = (v: number) => `${Math.round(v)}px`;
  tip.style.setProperty("--_x", px(x));
  tip.style.setProperty("--_y", px(y));
  // پیکان رو به وسط عنصر، حتی وقتی راهنما برای ماندن در صفحه جابه‌جا شده است
  tip.style.setProperty("--_ax", px(Math.min(Math.max(a.left + a.width / 2 - x, 10), t.width - 10)));
  tip.style.setProperty("--_ay", px(Math.min(Math.max(a.top + a.height / 2 - y, 10), t.height - 10)));
}

export function unplaceTip(tip: HTMLElement) {
  const pop = tip as HTMLElement & { hidePopover?: () => void };
  try {
    if (pop.hidePopover && tip.matches(":popover-open")) pop.hidePopover();
  } catch { /* */ }
}
