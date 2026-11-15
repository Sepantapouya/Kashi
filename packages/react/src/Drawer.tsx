"use client";

import { useId, useRef, type ReactNode } from "react";
import { cx } from "./cx.js";
import { CloseIcon } from "./icons.js";
import { useKashi } from "./KashiProvider.js";
import { useModalDialog } from "./modal.js";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** سمت باز شدن؛ در RTL «start» سمت راست است @default "end" */
  side?: "start" | "end";
  /** پهنا: sm ۲۰، md ۲۶، lg ۳۶ رم؛ full تمام صفحه @default "md" */
  size?: "sm" | "md" | "lg" | "full";
  /** دکمه‌های پایین کشو؛ همیشه دیده می‌شوند و محتوا زیرشان اسکرول می‌خورد */
  footer?: ReactNode;
  /** بستن با کلیک روی پس‌زمینه @default true */
  dismissible?: boolean;
  /** @default "بستن" */
  closeLabel?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * کشوی کناری روی <dialog> بومی: فیلترها، جزئیات یک ردیف، تنظیمات یا منوی گوشی.
 * فوکوس داخل کشو می‌ماند، Esc می‌بندد و با انیمیشن خروج بسته می‌شود.
 */
export function Drawer({
  open, onOpenChange, title, description, side = "end", size = "md", footer, dismissible = true, closeLabel, className, children,
}: DrawerProps) {
  const { messages: M } = useKashi();
  closeLabel ??= M.common.close;
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const { restoreFocus } = useModalDialog(ref, open);

  return (
    <dialog
      ref={ref}
      data-placement={side}
      className={cx("k-dialog k-drawer", `k-dialog--${side}`, size !== "md" && `k-drawer--${size}`, className)}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-desc` : undefined}
      onClose={() => {
        if (open) onOpenChange(false);
        restoreFocus();
      }}
      onCancel={(e) => {
        e.preventDefault();
        onOpenChange(false);
      }}
      onClick={(e) => {
        if (dismissible && e.target === ref.current) onOpenChange(false);
      }}
    >
      <div className="k-dialog__header k-drawer__header">
        <div className="k-dialog__heading">
          <h2 className="k-dialog__title" id={`${id}-title`}>{title}</h2>
          {description && <p className="k-dialog__description" id={`${id}-desc`}>{description}</p>}
        </div>
        <button type="button" className="k-btn k-btn--tertiary k-btn--icon k-btn--sm k-dialog__close" aria-label={closeLabel} onClick={() => onOpenChange(false)}>
          <CloseIcon />
        </button>
      </div>
      <div className="k-dialog__body k-drawer__body">{children}</div>
      {footer && <div className="k-dialog__footer k-drawer__footer">{footer}</div>}
    </dialog>
  );
}
