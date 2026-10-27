import type { HTMLAttributes } from "react";
import { cx } from "./cx.js";

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** نام گروه برای صفحه‌خوان */
  "aria-label"?: string;
}

/** دکمه‌های چسبیده به هم، مثل «قبلی / امروز / بعدی» یا ابزار قالب‌بندی */
export function ButtonGroup({ className, ...rest }: ButtonGroupProps) {
  return <div role="group" className={cx("k-btn-group", className)} {...rest} />;
}
