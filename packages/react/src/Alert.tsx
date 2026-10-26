import { forwardRef, type HTMLAttributes, type ReactElement, type ReactNode } from "react";
import { cx } from "./cx.js";
import { CloseIcon, ErrorIcon, InfoIcon, SuccessIcon, WarningIcon } from "./icons.js";

export type AlertTone = "neutral" | "brand" | "info" | "success" | "warning" | "error";

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** @default "neutral" */
  tone?: AlertTone;
  title?: ReactNode;
  /** آیکون سفارشی؛ false برای حذف */
  icon?: ReactNode | false;
  /** دکمه‌ها یا لینک‌های زیر متن */
  actions?: ReactNode;
  /** با دادن این تابع دکمهٔ بستن نمایش داده می‌شود */
  onClose?: () => void;
  /** @default "بستن" */
  closeLabel?: string;
  /** پس‌زمینهٔ رنگی کم‌رنگ */
  tinted?: boolean;
}

const ICONS: Record<AlertTone, () => ReactElement> = {
  neutral: InfoIcon,
  brand: InfoIcon,
  info: InfoIcon,
  success: SuccessIcon,
  warning: WarningIcon,
  error: ErrorIcon,
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { tone = "neutral", title, icon, actions, onClose, closeLabel = "بستن", tinted = false, role, className, children, ...rest },
  ref,
) {
  const Icon = ICONS[tone];
  return (
    <div
      ref={ref}
      // خطا و هشدار فوراً خوانده می‌شوند؛ بقیه مؤدبانه
      role={role ?? (tone === "error" || tone === "warning" ? "alert" : "status")}
      className={cx("k-alert", tone !== "neutral" && `k-alert--${tone}`, tinted && "k-alert--tinted", className)}
      {...rest}
    >
      {icon !== false && <span className="k-alert__icon" aria-hidden="true">{icon ?? <Icon />}</span>}
      <div className="k-alert__content">
        {title && <p className="k-alert__title">{title}</p>}
        {children && <div className="k-alert__description">{children}</div>}
        {actions && <div className="k-alert__actions">{actions}</div>}
      </div>
      {onClose && (
        <button type="button" className="k-btn k-btn--tertiary k-btn--icon k-btn--sm k-alert__close" aria-label={closeLabel} onClick={onClose}>
          <CloseIcon />
        </button>
      )}
    </div>
  );
});
