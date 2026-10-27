import { onlyDigits } from "./digits.js";

export interface Time {
  hours: number;
  minutes: number;
}

/** «۹:۵»، «0930» یا «21:45» → { hours, minutes }؛ نامعتبر → null */
export function parseTime(value: string): Time | null {
  const s = value.trim();
  if (!s) return null;
  const parts = s.split(/[:٫.،,\s]/).map(onlyDigits).filter(Boolean);
  let h: number, m: number;
  if (parts.length >= 2) [h, m] = [Number(parts[0]), Number(parts[1])];
  else {
    const d = onlyDigits(s);
    if (d.length <= 2) [h, m] = [Number(d), 0];
    else [h, m] = [Number(d.slice(0, -2)), Number(d.slice(-2))];
  }
  return h >= 0 && h < 24 && m >= 0 && m < 60 ? { hours: h, minutes: m } : null;
}

/** { 9, 5 } → "09:05" (ارقام لاتین؛ برای فارسی toFaDigits) */
export function formatTime({ hours, minutes }: Time): string {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
