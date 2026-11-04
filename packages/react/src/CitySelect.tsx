"use client";

import { forwardRef, useMemo, useState } from "react";
import { CITIES, getCities } from "@kashi-ui/persian";
import { Combobox, searchText, type ComboboxOption, type ComboboxProps } from "./Combobox.js";
import { useKashi } from "./KashiProvider.js";

export interface CitySelectProps extends Omit<ComboboxProps, "options" | "value" | "defaultValue" | "onChange"> {
  /** فقط شهرهای این استان؛ بدون استان، همهٔ شهرها با نام استانشان */
  province?: string | null;
  /** نام شهر */
  value?: string | null;
  defaultValue?: string | null;
  /** استان هم برمی‌گردد تا بدون انتخاب استان، از روی شهر پر شود؛ برای شهر خارج از فهرست null */
  onChange?: (city: string | null, province: string | null) => void;
  /** وقتی شهر در فهرست نیست، همان متن تایپ‌شده پذیرفته شود (شهرهای تازه‌تأسیس) @default true */
  allowCustom?: boolean;
}

const SEP = "|";
// «علی آباد»، «علی‌آباد» و «علیآباد» یکی‌اند
const loose = (s: string) => searchText(s).replace(/[\s‌]/g, "");
const filter = (o: ComboboxOption, q: string) =>
  o.value.startsWith(`custom${SEP}`) || [o.label, o.description ?? ""].some((t) => loose(t).includes(loose(q)));

/** انتخاب شهر با جستجو؛ با استان فقط شهرهای همان استان، بدون آن همهٔ ۱۲۰۰+ شهر ایران با نام استان */
export const CitySelect = forwardRef<HTMLInputElement, CitySelectProps>(function CitySelect(
  { province, value, defaultValue = null, onChange, allowCustom = true, label, placeholder, onInputChange, ...rest },
  ref,
) {
  const { messages: M } = useKashi();
  label ??= M.city.label;
  const [query, setQuery] = useState("");
  const [inner, setInner] = useState<string | null>(defaultValue);
  const city = value !== undefined ? value : inner;

  const options = useMemo<ComboboxOption[]>(() => {
    const list: ComboboxOption[] = province
      ? getCities(province).map((c) => ({ value: `${province}${SEP}${c}`, label: c }))
      : Object.entries(CITIES).flatMap(([p, cities]) => cities.map((c) => ({ value: `${p}${SEP}${c}`, label: c, description: p })));
    const q = query.trim();
    const known = list.some((o) => o.label === city);
    // شهر انتخاب‌شده‌ای که در فهرست نیست هم باید در فیلد بماند
    if (city && !known) list.unshift({ value: `custom${SEP}${city}`, label: city, description: M.city.outside });
    if (allowCustom && q && q !== city && !list.some((o) => loose(o.label) === loose(q)))
      list.push({ value: `custom${SEP}${q}`, label: q, description: M.city.custom });
    return list;
  }, [province, query, city, allowCustom]);

  const selected = city ? options.find((o) => o.label === city && (!province || o.value.startsWith(`${province}${SEP}`) || o.value.startsWith(`custom${SEP}`)))?.value ?? null : null;

  return (
    <Combobox
      ref={ref}
      label={label}
      placeholder={placeholder ?? (province ? M.city.search : M.city.hint)}
      options={options}
      filter={filter}
      value={selected}
      onInputChange={(q) => {
        setQuery(q);
        onInputChange?.(q);
      }}
      onChange={(v) => {
        const [p, c] = v ? v.split(SEP) : [null, null];
        const next = c ?? null;
        if (value === undefined) setInner(next);
        onChange?.(next, p === "custom" ? null : p);
      }}
      {...rest}
    />
  );
});
