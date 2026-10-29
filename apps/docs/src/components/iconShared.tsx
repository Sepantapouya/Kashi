// ابزارهای مشترک صفحه‌های آیکون: انتخاب سبک (که در ?v= نشانی می‌ماند)، میانبر «/» و ارقام فارسی
import { useEffect, useState, type RefObject } from "react";
import { SegmentedControl } from "@kashi-ui/react";
import { variants, type IconVariant } from "@kashi-ui/icons";
import { toFaDigits } from "@kashi-ui/persian";

export const fa = (n: number) => toFaDigits(String(n).replace(".", "٫"));

export const variantLabels: Record<IconVariant, string> = {
  light: "خطی",
  bold: "توپر",
  bulk: "حجمی",
  "two-tone": "دورنگ",
  broken: "شکسته",
  curved: "منحنی",
};

export const withVariant = (href: string, v: IconVariant) => (v === "light" ? href : `${href}?v=${v}`);

/** سبک انتخاب‌شده از ?v= خوانده و با هر تغییر در نشانی نوشته می‌شود تا با رفتن به صفحهٔ بعد بماند */
export function useVariant(): [IconVariant, (v: IconVariant) => void] {
  const [v, setV] = useState<IconVariant>("light");
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("v") as IconVariant | null;
    if (q && variants.includes(q)) setV(q);
  }, []);
  const set = (next: IconVariant) => {
    setV(next);
    const url = new URL(location.href);
    if (next === "light") url.searchParams.delete("v");
    else url.searchParams.set("v", next);
    history.replaceState(null, "", url);
  };
  return [v, set];
}

/** «/» جستجو را فعال می‌کند، مثل بیشتر مرورگرهای آیکون */
export function useSlash(ref: RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ref]);
}

export function VariantPicker({ value, onChange }: { value: IconVariant; onChange: (v: IconVariant) => void }) {
  return (
    <SegmentedControl
      size="sm"
      aria-label="سبک آیکون"
      options={variants.map((v) => ({ value: v, label: variantLabels[v] }))}
      value={value}
      onChange={(v) => onChange(v as IconVariant)}
    />
  );
}
