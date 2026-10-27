import { cloneElement, isValidElement, useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from "react";
import { cx } from "./cx.js";

export interface PopoverProps {
  /** دکمه‌ای که پنجره را باز می‌کند */
  trigger: ReactElement;
  title?: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** @default "bottom-start" */
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  /** نام پنجره اگر title ندارد */
  "aria-label"?: string;
  className?: string;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * پنجرهٔ شناور غیرمودال کنار یک دکمه؛ برای فرم کوتاه، فیلتر یا توضیح.
 * فوکوس به داخل می‌رود، Esc و کلیک بیرون می‌بندد و فوکوس به دکمه برمی‌گردد.
 */
export function Popover({ trigger, title, children, open, onOpenChange, placement = "bottom-start", "aria-label": ariaLabel, className }: PopoverProps) {
  const id = useId();
  const [inner, setInner] = useState(false);
  const isOpen = open ?? inner;
  const anchor = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  const set = (v: boolean, focusTrigger = false) => {
    if (open === undefined) setInner(v);
    onOpenChange?.(v);
    if (!v && focusTrigger) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;
    const p = panel.current;
    (p?.querySelector<HTMLElement>(FOCUSABLE) ?? p)?.focus();
    const onDown = (e: PointerEvent) => {
      if (!anchor.current?.contains(e.target as Node)) set(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [isOpen]);

  const t = isValidElement<Record<string, unknown>>(trigger)
    ? cloneElement(trigger, {
        ref: triggerRef,
        "aria-haspopup": "dialog",
        "aria-expanded": isOpen,
        "aria-controls": isOpen ? `${id}-panel` : undefined,
        onClick: (e: unknown) => {
          (trigger.props.onClick as ((e: unknown) => void) | undefined)?.(e);
          set(!isOpen);
        },
      })
    : trigger;

  const [side, align] = placement.split("-");
  return (
    <span className="k-popover-anchor" ref={anchor}>
      {t}
      <div
        ref={panel}
        id={`${id}-panel`}
        role="dialog"
        aria-labelledby={title ? `${id}-title` : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        hidden={!isOpen}
        className={cx("k-popover", side === "top" && "k-popover--top", align === "end" && "k-popover--end", className)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            set(false, true);
          }
        }}
        onBlur={(e) => {
          const next = e.relatedTarget as Node | null;
          if (next && !anchor.current?.contains(next)) set(false);
        }}
      >
        {title && <p className="k-popover__title" id={`${id}-title`}>{title}</p>}
        <div className="k-popover__body">{children}</div>
      </div>
    </span>
  );
}
