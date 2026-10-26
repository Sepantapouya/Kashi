import { forwardRef, useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx.js";
import { mergeRefs } from "./utils.js";

interface CheckOwnProps {
  /** برچسب کنار کنترل */
  label?: ReactNode;
  /** توضیح زیر برچسب */
  description?: ReactNode;
  /** حالت خطا */
  invalid?: boolean;
}

export interface CheckboxProps extends CheckOwnProps, Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** حالت نیمه‌انتخاب (مثلاً برای «انتخاب همه») */
  indeterminate?: boolean;
  /** @default "md" */
  size?: "md" | "lg";
}

/** برچسب و توضیح مشترک بین Checkbox و Switch */
function CheckLabel({ id, label, description, className, children }: { id: string; label?: ReactNode; description?: ReactNode; className?: string; children: ReactNode }) {
  if (!label && !description) return <>{children}</>;
  return (
    <label className={cx("k-check", className)} htmlFor={id}>
      {children}
      <span className="k-check__text">
        {label && <span className="k-check__label">{label}</span>}
        {description && <span className="k-check__description" id={`${id}-desc`}>{description}</span>}
      </span>
    </label>
  );
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, invalid, indeterminate = false, size = "md", id, className, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const inner = useRef<HTMLInputElement>(null);
  // indeterminate فقط از طریق DOM قابل‌تنظیم است
  useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <CheckLabel id={inputId} label={label} description={description} className={className}>
      <input
        ref={mergeRefs(ref, inner)}
        type="checkbox"
        id={inputId}
        className={cx("k-checkbox", size === "lg" && "k-checkbox--lg", !label && !description && className)}
        aria-invalid={invalid || undefined}
        aria-describedby={description ? `${inputId}-desc` : undefined}
        // برای رندر سمت سرور: اسکریپت صفحه می‌تواند indeterminate را پیش از hydrate تنظیم کند
        data-indeterminate={indeterminate || undefined}
        {...rest}
      />
    </CheckLabel>
  );
});

export interface SwitchProps extends CheckOwnProps, Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "role"> {
  /** @default "md" */
  size?: "sm" | "md" | "lg";
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, description, invalid, size = "md", id, className, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <CheckLabel id={inputId} label={label} description={description} className={className}>
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        id={inputId}
        className={cx("k-switch", size !== "md" && `k-switch--${size}`, !label && !description && className)}
        aria-invalid={invalid || undefined}
        aria-describedby={description ? `${inputId}-desc` : undefined}
        {...rest}
      />
    </CheckLabel>
  );
});
