import { useEffect, useRef, useState } from "react";
import { Button, type ButtonProps } from "./Button.js";

export interface CopyButtonProps extends Omit<ButtonProps, "onClick" | "children" | "onCopy"> {
  /** متنی که کپی می‌شود */
  value: string;
  /** پس از کپی موفق */
  onCopy?: (value: string) => void;
  /** فقط آیکون (نام دسترس‌پذیر از labels.copy) */
  iconOnly?: boolean;
  /** مدت نمایش «کپی شد» @default 2000 */
  timeout?: number;
  labels?: { copy?: string; copied?: string; failed?: string };
}

const CopyIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="7" y="7" width="10" height="10" rx="2" /><path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 10.5 3.2 3L15 7" /></svg>
);

/** دکمهٔ کپی در کلیپ‌بورد با بازخورد «کپی شد» برای چشم و صفحه‌خوان */
export function CopyButton({ value, onCopy, iconOnly, timeout = 2000, labels = {}, variant = "secondary", size = "sm", ...rest }: CopyButtonProps) {
  const { copy = "کپی", copied = "کپی شد", failed = "کپی نشد" } = labels;
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const run = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
      onCopy?.(value);
    } catch {
      setState("failed");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), timeout);
  };

  const text = state === "copied" ? copied : state === "failed" ? failed : copy;
  return (
    <>
      <Button
        variant={variant}
        size={size}
        iconOnly={iconOnly}
        aria-label={iconOnly ? text : undefined}
        iconStart={iconOnly ? undefined : state === "copied" ? <CheckIcon /> : <CopyIcon />}
        data-copied={state === "copied" ? "" : undefined}
        onClick={run}
        {...rest}
      >
        {iconOnly ? (state === "copied" ? <CheckIcon /> : <CopyIcon />) : text}
      </Button>
      <span className="k-sr-only" aria-live="polite">{state === "idle" ? "" : text}</span>
    </>
  );
}
