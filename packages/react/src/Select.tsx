import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { cx } from "./cx.js";
import { Field, describedBy } from "./Field.js";

export interface SelectOption { value: string; label: ReactNode; disabled?: boolean }

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** گزینهٔ خالی اول، مثل «انتخاب کنید» */
  placeholder?: string;
  /** گزینه‌ها؛ یا به‌جای آن <option> را به‌عنوان children بدهید */
  options?: SelectOption[];
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  fieldClassName?: string;
}

/** فهرست انتخابی روی <select> بومی: در گوشی انتخاب‌گر سیستم باز می‌شود و صفحه‌خوان کامل پشتیبانی می‌کند */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, placeholder, options, size = "md", id, required, className, fieldClassName, children, "aria-describedby": extra, ...rest },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const placeholderSelected = placeholder !== undefined && rest.value === undefined && rest.defaultValue === undefined;
  return (
    <Field id={selectId} label={label} hint={hint} error={error} required={required} className={fieldClassName}>
      <div className={cx("k-select", size !== "md" && `k-select--${size}`, className)}>
        <select
          ref={ref}
          id={selectId}
          className="k-select__control"
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(selectId, hint, error, extra)}
          defaultValue={placeholderSelected ? "" : undefined}
          {...rest}
        >
          {placeholder !== undefined && <option value="" disabled>{placeholder}</option>}
          {options?.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
          ))}
          {children}
        </select>
      </div>
    </Field>
  );
});
