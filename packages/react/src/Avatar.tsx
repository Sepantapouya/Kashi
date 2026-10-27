import { Children, forwardRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx.js";
import { toFaDigits } from "./utils.js";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AvatarStatus = "online" | "offline" | "busy" | "away";

const STATUS_LABEL: Record<AvatarStatus, string> = {
  online: "آنلاین",
  offline: "آفلاین",
  busy: "مشغول",
  away: "غایب",
};

/** حروف اول دو کلمهٔ اول؛ با نیم‌فاصله تا حروف فارسی به هم نچسبند */
export function initials(name: string, max = 2): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, max)
    .map((w) => w[0])
    .join("‌")
    .toUpperCase();
}

const TONES = ["brand", "info", "success", "warning", "error"] as const;

/** رنگ ثابت از روی نام؛ یکسان در هر بار و هر دستگاه */
export function autoTone(name: string): (typeof TONES)[number] {
  let h = 0;
  for (const ch of name.trim()) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return TONES[h % TONES.length];
}

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** نام شخص — برای alt تصویر و حروف اول جایگزین */
  name: string;
  src?: string;
  /** @default "md" */
  size?: AvatarSize;
  square?: boolean;
  /** رنگ برند برای حالت حروف اول */
  brand?: boolean;
  /** «auto»: رنگ ثابت از روی نام (هر شخص همیشه یک رنگ)، یا یکی از رنگ‌ها */
  color?: "auto" | "neutral" | "brand" | "info" | "success" | "warning" | "error";
  status?: AvatarStatus;
  /** برچسب‌های وضعیت برای صفحه‌خوان (پیش‌فرض فارسی) */
  statusLabels?: Partial<Record<AvatarStatus, string>>;
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name, src, size = "md", square = false, brand = false, color, status, statusLabels, className, ...rest },
  ref,
) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;
  const tone = color === "auto" ? autoTone(name) : color ?? (brand ? "brand" : "neutral");
  const statusText = status ? (statusLabels?.[status] ?? STATUS_LABEL[status]) : undefined;
  return (
    <span
      ref={ref}
      role="img"
      aria-label={statusText ? `${name}، ${statusText}` : name}
      data-tone={tone}
      className={cx("k-avatar", size !== "md" && `k-avatar--${size}`, square && "k-avatar--square", tone !== "neutral" && `k-avatar--${tone}`, className)}
      {...rest}
    >
      {showImage ? (
        <img className="k-avatar__image" src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{initials(name, size === "xs" || size === "sm" ? 1 : 2)}</span>
      )}
      {status && <span className={`k-avatar__status k-avatar__status--${status}`} aria-hidden="true" />}
    </span>
  );
});

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** حداکثر تعداد نمایش؛ بقیه به شکل «+۳» */
  max?: number;
  /** اندازهٔ آواتار «+n» @default "md" */
  size?: AvatarSize;
  /** @default (n) => `${n} نفر دیگر` */
  moreLabel?: (count: number) => string;
  children: ReactNode;
}

export function AvatarGroup({ max, size = "md", moreLabel = (n) => `${toFaDigits(n)} نفر دیگر`, className, children, ...rest }: AvatarGroupProps) {
  const items = Children.toArray(children);
  const visible = max ? items.slice(0, max) : items;
  const extra = items.length - visible.length;
  return (
    <div role="group" className={cx("k-avatar-group", className)} {...rest}>
      {visible}
      {extra > 0 && (
        <span role="img" aria-label={moreLabel(extra)} className={cx("k-avatar", size !== "md" && `k-avatar--${size}`)}>
          <span aria-hidden="true">+{toFaDigits(extra)}</span>
        </span>
      )}
    </div>
  );
}
