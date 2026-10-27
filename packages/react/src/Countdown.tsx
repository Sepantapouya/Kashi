import { useEffect, useRef, useState } from "react";
import { toFaDigits } from "@kashi-ui/persian";
import { cx } from "./cx.js";

export interface CountdownProps {
  /** زمان پایان */
  to?: Date;
  /** یا مدت به ثانیه از لحظهٔ نمایش (مثلاً ۱۲۰ برای ارسال دوبارهٔ کد) */
  seconds?: number;
  onComplete?: () => void;
  /** «clock» مثل ۰۲:۳۴، «blocks» کادرهای روز/ساعت/دقیقه/ثانیه @default "clock" */
  variant?: "clock" | "blocks";
  /** @default "fa" */
  digits?: "fa" | "latin";
  /** نام برای صفحه‌خوان، مثل «زمان باقی‌مانده تا ارسال دوباره» */
  "aria-label"?: string;
  className?: string;
  labels?: { days?: string; hours?: string; minutes?: string; seconds?: string };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** شمارش معکوس با ارقام فارسی؛ هر ثانیه به‌روز می‌شود و در پایان onComplete را صدا می‌زند */
export function Countdown({ to, seconds, onComplete, variant = "clock", digits = "fa", "aria-label": ariaLabel, className, labels = {} }: CountdownProps) {
  const { days = "روز", hours = "ساعت", minutes = "دقیقه", seconds: secLabel = "ثانیه" } = labels;
  const end = useRef(to?.getTime() ?? Date.now() + (seconds ?? 0) * 1000);
  const [left, setLeft] = useState(() => Math.max(0, Math.ceil((end.current - Date.now()) / 1000)));
  const done = useRef(false);

  useEffect(() => {
    end.current = to?.getTime() ?? Date.now() + (seconds ?? 0) * 1000;
    done.current = false;
    const tick = () => {
      const s = Math.max(0, Math.ceil((end.current - Date.now()) / 1000));
      setLeft(s);
      if (s === 0 && !done.current) {
        done.current = true;
        onComplete?.();
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [to?.getTime(), seconds]);

  const d = Math.floor(left / 86400), h = Math.floor((left % 86400) / 3600), m = Math.floor((left % 3600) / 60), s = left % 60;
  const f = (x: string | number) => (digits === "fa" ? toFaDigits(String(x)) : String(x));
  // متن کامل برای صفحه‌خوان؛ role="timer" به‌طور پیش‌فرض هر ثانیه خوانده نمی‌شود
  const spoken = [d && `${f(d)} ${days}`, h && `${f(h)} ${hours}`, m && `${f(m)} ${minutes}`, `${f(s)} ${secLabel}`].filter(Boolean).join(" و ");

  if (variant === "blocks") {
    const units: [number, string][] = [...(d ? [[d, days] as [number, string]] : []), [h, hours], [m, minutes], [s, secLabel]];
    return (
      <div role="timer" aria-label={ariaLabel ? `${ariaLabel}: ${spoken}` : spoken} className={cx("k-countdown k-countdown--blocks", className)} data-done={left === 0 ? "" : undefined}>
        {units.map(([v, name]) => (
          <span key={name} className="k-countdown__unit" aria-hidden="true">
            <span className="k-countdown__num">{f(pad(v))}</span>
            <span className="k-countdown__name">{name}</span>
          </span>
        ))}
      </div>
    );
  }
  const clock = (d ? `${d}:` : "") + (h || d ? `${pad(h)}:` : "") + `${pad(m)}:${pad(s)}`;
  return (
    <span role="timer" aria-label={ariaLabel ? `${ariaLabel}: ${spoken}` : spoken} className={cx("k-countdown", className)} data-done={left === 0 ? "" : undefined} dir="ltr">
      <span aria-hidden="true">{f(clock)}</span>
    </span>
  );
}
