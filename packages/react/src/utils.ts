import type { Ref, RefCallback } from "react";

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
