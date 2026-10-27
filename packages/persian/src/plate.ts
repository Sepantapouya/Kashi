import { onlyDigits, toFaDigits } from "./digits.js";

/** حروف مجاز پلاک خودروی شخصی و عمومی ایران */
export const PLATE_LETTERS = ["الف", "ب", "پ", "ت", "ث", "ج", "د", "ز", "س", "ش", "ص", "ط", "ع", "ف", "ق", "ک", "گ", "ل", "م", "ن", "و", "ه", "ی", "ژ"] as const;

export type PlateType = "private" | "taxi" | "public" | "agricultural" | "government" | "police" | "army" | "defense" | "disabled";

// رنگ پلاک از روی حرف مشخص می‌شود (ویکی‌پدیا، Vehicle registration plates of Iran)
const TYPE_BY_LETTER: Record<string, PlateType> = {
  "الف": "government", "پ": "police", "ث": "police", "ت": "taxi", "ع": "public", "ک": "agricultural",
  "ش": "army", "ز": "defense", "ف": "defense", "ژ": "disabled",
};

/** نوع پلاک از روی حرف: «ت» تاکسی (زرد)، «الف» دولتی (قرمز)، «پ» پلیس (سبز)… بقیه شخصی */
export function plateType(letter: string): PlateType {
  return TYPE_BY_LETTER[letter] ?? "private";
}

export interface Plate {
  /** دو رقم سمت چپ */
  first: string;
  letter: string;
  /** سه رقم وسط */
  middle: string;
  /** کد استان (دو رقم کنار «ایران») */
  region: string;
}

export function isValidPlate(p: Partial<Plate>): boolean {
  const two = onlyDigits(p.first ?? ""), three = onlyDigits(p.middle ?? ""), reg = onlyDigits(p.region ?? "");
  return /^[1-9]\d$/.test(two) && /^[1-9]\d{2}$/.test(three) && /^[1-9]\d$/.test(reg) && (PLATE_LETTERS as readonly string[]).includes(p.letter ?? "");
}

/** متن قابل‌خواندن: «۱۲ ب ۳۴۵ ایران ۶۷» */
export function formatPlate(p: Plate, { digits = "fa" }: { digits?: "fa" | "latin" } = {}): string {
  const d = (s: string) => (digits === "fa" ? toFaDigits(onlyDigits(s)) : onlyDigits(s));
  return `${d(p.first)} ${p.letter} ${d(p.middle)} ایران ${d(p.region)}`;
}
