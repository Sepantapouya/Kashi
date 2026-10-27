import { toFaDigits } from "@kashi-ui/persian";
import { cx } from "./cx.js";

export interface PasswordRule {
  label: string;
  test: (password: string) => boolean;
}

export const defaultPasswordRules: PasswordRule[] = [
  { label: `حداقل ${toFaDigits(8)} نویسه`, test: (p) => p.length >= 8 },
  { label: "حروف بزرگ و کوچک انگلیسی", test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: "دست‌کم یک عدد", test: (p) => /\d/.test(p) },
  { label: "دست‌کم یک نماد، مثل ! یا @", test: (p) => /[^A-Za-z0-9\s؀-ۿ]/.test(p) },
];

export interface PasswordStrengthProps {
  password: string;
  rules?: PasswordRule[];
  /** نمایش فهرست شرط‌ها @default true */
  showRules?: boolean;
  /** هشدار وقتی رمز حروف فارسی دارد (صفحه‌کلید فارسی مانده) @default true */
  warnPersian?: boolean;
  /** شناسهٔ این بخش، برای aria-describedby فیلد رمز */
  id?: string;
  className?: string;
  labels?: { title?: string; levels?: [string, string, string, string]; persian?: string };
}

const Check = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 10.5 3.2 3L15 7" /></svg>;
const Dot = () => <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="2.5" fill="currentColor" /></svg>;

/** قدرت رمز عبور با نوار چهارقسمتی و فهرست شرط‌ها؛ زیر فیلد رمز بگذارید و با id به آن وصل کنید */
export function PasswordStrength({ password, rules = defaultPasswordRules, showRules = true, warnPersian = true, id, className, labels = {} }: PasswordStrengthProps) {
  const { title = "قدرت رمز", levels = ["ضعیف", "متوسط", "خوب", "قوی"], persian = "رمز حروف فارسی دارد؛ شاید صفحه‌کلید روی فارسی مانده است." } = labels;
  const met = rules.map((r) => r.test(password));
  const n = met.filter(Boolean).length;
  // امتیاز ۰ تا ۴ به نسبت شرط‌های برآورده‌شده
  const score = password ? Math.max(1, Math.round((n / rules.length) * 4)) : 0;
  const persianTyped = warnPersian && /[؀-ۿ]/.test(password);
  return (
    <div id={id} className={cx("k-strength", className)} data-score={score}>
      <div className="k-strength__bars" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => <span key={i} className="k-strength__bar" />)}
      </div>
      <p className="k-strength__label" aria-live="polite" style={{ margin: 0 }}>
        {score > 0 && <>{title}: <strong>{levels[score - 1]}</strong></>}
      </p>
      {persianTyped && <p className="k-hint k-hint--error" role="alert">{persian}</p>}
      {showRules && (
        <ul className="k-strength__rules">
          {rules.map((r, i) => (
            <li key={r.label} className="k-strength__rule" data-met={met[i] ? "" : undefined}>
              {met[i] ? <Check /> : <Dot />}
              <span>{r.label}<span className="k-sr-only">{met[i] ? "، رعایت شده" : "، رعایت نشده"}</span></span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
