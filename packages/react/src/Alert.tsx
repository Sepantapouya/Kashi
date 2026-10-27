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
  /** «banner»: تمام‌عرض بالای صفحه، بدون گوشهٔ گرد @default "card" */
  layout?: "card" | "banner";
  /** «sm»: فشرده، مناسب داخل فرم‌ها @default "md" */
  size?: "sm" | "md";
  classNames?: { root?: string; icon?: string; title?: string; description?: string; actions?: string };
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
  { tone = "neutral", title, icon, actions, onClose, closeLabel = "بستن", tinted = false, layout = "card", size = "md", classNames = {}, role, className, children, ...rest },
  ref,
) {
  const Icon = ICONS[tone];
  return (
    <div
      ref={ref}
      // خطا و هشدار فوراً خوانده می‌شوند؛ بقیه مؤدبانه
      role={role ?? (tone === "error" || tone === "warning" ? "alert" : "status")}
      data-tone={tone}
      className={cx("k-alert", tone !== "neutral" && `k-alert--${tone}`, tinted && "k-alert--tinted", layout === "banner" && "k-alert--banner", size === "sm" && "k-alert--sm", className, classNames.root)}
      {...rest}
    >
      {icon !== false && <span className={cx("k-alert__icon", classNames.icon)} aria-hidden="true">{icon ?? <Icon />}</span>}
      <div className="k-alert__content">
        {title && <p className={cx("k-alert__title", classNames.title)}>{title}</p>}
        {children && <div className={cx("k-alert__description", classNames.description)}>{children}</div>}
        {actions && <div className={cx("k-alert__actions", classNames.actions)}>{actions}</div>}
      </div>
      {onClose && (
        <button type="button" className="k-btn k-btn--tertiary k-btn--icon k-btn--sm k-alert__close" aria-label={closeLabel} onClick={onClose}>
          <CloseIcon />
        </button>
      )}
    </div>
  );
});
