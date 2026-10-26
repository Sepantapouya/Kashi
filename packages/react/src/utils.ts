import type { Ref, RefCallback } from "react";

/** ارقام لاتین را به فارسی تبدیل می‌کند: 12 → ۱۲ */
export function toFaDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

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
