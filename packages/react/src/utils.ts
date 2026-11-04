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
