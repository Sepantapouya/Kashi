import { useEffect, useId, useRef, type ReactNode } from "react";
import { cx } from "./cx.js";
import { CloseIcon } from "./icons.js";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** آیکون شاخص بالای عنوان */
  icon?: ReactNode;
  /** «danger» برای تأیید عملیات مخرب */
  tone?: "default" | "danger";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** دکمه‌های پایین پنجره */
  footer?: ReactNode;
  /** بستن با کلیک روی پس‌زمینه @default true */
  dismissible?: boolean;
  /** @default "بستن" */
  closeLabel?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * پنجرهٔ گفتگو روی <dialog> بومی با showModal:
 * فوکوس داخل پنجره می‌ماند، Esc می‌بندد، بقیهٔ صفحه از دسترس صفحه‌خوان خارج می‌شود
 * و پس از بستن، فوکوس به عنصری که پنجره را باز کرده برمی‌گردد.
 */
export function Dialog({
  open, onOpenChange, title, description, icon, tone = "default", size = "md", footer, dismissible = true,
  closeLabel = "بستن", className, children,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);
  const id = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement;
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cx("k-dialog", size !== "md" && `k-dialog--${size}`, tone === "danger" && "k-dialog--danger", className)}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-desc` : undefined}
      onClose={() => {
        onOpenChange(false);
        (opener.current as HTMLElement | null)?.focus?.();
      }}
      onCancel={(e) => {
        // Esc: بستن از طریق state تا والد همگام بماند
        e.preventDefault();
        onOpenChange(false);
      }}
      onClick={(e) => {
        // کلیک روی خود <dialog> یعنی کلیک روی پس‌زمینه
        if (dismissible && e.target === ref.current) onOpenChange(false);
      }}
    >
      <div className="k-dialog__header">
        {icon && <span className="k-dialog__icon" aria-hidden="true">{icon}</span>}
        <div className="k-dialog__heading">
          <h2 className="k-dialog__title" id={`${id}-title`}>{title}</h2>
          {description && <p className="k-dialog__description" id={`${id}-desc`}>{description}</p>}
        </div>
        <button type="button" className="k-btn k-btn--tertiary k-btn--icon k-btn--sm k-dialog__close" aria-label={closeLabel} onClick={() => onOpenChange(false)}>
          <CloseIcon />
        </button>
      </div>
      {children && <div className="k-dialog__body">{children}</div>}
      {footer && <div className="k-dialog__footer">{footer}</div>}
    </dialog>
  );
}
