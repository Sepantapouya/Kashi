import { createContext, useContext, useId, type DetailsHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx.js";

const AccCtx = createContext<{ name?: string }>({});

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  /** «single»: باز شدن هر بخش بقیه را می‌بندد (با name مشترک روی details) @default "multiple" */
  type?: "single" | "multiple";
  /** بدون حاشیه و پس‌زمینه */
  flush?: boolean;
}

/** آکاردئون روی <details> بومی: بدون JavaScript، با کیبورد و صفحه‌خوان کامل */
export function Accordion({ type = "multiple", flush, className, children, ...rest }: AccordionProps) {
  const id = useId();
  return (
    <AccCtx.Provider value={{ name: type === "single" ? `k-acc-${id}` : undefined }}>
      <div className={cx("k-accordion", flush && "k-accordion--flush", className)} {...rest}>{children}</div>
    </AccCtx.Provider>
  );
}

export interface AccordionItemProps extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title"> {
  title: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function AccordionItem({ title, defaultOpen, className, children, ...rest }: AccordionItemProps) {
  const { name } = useContext(AccCtx);
  return (
    <details className={cx("k-accordion__item", className)} name={name} open={defaultOpen} {...rest}>
      <summary className="k-accordion__trigger">{title}</summary>
      <div className="k-accordion__content">{children}</div>
    </details>
  );
}
