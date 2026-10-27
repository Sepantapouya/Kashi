import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx.js";
import { CloseIcon } from "./icons.js";

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** @default "neutral" */
  tone?: "neutral" | "brand" | "warning" | "error";
  icon?: ReactNode;
  /** دکمه یا لینک‌ها */
  actions?: ReactNode;
  /** با onClose دکمهٔ بستن نمایش داده می‌شود */
  onClose?: () => void;
  /** بدون حاشیه و گوشه، برای بالای صفحه */
  flush?: boolean;
  /** @default "اطلاعیه" */
  label?: string;
  /** @default "بستن اطلاعیه" */
  closeLabel?: string;
  children: ReactNode;
}

/** نوار اطلاع‌رسانی سطح صفحه، مثل نسخهٔ جدید، پایان اشتراک یا اختلال سرویس */
export function Banner({ tone = "neutral", icon, actions, onClose, flush, label = "اطلاعیه", closeLabel = "بستن اطلاعیه", className, children, ...rest }: BannerProps) {
  return (
    <div role="region" aria-label={label} className={cx("k-banner", tone !== "neutral" && `k-banner--${tone}`, flush && "k-banner--flush", className)} {...rest}>
      {icon && <span className="k-banner__icon" aria-hidden="true">{icon}</span>}
      <p className="k-banner__text">{children}</p>
      {actions && <div className="k-banner__actions">{actions}</div>}
      {onClose && (
        <button type="button" className="k-btn k-btn--tertiary k-btn--icon k-btn--sm k-banner__close" aria-label={closeLabel} onClick={onClose}>
          <CloseIcon />
        </button>
      )}
    </div>
  );
}
