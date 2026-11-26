"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx.js";
import { useKashi } from "./KashiProvider.js";

export type EmptyStatePreset = "noData" | "noResults" | "error" | "offline" | "noAccess" | "done";

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** عنوان؛ با preset اختیاری است */
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  /** دکمه‌ها */
  actions?: ReactNode;
  /**
   * حالت آماده با آیکون، عنوان و توضیح پیش‌فرض (فارسی و انگلیسی)؛ هر کدام را با title، description یا icon عوض کنید.
   * noData خالی · noResults جستجو بی‌نتیجه · error خطای بارگذاری · offline بدون اینترنت · noAccess بدون دسترسی · done کار تمام شد
   */
  preset?: EmptyStatePreset;
  /** sm داخل جدول و منو، md پیش‌فرض، lg صفحهٔ کامل @default "md" */
  size?: "sm" | "md" | "lg";
  /** قاب خط‌چین؛ مناسب جای خالی داخل صفحه یا محل رها کردن فایل */
  bordered?: boolean;
}

const P = { viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
// آیکون‌ها از @kashi-ui/icons، کپی‌شده تا پکیج React به آن وابسته نشود
const ICONS: Record<EmptyStatePreset, ReactNode> = {
  noData: <svg {...P}><path d="M7.25 2.75h5.5c3.6 0 4.5.9 4.5 4.5v5.5c0 3.6-.9 4.5-4.5 4.5h-5.5c-3.6 0-4.5-.9-4.5-4.5v-5.5c0-3.6.9-4.5 4.5-4.5Z" /><path d="M2.75 10.75h3.1c.55 0 1 .3 1.25.75l.5.95c.25.45.7.75 1.25.75h2.3c.55 0 1-.3 1.25-.75l.5-.95c.25-.45.7-.75 1.25-.75h3.1" /></svg>,
  noResults: <svg {...P}><circle cx="9.1" cy="9.1" r="6.2" /><path d="m14.9 14.9 2.3 2.3M7.2 7.2l3.8 3.8M11 7.2l-3.8 3.8" /></svg>,
  error: <svg {...P}><path d="M8.33 3.9c.74-1.3 2.6-1.3 3.34 0l5.6 9.75c.74 1.3-.2 2.85-1.67 2.85H4.4c-1.48 0-2.41-1.56-1.67-2.85Z" /><path d="M10 7.9v3.1M10 13.6v.01" /></svg>,
  offline: <svg {...P}><path d="M2.75 7.6a10.5 10.5 0 0 1 14.5 0M5.2 10.3a7 7 0 0 1 9.6 0M7.7 12.95a3.5 3.5 0 0 1 4.6 0M10 15.75v.01" /><path d="m3 3 14 14" /></svg>,
  noAccess: <svg {...P}><path d="M7.25 8.25h5.5c2.6 0 3.25.65 3.25 3.25v2.75c0 2.6-.65 3.25-3.25 3.25h-5.5C4.65 17.5 4 16.85 4 14.25V11.5c0-2.6.65-3.25 3.25-3.25Z" /><path d="M6.9 8.3V6.4a3.1 3.1 0 0 1 6.2 0v1.9M10 11.6v2.2" /></svg>,
  done: <svg {...P}><circle cx="10" cy="10" r="7.25" /><path d="m6.75 10.1 2.2 2.2 4.3-4.5" /></svg>,
};

/** حالت خالی: وقتی داده‌ای برای نمایش نیست؛ بگویید چرا و قدم بعدی را پیشنهاد کنید */
export function EmptyState({ title, description, icon, actions, preset, size = "md", bordered, className, ...rest }: EmptyStateProps) {
  const { messages: M } = useKashi();
  const text = preset ? M.empty[preset] : undefined;
  title ??= text?.[0];
  description ??= text?.[1];
  icon ??= preset ? ICONS[preset] : undefined;
  return (
    <div
      className={cx("k-empty", size !== "md" && `k-empty--${size}`, bordered && "k-empty--bordered", className)}
      data-preset={preset}
      role={preset === "error" || preset === "offline" ? "status" : undefined}
      {...rest}
    >
      {icon && <span className="k-empty__icon" aria-hidden="true">{icon}</span>}
      {title && <p className="k-empty__title">{title}</p>}
      {description && <p className="k-empty__description">{description}</p>}
      {actions && <div className="k-empty__actions">{actions}</div>}
    </div>
  );
}
