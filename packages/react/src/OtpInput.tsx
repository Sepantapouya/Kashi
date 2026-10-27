import { forwardRef, useId, useRef, useState, type ReactNode } from "react";
import { onlyDigits, toFaDigits } from "@kashi-ui/persian";
import { cx } from "./cx.js";
import { Field, describedBy } from "./Field.js";
import { mergeRefs } from "./utils.js";

export interface OtpInputProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** تعداد رقم @default 6 */
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (code: string) => void;
  /** وقتی همهٔ رقم‌ها وارد شد */
  onComplete?: (code: string) => void;
  /** @default "fa" */
  digits?: "fa" | "latin";
  /** خط فاصله بعد از این تعداد رقم، مثلاً 3 برای ۱۲۳-۴۵۶ */
  groupAfter?: number;
  size?: "sm" | "md";
  disabled?: boolean;
  autoFocus?: boolean;
  name?: string;
  id?: string;
  className?: string;
}

/**
 * کد تأیید یک‌بارمصرف: یک input واقعی (نه شش input جدا)، پس چسباندن، پاک کردن،
 * صفحه‌خوان و پر شدن خودکار کد پیامکی (autocomplete="one-time-code") بی‌نقص کار می‌کنند.
 */
export const OtpInput = forwardRef<HTMLInputElement, OtpInputProps>(function OtpInput(
  { label, hint, error, length = 6, value, defaultValue = "", onChange, onComplete, digits = "fa", groupAfter, size = "md", disabled, autoFocus, name, id, className },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [inner, setInner] = useState(() => onlyDigits(defaultValue).slice(0, length));
  const code = value !== undefined ? onlyDigits(value).slice(0, length) : inner;
  const [caret, setCaret] = useState(code.length);
  const inputRef = useRef<HTMLInputElement>(null);
  const d = (c: string) => (digits === "fa" ? toFaDigits(c) : c);
  const active = Math.min(caret, length - 1);

  const sync = () => setCaret(Math.min(inputRef.current?.selectionStart ?? code.length, length));

  return (
    <Field id={inputId} label={label} hint={hint} error={error} className={className}>
      <div className={cx("k-otp", size === "sm" && "k-otp--sm", !!error && "k-otp--invalid")} onClick={() => inputRef.current?.focus()}>
        <input
          ref={mergeRefs(ref, inputRef)}
          id={inputId}
          className="k-otp__input"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d*"
          maxLength={length * 2 /* ارقام فارسی و فاصله‌های چسبانده‌شده */}
          value={code}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, hint, error)}
          onChange={(e) => {
            const next = onlyDigits(e.target.value).slice(0, length);
            if (value === undefined) setInner(next);
            onChange?.(next);
            setCaret(next.length);
            if (next.length === length && next !== code) onComplete?.(next);
          }}
          onSelect={sync}
          onKeyUp={sync}
          onFocus={sync}
        />
        {Array.from({ length }, (_, i) => (
          <span key={i} style={{ display: "contents" }}>
            {groupAfter && i === groupAfter && <span className="k-otp__sep" aria-hidden="true" />}
            <span className="k-otp__slot" aria-hidden="true" data-filled={code[i] ? "" : undefined} data-active={i === active ? "" : undefined}>
              {code[i] ? d(code[i]) : ""}
            </span>
          </span>
        ))}
      </div>
      {name && <input type="hidden" name={name} value={code} />}
    </Field>
  );
});
