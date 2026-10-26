import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cx } from "./cx.js";
import { Field, describedBy } from "./Field.js";

export type InputSize = "sm" | "md" | "lg";

interface FieldOwnProps {
  /** برچسب بالای فیلد — اگر نمی‌دهید حتماً aria-label بدهید */
  label?: ReactNode;
  /** متن راهنمای زیر فیلد */
  hint?: ReactNode;
  /** پیام خطا؛ فیلد را aria-invalid می‌کند */
  error?: ReactNode;
  /** کلاس روی ظرف بیرونی (k-field) */
  fieldClassName?: string;
}

export interface InputProps extends FieldOwnProps, Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** @default "md" */
  size?: InputSize;
  /** آیکون یا متن ابتدای فیلد */
  addonStart?: ReactNode;
  /** آیکون یا متن انتهای فیلد */
  addonEnd?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, size = "md", addonStart, addonEnd, required, id, className, fieldClassName, "aria-describedby": ariaDescribedBy, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} className={fieldClassName}>
      <div className={cx("k-input", size !== "md" && `k-input--${size}`, className)}>
        {addonStart && <span className="k-input__addon">{addonStart}</span>}
        <input
          ref={ref}
          id={inputId}
          className="k-input__control"
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, hint, error, ariaDescribedBy)}
          {...rest}
        />
        {addonEnd && <span className="k-input__addon">{addonEnd}</span>}
      </div>
    </Field>
  );
});

export interface TextareaProps extends FieldOwnProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, required, id, className, fieldClassName, "aria-describedby": ariaDescribedBy, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} className={fieldClassName}>
      <div className={cx("k-input", "k-input--textarea", className)}>
        <textarea
          ref={ref}
          id={inputId}
          className="k-input__control"
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, hint, error, ariaDescribedBy)}
          {...rest}
        />
      </div>
    </Field>
  );
});
