"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx.js";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /** متن وسط خط، مثل «یا» */
  label?: ReactNode;
  vertical?: boolean;
}

export function Divider({ label, vertical, className, ...rest }: DividerProps) {
  return (
    <div role="separator" aria-orientation={vertical ? "vertical" : undefined} className={cx("k-divider", vertical && "k-divider--vertical", className)} {...rest}>
      {label && <span>{label}</span>}
    </div>
  );
}

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  /** چند کلید، مثل ["Ctrl", "K"] */
  keys?: string[];
}

/** کلید صفحه‌کلید */
export function Kbd({ keys, children, className, ...rest }: KbdProps) {
  if (keys) {
    return (
      <span className={cx("k-kbd-combo", className)} {...rest}>
        {keys.map((k, i) => <kbd key={i} className="k-kbd">{k}</kbd>)}
      </span>
    );
  }
  return <kbd className={cx("k-kbd", className)} {...rest}>{children}</kbd>;
}
