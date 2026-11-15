"use client";

import { useCallback, useId, useMemo, useRef, useState, type FormEvent } from "react";
import {
  isValidCardNumber, isValidIban, isValidLandline, isValidLegalId, isValidMobile, isValidNationalId, isValidPostalCode, toEnDigits,
} from "@kashi-ui/persian";
import type { KashiMessages } from "@kashi-ui/persian";
import { useKashi } from "./KashiProvider.js";

type Values = Record<string, unknown>;
/** پیام خطا: متن آماده یا کلیدی که با زبان KashiProvider ترجمه می‌شود */
type Message = string | ((M: KashiMessages, n: (v: number | string) => string) => string);
/** هر قاعده مقدار را می‌گیرد و اگر درست نبود پیام خطا برمی‌گرداند */
export type FormRule<V extends Values = Values> = (value: unknown, values: V) => Message | null | undefined | false;

const isEmpty = (v: unknown) => v === undefined || v === null || v === "" || v === false || (Array.isArray(v) && v.length === 0);
const str = (v: unknown) => toEnDigits(String(v ?? "")).trim();
/** قاعده‌ای که مقدار خالی را رد نمی‌کند؛ خالی بودن کار required است */
const check = (ok: (v: unknown, values: Values) => boolean, msg: Message): FormRule => (v, values) => (isEmpty(v) || ok(v, values) ? null : msg);
const len = (v: unknown) => [...String(v ?? "")].length;

/**
 * قاعده‌های آماده با پیام فارسی و انگلیسی. پیام دلخواه را به‌عنوان آخرین آرگومان بدهید.
 * همهٔ قاعده‌ها جز required مقدار خالی را رد نمی‌کنند و ارقام فارسی را می‌پذیرند.
 */
export const rules = {
  required: (message?: string): FormRule => Object.assign((v: unknown) => (isEmpty(typeof v === "string" ? v.trim() : v) ? message ?? ((M: KashiMessages) => M.form.required) : null), { isRequired: true }),
  minLength: (n: number, message?: string) => check((v) => len(v) >= n, message ?? ((M, f) => M.form.minLength(f(n)))),
  maxLength: (n: number, message?: string) => check((v) => len(v) <= n, message ?? ((M, f) => M.form.maxLength(f(n)))),
  min: (n: number, message?: string) => check((v) => Number(str(v)) >= n, message ?? ((M, f) => M.form.min(f(n)))),
  max: (n: number, message?: string) => check((v) => Number(str(v)) <= n, message ?? ((M, f) => M.form.max(f(n)))),
  pattern: (re: RegExp, message?: string) => check((v) => re.test(String(v)), message ?? ((M) => M.form.pattern)),
  email: (message?: string) => check((v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(str(v)), message ?? ((M) => M.form.email)),
  nationalId: (message?: string) => check((v) => isValidNationalId(str(v)), message ?? ((M) => M.invalid.nationalId)),
  legalId: (message?: string) => check((v) => isValidLegalId(str(v)), message ?? ((M) => M.invalid.legalId)),
  mobile: (message?: string) => check((v) => isValidMobile(str(v)), message ?? ((M) => M.invalid.mobile)),
  landline: (message?: string) => check((v) => isValidLandline(str(v)), message ?? ((M) => M.invalid.landline)),
  card: (message?: string) => check((v) => isValidCardNumber(str(v)), message ?? ((M) => M.invalid.card)),
  iban: (message?: string) => check((v) => isValidIban(str(v)), message ?? ((M) => M.invalid.iban)),
  postalCode: (message?: string) => check((v) => isValidPostalCode(str(v)), message ?? ((M) => M.invalid.postal)),
  /** برابر بودن با فیلد دیگر، مثل تکرار رمز */
  match: (field: string, message?: string) => check((v, values) => v === values[field], message ?? ((M) => M.form.match)),
  /** قاعدهٔ دلخواه: true یعنی درست */
  custom: <V extends Values = Values>(ok: (value: unknown, values: V) => boolean, message: string): FormRule<V> =>
    check(ok as (v: unknown, values: Values) => boolean, message) as FormRule<V>,
};

export interface UseFormOptions<V extends Values> {
  defaultValues: V;
  /** قاعده‌های هر فیلد به ترتیب؛ اولین خطا نمایش داده می‌شود */
  rules?: { [K in keyof V]?: FormRule<V>[] };
  /**
   * زمان بررسی: «blur» پس از خروج از فیلد (پیش‌فرض)، «change» با هر تغییر، «submit» فقط هنگام ارسال.
   * پس از اولین ارسال، فیلدهای دارای خطا با هر تغییر دوباره بررسی می‌شوند تا خطا همان لحظه برود.
   */
  validateOn?: "blur" | "change" | "submit";
}

/** آنچه روی هر فیلد پخش می‌شود: <Input {...form.field("name")} /> */
export interface FieldBinding {
  id: string;
  name: string;
  error?: string;
  "aria-invalid"?: true;
  required?: boolean;
  ref: (el: HTMLElement | null) => void;
  onBlur: () => void;
  value?: string;
  checked?: boolean;
  /** چک‌باکس و سوییچ: حالت خطا؛ متن خطا در description نمایش داده می‌شود */
  invalid?: boolean;
  description?: string;
  onChange?: (eventOrValue: unknown) => void;
  onValueChange?: (value: unknown) => void;
}

export interface UseFormReturn<V extends Values> {
  values: V;
  errors: Partial<Record<keyof V, string>>;
  touched: Partial<Record<keyof V, boolean>>;
  /**
   * اتصال یک فیلد. type: «value» برای فیلدهای فارسی و هر کامپوننتی که onValueChange دارد (کد ملی، موبایل، شبا…)،
   * «checkbox» برای چک‌باکس و سوییچ، پیش‌فرض برای Input، Textarea و input بومی.
   */
  field: (name: keyof V & string, options?: { type?: "text" | "value" | "checkbox" }) => FieldBinding;
  setValue: <K extends keyof V>(name: K, value: V[K]) => void;
  setError: (name: keyof V, message: string | undefined) => void;
  /** همهٔ فیلدها را بررسی می‌کند؛ true یعنی بدون خطا */
  validate: () => boolean;
  /** onSubmit فرم: بررسی، تمرکز روی اولین فیلد نادرست و در صورت درستی اجرای fn */
  handleSubmit: (fn: (values: V) => void | Promise<void>) => (e?: FormEvent) => Promise<void>;
  reset: (values?: V) => void;
  isSubmitting: boolean;
  isDirty: boolean;
  submitCount: number;
  /** پیام خلاصه برای بالای فرم، مثل «۲ مورد را اصلاح کنید.»؛ بدون خطا undefined */
  summary?: string;
}

/**
 * مدیریت مقدار و اعتبارسنجی فرم با پیام‌های فارسی (و انگلیسی با KashiProvider).
 * بدون وابستگی؛ خطاها مستقیم به ویژگی error کامپوننت‌های کاشی می‌رسند.
 */
export function useForm<V extends Values>({ defaultValues, rules: fieldRules = {}, validateOn = "blur" }: UseFormOptions<V>): UseFormReturn<V> {
  const { messages: M, n } = useKashi();
  const uid = useId();
  const [values, setValues] = useState<V>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof V, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof V, boolean>>>({});
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const initial = useRef(defaultValues);
  const els = useRef<Partial<Record<keyof V, HTMLElement | null>>>({});
  const latest = useRef(values);
  latest.current = values;

  const fmt = useCallback((v: number | string) => (typeof v === "number" ? n(v) : v), [n]);
  const run = useCallback(
    (name: keyof V, all: V): string | undefined => {
      for (const rule of (fieldRules[name] ?? []) as FormRule<V>[]) {
        const m = rule(all[name], all);
        if (m) return typeof m === "function" ? m(M, fmt) : m;
      }
      return undefined;
    },
    [fieldRules, M, fmt],
  );
  const validateOne = (name: keyof V, all: V) => {
    const e = run(name, all);
    setErrors((prev) => (prev[name] === e ? prev : { ...prev, [name]: e }));
    return e;
  };

  const setValue = <K extends keyof V>(name: K, value: V[K]) => {
    const next = { ...latest.current, [name]: value };
    latest.current = next;
    setValues(next);
    if (validateOn === "change" || errors[name] !== undefined || (submitCount > 0 && validateOn !== "submit")) validateOne(name, next);
  };

  const validate = () => {
    const all = latest.current;
    const next: Partial<Record<keyof V, string>> = {};
    for (const k of Object.keys(fieldRules) as (keyof V)[]) {
      const e = run(k, all);
      if (e) next[k] = e;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (fn: (values: V) => void | Promise<void>) => async (e?: FormEvent) => {
    e?.preventDefault();
    setSubmitCount((c) => c + 1);
    setTouched(Object.fromEntries(Object.keys(fieldRules).map((k) => [k, true])) as Partial<Record<keyof V, boolean>>);
    const all = latest.current;
    const bad = (Object.keys(fieldRules) as (keyof V)[]).find((k) => run(k, all));
    if (!validate()) {
      if (bad) els.current[bad]?.focus?.();
      return;
    }
    setSubmitting(true);
    try {
      await fn(all);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name: keyof V & string, { type = "text" }: { type?: "text" | "value" | "checkbox" } = {}): FieldBinding => {
    const error = errors[name];
    const required = ((fieldRules[name] ?? []) as (FormRule<V> & { isRequired?: boolean })[]).some((r) => r.isRequired);
    const read = (x: unknown) => {
      if (x && typeof x === "object" && "target" in x) {
        const t = (x as { target: HTMLInputElement }).target;
        return type === "checkbox" ? t.checked : t.value;
      }
      return x;
    };
    const base: FieldBinding = {
      id: `${uid}-${name}`,
      name,
      error,
      "aria-invalid": error ? true : undefined,
      required: required || undefined,
      ref: (el) => { els.current[name] = el; },
      onBlur: () => {
        setTouched((t) => (t[name] ? t : { ...t, [name]: true }));
        if (validateOn !== "submit") validateOne(name, latest.current);
      },
    };
    if (type === "checkbox") {
      // Checkbox و Switch ویژگی error ندارند: invalid و متن خطا در description
      const { error: err, ...rest } = base;
      return { ...rest, checked: !!values[name], onChange: (x) => setValue(name, read(x) as V[typeof name]), ...(err ? { invalid: true, description: err } : {}) };
    }
    if (type === "value") return { ...base, value: (values[name] ?? "") as string, onValueChange: (x) => setValue(name, x as V[typeof name]) };
    return { ...base, value: (values[name] ?? "") as string, onChange: (x) => setValue(name, read(x) as V[typeof name]) };
  };

  const errorCount = Object.values(errors).filter(Boolean).length;
  const isDirty = useMemo(() => Object.keys(values).some((k) => values[k] !== initial.current[k]), [values]);

  return {
    values, errors, touched, field, setValue,
    setError: (name, message) => setErrors((prev) => ({ ...prev, [name]: message })),
    validate, handleSubmit,
    reset: (v = initial.current) => {
      initial.current = v;
      latest.current = v;
      setValues(v);
      setErrors({});
      setTouched({});
      setSubmitCount(0);
    },
    isSubmitting, isDirty, submitCount,
    summary: errorCount > 0 && submitCount > 0 ? M.form.summary(n(errorCount)) : undefined,
  };
}
