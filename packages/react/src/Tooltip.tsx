import { cloneElement, isValidElement, useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from "react";
import { cx } from "./cx.js";

export interface TooltipProps {
  /** متن راهنما؛ فقط توضیح تکمیلی، نه اطلاعات ضروری */
  content: ReactNode;
  /** عنصر فوکوس‌پذیر، معمولاً یک دکمه */
  children: ReactElement;
  /** «start»/«end» کنار عنصر؛ در RTL «start» سمت راست است @default "top" */
  placement?: "top" | "bottom" | "start" | "end";
  /** تأخیر نمایش با hover بر حسب میلی‌ثانیه @default 300 */
  delay?: number;
}

/**
 * راهنمای کوتاه طبق WCAG 1.4.13: با hover و فوکوس نمایش داده می‌شود، روی خودش هم hover پذیر است
 * و با Esc بسته می‌شود. با aria-describedby به عنصر متصل است.
 */
export function Tooltip({ content, children, placement = "top", delay = 300 }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const show = (wait: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), wait);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 100);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const child = isValidElement<{ "aria-describedby"?: string }>(children)
    ? cloneElement(children, {
        "aria-describedby": [children.props["aria-describedby"], id].filter(Boolean).join(" "),
      })
    : children;

  return (
    <span
      className="k-tooltip-anchor"
      onMouseEnter={() => show(delay)}
      onMouseLeave={hide}
      onFocus={() => show(0)}
      onBlur={hide}
    >
      {child}
      <span role="tooltip" id={id} className={cx("k-tooltip", placement !== "top" && `k-tooltip--${placement}`)} hidden={!open}>
        {content}
      </span>
    </span>
  );
}
