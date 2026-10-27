import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { toFaDigits } from "@kashi-ui/persian";
import { Field } from "./Field.js";
import { cx } from "./cx.js";

export interface ColorPickerProps {
  label?: ReactNode;
  hint?: ReactNode;
  /** رنگ hex، مثل "#0fa89b" */
  value?: string;
  defaultValue?: string;
  onChange?: (hex: string) => void;
  /** رنگ‌های پیشنهادی؛ [] برای حذف */
  swatches?: { name: string; value: string }[];
  /** نمایش کنتراست با متن سفید و مشکی @default true */
  showContrast?: boolean;
  name?: string;
  id?: string;
  className?: string;
}

const DEFAULT_SWATCHES = [
  { name: "فیروزه‌ای", value: "#0b8077" },
  { name: "لاجوردی", value: "#2740ed" },
  { name: "بنفش", value: "#7c3aed" },
  { name: "اناری", value: "#e51d2a" },
  { name: "زعفرانی", value: "#dd5e02" },
  { name: "پسته‌ای", value: "#518b25" },
  { name: "شب", value: "#2a2f3d" },
];

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
const norm = (v: string) => {
  const m = v.trim().match(HEX);
  if (!m) return null;
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join("") : m[1];
  return `#${h.toLowerCase()}`;
};
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
/** نسبت کنتراست WCAG */
export const contrastRatio = (a: string, b: string) => {
  a = norm(a) ?? a;
  b = norm(b) ?? b;
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const Check = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 10.5 3.2 3L15 7" /></svg>;

/** انتخاب رنگ برند یا برچسب: نمونه‌رنگ‌ها، کد hex و انتخابگر بومی، با کنتراست متن روی آن */
export function ColorPicker({ label, hint, value, defaultValue = "#0b8077", onChange, swatches = DEFAULT_SWATCHES, showContrast = true, name, id, className }: ColorPickerProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [inner, setInner] = useState(norm(defaultValue) ?? "#000000");
  const current = norm(value ?? "") ?? inner;
  const [text, setText] = useState<string | null>(null);
  const set = (hex: string) => {
    if (value === undefined) setInner(hex);
    setText(null);
    onChange?.(hex);
  };
  const white = contrastRatio(current, "#ffffff"), black = contrastRatio(current, "#000000");
  const ink = white >= black ? "#ffffff" : "#000000";
  const fmt = (r: number) => toFaDigits((Math.round(r * 10) / 10).toFixed(1)).replace(".", "٫");
  const invalid = text !== null && !norm(text);
  return (
    <Field id={`${fieldId}-hex`} label={label} hint={hint} error={invalid ? "کد رنگ معتبر نیست؛ مثل ‎#0fa89b‎ وارد کنید." : undefined} className={className}>
      <div className="k-color" style={{ "--_sw": current, "--_ink": ink } as CSSProperties}>
        {swatches.length > 0 && (
          <div className="k-color__swatches" role="radiogroup" aria-label="رنگ‌های پیشنهادی">
            {swatches.map((s) => (
              <label key={s.value} className="k-color__swatch" style={{ "--_sw": s.value, "--_ink": contrastRatio(s.value, "#ffffff") >= 3 ? "#fff" : "#000" } as CSSProperties} title={s.name}>
                <input type="radio" className="k-sr-only" name={`${fieldId}-sw`} checked={norm(s.value) === current} aria-label={s.name} onChange={() => set(norm(s.value)!)} />
                <Check />
              </label>
            ))}
          </div>
        )}
        <div className="k-color__row">
          <label className="k-color__preview" title="انتخاب رنگ دلخواه">
            <span className="k-sr-only">انتخاب رنگ دلخواه</span>
            <input type="color" value={current} onChange={(e) => set(e.target.value)} />
          </label>
          <div className="k-input" data-state={invalid ? "invalid" : undefined}>
            <input
              id={`${fieldId}-hex`}
              className="k-input__control"
              dir="ltr"
              spellCheck={false}
              autoComplete="off"
              value={text ?? current}
              aria-invalid={invalid || undefined}
              onChange={(e) => {
                setText(e.target.value);
                const h = norm(e.target.value);
                if (h) {
                  if (value === undefined) setInner(h);
                  onChange?.(h);
                }
              }}
              onBlur={() => !invalid && setText(null)}
            />
          </div>
        </div>
        {showContrast && (
          <p className="k-color__contrast" aria-live="polite">
            <span className="k-color__sample">متن نمونه</span>
            <span>کنتراست با متن {ink === "#ffffff" ? "سفید" : "مشکی"}: {fmt(Math.max(white, black))} به ۱ {Math.max(white, black) >= 4.5 ? "(AA)" : "(کمتر از AA)"}</span>
          </p>
        )}
        {name && <input type="hidden" name={name} value={current} />}
      </div>
    </Field>
  );
}
