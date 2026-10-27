import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
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

// تبدیل‌های رنگ برای پنل انتخاب
type HSV = { h: number; s: number; v: number };
const hexToRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
const rgbToHex = (r: number, g: number, b: number) => `#${[r, g, b].map((n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0")).join("")}`;
function hexToHsv(hex: string): HSV {
  const [r, g, b] = hexToRgb(hex).map((n) => n / 255);
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}
function hsvToHex({ h, s, v }: HSV) {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
  };
  return rgbToHex(f(5), f(3), f(1));
}

const Dropper = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m11 5 4 4M13.5 2.5a2.1 2.1 0 0 1 3 3L15 7 13 5ZM12 6l-7.5 7.5L3 17l3.5-1.5L14 8" /></svg>;

/** پنل انتخاب رنگ: سطح اشباع و روشنایی، نوار رنگ‌مایه، قطره‌چکان و کدها */
function ColorPanel({ hex, onChange, onClose }: { hex: string; onChange: (hex: string) => void; onClose: () => void }) {
  const [hsv, setHsv] = useState(() => hexToHsv(hex));
  const area = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  // تغییر از بیرون (نمونه‌رنگ یا فیلد hex) رنگ‌مایه را حفظ می‌کند وقتی رنگ خاکستری است
  useEffect(() => {
    if (hsvToHex(hsv) !== hex) setHsv((p) => { const n = hexToHsv(hex); return n.s === 0 ? { ...n, h: p.h } : n; });
  }, [hex]);
  useEffect(() => {
    area.current?.focus({ preventScroll: true });
    const onDown = (e: globalThis.PointerEvent) => !panel.current?.parentElement?.contains(e.target as Node) && onClose();
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);
  const apply = (n: HSV) => {
    setHsv(n);
    onChange(hsvToHex(n));
  };
  const fromPointer = (e: PointerEvent) => {
    const r = area.current!.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    apply({ ...hsv, s: x, v: 1 - y });
  };
  const onAreaKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.01;
    const k: Record<string, Partial<HSV>> = {
      ArrowLeft: { s: Math.max(0, hsv.s - step) }, ArrowRight: { s: Math.min(1, hsv.s + step) },
      ArrowUp: { v: Math.min(1, hsv.v + step) }, ArrowDown: { v: Math.max(0, hsv.v - step) },
    };
    if (k[e.key]) {
      e.preventDefault();
      apply({ ...hsv, ...k[e.key] });
    }
  };
  const [r, g, b] = hexToRgb(hex);
  const pct = (n: number) => `${toFaDigits(Math.round(n * 100))}٪`;
  const eye = typeof window !== "undefined" && "EyeDropper" in window;
  return (
    <div
      ref={panel}
      className="k-color__panel"
      role="dialog"
      aria-label="انتخاب رنگ دلخواه"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div
        ref={area}
        className="k-color__area"
        style={{ "--_hue": `hsl(${hsv.h} 100% 50%)` } as CSSProperties}
        role="slider"
        tabIndex={0}
        aria-label="اشباع و روشنایی"
        aria-valuetext={`اشباع ${pct(hsv.s)}، روشنایی ${pct(hsv.v)}`}
        aria-valuenow={Math.round(hsv.s * 100)}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          fromPointer(e);
        }}
        onPointerMove={(e) => e.buttons === 1 && fromPointer(e)}
        onKeyDown={onAreaKey}
      >
        <span className="k-color__thumb" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }} />
      </div>
      <div className="k-color__tools">
        {eye && (
          <button
            type="button"
            className="k-btn k-btn--tertiary k-btn--icon k-btn--sm"
            aria-label="برداشتن رنگ از صفحه"
            onClick={async () => {
              try {
                const res = await new (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper().open();
                const h = norm(res.sRGBHex);
                if (h) onChange(h);
              } catch { /* کاربر انصراف داد */ }
            }}
          >
            <Dropper />
          </button>
        )}
        <span className="k-color__current" aria-hidden="true" />
        <input
          type="range"
          className="k-color__hue"
          min={0}
          max={359}
          value={Math.round(hsv.h)}
          aria-label="رنگ‌مایه"
          aria-valuetext={`${toFaDigits(Math.round(hsv.h))} درجه`}
          onChange={(e) => apply({ ...hsv, h: Number(e.target.value) })}
        />
      </div>
      <div className="k-color__codes" dir="ltr">
        {(["R", "G", "B"] as const).map((ch, i) => (
          <label key={ch} className="k-color__code">
            <input
              className="k-color__num"
              inputMode="numeric"
              value={[r, g, b][i]}
              aria-label={{ R: "قرمز", G: "سبز", B: "آبی" }[ch]}
              onChange={(e) => {
                const n = Math.min(255, Math.max(0, Number(e.target.value.replace(/\D/g, "")) || 0));
                const rgb = [r, g, b];
                rgb[i] = n;
                onChange(rgbToHex(rgb[0], rgb[1], rgb[2]));
              }}
            />
            <span aria-hidden="true">{ch}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

const Check = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 10.5 3.2 3L15 7" /></svg>;

/** انتخاب رنگ برند یا برچسب: نمونه‌رنگ‌ها، پنل انتخاب دلخواه و کد hex، با کنتراست متن روی آن */
export function ColorPicker({ label, hint, value, defaultValue = "#0b8077", onChange, swatches = DEFAULT_SWATCHES, showContrast = true, name, id, className }: ColorPickerProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [inner, setInner] = useState(norm(defaultValue) ?? "#000000");
  const current = norm(value ?? "") ?? inner;
  const [text, setText] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
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
          <span className="k-color__anchor">
            <button
              ref={trigger}
              type="button"
              className="k-color__preview"
              aria-label="انتخاب رنگ دلخواه"
              aria-haspopup="dialog"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            />
            {open && <ColorPanel hex={current} onChange={set} onClose={() => { setOpen(false); trigger.current?.focus(); }} />}
          </span>
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
