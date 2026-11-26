"use client";

import { forwardRef, useEffect, useId, useRef, type InputHTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { cx } from "./cx.js";
import { mergeRefs } from "./utils.js";

export interface CheckClassNames { root?: string; control?: string; label?: string; description?: string }

interface CheckOwnProps {
  /** «start»: برچسب پیش از کنترل و کشیده تا انتهای ردیف (مثل صفحهٔ تنظیمات) @default "end" */
  labelPosition?: "start" | "end";
  classNames?: CheckClassNames;
  /** برچسب کنار کنترل */
  label?: ReactNode;
  /** توضیح زیر برچسب */
  description?: ReactNode;
  /** حالت خطا */
  invalid?: boolean;
  /** فقط‌خواندنی: وضعیت دیده و با فرم ارسال می‌شود ولی با کلیک یا صفحه‌کلید عوض نمی‌شود (برخلاف disabled، کم‌رنگ نمی‌شود) */
  readOnly?: boolean;
}

export interface CheckboxProps extends CheckOwnProps, Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** حالت نیمه‌انتخاب (مثلاً برای «انتخاب همه») */
  indeterminate?: boolean;
  /** @default "md" */
  size?: "md" | "lg";
}

/** فقط‌خواندنی: کلیک و فاصله تیک را عوض نمی‌کنند؛ checkbox بومی readonly را نادیده می‌گیرد */
const readOnlyProps = (readOnly: boolean | undefined, onClick?: InputHTMLAttributes<HTMLInputElement>["onClick"]) =>
  readOnly ? { "aria-readonly": true as const, onClick: (e: MouseEvent<HTMLInputElement>) => { e.preventDefault(); onClick?.(e); } } : { onClick };

/** برچسب و توضیح مشترک بین Checkbox و Switch */
function CheckLabel({ id, label, description, className, classNames = {}, labelPosition = "end", readOnly, children }: { id: string; label?: ReactNode; description?: ReactNode; className?: string; classNames?: CheckClassNames; labelPosition?: "start" | "end"; readOnly?: boolean; children: ReactNode }) {
  if (!label && !description) return <>{children}</>;
  return (
    <label className={cx("k-check", labelPosition === "start" && "k-check--start", className, classNames.root)} htmlFor={id} data-readonly={readOnly || undefined}>
      {children}
      <span className="k-check__text">
        {label && <span className={cx("k-check__label", classNames.label)}>{label}</span>}
        {description && <span className={cx("k-check__description", classNames.description)} id={`${id}-desc`}>{description}</span>}
      </span>
    </label>
  );
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, invalid, indeterminate = false, size = "md", id, className, classNames, labelPosition, readOnly, onClick, ...rest },
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
    <CheckLabel id={inputId} label={label} description={description} className={className} classNames={classNames} labelPosition={labelPosition} readOnly={readOnly}>
      <input
        ref={mergeRefs(ref, inner)}
        type="checkbox"
        id={inputId}
        className={cx("k-checkbox", size === "lg" && "k-checkbox--lg", !label && !description && className, classNames?.control)}
        aria-invalid={invalid || undefined}
        aria-describedby={description ? `${inputId}-desc` : undefined}
        // برای رندر سمت سرور: اسکریپت صفحه می‌تواند indeterminate را پیش از hydrate تنظیم کند
        data-indeterminate={indeterminate || undefined}
        {...readOnlyProps(readOnly, onClick)}
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
  { label, description, invalid, size = "md", id, className, classNames, labelPosition, readOnly, onClick, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <CheckLabel id={inputId} label={label} description={description} className={className} classNames={classNames} labelPosition={labelPosition} readOnly={readOnly}>
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        id={inputId}
        className={cx("k-switch", size !== "md" && `k-switch--${size}`, !label && !description && className, classNames?.control)}
        aria-invalid={invalid || undefined}
        aria-describedby={description ? `${inputId}-desc` : undefined}
        {...readOnlyProps(readOnly, onClick)}
        {...rest}
      />
    </CheckLabel>
  );
});
