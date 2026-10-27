import { forwardRef, type ReactNode } from "react";
import { CardNumberInput, type CardNumberInputProps } from "./CardNumberInput.js";
import { IbanInput, type IbanInputProps } from "./IbanInput.js";
import { KeyboardFixInput, type KeyboardFixInputProps } from "./KeyboardFixInput.js";
import { LandlineInput, type LandlineInputProps } from "./LandlineInput.js";
import { LegalIdInput, type LegalIdInputProps } from "./LegalIdInput.js";
import { MobileInput, type MobileInputProps } from "./MobileInput.js";
import { NationalIdInput, type NationalIdInputProps } from "./NationalIdInput.js";
import { PostalCodeInput, type PostalCodeInputProps } from "./PostalCodeInput.js";
import { PlateInput, type PlateInputProps } from "./PlateInput.js";
import { PriceInput, type PriceInputProps } from "./PriceInput.js";
import { TimeInput, type TimeInputProps } from "./TimeInput.js";

/** نوع‌های پشتیبانی‌شده و ویژگی‌های هر کدام؛ همان ویژگی‌های کامپوننت تخصصی */
export interface PersianInputKinds {
  text: KeyboardFixInputProps;
  "national-id": NationalIdInputProps;
  "legal-id": LegalIdInputProps;
  mobile: MobileInputProps;
  landline: LandlineInputProps;
  card: CardNumberInputProps;
  iban: IbanInputProps;
  price: PriceInputProps;
  postal: PostalCodeInputProps;
  time: TimeInputProps;
  plate: PlateInputProps;
}
export type PersianInputKind = keyof PersianInputKinds;
export type PersianInputProps = { [K in PersianInputKind]: { kind: K } & PersianInputKinds[K] }[PersianInputKind];

/** برچسب پیش‌فرض هر نوع، اگر label یا aria-label داده نشود */
export const PERSIAN_INPUT_LABELS: Record<PersianInputKind, string> = {
  text: "متن",
  "national-id": "کد ملی",
  "legal-id": "شناسهٔ ملی شرکت",
  mobile: "شمارهٔ موبایل",
  landline: "تلفن ثابت",
  card: "شمارهٔ کارت",
  iban: "شمارهٔ شبا",
  price: "مبلغ",
  postal: "کد پستی",
  time: "ساعت",
  plate: "پلاک خودرو",
};

const COMPONENTS = {
  text: KeyboardFixInput,
  "national-id": NationalIdInput,
  "legal-id": LegalIdInput,
  mobile: MobileInput,
  landline: LandlineInput,
  card: CardNumberInput,
  iban: IbanInput,
  price: PriceInput,
  postal: PostalCodeInput,
  time: TimeInput,
  plate: PlateInput,
} as const;

/**
 * یک فیلد برای همهٔ داده‌های فارسی (کد ملی، شبا، کارت، مبلغ، کد پستی، ساعت، پلاک و…): نوع را با kind انتخاب کنید و بقیهٔ ویژگی‌ها همان کامپوننت تخصصی است.
 * `<PersianInput kind="iban" />` همان `<IbanInput />` است. برای حجم کمتر، کامپوننت تخصصی را مستقیم import کنید.
 */
export const PersianInput = forwardRef<HTMLInputElement, PersianInputProps>(function PersianInput({ kind, ...rest }, ref) {
  const Component = COMPONENTS[kind] as unknown as (p: Record<string, unknown> & { ref?: unknown }) => ReactNode;
  const props = rest as Record<string, unknown>;
  const label = props.label ?? (props["aria-label"] ? undefined : PERSIAN_INPUT_LABELS[kind]);
  // PlateInput چند فیلد دارد و ref نمی‌گیرد
  return <Component ref={kind === "plate" ? undefined : ref} {...props} label={label} data-kind={kind} />;
});
