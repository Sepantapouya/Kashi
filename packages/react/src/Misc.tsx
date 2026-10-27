import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx.js";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /** متن وسط خط، مثل «یا» */
  label?: ReactNode;
  vertical?: boolean;
}

export function Divider({ label, vertical, className, ...rest }: DividerProps) {
  return (
    <div role="separator" aria-orientation={vertical ? "vertical" : undefined} className={cx("k-divider", vertical && "k-divider--vertical", className)} {...rest}>
      {label && <span>{label}</span>}
    </div>
  );
}

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  /** چند کلید، مثل ["Ctrl", "K"] */
  keys?: string[];
}

/** کلید صفحه‌کلید */
export function Kbd({ keys, children, className, ...rest }: KbdProps) {
  if (keys) {
    return (
      <span className={cx("k-kbd-combo", className)} {...rest}>
        {keys.map((k, i) => <kbd key={i} className="k-kbd">{k}</kbd>)}
      </span>
    );
  }
  return <kbd className={cx("k-kbd", className)} {...rest}>{children}</kbd>;
}

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  /** دکمه‌ها */
  actions?: ReactNode;
}

/** حالت خالی: وقتی داده‌ای برای نمایش نیست */
export function EmptyState({ title, description, icon, actions, className, ...rest }: EmptyStateProps) {
  return (
    <div className={cx("k-empty", className)} {...rest}>
      {icon && <span className="k-empty__icon" aria-hidden="true">{icon}</span>}
      <p className="k-empty__title">{title}</p>
      {description && <p className="k-empty__description">{description}</p>}
      {actions && <div className="k-empty__actions">{actions}</div>}
    </div>
  );
}
