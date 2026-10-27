import { useId, useRef, useState, type ReactNode } from "react";
import { PLATE_LETTERS, formatPlate, isValidPlate, onlyDigits, plateType, toFaDigits, type Plate } from "@kashi-ui/persian";
import { Field, describedBy } from "./Field.js";

export interface PlateInputProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  value?: Plate;
  defaultValue?: Partial<Plate>;
  onChange?: (plate: Plate, valid: boolean) => void;
  /** با name، چهار فیلد پنهان name_first، name_letter، name_middle و name_region */
  name?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  /** @default "پلاک خودرو معتبر نیست." */
  invalidMessage?: ReactNode;
  labels?: { first?: string; letter?: string; middle?: string; region?: string };
}

const EMPTY: Plate = { first: "", letter: "", middle: "", region: "" };

/**
 * پلاک خودروی ایران با ظاهر واقعی: دو رقم، حرف، سه رقم و کد استان.
 * با پر شدن هر بخش فوکوس خودکار به بخش بعد می‌رود و Backspace در بخش خالی به قبلی برمی‌گردد.
 */
export function PlateInput({
  label, hint, error, value, defaultValue, onChange, name, disabled, id, className,
  invalidMessage = "پلاک خودرو معتبر نیست.", labels = {},
}: PlateInputProps) {
  const autoId = useId();
  const groupId = id ?? autoId;
  // برچسب به اولین بخش وصل است تا کلیک روی آن فوکوس بدهد
  const firstId = `${groupId}-first`;
  const { first = "دو رقم اول پلاک", letter = "حرف پلاک", middle = "سه رقم پلاک", region = "کد استان" } = labels;
  const [inner, setInner] = useState<Plate>({ ...EMPTY, ...defaultValue });
  const plate = value ?? inner;
  const [touched, setTouched] = useState(false);
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLSelectElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const complete = plate.first.length === 2 && plate.letter && plate.middle.length === 3 && plate.region.length === 2;
  const valid = isValidPlate(plate);
  const showInvalid = (touched || complete) && Object.values(plate).some(Boolean) && !valid;

  const set = (patch: Partial<Plate>) => {
    const next = { ...plate, ...patch };
    if (value === undefined) setInner(next);
    onChange?.(next, isValidPlate(next));
  };

  const seg = (key: "first" | "middle" | "region", len: number, idx: number, aria: string, cls = "") => (
    <input
      ref={refs[idx] as React.RefObject<HTMLInputElement>}
      id={idx === 0 ? firstId : undefined}
      className={`k-plate__seg ${cls}`}
      inputMode="numeric"
      autoComplete="off"
      aria-label={aria}
      disabled={disabled}
      placeholder={toFaDigits("0".repeat(len))}
      value={toFaDigits(plate[key])}
      onChange={(e) => {
        const all = onlyDigits(e.target.value);
        const d = all.slice(0, len);
        // تایپ سریع یا چسباندن: رقم‌های اضافه به بخش عددی بعدی می‌روند
        if (key === "middle" && all.length > len) set({ middle: d, region: (plate.region + all.slice(len)).slice(0, 2) });
        else set({ [key]: d });
        if (d.length === len) refs[idx + 1]?.current?.focus();
      }}
      onKeyDown={(e) => {
        if (e.key === "Backspace" && !plate[key]) refs[idx - 1]?.current?.focus();
      }}
    />
  );

  return (
    <Field id={firstId} label={label} hint={hint} error={error ?? (showInvalid ? invalidMessage : undefined)} className={className}>
      <div
        className="k-plate"
        role="group"
        id={groupId}
        aria-describedby={describedBy(firstId, hint, error ?? (showInvalid ? invalidMessage : undefined))}
        aria-label={typeof label === "string" ? label : "پلاک خودرو"}
        data-invalid={showInvalid || error ? "" : undefined}
        data-type={plateType(plate.letter)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setTouched(true);
        }}
      >
        <span className="k-plate__flag" aria-hidden="true"><span className="k-plate__flag-colors" />I.R.<br />IRAN</span>
        {seg("first", 2, 0, first)}
        <select
          ref={refs[1] as React.RefObject<HTMLSelectElement>}
          className="k-plate__letter"
          aria-label={letter}
          disabled={disabled}
          value={plate.letter}
          onChange={(e) => {
            set({ letter: e.target.value });
            if (e.target.value) refs[2].current?.focus();
          }}
        >
          <option value="">–</option>
          {PLATE_LETTERS.map((l) => <option key={l} value={l}>{l === "ه" ? "هـ" : l}</option>)}
        </select>
        {seg("middle", 3, 2, middle, "k-plate__seg--3")}
        <span className="k-plate__region">
          <span className="k-plate__region-label" aria-hidden="true">ایران</span>
          {seg("region", 2, 3, region)}
        </span>
      </div>
      <span className="k-sr-only" aria-live="polite">{valid ? formatPlate(plate) : ""}</span>
      {name && (["first", "letter", "middle", "region"] as const).map((k) => <input key={k} type="hidden" name={`${name}_${k}`} value={plate[k]} />)}
    </Field>
  );
}
